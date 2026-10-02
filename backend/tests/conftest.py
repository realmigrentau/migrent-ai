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
os.environ.setdefault("LISTING_IMAGE_HOSTS", "img.test")
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
ADMIN_PANEL_PASSWORD = "panel-test-password"

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


def audit_log_constraints() -> tuple[set[str], set[str]]:
    """The actions and target types admin_audit_log accepts in production:
    each CHECK constraint as the latest migration that sets it left it."""
    import re

    migrations = [p.read_text() for p in sorted((ROOT / "migrations").glob("*.sql"))]

    def values(name: str) -> set[str]:
        sql = [text for text in migrations if f"ADD CONSTRAINT {name}" in text][-1]
        block = sql[sql.rindex(f"ADD CONSTRAINT {name}"):]
        return set(re.findall(r"'([a-z_]+)'", block[: block.index(");")]))

    return values("admin_audit_log_action_check"), values("admin_audit_log_target_type_check")


AUDIT_ACTIONS, AUDIT_TARGET_TYPES = audit_log_constraints()


def _enforce_audit_constraints(row: dict, _table: list) -> None:
    # The fake has no CHECK constraints; without this a new audit action
    # passes every test and then fails in production.
    if row.get("action") not in AUDIT_ACTIONS:
        raise ValueError(f"admin_audit_log_action_check would reject action {row.get('action')!r}")
    if row.get("target_type") not in AUDIT_TARGET_TYPES:
        raise ValueError(f"admin_audit_log_target_type_check would reject target_type {row.get('target_type')!r}")
    if not row.get("target_id") or not row.get("admin_id"):
        raise ValueError("admin_audit_log needs admin_id and target_id")


@pytest.fixture()
def db(monkeypatch):
    fake = FakeSupabase()
    fake.insert_hooks.setdefault("admin_audit_log", []).append(_enforce_audit_constraints)

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
    from admin_panel import hash_password

    # The Admin panel password (a few iterations: tests only need it to match).
    fake.seed("admin_panel_settings", [{"id": 1, "password_hash": hash_password(ADMIN_PANEL_PASSWORD, iterations=1000)}])
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
    # The service-role client is shared per process, and verified tokens are
    # remembered briefly; start every test from a clean slate.
    monkeypatch.setattr(dbmod, "_admin_client", None)
    import auth_utils

    auth_utils._remote_cache.clear()
    auth_utils._active_cache.clear()
    auth_utils._mfa_cache.clear()
    import hub_common

    hub_common._known_admins.clear()
    import listing_lifecycle

    listing_lifecycle._suspended_cache.update(until=0.0, ids=[])

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


def sign_in_token(user_id: str, aal: str = "aal2") -> str:
    """A sign-in token for a fixture user. The fake accepts any token signed
    with the test key whose `sub` is a user it knows (fake_supabase)."""
    import jwt as pyjwt

    # amr: how and when the person last signed in (Supabase puts it in every
    # access token); deleting an account needs a recent one.
    import time

    signed_in_at = int(time.time()) // 600 * 600  # stable for ten minutes, so tokens compare equal
    return pyjwt.encode(
        {"sub": user_id, "aal": aal, "role": "authenticated", "amr": [{"method": "password", "timestamp": signed_in_at}]},
        "test-secret",
        algorithm="HS256",
    )


def auth(user_id: str, *, unlocked: bool = True, aal: str = "aal2") -> dict:
    """Sign-in headers. The token is a JWT carrying `aal` (aal2 = signed in
    with an authenticator code, which admin access requires). By default the headers also carry an Admin
    panel unlock for that account (it only matters for admins);
    unlocked=False leaves it out, as when the panel is locked."""
    headers = {"Authorization": f"Bearer {sign_in_token(user_id, aal)}"}
    if unlocked:
        from admin_panel import UNLOCK_HEADER, issue_unlock_token

        headers[UNLOCK_HEADER] = issue_unlock_token(user_id, "")
    return headers
