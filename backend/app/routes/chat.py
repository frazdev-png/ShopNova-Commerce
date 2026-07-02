import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db
from app.models.chat import ChatSession, Message
from app.models.notification import Notification
from app.models.user import User
from app.schemas.chat import ChatSessionResponse, MessageListResponse, MessageResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/start", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_chat(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(ChatSession).where(
            ChatSession.user_id == current_user.id,
        ).order_by(ChatSession.created_at.asc())
    )
    sessions = existing.scalars().all()

    if sessions:
        # Keep the oldest session, remove any duplicates created by the old bug
        keep = sessions[0]
        for dup in sessions[1:]:
            await db.delete(dup)
        if len(sessions) > 1:
            await db.commit()

        return ChatSessionResponse(
            id=keep.id,
            user_id=keep.user_id,
            admin_id=keep.admin_id,
            created_at=keep.created_at,
        )

    session = ChatSession(user_id=current_user.id)
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return ChatSessionResponse(
        id=session.id,
        user_id=session.user_id,
        admin_id=session.admin_id,
        created_at=session.created_at,
    )


@router.get("/my", response_model=list[ChatSessionResponse])
async def my_chats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
    )
    sessions = result.scalars().all()

    response = []
    for session in sessions:
        last_msg = await db.execute(
            select(Message)
            .where(Message.chat_id == session.id)
            .order_by(Message.timestamp.desc())
            .limit(1)
        )
        msg = last_msg.scalar_one_or_none()

        unread_count_result = await db.execute(
            select(func.count(Message.id)).where(
                Message.chat_id == session.id,
                Message.sender_role == "admin",
                Message.is_read == False,
            )
        )
        unread_count = unread_count_result.scalar() or 0

        response.append(
            ChatSessionResponse(
                id=session.id,
                user_id=session.user_id,
                admin_id=session.admin_id,
                created_at=session.created_at,
                last_message=msg.message if msg else None,
                last_timestamp=msg.timestamp if msg else None,
                unread_count=unread_count,
            )
        )
    return response


@router.get("/all", response_model=list[ChatSessionResponse])
async def all_chats(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).order_by(ChatSession.created_at.desc())
    )
    sessions = result.scalars().all()

    response = []
    for session in sessions:
        user_result = await db.execute(select(User).where(User.id == session.user_id))
        customer = user_result.scalar_one_or_none()

        last_msg = await db.execute(
            select(Message)
            .where(Message.chat_id == session.id)
            .order_by(Message.timestamp.desc())
            .limit(1)
        )
        msg = last_msg.scalar_one_or_none()

        unread_count_result = await db.execute(
            select(func.count(Message.id)).where(
                Message.chat_id == session.id,
                Message.sender_role.in_(["customer", "bot"]),
                Message.is_read == False,
            )
        )
        unread_count = unread_count_result.scalar() or 0

        response.append(
            ChatSessionResponse(
                id=session.id,
                user_id=session.user_id,
                admin_id=session.admin_id,
                created_at=session.created_at,
                last_message=msg.message if msg else None,
                last_timestamp=msg.timestamp if msg else None,
                customer_name=customer.name if customer else "Unknown",
                unread_count=unread_count,
            )
        )
    return response


@router.patch("/{chat_id}/mark-read", status_code=status.HTTP_200_OK)
async def mark_chat_read(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    chat_uuid = uuid.UUID(chat_id)
    session = await db.get(ChatSession, chat_uuid)
    if not session:
        raise HTTPException(status_code=404, detail="Chat not found")
    if session.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    is_customer = current_user.role.value == "customer"
    unread_role = "admin" if is_customer else "customer"

    result = await db.execute(
        select(Message.id).where(
            Message.chat_id == chat_uuid,
            Message.is_read == False,
            Message.sender_role == unread_role,
        )
    )
    unread_ids = [row[0] for row in result.all()]
    if not unread_ids:
        return {"ok": True, "marked": 0}

    now = datetime.now(timezone.utc)
    await db.execute(
        update(Message)
        .where(Message.id.in_(unread_ids))
        .values(is_read=True, read_at=now)
    )

    notif_type = "new_chat_message" if current_user.role.value == "admin" else None
    if notif_type:
        await db.execute(
            update(Notification)
            .where(
                Notification.chat_id == chat_uuid,
                Notification.notification_type == notif_type,
                Notification.is_read == False,
            )
            .values(is_read=True)
        )

    await db.commit()
    return {"ok": True, "marked": len(unread_ids)}


@router.get("/{chat_id}/messages", response_model=MessageListResponse)
async def get_messages(
    chat_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(ChatSession, uuid.UUID(chat_id))
    if not session:
        raise HTTPException(status_code=404, detail="Chat not found")
    if session.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    count_result = await db.execute(
        select(func.count(Message.id)).where(Message.chat_id == uuid.UUID(chat_id))
    )
    total = count_result.scalar() or 0

    result = await db.execute(
        select(Message)
        .where(Message.chat_id == uuid.UUID(chat_id))
        .order_by(Message.timestamp.asc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    messages = result.scalars().all()

    return MessageListResponse(
        items=list(messages),
        total=total,
        page=page,
        per_page=per_page,
    )
