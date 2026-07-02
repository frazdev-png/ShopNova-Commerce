import logging
import traceback

from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class AppException(Exception):
    def __init__(self, status_code: int, detail: str, error_code: str | None = None):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code


class NotFoundException(AppException):
    def __init__(self, detail: str = "Resource not found", error_code: str = "NOT_FOUND"):
        super().__init__(status.HTTP_404_NOT_FOUND, detail, error_code)


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Unauthorized", error_code: str = "UNAUTHORIZED"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail, error_code)


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Forbidden", error_code: str = "FORBIDDEN"):
        super().__init__(status.HTTP_403_FORBIDDEN, detail, error_code)


class BadRequestException(AppException):
    def __init__(self, detail: str = "Bad request", error_code: str = "BAD_REQUEST"):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail, error_code)


class ConflictException(AppException):
    def __init__(self, detail: str = "Conflict", error_code: str = "CONFLICT"):
        super().__init__(status.HTTP_409_CONFLICT, detail, error_code)


def error_response(status_code: int, detail: str, error_code: str | None = None) -> JSONResponse:
    body: dict = {"detail": detail}
    if error_code:
        body["error_code"] = error_code
    return JSONResponse(status_code=status_code, content=body)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.warning("App error %s: %s", exc.status_code, exc.detail)
    return error_response(exc.status_code, exc.detail, exc.error_code)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    logger.warning("HTTP error %s: %s", exc.status_code, exc.detail)
    return error_response(exc.status_code, str(exc.detail))


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = []
    for e in exc.errors():
        field = ".".join(str(loc) for loc in e.get("loc", []))
        msg = e.get("msg", "Invalid value")
        errors.append({"field": field, "message": msg})
    logger.warning("Validation error: %s", errors)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation failed", "errors": errors},
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled error: %s\n%s", exc, traceback.format_exc())
    return error_response(
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        "An internal server error occurred",
        "INTERNAL_ERROR",
    )
