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
