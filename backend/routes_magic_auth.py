import logging

from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Request
from db import get_supabase
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


class MagicLinkRequest(BaseModel):
    email: EmailStr


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

    # Intentionally vague message to prevent email enumeration
    return {"status": "ok", "message": "If an account with that email exists, a magic link has been sent."}
