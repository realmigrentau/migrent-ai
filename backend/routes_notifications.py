"""
Notification subscription endpoints.
Users register their FCM tokens here for push notifications.
"""

import logging
from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel
from db import get_supabase_admin
from auth_utils import get_current_user
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])


class SubscribeBody(BaseModel):
    fcm_token: str


@router.post("/subscribe")
@limiter.limit("10/minute")
def subscribe_to_notifications(
    request: Request,
    body: SubscribeBody,
    authorization: str = Header(...),
):
    """Register an FCM token for push notifications."""
    user = get_current_user(authorization)
    user_id = str(user.id)

    if not body.fcm_token or len(body.fcm_token) < 10:
        raise HTTPException(status_code=400, detail="Invalid FCM token")

    sb = get_supabase_admin()

    # Upsert - if token already exists for this user, just return success
    try:
        # Check if already exists
        existing = (
            sb.table("notification_subscriptions")
            .select("id")
            .eq("user_id", user_id)
            .eq("fcm_token", body.fcm_token)
            .execute()
        )

        if existing.data:
            return {"success": True, "message": "Already subscribed"}

        # Insert new token
        sb.table("notification_subscriptions").insert({
            "user_id": user_id,
            "fcm_token": body.fcm_token,
        }).execute()

        return {"success": True, "message": "Subscribed to notifications"}

    except Exception as e:
        logger.error("Failed to subscribe to notifications: %s", e)
        raise HTTPException(status_code=500, detail="Failed to subscribe")


@router.delete("/unsubscribe")
@limiter.limit("10/minute")
def unsubscribe_from_notifications(
    request: Request,
    body: SubscribeBody,
    authorization: str = Header(...),
):
    """Remove an FCM token (unsubscribe from push)."""
    user = get_current_user(authorization)
    user_id = str(user.id)

    sb = get_supabase_admin()

    try:
        sb.table("notification_subscriptions").delete().eq("user_id", user_id).eq("fcm_token", body.fcm_token).execute()
        return {"success": True, "message": "Unsubscribed"}
    except Exception as e:
        logger.error("Failed to unsubscribe: %s", e)
        raise HTTPException(status_code=500, detail="Failed to unsubscribe")
