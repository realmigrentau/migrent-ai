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


def _switched_on(name: str) -> bool:
    return os.environ.get(name, "false").strip().lower() in ("1", "true", "yes")


def short_stays_open() -> bool:
    """Short stays (request to book, instant book): the only thing the host
    fee is charged on. Off for launch (owner decision, 2026-11-01). NSW lets a
    booking platform advertise a short-term rental only with its premises
    registration number, and Victoria makes the platform collect a 7.5% levy
    on stays under 28 days; Migrent does neither yet. Leases are unaffected.
    SHORT_STAYS_ENABLED=true turns them back on. frontend/lib/siteIdentity.ts
    (launchScope.shortStays) must agree."""
    return _switched_on("SHORT_STAYS_ENABLED")


def mentors_open() -> bool:
    """The mentor marketplace (sign-ups, paid sessions, payouts). Off for
    launch (owner decision, 2026-11-01): there are no approved mentors yet and
    counsel has not reviewed the 30% commission. MENTORS_ENABLED=true turns it
    back on. frontend/lib/siteIdentity.ts (launchScope.mentors) must agree."""
    return _switched_on("MENTORS_ENABLED")


def renter_verification_available() -> bool:
    """The paid renter ID check (renter_id.py: Stripe Identity behind it).
    Off until SEEKER_VERIFICATION_ENABLED=true and Stripe is set up."""
    on = os.environ.get("SEEKER_VERIFICATION_ENABLED", "false").strip().lower() in ("1", "true", "yes")
    return on and payments_mode() != "off"
