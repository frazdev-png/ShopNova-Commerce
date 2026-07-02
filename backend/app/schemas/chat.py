import uuid
from datetime import datetime

from pydantic import BaseModel


class ChatSessionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    admin_id: uuid.UUID | None = None
    created_at: datetime
    last_message: str | None = None
    last_timestamp: datetime | None = None
    customer_name: str | None = None
    unread_count: int = 0

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: uuid.UUID
    chat_id: uuid.UUID
    sender_id: uuid.UUID
    sender_role: str
    message: str
    is_read: bool = False
    read_at: datetime | None = None
    timestamp: datetime

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    items: list[MessageResponse]
    total: int
    page: int
    per_page: int


class MessageSend(BaseModel):
    message: str
