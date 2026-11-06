"""
The password check on "Archive listing", ready for captcha protection.

With captcha on, Supabase refuses a password sign-in that has no token unless
it carries admin credentials, and this server has no token to send. The check
therefore uses the service key on a client of its own. Getting this wrong
locks every email-account owner out of archiving, or signs them out of every
device, so each part is pinned here.
"""

from types import SimpleNamespace

import pytest
from supabase import AuthApiError, ClientOptions, create_client as real_create_client

import routes_listings
from db import SUPABASE_SERVICE_ROLE_KEY, get_supabase_admin
from tests.conftest import LISTING_LIVE, VERIFIED_OWNER_ID, auth


class _Auth:
    def __init__(self, outcome):
        self.outcome = outcome
        self.sign_outs = []

    def sign_in_with_password(self, credentials):
        self.credentials = credentials
        if isinstance(self.outcome, Exception):
            raise self.outcome
        return self.outcome

    def sign_out(self, options=None):
        self.sign_outs.append(options)


@pytest.fixture()
def supabase_auth(monkeypatch):
    """Stands in for the throwaway client and records how it was built."""
    made = SimpleNamespace(key=None, options=None, auth=None, client=None)

    def install(outcome):
        made.auth = _Auth(outcome)

        def create(url, key, options=None):
            made.key, made.options = key, options
            made.client = SimpleNamespace(auth=made.auth)
            return made.client

        monkeypatch.setattr(routes_listings, "create_client", create)
        return made

    return install


def _archive(client, password="the-right-password"):
    return client.request("DELETE", f"/listings/{LISTING_LIVE}", json={"password": password}, headers=auth(VERIFIED_OWNER_ID))


def _status(db):
    return next(l for l in db.rows("listings") if l["id"] == LISTING_LIVE)["moderation_status"]


SIGNED_IN = SimpleNamespace(user=SimpleNamespace(id=VERIFIED_OWNER_ID))


def test_the_right_password_archives_the_listing(client, db, supabase_auth):
    made = supabase_auth(SIGNED_IN)
    assert _archive(client).status_code == 200
    assert _status(db) == "deleted"
    assert made.auth.credentials["password"] == "the-right-password"


def test_it_uses_the_service_key_so_captcha_cannot_refuse_it(client, supabase_auth):
    made = supabase_auth(SIGNED_IN)
    _archive(client)
    assert made.key == SUPABASE_SERVICE_ROLE_KEY


def test_it_never_signs_in_on_the_shared_admin_client(client, supabase_auth):
    made = supabase_auth(SIGNED_IN)
    _archive(client)
    assert made.client is not get_supabase_admin()


def test_it_ends_only_the_session_it_made(client, supabase_auth):
    made = supabase_auth(SIGNED_IN)
    _archive(client)
    assert made.auth.sign_outs == [{"scope": "local"}]


def test_a_wrong_password_says_so_and_changes_nothing(client, db, supabase_auth):
    before = _status(db)
    supabase_auth(AuthApiError("Invalid login credentials", 400, "invalid_credentials"))
    r = _archive(client)
    # Not 401: the Hub turns any 401 into "Your session has ended".
    assert r.status_code == 403
    assert "password" in r.json()["detail"]
    assert _status(db) == before


def test_a_captcha_refusal_is_not_reported_as_a_wrong_password(client, db, supabase_auth):
    before = _status(db)
    supabase_auth(AuthApiError("captcha protection: request disallowed", 400, "captcha_failed"))
    r = _archive(client)
    assert r.status_code == 503
    assert "not right" not in r.json()["detail"]
    assert _status(db) == before


def test_too_many_attempts_is_429(client, db, supabase_auth):
    before = _status(db)
    supabase_auth(AuthApiError("Request rate limit reached", 429, "over_request_rate_limit"))
    assert _archive(client).status_code == 429
    assert _status(db) == before


def test_supabase_being_unreachable_is_503(client, db, supabase_auth):
    before = _status(db)
    supabase_auth(RuntimeError("connection refused"))
    assert _archive(client).status_code == 503
    assert _status(db) == before


def test_no_password_is_still_refused(client, db):
    r = client.request("DELETE", f"/listings/{LISTING_LIVE}", json={}, headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 400


def test_the_real_library_accepts_these_client_options():
    c = real_create_client("https://test.supabase.local", "service-test-key", options=ClientOptions(auto_refresh_token=False, persist_session=False))
    assert c.auth is not None
