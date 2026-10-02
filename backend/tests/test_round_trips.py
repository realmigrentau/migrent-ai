"""
Fewer waits on the database.

hub_actor starts its independent checks together (profile, two-step lookup
and, for an account already seen as an admin, the live session check) but
must still decide in the original order: suspended, then two-step, then
session. These pin that order and the admin bookkeeping behind it, and that
a thread's attachments are signed in one request.
"""

from fastapi import HTTPException

import hub_common
from tests.conftest import ADMIN_ID, SEEKER_ID, auth


def _profile(db, user_id):
    return next(p for p in db.rows("profiles") if p["id"] == user_id)


def _revoke_live_sessions(monkeypatch, calls):
    def revoked(authorization, user_id):
        calls.append(user_id)
        raise HTTPException(status_code=401, detail="Your session has ended. Sign in again.")

    monkeypatch.setattr(hub_common, "require_live_session", revoked)


def test_a_revoked_admin_session_is_refused_on_first_and_later_requests(client, monkeypatch):
    assert client.get("/hub/me", headers=auth(ADMIN_ID)).status_code == 200
    assert ADMIN_ID in hub_common._known_admins

    calls: list[str] = []
    _revoke_live_sessions(monkeypatch, calls)
    r = client.get("/hub/me", headers=auth(ADMIN_ID))
    assert r.status_code == 401 and "session has ended" in r.json()["detail"]
    assert calls == [ADMIN_ID]

    # The same holds for an admin this process has not seen yet.
    hub_common._known_admins.clear()
    assert client.get("/hub/me", headers=auth(ADMIN_ID)).status_code == 401


def test_suspension_is_reported_before_a_revoked_session(client, db, monkeypatch):
    assert client.get("/hub/me", headers=auth(ADMIN_ID)).status_code == 200
    _profile(db, ADMIN_ID).update(disabled_at="2026-10-01T00:00:00+00:00")
    _revoke_live_sessions(monkeypatch, [])
    r = client.get("/hub/me", headers=auth(ADMIN_ID))
    assert r.status_code == 403 and "suspended" in r.json()["detail"]


def test_two_step_is_reported_before_a_revoked_session(client, db, monkeypatch):
    assert client.get("/hub/me", headers=auth(ADMIN_ID)).status_code == 200
    db.mfa_enrolled.add(ADMIN_ID)
    _revoke_live_sessions(monkeypatch, [])
    r = client.get("/hub/me", headers=auth(ADMIN_ID, aal="aal1"))
    assert r.status_code == 401 and "authenticator" in r.json()["detail"]


def test_non_admins_never_trigger_the_live_check(client, monkeypatch):
    calls: list[str] = []
    _revoke_live_sessions(monkeypatch, calls)
    assert client.get("/hub/me", headers=auth(SEEKER_ID)).status_code == 200
    assert client.get("/hub/me", headers=auth(SEEKER_ID)).status_code == 200
    assert calls == [] and SEEKER_ID not in hub_common._known_admins


def test_an_admin_who_loses_the_role_is_forgotten(client, db):
    assert client.get("/hub/me", headers=auth(ADMIN_ID)).status_code == 200
    _profile(db, ADMIN_ID).update(is_admin=False, role="seeker")
    assert client.get("/hub/me", headers=auth(ADMIN_ID)).status_code == 200
    assert ADMIN_ID not in hub_common._known_admins


def test_attachments_in_a_thread_are_signed_in_one_request(db):
    from db import get_supabase_admin
    from routes_messages import _sign_attachments

    msgs = [
        {"id": "m1", "attachment_path": "a/1.png"},
        {"id": "m2", "attachment_path": "a/2.pdf"},
        {"id": "m3", "attachment_path": None},
        {"id": "m4", "attachment_path": "a/1.png"},
    ]
    out = _sign_attachments(get_supabase_admin(), msgs)
    assert db.signed_url_batches == [["a/1.png", "a/2.pdf"]]
    assert out[0]["attachment_url"].startswith("https://storage.test/") and "a/1.png" in out[0]["attachment_url"]
    assert "a/2.pdf" in out[1]["attachment_url"]
    assert "attachment_url" not in out[2] and all("attachment_path" not in m for m in out)
    assert out[3]["attachment_url"] == out[0]["attachment_url"]


def test_keep_warm_refreshes_the_suspended_list_search_reads(db):
    import db as dbmod
    import listing_lifecycle

    listing_lifecycle._suspended_cache.update(until=10**12, ids=["stale"])
    dbmod._warm_once(refresh_keys=False)  # the fake has no Auth health check; that touch is skipped quietly
    assert listing_lifecycle.suspended_owner_ids() == []
