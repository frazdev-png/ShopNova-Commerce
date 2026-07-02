import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class ShippingAddressCreate(BaseModel):
    full_name: str
    phone: str
    email: str
    country: str
    city: str
    address_line: str
    postal_code: str
    is_default: bool = False

    @field_validator("full_name", "phone", "email", "country", "city", "address_line", "postal_code")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class ShippingAddressUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address_line: Optional[str] = None
    postal_code: Optional[str] = None
    is_default: Optional[bool] = None


class ShippingAddressResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str
    phone: str
    email: str
    country: str
    city: str
    address_line: str
    postal_code: str
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True
