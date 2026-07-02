from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total_products = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    active_products = (await db.execute(select(func.count(Product.id)).where(Product.is_active == True))).scalar() or 0
    total_customers = (await db.execute(select(func.count(User.id)).where(User.role == UserRole.CUSTOMER))).scalar() or 0
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    total_revenue = (await db.execute(select(func.coalesce(func.sum(Order.total_price), 0)).where(
        Order.status.in_([OrderStatus.DELIVERED])
    ))).scalar() or 0
    pending_orders = (await db.execute(select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING))).scalar() or 0

    return DashboardStats(
        total_products=total_products,
        active_products=active_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=round(total_revenue, 2),
        pending_orders=pending_orders,
    )
