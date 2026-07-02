import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class OrderItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID | None = None
    product_title: str
    quantity: int
    price_snapshot: float

    class Config:
        from_attributes = True


class CreateOrderRequest(BaseModel):
    shipping_address_id: str
    payment_method: str
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    subtotal: float
    shipping_fee: float
    tax: float
    total_price: float
    payment_method: str | None
    notes: str | None
    status: str
    created_at: datetime
    items: list[OrderItemResponse]


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    per_page: int


class StatusUpdateRequest(BaseModel):
    status: str
