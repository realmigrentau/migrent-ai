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

from db import SUPABASE_URL, get_supabase

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
        res = get_supabase().auth.get_user(token)
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
        res = get_supabase().auth.get_user(token)
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
    """Validate the token and require an admin role from the database."""
    user = get_current_user(authorization)
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    require_live_session(authorization, str(user.id))
    return user
