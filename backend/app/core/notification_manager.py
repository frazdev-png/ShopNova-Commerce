import json
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class NotificationManager:
    def __init__(self) -> None:
        self.admin_connections: set[WebSocket] = set()

    async def connect_admin(self, ws: WebSocket) -> None:
        await ws.accept()
        self.admin_connections.add(ws)
        logger.info("Admin WS connected. Total: %d", len(self.admin_connections))

    def disconnect_admin(self, ws: WebSocket) -> None:
        self.admin_connections.discard(ws)
        logger.info("Admin WS disconnected. Total: %d", len(self.admin_connections))

    async def broadcast_to_admins(self, event_type: str, data: dict[str, Any]) -> None:
        payload = json.dumps({"type": event_type, "data": data})
        dead: list[WebSocket] = []
        for ws in self.admin_connections:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect_admin(ws)

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    async def send_order_event(self, order_id: str, status: str, customer_name: str, total: float) -> None:
        await self.broadcast_to_admins("new_order", {
            "order_id": order_id,
            "status": status,
            "customer_name": customer_name,
            "total": total,
            "timestamp": self._now(),
        })

    async def send_customer_event(self, customer_name: str, customer_email: str) -> None:
        await self.broadcast_to_admins("new_customer", {
            "name": customer_name,
            "email": customer_email,
            "timestamp": self._now(),
        })

    async def send_chat_event(self, chat_id: str, customer_name: str, message: str) -> None:
        await self.broadcast_to_admins("new_chat_message", {
            "chat_id": chat_id,
            "customer_name": customer_name,
            "message": message,
            "timestamp": self._now(),
        })

    async def send_notification(self, notification: dict[str, Any]) -> None:
        await self.broadcast_to_admins("notification", notification)


notification_manager = NotificationManager()
