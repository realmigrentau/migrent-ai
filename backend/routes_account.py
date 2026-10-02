"""
Account management endpoints - Delete account only.
"""

import logging
import time
from fastapi import APIRouter, HTTPException, Header, Request
from db import get_supabase_admin
from auth_utils import get_current_user, token_claims
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


# Deleting an account is permanent, so it needs a fresh sign-in: Supabase
# records when the person last proved who they are in the `amr` claim of
# every access token. 428 tells the Hub to ask them to sign in again.
RECENT_SIGN_IN_SECONDS = 15 * 60
REAUTH_DETAIL = "For your security, sign in again and then delete your account. We ask for a fresh sign-in before anything this permanent."


def _signed_in_recently(authorization: str) -> bool:
    amr = token_claims(authorization).get("amr") or []
    stamps = [a.get("timestamp") for a in amr if isinstance(a, dict) and isinstance(a.get("timestamp"), (int, float))]
    return bool(stamps) and time.time() - max(stamps) <= RECENT_SIGN_IN_SECONDS


def _open_report_involving(sb, uid: str) -> bool:
    """A report about this person, or one of their listings, that Migrent is
    still looking into. Deleting then would destroy what the team needs."""
    try:
        listing_ids = [r["id"] for r in (sb.table("listings").select("id").eq("owner_id", uid).execute().data or [])]
        about_them = sb.table("reports").select("id").eq("item_id", uid).in_("status", ["pending", "reviewing"]).limit(1).execute().data
        if about_them:
            return True
        if listing_ids:
            on_listings = sb.table("reports").select("id").in_("item_id", listing_ids).in_("status", ["pending", "reviewing"]).limit(1).execute().data
            return bool(on_listings)
    except Exception:
        logger.warning("Could not check reports before account deletion")
    return False


# Private and public files a person uploaded, by bucket. Each is stored under
# their account id (see the upload routes); profile photos are named by it.
USER_FILE_BUCKETS = ("owner-id-docs", "renter-documents", "message-attachments", "listing-images")


def _remove_user_files(sb, uid: str) -> int:
    """Delete everything the account uploaded to Storage. The rows that
    pointed at these files go with the account; the files used to stay
    behind, government ID images included."""
    removed = 0

    def _drain(bucket: str, folder: str, search: str | None = None, prefix: str | None = None) -> None:
        nonlocal removed
        store = sb.storage.from_(bucket)
        while True:
            opts = {"limit": 100, "offset": 0}
            if search:
                opts["search"] = search
            items = store.list(folder, opts) or []
            paths = [f"{prefix or folder}/{i['name']}" for i in items if i.get("name") and (not search or i["name"].startswith(search))]
            if not paths:
                return
            store.remove(paths)
            removed += len(paths)
            if len(items) < 100:
                return

    for bucket in USER_FILE_BUCKETS:
        try:
            _drain(bucket, uid)
        except Exception:
            logger.warning("Could not remove %s files for a deleted account", bucket)
    try:
        _drain("avatars", "profile-photos", search=uid)
    except Exception:
        logger.warning("Could not remove the profile photo for a deleted account")
    return removed


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

    if not _signed_in_recently(authorization):
        raise HTTPException(status_code=428, detail=REAUTH_DETAIL)

    reason = _blocking_reason(sb, uid)
    if reason:
        raise HTTPException(status_code=409, detail=reason)
    if _open_report_involving(sb, uid):
        raise HTTPException(
            status_code=409,
            detail="Migrent is looking into a report involving your account or one of your listings. Contact support and we will finish this with you.",
        )

    # Files first: once the rows are gone nothing records where they were.
    files_removed = _remove_user_files(sb, uid)

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

        logger.info("Account deletion completed (%d files removed)", files_removed)
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
