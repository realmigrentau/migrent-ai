"""
Phase D admin and operations: unsubscribe (MIG-031), email links (MIG-030),
admin people, metrics and reported conversations (MIG-024), and property
managers' agency details and bulk actions (MIG-026).
"""

from datetime import date, timedelta

import pytest

import unsubscribe
from tests.conftest import ADMIN_ID, LISTING_DRAFT, LISTING_LIVE, OTHER_ID, OWNER_ID, SEEKER_ID, VERIFIED_OWNER_ID, auth


@pytest.fixture
def sent(monkeypatch):
    """Every email that would have gone out, instead of Mailjet."""
    out: list[dict] = []

    def fake(to, subject, html, text="", headers=None):
        out.append({"to": to, "subject": subject, "html": html, "text": text, "headers": headers or {}})

    import email_bookings
    import notification_service

    monkeypatch.setattr(email_bookings, "_send_email", fake)
    monkeypatch.setattr(notification_service, "_send_email", fake)
    return out


# ---------------------------------------------------------------------------
# Unsubscribe
# ---------------------------------------------------------------------------


def test_switchable_emails_carry_an_unsubscribe_link_and_header(sent, monkeypatch):
    from notification_service import notify

    monkeypatch.setenv("RENDER_EXTERNAL_URL", "https://api.example.test")
    notify(SEEKER_ID, "saved_search_match", "2 new homes", "Including a room in Parramatta.", "/hub/saved", recipient_email="sam@example.com", recipient_name="Sam")
    email = sent[-1]
    assert "/unsubscribe?u=" in email["html"] and "saved search alerts" in email["html"]
    assert email["headers"]["List-Unsubscribe"].startswith("<https://api.example.test/email/unsubscribe?")
    assert email["headers"]["List-Unsubscribe-Post"] == "List-Unsubscribe=One-Click"


def test_security_notices_have_no_unsubscribe(sent):
    from notification_service import notify

    notify(ADMIN_ID, "admin_security_alert", "Three wrong passwords", "Someone tried.", "/hub/admin/audit", recipient_email="admin@example.com")
    assert "unsubscribe" not in sent[-1]["html"].lower()
    assert sent[-1]["headers"] == {}


def test_the_link_switches_off_only_that_kind_of_email(client, db):
    tok = unsubscribe.token(SEEKER_ID, "saved_searches")
    r = client.post("/email/unsubscribe", json={"u": SEEKER_ID, "g": "saved_searches", "t": tok})
    assert r.status_code == 200, r.text
    prefs = next(p for p in db.rows("profiles") if p["id"] == SEEKER_ID)["notification_prefs"]["email"]
    assert prefs["saved_searches"] is False and prefs["messages"] is True


def test_one_click_post_from_a_mail_app_works(client, db):
    tok = unsubscribe.token(SEEKER_ID, "applications")
    r = client.post(f"/email/unsubscribe?u={SEEKER_ID}&g=applications&t={tok}", data={"List-Unsubscribe": "One-Click"})
    assert r.status_code == 200, r.text


@pytest.mark.parametrize("body", [{"u": SEEKER_ID, "g": "saved_searches", "t": "0" * 32}, {"u": OTHER_ID, "g": "saved_searches", "t": unsubscribe.token(SEEKER_ID, "saved_searches")}, {"u": SEEKER_ID, "g": "security", "t": "x"}])
def test_a_forged_link_does_nothing(client, body):
    assert client.post("/email/unsubscribe", json=body).status_code == 400


# ---------------------------------------------------------------------------
# Email links
# ---------------------------------------------------------------------------


def test_listing_emails_link_to_the_hub_not_old_pages(sent):
    from email_bookings import send_listing_expiring_to_owner, send_listing_removed_to_owner

    send_listing_expiring_to_owner(owner_email="o@example.com", owner_name="Olive", listing_title="Room", available_to="2026-12-01", listing_id=LISTING_LIVE)
    assert f"/hub/listings/{LISTING_LIVE}/edit" in sent[-1]["html"]
    send_listing_removed_to_owner(owner_email="o@example.com", owner_name="Olive", listing_title="Room", reason="Duplicate listing")
    for e in sent:
        assert "/owner/listings" not in e["html"] and "/dashboard/" not in e["html"] and "/support\"" not in e["html"]


# ---------------------------------------------------------------------------
# Admin: people, a person, numbers, a reported conversation
# ---------------------------------------------------------------------------


def test_people_list_without_a_search_and_with_filters(client):
    everyone = client.get("/hub/admin/users", headers=auth(ADMIN_ID)).json()
    assert everyone["total"] >= 5 and len(everyone["users"]) >= 5
    owners = client.get("/hub/admin/users?role=owner", headers=auth(ADMIN_ID)).json()["users"]
    assert owners and all(u["role"] == "owner" for u in owners)
    checked = client.get("/hub/admin/users?id_status=approved", headers=auth(ADMIN_ID)).json()["users"]
    assert [u["id"] for u in checked] == [VERIFIED_OWNER_ID]
    assert client.get("/hub/admin/users?q=Sam", headers=auth(ADMIN_ID)).json()["users"][0]["id"] == SEEKER_ID


def test_people_list_needs_the_panel(client):
    assert client.get("/hub/admin/users", headers=auth(ADMIN_ID, unlocked=False)).status_code == 423
    assert client.get("/hub/admin/users", headers=auth(SEEKER_ID)).status_code in (403, 404)


def test_a_person_page_brings_listings_reports_and_history_together(client):
    client.post("/reports", headers=auth(SEEKER_ID), json={"item_type": "listing", "item_id": LISTING_LIVE, "category": "Scam or fraud"})
    client.post(f"/hub/admin/users/{VERIFIED_OWNER_ID}/suspend", headers=auth(ADMIN_ID), json={"reason": "Checking a scam report"})
    page = client.get(f"/hub/admin/users/{VERIFIED_OWNER_ID}", headers=auth(ADMIN_ID)).json()
    assert page["person"]["suspended"] is True
    assert page["id_check"]["id_status"] == "approved"
    assert LISTING_LIVE in [l["id"] for l in page["listings"]]
    assert [r["item_id"] for r in page["reports_about"]] == [LISTING_LIVE]
    assert page["history"][0]["action"] == "suspend_user"


def test_numbers_are_counted_not_made_up(client, db):
    m = client.get("/hub/admin/metrics", headers=auth(ADMIN_ID)).json()
    assert m["people"]["accounts"] == len(db.rows("profiles"))
    assert m["homes"]["live"] == sum(1 for l in db.rows("listings") if l["moderation_status"] == "approved")
    assert m["homes"]["drafts"] == 1
    assert m["safety"]["open_reports"] == 0


def test_reading_a_reported_conversation_is_audited(client, db):
    client.post("/hub/enquiries", headers=auth(SEEKER_ID), json={"listing_id": LISTING_LIVE, "text": "Is it available?"})
    client.post(f"/hub/inbox/{LISTING_LIVE}_{SEEKER_ID}/messages", headers=auth(VERIFIED_OWNER_ID), json={"text": "Pay a deposit before the inspection to hold it"})
    report = next(r for r in db.rows("reports") if r.get("source") == "system")
    out = client.get(f"/hub/admin/reports/{report['id']}/conversation", headers=auth(ADMIN_ID)).json()
    assert [m["text"] for m in out["messages"]] == ["Is it available?", "Pay a deposit before the inspection to hold it"]
    assert any(a["action"] == "view_conversation" for a in db.rows("admin_audit_log"))


# ---------------------------------------------------------------------------
# Property managers
# ---------------------------------------------------------------------------


def test_a_property_managers_agency_shows_on_their_listings(client):
    r = client.patch("/hub/settings", headers=auth(VERIFIED_OWNER_ID), json={"owner_kind": "property_manager", "agency_name": "Harbour Rentals", "agency_licence": "10012345"})
    assert r.status_code == 200, r.text
    assert r.json()["agency_name"] == "Harbour Rentals"
    owner = client.get(f"/listings/{LISTING_LIVE}").json()["owner"]
    assert owner["agency"] == {"name": "Harbour Rentals", "licence": "10012345"}


def test_owners_listing_as_themselves_have_no_agency(client):
    r = client.patch("/hub/settings", headers=auth(VERIFIED_OWNER_ID), json={"owner_kind": "individual", "agency_name": "Harbour Rentals"})
    assert r.status_code == 400


def test_bulk_pause_and_renew_report_each_listing(client, db):
    r = client.post("/hub/listings/bulk", headers=auth(VERIFIED_OWNER_ID), json={"listing_ids": [LISTING_LIVE, LISTING_DRAFT], "action": "pause"})
    assert r.status_code == 200, r.text
    results = {x["id"]: x for x in r.json()["results"]}
    assert results[LISTING_LIVE]["ok"] and results[LISTING_LIVE]["moderation_status"] == "paused"
    assert not results[LISTING_DRAFT]["ok"]  # not theirs: refused, and said so
    later = (date.today() + timedelta(days=120)).isoformat()
    r = client.post("/hub/listings/bulk", headers=auth(VERIFIED_OWNER_ID), json={"listing_ids": [LISTING_LIVE], "action": "renew", "available_to": later})
    assert r.json()["changed"] == 1


def test_bulk_actions_are_for_owners(client):
    assert client.post("/hub/listings/bulk", headers=auth(SEEKER_ID), json={"listing_ids": [LISTING_LIVE], "action": "pause"}).status_code == 403
    assert client.post("/hub/listings/bulk", headers=auth(OWNER_ID), json={"listing_ids": [LISTING_LIVE], "action": "delete"}).status_code == 422


# ---------------------------------------------------------------------------
# Phase F: welcome email, listing photos, paid geocoder
# ---------------------------------------------------------------------------


def test_a_new_hub_account_gets_one_welcome_email(client, db, sent):
    for profile in db.rows("profiles"):
        if profile["id"] == OTHER_ID:
            profile["hub_onboarded_at"] = None
            profile.setdefault("email", "olive@example.com")
    body = {"role": "owner", "name": "Olive", "over_18": True, "accept_terms": True}
    assert client.post("/hub/onboarding", headers=auth(OTHER_ID), json=body).status_code == 200
    assert client.post("/hub/onboarding", headers=auth(OTHER_ID), json=body).status_code == 200
    welcomes = [e for e in sent if e["subject"] == "Welcome to Migrent"]
    assert len(welcomes) == 1 and "List a property" in welcomes[0]["html"]


def test_listing_photos_must_be_uploaded_to_migrent():
    from pydantic import ValidationError

    from models import ListingUpdate

    assert ListingUpdate(images=["https://img.test/a.jpg"]).images
    with pytest.raises(ValidationError):
        ListingUpdate(images=["https://hotlink.example.com/a.jpg"])
    with pytest.raises(ValidationError):
        ListingUpdate(images=["http://img.test/a.jpg"])


def test_the_paid_geocoder_needs_a_sign_in(client):
    assert client.post("/geocode/address", json={"address": "1 George Street Sydney"}).status_code == 401
