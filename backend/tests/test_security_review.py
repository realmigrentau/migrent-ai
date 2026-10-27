"""
Security review, 27 October 2026.

- A search word cannot add its own condition to the database filter (the
  public search let one probe a listing's private street address).
- Every signed-in route asks for the two-step code on an account that has
  set one up, not only the Hub and the routes that change something; a
  failed lookup refuses rather than waving the session through.
- An admin's management view of a listing needs the two-step sign-in too.
- An ID document's type comes from its own bytes, not the browser's label.
- Odd characters in a secret answer "no", not a server error.
"""

import io

import unsubscribe
from db import filter_term
from tests.conftest import ADMIN_ID, LISTING_LIVE, OWNER_ID, SEEKER_ID, auth

PNG_1PX = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000d49444154789c63000100000005000100a0e8b1d50000000049454e44ae426082"
)


# ── Search words stay words ─────────────────────────────────


def test_filter_term_keeps_words_and_drops_filter_syntax():
    assert filter_term("St Kilda") == "St Kilda"
    assert filter_term("O'Connor") == "O'Connor"
    assert filter_term("jo_doe+1@mail.example") == "jo_doe+1@mail.example"
    assert filter_term(None) == ""
    for attack in ("x%,address.ilike.12*,city.ilike.%x", "x),and(id.eq.1", '"q"', "a*b%c"):
        cleaned = filter_term(attack)
        assert not set(cleaned) & set(',()"*%'), (attack, cleaned)
    assert len(filter_term("a" * 500)) == 80


def test_public_search_cannot_probe_a_private_street_address(client):
    # The live listing is at "12 Example Street", Kellyville, Sydney.
    plain = client.get("/listings/search", params={"address": "Kellyville", "limit": 50})
    assert LISTING_LIVE in {row["id"] for row in plain.json()}

    # Before the fix this added "address starts with 12 Example" to the
    # filter, and the listing came back: a yes/no answer about a field
    # that is never shown.
    probe = client.get("/listings/search", params={"address": "zzqq%,address.ilike.12 Example%,city.ilike.%zzqq", "limit": 50})
    assert probe.status_code == 200
    assert LISTING_LIVE not in {row["id"] for row in probe.json()}

    # Broken filter syntax used to reach the database and come back as a 500.
    assert client.get("/listings/search", params={"address": "a,b("}).status_code == 200


def test_admin_people_search_cannot_add_conditions(client, db):
    r = client.get("/hub/admin/users", params={"q": "nobody-here),id.not.is.null,name.ilike.(x"}, headers=auth(ADMIN_ID))
    assert r.status_code == 200
    assert r.json()["users"] == []


# ── Two-step verification on every signed-in route ──────────


def test_password_only_sessions_cannot_read_an_account_with_two_step(client, db):
    db.mfa_enrolled.add(SEEKER_ID)
    single, double = auth(SEEKER_ID, aal="aal1"), auth(SEEKER_ID, aal="aal2")
    for path in ("/profiles/me", "/messages/threads", "/bookings/me", "/notification-center"):
        r = client.get(path, headers=single)
        assert r.status_code == 401, path
        assert "authenticator" in r.json()["detail"], path
    assert client.get("/profiles/me", headers=double).status_code == 200


def test_accounts_without_two_step_still_read_with_a_password_session(client):
    assert client.get("/profiles/me", headers=auth(SEEKER_ID, aal="aal1")).status_code == 200


def test_a_failed_two_step_lookup_refuses_instead_of_letting_through(client, db, monkeypatch):
    def broken(name, params=None):
        raise RuntimeError("connection reset")

    monkeypatch.setattr(db, "rpc", broken)
    r = client.get("/profiles/me", headers=auth(SEEKER_ID, aal="aal1"))
    assert r.status_code == 503


def test_a_missing_two_step_function_is_skipped_not_fatal(client, db, monkeypatch):
    def missing(name, params=None):
        raise RuntimeError("{'code': 'PGRST202', 'message': 'Could not find the function public.user_mfa_enrolled'}")

    monkeypatch.setattr(db, "rpc", missing)
    assert client.get("/profiles/me", headers=auth(SEEKER_ID, aal="aal1")).status_code == 200


def test_admin_listing_management_view_needs_two_step(client):
    single = client.get(f"/listings/{LISTING_LIVE}", headers=auth(ADMIN_ID, aal="aal1"))
    assert single.status_code == 200
    assert single.json()["viewer"]["can_moderate"] is False, "an aal1 admin session got the management view"
    assert "12 Example Street" not in single.text

    double = client.get(f"/listings/{LISTING_LIVE}", headers=auth(ADMIN_ID, aal="aal2"))
    assert double.json()["viewer"]["can_moderate"] is True


# ── ID documents ────────────────────────────────────────────


def test_id_upload_refuses_a_file_whose_bytes_are_not_an_image_or_pdf(client, db):
    r = client.post(
        "/owner-verification/id/upload",
        headers=auth(OWNER_ID),
        data={"document_type": "passport"},
        files={"file": ("passport.png", io.BytesIO(b"<html><script>alert(1)</script></html>"), "image/png")},
    )
    assert r.status_code == 400
    assert not db.storage_objects.get("owner-id-docs")


def test_id_upload_names_the_file_by_its_real_type(client, db):
    r = client.post(
        "/owner-verification/id/upload",
        headers=auth(OWNER_ID),
        data={"document_type": "passport"},
        files={"file": ("passport.html", io.BytesIO(PNG_1PX), "application/pdf")},
    )
    assert r.status_code == 200, r.text
    paths = list(db.storage_objects["owner-id-docs"])
    assert len(paths) == 1 and paths[0].startswith(f"{OWNER_ID}/passport_") and paths[0].endswith(".png")


# ── Secrets with odd characters ─────────────────────────────


def test_cron_secret_with_non_ascii_characters_is_refused_not_a_crash(client, monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "right-secret")
    r = client.post("/internal/cron/expire-listings", headers={"X-Cron-Secret": "wr\xf6ng".encode("latin-1")})
    assert r.status_code == 401


def test_unsubscribe_token_with_non_ascii_characters_is_refused_not_a_crash(client):
    group = next(iter(unsubscribe.GROUP_LABELS))
    r = client.post("/email/unsubscribe", json={"u": SEEKER_ID, "g": group, "t": "töken"})
    assert r.status_code == 400
