import logging
from uuid import UUID

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.core.notification_manager import notification_manager
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationListResponse, NotificationResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total_result = await db.execute(select(func.count(Notification.id)))
    total = total_result.scalar() or 0

    unread_result = await db.execute(
        select(func.count(Notification.id)).where(Notification.is_read == False)
    )
    unread_count = unread_result.scalar() or 0

    result = await db.execute(
        select(Notification)
        .order_by(Notification.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    items = result.scalars().all()

    return NotificationListResponse(
        items=[NotificationResponse.model_validate(n) for n in items],
        total=total,
        unread_count=unread_count,
    )


@router.put("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_read(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification).values(is_read=True)
    )
    await db.commit()
    return {"ok": True}


@router.put("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_read(
    notification_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    from uuid import UUID
    n = await db.get(Notification, UUID(notification_id))
    if n:
        n.is_read = True
        await db.commit()
    return {"ok": True}


@router.websocket("/ws")
async def notification_ws(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        logger.warning("Admin WS rejected: no token")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    payload = decode_access_token(token)
    if payload is None:
        logger.warning("Admin WS rejected: invalid token")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = payload.get("sub")
    role = payload.get("role")
    if not user_id or role != "admin":
        logger.warning("Admin WS rejected: not admin (role=%s)", role)
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    logger.info("Admin WS connected: user_id=%s", user_id)
    await notification_manager.connect_admin(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info("Admin WS disconnected: user_id=%s", user_id)
        notification_manager.disconnect_admin(websocket)
    except Exception as e:
        logger.error("Admin WS error (user_id=%s): %s", user_id, e)
        notification_manager.disconnect_admin(websocket)
