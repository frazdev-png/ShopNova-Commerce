import json
import uuid
import logging

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active: dict[str, set[WebSocket]] = {}

    async def connect(self, chat_id: str, websocket: WebSocket):
        await websocket.accept()
        if chat_id not in self.active:
            self.active[chat_id] = set()
        self.active[chat_id].add(websocket)
        logger.info("WebSocket connected to chat %s (%d active)", chat_id, len(self.active[chat_id]))

    def disconnect(self, chat_id: str, websocket: WebSocket):
        if chat_id in self.active:
            self.active[chat_id].discard(websocket)
            if not self.active[chat_id]:
                del self.active[chat_id]
        logger.info("WebSocket disconnected from chat %s", chat_id)

    async def broadcast(self, chat_id: str, message: dict, exclude: WebSocket | None = None):
        if chat_id not in self.active:
            return
        dead = set()
        for ws in self.active[chat_id]:
            if ws is exclude:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.disconnect(chat_id, ws)


manager = ConnectionManager()


CHATBOT_RULES = {
    "order": "📦 **Order Help**\n\nTo check your order status:\n1. Go to Dashboard → Your Orders\n2. Find your order and check the status\n3. Status can be: Pending, Confirmed, Shipped, or Cancelled\n\nIf you need further help with an order, an admin will reply shortly.",
    "delivery": "🚚 **Delivery Information**\n\nStandard delivery takes 5-7 business days.\nExpress delivery takes 2-3 business days.\n\nYou'll receive a tracking number once your order is shipped.",
    "return": "🔄 **Returns Policy**\n\nYou can return items within 30 days of delivery.\nItems must be unused and in original packaging.\nRefunds are processed within 5-7 business days.",
    "payment": "💳 **Payment Information**\n\nWe accept Visa, Mastercard, and PayPal.\nAll payments are processed securely.\nYour payment is only charged when the order is confirmed.",
    "refund": "💰 **Refund Policy**\n\nRefunds are processed within 5-7 business days.\nThe amount is credited back to your original payment method.\nContact support if you haven't received your refund.",
    "shipping": "🚚 **Shipping Information**\n\nFree shipping on orders over $50.\nStandard: 5-7 business days\nExpress: 2-3 business days\nInternational: 10-14 business days",
}


def get_chatbot_reply(message: str) -> str | None:
    lower = message.lower()
    for keyword, reply in CHATBOT_RULES.items():
        if keyword in lower:
            return reply
    return "👋 Thank you for your message! An admin will reply to you shortly. In the meantime, feel free to ask about orders, delivery, returns, or payments."
