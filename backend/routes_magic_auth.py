import logging
import secrets
from datetime import datetime, timedelta, timezone

from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Request
from db import get_supabase, get_supabase_admin
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


class MagicLinkRequest(BaseModel):
    email: EmailStr


class CrossDeviceStore(BaseModel):
    polling_id: str
    access_token: str
    refresh_token: str


class CrossDevicePoll(BaseModel):
    polling_id: str


@router.post("/magic-signup")
@limiter.limit("3/minute")
def magic_signup(request: Request, body: MagicLinkRequest):
    """Send a magic link email for signup (creates user if new)."""
    sb = get_supabase()
    try:
        sb.auth.sign_in_with_otp({
            "email": body.email,
            "options": {"should_create_user": True},
        })
    except Exception:
        logger.exception("Magic signup error")
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    return {"status": "ok", "message": "If an account exists or can be created, a magic link has been sent."}


@router.post("/magic-login")
@limiter.limit("3/minute")
def magic_login(request: Request, body: MagicLinkRequest):
    """Send a magic link email for login (existing users only)."""
    sb = get_supabase()
    try:
        sb.auth.sign_in_with_otp({
            "email": body.email,
            "options": {"should_create_user": False},
        })
    except Exception:
        logger.exception("Magic login error")
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    return {"status": "ok", "message": "If an account with that email exists, a magic link has been sent."}


@router.post("/cross-device/store")
@limiter.limit("10/minute")
def cross_device_store(request: Request, body: CrossDeviceStore):
    """
    Store session tokens after magic link verification on device B (e.g. phone).
    Device A (e.g. laptop) polls for these tokens to auto-login.
    Tokens are stored temporarily and expire after 5 minutes.
    """
    sb = get_supabase_admin()
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()

    try:
        # Upsert into the cross_device_tokens table
        sb.table("cross_device_tokens").upsert({
            "polling_id": body.polling_id,
            "access_token": body.access_token,
            "refresh_token": body.refresh_token,
            "expires_at": expires_at,
        }).execute()
    except Exception:
        logger.exception("Failed to store cross-device token")
        raise HTTPException(status_code=500, detail="Failed to store session.")

    return {"status": "ok"}


@router.post("/cross-device/poll")
@limiter.limit("30/minute")
def cross_device_poll(request: Request, body: CrossDevicePoll):
    """
    Poll for session tokens stored by device B.
    Returns tokens if available, then deletes them (one-time use).
    """
    sb = get_supabase_admin()

    try:
        res = sb.table("cross_device_tokens") \
            .select("access_token, refresh_token, expires_at") \
            .eq("polling_id", body.polling_id) \
            .execute()

        if not res.data:
            return {"status": "waiting"}

        row = res.data[0]

        # Check expiry
        expires_at = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires_at:
            # Expired — delete and return waiting
            sb.table("cross_device_tokens").delete().eq("polling_id", body.polling_id).execute()
            return {"status": "expired"}

        access_token = row["access_token"]
        refresh_token = row["refresh_token"]

        # Delete after reading (one-time use)
        sb.table("cross_device_tokens").delete().eq("polling_id", body.polling_id).execute()

        return {
            "status": "ready",
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    except Exception:
        logger.exception("Failed to poll cross-device token")
        return {"status": "waiting"}
