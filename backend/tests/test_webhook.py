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


MENTOR_SESSION_ID = "mmmmmmmm-mmmm-4mmm-8mmm-mmmmmmmmmmm1"
MENTOR_CHECKOUT = "cs_test_mentor"


@pytest.fixture()
def mentor_wired(wired, monkeypatch):
    db, sent = wired
    db.seed("mentors", [{"id": "mentor-1", "user_id": VERIFIED_OWNER_ID, "suburb": "Parramatta", "active": True, "hourly_rate": 3000}])
    db.seed(
        "mentor_sessions",
        [{"id": MENTOR_SESSION_ID, "mentor_id": "mentor-1", "seeker_id": SEEKER_ID, "amount": 3000, "platform_fee": 900,
          "mentor_payout": 2100, "status": "PENDING", "stripe_session_id": MENTOR_CHECKOUT, "session_type": "video_call", "suburb": "Parramatta"}],
    )
    pushed = []
    import routes_mentors

    monkeypatch.setattr(routes_mentors, "send_push_to_user", lambda **k: pushed.append(k))
    return db, pushed


def _mentor_event(event_id="evt_m1", *, amount=3000, session_id=MENTOR_CHECKOUT):
    return _event(event_id, amount=amount, session_id=session_id, metadata={"mentor_session_id": MENTOR_SESSION_ID, "fee_type": "mentor_session"})


def _mentor_row(db):
    return next(r for r in db.rows("mentor_sessions") if r["id"] == MENTOR_SESSION_ID)


def test_mentor_session_becomes_paid_only_through_the_webhook(client, mentor_wired):
    db, pushed = mentor_wired
    r = post(client, _mentor_event())
    assert r.status_code == 200 and r.json()["status"] == "ok", r.text
    assert _mentor_row(db)["status"] == "PAID"
    assert len(pushed) == 1
    # A retry of the same event changes nothing and does not notify again.
    post(client, _mentor_event())
    assert len(pushed) == 1


def test_mentor_session_rejects_wrong_amount_and_foreign_checkout(client, mentor_wired):
    db, pushed = mentor_wired
    assert post(client, _mentor_event("evt_m2", amount=100)).json()["status"] == "rejected"
    assert post(client, _mentor_event("evt_m3", session_id="cs_test_other")).json()["status"] == "rejected"
    assert _mentor_row(db)["status"] == "PENDING"
    assert pushed == []


def test_creating_a_mentor_checkout_does_not_mark_it_paid(client, db, monkeypatch):
    import routes_mentors

    db.seed("mentors", [{"id": "mentor-2", "user_id": VERIFIED_OWNER_ID, "suburb": "Ryde", "active": True, "hourly_rate": 2500,
                         "stripe_account_id": "acct_mentor2", "stripe_onboarding_complete": True}])

    class Checkout:
        id = "cs_test_m"
        url = "https://checkout.stripe.test/cs_test_m"

    created = {}

    def create(**k):
        created.update(k)
        return Checkout()

    monkeypatch.setattr(routes_mentors.stripe.checkout.Session, "create", staticmethod(create))
    pushed = []
    monkeypatch.setattr(routes_mentors, "send_push_to_user", lambda **k: pushed.append(k))
    from tests.conftest import auth

    r = client.post("/mentors/sessions", json={"mentor_id": "mentor-2", "suburb": "Ryde", "session_type": "video_call"}, headers=auth(SEEKER_ID))
    assert r.status_code == 200, r.text
    assert r.json()["session"]["checkout_url"] == Checkout.url
    row = next(x for x in db.rows("mentor_sessions") if x["mentor_id"] == "mentor-2")
    assert row["status"] == "PENDING"
    assert row["stripe_session_id"] == "cs_test_m"
    assert pushed == []
    # The mentor's 70% goes to their own Stripe account; Migrent keeps 30%.
    pi = created["payment_intent_data"]
    assert pi["transfer_data"] == {"destination": "acct_mentor2"}
    assert pi["application_fee_amount"] == 750
    assert pi["metadata"]["mentor_session_id"] == row["id"]


def test_mentor_without_payouts_cannot_be_booked(client, db, monkeypatch):
    import routes_mentors

    db.seed("mentors", [{"id": "mentor-3", "user_id": VERIFIED_OWNER_ID, "suburb": "Ryde", "active": True, "hourly_rate": 2500}])
    called = []
    monkeypatch.setattr(routes_mentors.stripe.checkout.Session, "create", staticmethod(lambda **k: called.append(k)))
    from tests.conftest import auth

    r = client.post("/mentors/sessions", json={"mentor_id": "mentor-3", "suburb": "Ryde", "session_type": "video_call"}, headers=auth(SEEKER_ID))
    assert r.status_code == 400
    assert "setting up payouts" in r.json()["detail"]
    assert called == []
    assert not [x for x in db.rows("mentor_sessions") if x["mentor_id"] == "mentor-3"]


def test_public_mentor_pages_hide_the_stripe_account(client, db):
    db.seed("mentors", [{"id": "mentor-4", "user_id": VERIFIED_OWNER_ID, "suburb": "Ryde", "active": True, "hourly_rate": 2500,
                         "rating": 5, "stripe_account_id": "acct_secret", "stripe_onboarding_complete": True}])
    detail = client.get("/mentors/mentor-4").json()
    assert "stripe_account_id" not in detail and detail["accepting_bookings"] is True
    listed = client.get("/mentors").json()["mentors"]
    assert listed and all("stripe_account_id" not in m for m in listed)


def test_payout_status_asks_stripe_and_remembers(client, db, monkeypatch):
    import routes_mentors

    db.seed("mentors", [{"id": "mentor-5", "user_id": VERIFIED_OWNER_ID, "suburb": "Ryde", "active": True, "hourly_rate": 2500,
                         "stripe_account_id": "acct_m5", "stripe_onboarding_complete": False}])
    monkeypatch.setattr(routes_mentors.stripe.Account, "retrieve", staticmethod(lambda acct: {"id": acct, "payouts_enabled": True, "capabilities": {"transfers": "active"}}))
    from tests.conftest import auth

    r = client.get("/mentors/me/payout-status", headers=auth(VERIFIED_OWNER_ID))
    assert r.json() == {"has_account": True, "ready": True}
    assert next(m for m in db.rows("mentors") if m["id"] == "mentor-5")["stripe_onboarding_complete"] is True


def test_refunding_a_mentor_session_reverses_the_mentor_share(client, mentor_wired, monkeypatch):
    db, _ = mentor_wired
    reversals = []
    monkeypatch.setattr(routes_deals.stripe.Transfer, "retrieve", staticmethod(lambda tid: {"id": tid, "amount": 2100, "amount_reversed": 0}))
    monkeypatch.setattr(routes_deals.stripe.Transfer, "create_reversal", staticmethod(lambda tid, **k: reversals.append((tid, k["amount"]))))
    event = {"id": "evt_mref", "type": "charge.refunded", "data": {"object": {
        "id": "ch_1", "object": "charge", "amount": 3000, "amount_refunded": 3000, "currency": "aud",
        "payment_intent": "pi_m", "transfer": "tr_1", "metadata": {"mentor_session_id": MENTOR_SESSION_ID, "fee_type": "mentor_session"}}}}
    r = post(client, event)
    assert r.json()["transfer_reversed"] is True
    assert reversals == [("tr_1", 2100)]
    assert _mentor_row(db)["status"] == "REFUNDED"
