from urllib.parse import urlencode, urlparse, urlunparse

from pydantic_settings import BaseSettings, SettingsConfigDict


_asyncpg_connect_args: dict | None = None


def _to_asyncpg_url(url: str) -> str:
    """Convert a postgresql:// URL to postgresql+asyncpg://,
    stripping libpq-only query params that asyncpg doesn't support
    and storing them in _asyncpg_connect_args."""
    global _asyncpg_connect_args

    if "postgresql" not in url or "+asyncpg" in url:
        _asyncpg_connect_args = None
        return url

    url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    parsed = urlparse(url)
    ssl_mode = None
    if parsed.query:
        keep = {}
        for pair in parsed.query.split("&"):
            if "=" not in pair:
                continue
            k, v = pair.split("=", 1)
            if k == "sslmode":
                ssl_mode = v
            elif k not in ("channel_binding",):
                keep[k] = v
        query = urlencode(keep) if keep else ""
        url = urlunparse(parsed._replace(query=query))

    _asyncpg_connect_args = {}
    if ssl_mode == "require":
        _asyncpg_connect_args["ssl"] = "require"
    elif ssl_mode:
        _asyncpg_connect_args["ssl"] = ssl_mode

    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Ecommerce API"
    app_version: str = "1.0.0"
    app_debug: bool = False

    database_url: str = "sqlite+aiosqlite:///./ecommerce.db"
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173"

    secret_key: str = "change-me-to-a-random-secret-min-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 43200

    log_level: str = "INFO"
    log_file: str = "logs/app.log"
    log_max_bytes: int = 10 * 1024 * 1024
    log_backup_count: int = 5

    rate_limit_enabled: bool = True
    rate_limit_requests: int = 60
    rate_limit_window: int = 60
    rate_limit_login_requests: int = 10
    rate_limit_login_window: int = 60

    min_password_length: int = 8
    min_password_uppercase: int = 1
    min_password_lowercase: int = 1
    min_password_digits: int = 1
    min_password_special: int = 0

    free_shipping_threshold: float = 50.0

    @property
    def async_database_url(self) -> str:
        return _to_asyncpg_url(self.database_url)

    @property
    def is_postgres(self) -> bool:
        return "postgresql" in self.database_url

    @property
    def asyncpg_connect_args(self) -> dict:
        return _asyncpg_connect_args or {}


settings = Settings()
