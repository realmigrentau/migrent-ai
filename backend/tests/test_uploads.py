import io

import pytest
from PIL import Image

from uploads import ImageValidationError, prepare_public_image, sniff_image_type, validate_private_document


def _jpeg_with_exif(size=(400, 300)):
    img = Image.new("RGB", size, (200, 120, 80))
    exif = Image.Exif()
    exif[0x0110] = "Test Camera"  # Model
    exif[0x010F] = "Test Maker"  # Make
    buf = io.BytesIO()
    img.save(buf, format="JPEG", exif=exif.tobytes())
    return buf.getvalue()


def test_magic_bytes_not_extension_decide_type():
    assert sniff_image_type(b"\xff\xd8\xff\xe0rest") == ("image/jpeg", "jpg")
    assert sniff_image_type(b"<script>alert(1)</script>") is None
    with pytest.raises(ImageValidationError):
        prepare_public_image(b"GIF89a-but-not-really", max_bytes=1000)


def test_public_derivative_drops_exif_and_reencodes():
    data = _jpeg_with_exif()
    out = prepare_public_image(data)
    assert out.content_type == "image/webp"
    img = Image.open(io.BytesIO(out.data))
    assert img.format == "WEBP"
    assert not img.getexif()


def test_size_and_dimension_limits():
    tiny = io.BytesIO()
    Image.new("RGB", (20, 20)).save(tiny, format="PNG")
    with pytest.raises(ImageValidationError):
        prepare_public_image(tiny.getvalue())
    with pytest.raises(ImageValidationError):
        prepare_public_image(_jpeg_with_exif(), max_bytes=10)


def test_private_document_accepts_pdf_and_images_only():
    assert validate_private_document(b"%PDF-1.7 rest") == ("application/pdf", "pdf")
    with pytest.raises(ImageValidationError):
        validate_private_document(b"MZ\x90\x00 executable")
