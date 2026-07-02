import uuid
from datetime import datetime

from pydantic import BaseModel


class CustomerResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    order_count: int = 0
    total_spent: float = 0.0

    class Config:
        from_attributes = True


class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int


class CustomerStatusUpdate(BaseModel):
    is_active: bool
