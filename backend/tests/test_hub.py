"""
Migrent Hub: the application workflow, inspections, the inbox, view-as and
the owner wizard, exercised through the API against the in-memory fake.

What these pin down is who may do what, in which state: an owner cannot
skip Migrent's final review, a stranger cannot see an application, an
admin viewing as a customer cannot change anything, a full inspection
cannot be overbooked.
"""

from datetime import date, datetime, timedelta, timezone

import pytest

from tests.conftest import ADMIN_ID, LISTING_DRAFT, LISTING_LIVE, OTHER_ID, OWNER_ID, SEEKER_ID, VERIFIED_OWNER_ID, auth


@pytest.fixture()
def sent(monkeypatch):
    """Capture notifications instead of emailing anyone."""
    calls = []
    import notification_service

    monkeypatch.setattr(notification_service, "notify", lambda **kw: calls.append(kw))
    return calls


def complete_profile(client, user=SEEKER_ID):
    r = client.put(
        "/hub/rental-profile",
        headers=auth(user),
        json={
            "intro": "I work as a nurse at Westmead and I am looking for a quiet room close to the station.",
            "preferred_move_date": (date.today() + timedelta(days=20)).isoformat(),
            "preferred_lease_months": 6,
            "employment_status": "employed",
            "employer": "Westmead Hospital",
            "first_time_renter": True,
            "referees": [{"name": "Ana Lee", "relationship": "Manager", "email": "ana@example.com"}],
        },
    )
    assert r.status_code == 200, r.text
    return r.json()


def start_and_submit(client, user=SEEKER_ID, listing=LISTING_LIVE):
    complete_profile(client, user)
    r = client.post("/hub/applications", headers=auth(user), json={"listing_id": listing})
    assert r.status_code == 200, r.text
    app_id = r.json()["application"]["id"]
    r = client.post(f"/hub/applications/{app_id}/submit", headers=auth(user))
    assert r.status_code == 200, r.text
    assert r.json()["application"]["status"] == "submitted"
    return app_id


# ---------------------------------------------------------------------------
# Onboarding and roles
# ---------------------------------------------------------------------------


def test_onboarding_sets_role_and_requires_consent(client, db):
    r = client.post("/hub/onboarding", headers=auth(OTHER_ID), json={"role": "owner", "name": "Olive", "over_18": True, "accept_terms": False})
    assert r.status_code == 400
    r = client.post("/hub/onboarding", headers=auth(OTHER_ID), json={"role": "owner", "name": "Olive", "over_18": True, "accept_terms": True})
    assert r.status_code == 200, r.text
    assert r.json()["role"] == "owner"
    row = next(p for p in db.rows("profiles") if p["id"] == OTHER_ID)
    assert row["role"] == "owner" and row["over_18_confirmed_at"] and row["hub_onboarded_at"]


def test_admin_keeps_admin_role_through_onboarding(client, db):
    r = client.post("/hub/onboarding", headers=auth(ADMIN_ID), json={"role": "renter", "name": "Ada", "over_18": True, "accept_terms": True})
    assert r.status_code == 200
    assert next(p for p in db.rows("profiles") if p["id"] == ADMIN_ID)["role"] == "superadmin"
    assert r.json()["role"] == "admin"


@pytest.mark.parametrize("stored_role", ["seeker", "owner"])
def test_admin_flag_gives_the_admin_hub_whatever_the_stored_role(client, db, stored_role):
    # Production admins have is_admin set and a renter or owner role left on
    # the row. They must still get the admin Hub, and the welcome screen and
    # role switch must not take it away.
    for p in db.rows("profiles"):
        if p["id"] == OTHER_ID:
            p.update({"is_admin": True, "role": stored_role})
    me = client.get("/hub/me", headers=auth(OTHER_ID)).json()
    assert me["role"] == "admin" and me["onboarded"] is True
    r = client.post("/hub/onboarding", headers=auth(OTHER_ID), json={"role": "owner", "name": "Olive", "over_18": True, "accept_terms": True})
    assert r.status_code == 200 and r.json()["role"] == "admin"
    assert next(p for p in db.rows("profiles") if p["id"] == OTHER_ID)["role"] == stored_role
    assert client.post("/hub/role", headers=auth(OTHER_ID), json={"role": "renter"}).status_code == 400
    assert client.get("/hub/home", headers=auth(OTHER_ID)).json() == {"role": "admin"}
    assert client.get("/hub/admin/overview", headers=auth(OTHER_ID)).status_code == 200


def test_owner_with_live_listings_cannot_switch_to_renting(client):
    r = client.post("/hub/role", headers=auth(VERIFIED_OWNER_ID), json={"role": "renter"})
    assert r.status_code == 409


# ---------------------------------------------------------------------------
# Rental profile
# ---------------------------------------------------------------------------


def test_rental_profile_completion_lists_what_is_missing(client):
    r = client.get("/hub/rental-profile", headers=auth(SEEKER_ID))
    assert r.status_code == 200
    first = r.json()["completion"]
    assert first["percent"] < 100
    assert any(not i["done"] for i in first["items"])
    after = complete_profile(client)["completion"]
    assert after["percent"] > first["percent"]
    assert next(i for i in after["items"] if i["key"] == "history")["done"] is True  # first-time renter counts


def test_private_documents_are_validated_by_content(client, db):
    r = client.post("/hub/documents", headers=auth(SEEKER_ID), files={"file": ("payslip.pdf", b"not really a pdf", "application/pdf")}, data={"kind": "income"})
    assert r.status_code == 400
    r = client.post("/hub/documents", headers=auth(SEEKER_ID), files={"file": ("payslip.pdf", b"%PDF-1.4 fake", "application/pdf")}, data={"kind": "income"})
    assert r.status_code == 200, r.text
    doc = r.json()
    assert "file_path" not in doc
    stored = db.rows("renter_documents")[0]["file_path"]
    assert stored.startswith(f"{SEEKER_ID}/")
    assert client.get(f"/hub/documents/{doc['id']}/url", headers=auth(OTHER_ID)).status_code == 404
    assert "token=signed" in client.get(f"/hub/documents/{doc['id']}/url", headers=auth(SEEKER_ID)).json()["url"]


# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------


def test_cannot_apply_to_unpublished_or_own_listing(client):
    assert client.post("/hub/applications", headers=auth(SEEKER_ID), json={"listing_id": LISTING_DRAFT}).status_code == 404
    r = client.post("/hub/applications", headers=auth(VERIFIED_OWNER_ID), json={"listing_id": LISTING_LIVE})
    assert r.status_code == 403  # owner accounts apply from a renter account


def test_submission_lists_missing_profile_details(client):
    r = client.post("/hub/applications", headers=auth(SEEKER_ID), json={"listing_id": LISTING_LIVE})
    app_id = r.json()["application"]["id"]
    r = client.post(f"/hub/applications/{app_id}/submit", headers=auth(SEEKER_ID))
    assert r.status_code == 422
    assert r.json()["detail"]["problems"]


def test_owner_cannot_see_a_draft_and_strangers_see_nothing(client):
    r = client.post("/hub/applications", headers=auth(SEEKER_ID), json={"listing_id": LISTING_LIVE})
    app_id = r.json()["application"]["id"]
    assert client.get(f"/hub/applications/{app_id}", headers=auth(VERIFIED_OWNER_ID)).status_code == 404
    assert client.get(f"/hub/applications/{app_id}", headers=auth(OTHER_ID)).status_code == 404


def test_full_workflow_through_final_review(client, db, sent):
    app_id = start_and_submit(client)
    assert any(c["event"] == "application_submitted" and c["user_id"] == VERIFIED_OWNER_ID for c in sent)

    # Opening it is a step the renter can see.
    r = client.get(f"/hub/applications/{app_id}", headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 200
    body = r.json()
    assert body["application"]["status"] == "under_review"
    assert body["snapshot"]["name"]
    assert body["snapshot"]["income_weekly"] is None  # not shared unless ticked
    assert "approve" in body["allowed_actions"]

    # The renter cannot approve their own application.
    assert client.post(f"/hub/applications/{app_id}/owner-action", headers=auth(SEEKER_ID), json={"action": "approve"}).status_code == 404

    r = client.post(f"/hub/applications/{app_id}/owner-action", headers=auth(VERIFIED_OWNER_ID), json={"action": "approve"})
    assert r.status_code == 200, r.text
    assert r.json()["application"]["status"] == "migrent_review"  # never straight to finalised

    # Only an admin can finalise, and it is audited.
    assert client.post(f"/hub/admin/applications/{app_id}/decision", headers=auth(VERIFIED_OWNER_ID), json={"action": "finalise"}).status_code == 404
    r = client.post(f"/hub/admin/applications/{app_id}/decision", headers=auth(ADMIN_ID), json={"action": "finalise"})
    assert r.status_code == 200, r.text
    assert r.json()["application"]["status"] == "finalised"
    assert r.json()["tenancy"]["renter_id"] == SEEKER_ID
    assert any(a["action"] == "finalise_application" for a in db.rows("admin_audit_log"))
    listing = next(l for l in db.rows("listings") if l["id"] == LISTING_LIVE)
    assert listing["occupancy"] == "occupied" and listing["moderation_status"] == "paused"

    events = [e["event"] for e in client.get(f"/hub/applications/{app_id}", headers=auth(SEEKER_ID)).json()["events"]]
    assert events[:3] == ["created", "submitted", "viewed"]
    assert "owner_approved" in events and "finalised" in events

    # Finalised applications cannot be withdrawn from the Hub.
    assert client.post(f"/hub/applications/{app_id}/withdraw", headers=auth(SEEKER_ID), json={}).status_code == 409


def test_one_approved_applicant_per_home(client, db):
    first = start_and_submit(client, SEEKER_ID)
    second = start_and_submit(client, OTHER_ID)
    assert client.post(f"/hub/applications/{first}/owner-action", headers=auth(VERIFIED_OWNER_ID), json={"action": "approve"}).status_code == 200
    r = client.post(f"/hub/applications/{second}/owner-action", headers=auth(VERIFIED_OWNER_ID), json={"action": "approve"})
    assert r.status_code == 409


def test_changes_requested_needs_a_note_and_round_trips(client):
    app_id = start_and_submit(client)
    assert client.post(f"/hub/applications/{app_id}/owner-action", headers=auth(VERIFIED_OWNER_ID), json={"action": "request_changes"}).status_code == 400
    r = client.post(f"/hub/applications/{app_id}/owner-action", headers=auth(VERIFIED_OWNER_ID), json={"action": "request_changes", "note": "Please add a payslip"})
    assert r.json()["application"]["status"] == "changes_requested"
    r = client.post(f"/hub/applications/{app_id}/submit", headers=auth(SEEKER_ID))
    assert r.json()["application"]["status"] == "submitted"


def test_migrent_corrections_return_to_migrent_not_the_owner(client):
    app_id = start_and_submit(client)
    client.post(f"/hub/applications/{app_id}/owner-action", headers=auth(VERIFIED_OWNER_ID), json={"action": "approve"})
    assert client.post(f"/hub/admin/applications/{app_id}/decision", headers=auth(ADMIN_ID), json={"action": "stop"}).status_code == 400  # reason required
    r = client.post(f"/hub/admin/applications/{app_id}/decision", headers=auth(ADMIN_ID), json={"action": "request_corrections", "reason": "Move-in date clashes with the current tenancy"})
    assert r.json()["application"]["status"] == "changes_requested"
    r = client.post(f"/hub/applications/{app_id}/submit", headers=auth(SEEKER_ID))
    assert r.json()["application"]["status"] == "migrent_review"


def test_decline_reason_stays_with_the_owner(client):
    app_id = start_and_submit(client)
    client.post(f"/hub/applications/{app_id}/owner-action", headers=auth(VERIFIED_OWNER_ID), json={"action": "decline", "note": "Private reason"})
    renter_view = client.get(f"/hub/applications/{app_id}", headers=auth(SEEKER_ID)).json()
    assert renter_view["application"]["status"] == "declined"
    assert all(e.get("note") != "Private reason" for e in renter_view["events"])


# ---------------------------------------------------------------------------
# Inspections
# ---------------------------------------------------------------------------


def future(hours=48):
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


def test_inspection_booking_rules(client, db, sent):
    assert client.post("/hub/inspections/slots", headers=auth(OWNER_ID), json={"listing_id": LISTING_LIVE, "slots": [{"starts_at": future()}]}).status_code == 404
    r = client.post("/hub/inspections/slots", headers=auth(VERIFIED_OWNER_ID), json={"listing_id": LISTING_LIVE, "capacity": 1, "slots": [{"starts_at": future(), "duration_minutes": 20}]})
    assert r.status_code == 200, r.text
    slot_id = r.json()["slots"][0]["id"]

    r = client.post("/hub/inspections/bookings", headers=auth(SEEKER_ID), json={"slot_id": slot_id})
    assert r.status_code == 200, r.text
    assert r.json()["booking"]["listing"]["street_address"] == "12 Example Street"  # released on booking
    assert client.post("/hub/inspections/bookings", headers=auth(SEEKER_ID), json={"slot_id": slot_id}).status_code == 409  # already booked
    assert client.post("/hub/inspections/bookings", headers=auth(OTHER_ID), json={"slot_id": slot_id}).status_code == 409  # full
    assert client.post("/hub/inspections/bookings", headers=auth(VERIFIED_OWNER_ID), json={"slot_id": slot_id}).status_code == 400  # own listing

    slots = client.get(f"/hub/listings/{LISTING_LIVE}/inspection-slots", headers=auth(SEEKER_ID)).json()
    assert slots["timezone"] == "Australia/Sydney"
    assert slots["slots"][0]["my_booking"]["status"] == "booked"
    assert slots["slots"][0]["spaces_left"] == 0

    r = client.post(f"/hub/inspections/slots/{slot_id}/cancel", headers=auth(VERIFIED_OWNER_ID), json={"reason": "Plumber coming"})
    assert r.json()["slot"]["status"] == "cancelled"
    assert all(b["status"] == "cancelled" for b in db.rows("inspection_bookings"))
    assert any(c["event"] == "inspection_cancelled" and c["user_id"] == SEEKER_ID for c in sent)


def test_inspection_times_must_be_in_the_future(client):
    past = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    r = client.post("/hub/inspections/slots", headers=auth(VERIFIED_OWNER_ID), json={"listing_id": LISTING_LIVE, "slots": [{"starts_at": past}]})
    assert r.status_code == 400


# ---------------------------------------------------------------------------
# Inbox
# ---------------------------------------------------------------------------


def test_enquiry_opens_a_listing_conversation(client, db):
    r = client.post("/hub/enquiries", headers=auth(SEEKER_ID), json={"listing_id": LISTING_LIVE, "text": "Is the room still available?"})
    assert r.status_code == 200, r.text
    key = r.json()["key"]
    assert key == f"{LISTING_LIVE}_{VERIFIED_OWNER_ID}"
    owner_inbox = client.get("/hub/inbox", headers=auth(VERIFIED_OWNER_ID)).json()
    assert owner_inbox["threads"][0]["my_side"] == "owner"
    assert owner_inbox["threads"][0]["unread_count"] == 1
    thread = client.get(f"/hub/inbox/{LISTING_LIVE}_{SEEKER_ID}", headers=auth(VERIFIED_OWNER_ID)).json()
    assert thread["messages"][0]["text"] == "Is the room still available?"
    assert client.get("/hub/inbox", headers=auth(VERIFIED_OWNER_ID)).json()["unread_total"] == 0  # opening marks read
    # A third person cannot open it.
    assert client.get(f"/hub/inbox/{LISTING_LIVE}_{SEEKER_ID}", headers=auth(OTHER_ID)).status_code == 404
    assert any(e["event"] == "enquiry" for e in db.rows("listing_events"))


def test_archive_hides_a_conversation(client):
    key = client.post("/hub/enquiries", headers=auth(SEEKER_ID), json={"listing_id": LISTING_LIVE, "text": "Hello"}).json()["key"]
    client.post(f"/hub/inbox/{key}/state", headers=auth(SEEKER_ID), json={"archived": True})
    assert client.get("/hub/inbox", headers=auth(SEEKER_ID)).json()["threads"] == []
    assert len(client.get("/hub/inbox?filter=archived", headers=auth(SEEKER_ID)).json()["threads"]) == 1


# ---------------------------------------------------------------------------
# View-as
# ---------------------------------------------------------------------------


def test_view_as_is_audited_and_read_only(client, db):
    hdr = {**auth(ADMIN_ID), "X-Migrent-View-As": SEEKER_ID}
    assert client.get("/hub/me", headers=hdr).status_code == 403  # no session started
    assert client.post("/hub/admin/view-as", headers=auth(ADMIN_ID), json={"user_id": SEEKER_ID}).status_code == 400  # reason required
    assert client.post("/hub/admin/view-as", headers=auth(ADMIN_ID), json={"user_id": SEEKER_ID, "reason": "Support ticket 42"}).status_code == 200
    r = client.get("/hub/me", headers=hdr)
    assert r.status_code == 200 and r.json()["id"] == SEEKER_ID and r.json()["viewing_as"]["admin_id"] == ADMIN_ID
    assert client.post("/hub/saved", headers=hdr, json={"listing_id": LISTING_LIVE}).status_code == 403
    # Non-admins cannot use the header at all.
    assert client.get("/hub/me", headers={**auth(OTHER_ID), "X-Migrent-View-As": SEEKER_ID}).status_code == 403
    client.post("/hub/admin/view-as/end", headers=auth(ADMIN_ID), json={"user_id": SEEKER_ID})
    assert client.get("/hub/me", headers=hdr).status_code == 403
    actions = [a["action"] for a in db.rows("admin_audit_log")]
    assert actions.count("view_as_start") == 1 and actions.count("view_as_end") == 1


# ---------------------------------------------------------------------------
# Saved homes, analytics, wizard
# ---------------------------------------------------------------------------


def test_saving_only_works_for_published_homes(client, db):
    assert client.post("/hub/saved", headers=auth(SEEKER_ID), json={"listing_id": LISTING_DRAFT}).status_code == 404
    assert client.post("/hub/saved", headers=auth(SEEKER_ID), json={"listing_id": LISTING_LIVE}).status_code == 200
    assert client.post("/hub/saved", headers=auth(SEEKER_ID), json={"listing_id": LISTING_LIVE}).status_code == 200  # idempotent
    assert client.get("/hub/saved/ids", headers=auth(SEEKER_ID)).json()["ids"] == [LISTING_LIVE]
    assert len(db.rows("favorites")) == 1


def test_owner_views_of_their_own_listing_are_not_counted(client, db):
    client.post("/hub/listing-events", json={"listing_id": LISTING_LIVE, "visitor": "anon-1"})
    client.post("/hub/listing-events", headers=auth(VERIFIED_OWNER_ID), json={"listing_id": LISTING_LIVE})
    client.post("/hub/listing-events", json={"listing_id": LISTING_DRAFT, "visitor": "anon-1"})
    rows = db.rows("listing_events")
    assert len(rows) == 1 and rows[0]["listing_id"] == LISTING_LIVE
    assert rows[0]["actor_hash"] != "anon-1"  # stored hashed


def test_wizard_reports_missing_fields_then_creates_a_linked_listing(client, db):
    r = client.post("/hub/listing-drafts", headers=auth(VERIFIED_OWNER_ID), json={"data": {"street_address": "15 Smith Street"}})
    assert r.status_code == 200, r.text
    draft_id = r.json()["draft"]["id"]
    r = client.post(f"/hub/listing-drafts/{draft_id}/submit", headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 422
    steps = {p["step"] for p in r.json()["detail"]["problems"]}
    assert {"property", "details", "photos", "pricing"} <= steps

    data = {
        "street_address": "15 Smith Street", "suburb": "Kellyville", "postcode": 2155, "state": "NSW",
        "property_type": "house", "place_type": "private_room", "unit_label": "Room 2",
        "title": "Bright room near the metro", "description": "A furnished room with a desk and built-in wardrobe.",
        "images": ["https://img.test/room.jpg"], "weekly_price": 320, "available_from": (date.today() + timedelta(days=7)).isoformat(),
        "furnished": True, "bills_included": True, "listing_purpose": "long_term", "lease_months": 6,
    }
    assert client.put(f"/hub/listing-drafts/{draft_id}", headers=auth(VERIFIED_OWNER_ID), json={"data": {**data, "not_a_field": 1}, "step": 7}).status_code == 200
    stored = next(d for d in db.rows("listing_drafts") if d["id"] == draft_id)
    assert "not_a_field" not in stored["data"]
    r = client.post(f"/hub/listing-drafts/{draft_id}/submit", headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 200, r.text
    out = r.json()
    listing = next(l for l in db.rows("listings") if l["id"] == out["listing_id"])
    assert listing["property_id"] == out["property_id"]
    assert listing["unit_label"] == "Room 2"
    assert listing["moderation_status"] == "pending_approval"  # verified owner -> moderation, not live
    props = client.get("/hub/properties", headers=auth(VERIFIED_OWNER_ID)).json()
    assert any(u["id"] == out["listing_id"] for p in props["properties"] for u in p["units"])


def test_renter_accounts_cannot_use_owner_tools(client):
    assert client.get("/hub/properties", headers=auth(SEEKER_ID)).status_code == 403
    assert client.post("/hub/listing-drafts", headers=auth(SEEKER_ID), json={}).status_code == 403


# ---------------------------------------------------------------------------
# Tenancy and maintenance
# ---------------------------------------------------------------------------


def finalised_tenancy(client):
    app_id = start_and_submit(client)
    client.post(f"/hub/applications/{app_id}/owner-action", headers=auth(VERIFIED_OWNER_ID), json={"action": "approve"})
    return client.post(f"/hub/admin/applications/{app_id}/decision", headers=auth(ADMIN_ID), json={"action": "finalise"}).json()["tenancy"]["id"]


def test_rent_schedule_and_payment_record(client):
    tenancy_id = finalised_tenancy(client)
    assert client.post(f"/hub/tenancies/{tenancy_id}/schedule", headers=auth(SEEKER_ID)).status_code == 403
    added = client.post(f"/hub/tenancies/{tenancy_id}/schedule", headers=auth(VERIFIED_OWNER_ID)).json()["added"]
    assert added > 0
    assert client.post(f"/hub/tenancies/{tenancy_id}/schedule", headers=auth(VERIFIED_OWNER_ID)).json()["added"] == 0  # idempotent
    detail = client.get(f"/hub/tenancies/{tenancy_id}", headers=auth(SEEKER_ID)).json()
    first = detail["payments"][0]
    assert "does not collect rent" in detail["payments_note"]
    r = client.post(f"/hub/tenancies/{tenancy_id}/payments/{first['id']}", headers=auth(VERIFIED_OWNER_ID), json={"status": "paid", "method": "bank_transfer"})
    assert r.json()["payment"]["amount_paid"] == first["amount_due"]


def test_maintenance_flow_and_emergency_guidance(client, sent):
    tenancy_id = finalised_tenancy(client)
    r = client.post(f"/hub/tenancies/{tenancy_id}/maintenance", headers=auth(SEEKER_ID), json={"category": "plumbing", "title": "Burst pipe", "description": "Water under the sink", "urgency": "emergency"})
    assert r.status_code == 200, r.text
    assert "000" in r.json()["emergency"]["lines"][0]
    req_id = r.json()["request"]["id"]
    assert any(c["event"] == "maintenance_created" for c in sent)
    # Renter cannot mark it resolved; owner can move it along.
    assert client.post(f"/hub/maintenance/{req_id}/updates", headers=auth(SEEKER_ID), json={"status_to": "resolved"}).status_code == 409
    assert client.post(f"/hub/maintenance/{req_id}/updates", headers=auth(VERIFIED_OWNER_ID), json={"status_to": "resolved", "body": "Fixed"}).status_code == 200
    assert client.post(f"/hub/maintenance/{req_id}/updates", headers=auth(SEEKER_ID), json={"status_to": "closed"}).status_code == 200
    # Owner-only notes stay private.
    client.post(f"/hub/maintenance/{req_id}/updates", headers=auth(VERIFIED_OWNER_ID), json={"body": "Invoice #99", "internal": True})
    renter_updates = client.get(f"/hub/maintenance/{req_id}", headers=auth(SEEKER_ID)).json()["updates"]
    assert all(u["body"] != "Invoice #99" for u in renter_updates)


def test_home_is_role_specific(client):
    renter = client.get("/hub/home", headers=auth(SEEKER_ID)).json()
    owner = client.get("/hub/home", headers=auth(VERIFIED_OWNER_ID)).json()
    assert renter["role"] == "renter" and "next_actions" in renter and "completion" in renter
    assert owner["role"] == "owner" and "portfolio" in owner and "attention" in owner


def test_account_deletion_waits_for_live_tenancies_and_open_applications(client, db):
    # An application in progress blocks deleting either side.
    app_id = start_and_submit(client)
    r = client.delete("/account/delete", headers=auth(SEEKER_ID))
    assert r.status_code == 409 and "applications in progress" in r.json()["detail"]
    assert client.delete("/account/delete", headers=auth(VERIFIED_OWNER_ID)).status_code == 409

    # Withdrawn, it no longer blocks; the Hub rows go with the account.
    assert client.post(f"/hub/applications/{app_id}/withdraw", headers=auth(SEEKER_ID), json={}).status_code == 200
    r = client.delete("/account/delete", headers=auth(SEEKER_ID))
    assert r.status_code == 200, r.text
    assert not [a for a in db.rows("applications") if a["renter_id"] == SEEKER_ID]
    assert not [p for p in db.rows("profiles") if p["id"] == SEEKER_ID]


def test_account_deletion_blocked_by_a_current_tenancy(client):
    finalised_tenancy(client)
    r = client.delete("/account/delete", headers=auth(SEEKER_ID))
    assert r.status_code == 409 and "tenancy" in r.json()["detail"]
    assert client.delete("/account/delete", headers=auth(VERIFIED_OWNER_ID)).status_code == 409


def test_admin_sees_unacknowledged_emergencies_only(client):
    tenancy_id = finalised_tenancy(client)
    r = client.post(f"/hub/tenancies/{tenancy_id}/maintenance", headers=auth(SEEKER_ID), json={"category": "plumbing", "title": "Burst pipe", "description": "Water everywhere", "urgency": "emergency"})
    req_id = r.json()["request"]["id"]
    assert client.get("/hub/admin/emergencies", headers=auth(VERIFIED_OWNER_ID)).status_code == 404
    listed = client.get("/hub/admin/emergencies", headers=auth(ADMIN_ID)).json()["requests"]
    assert [x["id"] for x in listed] == [req_id]
    client.post(f"/hub/maintenance/{req_id}/updates", headers=auth(VERIFIED_OWNER_ID), json={"status_to": "in_progress"})
    assert client.get("/hub/admin/emergencies", headers=auth(ADMIN_ID)).json()["requests"] == []
