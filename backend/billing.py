"""
The payment boundary the Hub reads from.

Migrent charges two things, both defined in payments.py and mirrored in
frontend/lib/siteIdentity.ts: the host fee (AUD 99 per property, charged
when a booking on it is first confirmed) and an optional renter
verification (AUD 19, switched off until it verifies something real). It
never collects rent or bond.

This module answers "what can actually be charged right now?" so the Hub
can say so honestly instead of showing a checkout that goes nowhere:

    payments_mode()   'off'  no Stripe key on the server
                      'test' a test key (sk_test_...) - no real money moves
                      'live' a live key (sk_live_...)

Provider-specific code stays in payments.py / routes_bookings.py /
routes_deals.py. A second provider, or rent collection, would plug in here
behind the same questions without the Hub changing.
"""

from __future__ import annotations

import os

from payments import HOST_LISTING_FEE_CENTS, SEEKER_VERIFICATION_FEE_CENTS


def payments_mode() -> str:
    key = os.environ.get("STRIPE_SECRET_KEY", "").strip()
    if not key:
        return "off"
    if key.startswith("sk_live_") or key.startswith("rk_live_"):
        return "live"
    return "test"


def fees() -> dict:
    return {
        "currency": "AUD",
        "host_fee": HOST_LISTING_FEE_CENTS / 100,
        "host_fee_model": os.environ.get("FEE_MODEL", "per_property"),
        "renter_verification_fee": SEEKER_VERIFICATION_FEE_CENTS / 100,
    }


def renter_verification_available() -> bool:
    """The paid renter ID check (renter_id.py: Stripe Identity behind it).
    Off until SEEKER_VERIFICATION_ENABLED=true and Stripe is set up."""
    on = os.environ.get("SEEKER_VERIFICATION_ENABLED", "false").strip().lower() in ("1", "true", "yes")
    return on and payments_mode() != "off"
