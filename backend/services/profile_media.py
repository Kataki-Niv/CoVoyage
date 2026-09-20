import base64
import binascii
import os
from pathlib import Path
import secrets

from fastapi import HTTPException, status


MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024
MAX_JOURNAL_IMAGE_BYTES = 10 * 1024 * 1024
MAX_JOURNAL_VIDEO_BYTES = 100 * 1024 * 1024
MEDIA_ROOT = Path(
    os.getenv("COVOYAGE_MEDIA_ROOT", "").strip()
    or Path(__file__).resolve().parents[1] / "media"
)
PROFILE_IMAGE_ROOT = MEDIA_ROOT / "profile-images"
JOURNAL_MEDIA_ROOT = MEDIA_ROOT / "journal-media"
SUPPORTED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
SUPPORTED_VIDEO_TYPES = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
}


def ensure_media_directories():
    PROFILE_IMAGE_ROOT.mkdir(parents=True, exist_ok=True)
    JOURNAL_MEDIA_ROOT.mkdir(parents=True, exist_ok=True)


def decode_profile_image(content_base64: str) -> bytes:
    if "," in content_base64 and content_base64.lstrip().startswith("data:"):
        content_base64 = content_base64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(content_base64, validate=True)
    except (binascii.Error, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile image data is invalid.",
        ) from error

    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile image is empty.",
        )

    if len(image_bytes) > MAX_PROFILE_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Choose an image smaller than 5 MB.",
        )

    return image_bytes


def get_profile_image_extension(content_type: str, image_bytes: bytes) -> str:
    normalized_content_type = content_type.strip().lower()
    extension = SUPPORTED_IMAGE_TYPES.get(normalized_content_type)

    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Choose a JPG, PNG, or WEBP image.",
        )

    if normalized_content_type == "image/jpeg" and image_bytes.startswith(b"\xff\xd8\xff"):
        return extension

    if normalized_content_type == "image/png" and image_bytes.startswith(
        b"\x89PNG\r\n\x1a\n",
    ):
        return extension

    if (
        normalized_content_type == "image/webp"
        and len(image_bytes) >= 12
        and image_bytes[:4] == b"RIFF"
        and image_bytes[8:12] == b"WEBP"
    ):
        return extension

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Profile image file type does not match its content.",
    )


def save_profile_image(user_id: str, content_type: str, content_base64: str) -> str:
    ensure_media_directories()
    image_bytes = decode_profile_image(content_base64)
    extension = get_profile_image_extension(content_type, image_bytes)
    filename = f"{user_id}-{secrets.token_urlsafe(16)}{extension}"
    target_path = PROFILE_IMAGE_ROOT / filename
    target_path.write_bytes(image_bytes)

    return f"/media/profile-images/{filename}"


def decode_journal_media(content_base64: str, max_bytes: int, empty_message: str) -> bytes:
    if "," in content_base64 and content_base64.lstrip().startswith("data:"):
        content_base64 = content_base64.split(",", 1)[1]

    try:
        media_bytes = base64.b64decode(content_base64, validate=True)
    except (binascii.Error, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Journal media data is invalid.",
        ) from error

    if not media_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=empty_message,
        )

    if len(media_bytes) > max_bytes:
        size_limit = max_bytes // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Choose a file smaller than {size_limit} MB.",
        )

    return media_bytes


def get_journal_image_extension(content_type: str, image_bytes: bytes) -> str:
    normalized_content_type = content_type.strip().lower()
    extension = SUPPORTED_IMAGE_TYPES.get(normalized_content_type)

    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Choose a JPG, PNG, or WEBP image.",
        )

    if normalized_content_type == "image/jpeg" and image_bytes.startswith(b"\xff\xd8\xff"):
        return extension

    if normalized_content_type == "image/png" and image_bytes.startswith(
        b"\x89PNG\r\n\x1a\n",
    ):
        return extension

    if (
        normalized_content_type == "image/webp"
        and len(image_bytes) >= 12
        and image_bytes[:4] == b"RIFF"
        and image_bytes[8:12] == b"WEBP"
    ):
        return extension

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Journal image file type does not match its content.",
    )


def get_journal_video_extension(content_type: str, video_bytes: bytes) -> str:
    normalized_content_type = content_type.strip().lower()
    extension = SUPPORTED_VIDEO_TYPES.get(normalized_content_type)

    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Choose an MP4, WEBM, or MOV video.",
        )

    if normalized_content_type in {"video/mp4", "video/quicktime"} and b"ftyp" in video_bytes[:32]:
        return extension

    if normalized_content_type == "video/webm" and video_bytes.startswith(b"\x1a\x45\xdf\xa3"):
        return extension

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Journal video file type does not match its content.",
    )


def save_journal_media(
    user_id: str,
    media_kind: str,
    content_type: str,
    content_base64: str,
) -> str:
    ensure_media_directories()

    if media_kind == "image":
        media_bytes = decode_journal_media(
            content_base64,
            MAX_JOURNAL_IMAGE_BYTES,
            "Journal image is empty.",
        )
        extension = get_journal_image_extension(content_type, media_bytes)
    elif media_kind == "video":
        media_bytes = decode_journal_media(
            content_base64,
            MAX_JOURNAL_VIDEO_BYTES,
            "Journal video is empty.",
        )
        extension = get_journal_video_extension(content_type, media_bytes)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Journal media type must be image or video.",
        )

    filename = f"{user_id}-{secrets.token_urlsafe(16)}{extension}"
    target_path = JOURNAL_MEDIA_ROOT / filename
    target_path.write_bytes(media_bytes)

    return f"/media/journal-media/{filename}"


def delete_local_profile_image(image_url: str | None):
    if not image_url or not image_url.startswith("/media/profile-images/"):
        return

    filename = image_url.rsplit("/", 1)[-1]

    if not filename or "/" in filename or "\\" in filename or ".." in filename:
        return

    target_path = (PROFILE_IMAGE_ROOT / filename).resolve()

    try:
        target_path.relative_to(PROFILE_IMAGE_ROOT.resolve())
    except ValueError:
        return

    if target_path.exists():
        target_path.unlink()
