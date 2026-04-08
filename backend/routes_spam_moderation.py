"""
Spam moderation endpoints for founder/admin approval workflow.

Provides endpoints to:
- View flagged/hidden listings
- Approve (unflag) listings
- Hide listings
- Request deletion (two-step: request then confirm)
- Confirm deletion (founder only)
- View moderation events audit trail
- Recalculate spam score for a listing
"""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel
from typing import Optional
from db import get_supabase_admin
from auth_utils import get_current_user
from routes_admin import _require_admin
from email_bookings import (
    send_listing_approved_to_owner,
    send_listing_under_review_to_owner,
    send_listing_removed_to_owner,
)
from notification_service import notify
from spam_detection import calculate_spam_score, apply_spam_result

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/spam", tags=["spam-moderation"])


# -- Models --

class SpamModerationAction(BaseModel):
    reason: Optional[str] = None
    notes: Optional[str] = None


# -- Endpoints --

@router.get("/flagged")
def get_flagged_listings(
    authorization: str = Header(...),
    status: Optional[str] = Query(None, regex="^(flagged|hidden|delete_requested)$"),
    min_score: Optional[int] = Query(None, ge=0, le=100),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort: Optional[str] = Query("score_desc", regex="^(score_desc|score_asc|newest|oldest)$"),
):
    """Get listings flagged by spam detection system."""
    _require_admin(authorization)

    sb = get_supabase_admin()

    # Default: show all non-clean statuses
    query = sb.table("listings").select(
        "id, title, address, suburb, postcode, city, weekly_price, images, "
        "description, owner_id, moderation_status, moderation_notes, "
        "spam_score, spam_reasons, flagged_at, hidden_at, "
        "delete_requested_at, reviewed_at, reviewed_by, "
        "created_at, bedrooms, property_type"
    )

    if status:
        query = query.eq("moderation_status", status)
    else:
        query = query.in_("moderation_status", ["flagged", "hidden", "delete_requested"])

    if min_score is not None:
        query = query.gte("spam_score", min_score)

    # Sorting
    if sort == "score_desc":
        query = query.order("spam_score", desc=True)
    elif sort == "score_asc":
        query = query.order("spam_score", desc=False)
    elif sort == "oldest":
        query = query.order("flagged_at", desc=False)
    else:
        query = query.order("flagged_at", desc=True)

    query = query.range(offset, offset + limit - 1)
    res = query.execute()
    listings = res.data or []

    # Enrich with owner info
    owner_ids = list({l["owner_id"] for l in listings if l.get("owner_id")})
    if owner_ids:
        profiles_res = sb.table("profiles").select(
            "id, name, email, custom_pfp, identity_verified"
        ).in_("id", owner_ids).execute()
        profile_map = {p["id"]: p for p in (profiles_res.data or [])}
        for listing in listings:
            owner = profile_map.get(listing.get("owner_id"), {})
            listing["owner_name"] = owner.get("name", "Unknown")
            listing["owner_email"] = owner.get("email", "")
            listing["owner_photo"] = owner.get("custom_pfp")
            listing["owner_verified"] = owner.get("identity_verified", False)

    # Get counts per status
    counts = {}
    for s in ["flagged", "hidden", "delete_requested"]:
        try:
            c = sb.table("listings").select("id", count="exact").eq("moderation_status", s).execute()
            counts[s] = c.count or 0
        except Exception:
            counts[s] = 0

    return {
        "listings": listings,
        "counts": counts,
        "limit": limit,
        "offset": offset,
    }


@router.get("/events/{listing_id}")
def get_moderation_events(
    listing_id: str,
    authorization: str = Header(...),
    limit: int = Query(50, ge=1, le=100),
):
    """Get the moderation event audit trail for a specific listing."""
    _require_admin(authorization)

    sb = get_supabase_admin()
    res = sb.table("moderation_events").select("*").eq(
        "listing_id", listing_id
    ).order("created_at", desc=True).limit(limit).execute()

    events = res.data or []

    # Enrich with actor names
    actor_ids = list({e["actor_id"] for e in events if e.get("actor_id")})
    if actor_ids:
        profiles_res = sb.table("profiles").select("id, name").in_("id", actor_ids).execute()
        profile_map = {p["id"]: p["name"] for p in (profiles_res.data or [])}
        for event in events:
            if event.get("actor_id"):
                event["actor_name"] = profile_map.get(event["actor_id"], "Unknown")
            else:
                event["actor_name"] = "System"

    return {"events": events}


@router.post("/{listing_id}/approve")
def approve_flagged_listing(
    listing_id: str,
    body: SpamModerationAction = SpamModerationAction(),
    authorization: str = Header(...),
):
    """Approve a flagged/hidden listing - moves it to normal approved status."""
    user, admin_profile = _require_admin(authorization)
    admin_id = str(user.id)
    now = datetime.now(timezone.utc).isoformat()

    sb = get_supabase_admin()

    listing_res = sb.table("listings").select(
        "id, title, owner_id, moderation_status"
    ).eq("id", listing_id).execute()

    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]
    if listing["moderation_status"] not in ("flagged", "hidden", "delete_requested", "pending_approval"):
        raise HTTPException(status_code=400, detail=f"Listing is already {listing['moderation_status']}")

    old_status = listing["moderation_status"]

    # Approve the listing
    sb.table("listings").update({
        "moderation_status": "approved",
        "reviewed_at": now,
        "reviewed_by": admin_id,
        "moderation_notes": body.notes,
        "moderated_at": now,
        "moderator_id": admin_id,
    }).eq("id", listing_id).execute()

    # Audit trail
    sb.table("moderation_events").insert({
        "listing_id": listing_id,
        "actor_id": admin_id,
        "actor_type": "admin",
        "event_type": "approved",
        "old_status": old_status,
        "new_status": "approved",
        "notes": body.notes,
    }).execute()

    sb.table("admin_audit_log").insert({
        "admin_id": admin_id,
        "action": "approve",
        "target_type": "listing",
        "target_id": listing_id,
        "notes": body.notes or f"Approved from {old_status} status",
    }).execute()

    # Notify owner
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


@router.post("/{listing_id}/hide")
def hide_listing(
    listing_id: str,
    body: SpamModerationAction = SpamModerationAction(),
    authorization: str = Header(...),
):
    """Temporarily hide a listing from public view. Owner is notified."""
    user, admin_profile = _require_admin(authorization)
    admin_id = str(user.id)
    now = datetime.now(timezone.utc).isoformat()

    sb = get_supabase_admin()

    listing_res = sb.table("listings").select(
        "id, title, owner_id, moderation_status"
    ).eq("id", listing_id).execute()

    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]
    old_status = listing["moderation_status"]

    sb.table("listings").update({
        "moderation_status": "hidden",
        "hidden_at": now,
        "reviewed_at": now,
        "reviewed_by": admin_id,
        "moderation_notes": body.notes,
    }).eq("id", listing_id).execute()

    sb.table("moderation_events").insert({
        "listing_id": listing_id,
        "actor_id": admin_id,
        "actor_type": "admin",
        "event_type": "hidden",
        "old_status": old_status,
        "new_status": "hidden",
        "notes": body.notes,
    }).execute()

    sb.table("admin_audit_log").insert({
        "admin_id": admin_id,
        "action": "hide",
        "target_type": "listing",
        "target_id": listing_id,
        "reason": body.reason,
        "notes": body.notes,
    }).execute()

    # Notify owner
    owner_id = listing.get("owner_id")
    if owner_id:
        owner_res = sb.table("profiles").select("name, email").eq("id", owner_id).execute()
        if owner_res.data:
            owner = owner_res.data[0]
            try:
                send_listing_under_review_to_owner(
                    owner_email=owner.get("email", ""),
                    owner_name=owner.get("name", "there"),
                    listing_title=listing.get("title") or "Your listing",
                )
            except Exception as e:
                logger.error(f"Failed to send review email: {e}")

    return {"message": "Listing hidden", "listing_id": listing_id}


@router.post("/{listing_id}/request-delete")
def request_delete_listing(
    listing_id: str,
    body: SpamModerationAction,
    authorization: str = Header(...),
):
    """
    Request deletion of a listing. This is step 1 of 2.
    The listing is marked as delete_requested but NOT deleted yet.
    Founder must confirm deletion separately.
    """
    user, admin_profile = _require_admin(authorization)
    admin_id = str(user.id)
    now = datetime.now(timezone.utc).isoformat()

    if not body.reason:
        raise HTTPException(status_code=400, detail="Deletion reason is required")

    sb = get_supabase_admin()

    listing_res = sb.table("listings").select(
        "id, title, owner_id, moderation_status"
    ).eq("id", listing_id).execute()

    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]
    old_status = listing["moderation_status"]

    sb.table("listings").update({
        "moderation_status": "delete_requested",
        "delete_requested_at": now,
        "moderation_reason": body.reason,
        "moderation_notes": body.notes,
        "reviewed_at": now,
        "reviewed_by": admin_id,
    }).eq("id", listing_id).execute()

    sb.table("moderation_events").insert({
        "listing_id": listing_id,
        "actor_id": admin_id,
        "actor_type": "admin",
        "event_type": "delete_requested",
        "old_status": old_status,
        "new_status": "delete_requested",
        "notes": body.notes,
        "reasons": [body.reason],
    }).execute()

    sb.table("admin_audit_log").insert({
        "admin_id": admin_id,
        "action": "request_delete",
        "target_type": "listing",
        "target_id": listing_id,
        "reason": body.reason,
        "notes": body.notes,
    }).execute()

    return {
        "message": "Deletion requested - listing marked for founder confirmation",
        "listing_id": listing_id,
    }


@router.post("/{listing_id}/confirm-delete")
def confirm_delete_listing(
    listing_id: str,
    body: SpamModerationAction = SpamModerationAction(),
    authorization: str = Header(...),
):
    """
    Confirm and execute deletion of a listing. Step 2 of 2.
    Only works on listings that are in delete_requested status.
    The listing row is kept but marked as 'deleted' for audit trail.
    Owner is notified.
    """
    user, admin_profile = _require_admin(authorization)
    admin_id = str(user.id)
    now = datetime.now(timezone.utc).isoformat()

    sb = get_supabase_admin()

    listing_res = sb.table("listings").select(
        "id, title, owner_id, moderation_status, moderation_reason"
    ).eq("id", listing_id).execute()

    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]

    if listing["moderation_status"] != "delete_requested":
        raise HTTPException(
            status_code=400,
            detail="Listing must be in 'delete_requested' status before deletion can be confirmed"
        )

    # Mark as deleted (soft delete - row stays for audit)
    sb.table("listings").update({
        "moderation_status": "deleted",
        "delete_approved_at": now,
        "reviewed_at": now,
        "reviewed_by": admin_id,
    }).eq("id", listing_id).execute()

    sb.table("moderation_events").insert({
        "listing_id": listing_id,
        "actor_id": admin_id,
        "actor_type": "admin",
        "event_type": "delete_approved",
        "old_status": "delete_requested",
        "new_status": "deleted",
        "notes": body.notes or "Deletion confirmed by founder",
    }).execute()

    sb.table("admin_audit_log").insert({
        "admin_id": admin_id,
        "action": "confirm_delete",
        "target_type": "listing",
        "target_id": listing_id,
        "reason": listing.get("moderation_reason") or "Spam/policy violation",
        "notes": body.notes,
    }).execute()

    # Notify owner
    owner_id = listing.get("owner_id")
    if owner_id:
        owner_res = sb.table("profiles").select("name, email").eq("id", owner_id).execute()
        if owner_res.data:
            owner = owner_res.data[0]
            removal_reason = listing.get("moderation_reason") or "Policy violation"
            try:
                send_listing_removed_to_owner(
                    owner_email=owner.get("email", ""),
                    owner_name=owner.get("name", "there"),
                    listing_title=listing.get("title") or "Your listing",
                    reason=removal_reason,
                )
            except Exception as e:
                logger.error(f"Failed to send removal email: {e}")

            try:
                notify(
                    user_id=owner_id,
                    event="listing_rejected",
                    title="Listing removed",
                    body=f"Your listing '{listing.get('title') or 'Your listing'}' has been removed. Reason: {removal_reason}",
                    cta_url="/support",
                    entity_type="listing",
                    entity_id=listing_id,
                )
            except Exception:
                pass

    return {"message": "Listing deleted", "listing_id": listing_id}


@router.post("/{listing_id}/unflag")
def unflag_listing(
    listing_id: str,
    body: SpamModerationAction = SpamModerationAction(),
    authorization: str = Header(...),
):
    """Remove flag from a listing and return it to pending_approval for normal review."""
    user, admin_profile = _require_admin(authorization)
    admin_id = str(user.id)
    now = datetime.now(timezone.utc).isoformat()

    sb = get_supabase_admin()

    listing_res = sb.table("listings").select(
        "id, title, owner_id, moderation_status"
    ).eq("id", listing_id).execute()

    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]
    old_status = listing["moderation_status"]

    sb.table("listings").update({
        "moderation_status": "pending_approval",
        "spam_score": 0,
        "spam_reasons": [],
        "reviewed_at": now,
        "reviewed_by": admin_id,
        "moderation_notes": body.notes,
    }).eq("id", listing_id).execute()

    sb.table("moderation_events").insert({
        "listing_id": listing_id,
        "actor_id": admin_id,
        "actor_type": "admin",
        "event_type": "unflagged",
        "old_status": old_status,
        "new_status": "pending_approval",
        "notes": body.notes or "Flag removed - returned to normal review",
    }).execute()

    sb.table("admin_audit_log").insert({
        "admin_id": admin_id,
        "action": "unflag",
        "target_type": "listing",
        "target_id": listing_id,
        "notes": body.notes,
    }).execute()

    return {"message": "Listing unflagged and returned to pending review", "listing_id": listing_id}


@router.post("/{listing_id}/rescan")
def rescan_listing(
    listing_id: str,
    authorization: str = Header(...),
):
    """Re-run spam detection on a listing and update its score."""
    _require_admin(authorization)

    sb = get_supabase_admin()

    listing_res = sb.table("listings").select("*").eq("id", listing_id).execute()
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]

    result = calculate_spam_score(
        title=listing.get("title"),
        description=listing.get("description", ""),
        images=listing.get("images", []),
        weekly_price=listing.get("weekly_price", 0),
        owner_id=listing.get("owner_id", ""),
        suburb=listing.get("suburb"),
        listing_id=listing_id,
    )

    # Update score but don't change status (admin decides)
    sb.table("listings").update({
        "spam_score": result["spam_score"],
        "spam_reasons": result["reasons"],
        "content_hash": result["content_hash"],
    }).eq("id", listing_id).execute()

    sb.table("moderation_events").insert({
        "listing_id": listing_id,
        "actor_type": "system",
        "event_type": "score_updated",
        "spam_score": result["spam_score"],
        "reasons": result["reasons"],
        "notes": "Manual rescan by admin",
    }).execute()

    return {
        "spam_score": result["spam_score"],
        "reasons": result["reasons"],
        "action": result["action"],
        "listing_id": listing_id,
    }


@router.get("/stats")
def get_spam_stats(authorization: str = Header(...)):
    """Get spam moderation dashboard statistics."""
    _require_admin(authorization)

    sb = get_supabase_admin()
    stats = {}

    for status in ["flagged", "hidden", "delete_requested", "deleted"]:
        try:
            res = sb.table("listings").select("id", count="exact").eq("moderation_status", status).execute()
            stats[status] = res.count or 0
        except Exception:
            stats[status] = 0

    # Average spam score of flagged + hidden
    try:
        flagged_res = sb.table("listings").select("spam_score").in_(
            "moderation_status", ["flagged", "hidden"]
        ).execute()
        scores = [l["spam_score"] for l in (flagged_res.data or []) if l.get("spam_score")]
        stats["avg_spam_score"] = round(sum(scores) / len(scores)) if scores else 0
    except Exception:
        stats["avg_spam_score"] = 0

    stats["total_requiring_action"] = stats.get("flagged", 0) + stats.get("hidden", 0) + stats.get("delete_requested", 0)

    return stats
