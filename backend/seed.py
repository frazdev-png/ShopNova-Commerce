"""Seed the database with a default admin account and categories.

Usage:
    python seed.py
"""
import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.security import hash_password
from app.models.category import Category
from app.models.user import User, UserRole

ADMIN_EMAIL = "admin@shopnova.com"
ADMIN_PASSWORD = "Admin@12345"
ADMIN_NAME = "Admin"

DEFAULT_CATEGORIES = [
    {"name": "Electronics", "description": "Gadgets, devices, and tech accessories"},
    {"name": "Fashion", "description": "Clothing, footwear, and accessories"},
    {"name": "Beauty", "description": "Skincare, makeup, and personal care"},
    {"name": "Home & Kitchen", "description": "Home decor, furniture, and kitchenware"},
    {"name": "Groceries", "description": "Food, beverages, and daily essentials"},
    {"name": "Sports", "description": "Sports equipment, gear, and activewear"},
    {"name": "Accessories", "description": "Jewelry, bags, and lifestyle accessories"},
    {"name": "Books", "description": "Books, eBooks, and educational materials"},
]


async def seed():
    db_url = settings.async_database_url
    print(f"Using database: {db_url}")

    engine = create_async_engine(db_url, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(User.metadata.create_all)
        await conn.run_sync(Category.metadata.create_all)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == ADMIN_EMAIL))
        existing = result.scalar_one_or_none()

        if existing:
            print(f"Admin user already exists: {ADMIN_EMAIL}")
        else:
            admin = User(
                name=ADMIN_NAME,
                email=ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
                role=UserRole.ADMIN,
            )
            session.add(admin)
            await session.commit()
            print(f"Admin user created: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")

        for cat_data in DEFAULT_CATEGORIES:
            existing_cat = await session.execute(
                select(Category).where(Category.name == cat_data["name"])
            )
            if not existing_cat.scalar_one_or_none():
                session.add(Category(**cat_data))
                await session.commit()
                print(f"Category created: {cat_data['name']}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
