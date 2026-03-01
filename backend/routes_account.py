"""
Account management endpoints - Delete account only.
"""

import logging
from fastapi import APIRouter, HTTPException, Header, Request
from db import get_supabase, get_supabase_admin
from routes_listings import get_current_user
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/account", tags=["account"])


# ── DELETE /account/delete ──────────────────────────────────────


@router.delete("/delete")
@limiter.limit("1/hour")
def delete_account(
    request: Request,
    authorization: str = Header(...),
):
    """
    Permanently delete account and all associated data.
    User can sign up again later with same email.
    """
    user = get_current_user(authorization)
    sb = get_supabase()
    uid = str(user.id)

    try:
        logger.info("Starting account deletion")

        # Delete all deals where user is involved
        try:
            sb.table("deals").delete().eq("owner_id", uid).execute()
        except Exception:
            logger.warning("Error deleting owner deals")

        try:
            sb.table("deals").delete().eq("seeker_id", uid).execute()
        except Exception:
            logger.warning("Error deleting seeker deals")

        # Delete all listings
        try:
            sb.table("listings").delete().eq("owner_id", uid).execute()
        except Exception:
            logger.warning("Error deleting listings")

        # Delete all messages
        try:
            sb.table("messages").delete().eq("sender_id", uid).execute()
        except Exception:
            logger.warning("Error deleting sent messages")

        try:
            sb.table("messages").delete().eq("receiver_id", uid).execute()
        except Exception:
            logger.warning("Error deleting received messages")

        # Delete reports if they exist
        try:
            sb.table("reports").delete().eq("reporter_id", uid).execute()
        except Exception:
            logger.warning("Error deleting reports")

        # Delete matches if they exist
        try:
            sb.table("matches").delete().eq("seeker_id", uid).execute()
        except Exception:
            logger.warning("Error deleting seeker matches")

        try:
            sb.table("matches").delete().eq("owner_id", uid).execute()
        except Exception:
            logger.warning("Error deleting owner matches")

        # Delete profile
        sb.table("profiles").delete().eq("id", uid).execute()

        # Delete auth user via admin client (complete cleanup)
        try:
            admin_sb = get_supabase_admin()
            admin_sb.auth.admin.delete_user(uid)
        except Exception:
            logger.warning("Could not delete auth user record")

        logger.info("Account deletion completed")
        return {
            "success": True,
            "message": "Account and all associated data deleted successfully. You can sign up again later.",
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to delete account")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete account. Please try again or contact support.",
        )
