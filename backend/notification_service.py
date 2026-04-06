"""
Notification service - central place to create in-app notifications and
optionally send email/push for each event type.

Usage from any route:
    from notification_service import notify

    notify(
        user_id="uuid-here",
        event="booking_request_created",
        title="New booking request",
        body="John wants to book your room in Sydney",
        cta_url="/dashboard/owner",
        entity_type="booking",
        entity_id="booking-uuid",
        metadata={"seeker_name": "John"},
        recipient_email="owner@example.com",
        recipient_name="Jane",
    )
"""

import logging
from db import get_supabase_admin
from notifications import send_push_to_user
from email_bookings import _send_email, _email_layout, _button, FRONTEND_URL, BRAND_COLOR

logger = logging.getLogger(__name__)

# ── Delivery rules per event type ─────────────────────────────
# Defines which channels each notification type uses.
# in_app: always stored in the notifications table
# email: also sends an email via Mailjet
# push: also sends a push notification via FCM
# batch: weekly digest only (not sent immediately)

DELIVERY_RULES = {
    "booking_request_created":      {"in_app": True, "email": True,  "push": True},
    "booking_approved":             {"in_app": True, "email": True,  "push": True},
    "booking_declined":             {"in_app": True, "email": True,  "push": False},
    "booking_confirmed":            {"in_app": True, "email": True,  "push": True},
    "payment_received":             {"in_app": True, "email": True,  "push": False},
    "verification_status_changed":  {"in_app": True, "email": True,  "push": False},
    "message_received":             {"in_app": True, "email": True,  "push": True},
    "weekly_summary_ready":         {"in_app": False, "email": True, "push": False},
    "match_created":                {"in_app": True, "email": False, "push": False},
    "host_response_sent":           {"in_app": True, "email": True,  "push": True},
    "listing_published":            {"in_app": True, "email": True,  "push": False},
    "listing_rejected":             {"in_app": True, "email": True,  "push": False},
    "listing_changes_requested":    {"in_app": True, "email": True,  "push": False},
}

# Friendly labels for notification types (used in UI grouping)
NOTIFICATION_TYPE_LABELS = {
    "booking_request_created": "Bookings",
    "booking_approved": "Bookings",
    "booking_declined": "Bookings",
    "booking_confirmed": "Bookings",
    "payment_received": "Payments",
    "verification_status_changed": "Verification",
    "message_received": "Messages",
    "weekly_summary_ready": "Summary",
    "match_created": "Matches",
    "host_response_sent": "Bookings",
    "listing_published": "Listings",
    "listing_rejected": "Listings",
    "listing_changes_requested": "Listings",
}


def notify(
    user_id: str,
    event: str,
    title: str,
    body: str,
    cta_url: str = "/dashboard",
    entity_type: str | None = None,
    entity_id: str | None = None,
    metadata: dict | None = None,
    recipient_email: str | None = None,
    recipient_name: str | None = None,
):
    """
    Create a notification and deliver it via the appropriate channels.

    This is the single entry point for all notification creation.
    It handles: in-app storage, email sending, and push notifications.

    All delivery is fire-and-forget - failures are logged but never block.
    """
    rules = DELIVERY_RULES.get(event, {"in_app": True, "email": False, "push": False})

    # Determine delivery channel for the DB record
    if rules.get("email") and rules.get("in_app"):
        delivery_channel = "both"
    elif rules.get("email"):
        delivery_channel = "email"
    else:
        delivery_channel = "in_app"

    # 1. Store in-app notification
    if rules.get("in_app"):
        try:
            sb = get_supabase_admin()
            sb.table("notifications").insert({
                "user_id": user_id,
                "type": event,
                "title": title,
                "body": body,
                "cta_url": cta_url,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "delivery_channel": delivery_channel,
                "metadata": metadata or {},
            }).execute()
            logger.info("Notification created for user %s: %s", user_id, event)
        except Exception as e:
            logger.error("Failed to create notification for user %s: %s", user_id, e)

    # 2. Send email if enabled and recipient provided
    if rules.get("email") and recipient_email:
        try:
            _send_notification_email(
                to=recipient_email,
                name=recipient_name or "there",
                title=title,
                body=body,
                cta_url=cta_url,
                event=event,
            )
        except Exception as e:
            logger.error("Failed to send notification email to %s: %s", recipient_email, e)

    # 3. Send push notification if enabled
    if rules.get("push"):
        try:
            full_url = cta_url if cta_url.startswith("http") else f"{FRONTEND_URL}{cta_url}"
            send_push_to_user(user_id, title, body, full_url)
        except Exception as e:
            logger.error("Failed to send push notification to user %s: %s", user_id, e)


def _send_notification_email(
    to: str,
    name: str,
    title: str,
    body: str,
    cta_url: str,
    event: str,
):
    """Send a generic notification email using the MigRent template."""
    full_url = cta_url if cta_url.startswith("http") else f"{FRONTEND_URL}{cta_url}"

    # Choose button text based on event type
    button_labels = {
        "booking_request_created": "Review Request",
        "booking_approved": "Complete Payment",
        "booking_declined": "Browse Listings",
        "booking_confirmed": "View Booking",
        "payment_received": "View Payment",
        "verification_status_changed": "View Status",
        "message_received": "Reply Now",
        "host_response_sent": "View Response",
        "listing_published": "View Listing",
        "listing_rejected": "Edit Listing",
        "listing_changes_requested": "Edit Listing",
    }
    btn_text = button_labels.get(event, "View on MigRent")

    content = f"""
    <h2 style="font-size:22px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">{title}</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 20px;">{body}</p>
    {_button(btn_text, full_url)}
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:8px 0 0;">
      You can manage your notification preferences in your
      <a href="{FRONTEND_URL}/account/settings" style="color:{BRAND_COLOR};text-decoration:none;">account settings</a>.
    </p>
    """

    text_body = (
        f"Hi {name},\n\n"
        f"{title}\n\n"
        f"{body}\n\n"
        f"{btn_text}: {full_url}\n\n"
        f"- The MigRent Team"
    )

    _send_email(to, title, _email_layout(content, title), text_body)
