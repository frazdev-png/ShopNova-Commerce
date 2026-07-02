import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    stock: int = 0
    category: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Price must be positive")
        return v

    @field_validator("stock")
    @classmethod
    def stock_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Stock cannot be negative")
        return v


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    stock: int
    category: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    per_page: int
