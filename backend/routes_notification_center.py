"""
Notification center endpoints.
Handles fetching, reading, and managing in-app notifications.

Separate from routes_notifications.py which handles FCM token subscriptions.
"""

import logging
from fastapi import APIRouter, HTTPException, Header, Query, Request
from pydantic import BaseModel
from db import get_supabase_admin
from auth_utils import get_current_user
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notification-center", tags=["notification-center"])


class MarkReadBody(BaseModel):
    notification_ids: list[str]


# ── GET /notification-center ──────────────────────────────────
@router.get("")
@limiter.limit("30/minute")
def get_notifications(
    request: Request,
    authorization: str = Header(...),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    filter_type: str = Query(default="all", alias="type"),
    unread_only: bool = Query(default=False),
):
    """Fetch notifications for the current user with optional filters."""
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    try:
        query = (
            sb.table("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
        )

        # Apply type filter
        if filter_type != "all":
            type_map = {
                "bookings": [
                    "booking_request_created",
                    "booking_approved",
                    "booking_declined",
                    "booking_confirmed",
                    "host_response_sent",
                ],
                "messages": ["message_received"],
                "payments": ["payment_received"],
                "verification": ["verification_status_changed"],
                "listings": [
                    "listing_published",
                    "listing_rejected",
                    "listing_changes_requested",
                ],
                "matches": ["match_created"],
            }
            event_types = type_map.get(filter_type)
            if event_types:
                query = query.in_("type", event_types)

        if unread_only:
            query = query.eq("is_read", False)

        query = query.range(offset, offset + limit - 1)
        result = query.execute()

        return {
            "notifications": result.data or [],
            "count": len(result.data or []),
        }

    except Exception as e:
        logger.error("Failed to fetch notifications for user %s: %s", user_id, e)
        raise HTTPException(status_code=500, detail="Failed to fetch notifications")


# ── GET /notification-center/unread-count ─────────────────────
@router.get("/unread-count")
@limiter.limit("60/minute")
def get_unread_count(
    request: Request,
    authorization: str = Header(...),
):
    """Get the count of unread notifications."""
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    try:
        result = (
            sb.table("notifications")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("is_read", False)
            .execute()
        )
        return {"unread_count": result.count or 0}
    except Exception as e:
        logger.error("Failed to get unread count for user %s: %s", user_id, e)
        raise HTTPException(status_code=500, detail="Failed to get unread count")


# ── POST /notification-center/mark-read ───────────────────────
@router.post("/mark-read")
@limiter.limit("30/minute")
def mark_as_read(
    request: Request,
    body: MarkReadBody,
    authorization: str = Header(...),
):
    """Mark specific notifications as read."""
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    if not body.notification_ids:
        raise HTTPException(status_code=400, detail="No notification IDs provided")

    try:
        result = (
            sb.table("notifications")
            .update({"is_read": True})
            .eq("user_id", user_id)
            .in_("id", body.notification_ids)
            .execute()
        )
        return {"success": True, "updated": len(result.data or [])}
    except Exception as e:
        logger.error("Failed to mark notifications as read: %s", e)
        raise HTTPException(status_code=500, detail="Failed to mark as read")


# ── POST /notification-center/mark-all-read ───────────────────
@router.post("/mark-all-read")
@limiter.limit("10/minute")
def mark_all_as_read(
    request: Request,
    authorization: str = Header(...),
):
    """Mark all notifications as read for the current user."""
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    try:
        sb.table("notifications").update({"is_read": True}).eq("user_id", user_id).eq("is_read", False).execute()
        return {"success": True}
    except Exception as e:
        logger.error("Failed to mark all as read for user %s: %s", user_id, e)
        raise HTTPException(status_code=500, detail="Failed to mark all as read")


# ── DELETE /notification-center/{notification_id} ─────────────
@router.delete("/{notification_id}")
@limiter.limit("30/minute")
def delete_notification(
    request: Request,
    notification_id: str,
    authorization: str = Header(...),
):
    """Delete a single notification."""
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    try:
        sb.table("notifications").delete().eq("id", notification_id).eq("user_id", user_id).execute()
        return {"success": True}
    except Exception as e:
        logger.error("Failed to delete notification %s: %s", notification_id, e)
        raise HTTPException(status_code=500, detail="Failed to delete notification")
