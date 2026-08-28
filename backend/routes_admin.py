"""
Admin moderation endpoints for listing approval workflow.

All endpoints require admin authentication via is_admin flag on profiles.
Uses service role key to bypass RLS for admin operations.
"""

import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Header, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from db import get_supabase_admin
from auth_utils import get_current_user
from email_bookings import (
    send_listing_approved_to_owner,
    send_listing_rejected_to_owner,
    send_listing_changes_requested_to_owner,
)
from notification_service import notify

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_admin(authorization: str):
    """Validate token and check admin role. Returns (user, profile).

    Admin status is read from the profiles table under the service role, and
    from nowhere else. In particular it is NOT read from user_metadata:
    Supabase lets any signed-in user rewrite their own user_metadata via
    auth.updateUser({ data: ... }), so trusting a role claim from there let
    any account promote itself to superadmin. app_metadata is service-role
    only and would be safe, but nothing sets it, so there is no reason to
    keep the branch alive.
    """
    user = get_current_user(authorization)
    user_id = str(user.id)
    logger.info(f"[Admin] Checking admin access for user {user_id}")

    sb = get_supabase_admin()
    try:
        profile_res = sb.table("profiles").select("id, is_admin, role, name, email").eq("id", user_id).execute()
    except Exception as e:
        logger.error(f"[Admin] Failed to query profiles: {e}")
        raise HTTPException(status_code=500, detail="Failed to check admin status")

    if not profile_res.data:
        logger.warning(f"[Admin] No profile found for user {user_id}")
        raise HTTPException(status_code=403, detail="Admin access required")

    profile = profile_res.data[0]
    is_admin = profile.get("is_admin", False)
    profile_role = profile.get("role", "")
    logger.info(f"[Admin] User {user_id} is_admin={is_admin}, role={profile_role}")

    if not is_admin and profile_role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    return user, profile


# -- Models --

class ModerationAction(BaseModel):
    reason: Optional[str] = None
    notes: Optional[str] = None


# -- Endpoints --

@router.get("/pending")
def get_pending_listings(
    authorization: str = Header(...),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    suburb: Optional[str] = None,
    sort: Optional[str] = Query("newest", regex="^(newest|oldest)$"),
):
    """Get all listings pending moderation."""
    _require_admin(authorization)

    try:
        return _fetch_pending(suburb, sort, limit, offset)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Admin] Failed to get pending listings: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load pending listings: {str(e)}")


def _fetch_pending(suburb, sort, limit, offset):
    sb = get_supabase_admin()
    query = sb.table("listings").select(
        "id, title, address, suburb, postcode, city, weekly_price, images, "
        "description, owner_id, moderation_status, moderation_notes, "
        "created_at, bedrooms, property_type, furnished, bills_included"
    ).eq("moderation_status", "pending_approval")

    if suburb:
        query = query.ilike("suburb", f"%{suburb}%")

    if sort == "oldest":
        query = query.order("created_at", desc=False)
    else:
        query = query.order("created_at", desc=True)

    query = query.range(offset, offset + limit - 1)
    res = query.execute()

    listings = res.data or []

    # Enrich with owner info
    owner_ids = list({l["owner_id"] for l in listings if l.get("owner_id")})
    if owner_ids:
        profiles_res = sb.table("profiles").select("id, name, email, custom_pfp, identity_verified").in_("id", owner_ids).execute()
        profile_map = {p["id"]: p for p in (profiles_res.data or [])}
        for listing in listings:
            owner = profile_map.get(listing.get("owner_id"), {})
            listing["owner_name"] = owner.get("name", "Unknown")
            listing["owner_email"] = owner.get("email", "")
            listing["owner_photo"] = owner.get("custom_pfp")
            listing["owner_verified"] = owner.get("identity_verified", False)

    # Get total count for pagination
    count_query = sb.table("listings").select("id", count="exact").eq("moderation_status", "pending_approval")
    if suburb:
        count_query = count_query.ilike("suburb", f"%{suburb}%")
    count_res = count_query.execute()

    return {
        "listings": listings,
        "total": count_res.count or 0,
        "limit": limit,
        "offset": offset,
    }


@router.get("/listings")
def get_all_moderated_listings(
    authorization: str = Header(...),
    status: Optional[str] = Query(None, regex="^(pending_approval|approved|rejected|changes_requested|flagged|hidden|delete_requested|deleted)$"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Get listings filtered by moderation status (admin view)."""
    _require_admin(authorization)

    sb = get_supabase_admin()
    query = sb.table("listings").select(
        "id, title, address, suburb, postcode, city, weekly_price, images, "
        "owner_id, moderation_status, moderation_notes, moderation_reason, "
        "moderator_id, moderated_at, created_at"
    )

    if status:
        query = query.eq("moderation_status", status)

    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    res = query.execute()

    # Enrich with owner info
    listings = res.data or []
    owner_ids = list({l["owner_id"] for l in listings if l.get("owner_id")})
    if owner_ids:
        profiles_res = sb.table("profiles").select("id, name, email").in_("id", owner_ids).execute()
        profile_map = {p["id"]: p for p in (profiles_res.data or [])}
        for listing in listings:
            owner = profile_map.get(listing.get("owner_id"), {})
            listing["owner_name"] = owner.get("name", "Unknown")
            listing["owner_email"] = owner.get("email", "")

    return {"listings": listings}


@router.get("/listings/{listing_id}")
def get_listing_detail_admin(
    listing_id: str,
    authorization: str = Header(...),
):
    """Get full listing detail for admin review."""
    _require_admin(authorization)

    sb = get_supabase_admin()
    res = sb.table("listings").select("*").eq("id", listing_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = res.data[0]

    # Get owner profile
    owner_id = listing.get("owner_id")
    if owner_id:
        profile_res = sb.table("profiles").select(
            "id, name, email, custom_pfp, bio, identity_verified, role, created_at"
        ).eq("id", owner_id).execute()
        if profile_res.data:
            listing["owner_profile"] = profile_res.data[0]
            # Count owner's total listings
            count_res = sb.table("listings").select("id", count="exact").eq("owner_id", owner_id).execute()
            listing["owner_profile"]["total_listings"] = count_res.count or 0

    return listing


@router.post("/listings/{listing_id}/approve")
def approve_listing(
    listing_id: str,
    body: ModerationAction = ModerationAction(),
    authorization: str = Header(...),
):
    """Approve a pending listing - makes it live."""
    user, admin_profile = _require_admin(authorization)
    admin_id = str(user.id)

    sb = get_supabase_admin()

    # Check listing exists and is pending
    listing_res = sb.table("listings").select("id, title, owner_id, moderation_status").eq("id", listing_id).execute()
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]
    if listing["moderation_status"] not in ("pending_approval", "changes_requested"):
        raise HTTPException(status_code=400, detail=f"Listing is already {listing['moderation_status']}")

    # Update listing status
    sb.table("listings").update({
        "moderation_status": "approved",
        "moderation_notes": body.notes,
        "moderator_id": admin_id,
        "moderated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", listing_id).execute()

    # Audit log
    sb.table("admin_audit_log").insert({
        "admin_id": admin_id,
        "action": "approve",
        "target_type": "listing",
        "target_id": listing_id,
        "notes": body.notes,
    }).execute()

    # Email the owner
    owner_id = listing.get("owner_id")
    if owner_id:
        owner_res = sb.table("profiles").select("name, email").eq("id", owner_id).execute()
        if owner_res.data:
            owner = owner_res.data[0]
            try:
                send_listing_approved_to_owner(
                    owner_email=owner.get("email", ""),
                    owner_name=owner.get("name", "there"),
                    listing_title=listing.get("title") or "Your listing",
                )
            except Exception as e:
                logger.error(f"Failed to send approval email: {e}")

            # In-app notification
            try:
                notify(
                    user_id=owner_id,
                    event="listing_published",
                    title="Your listing is live!",
                    body=f"Your listing '{listing.get('title') or 'Your listing'}' has been approved and is now visible to seekers.",
                    cta_url="/owner/listings",
                    entity_type="listing",
                    entity_id=listing_id,
                )
            except Exception:
                pass

    return {"message": "Listing approved", "listing_id": listing_id}


@router.post("/listings/{listing_id}/reject")
def reject_listing(
    listing_id: str,
    body: ModerationAction,
    authorization: str = Header(...),
):
    """Reject a listing with a reason."""
    user, admin_profile = _require_admin(authorization)
    admin_id = str(user.id)

    if not body.reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")

    sb = get_supabase_admin()

    listing_res = sb.table("listings").select("id, title, owner_id, moderation_status").eq("id", listing_id).execute()
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]

    # Update listing
    sb.table("listings").update({
        "moderation_status": "rejected",
        "moderation_reason": body.reason,
        "moderation_notes": body.notes,
        "moderator_id": admin_id,
        "moderated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", listing_id).execute()

    # Audit log
    sb.table("admin_audit_log").insert({
        "admin_id": admin_id,
        "action": "reject",
        "target_type": "listing",
        "target_id": listing_id,
        "reason": body.reason,
        "notes": body.notes,
    }).execute()

    # Email the owner
    owner_id = listing.get("owner_id")
    if owner_id:
        owner_res = sb.table("profiles").select("name, email").eq("id", owner_id).execute()
        if owner_res.data:
            owner = owner_res.data[0]
            try:
                send_listing_rejected_to_owner(
                    owner_email=owner.get("email", ""),
                    owner_name=owner.get("name", "there"),
                    listing_title=listing.get("title") or "Your listing",
                    reason=body.reason,
                )
            except Exception as e:
                logger.error(f"Failed to send rejection email: {e}")

            # In-app notification
            try:
                notify(
                    user_id=owner_id,
                    event="listing_rejected",
                    title="Listing not approved",
                    body=f"Your listing '{listing.get('title') or 'Your listing'}' was not approved. Reason: {body.reason}",
                    cta_url="/owner/listings",
                    entity_type="listing",
                    entity_id=listing_id,
                )
            except Exception:
                pass

    return {"message": "Listing rejected", "listing_id": listing_id}


@router.post("/listings/{listing_id}/request-changes")
def request_changes(
    listing_id: str,
    body: ModerationAction,
    authorization: str = Header(...),
):
    """Request changes from the owner before approval."""
    user, admin_profile = _require_admin(authorization)
    admin_id = str(user.id)

    if not body.notes:
        raise HTTPException(status_code=400, detail="Please specify what changes are needed")

    sb = get_supabase_admin()

    listing_res = sb.table("listings").select("id, title, owner_id, moderation_status").eq("id", listing_id).execute()
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]

    # Update listing
    sb.table("listings").update({
        "moderation_status": "changes_requested",
        "moderation_notes": body.notes,
        "moderator_id": admin_id,
        "moderated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", listing_id).execute()

    # Audit log
    sb.table("admin_audit_log").insert({
        "admin_id": admin_id,
        "action": "request_changes",
        "target_type": "listing",
        "target_id": listing_id,
        "notes": body.notes,
    }).execute()

    # Email the owner
    owner_id = listing.get("owner_id")
    if owner_id:
        owner_res = sb.table("profiles").select("name, email").eq("id", owner_id).execute()
        if owner_res.data:
            owner = owner_res.data[0]
            try:
                send_listing_changes_requested_to_owner(
                    owner_email=owner.get("email", ""),
                    owner_name=owner.get("name", "there"),
                    listing_title=listing.get("title") or "Your listing",
                    changes_needed=body.notes,
                )
            except Exception as e:
                logger.error(f"Failed to send changes requested email: {e}")

            # In-app notification
            try:
                notify(
                    user_id=owner_id,
                    event="listing_changes_requested",
                    title="Changes needed for your listing",
                    body=f"Your listing '{listing.get('title') or 'Your listing'}' needs updates before it can go live.",
                    cta_url="/owner/listings",
                    entity_type="listing",
                    entity_id=listing_id,
                )
            except Exception:
                pass

    return {"message": "Changes requested", "listing_id": listing_id}


@router.get("/stats")
def get_admin_stats(authorization: str = Header(...)):
    """Get moderation dashboard statistics."""
    _require_admin(authorization)

    twenty_four_hours_ago = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()

    sb = get_supabase_admin()

    # Pending count
    try:
        pending_res = sb.table("listings").select("id", count="exact").eq("moderation_status", "pending_approval").execute()
        pending = pending_res.count or 0
    except Exception as e:
        logger.error(f"[Admin] Pending count failed: {e}")
        pending = 0

    # Total listings
    try:
        total_res = sb.table("listings").select("id", count="exact").execute()
        total_listings = total_res.count or 0
    except Exception:
        total_listings = 0

    # Audit log stats (table may not exist yet)
    approved_today = 0
    rejected_today = 0
    changes_today = 0
    approval_rate = 100
    try:
        approved_res = sb.table("admin_audit_log").select("id", count="exact").eq("action", "approve").gte("created_at", twenty_four_hours_ago).execute()
        approved_today = approved_res.count or 0

        rejected_res = sb.table("admin_audit_log").select("id", count="exact").eq("action", "reject").gte("created_at", twenty_four_hours_ago).execute()
        rejected_today = rejected_res.count or 0

        changes_res = sb.table("admin_audit_log").select("id", count="exact").eq("action", "request_changes").gte("created_at", twenty_four_hours_ago).execute()
        changes_today = changes_res.count or 0

        all_approved = sb.table("admin_audit_log").select("id", count="exact").eq("action", "approve").execute()
        all_rejected = sb.table("admin_audit_log").select("id", count="exact").eq("action", "reject").execute()
        total_reviewed = (all_approved.count or 0) + (all_rejected.count or 0)
        approval_rate = round(((all_approved.count or 0) / total_reviewed * 100) if total_reviewed > 0 else 100)
    except Exception as e:
        logger.warning(f"[Admin] Audit log query failed (table may not exist): {e}")

    return {
        "pending": pending,
        "approved_today": approved_today,
        "rejected_today": rejected_today,
        "changes_requested_today": changes_today,
        "total_listings": total_listings,
        "approval_rate": approval_rate,
    }


@router.get("/activity")
def get_recent_activity(
    authorization: str = Header(...),
    limit: int = Query(20, ge=1, le=50),
):
    """Get recent admin moderation activity."""
    _require_admin(authorization)

    try:
        sb = get_supabase_admin()
        res = sb.table("admin_audit_log").select(
            "id, admin_id, action, target_type, target_id, reason, notes, created_at"
        ).order("created_at", desc=True).limit(limit).execute()

        activities = res.data or []

        # Enrich with admin names and listing titles
        admin_ids = list({a["admin_id"] for a in activities})
        listing_ids = list({a["target_id"] for a in activities if a["target_type"] == "listing"})

        admin_map = {}
        if admin_ids:
            admin_res = sb.table("profiles").select("id, name").in_("id", admin_ids).execute()
            admin_map = {p["id"]: p["name"] for p in (admin_res.data or [])}

        listing_map = {}
        if listing_ids:
            listing_res = sb.table("listings").select("id, title, suburb").in_("id", listing_ids).execute()
            listing_map = {l["id"]: l for l in (listing_res.data or [])}

        for activity in activities:
            activity["admin_name"] = admin_map.get(activity["admin_id"], "Admin")
            if activity["target_type"] == "listing":
                listing_info = listing_map.get(activity["target_id"], {})
                activity["listing_title"] = listing_info.get("title", "Unknown listing")
                activity["listing_suburb"] = listing_info.get("suburb", "")

        return {"activities": activities}
    except Exception as e:
        logger.warning(f"[Admin] Activity query failed (table may not exist): {e}")
        return {"activities": []}
