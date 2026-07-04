import io
from pathlib import Path

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.dependencies import require_admin
from app.models.user import User

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
)


@router.post("/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    _admin: User = Depends(require_admin),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Allowed: JPEG, PNG, GIF, WebP")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB")

    result = cloudinary.uploader.upload(
        io.BytesIO(contents),
        folder=settings.cloudinary_folder,
        resource_type="image",
    )

    return {
        "url": result["secure_url"],
        "filename": result["public_id"],
    }


@router.get("/{filename}")
async def get_image(filename: str):
    filepath = UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)
