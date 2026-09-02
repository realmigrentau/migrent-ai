"""
Upload validation for images that end up on public URLs.

* MIME type is decided from magic bytes, never from the client header.
* Size, dimension and count limits are enforced here and mirrored by the
  bucket configuration.
* Every public derivative is re-encoded through Pillow, which drops EXIF
  (GPS position, device serial) and any embedded payload.
"""

from __future__ import annotations

import io
from dataclasses import dataclass

try:  # Pillow is in requirements.txt; guard so unit tests can import without it.
    from PIL import Image, ImageOps, UnidentifiedImageError
except Exception:  # pragma: no cover
    Image = None  # type: ignore
    ImageOps = None  # type: ignore
    UnidentifiedImageError = Exception  # type: ignore


class ImageValidationError(ValueError):
    pass


MAGIC = {
    b"\xff\xd8\xff": ("image/jpeg", "jpg"),
    b"\x89PNG\r\n\x1a\n": ("image/png", "png"),
    b"RIFF": ("image/webp", "webp"),  # RIFF....WEBP
    b"GIF87a": ("image/gif", "gif"),
    b"GIF89a": ("image/gif", "gif"),
}


def sniff_image_type(data: bytes) -> tuple[str, str] | None:
    for magic, kind in MAGIC.items():
        if data.startswith(magic):
            if magic == b"RIFF" and data[8:12] != b"WEBP":
                return None
            return kind
    return None


def sniff_pdf(data: bytes) -> bool:
    return data.startswith(b"%PDF-")


@dataclass
class PreparedImage:
    data: bytes
    content_type: str
    extension: str
    width: int
    height: int


def prepare_public_image(
    data: bytes,
    *,
    max_bytes: int = 10 * 1024 * 1024,
    max_side: int = 2048,
    min_side: int = 200,
) -> PreparedImage:
    """Validate and normalise an uploaded image for public display."""
    if not data:
        raise ImageValidationError("The file is empty.")
    if len(data) > max_bytes:
        raise ImageValidationError(f"The file is larger than {max_bytes // (1024 * 1024)}MB.")
    kind = sniff_image_type(data)
    if kind is None:
        raise ImageValidationError("Only JPEG, PNG, WebP or GIF photos are accepted.")
    if Image is None:
        raise ImageValidationError("Image processing is unavailable on this server.")

    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except (UnidentifiedImageError, OSError) as e:
        raise ImageValidationError("That file could not be read as an image.") from e

    width, height = img.size
    if width < min_side or height < min_side:
        raise ImageValidationError(f"Photos must be at least {min_side}px on each side.")
    if width * height > 40_000_000:
        raise ImageValidationError("That image is too large to process.")

    # Apply the EXIF orientation, then drop all metadata by re-encoding.
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass
    if max(img.size) > max_side:
        img.thumbnail((max_side, max_side))
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")

    out = io.BytesIO()
    if img.mode == "RGBA":
        img.save(out, format="WEBP", quality=85, method=4)
        return PreparedImage(out.getvalue(), "image/webp", "webp", *img.size)
    img.save(out, format="WEBP", quality=85, method=4)
    return PreparedImage(out.getvalue(), "image/webp", "webp", *img.size)


def validate_private_document(data: bytes, *, max_bytes: int = 10 * 1024 * 1024) -> tuple[str, str]:
    """For ID documents and message attachments stored in private buckets.
    Returns (content_type, extension)."""
    if not data:
        raise ImageValidationError("The file is empty.")
    if len(data) > max_bytes:
        raise ImageValidationError(f"The file is larger than {max_bytes // (1024 * 1024)}MB.")
    if sniff_pdf(data):
        return "application/pdf", "pdf"
    kind = sniff_image_type(data)
    if kind is None:
        raise ImageValidationError("Only JPEG, PNG, WebP or PDF files are accepted.")
    return kind
