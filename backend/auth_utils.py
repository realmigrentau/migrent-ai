"""
Shared authentication utilities.

Provides get_current_user() for validating Bearer tokens across all route modules.
"""

import hashlib
import logging
import threading
import time
from dataclasses import dataclass, field
from typing import Any, Optional

import jwt
from fastapi import HTTPException

from db import SUPABASE_URL, get_supabase_admin

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Verifying a sign-in token
#
# This used to ask Supabase Auth over the network on every request, on a
# brand-new connection each time, from a server a long way from the
# database. That alone added half a second or more to every signed-in call,
# and a Hub page makes several.
#
# Supabase now signs tokens with an asymmetric key (ES256) and publishes the
# public half, so a token can be checked right here: signature, expiry,
# audience and issuer. The public keys are fetched once and cached; an
# unknown key id triggers one refetch, so a key rotation just works.
#
# Tokens that cannot be checked locally (an older HS256 token, or the key
# set being unreachable) fall back to asking Supabase, and that answer is
# remembered for up to a minute, never past the token's own expiry.
#
# What this changes: a token that was signed out stays usable until it
# expires (at most an hour), which is how Supabase's own getClaims works.
# Disabled accounts are still refused by the profile checks in the Hub.
# Admins are the exception: require_live_session() asks Supabase on every
# admin request, uncached, so signing an admin out everywhere (the Admin
# panel lockout does this) takes effect at once.
# ---------------------------------------------------------------------------

ISSUER = f"{SUPABASE_URL}/auth/v1"
_jwks = jwt.PyJWKClient(f"{ISSUER}/.well-known/jwks.json", cache_jwk_set=True, lifespan=3600, timeout=5)


def refresh_signing_keys() -> None:
    """Fetch the key set now (db.start_keep_warm calls this on a timer), so
    a request never waits on the hourly refetch."""
    _jwks.get_signing_keys(refresh=True)

REMOTE_CACHE_SECONDS = 60
REMOTE_CACHE_MAX = 2000
_remote_cache: dict[str, tuple[float, Any]] = {}
_remote_lock = threading.Lock()


@dataclass
class TokenUser:
    """The parts of a Supabase user the API reads, taken from a verified token."""

    id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    user_metadata: dict = field(default_factory=dict)
    app_metadata: dict = field(default_factory=dict)
    is_anonymous: bool = False


def _verify_locally(token: str) -> Optional[TokenUser]:
    """A TokenUser for a valid asymmetric token, None when it cannot be
    checked here. Raises HTTPException for a token that is checkable and bad."""
    try:
        header = jwt.get_unverified_header(token)
    except jwt.PyJWTError:
        return None  # not a JWT this module can read; let Supabase decide
    if header.get("alg") not in ("ES256", "RS256"):
        return None
    try:
        key = _jwks.get_signing_key_from_jwt(token)
    except jwt.PyJWKClientError:
        return None
    try:
        claims = jwt.decode(
            token,
            key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            issuer=ISSUER,
            leeway=30,
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return TokenUser(
        id=str(claims["sub"]),
        email=claims.get("email") or None,
        phone=claims.get("phone") or None,
        role=claims.get("role"),
        user_metadata=claims.get("user_metadata") or {},
        app_metadata=claims.get("app_metadata") or {},
        is_anonymous=bool(claims.get("is_anonymous")),
    )


def _verify_remotely(token: str):
    key = hashlib.sha256(token.encode()).hexdigest()
    now = time.monotonic()
    with _remote_lock:
        hit = _remote_cache.get(key)
        if hit and hit[0] > now:
            return hit[1]
    try:
        res = get_supabase_admin().auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if res is None or res.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    ttl = REMOTE_CACHE_SECONDS
    try:
        exp = jwt.decode(token, options={"verify_signature": False}).get("exp")
        if exp:
            ttl = max(0.0, min(ttl, float(exp) - time.time()))
    except jwt.PyJWTError:
        pass
    with _remote_lock:
        if len(_remote_cache) >= REMOTE_CACHE_MAX:
            _remote_cache.clear()
        _remote_cache[key] = (now + ttl, res.user)
    return res.user


def require_live_session(authorization: str, user_id: str) -> None:
    """Ask Supabase, uncached, whether this token's session still exists.

    For admin requests only: local verification cannot see a session that
    was revoked, and an admin session is the one worth revoking instantly.
    """
    token = (authorization or "").removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    try:
        res = get_supabase_admin().auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Your session has ended. Sign in again.")
    if res is None or res.user is None or str(res.user.id) != str(user_id):
        raise HTTPException(status_code=401, detail="Your session has ended. Sign in again.")


def get_current_user(authorization: str):
    """Validate the Bearer token and return the user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    user = _verify_locally(token)
    if user is not None:
        return user
    return _verify_remotely(token)


# ---------------------------------------------------------------------------
# Suspended accounts
#
# An admin suspends an account by setting profiles.disabled_at (Admin panel >
# People). Migrent Hub's hub_actor() refuses suspended accounts; the routes
# outside the Hub that change something call get_active_user() instead of
# get_current_user() so a suspension stops them too (sending messages,
# creating or editing listings, bookings, reviews, mentor actions, profile
# edits). Reading, contacting support, reporting, pausing or deleting your own
# listing and deleting the account stay open to a suspended account.
#
# The answer is cached for a few seconds per account, so a burst of calls
# costs one lookup; forget_account_status() drops the cache entry when an
# admin suspends or reinstates someone, so it applies at once on this
# instance and within ACTIVE_CACHE_SECONDS everywhere else.
# ---------------------------------------------------------------------------

SUSPENDED_DETAIL = "This account has been suspended. Contact support if you think this is a mistake."
ACTIVE_CACHE_SECONDS = 15
_active_cache: dict[str, tuple[float, bool]] = {}
_active_lock = threading.Lock()


def account_is_suspended(user_id: str) -> bool:
    now = time.monotonic()
    with _active_lock:
        hit = _active_cache.get(user_id)
        if hit and hit[0] > now:
            return hit[1]
    from db import get_supabase_admin

    try:
        res = get_supabase_admin().table("profiles").select("disabled_at").eq("id", user_id).execute()
    except Exception:
        # Fail closed: a write that cannot confirm the account is active
        # does not go ahead.
        raise HTTPException(status_code=503, detail="We could not confirm your account just now. Try again in a moment.")
    suspended = bool(res.data and res.data[0].get("disabled_at"))
    with _active_lock:
        if len(_active_cache) >= REMOTE_CACHE_MAX:
            _active_cache.clear()
        _active_cache[user_id] = (now + ACTIVE_CACHE_SECONDS, suspended)
    return suspended


def forget_account_status(user_id: str) -> None:
    with _active_lock:
        _active_cache.pop(str(user_id), None)


def get_active_user(authorization: str):
    """get_current_user(), refusing suspended accounts (403) and sessions
    that skipped a two-step check the account has set up."""
    user = get_current_user(authorization)
    uid = str(user.id)
    # Both lookups are cached briefly; on a miss they are separate round
    # trips, so start them together and decide in the original order.
    mfa_known = False if session_aal(authorization) == "aal2" else mfa_enrolled_cached(uid)
    if mfa_known is None:
        from concurrency import run_parallel

        suspended, mfa_known = run_parallel(lambda: account_is_suspended(uid), lambda: mfa_enrolled(uid))
    else:
        suspended = account_is_suspended(uid)
    if suspended:
        raise HTTPException(status_code=403, detail=SUSPENDED_DETAIL)
    if mfa_known:
        raise HTTPException(status_code=401, detail=MFA_STEP_UP_DETAIL)
    return user


# ---------------------------------------------------------------------------
# Two-step verification (MFA)
#
# Supabase records how a session signed in as the `aal` claim of the access
# token: aal1 for a password, magic link or Google alone, aal2 once an
# authenticator code was also entered. The Hub already asks for the code in
# the browser when an account has an authenticator; these checks make the
# server insist on it too, so a stolen password cannot be used against the
# API directly.
#
#  - require_mfa_if_enrolled: an account with a verified authenticator must
#    present an aal2 session. Whether it has one is read from auth.mfa_factors
#    through the user_mfa_enrolled() database function (migration 046) and
#    cached briefly. If that function is missing (the API deployed before the
#    migration), this check is skipped with a warning rather than locking
#    everyone out.
#  - Admin access always needs aal2 (admin_panel.require_admin_mfa).
# ---------------------------------------------------------------------------

MFA_STEP_UP_DETAIL = "Enter the code from your authenticator app to continue."
MFA_CACHE_SECONDS = 120
_mfa_cache: dict[str, tuple[float, bool]] = {}
_mfa_lock = threading.Lock()


def token_claims(authorization: Optional[str]) -> dict:
    """The claims of an access token. Only call this after the token has been
    verified (get_current_user); the signature is not checked again here."""
    token = (authorization or "").removeprefix("Bearer ").strip()
    try:
        return jwt.decode(token, options={"verify_signature": False}) or {}
    except jwt.PyJWTError:
        return {}


def session_aal(authorization: Optional[str]) -> str:
    return str(token_claims(authorization).get("aal") or "aal1")


def mfa_enrolled_cached(user_id: str) -> Optional[bool]:
    """mfa_enrolled()'s remembered answer, or None when it would have to ask."""
    with _mfa_lock:
        hit = _mfa_cache.get(user_id)
        return hit[1] if hit and hit[0] > time.monotonic() else None


def mfa_enrolled(user_id: str) -> bool:
    now = time.monotonic()
    with _mfa_lock:
        hit = _mfa_cache.get(user_id)
        if hit and hit[0] > now:
            return hit[1]
    try:
        res = get_supabase_admin_client().rpc("user_mfa_enrolled", {"uid": user_id}).execute()
        enrolled = bool(res.data)
    except Exception:
        logger.warning("user_mfa_enrolled() unavailable; two-step check skipped (has migration 046 run?)")
        return False
    with _mfa_lock:
        if len(_mfa_cache) >= REMOTE_CACHE_MAX:
            _mfa_cache.clear()
        _mfa_cache[user_id] = (now + MFA_CACHE_SECONDS, enrolled)
    return enrolled


def require_mfa_if_enrolled(user_id: str, authorization: Optional[str]) -> None:
    if session_aal(authorization) == "aal2":
        return
    if mfa_enrolled(user_id):
        raise HTTPException(status_code=401, detail=MFA_STEP_UP_DETAIL)


def get_supabase_admin_client():
    from db import get_supabase_admin

    return get_supabase_admin()


def is_admin_user(user) -> bool:
    """True if the user holds an admin role, per the database.

    Reads profiles.is_admin / profiles.role under the service role. Never
    consults user_metadata: Supabase lets any signed-in user rewrite their own
    user_metadata via auth.updateUser({ data: ... }), so a role claim from
    there is attacker-controlled. Use this for any check that grants
    privilege; user_type in user_metadata is fine for choosing a UI mode,
    which is not a privilege.
    """
    from db import get_supabase_admin

    sb = get_supabase_admin()
    try:
        res = sb.table("profiles").select("is_admin, role").eq("id", str(user.id)).execute()
    except Exception:
        return False
    if not res.data:
        return False
    row = res.data[0]
    return bool(row.get("is_admin")) or row.get("role") in ("superadmin", "admin")


def get_optional_user(authorization):
    """Like get_current_user, but None for missing or invalid tokens."""
    if not authorization:
        return None
    try:
        return get_current_user(authorization)
    except HTTPException:
        return None


def require_admin(authorization: str):
    """Validate the token and require an admin role from the database, a
    live session and a two-step sign-in."""
    user = get_current_user(authorization)
    from concurrency import run_parallel

    def live_check() -> Optional[HTTPException]:
        try:
            require_live_session(authorization, str(user.id))
        except HTTPException as e:
            return e
        return None

    # Two independent round trips: ask both at once, decide role first.
    is_admin, live_error = run_parallel(lambda: is_admin_user(user), live_check)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    if live_error is not None:
        raise live_error
    from admin_panel import require_admin_mfa

    require_admin_mfa(authorization)
    return user
