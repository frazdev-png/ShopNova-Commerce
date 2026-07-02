import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.product import Product
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.schemas.wishlist import WishlistAddRequest, WishlistItemResponse, WishlistResponse

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=WishlistResponse)
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WishlistItem)
        .where(WishlistItem.user_id == current_user.id)
        .order_by(WishlistItem.created_at.desc())
    )
    items = result.scalars().all()
    return WishlistResponse(items=[WishlistItemResponse.model_validate(i) for i in items], count=len(items))


@router.get("/check/{product_id}")
async def check_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == uuid.UUID(product_id),
        )
    )
    return {"in_wishlist": result.scalar_one_or_none() is not None}


@router.post("/toggle", response_model=WishlistItemResponse | None)
async def toggle_wishlist(
    body: WishlistAddRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(Product, uuid.UUID(body.product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = await db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == uuid.UUID(body.product_id),
        )
    )
    item = existing.scalar_one_or_none()
    if item:
        await db.delete(item)
        await db.commit()
        return None
    else:
        new_item = WishlistItem(user_id=current_user.id, product_id=uuid.UUID(body.product_id))
        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        return WishlistItemResponse.model_validate(new_item)


@router.post("/add", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    body: WishlistAddRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(Product, uuid.UUID(body.product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = await db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == uuid.UUID(body.product_id),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Product already in wishlist")

    item = WishlistItem(user_id=current_user.id, product_id=uuid.UUID(body.product_id))
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return WishlistItemResponse.model_validate(item)


@router.delete("/remove/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == uuid.UUID(product_id),
        )
    )
    await db.commit()
