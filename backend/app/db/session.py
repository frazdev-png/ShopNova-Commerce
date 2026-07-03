import logging

from sqlalchemy import Engine, event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

logger = logging.getLogger(__name__)

# IMPORTANT: async_database_url MUST be evaluated FIRST because it triggers
# _to_asyncpg_url() which populates the _asyncpg_connect_args global.
# If we build connect_args first, SSL settings are missing.
_db_url = settings.async_database_url

_engine_options: dict = {
    "echo": settings.app_debug,
    "pool_pre_ping": True,
    "pool_size": 5,
    "max_overflow": 10,
}

if settings.is_postgres:
    _engine_options["connect_args"] = {
        **settings.asyncpg_connect_args,
        "server_settings": {"application_name": "shopnova-api"},
    }

engine = create_async_engine(_db_url, **_engine_options)


@event.listens_for(engine.sync_engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable WAL mode + foreign keys for SQLite only."""
    if not settings.is_postgres:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
