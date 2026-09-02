"""
Shared authentication utilities.

Provides get_current_user() for validating Bearer tokens across all route modules.
"""

from fastapi import HTTPException
from db import get_supabase


def get_current_user(authorization: str):
    """Validate the Bearer token via Supabase and return the user."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.removeprefix("Bearer ")
    sb = get_supabase()
    try:
        res = sb.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if res is None or res.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return res.user


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
    return user
