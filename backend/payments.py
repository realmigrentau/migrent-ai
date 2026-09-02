"""
Everything Stripe-related that is a fact rather than a route.

What MigRent charges (see frontend/lib/siteIdentity.ts, the single public
source for fee copy; the two must agree and tests/test_fee_consistency.py
checks they do):

  host_listing_fee      AUD 99.00, paid by the HOST, once per PROPERTY, when
                        a booking on that property is first confirmed.
                        Subsequent bookings on the same listing do not incur
                        the fee again (FEE_MODEL=per_property). Set
                        FEE_MODEL=per_booking to charge on every confirmation.
  seeker_platform_fee   AUD 0. Renters never pay MigRent.
  seeker_verification   AUD 19.00, optional. DISABLED (SEEKER_VERIFICATION_
                        ENABLED=false) until it verifies something real; it
                        used to set profiles.verified=true with no check.
  mentor_session        Paid to the mentor through Stripe Connect; MigRent
                        keeps no rent, bond or deposit and never holds either.

Stripe never receives more than the ids it needs in metadata. Amounts are
always recomputed server-side and verified on the webhook.
"""

from __future__ import annotations

import os

HOST_LISTING_FEE_CENTS = 9900
SEEKER_VERIFICATION_FEE_CENTS = 1900
CURRENCY = "aud"

FEE_MODEL = os.environ.get("FEE_MODEL", "per_property").strip().lower()
if FEE_MODEL not in ("per_property", "per_booking"):
    FEE_MODEL = "per_property"

SEEKER_VERIFICATION_ENABLED = os.environ.get("SEEKER_VERIFICATION_ENABLED", "false").strip().lower() in ("1", "true", "yes")

EXPECTED_AMOUNTS = {
    "booking": HOST_LISTING_FEE_CENTS,
    "verification": SEEKER_VERIFICATION_FEE_CENTS,
    # Legacy deal flow (disabled for creation; webhook still recognises it).
    "owner": HOST_LISTING_FEE_CENTS,
    "seeker": SEEKER_VERIFICATION_FEE_CENTS,
}


def expected_amount_for(fee_type: str | None) -> int | None:
    if not fee_type:
        return None
    return EXPECTED_AMOUNTS.get(fee_type)
