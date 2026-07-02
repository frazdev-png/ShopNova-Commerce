import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.order import Order
from app.models.user import User, UserRole
from app.schemas.customer import CustomerListResponse, CustomerResponse, CustomerStatusUpdate

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=CustomerListResponse)
async def list_customers(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(
        select(User).where(User.role == UserRole.CUSTOMER).order_by(User.created_at.desc())
    )
    customers = result.scalars().all()

    items = []
    for c in customers:
        order_count = await db.execute(
            select(func.count(Order.id)).where(Order.user_id == c.id)
        )
        total_spent = await db.execute(
            select(func.coalesce(func.sum(Order.total_price), 0)).where(Order.user_id == c.id)
        )

        items.append(CustomerResponse(
            id=c.id,
            name=c.name,
            email=c.email,
            role=c.role.value,
            is_active=True,
            created_at=c.created_at,
            order_count=order_count.scalar() or 0,
            total_spent=round(total_spent.scalar() or 0, 2),
        ))

    return CustomerListResponse(items=items, total=len(items))


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    c = await db.get(User, uuid.UUID(customer_id))
    if not c or c.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=404, detail="Customer not found")

    order_count = await db.execute(
        select(func.count(Order.id)).where(Order.user_id == c.id)
    )
    total_spent = await db.execute(
        select(func.coalesce(func.sum(Order.total_price), 0)).where(Order.user_id == c.id)
    )

    return CustomerResponse(
        id=c.id,
        name=c.name,
        email=c.email,
        role=c.role.value,
        is_active=True,
        created_at=c.created_at,
        order_count=order_count.scalar() or 0,
        total_spent=round(total_spent.scalar() or 0, 2),
    )


@router.put("/{customer_id}/status", response_model=CustomerResponse)
async def update_customer_status(
    customer_id: str,
    body: CustomerStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    c = await db.get(User, uuid.UUID(customer_id))
    if not c or c.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=404, detail="Customer not found")

    c.is_active = body.is_active
    await db.commit()
    await db.refresh(c)

    order_count = await db.execute(
        select(func.count(Order.id)).where(Order.user_id == c.id)
    )
    total_spent = await db.execute(
        select(func.coalesce(func.sum(Order.total_price), 0)).where(Order.user_id == c.id)
    )

    return CustomerResponse(
        id=c.id,
        name=c.name,
        email=c.email,
        role=c.role.value,
        is_active=True,
        created_at=c.created_at,
        order_count=order_count.scalar() or 0,
        total_spent=round(total_spent.scalar() or 0, 2),
    )
