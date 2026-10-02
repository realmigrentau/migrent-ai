"""
Deleting an account (MIG-016): a fresh sign-in first, nothing deleted while
a report about the person is open, and every file they uploaded goes too.
"""

import jwt as pyjwt

from tests.conftest import OTHER_ID, SEEKER_ID, VERIFIED_OWNER_ID, auth


def _stale_sign_in(user_id: str) -> dict:
    token = pyjwt.encode(
        {"sub": user_id, "aal": "aal1", "amr": [{"method": "password", "timestamp": 1_700_000_000}]},
        "test-secret",
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


def test_deleting_needs_a_recent_sign_in(client, db):
    r = client.delete("/account/delete", headers=_stale_sign_in(OTHER_ID))
    assert r.status_code == 428 and "sign in again" in r.json()["detail"]
    assert [p for p in db.rows("profiles") if p["id"] == OTHER_ID]


def test_an_open_report_about_the_account_pauses_deletion(client, db):
    db.seed("reports", [{"id": "rep-1", "reporter_id": SEEKER_ID, "item_type": "user", "item_id": OTHER_ID, "listing_id": OTHER_ID, "status": "pending", "reason": "Asked for money"}])
    r = client.delete("/account/delete", headers=auth(OTHER_ID))
    assert r.status_code == 409 and "report" in r.json()["detail"]


def test_a_report_on_one_of_their_listings_pauses_deletion(client, db):
    from tests.conftest import LISTING_LIVE

    db.seed("reports", [{"id": "rep-2", "reporter_id": SEEKER_ID, "item_type": "listing", "item_id": LISTING_LIVE, "listing_id": LISTING_LIVE, "status": "reviewing", "reason": "Fake photos"}])
    assert client.delete("/account/delete", headers=auth(VERIFIED_OWNER_ID)).status_code == 409


def test_their_files_are_deleted_with_the_account(client, db):
    store = db.storage_objects
    store.setdefault("owner-id-docs", {})[f"{OTHER_ID}/passport_1.jpg"] = b"id"
    store.setdefault("renter-documents", {})[f"{OTHER_ID}/payslip.pdf"] = b"doc"
    store.setdefault("message-attachments", {})[f"{OTHER_ID}/1_abc.jpg"] = b"att"
    store.setdefault("avatars", {})[f"profile-photos/{OTHER_ID}.webp"] = b"me"
    store.setdefault("renter-documents", {})[f"{SEEKER_ID}/keep.pdf"] = b"someone else's"

    r = client.delete("/account/delete", headers=auth(OTHER_ID))
    assert r.status_code == 200, r.text
    left = {b: [k for k in objs if OTHER_ID in k] for b, objs in store.items()}
    assert all(not keys for keys in left.values()), left
    assert f"{SEEKER_ID}/keep.pdf" in store["renter-documents"]
