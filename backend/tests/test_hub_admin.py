"""
Migrent Hub admin: listing moderation, owner ID checks, suspending an
account and the support inbox, exercised through the /hub/admin API.

What these pin down: only an admin (not viewing as a customer) can use any
of it, every decision that affects a customer needs a reason, each one is
written to admin_audit_log with an action the production constraint
accepts (conftest enforces migration 043's CHECK lists), and a listing can
only be moved the ways its current state allows.
"""

import pytest

from tests.conftest import ADMIN_ID, LISTING_LIVE, LISTING_UNVERIFIED, OTHER_ID, OWNER_ID, SEEKER_ID, VERIFIED_OWNER_ID, auth

LISTING = "/hub/admin/listings"


def set_status(db, listing_id: str, status: str) -> None:
    for row in db.rows("listings"):
        if row["id"] == listing_id:
            row["moderation_status"] = status


def listing_row(db, listing_id: str) -> dict:
    return next(r for r in db.rows("listings") if r["id"] == listing_id)


def audit_actions(db, target_id: str) -> list[str]:
    return [a["action"] for a in db.rows("admin_audit_log") if str(a["target_id"]) == str(target_id)]


def act(client, listing_id: str, action: str, **body):
    return client.post(f"{LISTING}/{listing_id}/action", headers=auth(ADMIN_ID), json={"action": action, **body})


@pytest.fixture()
def quiet_mail(monkeypatch):
    """Owner emails and notifications are captured, never sent."""
    sent = []
    import routes_admin
    import routes_owner_verification
    import routes_spam_moderation

    for mod in (routes_admin, routes_spam_moderation, routes_owner_verification):
        monkeypatch.setattr(mod, "notify", lambda **kw: sent.append(kw))
    for name in ("send_listing_approved_to_owner", "send_listing_rejected_to_owner", "send_listing_changes_requested_to_owner", "send_listing_paused_to_owner"):
        monkeypatch.setattr(routes_admin, name, lambda **kw: sent.append(kw))
    for name in ("send_listing_approved_to_owner", "send_listing_under_review_to_owner", "send_listing_removed_to_owner"):
        monkeypatch.setattr(routes_spam_moderation, name, lambda **kw: sent.append(kw))
    monkeypatch.setattr(routes_owner_verification, "send_id_approved_email", lambda *a, **k: sent.append(a))
    monkeypatch.setattr(routes_owner_verification, "send_id_rejected_email", lambda *a, **k: sent.append(a))
    return sent


# ---------------------------------------------------------------------------
# Who may use it
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "method,path",
    [
        ("get", LISTING),
        ("get", f"{LISTING}/{LISTING_LIVE}"),
        ("post", f"{LISTING}/{LISTING_LIVE}/action"),
        ("get", "/hub/admin/id-checks"),
        ("post", f"/hub/admin/id-checks/{OWNER_ID}"),
        ("post", f"/hub/admin/users/{SEEKER_ID}/suspend"),
        ("get", "/hub/admin/support/tickets"),
    ],
)
def test_only_admins_reach_the_admin_screens(client, method, path):
    body = {"json": {"action": "approve", "reason": "because it is fine"}} if method == "post" else {}
    for user in (SEEKER_ID, VERIFIED_OWNER_ID):
        r = getattr(client, method)(path, headers=auth(user), **body)
        assert r.status_code == 404, (user, path, r.text)
    assert getattr(client, method)(path, **body).status_code == 401


def test_an_admin_viewing_as_a_customer_cannot_moderate(client, db):
    assert client.post("/hub/admin/view-as", headers=auth(ADMIN_ID), json={"user_id": SEEKER_ID, "reason": "Support ticket 7"}).status_code == 200
    r = client.get(LISTING, headers={**auth(ADMIN_ID), "X-Migrent-View-As": SEEKER_ID})
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Listing moderation
# ---------------------------------------------------------------------------


def test_queues_show_the_right_listings_with_their_actions(client, db):
    set_status(db, LISTING_LIVE, "pending_approval")
    set_status(db, LISTING_UNVERIFIED, "flagged")
    r = client.get(f"{LISTING}?queue=review", headers=auth(ADMIN_ID))
    assert r.status_code == 200, r.text
    body = r.json()
    assert [l["id"] for l in body["listings"]] == [LISTING_LIVE]
    item = body["listings"][0]
    assert item["actions"] == ["approve", "request_changes", "reject", "pause"]
    assert item["owner"]["email"] == "verified@example.com" and item["owner"]["id_check"] == "verified"
    assert item["street_address"] == "12 Example Street"
    assert body["counts"]["review"] == 1 and body["counts"]["flagged"] == 1
    flagged = client.get(f"{LISTING}?queue=flagged", headers=auth(ADMIN_ID)).json()["listings"]
    assert [l["id"] for l in flagged] == [LISTING_UNVERIFIED]
    assert client.get(f"{LISTING}?queue=nonsense", headers=auth(ADMIN_ID)).status_code == 400


def test_all_listings_can_be_searched_by_owner_email(client):
    r = client.get(f"{LISTING}?queue=all&q=owner@example.com", headers=auth(ADMIN_ID))
    ids = {l["id"] for l in r.json()["listings"]}
    assert LISTING_UNVERIFIED in ids and LISTING_LIVE not in ids
    # A pasted listing id finds that listing; 36 characters of anything else is just text.
    r = client.get(f"{LISTING}?queue=all&q={LISTING_LIVE}", headers=auth(ADMIN_ID))
    assert [l["id"] for l in r.json()["listings"]] == [LISTING_LIVE]
    assert client.get(f"{LISTING}?queue=all&q={'x' * 36}", headers=auth(ADMIN_ID)).json()["listings"] == []


def test_approve_from_the_review_queue_is_audited_first(client, db, quiet_mail):
    set_status(db, LISTING_LIVE, "pending_approval")
    r = act(client, LISTING_LIVE, "approve")
    assert r.status_code == 200, r.text
    assert r.json()["listing"]["moderation_status"] == "approved"
    assert listing_row(db, LISTING_LIVE)["moderation_status"] == "approved"
    assert audit_actions(db, LISTING_LIVE) == ["approve"]
    assert r.json()["listing"]["history"][0]["event_type"] == "approved"
    assert quiet_mail, "the owner is told"


def test_an_unverified_owners_listing_cannot_be_approved(client, db, quiet_mail):
    set_status(db, LISTING_UNVERIFIED, "pending_approval")
    r = act(client, LISTING_UNVERIFIED, "approve")
    assert r.status_code == 409 and "identity" in r.json()["detail"]
    assert listing_row(db, LISTING_UNVERIFIED)["moderation_status"] == "pending_approval"
    assert audit_actions(db, LISTING_UNVERIFIED) == []


def test_decisions_that_affect_the_owner_need_a_reason(client, db, quiet_mail):
    set_status(db, LISTING_LIVE, "pending_approval")
    for action in ("reject", "request_changes", "pause"):
        assert act(client, LISTING_LIVE, action).status_code == 400
        assert act(client, LISTING_LIVE, action, reason="no").status_code == 400
    assert audit_actions(db, LISTING_LIVE) == []

    r = act(client, LISTING_LIVE, "request_changes", reason="Please add a photo of the bedroom")
    assert r.status_code == 200 and listing_row(db, LISTING_LIVE)["moderation_notes"] == "Please add a photo of the bedroom"
    r = act(client, LISTING_LIVE, "reject", reason="Duplicate of another listing")
    assert r.status_code == 200 and listing_row(db, LISTING_LIVE)["moderation_status"] == "rejected"
    audit = [a for a in db.rows("admin_audit_log") if a["target_id"] == LISTING_LIVE]
    assert [a["action"] for a in audit] == ["request_changes", "reject"]
    assert audit[-1]["reason"] == "Duplicate of another listing"


def test_actions_follow_the_listing_state(client, db, quiet_mail):
    # A live listing can be paused but not approved again or rejected.
    assert act(client, LISTING_LIVE, "approve").status_code == 409
    assert act(client, LISTING_LIVE, "reject", reason="Not allowed here").status_code == 409
    r = act(client, LISTING_LIVE, "pause", reason="Photos show a different property", required_actions=["Upload genuine photos", "  "])
    assert r.status_code == 200, r.text
    assert r.json()["listing"]["actions"] == ["unpause", "request_removal"]
    assert listing_row(db, LISTING_LIVE)["moderation_notes"] == "Upload genuine photos"
    r = act(client, LISTING_LIVE, "unpause", mode="restore")
    assert r.status_code == 200 and listing_row(db, LISTING_LIVE)["moderation_status"] == "approved"
    assert audit_actions(db, LISTING_LIVE) == ["pause", "unpause"]


def test_unverified_owner_listing_cannot_go_back_into_review(client, db, quiet_mail):
    set_status(db, LISTING_UNVERIFIED, "paused")
    r = act(client, LISTING_UNVERIFIED, "unpause")
    assert r.status_code == 409 and "ID check" in r.json()["detail"]
    set_status(db, LISTING_UNVERIFIED, "flagged")
    assert act(client, LISTING_UNVERIFIED, "unflag").status_code == 409
    assert audit_actions(db, LISTING_UNVERIFIED) == []


def test_spam_flow_hide_then_two_step_removal(client, db, quiet_mail):
    set_status(db, LISTING_LIVE, "flagged")
    assert act(client, LISTING_LIVE, "hide").status_code == 400
    assert act(client, LISTING_LIVE, "hide", reason="Same photos as a scam listing").status_code == 200
    assert listing_row(db, LISTING_LIVE)["moderation_status"] == "hidden"
    # Removal is never one click: request it, then confirm it.
    assert act(client, LISTING_LIVE, "confirm_removal").status_code == 409
    assert act(client, LISTING_LIVE, "request_removal", reason="Confirmed scam listing").status_code == 200
    r = act(client, LISTING_LIVE, "confirm_removal", note="Owner account also reported")
    assert r.status_code == 200 and r.json()["listing"]["moderation_status"] == "deleted"
    assert r.json()["listing"]["actions"] == []
    assert audit_actions(db, LISTING_LIVE) == ["hide", "request_delete", "confirm_delete"]
    # The row is kept for the record.
    assert listing_row(db, LISTING_LIVE)["id"] == LISTING_LIVE


def test_a_flagged_listing_can_be_approved_only_if_it_could_go_live(client, db, quiet_mail):
    set_status(db, LISTING_UNVERIFIED, "flagged")
    assert act(client, LISTING_UNVERIFIED, "approve").status_code == 409
    set_status(db, LISTING_LIVE, "flagged")
    r = act(client, LISTING_LIVE, "approve", note="False positive: photos are the owner's own")
    assert r.status_code == 200 and r.json()["listing"]["moderation_status"] == "approved"
    assert audit_actions(db, LISTING_LIVE) == ["approve"]


def test_rescan_updates_the_score_without_changing_the_state(client, db):
    set_status(db, LISTING_LIVE, "flagged")
    r = act(client, LISTING_LIVE, "rescan")
    assert r.status_code == 200, r.text
    listing = r.json()["listing"]
    assert listing["moderation_status"] == "flagged"
    assert listing["history"][0]["event_type"] == "score_updated" and listing["history"][0]["actor_type"] == "system"


def test_listing_detail_has_description_and_history(client, db, quiet_mail):
    set_status(db, LISTING_LIVE, "pending_approval")
    act(client, LISTING_LIVE, "request_changes", reason="Add the bond amount")
    r = client.get(f"{LISTING}/{LISTING_LIVE}", headers=auth(ADMIN_ID))
    assert r.status_code == 200
    detail = r.json()["listing"]
    assert detail["description"].startswith("A nice room")
    assert detail["history"][0]["event_type"] == "changes_requested"
    assert detail["history"][0]["actor"]["name"] == "Ada Admin"
    assert client.get(f"{LISTING}/00000000-0000-4000-8000-000000000000", headers=auth(ADMIN_ID)).status_code == 404


# ---------------------------------------------------------------------------
# Owner ID checks
# ---------------------------------------------------------------------------


@pytest.fixture()
def pending_id(db):
    for row in db.rows("owner_verification"):
        if row["user_id"] == OWNER_ID:
            row.update({"id_status": "pending", "id_document_type": "passport", "id_file_path": f"{OWNER_ID}/passport.pdf", "id_submitted_at": "2026-09-20T01:00:00+00:00"})
    return OWNER_ID


def test_id_queue_lists_pending_owners_with_waiting_listings(client, db, pending_id):
    # The owner's draft waits on this check; their live listing does not count.
    r = client.get("/hub/admin/id-checks", headers=auth(ADMIN_ID))
    assert r.status_code == 200
    checks = r.json()["checks"]
    assert [c["user_id"] for c in checks] == [OWNER_ID]
    assert checks[0]["email"] == "owner@example.com" and checks[0]["document_type"] == "passport"
    assert checks[0]["listings_waiting"] == 1
    doc = client.get(f"/hub/admin/id-checks/{OWNER_ID}/document", headers=auth(ADMIN_ID)).json()
    assert doc["kind"] == "pdf" and doc["url"].startswith("https://storage.test/owner-id-docs/") and doc["expires_in_seconds"] == 300


def test_rejecting_an_id_needs_a_reason_and_is_audited(client, db, pending_id, quiet_mail):
    assert client.post(f"/hub/admin/id-checks/{OWNER_ID}", headers=auth(ADMIN_ID), json={"action": "reject"}).status_code == 400
    assert client.post(f"/hub/admin/id-checks/{OWNER_ID}", headers=auth(ADMIN_ID), json={"action": "maybe"}).status_code == 422
    r = client.post(f"/hub/admin/id-checks/{OWNER_ID}", headers=auth(ADMIN_ID), json={"action": "reject", "reason": "The photo is too blurry to read"})
    assert r.status_code == 200, r.text
    row = next(v for v in db.rows("owner_verification") if v["user_id"] == OWNER_ID)
    assert row["id_status"] == "rejected" and row["id_rejection_reason"] == "The photo is too blurry to read"
    audit = [a for a in db.rows("admin_audit_log") if a["target_id"] == OWNER_ID]
    assert [(a["action"], a["target_type"], a["reason"]) for a in audit] == [("reject_id", "owner_verification", "The photo is too blurry to read")]


def test_approving_an_id_verifies_the_owner(client, db, pending_id, quiet_mail):
    r = client.post(f"/hub/admin/id-checks/{OWNER_ID}", headers=auth(ADMIN_ID), json={"action": "approve"})
    assert r.status_code == 200 and r.json()["fully_verified"] is True
    assert audit_actions(db, OWNER_ID) == ["approve_id"]
    assert client.get("/hub/admin/id-checks", headers=auth(ADMIN_ID)).json()["checks"] == []
    # Deciding twice is refused rather than silently repeated.
    assert client.post(f"/hub/admin/id-checks/{OWNER_ID}", headers=auth(ADMIN_ID), json={"action": "approve"}).status_code == 400


# ---------------------------------------------------------------------------
# Suspending an account
# ---------------------------------------------------------------------------


def test_suspend_needs_a_reason_blocks_the_hub_and_is_reversible(client, db):
    path = f"/hub/admin/users/{SEEKER_ID}"
    assert client.post(f"{path}/suspend", headers=auth(ADMIN_ID), json={"reason": ""}).status_code == 400
    r = client.post(f"{path}/suspend", headers=auth(ADMIN_ID), json={"reason": "Asked renters to pay a deposit off the platform"})
    assert r.status_code == 200 and r.json()["user"]["suspended"] is True
    assert client.get("/hub/me", headers=auth(SEEKER_ID)).status_code == 403
    found = client.get("/hub/admin/users?q=sam", headers=auth(ADMIN_ID)).json()["users"]
    assert found[0]["suspended"] is True and found[0]["is_admin"] is False
    r = client.post(f"{path}/unsuspend", headers=auth(ADMIN_ID), json={"reason": "Appeal accepted after a call"})
    assert r.status_code == 200 and r.json()["user"]["suspended"] is False
    assert client.get("/hub/me", headers=auth(SEEKER_ID)).status_code == 200
    audit = [a for a in db.rows("admin_audit_log") if a["target_id"] == SEEKER_ID]
    assert [(a["action"], a["target_type"]) for a in audit] == [("suspend_user", "user"), ("unsuspend_user", "user")]


def test_admins_and_yourself_cannot_be_suspended_here(client, db):
    assert client.post(f"/hub/admin/users/{ADMIN_ID}/suspend", headers=auth(ADMIN_ID), json={"reason": "Testing myself"}).status_code == 400
    for p in db.rows("profiles"):
        if p["id"] == OTHER_ID:
            p["is_admin"] = True
    assert client.post(f"/hub/admin/users/{OTHER_ID}/suspend", headers=auth(ADMIN_ID), json={"reason": "Another admin"}).status_code == 400
    assert client.post("/hub/admin/users/00000000-0000-4000-8000-000000000000/suspend", headers=auth(ADMIN_ID), json={"reason": "Nobody at all"}).status_code == 404
    assert db.rows("admin_audit_log") == []


# ---------------------------------------------------------------------------
# Support inbox
# ---------------------------------------------------------------------------


@pytest.fixture()
def tickets(db):
    db.seed(
        "tickets",
        [
            {"id": "t-open", "user_id": SEEKER_ID, "email": "seeker@example.com", "status": "open", "priority": "normal", "category": "listings", "source": "in_app", "subject": "Can't upload photos", "created_at": "2026-09-20T00:00:00+00:00"},
            {"id": "t-urgent", "user_id": None, "email": "guest@example.com", "name": "Guest Gina", "status": "pending_internal", "priority": "urgent", "category": "trust_safety", "source": "contact_form", "subject": "Owner asked for cash", "created_at": "2026-09-21T00:00:00+00:00"},
            {"id": "t-done", "user_id": SEEKER_ID, "email": "seeker@example.com", "status": "resolved", "priority": "low", "category": "feedback", "source": "in_app", "subject": "Thanks", "created_at": "2026-09-01T00:00:00+00:00"},
        ],
    )
    db.seed("ticket_messages", [{"id": "m1", "ticket_id": "t-open", "sender_id": SEEKER_ID, "sender_type": "user", "body": "The upload button spins forever.", "is_internal": False, "created_at": "2026-09-20T00:00:00+00:00"}])
    return db


def test_inbox_puts_the_most_urgent_first(client, tickets):
    r = client.get("/hub/admin/support/tickets", headers=auth(ADMIN_ID))
    assert r.status_code == 200, r.text
    body = r.json()
    assert [t["id"] for t in body["tickets"]] == ["t-urgent", "t-open"]
    assert body["counts"] == {"needs_reply": 2, "waiting": 0, "done": 1}
    guest = body["tickets"][0]["requester"]
    assert guest["name"] == "Guest Gina" and guest["has_account"] is False
    assert body["tickets"][1]["requester"]["name"] == "Sam Seeker"
    assert client.get("/hub/admin/support/tickets?view=bogus", headers=auth(ADMIN_ID)).status_code == 400


def test_replying_waits_on_the_customer_and_notes_stay_internal(client, tickets):
    r = client.post("/hub/admin/support/tickets/t-open/reply", headers=auth(ADMIN_ID), json={"body": "Try a photo under 10 MB. We're fixing the spinner."})
    assert r.status_code == 200, r.text
    t = r.json()["ticket"]
    assert t["status"] == "pending_customer" and t["first_response_at"]
    assert t["messages"][-1]["sender_type"] == "agent" and t["messages"][-1]["sender"]["name"] == "Ada Admin"
    r = client.post("/hub/admin/support/tickets/t-open", headers=auth(ADMIN_ID), json={"internal_note": "Bug filed", "priority": "high"})
    t = r.json()["ticket"]
    assert t["priority"] == "high" and t["messages"][-1]["is_internal"] is True
    # The customer never sees the internal note.
    mine = client.get("/support/tickets/t-open", headers=auth(SEEKER_ID)).json()
    assert all(not m["is_internal"] for m in mine["messages"])
    events = [e["event_type"] for e in tickets.rows("support_events")]
    assert events == ["reply", "priority_change", "internal_note"]


def test_resolving_records_when_and_closed_tickets_take_no_replies(client, tickets):
    r = client.post("/hub/admin/support/tickets/t-open", headers=auth(ADMIN_ID), json={"status": "resolved"})
    assert r.status_code == 200 and r.json()["ticket"]["resolved_at"]
    assert client.post("/hub/admin/support/tickets/t-open", headers=auth(ADMIN_ID), json={"status": "archived"}).status_code == 422
    client.post("/hub/admin/support/tickets/t-open", headers=auth(ADMIN_ID), json={"status": "closed"})
    assert client.post("/hub/admin/support/tickets/t-open/reply", headers=auth(ADMIN_ID), json={"body": "One more thing"}).status_code == 409
    assert client.get("/hub/admin/support/tickets/nope", headers=auth(ADMIN_ID)).status_code == 404


# ---------------------------------------------------------------------------
# Overview and audit log
# ---------------------------------------------------------------------------


def test_overview_counts_are_counted_not_estimated(client, db, tickets):
    set_status(db, LISTING_LIVE, "pending_approval")
    o = client.get("/hub/admin/overview", headers=auth(ADMIN_ID)).json()
    assert o["listings_in_review"] == 1
    assert o["tickets_waiting"] == 2
    assert o["accounts"] == len(db.rows("profiles"))
    assert o["approved_listings"] == sum(1 for l in db.rows("listings") if l["moderation_status"] == "approved")


def test_audit_log_shows_notes_as_well_as_reasons(client, db, quiet_mail):
    set_status(db, LISTING_LIVE, "pending_approval")
    act(client, LISTING_LIVE, "request_changes", reason="Say which rooms share the bathroom")
    entry = client.get("/hub/admin/audit?target_type=listing", headers=auth(ADMIN_ID)).json()["entries"][0]
    assert entry["action"] == "request_changes" and entry["notes"] == "Say which rooms share the bathroom"
    assert entry["admin"]["name"] == "Ada Admin"
