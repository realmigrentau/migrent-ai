"""
Local token verification (auth_utils.get_current_user).

Tokens signed with the project's asymmetric key are checked in-process
instead of with a network call to Supabase Auth. These pin that a good token
is accepted and that every way a token can be wrong is refused.
"""

import time
from types import SimpleNamespace

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException

import auth_utils

KEY = ec.generate_private_key(ec.SECP256R1())
OTHER_KEY = ec.generate_private_key(ec.SECP256R1())
USER_ID = "11111111-2222-4333-8444-555555555555"


def _token(key=KEY, **over):
    now = int(time.time())
    claims = {
        "sub": USER_ID,
        "email": "renter@example.test",
        "aud": "authenticated",
        "iss": auth_utils.ISSUER,
        "role": "authenticated",
        "iat": now,
        "exp": now + 3600,
        "user_metadata": {"user_type": "seeker"},
        "app_metadata": {"provider": "email"},
    }
    claims.update(over)
    return jwt.encode(claims, key, algorithm="ES256", headers={"kid": "test-kid"})


@pytest.fixture(autouse=True)
def local_key(monkeypatch):
    monkeypatch.setattr(auth_utils._jwks, "get_signing_key_from_jwt", lambda token: SimpleNamespace(key=KEY.public_key()))
    auth_utils._remote_cache.clear()


def test_a_good_token_is_accepted_without_a_network_call(monkeypatch):
    def no_network():
        raise AssertionError("should not call Supabase for an ES256 token")

    monkeypatch.setattr(auth_utils, "get_supabase_admin", no_network)
    user = auth_utils.get_current_user(f"Bearer {_token()}")
    assert user.id == USER_ID
    assert user.email == "renter@example.test"
    assert user.user_metadata == {"user_type": "seeker"}
    assert user.app_metadata == {"provider": "email"}


@pytest.mark.parametrize(
    "token",
    [
        _token(exp=int(time.time()) - 120),
        _token(aud="anon"),
        _token(iss="https://someone-else.supabase.co/auth/v1"),
        _token(key=OTHER_KEY),
    ],
    ids=["expired", "wrong-audience", "wrong-issuer", "forged-signature"],
)
def test_a_bad_token_is_refused(token):
    with pytest.raises(HTTPException) as err:
        auth_utils.get_current_user(f"Bearer {token}")
    assert err.value.status_code == 401


def test_a_token_without_a_subject_is_refused():
    now = int(time.time())
    token = jwt.encode({"aud": "authenticated", "iss": auth_utils.ISSUER, "exp": now + 60}, KEY, algorithm="ES256")
    with pytest.raises(HTTPException):
        auth_utils.get_current_user(f"Bearer {token}")


def test_an_hs256_token_falls_back_to_supabase_and_is_remembered(monkeypatch):
    calls = []

    class FakeAuth:
        def get_user(self, token):
            calls.append(token)
            return SimpleNamespace(user=SimpleNamespace(id=USER_ID, email="renter@example.test"))

    monkeypatch.setattr(auth_utils, "get_supabase_admin", lambda: SimpleNamespace(auth=FakeAuth()))
    token = jwt.encode({"sub": USER_ID, "exp": int(time.time()) + 3600}, "legacy-secret", algorithm="HS256")
    for _ in range(3):
        assert auth_utils.get_current_user(f"Bearer {token}").id == USER_ID
    assert len(calls) == 1


def test_a_missing_or_malformed_header_is_refused():
    for header in ("", "Token abc", "Bearer ", "Bearer    "):
        with pytest.raises(HTTPException) as err:
            auth_utils.get_current_user(header)
        assert err.value.status_code == 401


def test_a_revoked_admin_session_is_refused_even_with_a_valid_token(monkeypatch):
    """Admins are checked live: if Supabase says the session is gone (the
    Admin panel lockout signs the account out everywhere), the request stops
    even though the token itself still verifies."""

    class RevokedAuth:
        def get_user(self, token):
            raise RuntimeError("session not found")

    monkeypatch.setattr(auth_utils, "get_supabase_admin", lambda: SimpleNamespace(auth=RevokedAuth()))
    header = f"Bearer {_token()}"
    assert auth_utils.get_current_user(header).id == USER_ID
    with pytest.raises(HTTPException) as err:
        auth_utils.require_live_session(header, USER_ID)
    assert err.value.status_code == 401


def test_a_live_session_for_someone_else_is_refused(monkeypatch):
    class OtherUser:
        def get_user(self, token):
            return SimpleNamespace(user=SimpleNamespace(id="99999999-0000-4000-8000-000000000000"))

    monkeypatch.setattr(auth_utils, "get_supabase_admin", lambda: SimpleNamespace(auth=OtherUser()))
    with pytest.raises(HTTPException):
        auth_utils.require_live_session(f"Bearer {_token()}", USER_ID)
