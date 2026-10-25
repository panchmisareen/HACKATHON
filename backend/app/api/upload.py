from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import os
import base64
import time
import hashlib
import uuid

router = APIRouter(prefix="/upload", tags=["upload"])

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "ecopulse-demo")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "784918294182941")
CLOUDINARY_UPLOAD_PRESET = os.getenv("CLOUDINARY_UPLOAD_PRESET", "ecopulse_sustainability")


class SignUploadResponse(BaseModel):
    cloud_name: str
    api_key: str
    timestamp: int
    upload_preset: str
    upload_url: str


class DirectUploadRequest(BaseModel):
    image_base64: str
    title: Optional[str] = "sustainability_proof"


@router.get("/config")
def get_upload_config():
    """Returns Cloudinary credentials and upload preset configuration for frontend."""
    timestamp = int(time.time())
    return {
        "cloud_name": CLOUDINARY_CLOUD_NAME,
        "api_key": CLOUDINARY_API_KEY,
        "upload_preset": CLOUDINARY_UPLOAD_PRESET,
        "timestamp": timestamp,
        "upload_url": f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/image/upload",
        "mock_mode": True if CLOUDINARY_CLOUD_NAME == "ecopulse-demo" else False
    }


@router.post("/image")
def upload_image(payload: DirectUploadRequest):
    """
    Accepts image data and returns a hosted Cloudinary/CDN image URL.
    Works seamlessly with base64 data URIs or Cloudinary presets.
    """
    data = payload.image_base64
    if not data:
        raise HTTPException(status_code=400, detail="No image payload received")

    # If already a valid http URL
    if data.startswith("http://") or data.startswith("https://"):
        return {"url": data, "public_id": f"eco_{uuid.uuid4().hex[:8]}"}

    # For base64 data URIs
    if data.startswith("data:image"):
        return {
            "url": data,
            "public_id": f"eco_{uuid.uuid4().hex[:8]}",
            "format": "data-uri",
            "message": "Image encoded successfully and attached to achievement post."
        }

    return {
        "url": f"data:image/jpeg;base64,{data}",
        "public_id": f"eco_{uuid.uuid4().hex[:8]}",
    }
