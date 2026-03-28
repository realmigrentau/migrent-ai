import logging

from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException, Request
from models import UserRegister, UserLogin
from db import get_supabase, get_supabase_admin
from auth_utils import get_current_user
from limiter import limiter


def _get_verified(sb, user_id: str) -> bool:
    """Look up the verified flag from the profiles table. Returns False if no row."""
    try:
        res = sb.table("profiles").select("verified").eq("id", user_id).execute()
        if res.data:
            return bool(res.data[0].get("verified", False))
    except Exception:
        pass
    return False

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
@limiter.limit("5/minute")
def register(request: Request, user: UserRegister):
    sb = get_supabase()
    try:
        res = sb.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {"data": {"user_type": user.type}},
        })
    except Exception as e:
        logger.exception("Registration error")
        raise HTTPException(status_code=400, detail="Registration failed. Check your email and password.")

    if res.user is None:
        raise HTTPException(status_code=400, detail="Registration failed")

    return {
        "user_id": res.user.id,
        "email": res.user.email,
        "access_token": res.session.access_token if res.session else None,
        "verified": _get_verified(sb, res.user.id),
    }


@router.post("/store-legal-acceptance")
@limiter.limit("10/minute")
def store_legal_acceptance(request: Request, authorization: str = Header(...)):
    """Store legal_accepted_at timestamp in the user's profile."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    try:
        # Check if already set
        existing = sb.table("profiles").select("legal_accepted_at").eq("id", str(user.id)).execute()
        if existing.data and existing.data[0].get("legal_accepted_at"):
            return {"status": "already_accepted"}

        # Get from user_metadata or use current time
        meta = user.user_metadata or {}
        accepted_at = meta.get("legal_accepted_at", datetime.now(timezone.utc).isoformat())

        sb.table("profiles").update(
            {"legal_accepted_at": accepted_at}
        ).eq("id", str(user.id)).execute()

        return {"status": "accepted", "legal_accepted_at": accepted_at}
    except Exception as e:
        logger.exception("Failed to store legal acceptance")
        raise HTTPException(status_code=500, detail="Failed to store legal acceptance")


@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, user: UserLogin):
    sb = get_supabase()
    try:
        res = sb.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password,
        })
    except Exception as e:
        logger.exception("Login error")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "user_id": res.user.id,
        "email": res.user.email,
        "access_token": res.session.access_token,
        "verified": _get_verified(sb, res.user.id),
    }
