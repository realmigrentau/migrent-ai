from datetime import date, timedelta

import pytest

from tests.conftest import LISTING_EXPIRED, LISTING_FUTURE, LISTING_LIVE, SEEKER_ID, VERIFIED_OWNER_ID, auth


@pytest.fixture()
def no_stripe(monkeypatch):
    import routes_bookings

    class FakeSession:
        id = "cs_test_new"
        url = "https://checkout.stripe.test/cs_test_new"

    monkeypatch.setattr(routes_bookings, "create_owner_fee_checkout", lambda booking_id: FakeSession())
    monkeypatch.setattr(routes_bookings, "send_booking_request_to_owner", lambda **k: None)
    monkeypatch.setattr(routes_bookings, "send_owner_fee_request", lambda **k: None)
    monkeypatch.setattr(routes_bookings, "send_booking_confirmed_to_both", lambda **k: None)
    monkeypatch.setattr(routes_bookings, "send_push_to_user", lambda **k: None)
    monkeypatch.setattr(routes_bookings, "notify", lambda **k: None)


def _dates(offset=5, nights=28):
    a = date.today() + timedelta(days=offset)
    return a.isoformat(), (a + timedelta(days=nights)).isoformat()


def test_cannot_book_expired_listing(client, no_stripe):
    ci, co = _dates()
    r = client.post("/bookings", json={"listing_id": LISTING_EXPIRED, "check_in": ci, "check_out": co, "guests": 1}, headers=auth(SEEKER_ID))
    assert r.status_code == 404


def test_cannot_book_outside_availability_window(client, no_stripe):
    ci, co = _dates(offset=2, nights=7)
    r = client.post("/bookings", json={"listing_id": LISTING_FUTURE, "check_in": ci, "check_out": co, "guests": 1}, headers=auth(SEEKER_ID))
    assert r.status_code == 400
    assert "not available until" in r.json()["detail"]
    ci, co = _dates(offset=5, nights=300)
    r = client.post("/bookings", json={"listing_id": LISTING_LIVE, "check_in": ci, "check_out": co, "guests": 1}, headers=auth(SEEKER_ID))
    assert r.status_code == 400
    assert "only available until" in r.json()["detail"]


def test_request_to_book_returns_no_checkout_to_seeker(client, no_stripe):
    ci, co = _dates()
    r = client.post("/bookings", json={"listing_id": LISTING_LIVE, "check_in": ci, "check_out": co, "guests": 1}, headers=auth(SEEKER_ID))
    assert r.status_code == 200, r.text
    assert r.json()["checkout_url"] is None
    assert r.json()["booking"]["seeker_fee"] == 0


def test_second_booking_on_paid_property_waives_fee(client, no_stripe, db):
    ci, co = _dates()
    r = client.post("/bookings", json={"listing_id": LISTING_LIVE, "check_in": ci, "check_out": co, "guests": 1}, headers=auth(SEEKER_ID))
    booking_id = r.json()["booking"]["id"]
    # First acceptance: fee due, host gets a checkout link.
    r = client.post(f"/bookings/{booking_id}/respond", json={"action": "accept"}, headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 200 and r.json()["checkout_url"]
    # Pretend the webhook settled the property fee.
    for l in db.rows("listings"):
        if l["id"] == LISTING_LIVE:
            l["listing_fee_paid_at"] = "2026-09-01T00:00:00+00:00"
    for b in db.rows("bookings"):
        if b["id"] == booking_id:
            b["status"] = "PAID"
    ci2, co2 = _dates(offset=60, nights=14)
    from tests.conftest import OTHER_ID

    r = client.post("/bookings", json={"listing_id": LISTING_LIVE, "check_in": ci2, "check_out": co2, "guests": 1}, headers=auth(OTHER_ID))
    second = r.json()["booking"]["id"]
    r = client.post(f"/bookings/{second}/respond", json={"action": "accept"}, headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 200
    assert r.json()["checkout_url"] is None and r.json()["fee_waived"] is True
    assert r.json()["status"] == "PAID"
