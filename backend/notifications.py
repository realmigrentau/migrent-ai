"""
Push notification sender using Firebase Cloud Messaging (FCM) HTTP v1 API.

ENV VARS NEEDED in backend .env:
  FIREBASE_PROJECT_ID=your-firebase-project-id
  FIREBASE_SERVER_KEY=your-server-key-from-firebase-console

The FIREBASE_SERVER_KEY is found in:
  Firebase Console -> Project Settings -> Cloud Messaging -> Server key
"""

import os
import logging
from uuid import UUID

import httpx
from db import get_supabase_admin

logger = logging.getLogger(__name__)

FIREBASE_SERVER_KEY = os.environ.get("FIREBASE_SERVER_KEY", "")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "")

# FCM legacy HTTP endpoint (simpler than v1, no OAuth needed)
FCM_URL = "https://fcm.googleapis.com/fcm/send"


def send_push_to_user(user_id: str, title: str, body: str, url: str = "/"):
    """
    Send a push notification to all devices registered by a user.

    1. Look up all FCM tokens for user_id
    2. Send push via FCM HTTP API
    """
    if not FIREBASE_SERVER_KEY:
        logger.warning("FIREBASE_SERVER_KEY not set - skipping push notification")
        return

    sb = get_supabase_admin()

    # Get all tokens for this user
    try:
        result = sb.table("notification_subscriptions").select("fcm_token").eq("user_id", str(user_id)).execute()
    except Exception as e:
        logger.warning("Failed to fetch FCM tokens for user %s: %s", user_id, e)
        return

    if not result.data:
        return  # User has no push subscriptions

    tokens = [row["fcm_token"] for row in result.data]

    headers = {
        "Authorization": f"key={FIREBASE_SERVER_KEY}",
        "Content-Type": "application/json",
    }

    for token in tokens:
        payload = {
            "to": token,
            "notification": {
                "title": title,
                "body": body,
                "icon": "/icons/icon-192x192.png",
                "click_action": url,
            },
            "data": {
                "url": url,
            },
        }

        try:
            resp = httpx.post(FCM_URL, json=payload, headers=headers, timeout=10)
            if resp.status_code == 200:
                resp_data = resp.json()
                # If token is invalid, remove it
                if resp_data.get("failure", 0) > 0:
                    for r in resp_data.get("results", []):
                        if r.get("error") in ("InvalidRegistration", "NotRegistered"):
                            _remove_token(sb, str(user_id), token)
            else:
                logger.warning("FCM send failed with status %s: %s", resp.status_code, resp.text)
        except Exception as e:
            logger.warning("FCM send error for user %s: %s", user_id, e)


def _remove_token(sb, user_id: str, token: str):
    """Remove an invalid FCM token from the database."""
    try:
        sb.table("notification_subscriptions").delete().eq("user_id", user_id).eq("fcm_token", token).execute()
        logger.info("Removed invalid FCM token for user %s", user_id)
    except Exception as e:
        logger.warning("Failed to remove invalid token: %s", e)
