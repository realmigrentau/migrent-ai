"""
Email verification code endpoints for signup verification and optional 2FA.

Signup flow:
  1. POST /codes/send-signup-code  - generates + emails a 6-digit code
  2. POST /codes/verify-signup     - validates code, marks email_verified

2FA flow:
  1. POST /codes/send-2fa-code     - generates + emails a 6-digit code (requires auth)
  2. POST /codes/verify-2fa        - validates 2FA code
  3. POST /codes/toggle-2fa        - enable/disable 2FA (requires auth)
  4. GET  /codes/2fa-status         - check if 2FA is enabled for an email
"""

import logging
import secrets
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, EmailStr

from db import get_supabase_admin
from auth_utils import get_current_user
from email_codes import send_signup_verification_code, send_2fa_code
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/codes", tags=["verification-codes"])


def _generate_code() -> str:
    """Generate a cryptographically secure 6-digit code."""
    return f"{secrets.randbelow(900000) + 100000}"


# ── Request models ────────────────────────────────────────


class SendCodeRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str


class Toggle2FARequest(BaseModel):
    enabled: bool


# ── Signup verification ───────────────────────────────────


@router.post("/send-signup-code")
@limiter.limit("5/minute")
def send_signup_code(request: Request, body: SendCodeRequest):
    """Generate and email a 6-digit signup verification code."""
    sb = get_supabase_admin()

    # Invalidate any existing unused codes for this email+purpose
    try:
        sb.table("verification_codes").update({"used": True}).eq(
            "email", body.email
        ).eq("purpose", "signup").eq("used", False).execute()
    except Exception:
        pass

    code = _generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    try:
        sb.table("verification_codes").insert({
            "email": body.email,
            "code": code,
            "purpose": "signup",
            "expires_at": expires_at.isoformat(),
        }).execute()
    except Exception as e:
        logger.exception("Failed to store signup verification code")
        raise HTTPException(status_code=500, detail="Failed to generate verification code")

    # Send email
    email_sent = False
    email_error = ""
    try:
        send_signup_verification_code(body.email, code)
        email_sent = True
    except Exception as e:
        logger.exception("Failed to send signup verification email")
        email_error = str(e)

    return {
        "status": "sent" if email_sent else "code_stored",
        "expires_in_minutes": 10,
        "email_sent": email_sent,
        "code": code if not email_sent else None,
        "email_error": email_error if not email_sent else None,
    }


@router.post("/verify-signup")
@limiter.limit("10/minute")
def verify_signup(request: Request, body: VerifyCodeRequest):
    """Validate a signup verification code."""
    sb = get_supabase_admin()

    try:
        result = sb.table("verification_codes").select("*").eq(
            "email", body.email
        ).eq("purpose", "signup").eq("used", False).order(
            "created_at", desc=True
        ).limit(1).execute()
    except Exception as e:
        logger.exception("Failed to look up verification code")
        raise HTTPException(status_code=500, detail="Verification failed")

    if not result.data:
        raise HTTPException(status_code=400, detail="No verification code found. Please request a new one.")

    record = result.data[0]

    # Check expiry
    expires_at = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        # Mark as used so it can't be retried
        sb.table("verification_codes").update({"used": True}).eq("id", record["id"]).execute()
        raise HTTPException(status_code=400, detail="Code has expired. Please request a new one.")

    # Check attempts (max 5)
    attempts = record.get("attempts", 0)
    if attempts >= 5:
        sb.table("verification_codes").update({"used": True}).eq("id", record["id"]).execute()
        raise HTTPException(status_code=400, detail="Too many attempts. Please request a new code.")

    # Increment attempts
    sb.table("verification_codes").update(
        {"attempts": attempts + 1}
    ).eq("id", record["id"]).execute()

    # Validate code
    if record["code"] != body.code.strip():
        remaining = 4 - attempts
        raise HTTPException(
            status_code=400,
            detail=f"Invalid code. {remaining} attempt{'s' if remaining != 1 else ''} remaining."
        )

    # Mark as used
    sb.table("verification_codes").update({"used": True}).eq("id", record["id"]).execute()

    # Mark email as verified in profiles
    try:
        sb.table("profiles").update(
            {"email_verified": True}
        ).eq("email", body.email).execute()
    except Exception:
        # Profile may not exist yet for this email, that's ok
        pass

    return {"status": "verified"}


# ── 2FA ───────────────────────────────────────────────────


@router.post("/send-2fa-code")
@limiter.limit("5/minute")
def send_2fa_code_endpoint(request: Request, body: SendCodeRequest):
    """Generate and email a 6-digit 2FA code for sign-in."""
    sb = get_supabase_admin()

    # Invalidate any existing unused 2FA codes for this email
    try:
        sb.table("verification_codes").update({"used": True}).eq(
            "email", body.email
        ).eq("purpose", "2fa").eq("used", False).execute()
    except Exception:
        pass

    code = _generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    try:
        sb.table("verification_codes").insert({
            "email": body.email,
            "code": code,
            "purpose": "2fa",
            "expires_at": expires_at.isoformat(),
        }).execute()
    except Exception as e:
        logger.exception("Failed to store 2FA code")
        raise HTTPException(status_code=500, detail="Failed to generate 2FA code")

    email_sent = False
    email_error = ""
    try:
        send_2fa_code(body.email, code)
        email_sent = True
    except Exception as e:
        logger.exception("Failed to send 2FA email")
        email_error = str(e)

    return {
        "status": "sent" if email_sent else "code_stored",
        "expires_in_minutes": 5,
        "email_sent": email_sent,
        "code": code if not email_sent else None,
        "email_error": email_error if not email_sent else None,
    }


@router.post("/verify-2fa")
@limiter.limit("10/minute")
def verify_2fa(request: Request, body: VerifyCodeRequest):
    """Validate a 2FA code during sign-in."""
    sb = get_supabase_admin()

    try:
        result = sb.table("verification_codes").select("*").eq(
            "email", body.email
        ).eq("purpose", "2fa").eq("used", False).order(
            "created_at", desc=True
        ).limit(1).execute()
    except Exception as e:
        logger.exception("Failed to look up 2FA code")
        raise HTTPException(status_code=500, detail="Verification failed")

    if not result.data:
        raise HTTPException(status_code=400, detail="No 2FA code found. Please request a new one.")

    record = result.data[0]

    # Check expiry
    expires_at = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        sb.table("verification_codes").update({"used": True}).eq("id", record["id"]).execute()
        raise HTTPException(status_code=400, detail="Code has expired. Please request a new one.")

    # Check attempts (max 5)
    attempts = record.get("attempts", 0)
    if attempts >= 5:
        sb.table("verification_codes").update({"used": True}).eq("id", record["id"]).execute()
        raise HTTPException(status_code=400, detail="Too many attempts. Please request a new code.")

    # Increment attempts
    sb.table("verification_codes").update(
        {"attempts": attempts + 1}
    ).eq("id", record["id"]).execute()

    # Validate code
    if record["code"] != body.code.strip():
        remaining = 4 - attempts
        raise HTTPException(
            status_code=400,
            detail=f"Invalid code. {remaining} attempt{'s' if remaining != 1 else ''} remaining."
        )

    # Mark as used
    sb.table("verification_codes").update({"used": True}).eq("id", record["id"]).execute()

    return {"status": "verified"}


@router.post("/toggle-2fa")
@limiter.limit("5/minute")
def toggle_2fa(request: Request, body: Toggle2FARequest, authorization: str = Header(...)):
    """Enable or disable 2FA for the authenticated user."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    try:
        sb.table("profiles").update(
            {"two_factor_enabled": body.enabled}
        ).eq("id", str(user.id)).execute()
    except Exception as e:
        logger.exception("Failed to toggle 2FA")
        raise HTTPException(status_code=500, detail="Failed to update 2FA setting")

    return {"status": "updated", "two_factor_enabled": body.enabled}


@router.get("/2fa-status")
@limiter.limit("20/minute")
def get_2fa_status(request: Request, email: str):
    """Check if 2FA is enabled for a given email (used during sign-in)."""
    sb = get_supabase_admin()

    try:
        result = sb.table("profiles").select("two_factor_enabled").eq(
            "email", email
        ).limit(1).execute()
    except Exception as e:
        logger.exception("Failed to check 2FA status")
        raise HTTPException(status_code=500, detail="Failed to check 2FA status")

    if not result.data:
        return {"two_factor_enabled": False}

    return {"two_factor_enabled": bool(result.data[0].get("two_factor_enabled", False))}
