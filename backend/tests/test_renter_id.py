"""
The paid renter ID check (renter_id.py): AUD 19, then Stripe Identity's
document and selfie check, up to three tries (no refund if all fail), and the
green badge owners see. Stripe is faked throughout.
"""

import json

import pytest

import renter_id
import routes_deals
from tests.conftest import LISTING_LIVE, SEEKER_ID, VERIFIED_OWNER_ID, auth
from tests.test_hub import start_and_submit
from tests.test_move_in import Obj


@pytest.fixture
def stripe_fake(db, monkeypatch):
    monkeypatch.setenv("SEEKER_VERIFICATION_ENABLED", "true")
    calls = {"checkouts": [], "sessions": [], "cancelled": [], "refunds": [], "retrieved_paid": True}

    def checkout_create(**k):
        calls["checkouts"].append(k)
        return Obj(id=f"cs_id_{len(calls['checkouts'])}", url="https://checkout.stripe.test/id")

    def checkout_retrieve(sid):
        return Obj(id=sid, payment_status="paid" if calls["retrieved_paid"] else "unpaid", amount_total=1900, currency="aud", payment_intent="pi_direct", metadata={"user_id": SEEKER_ID})

    def vs_create(**k):
        calls["sessions"].append(k)
        return Obj(id=f"vs_{len(calls['sessions'])}", url=f"https://verify.stripe.test/vs_{len(calls['sessions'])}")

    def vs_retrieve(sid, expand=None):
        return Obj(id=sid, verified_outputs={"first_name": "Sam", "last_name": "Seeker"}, last_verification_report={"document": {"type": "passport", "issuing_country": "IN"}})

    monkeypatch.setattr(renter_id.stripe.checkout.Session, "create", staticmethod(checkout_create))
    monkeypatch.setattr(renter_id.stripe.checkout.Session, "retrieve", staticmethod(checkout_retrieve))
    monkeypatch.setattr(renter_id.stripe.identity.VerificationSession, "create", staticmethod(vs_create))
    monkeypatch.setattr(renter_id.stripe.identity.VerificationSession, "retrieve", staticmethod(vs_retrieve))
    monkeypatch.setattr(renter_id.stripe.identity.VerificationSession, "cancel", staticmethod(lambda sid: calls["cancelled"].append(sid)))
    monkeypatch.setattr(renter_id.stripe.Refund, "create", staticmethod(lambda **k: calls["refunds"].append(k)))
    monkeypatch.setattr(routes_deals.stripe.Webhook, "construct_event", staticmethod(lambda payload, sig, secret: json.loads(payload)))
    import notification_service

    monkeypatch.setattr(notification_service, "notify", lambda **kw: None)
    return calls


def hook(client, event):
    return client.post("/webhooks/stripe", content=json.dumps(event), headers={"stripe-signature": "valid", "content-type": "application/json"})


def pay(client, user=SEEKER_ID, event_id="evt_id_pay"):
    r = client.post("/hub/id-check/checkout", headers=auth(user))
    assert r.status_code == 200, r.text
    session = {"id": "cs_id_1", "object": "checkout.session", "amount_total": 1900, "currency": "aud", "payment_status": "paid", "payment_intent": "pi_id", "metadata": {"user_id": user, "purpose": "verification"}}
    return hook(client, {"id": event_id, "type": "checkout.session.completed", "data": {"object": session}})


def identity(client, kind, session_id="vs_1", error=None, event_id=None, user=SEEKER_ID):
    obj = {"id": session_id, "object": "identity.verification_session", "status": kind, "metadata": {"user_id": user, "purpose": "renter_id"}, "last_error": {"code": error} if error else None}
    return hook(client, {"id": event_id or f"evt_{session_id}_{kind}_{error}", "type": f"identity.verification_session.{kind}", "data": {"object": obj}})


def status(client, user=SEEKER_ID):
    return client.get("/hub/id-check", headers=auth(user)).json()


def test_switched_off_by_default(client, monkeypatch):
    monkeypatch.delenv("SEEKER_VERIFICATION_ENABLED", raising=False)
    assert status(client)["available"] is False
    assert client.post("/hub/id-check/checkout", headers=auth(SEEKER_ID)).status_code == 503
    assert client.post("/payments/create-verification-session", headers=auth(SEEKER_ID)).status_code == 410


def test_pay_then_check_then_the_green_badge(client, db, stripe_fake):
    assert client.post("/hub/id-check/start", headers=auth(SEEKER_ID)).status_code == 402
    assert pay(client).json()["verification"] is True
    s = status(client)
    assert s["paid"] and s["can_start"] and s["tries_left"] == 3

    r = client.post("/hub/id-check/start", headers=auth(SEEKER_ID))
    assert r.status_code == 200 and r.json()["url"].startswith("https://verify.stripe.test/")
    opts = stripe_fake["sessions"][0]["options"]["document"]
    assert opts["require_matching_selfie"] and opts["require_live_capture"]

    assert identity(client, "processing").json()["id_check"] == "pending"
    assert identity(client, "verified").json()["id_check"] == "verified"
    row = db.rows("renter_verifications")[0]
    assert row["status"] == "verified" and row["verified_name"] == "Sam Seeker" and row["document_country"] == "IN"
    assert status(client)["status"] == "verified"
    # Paying again is refused.
    assert client.post("/hub/id-check/checkout", headers=auth(SEEKER_ID)).status_code == 409


def test_owners_see_the_badge_live_and_can_filter(client, db, stripe_fake):
    app_id = start_and_submit(client)
    apps = client.get("/hub/applications", headers=auth(VERIFIED_OWNER_ID)).json()["applications"]
    assert apps[0]["id_verified"] is False
    assert client.get("/hub/applications?id_verified=true", headers=auth(VERIFIED_OWNER_ID)).json()["applications"] == []

    # Verified after applying: the application they already sent shows it.
    pay(client)
    client.post("/hub/id-check/start", headers=auth(SEEKER_ID))
    identity(client, "verified")
    apps = client.get("/hub/applications?id_verified=true", headers=auth(VERIFIED_OWNER_ID)).json()["applications"]
    assert [a["id"] for a in apps] == [app_id] and apps[0]["id_verified"] is True
    detail = client.get(f"/hub/applications/{app_id}", headers=auth(VERIFIED_OWNER_ID)).json()
    assert detail["renter"]["id_verified"] is True and detail["snapshot"]["verification"] == "verified"


def test_three_failed_tries_use_up_the_fee_without_a_refund(client, db, stripe_fake):
    pay(client)
    for n in (1, 2):
        client.post("/hub/id-check/start", headers=auth(SEEKER_ID))
        r = identity(client, "requires_input", session_id=f"vs_{n}", error="selfie_face_mismatch").json()
        assert r["id_check"] == "retry" and r["tries_left"] == 3 - n
    assert "selfie" in status(client)["last_error"]
    # Walking away from the check does not use a try.
    client.post("/hub/id-check/start", headers=auth(SEEKER_ID))
    assert identity(client, "requires_input", session_id="vs_3", error="abandoned").json()["id_check"] == "not_finished"
    assert status(client)["tries_left"] == 1
    # Failed sessions are closed already; an unfinished one is cancelled
    # when the next try starts.
    client.post("/hub/id-check/start", headers=auth(SEEKER_ID))
    assert stripe_fake["cancelled"] == ["vs_3"]

    r = identity(client, "requires_input", session_id="vs_4", error="document_unverified_other").json()
    assert r["id_check"] == "rejected"
    assert stripe_fake["refunds"] == []
    s = status(client)
    assert s["status"] == "rejected" and not s["refunded"] and not s["can_start"] and s["tries_left"] == 0
    assert client.post("/hub/id-check/start", headers=auth(SEEKER_ID)).status_code == 409
    # They can pay again for a fresh three tries.
    r = client.post("/hub/id-check/checkout", headers=auth(SEEKER_ID))
    assert r.status_code == 200, r.text
    assert db.rows("renter_verifications")[0]["failed_checks"] == 0


def test_a_replaced_session_cannot_verify(client, db, stripe_fake):
    pay(client)
    client.post("/hub/id-check/start", headers=auth(SEEKER_ID))
    client.post("/hub/id-check/start", headers=auth(SEEKER_ID))
    assert identity(client, "verified", session_id="vs_1").json()["status"] == "ignored"
    assert status(client)["status"] != "verified"


def test_start_works_before_the_payment_webhook_arrives(client, db, stripe_fake):
    client.post("/hub/id-check/checkout", headers=auth(SEEKER_ID))
    r = client.post("/hub/id-check/start", headers=auth(SEEKER_ID))
    assert r.status_code == 200, r.text
    row = db.rows("renter_verifications")[0]
    assert row["payment_status"] == "paid" and row["payment_intent"] == "pi_direct"


def test_unpaid_checkout_does_not_start(client, db, stripe_fake):
    stripe_fake["retrieved_paid"] = False
    client.post("/hub/id-check/checkout", headers=auth(SEEKER_ID))
    assert client.post("/hub/id-check/start", headers=auth(SEEKER_ID)).status_code == 402


def test_a_listing_can_ask_for_verified_renters_only(client, db, stripe_fake):
    r = client.patch(f"/hub/listings/{LISTING_LIVE}/unit", headers=auth(VERIFIED_OWNER_ID), json={"require_verified_renters": True})
    assert r.status_code == 200 and r.json()["require_verified_renters"] is True
    from tests.test_hub import complete_profile

    complete_profile(client)
    r = client.post("/hub/applications", headers=auth(SEEKER_ID), json={"listing_id": LISTING_LIVE})
    assert r.status_code == 403 and r.json()["detail"]["code"] == "id_check_required"

    pay(client)
    client.post("/hub/id-check/start", headers=auth(SEEKER_ID))
    identity(client, "verified")
    assert start_and_submit(client)


def test_the_rule_is_ignored_while_the_check_is_off(client, db, monkeypatch):
    for listing in db.rows("listings"):
        if listing["id"] == LISTING_LIVE:
            listing["require_verified_renters"] = True
    monkeypatch.delenv("SEEKER_VERIFICATION_ENABLED", raising=False)
    assert start_and_submit(client)


def test_owners_use_owner_verification_not_this(client, stripe_fake):
    assert client.post("/hub/id-check/checkout", headers=auth(VERIFIED_OWNER_ID)).status_code == 403


def test_free_test_mode_skips_payment_only_with_test_keys(client, db, stripe_fake, monkeypatch):
    monkeypatch.setenv("ID_CHECK_FREE_TEST", "true")
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_live_x")
    assert renter_id.free_test_mode() is False
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_x")
    r = client.post("/hub/id-check/checkout", headers=auth(SEEKER_ID))
    assert r.status_code == 200 and "id_check=paid" in r.json()["checkout_url"]
    assert stripe_fake["checkouts"] == []
    assert status(client)["paid"] is True
    assert client.post("/hub/id-check/start", headers=auth(SEEKER_ID)).status_code == 200


def test_the_result_is_fetched_from_stripe_if_the_webhook_is_missing(client, db, stripe_fake, monkeypatch):
    pay(client)
    client.post("/hub/id-check/start", headers=auth(SEEKER_ID))
    failed = Obj(id="vs_1", status="requires_input", last_error={"code": "selfie_face_mismatch"}, metadata={"user_id": SEEKER_ID, "purpose": "renter_id"})
    monkeypatch.setattr(renter_id.stripe.identity.VerificationSession, "retrieve", staticmethod(lambda sid, expand=None: failed))
    assert status(client)["tries_left"] == 2
    assert status(client)["tries_left"] == 2  # read again: not counted twice
    # The late webhook for the same failure is not counted again either.
    identity(client, "requires_input", session_id="vs_1", error="selfie_face_mismatch", event_id="evt_late")
    assert status(client)["tries_left"] == 2
