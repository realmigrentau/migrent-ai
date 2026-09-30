"""
The Admin panel's second password.

Admins use Migrent Hub as a normal renter or owner account. The admin tools
sit behind an Admin panel that asks for a separate password, checked here on
the server so a stolen sign-in alone cannot reach them:

  - The password is stored as a salted PBKDF2-SHA256 hash in
    admin_panel_settings (migration 044), never in the code or the browser.
  - A correct password returns an unlock token: signed with a key derived
    from the service role key, bound to the admin and to their sign-in
    session, and valid for UNLOCK_TTL. Every /hub/admin endpoint and the
    older /admin API require it (header X-Migrent-Admin-Unlock), and answer
    423 without it.
  - Three wrong passwords within LOCKOUT_WINDOW lock the panel for that
    account for LOCKOUT_WINDOW, revoke the account's sign-in sessions and
    alert every other admin.
  - Every unlock, wrong password, lockout and password change is written to
    admin_audit_log, which is also where the attempt count is read from.

The Hub locks the panel again after 30 seconds without activity; that part
is in the browser (components/hub/admin/AdminPanel.tsx).
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Header, HTTPException, Request

logger = logging.getLogger(__name__)

UNLOCK_HEADER = "x-migrent-admin-unlock"
UNLOCK_TTL = timedelta(minutes=20)
MAX_ATTEMPTS = 3
LOCKOUT_WINDOW = timedelta(minutes=15)
PBKDF2_ITERATIONS = 600_000
MIN_PASSWORD_LENGTH = 8

LOCKED_DETAIL = "The admin panel is locked. Enter the admin password to open it."


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------


def hash_password(password: str, *, iterations: int = PBKDF2_ITERATIONS, salt: Optional[bytes] = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return "pbkdf2_sha256${}${}${}".format(iterations, base64.b64encode(salt).decode(), base64.b64encode(digest).decode())


def verify_password(password: str, stored: Optional[str]) -> bool:
    try:
        algo, iterations, salt_b64, digest_b64 = (stored or "").split("$")
        if algo != "pbkdf2_sha256":
            return False
        expected = base64.b64decode(digest_b64)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), base64.b64decode(salt_b64), int(iterations))
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(actual, expected)


def stored_hash(sb) -> Optional[str]:
    try:
        rows = sb.table("admin_panel_settings").select("password_hash").eq("id", 1).execute().data or []
    except Exception:
        logger.exception("admin_panel_settings unavailable (has migration 044 run?)")
        return None
    return rows[0].get("password_hash") if rows else None


# ---------------------------------------------------------------------------
# Unlock tokens
# ---------------------------------------------------------------------------


def _key() -> bytes:
    secret = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not secret:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is not set")
    return hashlib.sha256(b"migrent-admin-panel-unlock:" + secret.encode()).digest()


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _unb64(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def session_id(authorization: Optional[str]) -> str:
    """The sign-in session a token belongs to, from the access token Supabase
    already verified. Binding to it means an unlock ends with the sign-in."""
    try:
        token = (authorization or "").split(" ", 1)[1]
        payload = token.split(".")[1]
        return str(json.loads(_unb64(payload)).get("session_id") or "")
    except Exception:
        return ""


def issue_unlock_token(admin_id: str, session: str, now: Optional[datetime] = None) -> str:
    exp = int(((now or datetime.now(timezone.utc)) + UNLOCK_TTL).timestamp())
    body = _b64(json.dumps({"a": admin_id, "s": session, "e": exp}, separators=(",", ":")).encode())
    sig = _b64(hmac.new(_key(), body.encode(), hashlib.sha256).digest())
    return f"{body}.{sig}"


def unlock_token_valid(token: Optional[str], admin_id: str, session: str, now: Optional[datetime] = None) -> bool:
    try:
        body, sig = (token or "").split(".")
        if not hmac.compare_digest(_unb64(sig), hmac.new(_key(), body.encode(), hashlib.sha256).digest()):
            return False
        claims = json.loads(_unb64(body))
    except Exception:
        return False
    moment = (now or datetime.now(timezone.utc)).timestamp()
    return claims.get("a") == admin_id and claims.get("s") == session and moment < float(claims.get("e", 0))


def panel_unlocked(user_id: str, request: Request, authorization: Optional[str]) -> bool:
    return unlock_token_valid(request.headers.get(UNLOCK_HEADER), str(user_id), session_id(authorization))


def require_admin_panel(actor, request: Request, authorization: Optional[str]) -> None:
    """An admin (not viewing as a customer) who has unlocked the Admin panel."""
    from hub_common import require_admin_actor

    require_admin_actor(actor)
    if not panel_unlocked(actor.id, request, authorization):
        raise HTTPException(status_code=423, detail=LOCKED_DETAIL)


def admin_panel_unlocked(request: Request, authorization: Optional[str] = Header(None)) -> None:
    """Dependency for the older admin endpoints (/admin, /admin/spam, the
    owner ID review and the reports queue): an admin needs the same unlock
    there, so the panel password cannot be sidestepped by calling them
    directly. Anyone else passes through to the endpoint's own check, so
    what they see is unchanged. (Hub admin endpoints call those handlers as
    functions after their own check, which does not pass through here.)"""
    from auth_utils import get_optional_user, is_admin_user

    user = get_optional_user(authorization)
    if user is None or not is_admin_user(user):
        return
    if not panel_unlocked(str(user.id), request, authorization):
        raise HTTPException(status_code=423, detail=LOCKED_DETAIL)


# ---------------------------------------------------------------------------
# Attempts and lockout (read from the audit log)
# ---------------------------------------------------------------------------


def _parse(ts) -> Optional[datetime]:
    from hub_common import parse_ts

    return parse_ts(ts)


def attempt_state(sb, admin_id: str, now: Optional[datetime] = None) -> dict:
    """{"locked_until": datetime | None, "failures": int} for this admin."""
    now = now or datetime.now(timezone.utc)
    since = now - LOCKOUT_WINDOW
    rows = (
        sb.table("admin_audit_log")
        .select("action, created_at")
        .eq("admin_id", admin_id)
        .in_("action", ["admin_panel_unlock", "admin_panel_failed", "admin_panel_lockout"])
        .gte("created_at", since.isoformat())
        .order("created_at", desc=True)
        .limit(20)
        .execute()
        .data
        or []
    )
    failures = 0
    for row in rows:  # newest first
        if row["action"] == "admin_panel_lockout":
            at = _parse(row.get("created_at"))
            return {"locked_until": (at + LOCKOUT_WINDOW) if at else now + LOCKOUT_WINDOW, "failures": MAX_ATTEMPTS}
        if row["action"] == "admin_panel_unlock":
            break
        failures += 1
    return {"locked_until": None, "failures": failures}
