"""The fee facts in backend/payments.py must match frontend/lib/siteIdentity.ts.
Copy and code drifted apart before (the site said $99 per property while the
code charged per booking and the calculator charged per room)."""

import re
from pathlib import Path

import payments

IDENTITY = Path(__file__).resolve().parents[2] / "frontend" / "lib" / "siteIdentity.ts"


def _ts(pattern: str) -> str:
    m = re.search(pattern, IDENTITY.read_text())
    assert m, f"pattern not found in siteIdentity.ts: {pattern}"
    return m.group(1)


def test_host_fee_matches_public_copy():
    assert int(_ts(r"listingFee:\s*(\d+)")) * 100 == payments.HOST_LISTING_FEE_CENTS


def test_fee_model_matches_public_copy():
    assert _ts(r'model:\s*"(per_property|per_booking)"') == payments.FEE_MODEL


def test_seeker_platform_fee_is_zero():
    assert int(_ts(r"platformFee:\s*(\d+)")) == 0


def test_seeker_verification_flag_matches():
    enabled = _ts(r"verification:\s*\{\s*enabled:\s*(true|false)") == "true"
    assert enabled == payments.SEEKER_VERIFICATION_ENABLED
    assert int(_ts(r"verification:\s*\{\s*enabled:\s*(?:true|false),\s*fee:\s*(\d+)")) * 100 == payments.SEEKER_VERIFICATION_FEE_CENTS
