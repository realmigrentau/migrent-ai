"""
Account management endpoints - Delete account only.
"""

import logging
from fastapi import APIRouter, HTTPException, Header, Request
from db import get_supabase_admin
from auth_utils import get_current_user
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/account", tags=["account"])


# ── DELETE /account/delete ──────────────────────────────────────


# Applications that someone is still waiting on, and tenancies someone is
# living in: deleting either side would strand the other person.
_OPEN_APPLICATION = ("submitted", "under_review", "shortlisted", "changes_requested", "owner_approved", "migrent_review")
_LIVE_TENANCY = ("upcoming", "active")


def _blocking_reason(sb, uid: str) -> str | None:
    try:
        live = sb.table("tenancies").select("id").or_(f"owner_id.eq.{uid},renter_id.eq.{uid}").in_("status", list(_LIVE_TENANCY)).limit(1).execute().data
    except Exception:
        live = []
    if live:
        return "You have a current or upcoming tenancy in Migrent Hub. It needs to end before the account can be deleted."
    try:
        open_apps = sb.table("applications").select("id").or_(f"owner_id.eq.{uid},renter_id.eq.{uid}").in_("status", list(_OPEN_APPLICATION)).limit(1).execute().data
    except Exception:
        open_apps = []
    if open_apps:
        return "You have applications in progress in Migrent Hub. Withdraw them (or decide on them, if you're the owner) before deleting the account."
    return None


def _delete_hub_rows(sb, uid: str) -> None:
    """Hub rows that point at listings with ON DELETE RESTRICT go first, so
    the listing delete below cannot fail on them. Children cascade."""
    for table, columns in (
        ("tenancies", ("owner_id", "renter_id")),
        ("applications", ("owner_id", "renter_id")),
        ("inspection_bookings", ("renter_id",)),
        ("inspection_slots", ("owner_id",)),
    ):
        for column in columns:
            try:
                sb.table(table).delete().eq(column, uid).execute()
            except Exception:
                logger.warning("Error deleting %s by %s", table, column)
    # Other people's applications and tenancies on this person's listings.
    try:
        ids = [r["id"] for r in (sb.table("listings").select("id").eq("owner_id", uid).execute().data or [])]
    except Exception:
        ids = []
    if ids:
        for table in ("tenancies", "applications"):
            try:
                sb.table(table).delete().in_("listing_id", ids).execute()
            except Exception:
                logger.warning("Error deleting %s on the account's listings", table)


@router.delete("/delete")
@limiter.limit("3/hour")
def delete_account(
    request: Request,
    authorization: str = Header(...),
):
    """
    Permanently delete account and all associated data.
    User can sign up again later with same email.
    """
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    uid = str(user.id)

    reason = _blocking_reason(sb, uid)
    if reason:
        raise HTTPException(status_code=409, detail=reason)

    try:
        logger.info("Starting account deletion")
        _delete_hub_rows(sb, uid)

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

        # Bookings and reviews reference auth.users directly with no cascade, so
        # they have to go before the auth record or the final delete_user below
        # fails on a foreign key and leaves an orphaned account behind.
        for table, column in (
            ("bookings", "owner_id"),
            ("bookings", "seeker_id"),
            ("reviews", "reviewer_id"),
            ("reviews", "reviewed_user_id"),
            ("blocked_users", "blocker_id"),
            ("blocked_users", "blocked_id"),
        ):
            try:
                sb.table(table).delete().eq(column, uid).execute()
            except Exception:
                logger.warning("Error deleting %s by %s", table, column)

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
