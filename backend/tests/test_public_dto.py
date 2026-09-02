from datetime import date, timedelta

from public_dto import (
    FORBIDDEN_PUBLIC_LISTING_FIELDS,
    FORBIDDEN_PUBLIC_PROFILE_FIELDS,
    approximate_location,
    assert_no_forbidden_fields,
    listing_public_state,
    public_badges,
    to_public_listing,
    to_public_owner,
    verification_summary,
)
from routes_geocode import haversine


def test_public_listing_strips_every_forbidden_field():
    row = {k: "x" for k in FORBIDDEN_PUBLIC_LISTING_FIELDS}
    row.update({"id": "abc", "title": "t", "suburb": "Kellyville", "postcode": 2155, "latitude": -33.7, "longitude": 150.9, "moderation_status": "approved"})
    out = to_public_listing(row, owner_profile={k: "x" for k in FORBIDDEN_PUBLIC_PROFILE_FIELDS} | {"id": "o", "name": "N", "public_id": "p"}, owner_verification=None)
    assert assert_no_forbidden_fields(out) == []
    assert out["display_address"] == "Kellyville 2155"
    assert "address" not in out and "owner_id" not in out
    assert out["location"]["precision"] == "approximate"


def test_approximate_location_is_deterministic_and_bounded():
    a = approximate_location("listing-1", -33.7139, 150.9501)
    b = approximate_location("listing-1", -33.7139, 150.9501)
    assert a == b
    dist_km = haversine(-33.7139, 150.9501, a["approx_lat"], a["approx_lng"])
    # Never exact, never further than the stated radius plus rounding slack.
    assert 0.05 < dist_km < 0.6
    assert approximate_location("x", None, None) is None
    assert approximate_location("x", 999, 0) is None


def test_public_state_reflects_availability():
    today = date(2026, 9, 2)
    assert listing_public_state({"moderation_status": "approved", "available_to": "2026-04-25"}, today) == "expired"
    assert listing_public_state({"moderation_status": "approved", "available_to": "2026-12-01"}, today) == "published"
    assert listing_public_state({"moderation_status": "approved", "available_to": None}, today) == "published"
    assert listing_public_state({"moderation_status": "approved", "hidden_at": "x"}, today) == "unavailable"
    assert listing_public_state({"moderation_status": "paused"}, today) == "unavailable"
    assert listing_public_state({"moderation_status": "expired"}, today) == "expired"


def test_verification_summary_never_trusts_badges_or_paid_flag():
    unverified = verification_summary(None)
    assert unverified["status"] == "unverified"
    assert unverified["checks"]["government_id"] == "not_submitted"
    pending = verification_summary({"email_verified": True, "id_status": "pending", "fully_verified": False})
    assert pending["status"] == "pending"
    verified = verification_summary({"email_verified": True, "phone_verified": True, "id_status": "approved", "fully_verified": True, "id_reviewed_at": "2026-06-01"})
    assert verified["status"] == "verified"
    assert verified["verified_at"] == "2026-06-01"
    assert "guarantee" in verified["disclaimer"].lower()
    # A profile with a "Verified host" badge and verified=True but no ID check
    owner = to_public_owner({"id": "o", "public_id": "p", "name": "N", "badges": ["Verified host", "Superhost"], "verified": True}, None)
    assert owner["verification"]["status"] == "unverified"
    assert owner["achievement_badges"] == ["Superhost"]
    assert "verified" not in owner


def test_public_badges_drop_trust_vocabulary():
    assert public_badges(["Verified host", "ID checked", "Trusted", "Superhost", "Made up"]) == ["Superhost"]
