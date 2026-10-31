"""
Launch scan, 29 October 2026.

- A listing link whose id is not a UUID answers 404, not a server error
  (the live API answered /listings/public with a 500).
- The owner ID check never records an email as confirmed when Supabase
  could not be asked: it refuses and stores nothing.
"""

import pytest

from tests.conftest import OTHER_ID, OWNER_ID, auth

BAD_IDS = ("public", "not-a-uuid", "123", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa")


@pytest.fixture()
def uuid_strict_listings(db, monkeypatch):
    """Postgres refuses a non-UUID id before any row is read; the fake does
    not, so make any listings query raise the way PostgREST does."""
    real_table = db.table

    def table(name):
        if name == "listings":
            raise Exception('invalid input syntax for type uuid: "public"')
        return real_table(name)

    monkeypatch.setattr(db, "table", table)


# ── Malformed listing ids ────────────────────────────────────


@pytest.mark.parametrize("bad", BAD_IDS)
def test_a_malformed_listing_id_is_404_for_the_public(client, uuid_strict_listings, bad):
    r = client.get(f"/listings/{bad}")
    assert r.status_code == 404 and r.json()["detail"] == "Listing not found"


@pytest.mark.parametrize(
    "method, path",
    [
        ("post", "/listings/{id}/submit"),
        ("post", "/listings/{id}/renew"),
        ("post", "/listings/{id}/pause"),
        ("post", "/listings/{id}/resume"),
        ("patch", "/listings/{id}"),
        ("delete", "/listings/{id}"),
    ],
)
def test_a_malformed_listing_id_is_404_for_the_owner_routes(client, uuid_strict_listings, method, path):
    bodies = {"/listings/{id}/renew": {"available_to": "2099-01-01"}, "/listings/{id}": {"title": "New title"}}
    kwargs = {"json": bodies[path]} if path in bodies and method != "delete" else {}
    r = getattr(client, method)(path.format(id="not-a-uuid"), headers=auth(OWNER_ID), **kwargs)
    assert r.status_code == 404


# ── Owner ID check: email confirmation ───────────────────────


def test_a_failed_email_lookup_refuses_and_stores_nothing(client, db, monkeypatch):
    def broken(user_id):
        raise Exception("auth admin unavailable")

    monkeypatch.setattr(db.auth.admin, "get_user_by_id", broken)
    r = client.get("/owner-verification/status", headers=auth(OTHER_ID))
    assert r.status_code == 503
    assert not [v for v in db.rows("owner_verification") if v["user_id"] == OTHER_ID]


def test_an_unconfirmed_email_is_recorded_as_unconfirmed(client, db):
    db.users[OTHER_ID].email_confirmed_at = None
    r = client.get("/owner-verification/status", headers=auth(OTHER_ID))
    assert r.status_code == 200 and r.json()["email_verified"] is False
    row = next(v for v in db.rows("owner_verification") if v["user_id"] == OTHER_ID)
    assert row["email_verified"] is False


def test_a_confirmed_email_is_recorded_as_confirmed(client, db):
    r = client.get("/owner-verification/status", headers=auth(OTHER_ID))
    assert r.status_code == 200 and r.json()["email_verified"] is True
