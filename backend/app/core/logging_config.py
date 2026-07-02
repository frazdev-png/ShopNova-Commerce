import logging
import os
import sys
from logging.handlers import RotatingFileHandler

from app.core.config import settings


def setup_logging() -> None:
    log_dir = os.path.dirname(settings.log_file)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))
    root_logger.handlers.clear()

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    try:
        file_handler = RotatingFileHandler(
            settings.log_file,
            maxBytes=settings.log_max_bytes,
            backupCount=settings.log_backup_count,
            encoding="utf-8",
        )
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    except (OSError, PermissionError) as e:
        root_logger.warning("Could not create log file handler: %s", e)

    for uvicorn_logger in ["uvicorn", "uvicorn.access", "uvicorn.error"]:
        logging.getLogger(uvicorn_logger).handlers.clear()
        logging.getLogger(uvicorn_logger).addHandler(console_handler)

    sql_logger = logging.getLogger("sqlalchemy.engine")
    sql_logger.setLevel(logging.WARNING if not settings.app_debug else logging.INFO)
