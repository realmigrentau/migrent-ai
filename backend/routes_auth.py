import logging

from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException, Request
from db import get_supabase_admin
from auth_utils import get_current_user
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Sign-up, sign-in, magic links and password resets all happen in the
# browser against Supabase Auth, behind hCaptcha (pages/hub/sign-*.tsx).
# The server-side /auth/register, /auth/login, /auth/magic-* and
# /auth/cross-device/* endpoints that used to live here skipped the captcha
# and, for cross-device, let anyone plant session tokens under any polling
# id. Nothing calls them any more, so they are gone.


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
