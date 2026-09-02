"""
Access-control matrix.

Roles: anon, seeker, owner (of the resource), other authenticated user,
admin. Each row asserts the status the API returns. IDOR attempts use a
valid token for the wrong user.
"""

import pytest

from tests.conftest import (
    ADMIN_ID,
    LISTING_DRAFT,
    LISTING_LIVE,
    OTHER_ID,
    OWNER_ID,
    SEEKER_ID,
    VERIFIED_OWNER_ID,
    auth,
)

BOOKING_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1"


@pytest.fixture()
def seeded(db):
    db.seed(
        "bookings",
        [
            {
                "id": BOOKING_ID,
                "listing_id": LISTING_LIVE,
                "owner_id": VERIFIED_OWNER_ID,
                "seeker_id": SEEKER_ID,
                "status": "PENDING_OWNER",
                "check_in_date": "2026-10-01",
                "check_out_date": "2026-11-01",
                "guests": 1,
                "weekly_price_at_time": 300,
                "total_price": 1500,
                "stripe_session_id": None,
            }
        ],
    )
    db.seed(
        "messages",
        [
            {"id": "cccccccc-cccc-4ccc-8ccc-ccccccccccc1", "sender_id": SEEKER_ID, "receiver_id": VERIFIED_OWNER_ID,
             "listing_id": None, "message_text": "hi", "read_at": None, "created_at": "2026-08-01T00:00:00+00:00"},
        ],
    )
    return db


def _no_auth():
    return {}


@pytest.mark.parametrize(
    "method,path,role,expected",
    [
        # Listing management: only the owner.
        ("patch", f"/listings/{LISTING_LIVE}", "anon", 422),
        ("patch", f"/listings/{LISTING_LIVE}", "seeker", 403),
        ("patch", f"/listings/{LISTING_LIVE}", "other", 403),
        ("patch", f"/listings/{LISTING_LIVE}", "owner", 200),
        ("post", f"/listings/{LISTING_LIVE}/pause", "seeker", 403),
        ("post", f"/listings/{LISTING_LIVE}/pause", "owner", 200),
        ("post", f"/listings/{LISTING_DRAFT}/renew", "seeker", 403),
        # Admin endpoints: admin only, and never via user_metadata.
        ("get", "/admin/pending", "anon", 422),
        ("get", "/admin/pending", "seeker", 403),
        ("get", "/admin/pending", "owner", 403),
        ("get", "/admin/pending", "admin", 200),
        ("post", f"/admin/listings/{LISTING_LIVE}/pause", "owner", 403),
        ("post", f"/admin/listings/{LISTING_LIVE}/pause", "admin", 200),
        ("get", "/owner-verification/admin/pending-ids", "owner", 403),
        ("get", "/owner-verification/admin/pending-ids", "admin", 200),
        # Bookings: participants only.
        ("get", f"/bookings/{BOOKING_ID}", "anon", 422),
        ("get", f"/bookings/{BOOKING_ID}", "other", 403),
        ("get", f"/bookings/{BOOKING_ID}", "seeker", 200),
        ("get", f"/bookings/{BOOKING_ID}", "owner", 200),
        ("post", f"/bookings/{BOOKING_ID}/respond", "seeker", 403),
        ("post", f"/bookings/{BOOKING_ID}/respond", "other", 403),
        ("post", f"/bookings/{BOOKING_ID}/cancel", "other", 403),
        ("post", f"/bookings/{BOOKING_ID}/cancel", "owner", 403),
        # Internal cron: secret header only.
        ("post", "/internal/cron/expire-listings", "anon", 401),
        ("post", "/internal/cron/expire-listings", "admin", 401),
        # Private profile: own only.
        ("get", "/profiles/me", "anon", 422),
        ("get", "/profiles/me/export", "anon", 422),
        ("get", "/profiles/me/export", "seeker", 200),
    ],
)
def test_matrix(client, seeded, method, path, role, expected):
    headers = {
        "anon": _no_auth(),
        "seeker": auth(SEEKER_ID),
        "owner": auth(VERIFIED_OWNER_ID),
        "other": auth(OTHER_ID),
        "admin": auth(ADMIN_ID),
    }[role]
    body = None
    if path.endswith("/respond"):
        body = {"action": "decline"}
    elif path.endswith("/renew"):
        body = {"available_to": "2027-01-01"}
    elif path.startswith("/admin/listings") and path.endswith("/pause"):
        body = {"reason": "Photos are not of the property", "required_actions": ["Upload real photos"]}
    elif method == "patch" and path.startswith("/listings/"):
        body = {"title": "Renamed"}
    fn = getattr(client, method)
    r = fn(path, json=body, headers=headers) if body is not None else fn(path, headers=headers)
    assert r.status_code == expected, f"{method.upper()} {path} as {role}: {r.status_code} {r.text[:200]}"


def test_user_metadata_role_does_not_grant_admin(client, db):
    db.users[SEEKER_ID].user_metadata["role"] = "superadmin"
    r = client.get("/admin/pending", headers=auth(SEEKER_ID))
    assert r.status_code == 403


def test_seeker_cannot_read_another_users_thread(client, seeded):
    # OTHER is not a participant; the query is scoped to the caller so they see nothing.
    r = client.get(f"/messages/direct/{VERIFIED_OWNER_ID}", headers=auth(OTHER_ID))
    assert r.status_code == 200
    assert r.json()["messages"] == []
    r = client.get(f"/messages/direct/{VERIFIED_OWNER_ID}", headers=auth(SEEKER_ID))
    assert len(r.json()["messages"]) == 1


def test_cannot_send_message_as_someone_else(client, seeded):
    r = client.post(
        "/messages/send",
        json={"sender_id": SEEKER_ID, "receiver_id": OTHER_ID, "message_text": "spoofed"},
        headers=auth(OTHER_ID),
    )
    assert r.status_code == 403


def test_listing_context_must_belong_to_conversation(client, seeded):
    # The `to` recipient does not own LISTING_LIVE, so the thread context is refused.
    r = client.post(
        "/messages/send",
        json={"sender_id": SEEKER_ID, "receiver_id": OTHER_ID, "listing_id": LISTING_LIVE, "message_text": "hi"},
        headers=auth(SEEKER_ID),
    )
    assert r.status_code == 403
    r = client.post(
        "/messages/send",
        json={"sender_id": SEEKER_ID, "receiver_id": VERIFIED_OWNER_ID, "listing_id": LISTING_LIVE, "message_text": "hi"},
        headers=auth(SEEKER_ID),
    )
    assert r.status_code == 200


def test_attachment_path_must_be_namespaced_to_sender(client, seeded):
    r = client.post(
        "/messages/send",
        json={"sender_id": SEEKER_ID, "receiver_id": VERIFIED_OWNER_ID, "message_text": "file",
              "attachment_path": f"{OTHER_ID}/stolen.pdf", "attachment_name": "x.pdf", "attachment_type": "application/pdf"},
        headers=auth(SEEKER_ID),
    )
    assert r.status_code == 400
    # A public attachment_url from the legacy client is dropped, never stored.
    r = client.post(
        "/messages/send",
        json={"sender_id": SEEKER_ID, "receiver_id": VERIFIED_OWNER_ID, "message_text": "file",
              "attachment_url": "https://evil.example/x", "attachment_name": "x", "attachment_type": "image/png"},
        headers=auth(SEEKER_ID),
    )
    assert r.status_code == 200
    assert r.json()["message"]["attachment_url"] is None


def test_owner_cannot_pause_other_owners_listing(client, seeded):
    r = client.post(f"/listings/{LISTING_LIVE}/pause", headers=auth(OWNER_ID))
    assert r.status_code == 403


def test_deal_creation_is_retired(client):
    r = client.post("/deals/create", json={"owner_id": VERIFIED_OWNER_ID, "seeker_id": SEEKER_ID, "listing_id": LISTING_LIVE}, headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 410
