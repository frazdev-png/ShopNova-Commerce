import time
from collections import defaultdict
from collections.abc import Callable

from fastapi import HTTPException, Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class InMemoryRateLimiter:
    def __init__(self):
        self._buckets: dict[str, list[float]] = defaultdict(list)

    def _cleanup(self, key: str, window: int):
        now = time.time()
        self._buckets[key] = [t for t in self._buckets[key] if now - t < window]

    def check(self, key: str, max_requests: int, window: int) -> bool:
        self._cleanup(key, window)
        if len(self._buckets[key]) >= max_requests:
            return False
        self._buckets[key].append(time.time())
        return True


rate_limiter = InMemoryRateLimiter()


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not settings.rate_limit_enabled:
            return await call_next(request)

        path = request.url.path
        ip = get_client_ip(request)

        if path.startswith("/api/auth/login") or path.startswith("/api/auth/register"):
            key = f"auth:{ip}"
            limit = settings.rate_limit_login_requests
            window = settings.rate_limit_login_window
        else:
            key = f"api:{ip}"
            limit = settings.rate_limit_requests
            window = settings.rate_limit_window

        if not rate_limiter.check(key, limit, window):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )

        return await call_next(request)
