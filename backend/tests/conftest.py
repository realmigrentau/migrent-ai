"""
Shared fixtures.

The backend is exercised through FastAPI's TestClient against the in-memory
Supabase fake in fake_supabase.py. Nothing here touches the network, a real
database, Stripe or an email provider.
"""

from __future__ import annotations

import os
import sys
from datetime import date, timedelta
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# Must be set before `db` is imported anywhere.
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.local")
os.environ.setdefault("SUPABASE_ANON_KEY", "anon-test-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "service-test-key")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_placeholder")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test_placeholder")
os.environ.setdefault("CRON_SECRET", "cron-test-secret")
os.environ.setdefault("ENV", "test")
os.environ.pop("MAPTILER_API_KEY", None)
os.environ.pop("RESEND_API_KEY", None)
os.environ.pop("SENTRY_DSN", None)

from tests.fake_supabase import FakeSupabase  # noqa: E402

OWNER_ID = "11111111-1111-4111-8111-111111111111"
VERIFIED_OWNER_ID = "22222222-2222-4222-8222-222222222222"
SEEKER_ID = "33333333-3333-4333-8333-333333333333"
OTHER_ID = "44444444-4444-4444-8444-444444444444"
ADMIN_ID = "55555555-5555-4555-8555-555555555555"

LISTING_LIVE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"
LISTING_EXPIRED = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"
LISTING_UNVERIFIED = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3"
LISTING_DRAFT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4"
LISTING_HIDDEN = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5"
LISTING_FUTURE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6"


def _listing(**over):
    base = {
        "title": "Sunny room",
        "address": "12 Example Street",
        "suburb": "Kellyville",
        "city": "Sydney",
        "postcode": 2155,
        "weekly_price": 300,
        "description": "A nice room near the station with a window.",
        "images": ["https://img.test/a.jpg"],
        "owner_id": VERIFIED_OWNER_ID,
        "moderation_status": "approved",
        "latitude": -33.7139,
        "longitude": 150.9501,
        "available_from": (date.today() - timedelta(days=10)).isoformat(),
        "available_to": (date.today() + timedelta(days=90)).isoformat(),
        "hidden_at": None,
        "instant_book_enabled": False,
        "max_guests": 2,
        "min_stay_weeks": 1,
        "max_stay_weeks": 52,
        "moderation_notes": "internal note",
        "moderation_reason": None,
        "moderator_id": ADMIN_ID,
        "spam_score": 3,
        "spam_reasons": ["x"],
        "content_hash": "deadbeef",
        "flagged_at": None,
        "reviewed_at": None,
        "reviewed_by": None,
        "delete_requested_at": None,
        "delete_approved_at": None,
        "weapons_on_property": False,
        "weapons_explanation": None,
        "listing_fee_paid_at": None,
        "created_at": "2026-08-01T00:00:00+00:00",
    }
    base.update(over)
    return base


@pytest.fixture()
def db(monkeypatch):
    fake = FakeSupabase()

    fake.add_user(OWNER_ID, "owner@example.com", user_metadata={"user_type": "owner"})
    fake.add_user(VERIFIED_OWNER_ID, "verified@example.com", user_metadata={"user_type": "owner"})
    fake.add_user(SEEKER_ID, "seeker@example.com", user_metadata={"user_type": "seeker"})
    fake.add_user(OTHER_ID, "other@example.com", user_metadata={"user_type": "seeker"})
    fake.add_user(ADMIN_ID, "admin@example.com", user_metadata={"user_type": "seeker"})

    fake.seed(
        "profiles",
        [
            {"id": OWNER_ID, "public_id": "pubowner01", "name": "Unverified Owner", "custom_pfp": None,
             "badges": ["Verified host"], "verified": False, "identity_verified": False, "is_admin": False, "role": "owner",
             "phone": "0400000000", "residential_address": "1 Secret St", "email": "owner@example.com",
             "over_18_confirmed_at": "2026-01-01T00:00:00+00:00"},
            {"id": VERIFIED_OWNER_ID, "public_id": "pubverif02", "name": "Verified Owner", "custom_pfp": None,
             "badges": ["Superhost"], "verified": False, "identity_verified": True, "is_admin": False, "role": "owner",
             "phone": "0400000001", "residential_address": "2 Secret St", "email": "verified@example.com",
             "over_18_confirmed_at": "2026-01-01T00:00:00+00:00"},
            {"id": SEEKER_ID, "public_id": "pubseeker3", "name": "Sam Seeker", "verified": True, "identity_verified": False,
             "is_admin": False, "role": "seeker", "phone": "0400000002", "email": "seeker@example.com", "badges": []},
            {"id": OTHER_ID, "public_id": "pubother04", "name": "Olive Other", "verified": False, "identity_verified": False,
             "is_admin": False, "role": "seeker", "email": "other@example.com", "badges": []},
            {"id": ADMIN_ID, "public_id": "pubadmin05", "name": "Ada Admin", "verified": False, "identity_verified": False,
             "is_admin": True, "role": "superadmin", "email": "admin@example.com", "badges": []},
        ],
    )
    fake.seed(
        "owner_verification",
        [
            {"user_id": VERIFIED_OWNER_ID, "email_verified": True, "phone_verified": True, "id_status": "approved",
             "fully_verified": True, "id_reviewed_at": "2026-06-01T00:00:00+00:00", "id_file_path": "secret/path.jpg", "phone": "0400000001"},
            {"user_id": OWNER_ID, "email_verified": True, "phone_verified": False, "id_status": "not_submitted",
             "fully_verified": False, "id_reviewed_at": None, "id_file_path": None, "phone": None},
        ],
    )
    fake.seed(
        "listings",
        [
            _listing(id=LISTING_LIVE),
            _listing(id=LISTING_EXPIRED, title="Expired room", available_to=(date.today() - timedelta(days=5)).isoformat()),
            _listing(id=LISTING_UNVERIFIED, title="Unverified owner room", owner_id=OWNER_ID),
            _listing(id=LISTING_DRAFT, title="Draft room", moderation_status="draft", owner_id=OWNER_ID),
            _listing(id=LISTING_HIDDEN, title="Hidden room", hidden_at="2026-08-01T00:00:00+00:00"),
            _listing(id=LISTING_FUTURE, title="Future room", available_from=(date.today() + timedelta(days=30)).isoformat()),
        ],
    )

    import db as dbmod

    monkeypatch.setattr(dbmod, "create_client", lambda *a, **k: fake)

    from limiter import limiter

    limiter.enabled = False

    # Quiet side effects that would otherwise hit external services.
    import routes_listings

    monkeypatch.setattr(
        routes_listings,
        "calculate_spam_score",
        lambda **kw: {"spam_score": 0, "reasons": [], "content_hash": "h", "action": "allow"},
    )
    monkeypatch.setattr(routes_listings, "apply_spam_result", lambda *a, **k: None)
    monkeypatch.setattr(routes_listings, "notify_founder_spam", lambda *a, **k: None)

    return fake


@pytest.fixture()
def client(db):
    from fastapi.testclient import TestClient

    import main

    return TestClient(main.app)


def auth(user_id: str) -> dict:
    return {"Authorization": f"Bearer tok-{user_id}"}
