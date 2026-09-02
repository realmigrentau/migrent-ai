from datetime import date, timedelta

from public_dto import assert_no_forbidden_fields
from tests.conftest import (
    LISTING_DRAFT,
    LISTING_EXPIRED,
    LISTING_FUTURE,
    LISTING_HIDDEN,
    LISTING_LIVE,
    LISTING_UNVERIFIED,
    OWNER_ID,
    SEEKER_ID,
    VERIFIED_OWNER_ID,
    auth,
)


def test_search_only_returns_public_rows_and_no_private_fields(client):
    r = client.get("/listings/search?limit=50")
    assert r.status_code == 200
    ids = {row["id"] for row in r.json()}
    assert LISTING_LIVE in ids
    assert LISTING_UNVERIFIED in ids  # approved today; the migration trigger + admin script demote it
    assert LISTING_EXPIRED not in ids, "expired inventory must never appear in search"
    assert LISTING_DRAFT not in ids
    assert LISTING_HIDDEN not in ids
    assert assert_no_forbidden_fields(r.json()) == []
    assert r.headers["X-Total-Count"].isdigit()
    for row in r.json():
        assert row["display_address"] == "Kellyville 2155"
        assert "owner" in row and "verification" in row["owner"]


def test_search_move_in_date_filters_by_availability(client):
    # Future room is only available from +30 days; a move-in tomorrow excludes it.
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    r = client.get(f"/listings/search?check_in={tomorrow}&limit=50")
    ids = {row["id"] for row in r.json()}
    assert LISTING_LIVE in ids
    assert LISTING_FUTURE not in ids
    later = (date.today() + timedelta(days=45)).isoformat()
    ids = {row["id"] for row in client.get(f"/listings/search?check_in={later}&limit=50").json()}
    assert LISTING_FUTURE in ids
    # A move-out beyond the live room's window excludes it.
    far = (date.today() + timedelta(days=200)).isoformat()
    ids = {row["id"] for row in client.get(f"/listings/search?check_in={later}&check_out={far}&limit=50").json()}
    assert LISTING_LIVE not in ids


def test_search_rejects_impossible_dates(client):
    a = (date.today() + timedelta(days=10)).isoformat()
    b = (date.today() + timedelta(days=5)).isoformat()
    assert client.get(f"/listings/search?check_in={a}&check_out={b}").status_code == 400
    assert client.get("/listings/search?check_in=not-a-date").status_code == 400
    assert client.get("/listings/search?postcode=12").status_code == 400
    assert client.get("/listings/search?min_price=500&max_price=100").status_code == 400


def test_search_verified_owner_filter_uses_owner_verification(client, db):
    r = client.get("/listings/search?verified_owner=true&limit=50")
    ids = {row["id"] for row in r.json()}
    assert LISTING_LIVE in ids
    assert LISTING_UNVERIFIED not in ids
    # Giving the unverified owner a "Verified host" badge and verified=True changes nothing.
    for p in db.rows("profiles"):
        if p["id"] == OWNER_ID:
            p["verified"] = True
    r = client.get("/listings/search?verified_owner=true&limit=50")
    assert LISTING_UNVERIFIED not in {row["id"] for row in r.json()}


def test_anonymous_detail_has_public_contract_only(client):
    r = client.get(f"/listings/{LISTING_LIVE}?include=reviews,similar")
    assert r.status_code == 200
    body = r.json()
    assert assert_no_forbidden_fields(body) == []
    assert body["public_state"] == "published"
    assert body["viewer"] == {"is_owner": False, "can_moderate": False}
    assert body["owner"]["public_id"] == "pubverif02"
    assert body["owner"]["verification"]["status"] == "verified"
    assert body["location"]["precision"] == "approximate"
    assert "latitude" not in body and "owner_id" not in body


def test_expired_listing_is_honest_not_404(client):
    r = client.get(f"/listings/{LISTING_EXPIRED}")
    assert r.status_code == 410
    body = r.json()
    assert body["public_state"] == "expired"
    assert assert_no_forbidden_fields(body) == []


def test_draft_and_hidden_are_404_for_public(client):
    assert client.get(f"/listings/{LISTING_DRAFT}").status_code == 404
    assert client.get(f"/listings/{LISTING_HIDDEN}").status_code == 404
    assert client.get(f"/listings/{LISTING_DRAFT}", headers=auth(SEEKER_ID)).status_code == 404


def test_owner_sees_street_address_and_exact_pin(client):
    r = client.get(f"/listings/{LISTING_LIVE}", headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 200
    body = r.json()
    assert body["viewer"]["is_owner"] is True
    assert body["street_address"] == "12 Example Street"
    assert body["exact_location"] == {"lat": -33.7139, "lng": 150.9501}
    assert body["moderation_status"] == "approved"
    # Even the owner does not receive spam internals or moderator identity.
    assert "spam_score" not in body and "moderator_id" not in body


def test_other_user_cannot_see_owner_view(client):
    r = client.get(f"/listings/{LISTING_LIVE}", headers=auth(SEEKER_ID))
    assert r.status_code == 200
    body = r.json()
    assert body["viewer"]["is_owner"] is False
    assert "street_address" not in body and "exact_location" not in body
    assert assert_no_forbidden_fields(body) == []


def test_unverified_owner_is_never_shown_as_verified(client):
    r = client.get(f"/listings/{LISTING_UNVERIFIED}")
    body = r.json()
    assert body["owner"]["verification"]["status"] == "unverified"
    assert body["owner"]["achievement_badges"] == []  # "Verified host" stripped
    assert "verified" not in body["owner"]
