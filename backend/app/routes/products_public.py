import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.pagination import PaginationParams
from app.db.session import get_db
from app.models.product import Product
from app.schemas.product import ProductListResponse, ProductResponse

router = APIRouter(prefix="/products", tags=["public-products"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    category: str | None = Query(None),
    search: str | None = Query(None),
    sort_by: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Product).where(Product.is_active == True)
    count_stmt = select(func.count(Product.id)).where(Product.is_active == True)

    if category:
        stmt = stmt.where(Product.category == category)
        count_stmt = count_stmt.where(Product.category == category)

    if search:
        q = f"%{search}%"
        stmt = stmt.where(
            Product.title.ilike(q) | Product.description.ilike(q)
        )
        count_stmt = count_stmt.where(
            Product.title.ilike(q) | Product.description.ilike(q)
        )

    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    if sort_by == "price_asc":
        stmt = stmt.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        stmt = stmt.order_by(Product.price.desc())
    elif sort_by == "name_asc":
        stmt = stmt.order_by(Product.title.asc())
    elif sort_by == "name_desc":
        stmt = stmt.order_by(Product.title.desc())
    else:
        stmt = stmt.order_by(Product.created_at.desc())

    stmt = stmt.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(stmt)
    products = result.scalars().all()

    return ProductListResponse(
        items=[ProductResponse.model_validate(p) for p in products],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).where(Product.id == uuid.UUID(product_id), Product.is_active == True)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(product)
