"""
Two-step verification is enforced by the server, not only the browser (MIG-019).

- Admin access needs an aal2 session (an authenticator code) as well as the
  panel password.
- An account that has set up an authenticator must use it: an aal1 session
  (password, magic link or Google alone) is refused by the Hub and by the
  routes outside it that change things.
"""

from tests.conftest import ADMIN_ID, ADMIN_PANEL_PASSWORD, SEEKER_ID, VERIFIED_OWNER_ID, auth


def test_admin_panel_needs_a_two_step_sign_in(client, db):
    single = auth(ADMIN_ID, unlocked=False, aal="aal1")
    status = client.get("/hub/admin/panel", headers=single).json()
    assert status["mfa_required"] is True

    r = client.post("/hub/admin/unlock", headers=single, json={"password": ADMIN_PANEL_PASSWORD})
    assert r.status_code == 403 and "two-step" in r.json()["detail"]
    # Refused before the password is checked, so no attempt was used up.
    assert [a for a in db.rows("admin_audit_log") if a["action"].startswith("admin_panel_")] == []

    # Even an unlock token issued earlier does not help an aal1 session.
    assert client.get("/hub/admin/overview", headers=auth(ADMIN_ID, aal="aal1")).status_code == 403
    assert client.get("/admin/pending", headers=auth(ADMIN_ID, aal="aal1")).status_code == 403
    assert client.get("/hub/admin/overview", headers=auth(ADMIN_ID)).status_code == 200


def test_admin_mfa_can_be_switched_off_for_a_local_mock(client, monkeypatch):
    monkeypatch.setenv("ADMIN_REQUIRE_MFA", "false")
    assert client.get("/hub/admin/overview", headers=auth(ADMIN_ID, aal="aal1")).status_code == 200


def test_an_account_with_an_authenticator_must_use_it(client, db):
    db.mfa_enrolled.add(SEEKER_ID)
    assert client.get("/hub/me", headers=auth(SEEKER_ID, aal="aal1")).status_code == 401
    assert client.get("/hub/me", headers=auth(SEEKER_ID, aal="aal2")).status_code == 200
    r = client.post(
        "/messages/send",
        headers=auth(SEEKER_ID, aal="aal1"),
        json={"sender_id": SEEKER_ID, "receiver_id": VERIFIED_OWNER_ID, "message_text": "Hello"},
    )
    assert r.status_code == 401


def test_accounts_without_an_authenticator_are_unchanged(client):
    assert client.get("/hub/me", headers=auth(SEEKER_ID, aal="aal1")).status_code == 200
