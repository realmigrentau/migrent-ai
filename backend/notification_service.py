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
from email_bookings import _send_email, FRONTEND_URL

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
    # Move-in payments (move_in.py). The receipts are emailed on their own,
    # so these notices stay in the Hub; a failed fee is emailed.
    "move_in_paid":                 {"in_app": True, "email": False, "push": True},
    "move_in_complete":             {"in_app": True, "email": False, "push": False},
    "move_in_fee_failed":           {"in_app": True, "email": True,  "push": False},
    "verification_status_changed":  {"in_app": True, "email": True,  "push": False},
    "message_received":             {"in_app": True, "email": True,  "push": True},
    "weekly_summary_ready":         {"in_app": False, "email": True, "push": False},
    "match_created":                {"in_app": True, "email": False, "push": False},
    "host_response_sent":           {"in_app": True, "email": True,  "push": True},
    "listing_published":            {"in_app": True, "email": True,  "push": False},
    "listing_rejected":             {"in_app": True, "email": True,  "push": False},
    "mentor_approved":              {"in_app": True, "email": True,  "push": False},
    "mentor_rejected":              {"in_app": True, "email": True,  "push": False},
    "listing_changes_requested":    {"in_app": True, "email": True,  "push": False},
    "listing_flagged":              {"in_app": True, "email": True,  "push": False},
    "listing_hidden":               {"in_app": True, "email": True,  "push": False},
    "listing_removed":              {"in_app": True, "email": True,  "push": False},
    # Migrent Hub
    "application_submitted":        {"in_app": True, "email": True,  "push": True},
    "application_status_changed":   {"in_app": True, "email": True,  "push": True},
    "application_changes_requested":{"in_app": True, "email": True,  "push": True},
    "application_approved":         {"in_app": True, "email": True,  "push": True},
    "application_finalised":        {"in_app": True, "email": True,  "push": True},
    "application_withdrawn":        {"in_app": True, "email": False, "push": False},
    "inspection_booked":            {"in_app": True, "email": True,  "push": False},
    "inspection_changed":           {"in_app": True, "email": True,  "push": True},
    "inspection_cancelled":         {"in_app": True, "email": True,  "push": True},
    "inspection_reminder":          {"in_app": True, "email": True,  "push": True},
    "saved_search_match":           {"in_app": True, "email": True,  "push": False},
    "maintenance_created":          {"in_app": True, "email": True,  "push": True},
    "maintenance_updated":          {"in_app": True, "email": True,  "push": False},
    "tenancy_created":              {"in_app": True, "email": True,  "push": False},
    "review_prompt":                {"in_app": True, "email": True,  "push": False},
    "review_received":              {"in_app": True, "email": True,  "push": False},
    "listing_submitted":            {"in_app": True, "email": False, "push": False},
    # Three wrong Admin panel passwords (routes_hub_admin._lock_out). A
    # security notice, so it has no email switch.
    "admin_security_alert":         {"in_app": True, "email": True,  "push": True},
}

# Which preference switch (Hub > Settings > Notifications) governs the
# email for each event. In-app notifications are always stored; the
# switch only decides whether an email is sent as well. Security and
# account notices have no switch on purpose.
EMAIL_PREFERENCE_GROUP = {
    "message_received": "messages",
    "host_response_sent": "messages",
    "application_submitted": "applications",
    "application_status_changed": "applications",
    "application_changes_requested": "applications",
    "application_approved": "applications",
    "application_finalised": "applications",
    "application_withdrawn": "applications",
    "booking_request_created": "applications",
    "booking_approved": "applications",
    "booking_declined": "applications",
    "booking_confirmed": "applications",
    "inspection_booked": "inspections",
    "inspection_changed": "inspections",
    "inspection_cancelled": "inspections",
    "inspection_reminder": "inspections",
    "saved_search_match": "saved_searches",
    "match_created": "saved_searches",
    "maintenance_created": "maintenance",
    "maintenance_updated": "maintenance",
    "tenancy_created": "applications",
    "review_prompt": "applications",
    "review_received": "applications",
    "listing_published": "listings",
    "listing_rejected": "listings",
    "listing_changes_requested": "listings",
    "listing_submitted": "listings",
    "weekly_summary_ready": "summaries",
}


def email_allowed(prefs: dict | None, event: str) -> bool:
    """True unless the person switched this group of emails off."""
    group = EMAIL_PREFERENCE_GROUP.get(event)
    if not group or not isinstance(prefs, dict):
        return True
    email_prefs = prefs.get("email") if isinstance(prefs.get("email"), dict) else {}
    return email_prefs.get(group, True) is not False

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
    "listing_flagged": "Listings",
    "listing_hidden": "Listings",
    "listing_removed": "Listings",
    "application_submitted": "Applications",
    "application_status_changed": "Applications",
    "application_changes_requested": "Applications",
    "application_approved": "Applications",
    "application_finalised": "Applications",
    "application_withdrawn": "Applications",
    "inspection_booked": "Inspections",
    "inspection_changed": "Inspections",
    "inspection_cancelled": "Inspections",
    "inspection_reminder": "Inspections",
    "saved_search_match": "Saved searches",
    "maintenance_created": "Maintenance",
    "maintenance_updated": "Maintenance",
    "tenancy_created": "Home",
    "review_prompt": "Reviews",
    "review_received": "Reviews",
    "listing_submitted": "Listings",
    "admin_security_alert": "Security",
}


def notify(
    user_id: str,
    event: str,
    title: str,
    body: str,
    cta_url: str = "/hub",
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

    # 2. Send email if enabled, a recipient exists, and they have not
    # switched this kind of email off.
    if rules.get("email") and recipient_email and email_allowed(_email_prefs(user_id), event):
        try:
            _send_notification_email(
                to=recipient_email,
                name=recipient_name or "there",
                title=title,
                body=body,
                cta_url=cta_url,
                event=event,
                user_id=user_id,
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


def _email_prefs(user_id: str) -> dict:
    try:
        sb = get_supabase_admin()
        res = sb.table("profiles").select("notification_prefs").eq("id", str(user_id)).execute()
        if res.data:
            return res.data[0].get("notification_prefs") or {}
    except Exception:
        pass
    return {}


# The look of each notification email (email_theme.py): which coloured
# banner, the small tag, the button, and an optional tip.
NOTIFICATION_DESIGN: dict[str, tuple[str, str | None, str, tuple[str, str] | None]] = {
    "booking_request_created": ("stays", "New stay request", "Review the request", ("Respond within 48 hours", "Requests expire after 48 hours.")),
    "booking_approved": ("stays", "Accepted", "View your booking", None),
    "booking_declined": ("searches", "Booking update", "Find another room", ("Keep going", "New rooms are listed every day. Save a search and we'll email you.")),
    "booking_confirmed": ("stays", "Confirmed", "View your booking", None),
    "payment_received": ("money", "Payment", "View the payment", None),
    "verification_status_changed": ("identity", "ID check", "View your ID check", None),
    "message_received": ("messages", "New message", "Reply", ("Stay safe", "Keep your conversation in Migrent Hub. If anyone asks you to pay before an inspection, report the message.")),
    "host_response_sent": ("messages", "New reply", "View the reply", None),
    "listing_published": ("listings", "Live", "View your listing", ("Get more applications", "Listings with 6 or more photos and a clear move-in cost get the most enquiries.")),
    "listing_rejected": ("listings", "Not approved", "Edit your listing", None),
    "listing_changes_requested": ("listings", "Almost there", "Edit your listing", None),
    "listing_flagged": ("security", "In review", "View your listing", None),
    "listing_hidden": ("security", "Hidden", "View your listing", None),
    "listing_removed": ("security", "Removed", "Contact support", None),
    "mentor_approved": ("mentors", "Approved", "Open your mentor profile", None),
    "mentor_rejected": ("mentors", "Mentor profile", "Update your profile", None),
    "application_submitted": ("applications", "New application", "Review the application", ("Tip", "Owners who reply within a day find a tenant faster.")),
    "application_status_changed": ("applications", "Application update", "View your application", None),
    "application_changes_requested": ("applications", "Action needed", "Update your application", None),
    "application_approved": ("applications", "Approved", "View your application", ("What happens next", "Migrent checks everything is complete, then sets up your tenancy in Migrent Hub.")),
    "application_finalised": ("home", "Finalised", "See your new home", ("Welcome home", "Your lease details, rent record and repairs now live in Migrent Hub.")),
    "inspection_booked": ("inspections", "Booked", "View the inspection", ("Before you go", "Check the room matches the photos and walk to the station. Never pay anything at an inspection.")),
    "inspection_changed": ("inspections", "New time", "View the inspection", None),
    "inspection_cancelled": ("inspections", "Cancelled", "Find another time", None),
    "inspection_reminder": ("inspections", "Reminder", "View the inspection", ("Bring", "Photo ID, and your questions about bills, house rules and the lease.")),
    "saved_search_match": ("searches", "New homes", "See the new homes", ("Be quick", "Good rooms go fast. Message the host or book an inspection today.")),
    "maintenance_created": ("home", "Repair request", "View the request", None),
    "maintenance_updated": ("home", "Repair update", "View the request", None),
    "tenancy_created": ("home", "Tenancy set up", "See your home", None),
    "review_prompt": ("reviews", "Your review", "Write a review", ("Fair for everyone", "Reviews from both sides appear together once you've both written one, or after 14 days.")),
    "review_received": ("reviews", "New review", "Write your review", None),
    "move_in_fee_failed": ("money", "Action needed", "Update your card", None),
    "admin_security_alert": ("security", "Security alert", "Open the audit log", None),
}


def _send_notification_email(
    to: str,
    name: str,
    title: str,
    body: str,
    cta_url: str,
    event: str,
    user_id: str | None = None,
):
    """Send a generic notification email using the Migrent template.

    Title, body and name can contain text other people wrote (a listing
    title, a renter's name), so they are HTML-escaped before they reach the
    template. The CTA deep-links to the exact Hub page the event is about.
    """
    import html as _html

    import email_theme as et

    full_url = cta_url if cta_url.startswith("http") else f"{FRONTEND_URL}{cta_url}"
    kind, eyebrow, btn_text, tip = NOTIFICATION_DESIGN.get(event, ("account", None, "Open Migrent Hub", None))
    theme = et.THEMES[kind]

    # Every kind of email that has an on/off switch carries an unsubscribe
    # link and header (unsubscribe.py, MIG-031).
    group = EMAIL_PREFERENCE_GROUP.get(event)
    mail_headers = None
    footer_text = ""
    footer_note = ""
    if group and user_id:
        import unsubscribe

        stop = unsubscribe.page_url(str(user_id), group)
        label = unsubscribe.GROUP_LABELS.get(group, "these")
        footer_note = (
            f'You get these emails about {_html.escape(label)}. <a href="{_html.escape(stop, quote=True)}" style="color:#C7D0E6;">Unsubscribe</a>'
            " or choose which emails you get in Migrent Hub settings."
        )
        footer_text = f"\n\nYou get these emails about {label}. Unsubscribe: {stop}"
        mail_headers = unsubscribe.headers(str(user_id), group)

    html_body = et.render(
        kind,
        eyebrow=eyebrow,
        title=title,
        preheader=body[:140],
        greeting=name,
        paragraphs=[body],
        cta=(btn_text, full_url),
        after=[et.tip(tip[0], tip[1], theme)] if tip else [],
        footer_note=footer_note,
    )

    text_body = (
        f"Hi {name},\n\n"
        f"{title}\n\n"
        f"{body}\n\n"
        f"{btn_text}: {full_url}\n\n"
        f"- The Migrent team"
        f"{footer_text}"
    )

    _send_email(to, title, html_body, text_body, headers=mail_headers)
