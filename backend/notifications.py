"""
Push notification sender using Firebase Cloud Messaging (FCM) HTTP v1 API.

Uses a service account for authentication (no legacy server key needed).

ENV VARS NEEDED in backend .env:
  FIREBASE_PROJECT_ID=migrent-au-19d34
  FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@migrent-au-19d34.iam.gserviceaccount.com
  FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
"""

import os
import json
import logging
import time

import httpx
from db import get_supabase_admin

logger = logging.getLogger(__name__)

FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "")
FIREBASE_CLIENT_EMAIL = os.environ.get("FIREBASE_CLIENT_EMAIL", "")
FIREBASE_PRIVATE_KEY = os.environ.get("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n")

# FCM V1 API endpoint
FCM_V1_URL = f"https://fcm.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/messages:send"

# Cache for the access token
_token_cache = {"token": None, "expires_at": 0}


def _get_access_token():
    """Get an OAuth2 access token using the service account credentials."""
    global _token_cache

    # Return cached token if still valid (with 60s buffer)
    if _token_cache["token"] and time.time() < _token_cache["expires_at"] - 60:
        return _token_cache["token"]

    if not FIREBASE_CLIENT_EMAIL or not FIREBASE_PRIVATE_KEY:
        return None

    try:
        import jwt as pyjwt
    except ImportError:
        # Fall back to manual JWT creation
        try:
            from google.oauth2 import service_account
            from google.auth.transport.requests import Request as GoogleRequest

            creds = service_account.Credentials.from_service_account_info(
                {
                    "client_email": FIREBASE_CLIENT_EMAIL,
                    "private_key": FIREBASE_PRIVATE_KEY,
                    "token_uri": "https://oauth2.googleapis.com/token",
                },
                scopes=["https://www.googleapis.com/auth/firebase.messaging"],
            )
            creds.refresh(GoogleRequest())
            _token_cache["token"] = creds.token
            _token_cache["expires_at"] = time.time() + 3500
            return creds.token
        except ImportError:
            logger.error("Neither PyJWT nor google-auth installed - cannot authenticate with FCM")
            return None

    # Use PyJWT to create a signed JWT and exchange for access token
    now = int(time.time())
    payload = {
        "iss": FIREBASE_CLIENT_EMAIL,
        "sub": FIREBASE_CLIENT_EMAIL,
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now,
        "exp": now + 3600,
        "scope": "https://www.googleapis.com/auth/firebase.messaging",
    }

    try:
        signed_jwt = pyjwt.encode(payload, FIREBASE_PRIVATE_KEY, algorithm="RS256")
        resp = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                "assertion": signed_jwt,
            },
            timeout=10,
        )
        if resp.status_code == 200:
            data = resp.json()
            _token_cache["token"] = data["access_token"]
            _token_cache["expires_at"] = now + data.get("expires_in", 3600)
            return data["access_token"]
        else:
            logger.error("Failed to get FCM access token: %s %s", resp.status_code, resp.text)
            return None
    except Exception as e:
        logger.error("Error getting FCM access token: %s", e)
        return None


def send_push_to_user(user_id: str, title: str, body: str, url: str = "/"):
    """
    Send a push notification to all devices registered by a user.

    1. Look up all FCM tokens for user_id
    2. Send push via FCM V1 API
    """
    if not FIREBASE_PROJECT_ID or not FIREBASE_CLIENT_EMAIL:
        logger.warning("Firebase credentials not set - skipping push notification")
        return

    access_token = _get_access_token()
    if not access_token:
        logger.warning("Could not get FCM access token - skipping push")
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
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    for token in tokens:
        payload = {
            "message": {
                "token": token,
                "notification": {
                    "title": title,
                    "body": body,
                },
                "webpush": {
                    "notification": {
                        "icon": "/icons/icon-192x192.png",
                        "click_action": url,
                    },
                    "fcm_options": {
                        "link": url,
                    },
                },
                "data": {
                    "url": url,
                },
            }
        }

        try:
            resp = httpx.post(FCM_V1_URL, json=payload, headers=headers, timeout=10)
            if resp.status_code == 200:
                logger.info("Push sent to user %s", user_id)
            elif resp.status_code == 404 or resp.status_code == 410:
                # Token is invalid or unregistered - remove it
                _remove_token(sb, str(user_id), token)
            else:
                logger.warning("FCM V1 send failed with status %s: %s", resp.status_code, resp.text)
        except Exception as e:
            logger.warning("FCM send error for user %s: %s", user_id, e)


def _remove_token(sb, user_id: str, token: str):
    """Remove an invalid FCM token from the database."""
    try:
        sb.table("notification_subscriptions").delete().eq("user_id", user_id).eq("fcm_token", token).execute()
        logger.info("Removed invalid FCM token for user %s", user_id)
    except Exception as e:
        logger.warning("Failed to remove invalid token: %s", e)
