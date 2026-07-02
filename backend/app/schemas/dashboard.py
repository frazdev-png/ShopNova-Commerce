from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: float
    active_products: int
    pending_orders: int
