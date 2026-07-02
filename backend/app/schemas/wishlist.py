import uuid
from datetime import datetime

from pydantic import BaseModel


class WishlistAddRequest(BaseModel):
    product_id: str


class WishlistItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    items: list[WishlistItemResponse]
    count: int
