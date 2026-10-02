"""
Mentors are listed only after Migrent has checked their government ID and
approved the profile (MIG-018). They meet new arrivals, often in person, and
are paid through Migrent, so they meet the same bar as hosts.
"""

from tests.conftest import ADMIN_ID, OTHER_ID, SEEKER_ID, VERIFIED_OWNER_ID, auth


def _become_mentor(client, user_id: str) -> dict:
    r = client.post(
        "/mentors",
        headers=auth(user_id),
        json={"suburb": "Parramatta", "languages": ["English", "Hindi"], "bio": "Ten years in Parramatta.", "hourly_rate": 3000},
    )
    assert r.status_code == 200, r.text
    return r.json()


def _listed(client) -> list[str]:
    return [m["user_id"] for m in client.get("/mentors").json()["mentors"]]


def test_a_new_mentor_is_not_listed_until_approved(client, db):
    out = _become_mentor(client, SEEKER_ID)
    assert out["mentor"]["review_status"] == "pending"
    assert out["next_step"] == "id_check"  # the seeker fixture has no checked ID
    assert SEEKER_ID not in _listed(client)
    assert client.get(f"/mentors/{out['mentor']['id']}").status_code == 404
    me = client.get("/hub/me", headers=auth(SEEKER_ID)).json()
    assert me["mentor"]["status"] == "pending"
    # A mentor sees the ID check card, so owner_verification is reported.
    assert me["owner_verification"] is not None


def test_approval_needs_a_checked_id(client, db):
    mentor = _become_mentor(client, SEEKER_ID)["mentor"]
    r = client.post(f"/hub/admin/mentors/{mentor['id']}", headers=auth(ADMIN_ID), json={"action": "approve"})
    assert r.status_code == 400 and "ID" in r.json()["detail"]


def test_approved_mentor_is_listed_and_audited(client, db):
    # The verified owner fixture has an approved government ID.
    mentor = _become_mentor(client, VERIFIED_OWNER_ID)
    assert mentor["next_step"] == "approval"
    queue = client.get("/hub/admin/mentors", headers=auth(ADMIN_ID)).json()["mentors"]
    assert [m["id"] for m in queue] == [mentor["mentor"]["id"]]
    assert queue[0]["id_status"] == "approved"

    r = client.post(f"/hub/admin/mentors/{mentor['mentor']['id']}", headers=auth(ADMIN_ID), json={"action": "approve"})
    assert r.status_code == 200 and r.json()["mentor"]["status"] == "approved"
    assert VERIFIED_OWNER_ID in _listed(client)
    listed = client.get(f"/mentors/{mentor['mentor']['id']}").json()
    assert listed["verified"] is True and "review_status" not in listed
    audit = [a for a in db.rows("admin_audit_log") if a["target_type"] == "mentor"]
    assert [(a["action"], a["admin_id"]) for a in audit] == [("approve_mentor", ADMIN_ID)]


def test_rejection_needs_a_reason(client, db):
    mentor = _become_mentor(client, OTHER_ID)["mentor"]
    path = f"/hub/admin/mentors/{mentor['id']}"
    assert client.post(path, headers=auth(ADMIN_ID), json={"action": "reject"}).status_code == 400
    r = client.post(path, headers=auth(ADMIN_ID), json={"action": "reject", "reason": "Please add what you can help with."})
    assert r.status_code == 200 and r.json()["mentor"]["status"] == "rejected"
    assert OTHER_ID not in _listed(client)


def test_changing_an_approved_introduction_goes_back_to_review(client, db):
    mentor = _become_mentor(client, VERIFIED_OWNER_ID)["mentor"]
    client.post(f"/hub/admin/mentors/{mentor['id']}", headers=auth(ADMIN_ID), json={"action": "approve"})
    r = client.patch("/mentors/me", headers=auth(VERIFIED_OWNER_ID), json={"bio": "Message me on WhatsApp for cheap rooms."})
    assert r.status_code == 200 and r.json()["mentor"]["review_status"] == "pending"
    assert VERIFIED_OWNER_ID not in _listed(client)


def test_the_mentor_queue_is_admin_only(client):
    assert client.get("/hub/admin/mentors", headers=auth(SEEKER_ID)).status_code in (403, 404)
    assert client.get("/hub/admin/mentors", headers=auth(ADMIN_ID, unlocked=False)).status_code == 423
