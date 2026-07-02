import uuid
import logging

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.chat_manager import manager, get_chatbot_reply
from app.core.notification_manager import notification_manager
from app.core.security import decode_access_token
from app.db.session import get_db, async_session
from app.models.chat import ChatSession, Message
from app.models.notification import Notification
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()


async def get_user_from_token(token: str) -> User | None:
    payload = decode_access_token(token)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
    async with async_session() as db:
        result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        return result.scalar_one_or_none()


@router.websocket("/ws/chat/{chat_id}")
async def chat_websocket(websocket: WebSocket, chat_id: str):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user = await get_user_from_token(token)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    chat_uuid = uuid.UUID(chat_id)
    async with async_session() as db:
        session = await db.get(ChatSession, chat_uuid)
        if not session:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        if session.user_id != user.id and user.role.value != "admin":
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        if user.role.value == "admin" and session.admin_id is None:
            session.admin_id = user.id
            await db.commit()

    await manager.connect(chat_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            msg_data = {"message": data}
            if isinstance(data, str):
                try:
                    import json
                    parsed = json.loads(data)
                    if isinstance(parsed, dict) and "message" in parsed:
                        msg_data = parsed
                except json.JSONDecodeError:
                    msg_data = {"message": data}

            message_text = msg_data.get("message", "").strip()
            if not message_text:
                continue

            async with async_session() as db:
                msg = Message(
                    chat_id=chat_uuid,
                    sender_id=user.id,
                    sender_role=user.role.value,
                    message=message_text,
                )
                db.add(msg)
                await db.commit()
                await db.refresh(msg)

                broadcast_msg = {
                    "type": "message",
                    "id": str(msg.id),
                    "chat_id": chat_id,
                    "sender_id": str(msg.sender_id),
                    "sender_role": msg.sender_role,
                    "message": msg.message,
                    "is_read": msg.is_read,
                    "timestamp": msg.timestamp.isoformat(),
                }
                await manager.broadcast(chat_id, broadcast_msg)

                # Notify admins via notification bell when customer sends a message
                if user.role.value == "customer":
                    notif = Notification(
                        user_id=None,
                        title="New Chat Message",
                        message=f"{user.name}: {message_text[:100]}",
                        notification_type="new_chat_message",
                        chat_id=chat_uuid,
                    )
                    db.add(notif)
                    await db.commit()
                    await notification_manager.send_chat_event(
                        chat_id=chat_id,
                        customer_name=user.name,
                        message=message_text,
                    )

                await manager.broadcast(chat_id, {
                    "type": "typing",
                    "sender_role": user.role.value,
                    "sender_id": str(user.id),
                }, exclude=websocket)

                if user.role.value == "customer":
                    has_admin = False
                    for ws in manager.active.get(chat_id, set()):
                        if ws is not websocket:
                            has_admin = True
                            break

                    if not has_admin:
                        reply = get_chatbot_reply(message_text)
                        bot_msg = Message(
                            chat_id=chat_uuid,
                            sender_id=user.id,
                            sender_role="bot",
                            message=reply,
                        )
                        db.add(bot_msg)
                        await db.commit()
                        await db.refresh(bot_msg)

                        bot_broadcast = {
                            "type": "message",
                            "id": str(bot_msg.id),
                            "chat_id": chat_id,
                            "sender_id": str(bot_msg.sender_id),
                            "sender_role": "bot",
                            "message": bot_msg.message,
                            "is_read": bot_msg.is_read,
                            "timestamp": bot_msg.timestamp.isoformat(),
                        }
                        await manager.broadcast(chat_id, bot_broadcast)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error("WebSocket error for chat %s: %s", chat_id, e)
    finally:
        manager.disconnect(chat_id, websocket)
