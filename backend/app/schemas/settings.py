from typing import Optional

from pydantic import BaseModel, EmailStr


class AdminProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class AdminPasswordChange(BaseModel):
    current_password: str
    new_password: str


class WebsiteSettings(BaseModel):
    site_name: str = "SHOPNOVA"
    site_tagline: str = "Smart Shopping, Better Living"
    currency: str = "USD"
    free_shipping_threshold: float = 50.0
