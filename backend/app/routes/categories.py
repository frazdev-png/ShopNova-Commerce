import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Category).order_by(Category.name)
    )
    return [CategoryResponse.model_validate(c) for c in result.scalars().all()]


@router.get("/active", response_model=list[CategoryResponse])
async def list_active_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Category).where(Category.is_active == True).order_by(Category.name)
    )
    return [CategoryResponse.model_validate(c) for c in result.scalars().all()]


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    existing = await db.execute(select(Category).where(Category.name == body.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Category already exists")

    cat = Category(name=body.name, description=body.description)
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return CategoryResponse.model_validate(cat)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    body: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    cat = await db.get(Category, uuid.UUID(category_id))
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    updates = body.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(cat, key, value)

    await db.commit()
    await db.refresh(cat)
    return CategoryResponse.model_validate(cat)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    cat = await db.get(Category, uuid.UUID(category_id))
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    await db.delete(cat)
    await db.commit()
