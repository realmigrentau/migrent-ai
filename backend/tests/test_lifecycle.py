from datetime import date, timedelta

import pytest

from listing_lifecycle import (
    AvailabilityError,
    expire_listings,
    listings_expiring_soon,
    validate_availability_window,
    validate_search_dates,
)
from tests.conftest import ADMIN_ID, LISTING_EXPIRED, LISTING_LIVE, LISTING_UNVERIFIED, OWNER_ID, VERIFIED_OWNER_ID, auth


def test_availability_window_rules():
    today = date(2026, 9, 2)
    with pytest.raises(AvailabilityError):
        validate_availability_window("2026-03-20", "2026-04-25", today=today)
    with pytest.raises(AvailabilityError):
        validate_availability_window("2026-10-01", "2026-09-01", today=today)
    with pytest.raises(AvailabilityError):
        validate_availability_window("2026-10-01", "2062-01-01", today=today)
    with pytest.raises(AvailabilityError):
        validate_availability_window("nope", None, today=today)
    assert validate_availability_window(None, None, today=today) == (None, None)
    assert validate_availability_window("2026-09-10", "2026-12-01", today=today) == (date(2026, 9, 10), date(2026, 12, 1))


def test_search_dates_clamp_past_and_reject_impossible():
    today = date(2026, 9, 2)
    assert validate_search_dates("2026-01-01", None, today=today) == (today, None)
    with pytest.raises(AvailabilityError):
        validate_search_dates("2026-10-01", "2026-10-01", today=today)


def test_expire_job_is_idempotent_and_audited(db):
    expired = expire_listings(db, date.today())
    assert expired == [LISTING_EXPIRED]
    assert expire_listings(db, date.today()) == []
    events = [e for e in db.rows("moderation_events") if e["listing_id"] == LISTING_EXPIRED]
    assert events and events[0]["event_type"] == "expired"
    row = next(l for l in db.rows("listings") if l["id"] == LISTING_EXPIRED)
    assert row["moderation_status"] == "expired"


def test_cron_endpoints_need_secret(client):
    r = client.post("/internal/cron/expire-listings", headers={"X-Cron-Secret": "wrong"})
    assert r.status_code == 401
    r = client.post("/internal/cron/expire-listings", headers={"X-Cron-Secret": "cron-test-secret"})
    assert r.status_code == 200
    assert r.json()["expired"] == [LISTING_EXPIRED]


def test_expiry_reminders_target_next_week(db):
    for l in db.rows("listings"):
        if l["id"] == LISTING_LIVE:
            l["available_to"] = (date.today() + timedelta(days=3)).isoformat()
            l["expiry_notified_at"] = None
    soon = listings_expiring_soon(db, date.today())
    assert [s["id"] for s in soon] == [LISTING_LIVE]


def test_owner_renew_after_expiry_goes_back_to_review(client, db):
    expire_listings(db, date.today())
    new_to = (date.today() + timedelta(days=120)).isoformat()
    r = client.post(f"/listings/{LISTING_EXPIRED}/renew", json={"available_to": new_to}, headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 200, r.text
    assert r.json()["moderation_status"] == "pending_approval"
    # Extending a live listing keeps it live.
    r = client.post(f"/listings/{LISTING_LIVE}/renew", json={"available_to": new_to}, headers=auth(VERIFIED_OWNER_ID))
    assert r.json()["moderation_status"] == "approved"
    # Renewal into the past is refused.
    r = client.post(f"/listings/{LISTING_LIVE}/renew", json={"available_to": "2026-01-01"}, headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 400


def test_admin_pause_is_reversible_and_audited(client, db):
    r = client.post(
        f"/admin/listings/{LISTING_UNVERIFIED}/pause",
        json={"reason": "Photos are unrelated video thumbnails; availability ended 25 April 2026", "required_actions": ["Upload genuine property photos", "Set current availability dates"]},
        headers=auth(ADMIN_ID),
    )
    assert r.status_code == 200 and r.json()["previous_status"] == "approved"
    row = next(l for l in db.rows("listings") if l["id"] == LISTING_UNVERIFIED)
    assert row["moderation_status"] == "paused" and row["paused_by_admin"] is True
    assert client.get(f"/listings/{LISTING_UNVERIFIED}").status_code == 404
    assert LISTING_UNVERIFIED not in {x["id"] for x in client.get("/listings/search?limit=50").json()}
    audit = [a for a in db.rows("admin_audit_log") if a["target_id"] == LISTING_UNVERIFIED]
    assert audit and audit[-1]["action"] == "pause"
    # The owner cannot resume an admin pause.
    r = client.post(f"/listings/{LISTING_UNVERIFIED}/resume", headers=auth(OWNER_ID))
    assert r.status_code == 403
    # Unpause sends it to review by default; restoring live needs a verified owner.
    r = client.post(f"/admin/listings/{LISTING_UNVERIFIED}/unpause", json={"mode": "restore"}, headers=auth(ADMIN_ID))
    assert r.status_code == 409
    r = client.post(f"/admin/listings/{LISTING_UNVERIFIED}/unpause", json={}, headers=auth(ADMIN_ID))
    assert r.status_code == 200 and r.json()["moderation_status"] == "pending_approval"


def test_admin_cannot_approve_unverified_owner_or_expired_dates(client, db):
    for l in db.rows("listings"):
        if l["id"] == LISTING_UNVERIFIED:
            l["moderation_status"] = "pending_approval"
    r = client.post(f"/admin/listings/{LISTING_UNVERIFIED}/approve", json={}, headers=auth(ADMIN_ID))
    assert r.status_code == 409
    assert "verification" in r.json()["detail"].lower()
    for l in db.rows("listings"):
        if l["id"] == LISTING_EXPIRED:
            l["moderation_status"] = "pending_approval"
    r = client.post(f"/admin/listings/{LISTING_EXPIRED}/approve", json={}, headers=auth(ADMIN_ID))
    assert r.status_code == 409
    assert "availability" in r.json()["detail"].lower()
