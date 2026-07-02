from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.settings import AdminPasswordChange, AdminProfileUpdate, WebsiteSettings

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
):
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    body: AdminProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updates = body.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(current_user, key, value)
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.put("/password")
async def change_password(
    body: AdminPasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password_hash = hash_password(body.new_password)
    await db.commit()
    return {"message": "Password updated successfully"}


@router.get("/website", response_model=WebsiteSettings)
async def get_website_settings(
    _admin: User = Depends(require_admin),
):
    return WebsiteSettings()


@router.put("/website", response_model=WebsiteSettings)
async def update_website_settings(
    body: WebsiteSettings,
    _admin: User = Depends(require_admin),
):
    return body
