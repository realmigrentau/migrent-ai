"""
The Admin panel's second password (admin_panel.py, /hub/admin/unlock).

What these pin down: every admin endpoint, old and new, answers 423 to an
admin who has not unlocked the panel; the right password unlocks it and the
unlock only works for that account and sign-in; three wrong passwords lock
the panel, sign the account out everywhere and alert every admin; and each
step is written to admin_audit_log.
"""

from datetime import datetime, timedelta, timezone

import pytest

from admin_panel import UNLOCK_HEADER, UNLOCK_TTL, hash_password, issue_unlock_token, unlock_token_valid, verify_password
from tests.conftest import ADMIN_ID, ADMIN_PANEL_PASSWORD, LISTING_LIVE, OTHER_ID, SEEKER_ID, auth
from tests.test_hub import start_and_submit

LOCKED = auth(ADMIN_ID, unlocked=False)


@pytest.fixture()
def alerts(monkeypatch):
    """Security alerts are captured, never sent."""
    calls = []
    import routes_hub_admin

    monkeypatch.setattr(routes_hub_admin, "notify_user", lambda sb, uid, event, title, body, path, **kw: calls.append({"user_id": uid, "event": event, "title": title, "path": path}))
    return calls


def unlock(client, password: str, headers=LOCKED):
    return client.post("/hub/admin/unlock", headers=headers, json={"password": password})


def panel_actions(db) -> list[str]:
    return [a["action"] for a in db.rows("admin_audit_log") if a["action"].startswith("admin_panel_")]


# ---------------------------------------------------------------------------
# Locked by default
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "method, path",
    [
        ("get", "/hub/admin/overview"),
        ("get", "/hub/admin/listings"),
        ("get", "/hub/admin/audit"),
        ("get", "/hub/admin/users?q=sam"),
        ("get", "/hub/admin/applications"),
        ("get", "/admin/pending"),
        ("get", "/admin/spam/stats"),
        ("get", "/owner-verification/admin/pending-ids"),
        ("get", "/reports"),
    ],
)
def test_admin_endpoints_need_the_panel_unlocked(client, method, path):
    assert getattr(client, method)(path, headers=LOCKED).status_code == 423
    assert getattr(client, method)(path, headers=auth(ADMIN_ID)).status_code == 200


def test_customers_see_the_same_answers_as_before(client):
    # The panel check never reveals itself to someone who is not an admin.
    assert client.get("/hub/admin/overview", headers=auth(SEEKER_ID, unlocked=False)).status_code == 404
    assert client.get("/admin/pending", headers=auth(SEEKER_ID, unlocked=False)).status_code == 403
    assert client.get("/reports", headers=auth(SEEKER_ID, unlocked=False)).status_code == 403
    assert unlock(client, ADMIN_PANEL_PASSWORD, headers=auth(SEEKER_ID)).status_code == 404


def test_other_peoples_applications_need_the_panel_unlocked(client):
    app_id = start_and_submit(client)
    assert client.get(f"/hub/applications/{app_id}", headers=LOCKED).status_code == 404
    assert client.get(f"/hub/applications/{app_id}", headers=auth(ADMIN_ID)).status_code == 200


def test_ending_view_as_never_needs_the_panel(client):
    assert client.post("/hub/admin/view-as", headers=auth(ADMIN_ID), json={"user_id": SEEKER_ID, "reason": "Support ticket 42"}).status_code == 200
    assert client.post("/hub/admin/view-as/end", headers=LOCKED, json={"user_id": SEEKER_ID}).status_code == 200


# ---------------------------------------------------------------------------
# Unlocking
# ---------------------------------------------------------------------------


def test_the_right_password_unlocks_the_panel(client, db):
    assert client.get("/hub/admin/panel", headers=LOCKED).json() == {"attempts_left": 3, "locked": False, "mfa_required": False}
    r = unlock(client, ADMIN_PANEL_PASSWORD)
    assert r.status_code == 200 and r.json()["unlocked"] is True
    token = r.json()["token"]
    assert client.get("/hub/admin/overview", headers={**LOCKED, UNLOCK_HEADER: token}).status_code == 200
    assert panel_actions(db) == ["admin_panel_unlock"]


def test_a_success_resets_the_count(client, db, alerts):
    assert unlock(client, "wrong one").json() == {"unlocked": False, "locked": False, "attempts_left": 2}
    assert unlock(client, "wrong two").json()["attempts_left"] == 1
    assert unlock(client, ADMIN_PANEL_PASSWORD).json()["unlocked"] is True
    assert unlock(client, "wrong three").json()["attempts_left"] == 2
    assert alerts == []


def test_three_wrong_passwords_lock_out_sign_out_and_alert_every_admin(client, db, alerts):
    db.seed("profiles", [{"id": OTHER_ID + "-admin", "name": "Second Admin", "is_admin": True, "role": "owner"}])
    assert unlock(client, "guess 1").json()["attempts_left"] == 2
    assert unlock(client, "guess 2").json()["attempts_left"] == 1
    assert unlock(client, "guess 3").json() == {"unlocked": False, "locked": True, "attempts_left": 0}

    assert panel_actions(db) == ["admin_panel_failed"] * 3 + ["admin_panel_lockout"]
    assert db.signed_out == [(LOCKED["Authorization"].split(" ", 1)[1], "global")]
    assert {a["user_id"] for a in alerts} == {ADMIN_ID, OTHER_ID + "-admin"}
    assert all(a["event"] == "admin_security_alert" and "Potential threat" in a["title"] for a in alerts)

    # Locked for everyone on that account, even with the right password.
    assert unlock(client, ADMIN_PANEL_PASSWORD).json()["locked"] is True
    assert client.get("/hub/admin/panel", headers=LOCKED).json() == {"attempts_left": 0, "locked": True, "mfa_required": False}


def test_the_lockout_ends_after_the_window(client, db, alerts):
    for guess in ("a", "b", "c"):
        unlock(client, guess)
    old = (datetime.now(timezone.utc) - timedelta(minutes=16)).isoformat()
    for row in db.rows("admin_audit_log"):
        row["created_at"] = old
    assert unlock(client, ADMIN_PANEL_PASSWORD).json()["unlocked"] is True


def test_no_password_set_up_is_an_honest_error(client, db):
    db.tables["admin_panel_settings"] = []
    assert unlock(client, "anything").status_code == 503
    assert panel_actions(db) == []


# ---------------------------------------------------------------------------
# The unlock token
# ---------------------------------------------------------------------------


def test_an_unlock_belongs_to_one_admin_one_sign_in_and_expires():
    token = issue_unlock_token(ADMIN_ID, "session-1")
    assert unlock_token_valid(token, ADMIN_ID, "session-1")
    assert not unlock_token_valid(token, SEEKER_ID, "session-1")
    assert not unlock_token_valid(token, ADMIN_ID, "session-2")
    assert not unlock_token_valid(token, ADMIN_ID, "session-1", now=datetime.now(timezone.utc) + UNLOCK_TTL + timedelta(seconds=1))
    body, sig = token.split(".")
    assert not unlock_token_valid(f"{body}x.{sig}", ADMIN_ID, "session-1")
    assert not unlock_token_valid("", ADMIN_ID, "session-1")


def test_passwords_are_stored_as_salted_hashes():
    first, second = hash_password("7 letters+"), hash_password("7 letters+")
    assert first != second and "7 letters+" not in first
    assert verify_password("7 letters+", first) and not verify_password("7 letters", first)
    assert not verify_password("anything", None) and not verify_password("anything", "plain-text")


# ---------------------------------------------------------------------------
# Changing the password
# ---------------------------------------------------------------------------


def test_changing_the_password(client, db):
    change = lambda current, new, headers=auth(ADMIN_ID): client.post("/hub/admin/password", headers=headers, json={"current_password": current, "new_password": new})
    assert change(ADMIN_PANEL_PASSWORD, "brand new password", headers=LOCKED).status_code == 423
    assert change("not it", "brand new password").status_code == 400
    assert change(ADMIN_PANEL_PASSWORD, "short").status_code == 400
    assert change(ADMIN_PANEL_PASSWORD, "brand new password").status_code == 200
    assert "admin_panel_password_changed" in panel_actions(db)
    assert unlock(client, ADMIN_PANEL_PASSWORD).json()["unlocked"] is False
    assert unlock(client, "brand new password").json()["unlocked"] is True
    stored = db.rows("admin_panel_settings")[0]
    assert "brand new password" not in stored["password_hash"] and stored["updated_by"] == ADMIN_ID


def test_listing_actions_still_work_once_unlocked(client, db, monkeypatch):
    import routes_admin

    monkeypatch.setattr(routes_admin, "notify", lambda **kw: None)
    monkeypatch.setattr(routes_admin, "send_listing_paused_to_owner", lambda **kw: None)
    r = client.post(f"/hub/admin/listings/{LISTING_LIVE}/action", headers=auth(ADMIN_ID), json={"action": "pause", "reason": "Checking the photos"})
    assert r.status_code == 200, r.text
    assert client.post(f"/hub/admin/listings/{LISTING_LIVE}/action", headers=LOCKED, json={"action": "unpause", "mode": "restore"}).status_code == 423
