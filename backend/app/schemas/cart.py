import uuid
from datetime import datetime

from pydantic import BaseModel


class CartAddRequest(BaseModel):
    product_id: str
    quantity: int = 1


class CartUpdateRequest(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    title: str | None = None
    price: float | None = None
    image_url: str | None = None
    stock: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total: float
