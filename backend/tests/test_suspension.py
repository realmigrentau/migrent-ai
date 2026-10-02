"""
Suspension has to stop an account everywhere, not just in Migrent Hub.

Before migration 046 and auth_utils.get_active_user, a suspended account was
refused by /hub/* but could still message people through /messages/send,
create and edit listings, and its listings stayed in search.
"""

from tests.conftest import ADMIN_ID, LISTING_LIVE, SEEKER_ID, VERIFIED_OWNER_ID, auth


def _search_ids(client) -> set[str]:
    data = client.get("/listings/search").json()
    rows = data if isinstance(data, list) else data.get("listings", [])
    return {str(r["id"]) for r in rows}


def _suspend(client, user_id: str) -> None:
    r = client.post(
        f"/hub/admin/users/{user_id}/suspend",
        headers=auth(ADMIN_ID),
        json={"reason": "Asked renters for a deposit before inspecting"},
    )
    assert r.status_code == 200, r.text


def test_suspended_account_cannot_message_through_the_old_endpoint(client, db):
    _suspend(client, SEEKER_ID)
    r = client.post(
        "/messages/send",
        headers=auth(SEEKER_ID),
        json={"sender_id": SEEKER_ID, "receiver_id": VERIFIED_OWNER_ID, "message_text": "Send the bond to my account"},
    )
    assert r.status_code == 403
    assert "suspended" in r.json()["detail"]


def test_suspended_owner_cannot_create_or_edit_listings(client, db):
    _suspend(client, VERIFIED_OWNER_ID)
    r = client.patch(f"/listings/{LISTING_LIVE}", headers=auth(VERIFIED_OWNER_ID), json={"title": "Cheapest room in Sydney"})
    assert r.status_code == 403
    r = client.post(f"/listings/{LISTING_LIVE}/resume", headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 403


def test_suspended_owner_can_still_pause_and_reach_support(client, db):
    _suspend(client, VERIFIED_OWNER_ID)
    assert client.post(f"/listings/{LISTING_LIVE}/pause", headers=auth(VERIFIED_OWNER_ID)).status_code == 200
    r = client.post(
        "/support/tickets",
        headers=auth(VERIFIED_OWNER_ID),
        json={"subject": "Why was I suspended?", "message": "Please tell me what happened."},
    )
    assert r.status_code == 200


def test_suspended_owners_listings_leave_search_and_come_back(client, db):
    assert LISTING_LIVE in _search_ids(client)
    _suspend(client, VERIFIED_OWNER_ID)
    assert LISTING_LIVE not in _search_ids(client)
    assert client.get(f"/listings/{LISTING_LIVE}").status_code == 404

    r = client.post(
        f"/hub/admin/users/{VERIFIED_OWNER_ID}/unsuspend",
        headers=auth(ADMIN_ID),
        json={"reason": "Appeal accepted after a call"},
    )
    assert r.status_code == 200
    assert LISTING_LIVE in _search_ids(client)
    assert client.get(f"/listings/{LISTING_LIVE}").status_code == 200
