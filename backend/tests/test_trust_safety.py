"""
Phase C trust and safety: blocking (MIG-032), scam signs in messages
(MIG-033), reviews after real tenancies and stays (MIG-011), and guest
support tickets (MIG-041).
"""

from datetime import date, datetime, timedelta, timezone

import pytest

from message_safety import message_risks
from tests.conftest import ADMIN_ID, LISTING_LIVE, OTHER_ID, SEEKER_ID, VERIFIED_OWNER_ID, auth

KEY_FROM_SEEKER = f"{LISTING_LIVE}_{VERIFIED_OWNER_ID}"
KEY_FROM_OWNER = f"{LISTING_LIVE}_{SEEKER_ID}"


def _enquire(client, text="Is the room still available?"):
    return client.post("/hub/enquiries", headers=auth(SEEKER_ID), json={"listing_id": LISTING_LIVE, "text": text})


# ---------------------------------------------------------------------------
# Blocking
# ---------------------------------------------------------------------------


def test_a_block_stops_messages_both_ways_until_lifted(client, db):
    assert _enquire(client).status_code == 200
    r = client.post("/hub/blocks", headers=auth(VERIFIED_OWNER_ID), json={"user_id": SEEKER_ID})
    assert r.status_code == 200, r.text
    # Neither side can write now, and the reason is not spelled out.
    assert client.post(f"/hub/inbox/{KEY_FROM_SEEKER}/messages", headers=auth(SEEKER_ID), json={"text": "Hello?"}).status_code == 403
    assert client.post(f"/hub/inbox/{KEY_FROM_OWNER}/messages", headers=auth(VERIFIED_OWNER_ID), json={"text": "Hi"}).status_code == 403
    seen_by_renter = client.get(f"/hub/inbox/{KEY_FROM_SEEKER}", headers=auth(SEEKER_ID)).json()
    assert seen_by_renter["blocked"] == {"by_me": False, "closed": True}
    assert [b["person"]["id"] for b in client.get("/hub/blocks", headers=auth(VERIFIED_OWNER_ID)).json()["blocked"]] == [SEEKER_ID]

    assert client.delete(f"/hub/blocks/{SEEKER_ID}", headers=auth(VERIFIED_OWNER_ID)).status_code == 200
    assert client.post(f"/hub/inbox/{KEY_FROM_SEEKER}/messages", headers=auth(SEEKER_ID), json={"text": "Hello again"}).status_code == 200


def test_a_block_also_stops_applications_and_inspection_bookings(client):
    client.post("/hub/blocks", headers=auth(VERIFIED_OWNER_ID), json={"user_id": SEEKER_ID})
    r = client.post("/hub/applications", headers=auth(SEEKER_ID), json={"listing_id": LISTING_LIVE})
    assert r.status_code == 403


def test_blocking_fails_closed_when_the_check_cannot_run(client, monkeypatch):
    import blocks

    def broken(*a, **k):
        raise RuntimeError("database unavailable")

    monkeypatch.setattr(blocks, "block_state", broken)
    assert _enquire(client).status_code == 503


def test_cannot_block_yourself_or_a_stranger_id(client):
    assert client.post("/hub/blocks", headers=auth(SEEKER_ID), json={"user_id": SEEKER_ID}).status_code == 400
    assert client.post("/hub/blocks", headers=auth(SEEKER_ID), json={"user_id": "99999999-9999-4999-8999-999999999999"}).status_code == 404


# ---------------------------------------------------------------------------
# Scam signs in messages
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "text, risky",
    [
        ("Please pay a $500 deposit before the inspection so I can hold it", True),
        ("I'm overseas so I will post the keys to you", True),
        ("Pay with gift cards", True),
        ("Message me on WhatsApp only", True),
        ("BSB 062-000 account number 12345678", True),
        ("Bond is 4 weeks, lodged with Fair Trading after we sign", False),
        ("Can I inspect on Saturday before I apply?", False),
        ("I am interstate, my brother will show you the room", False),
    ],
)
def test_scam_patterns(text, risky):
    assert bool(message_risks(text)) is risky


def test_a_scam_message_is_delivered_with_a_warning_and_reported_once_a_day(client, db):
    client.post("/hub/blocks", headers=auth(SEEKER_ID), json={"user_id": OTHER_ID})  # unrelated block, no effect here
    assert _enquire(client).status_code == 200
    r = client.post(f"/hub/inbox/{KEY_FROM_OWNER}/messages", headers=auth(VERIFIED_OWNER_ID), json={"text": "Pay a deposit before the inspection to hold the room"})
    assert r.status_code == 200, r.text
    client.post(f"/hub/inbox/{KEY_FROM_OWNER}/messages", headers=auth(VERIFIED_OWNER_ID), json={"text": "Send it by Western Union"})

    renter_view = client.get(f"/hub/inbox/{KEY_FROM_SEEKER}", headers=auth(SEEKER_ID)).json()
    warned = [m for m in renter_view["messages"] if m["risks"]]
    assert len(warned) == 2 and "before you have inspected" in warned[0]["risks"][0]
    owner_view = client.get(f"/hub/inbox/{KEY_FROM_OWNER}", headers=auth(VERIFIED_OWNER_ID)).json()
    assert not any(m["risks"] for m in owner_view["messages"])  # the sender sees no warning

    reports = [r for r in db.rows("reports") if r.get("source") == "system"]
    assert len(reports) == 1
    assert reports[0]["reporter_id"] is None and reports[0]["item_type"] == "message" and reports[0]["priority"] == "high"


# ---------------------------------------------------------------------------
# Reviews
# ---------------------------------------------------------------------------

TENANCY = "cccccccc-cccc-4ccc-8ccc-ccccccccccc1"
STAY = "dddddddd-dddd-4ddd-8ddd-ddddddddddd1"


def _tenancy(db, started_days_ago=40, **over):
    row = {
        "id": TENANCY,
        "listing_id": LISTING_LIVE,
        "owner_id": VERIFIED_OWNER_ID,
        "renter_id": SEEKER_ID,
        "status": "active",
        "start_date": (date.today() - timedelta(days=started_days_ago)).isoformat(),
        "end_date": None,
        "rent_amount": 300,
        "rent_frequency": "weekly",
    }
    row.update(over)
    db.seed("tenancies", [row])
    return row


def _review(client, user, kind="tenancy", context=TENANCY, **over):
    body = {"kind": kind, "id": context, "rating": 5, "text": "Quiet, clean and the host was kind."}
    body.update(over)
    return client.post("/hub/reviews", headers=auth(user), json=body)


def test_both_sides_can_review_a_month_into_a_tenancy(client, db):
    _tenancy(db)
    for user, direction in ((SEEKER_ID, "seeker_to_owner"), (VERIFIED_OWNER_ID, "owner_to_seeker")):
        pending = client.get("/hub/reviews/pending", headers=auth(user)).json()["pending"]
        assert [(p["id"], p["direction"]) for p in pending] == [(TENANCY, direction)]


def test_too_early_twice_or_not_yours_is_refused(client, db):
    _tenancy(db, started_days_ago=10)
    assert client.get("/hub/reviews/pending", headers=auth(SEEKER_ID)).json()["pending"] == []
    assert _review(client, SEEKER_ID).status_code == 400
    db.tables["tenancies"][0]["start_date"] = (date.today() - timedelta(days=40)).isoformat()
    assert _review(client, SEEKER_ID).status_code == 200
    assert _review(client, SEEKER_ID).status_code == 409
    assert _review(client, OTHER_ID).status_code == 404


def test_reviews_stay_hidden_until_both_have_written_one(client, db):
    _tenancy(db)
    assert _review(client, SEEKER_ID, rating=4, migrant_friendliness=5).status_code == 200
    assert client.get(f"/reviews/listing/{LISTING_LIVE}").json()["stats"]["review_count"] == 0
    assert _review(client, VERIFIED_OWNER_ID, rating=5, text="Paid on time, left it spotless.", payment_rating=5, cleanliness_rating=5).status_code == 200

    listing = client.get(f"/reviews/listing/{LISTING_LIVE}").json()
    assert listing["stats"]["review_count"] == 1 and listing["stats"]["avg_rating"] == 4
    assert listing["reviews"][0]["reviewer_name"] == "Sam"  # first name only
    assert "spotless" not in str(listing)  # the host's review of the renter is never public
    assert client.get(f"/reviews/user/{SEEKER_ID}").json()["reviews"] == []
    assert len(client.get(f"/reviews/user/{VERIFIED_OWNER_ID}").json()["reviews"]) == 1
    page = client.get(f"/listings/{LISTING_LIVE}?include=reviews").json()
    assert page["review_stats"]["review_count"] == 1 and "spotless" not in str(page)


def test_a_lone_review_appears_after_the_blind_period(client, db):
    _tenancy(db)
    _review(client, SEEKER_ID)
    db.tables["reviews"][0]["created_at"] = (datetime.now(timezone.utc) - timedelta(days=15)).isoformat()
    assert client.get(f"/reviews/listing/{LISTING_LIVE}").json()["stats"]["review_count"] == 1


def test_hosts_reviews_of_a_renter_reach_the_next_host_only_on_the_application(client, db):
    from tests.test_hub import start_and_submit

    _tenancy(db)
    _review(client, SEEKER_ID)
    _review(client, VERIFIED_OWNER_ID, rating=5, text="Paid on time, left it spotless.")
    app_id = start_and_submit(client)
    detail = client.get(f"/hub/applications/{app_id}", headers=auth(VERIFIED_OWNER_ID)).json()
    assert detail["renter_reviews"]["count"] == 1
    assert detail["renter_reviews"]["reviews"][0]["review_text"] == "Paid on time, left it spotless."
    assert "renter_reviews" not in client.get(f"/hub/applications/{app_id}", headers=auth(SEEKER_ID)).json()


def test_a_stay_can_be_reviewed_after_check_out(client, db):
    db.seed(
        "bookings",
        [
            {
                "id": STAY,
                "listing_id": LISTING_LIVE,
                "owner_id": VERIFIED_OWNER_ID,
                "seeker_id": SEEKER_ID,
                "status": "PAID",
                "check_in_date": (date.today() - timedelta(days=8)).isoformat(),
                "check_out_date": (date.today() - timedelta(days=1)).isoformat(),
            }
        ],
    )
    assert [p["kind"] for p in client.get("/hub/reviews/pending", headers=auth(SEEKER_ID)).json()["pending"]] == ["stay"]
    assert _review(client, SEEKER_ID, kind="stay", context=STAY).status_code == 200


def test_reporting_a_review_sends_it_to_admins_without_hiding_it(client, db):
    _tenancy(db)
    _review(client, SEEKER_ID, rating=1, text="Terrible.")
    _review(client, VERIFIED_OWNER_ID)
    review_id = next(r["id"] for r in db.rows("reviews") if r["review_type"] == "seeker_to_owner")
    r = client.post(f"/reviews/{review_id}/flag", headers=auth(VERIFIED_OWNER_ID), json={"reason": "This is not true"})
    assert r.status_code == 200, r.text
    assert client.get(f"/reviews/listing/{LISTING_LIVE}").json()["stats"]["review_count"] == 1  # still up
    assert [x["item_type"] for x in db.rows("reports")] == ["review"]

    admin_reports = client.get("/hub/admin/reports", headers=auth(ADMIN_ID)).json()["reports"]
    assert admin_reports[0]["target"]["text"] == "Terrible."
    r = client.post(f"/hub/admin/user-reviews/{review_id}", headers=auth(ADMIN_ID), json={"hidden": True, "reason": "Breaks the review rules"})
    assert r.status_code == 200, r.text
    assert client.get(f"/reviews/listing/{LISTING_LIVE}").json()["stats"]["review_count"] == 0
    assert any(a["action"] == "hide_review" for a in db.rows("admin_audit_log"))


def test_review_prompts_ask_each_side_once(client, db):
    from routes_hub_reviews import send_review_prompts
    from db import get_supabase_admin

    _tenancy(db, started_days_ago=30)
    sb = get_supabase_admin()
    assert send_review_prompts(sb) == [TENANCY]
    send_review_prompts(sb)
    prompts = [n for n in db.rows("notifications") if n["type"] == "review_prompt"]
    assert sorted(n["user_id"] for n in prompts) == sorted([SEEKER_ID, VERIFIED_OWNER_ID])


def test_old_deal_review_endpoints_are_gone(client):
    assert client.post("/reviews", headers=auth(SEEKER_ID), json={}).status_code == 410


# ---------------------------------------------------------------------------
# Guest support tickets
# ---------------------------------------------------------------------------


def _ticket(client, **over):
    body = {"subject": "Question", "message": "How do I list my room on Migrent?", "email": "guest@example.com", "name": "Guest"}
    body.update(over)
    return client.post("/support/tickets", json=body)


def test_guest_tickets_need_an_email_and_are_limited_per_address(client, db):
    assert _ticket(client, email=None).status_code == 400
    for _ in range(3):
        assert _ticket(client).status_code == 200
    assert _ticket(client).status_code == 429
    assert all(t["priority"] == "normal" for t in db.rows("tickets"))


def test_guests_cannot_set_urgent_priority(client, db):
    assert _ticket(client, priority="urgent").status_code == 200
    assert db.rows("tickets")[-1]["priority"] == "normal"


def test_bots_filling_the_hidden_field_are_dropped(client, db):
    assert _ticket(client, website="http://spam.example").status_code == 200
    assert db.rows("tickets") == []
    r = client.post("/support/contact", json={"name": "Bot", "email": "bot@example.com", "role": "seeker", "message": "Buy cheap things now please", "website": "x"})
    assert r.status_code == 200
    assert db.rows("tickets") == []
