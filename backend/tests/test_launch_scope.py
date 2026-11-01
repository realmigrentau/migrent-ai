"""
Launch scope, 1 November 2026 (owner decision).

Migrent opens on 1 December 2026 with leases only. Short stays and the
mentor marketplace stay switched off until SHORT_STAYS_ENABLED and
MENTORS_ENABLED are set, and a "sale" listing is never accepted. conftest.py
switches both on for the rest of the suite; these tests switch them off.
"""

import re
from datetime import date, timedelta
from pathlib import Path

import pytest

from tests.conftest import LISTING_LIVE, SEEKER_ID, VERIFIED_OWNER_ID, auth

IDENTITY = Path(__file__).resolve().parents[2] / "frontend" / "lib" / "siteIdentity.ts"


@pytest.fixture()
def launch_scope(monkeypatch):
    monkeypatch.delenv("SHORT_STAYS_ENABLED", raising=False)
    monkeypatch.delenv("MENTORS_ENABLED", raising=False)


def _lease_draft(**over):
    data = {
        "street_address": "15 Smith Street", "suburb": "Kellyville", "postcode": 2155, "state": "NSW",
        "property_type": "house", "place_type": "private_room", "unit_label": "Room 2",
        "title": "Bright room near the metro", "description": "A furnished room with a desk and built-in wardrobe.",
        "images": ["https://img.test/room.jpg"], "weekly_price": 320, "available_from": (date.today() + timedelta(days=7)).isoformat(),
        "furnished": True, "bills_included": True, "listing_purpose": "long_term", "lease_months": 6,
        "bond_weeks": 4, "rent_in_advance_weeks": 2,
    }
    data.update(over)
    return data


def _submit(client, data):
    draft_id = client.post("/hub/listing-drafts", headers=auth(VERIFIED_OWNER_ID), json={"data": data}).json()["draft"]["id"]
    return client.post(f"/hub/listing-drafts/{draft_id}/submit", headers=auth(VERIFIED_OWNER_ID))


def _purpose_problems(r):
    return [p for p in r.json()["detail"]["problems"] if p["field"] == "listing_purpose"]


# ── The switches ─────────────────────────────────────────────


def test_both_are_off_unless_switched_on(launch_scope):
    from billing import mentors_open, short_stays_open

    assert short_stays_open() is False
    assert mentors_open() is False


def test_the_public_copy_agrees_with_the_production_default():
    text = IDENTITY.read_text()
    m = re.search(r"launchScope:\s*\{\s*shortStays:\s*(true|false),\s*mentors:\s*(true|false)", text)
    assert m, "launchScope not found in siteIdentity.ts"
    assert m.groups() == ("false", "false")


# ── Short stays ──────────────────────────────────────────────


def test_a_lease_still_goes_live(client, launch_scope):
    r = _submit(client, _lease_draft())
    assert r.status_code == 200, r.text


def test_a_short_stay_draft_is_refused_with_a_reason(client, launch_scope):
    r = _submit(client, _lease_draft(listing_purpose="short_stay", min_stay_weeks=2))
    assert r.status_code == 422
    assert [p["step"] for p in _purpose_problems(r)] == ["pricing"]


def test_a_sale_draft_is_always_refused(client):
    r = _submit(client, _lease_draft(listing_purpose="sale"))
    assert r.status_code == 422
    assert _purpose_problems(r)[0]["message"] == "Migrent lists homes to rent only"


def test_a_live_listing_cannot_be_switched_to_a_short_stay(client, db, launch_scope):
    r = client.patch(f"/hub/listings/{LISTING_LIVE}/unit", headers=auth(VERIFIED_OWNER_ID), json={"listing_purpose": "short_stay"})
    assert r.status_code == 400
    assert next(l for l in db.rows("listings") if l["id"] == LISTING_LIVE).get("listing_purpose") != "short_stay"


def test_a_live_listing_cannot_be_switched_to_sale(client):
    r = client.patch(f"/hub/listings/{LISTING_LIVE}/unit", headers=auth(VERIFIED_OWNER_ID), json={"listing_purpose": "sale"})
    assert r.status_code == 400


def test_a_booking_is_refused_and_nothing_is_stored(client, db, launch_scope):
    ci = (date.today() + timedelta(days=5)).isoformat()
    co = (date.today() + timedelta(days=33)).isoformat()
    r = client.post("/bookings", json={"listing_id": LISTING_LIVE, "check_in": ci, "check_out": co, "guests": 1}, headers=auth(SEEKER_ID))
    assert r.status_code == 503
    assert not db.rows("bookings")


# ── Mentors ──────────────────────────────────────────────────


def test_the_mentor_list_is_empty(client, launch_scope):
    assert client.get("/mentors").json() == {"mentors": [], "count": 0}


def test_a_mentor_profile_is_not_found(client, launch_scope):
    assert client.get("/mentors/mentor-1").status_code == 404


@pytest.mark.parametrize(
    "path, body",
    [
        ("/mentors", {"suburb": "Ryde", "postcode": "2112", "languages": ["English"], "bio": "Ten years helping new arrivals settle in.", "specialties": [], "hourly_rate": 5000}),
        ("/mentors/sessions", {"mentor_id": "mentor-1", "suburb": "Ryde", "session_type": "video_call"}),
        ("/mentors/stripe-onboard", None),
    ],
)
def test_mentor_sign_ups_bookings_and_payouts_are_refused(client, db, launch_scope, path, body):
    kwargs = {"json": body} if body is not None else {}
    r = client.post(path, headers=auth(SEEKER_ID), **kwargs)
    assert r.status_code == 503, r.text
    assert not [m for m in db.rows("mentors") if m["user_id"] == SEEKER_ID]
    assert not db.rows("mentor_sessions")
