import re
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def validate_password(password: str) -> tuple[bool, str]:
    if len(password) < settings.min_password_length:
        return False, f"Password must be at least {settings.min_password_length} characters long"
    if settings.min_password_uppercase > 0:
        if sum(1 for c in password if c.isupper()) < settings.min_password_uppercase:
            return False, f"Password must contain at least {settings.min_password_uppercase} uppercase letter(s)"
    if settings.min_password_lowercase > 0:
        if sum(1 for c in password if c.islower()) < settings.min_password_lowercase:
            return False, f"Password must contain at least {settings.min_password_lowercase} lowercase letter(s)"
    if settings.min_password_digits > 0:
        if sum(1 for c in password if c.isdigit()) < settings.min_password_digits:
            return False, f"Password must contain at least {settings.min_password_digits} digit(s)"
    if settings.min_password_special > 0:
        if len(re.findall(r'[!@#$%^&*(),.?":{}|<>_\-]', password)) < settings.min_password_special:
            return False, f"Password must contain at least {settings.min_password_special} special character(s)"
    return True, ""


def create_access_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.refresh_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("type") != "access":
            return None
        return payload
    except jwt.PyJWTError:
        return None


def decode_refresh_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("type") != "refresh":
            return None
        return payload
    except jwt.PyJWTError:
        return None
