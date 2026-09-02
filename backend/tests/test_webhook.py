import json

import pytest
import stripe

import routes_deals
from tests.conftest import LISTING_LIVE, SEEKER_ID, VERIFIED_OWNER_ID

BOOKING_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb9"
SESSION_ID = "cs_test_realsession"


def _event(event_id="evt_1", *, amount=9900, currency="aud", session_id=SESSION_ID, booking_id=BOOKING_ID, status="paid", event_type="checkout.session.completed", metadata=None):
    return {
        "id": event_id,
        "type": event_type,
        "data": {
            "object": {
                "id": session_id,
                "object": "checkout.session",
                "amount_total": amount,
                "currency": currency,
                "payment_status": status,
                "payment_intent": "pi_123",
                "metadata": metadata if metadata is not None else {"booking_id": booking_id, "fee_type": "booking", "payer": "owner"},
            }
        },
    }


@pytest.fixture()
def wired(db, monkeypatch):
    db.seed(
        "bookings",
        [
            {
                "id": BOOKING_ID, "listing_id": LISTING_LIVE, "owner_id": VERIFIED_OWNER_ID, "seeker_id": SEEKER_ID,
                "status": "OWNER_ACCEPTED", "check_in_date": "2026-10-01", "check_out_date": "2026-11-01",
                "guests": 1, "weekly_price_at_time": 300, "total_price": 1500, "stripe_session_id": SESSION_ID,
            }
        ],
    )
    sent = []

    import email_bookings

    monkeypatch.setattr(email_bookings, "_send_email", lambda *a, **k: sent.append(a))

    def construct(payload, sig, secret):
        if sig != "valid":
            raise stripe.error.SignatureVerificationError("bad sig", sig)
        return json.loads(payload)

    monkeypatch.setattr(routes_deals.stripe.Webhook, "construct_event", staticmethod(construct))

    # Make the fake enforce the unique index on stripe_event_id.
    def unique_event(row, table):
        if row.get("stripe_event_id") and any(r.get("stripe_event_id") == row["stripe_event_id"] for r in table):
            raise RuntimeError('duplicate key value violates unique constraint "payment_events_stripe_event_id_key" (23505)')

    db.insert_hooks.setdefault("payment_events", []).append(unique_event)
    return db, sent


def post(client, event, sig="valid"):
    return client.post("/webhooks/stripe", content=json.dumps(event), headers={"stripe-signature": sig, "content-type": "application/json"})


def _booking(db):
    return next(b for b in db.rows("bookings") if b["id"] == BOOKING_ID)


def test_unsigned_request_is_rejected(client, wired):
    r = post(client, _event(), sig="forged")
    assert r.status_code == 400
    assert _booking(wired[0])["status"] == "OWNER_ACCEPTED"


def test_valid_payment_marks_booking_paid_once(client, wired):
    db, sent = wired
    r = post(client, _event("evt_ok"))
    assert r.status_code == 200 and r.json()["status"] == "ok"
    assert _booking(db)["status"] == "PAID"
    assert len(sent) == 2  # owner + seeker confirmation
    listing = next(l for l in db.rows("listings") if l["id"] == LISTING_LIVE)
    assert listing["listing_fee_paid_at"] is not None


def test_duplicate_event_is_ignored_and_sends_no_second_email(client, wired):
    db, sent = wired
    post(client, _event("evt_dup"))
    n = len(sent)
    r = post(client, _event("evt_dup"))
    assert r.json()["status"] == "duplicate"
    assert len(sent) == n
    assert len([e for e in db.rows("payment_events") if e.get("stripe_event_id") == "evt_dup"]) == 1


def test_forged_amount_is_rejected(client, wired):
    db, _ = wired
    r = post(client, _event("evt_cheap", amount=100))
    assert r.json()["status"] == "rejected"
    assert _booking(db)["status"] == "OWNER_ACCEPTED"
    r = post(client, _event("evt_usd", currency="usd"))
    assert r.json()["status"] == "rejected"
    r = post(client, _event("evt_unpaid", status="unpaid"))
    assert r.json()["status"] == "rejected"


def test_stale_or_foreign_session_cannot_activate_booking(client, wired):
    db, _ = wired
    r = post(client, _event("evt_stale", session_id="cs_test_somebody_else"))
    assert r.json()["status"] == "rejected"
    assert "belong" in r.json()["reason"]
    assert _booking(db)["status"] == "OWNER_ACCEPTED"


def test_unknown_booking_is_rejected(client, wired):
    r = post(client, _event("evt_ghost", booking_id="bbbbbbbb-bbbb-4bbb-8bbb-000000000000"))
    assert r.json()["status"] == "rejected"


def test_refund_moves_booking_to_refunded(client, wired):
    db, _ = wired
    post(client, _event("evt_pay"))
    assert _booking(db)["status"] == "PAID"
    refund = {"id": "evt_refund", "type": "charge.refunded", "data": {"object": {"id": "ch_1", "payment_intent": "pi_123", "amount_refunded": 9900, "currency": "aud"}}}
    r = post(client, refund)
    assert r.json()["status"] == "ok"
    assert _booking(db)["status"] == "REFUNDED"


def test_success_page_reads_webhook_truth(client, wired):
    from tests.conftest import auth

    db, _ = wired
    r = client.get(f"/bookings/checkout-status?session_id={SESSION_ID}", headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 200 and r.json()["paid"] is False
    post(client, _event("evt_pay2"))
    r = client.get(f"/bookings/checkout-status?session_id={SESSION_ID}", headers=auth(VERIFIED_OWNER_ID))
    assert r.json()["paid"] is True
    # Someone else cannot query it.
    from tests.conftest import OTHER_ID

    assert client.get(f"/bookings/checkout-status?session_id={SESSION_ID}", headers=auth(OTHER_ID)).status_code == 403
