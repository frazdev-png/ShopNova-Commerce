import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import (
    CartAddRequest,
    CartItemResponse,
    CartResponse,
    CartUpdateRequest,
)

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .order_by(CartItem.created_at)
    )
    items = result.scalars().all()

    enriched: list[CartItemResponse] = []
    total = 0.0

    for item in items:
        product = await db.get(Product, item.product_id)
        price = product.price if product else 0
        total += price * item.quantity
        enriched.append(
            CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                title=product.title if product else "Deleted",
                price=price,
                image_url=product.image_url if product else None,
                stock=product.stock if product else 0,
                created_at=item.created_at,
            )
        )

    return CartResponse(items=enriched, total=round(total, 2))


@router.post("/add", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    body: CartAddRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(Product, uuid.UUID(body.product_id))
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < 1:
        raise HTTPException(status_code=400, detail="Product out of stock")

    existing = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == uuid.UUID(body.product_id),
        )
    )
    cart_item = existing.scalar_one_or_none()

    if cart_item:
        cart_item.quantity += body.quantity
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=uuid.UUID(body.product_id),
            quantity=body.quantity,
        )
        db.add(cart_item)

    await db.commit()
    await db.refresh(cart_item)

    return CartItemResponse(
        id=cart_item.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
        title=product.title,
        price=product.price,
        image_url=product.image_url,
        stock=product.stock,
        created_at=cart_item.created_at,
    )


@router.put("/update/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: str,
    body: CartUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == uuid.UUID(item_id),
            CartItem.user_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if body.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    product = await db.get(Product, item.product_id)
    if product and body.quantity > product.stock:
        raise HTTPException(status_code=400, detail="Not enough stock")

    item.quantity = body.quantity
    await db.commit()
    await db.refresh(item)

    return CartItemResponse(
        id=item.id,
        product_id=item.product_id,
        quantity=item.quantity,
        title=product.title if product else "Deleted",
        price=product.price if product else 0,
        image_url=product.image_url if product else None,
        stock=product.stock if product else 0,
        created_at=item.created_at,
    )


@router.delete("/remove/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == uuid.UUID(item_id),
            CartItem.user_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.delete(item)
    await db.commit()
