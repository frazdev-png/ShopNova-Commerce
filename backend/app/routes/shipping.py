import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.shipping_address import ShippingAddress
from app.models.user import User
from app.schemas.shipping import (
    ShippingAddressCreate,
    ShippingAddressResponse,
    ShippingAddressUpdate,
)

router = APIRouter(prefix="/addresses", tags=["shipping"])


@router.get("", response_model=list[ShippingAddressResponse])
async def list_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ShippingAddress)
        .where(ShippingAddress.user_id == current_user.id)
        .order_by(ShippingAddress.is_default.desc(), ShippingAddress.created_at.desc())
    )
    return [ShippingAddressResponse.model_validate(a) for a in result.scalars().all()]


@router.post("", response_model=ShippingAddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(
    body: ShippingAddressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.is_default:
        await db.execute(
            select(ShippingAddress).where(ShippingAddress.user_id == current_user.id)
        )

    addr = ShippingAddress(user_id=current_user.id, **body.model_dump())
    db.add(addr)
    await db.commit()
    await db.refresh(addr)
    return ShippingAddressResponse.model_validate(addr)


@router.put("/{address_id}", response_model=ShippingAddressResponse)
async def update_address(
    address_id: str,
    body: ShippingAddressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    addr = await db.get(ShippingAddress, uuid.UUID(address_id))
    if not addr or addr.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Address not found")

    updates = body.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(addr, key, value)

    await db.commit()
    await db.refresh(addr)
    return ShippingAddressResponse.model_validate(addr)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    addr = await db.get(ShippingAddress, uuid.UUID(address_id))
    if not addr or addr.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Address not found")
    await db.delete(addr)
    await db.commit()
