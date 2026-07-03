import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.error_handler import (
    AppException,
    app_exception_handler,
    general_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.core.logging_config import setup_logging
from app.core.rate_limit import RateLimitMiddleware
from app.db.session import engine, Base
from app.models import (  # noqa: F401
    CartItem, Category, ChatSession, Message, Notification,
    Order, OrderItem, Product, ShippingAddress, User, WishlistItem,
)
from app.routes.auth import router as auth_router
from app.routes.cart import router as cart_router
from app.routes.categories import router as categories_router
from app.routes.chat import router as chat_router
from app.routes.customers import router as customers_router
from app.routes.dashboard import router as dashboard_router
from app.routes.health import router as health_router
from app.routes.notifications import router as notifications_router
from app.routes.orders import router as orders_router
from app.routes.products_admin import router as products_admin_router
from app.routes.products_public import router as products_public_router
from app.routes.settings import router as settings_router
from app.routes.shipping import router as shipping_router
from app.routes.upload import router as upload_router
from app.routes.wishlist import router as wishlist_router
from app.routes.ws_chat import router as ws_chat_router

setup_logging()
logger = logging.getLogger(__name__)


def _migrate_sqlite(conn):
    """Add missing columns to existing SQLite tables."""
    import sqlalchemy as sa

    def _add_col(table: str, col: str, col_type: str):
        raw = f"SELECT COUNT(*) AS cnt FROM pragma_table_info('{table}') WHERE name='{col}'"
        result = conn.execute(sa.text(raw)).scalar()
        if result == 0:
            conn.execute(sa.text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
            logger.info("Migration: added %s.%s", table, col)

    _add_col("messages", "is_read", "INTEGER DEFAULT 0 NOT NULL")
    _add_col("messages", "read_at", "TIMESTAMP")
    _add_col("notifications", "chat_id", "VARCHAR(36)")


def _migrate_pg(conn):
    """Add missing columns to existing PostgreSQL tables."""
    import sqlalchemy as sa

    def _add_col(table: str, col: str, col_type: str):
        raw = sa.text(
            "SELECT COUNT(*) FROM information_schema.columns "
            "WHERE table_name = :t AND column_name = :c"
        )
        result = conn.execute(raw, {"t": table, "c": col}).scalar()
        if result == 0:
            conn.execute(sa.text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
            logger.info("Migration: added %s.%s", table, col)

    _add_col("messages", "is_read", "BOOLEAN DEFAULT FALSE NOT NULL")
    _add_col("messages", "read_at", "TIMESTAMP WITH TIME ZONE")
    _add_col("notifications", "chat_id", "VARCHAR(36)")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        migrate_fn = _migrate_pg if settings.is_postgres else _migrate_sqlite
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await conn.run_sync(migrate_fn)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.warning("Database unavailable — skipping migrations: %s", e)

    yield

    await engine.dispose()


print("=" * 50, flush=True)
print(f"  {settings.app_name} v{settings.app_version}", flush=True)
db_type = "PostgreSQL" if settings.is_postgres else "SQLite"
print(f"  Database: {db_type}  |  Debug: {settings.app_debug}", flush=True)
print("=" * 50, flush=True)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.app_debug,
    lifespan=lifespan,
)

cors_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Mount uploads directory for serving uploaded images
uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(categories_router, prefix="/api")
app.include_router(customers_router, prefix="/api/admin")
app.include_router(dashboard_router, prefix="/api/admin")
app.include_router(notifications_router, prefix="/api/admin")
app.include_router(orders_router, prefix="/api")
app.include_router(products_admin_router, prefix="/api/admin")
app.include_router(products_public_router, prefix="/api")
app.include_router(settings_router, prefix="/api/admin")
app.include_router(shipping_router, prefix="/api")
app.include_router(upload_router, prefix="/api/admin")
app.include_router(wishlist_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(ws_chat_router)
