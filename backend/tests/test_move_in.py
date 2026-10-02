"""
Move-in payments (move_in.py): the renter pays the rent in advance straight
to the owner, a green light and three receipts with one security code, and
Migrent's AUD 99 fee charged to the owner's saved card for a new renter only.
Stripe is faked throughout; nothing here talks to Stripe.
"""

import json
import re

import pytest
import stripe

import move_in
import routes_deals
from tests.conftest import ADMIN_ID, LISTING_LIVE, OTHER_ID, SEEKER_ID, VERIFIED_OWNER_ID, auth

TENANCY = "77777777-7777-4777-8777-777777777777"
TENANCY_2 = "77777777-7777-4777-8777-777777777778"


class Obj(dict):
    """A Stripe object: a dict with attribute access."""

    def __getattr__(self, name):
        try:
            return self[name]
        except KeyError as e:
            raise AttributeError(name) from e


@pytest.fixture
def stripe_fake(db, monkeypatch):
    monkeypatch.setenv("MOVE_IN_PAYMENTS_ENABLED", "true")
    calls = {"checkouts": [], "fees": [], "fee_fails": 0}
    sent = []

    def checkout_create(**k):
        calls["checkouts"].append(k)
        n = len(calls["checkouts"])
        return Obj(id=f"cs_move_{n}", url=f"https://checkout.stripe.test/cs_move_{n}")

    def fee_create(**k):
        calls["fees"].append(k)
        if calls["fee_fails"]:
            calls["fee_fails"] -= 1
            raise stripe.error.CardError("Your card was declined.", None, "card_declined")
        return Obj(id=f"pi_fee_{len(calls['fees'])}", status="succeeded")

    monkeypatch.setattr(move_in.stripe.checkout.Session, "create", staticmethod(checkout_create))
    monkeypatch.setattr(move_in.stripe.PaymentIntent, "create", staticmethod(fee_create))

    import email_bookings

    monkeypatch.setattr(email_bookings, "_send_email", lambda to, subject, html, text="", headers=None: sent.append({"to": to, "subject": subject, "html": html}))
    monkeypatch.setenv("SUPPORT_EMAIL", "support@example.com")

    def construct(payload, sig, secret):
        return json.loads(payload)

    monkeypatch.setattr(routes_deals.stripe.Webhook, "construct_event", staticmethod(construct))

    for p in db.rows("profiles"):
        if p["id"] == VERIFIED_OWNER_ID:
            p.update({"stripe_account_id": "acct_owner", "stripe_payouts_ready": True, "stripe_customer_id": "cus_owner", "fee_payment_method_id": "pm_card", "fee_card_label": "Visa ending 4242", "phone": "0400 000 000"})
    for listing in db.rows("listings"):
        if listing["id"] == LISTING_LIVE:
            listing["rent_in_advance_weeks"] = 2
    db.seed(
        "tenancies",
        [
            {"id": TENANCY, "listing_id": LISTING_LIVE, "owner_id": VERIFIED_OWNER_ID, "renter_id": SEEKER_ID, "status": "upcoming", "start_date": "2026-11-01", "rent_amount": 300, "rent_frequency": "weekly"},
            {"id": TENANCY_2, "listing_id": LISTING_LIVE, "owner_id": VERIFIED_OWNER_ID, "renter_id": SEEKER_ID, "status": "upcoming", "start_date": "2027-11-01", "rent_amount": 300, "rent_frequency": "weekly"},
        ],
    )
    return calls, sent


def pay(client, db, tenancy=TENANCY, event_id="evt_move_1", amount=None):
    r = client.post(f"/hub/tenancies/{tenancy}/move-in/checkout", headers=auth(SEEKER_ID))
    assert r.status_code == 200, r.text
    row = next(m for m in db.rows("move_in_payments") if m["tenancy_id"] == tenancy and m["status"] == "pending")
    event = {
        "id": event_id,
        "type": "checkout.session.completed",
        "data": {"object": {"id": row["stripe_session_id"], "object": "checkout.session", "amount_total": amount or row["amount_cents"], "currency": "aud", "payment_status": "paid", "payment_intent": f"pi_{event_id}", "metadata": {"fee_type": "move_in", "move_in_id": row["id"], "tenancy_id": tenancy}}},
    }
    return client.post("/webhooks/stripe", content=json.dumps(event), headers={"stripe-signature": "valid", "content-type": "application/json"})


def test_rent_in_advance_goes_straight_to_the_owner(client, db, stripe_fake):
    calls, _ = stripe_fake
    pay(client, db)
    k = calls["checkouts"][0]
    rent, fee = k["line_items"][0]["price_data"]["unit_amount"], k["line_items"][1]["price_data"]["unit_amount"]
    assert rent == 60000  # 2 weeks at $300
    assert k["payment_intent_data"]["transfer_data"]["destination"] == "acct_owner"
    assert k["payment_intent_data"]["on_behalf_of"] == "acct_owner"
    # The renter pays the card fee on top; it covers Stripe's cut of the
    # whole payment, so the owner receives the full rent.
    assert k["payment_intent_data"]["application_fee_amount"] == fee == move_in.card_fee_cents(60000)
    stripe_cut = (rent + fee) * move_in.CARD_FEE_PERCENT / 100 + move_in.CARD_FEE_FIXED_CENTS
    assert 0 <= fee - stripe_cut < 2
    row = db.rows("move_in_payments")[0]
    assert row["amount_cents"] == rent + fee


def test_the_green_light_gives_three_receipts_with_one_code(client, db, stripe_fake):
    _, sent = stripe_fake
    r = pay(client, db)
    assert r.json()["status"] == "ok", r.text
    row = db.rows("move_in_payments")[0]
    assert row["status"] == "paid"
    code = row["receipt_code"]
    assert re.fullmatch(r"[A-HJ-NP-Z2-9]{10}", code)

    renter = client.get(f"/hub/tenancies/{TENANCY}/receipt", headers=auth(SEEKER_ID)).json()
    owner = client.get(f"/hub/tenancies/{TENANCY}/receipt", headers=auth(VERIFIED_OWNER_ID)).json()
    assert renter["receipt_code"] == owner["receipt_code"] == code
    assert renter["owner"]["phone"] == "0400 000 000" and "fee" not in renter
    assert owner["renter"]["email"] == "seeker@example.com" and owner["fee"]["status"] == "charged"
    assert "bond" in renter["bond_note"].lower()
    # The renter's and the owner's receipts are emailed, with the code.
    receipts = [e for e in sent if code in e["html"]]
    assert {e["subject"] for e in receipts} == {"Your move-in receipt", "Your renter's payment receipt"}
    # And the payment is in the rent ledger.
    assert any(p["tenancy_id"] == TENANCY and p["method"] == "provider" and p["status"] == "paid" and p["amount_paid"] == 600 for p in db.rows("rent_payments"))

    # Migrent's receipt is complete once both sides confirm.
    client.post(f"/hub/tenancies/{TENANCY}/move-in/confirm", headers=auth(VERIFIED_OWNER_ID))
    assert client.get(f"/hub/admin/move-ins/{row['id']}", headers=auth(ADMIN_ID)).json()["complete"] is False
    client.post(f"/hub/tenancies/{TENANCY}/move-in/confirm", headers=auth(SEEKER_ID))
    admin = client.get(f"/hub/admin/move-ins/{row['id']}", headers=auth(ADMIN_ID)).json()
    assert admin["complete"] is True and admin["receipt_code"] == code
    assert any(e["subject"] == f"Move-in complete: {code}" for e in sent)


def test_the_fee_is_charged_once_per_new_renter(client, db, stripe_fake):
    calls, _ = stripe_fake
    pay(client, db)
    assert len(calls["fees"]) == 1 and calls["fees"][0]["amount"] == 9900 and calls["fees"][0]["off_session"] is True
    # The same renter's next tenancy with the same owner: no second fee.
    pay(client, db, tenancy=TENANCY_2, event_id="evt_move_2")
    assert len(calls["fees"]) == 1
    second = next(m for m in db.rows("move_in_payments") if m["tenancy_id"] == TENANCY_2)
    assert second["fee_status"] == "not_due"


def test_a_declined_fee_card_is_retried_after_the_owner_updates_it(client, db, stripe_fake):
    calls, _ = stripe_fake
    calls["fee_fails"] = 1
    pay(client, db)
    row = db.rows("move_in_payments")[0]
    assert row["fee_status"] == "failed" and "declined" in row["fee_error"]
    assert any(n.get("type") == "move_in_fee_failed" for n in db.rows("notifications"))
    r = client.post(f"/hub/tenancies/{TENANCY}/move-in/fee", headers=auth(VERIFIED_OWNER_ID))
    assert r.json()["payment"]["fee_status"] == "charged"


def test_a_webhook_with_the_wrong_amount_changes_nothing(client, db, stripe_fake):
    r = pay(client, db, amount=100)
    assert r.json()["status"] == "rejected"
    assert db.rows("move_in_payments")[0]["status"] == "pending"


def test_only_the_renter_pays_and_only_when_the_owner_is_set_up(client, db, stripe_fake):
    assert client.post(f"/hub/tenancies/{TENANCY}/move-in/checkout", headers=auth(VERIFIED_OWNER_ID)).status_code == 403
    assert client.post(f"/hub/tenancies/{TENANCY}/move-in/checkout", headers=auth(OTHER_ID)).status_code == 404
    for p in db.rows("profiles"):
        if p["id"] == VERIFIED_OWNER_ID:
            p["fee_payment_method_id"] = None
    assert client.post(f"/hub/tenancies/{TENANCY}/move-in/checkout", headers=auth(SEEKER_ID)).status_code == 409


def test_no_receipt_before_payment_and_admin_list_needs_the_panel(client, db, stripe_fake):
    assert client.get(f"/hub/tenancies/{TENANCY}/receipt", headers=auth(SEEKER_ID)).status_code == 404
    assert client.get("/hub/admin/move-ins", headers=auth(ADMIN_ID, unlocked=False)).status_code == 423


def test_switched_off_by_default(client, db, monkeypatch):
    monkeypatch.delenv("MOVE_IN_PAYMENTS_ENABLED", raising=False)
    assert client.get("/hub/payouts", headers=auth(VERIFIED_OWNER_ID)).json() == {"enabled": False}
    assert client.post("/hub/payouts/onboard", headers=auth(VERIFIED_OWNER_ID)).status_code == 503
