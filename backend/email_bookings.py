"""
Email notifications for the booking flow.

Uses Mailjet for transactional emails. All functions are fire-and-forget
- callers should wrap in try/except so email failures never block bookings.
"""

import os
import logging
import httpx

logger = logging.getLogger(__name__)

MAILJET_API_KEY = os.environ.get("MAILJET_API_KEY", "")
MAILJET_SECRET_KEY = os.environ.get("MAILJET_SECRET_KEY", "")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "migrentau@gmail.com")
FROM_NAME = os.environ.get("FROM_NAME", "MigRent")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Brand colors
BRAND_COLOR = "#E11D48"
BRAND_BG = "#f6f9fc"


def _email_layout(content: str, preview: str = "") -> str:
    """Wrap email content in the standard MigRent HTML layout."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MigRent</title>
</head>
<body style="margin:0;padding:0;background-color:{BRAND_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    <!-- Header -->
    <div style="background-color:{BRAND_COLOR};padding:24px 32px;text-align:center;">
      <a href="{FRONTEND_URL}" style="text-decoration:none;">
        <span style="color:#ffffff;font-size:28px;font-weight:bold;letter-spacing:-0.5px;">MigRent</span>
      </a>
    </div>

    <!-- Content -->
    <div style="padding:32px;">
      {content}
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #e6ebf1;padding:24px 32px;text-align:center;">
      <p style="color:#8898aa;font-size:14px;margin:0 0 8px;">MigRent - Find your home in Australia</p>
      <p style="color:#8898aa;font-size:12px;margin:0 0 8px;">
        <a href="{FRONTEND_URL}" style="color:{BRAND_COLOR};text-decoration:none;">Website</a> |
        <a href="{FRONTEND_URL}/support" style="color:{BRAND_COLOR};text-decoration:none;">Support</a> |
        <a href="{FRONTEND_URL}/settings" style="color:{BRAND_COLOR};text-decoration:none;">Email Preferences</a>
      </p>
      <p style="color:#b0b8c4;font-size:11px;line-height:16px;margin:8px 0 0;">
        You are receiving this email because you have an account on MigRent.
      </p>
    </div>
  </div>
</body>
</html>"""


def _button(text: str, url: str, color: str = BRAND_COLOR) -> str:
    return f"""<div style="text-align:center;margin:24px 0;">
      <a href="{url}" style="background-color:{color};border-radius:8px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;display:inline-block;">{text}</a>
    </div>"""


def _details_box(rows: list[tuple[str, str]]) -> str:
    """Create a details box with label/value pairs."""
    items = ""
    for label, value in rows:
        items += f"""<div style="display:inline-block;width:48%;vertical-align:top;margin-bottom:12px;">
          <p style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">{label}</p>
          <p style="font-size:15px;font-weight:500;color:#1a1a1a;margin:0;">{value}</p>
        </div>"""
    return f"""<div style="background:#f9fafb;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e5e7eb;">
      {items}
    </div>"""


def _send_email(to: str, subject: str, html: str, text: str = ""):
    """Send an HTML email via Mailjet with plain-text fallback."""
    if not MAILJET_API_KEY or not MAILJET_SECRET_KEY:
        logger.warning("MAILJET keys not set - skipping email to %s", to)
        return

    try:
        payload = {
            "Messages": [
                {
                    "From": {"Email": FROM_EMAIL, "Name": FROM_NAME},
                    "To": [{"Email": to}],
                    "Subject": subject,
                    "HTMLPart": html,
                }
            ]
        }
        if text:
            payload["Messages"][0]["TextPart"] = text

        response = httpx.post(
            "https://api.mailjet.com/v3.1/send",
            json=payload,
            auth=(MAILJET_API_KEY, MAILJET_SECRET_KEY),
            timeout=10,
        )
        response.raise_for_status()
        logger.info("Email sent to %s: %s", to, subject)
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, e)


def send_booking_request_to_owner(
    owner_email: str,
    owner_name: str,
    seeker_name: str,
    listing_title: str,
    check_in: str,
    check_out: str,
    guests: int,
    total_price: float,
    booking_id: str,
):
    subject = f"New booking request for {listing_title}"

    content = f"""
    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">New Booking Request</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {owner_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      <strong>{seeker_name}</strong> wants to book your listing:
    </p>

    {_details_box([
        ("Listing", listing_title),
        ("Guests", str(guests)),
        ("Check-in", check_in),
        ("Check-out", check_out),
        ("Estimated Rent", f"AUD ${total_price:,.2f}"),
        ("Status", "Awaiting your response"),
    ])}

    {_button("Review Request", f"{FRONTEND_URL}/dashboard/owner")}

    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:8px 0 0;">
      You have 48 hours to respond before the request expires.
    </p>
    """

    text = (
        f"Hi {owner_name},\n\n"
        f"{seeker_name} has requested to book your listing: {listing_title}\n\n"
        f"Dates: {check_in} to {check_out}\n"
        f"Guests: {guests}\n"
        f"Estimated rent: AUD ${total_price:,.2f}\n\n"
        f"Review: {FRONTEND_URL}/dashboard/owner\n\n"
        f"You have 48 hours to respond.\n\n"
        f"- The MigRent Team"
    )

    _send_email(owner_email, subject, _email_layout(content, f"New booking from {seeker_name}"), text)


def send_booking_accepted_to_seeker(
    seeker_email: str,
    seeker_name: str,
    listing_title: str,
    checkout_url: str,
    booking_id: str,
):
    subject = f"Your booking for {listing_title} was approved!"

    content = f"""
    <div style="background:#ecfdf5;border-radius:8px;padding:12px;text-align:center;margin:0 0 20px;">
      <p style="color:#059669;font-size:16px;font-weight:600;margin:0;">Approved</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Your Booking Was Approved!</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {seeker_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Great news! The owner has accepted your booking request for <strong>{listing_title}</strong>.
      Complete your payment to confirm the booking.
    </p>

    {_details_box([
        ("Service Fees", "AUD $118.00"),
        ("Breakdown", "Owner fee: $99 + Seeker fee: $19"),
    ])}

    {_button("Pay to Confirm Booking", checkout_url, "#059669")}

    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:8px 0 0;">
      Secure payment powered by Stripe.
    </p>
    """

    text = (
        f"Hi {seeker_name},\n\n"
        f"Great news! The owner has accepted your booking request for: {listing_title}\n\n"
        f"Complete your payment to confirm: {checkout_url}\n\n"
        f"Service fees: Owner $99 + Seeker $19 = $118\n\n"
        f"- The MigRent Team"
    )

    _send_email(seeker_email, subject, _email_layout(content, f"Booking approved for {listing_title}"), text)


def send_booking_declined_to_seeker(
    seeker_email: str,
    seeker_name: str,
    listing_title: str,
):
    subject = f"Update on your booking request for {listing_title}"

    content = f"""
    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Booking Update</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {seeker_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Unfortunately, the owner has declined your booking request for <strong>{listing_title}</strong>.
    </p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Don't worry - there are plenty of other great listings on MigRent!
    </p>

    {_button("Browse More Listings", f"{FRONTEND_URL}/seeker/search")}

    <div style="background:#eff6ff;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #3b82f6;">
      <p style="font-size:14px;font-weight:600;color:#1e40af;margin:0 0 8px;">Tips for getting accepted:</p>
      <p style="font-size:13px;color:#1e40af;margin:0 0 4px;line-height:20px;">- Write a friendly introduction about yourself</p>
      <p style="font-size:13px;color:#1e40af;margin:0 0 4px;line-height:20px;">- Mention your occupation or study plans</p>
      <p style="font-size:13px;color:#1e40af;margin:0 0 4px;line-height:20px;">- Be clear about your move-in timeline</p>
      <p style="font-size:13px;color:#1e40af;margin:0;line-height:20px;">- Complete your profile verification</p>
    </div>
    """

    text = (
        f"Hi {seeker_name},\n\n"
        f"Unfortunately, the owner has declined your booking request for: {listing_title}\n\n"
        f"Browse more listings: {FRONTEND_URL}/seeker/search\n\n"
        f"- The MigRent Team"
    )

    _send_email(seeker_email, subject, _email_layout(content), text)


def send_booking_confirmed_to_both(
    owner_email: str,
    owner_name: str,
    seeker_email: str,
    seeker_name: str,
    listing_title: str,
    check_in: str,
    check_out: str,
    booking_id: str,
):
    # Email to owner
    owner_content = f"""
    <div style="background:#ecfdf5;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#059669;font-size:18px;font-weight:700;margin:0;">Booking Confirmed!</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Your Room is Booked!</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {owner_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Payment is complete! The booking for <strong>{listing_title}</strong> is now confirmed.
    </p>

    {_details_box([
        ("Guest", seeker_name),
        ("Status", "Confirmed"),
        ("Check-in", check_in),
        ("Check-out", check_out),
    ])}

    <div style="background:#fef3c7;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #f59e0b;">
      <p style="font-size:14px;font-weight:600;color:#92400e;margin:0 0 8px;">Next Steps:</p>
      <p style="font-size:13px;color:#92400e;margin:0 0 4px;line-height:20px;">1. Message {seeker_name} to share move-in instructions</p>
      <p style="font-size:13px;color:#92400e;margin:0 0 4px;line-height:20px;">2. Prepare the room for your guest's arrival</p>
      <p style="font-size:13px;color:#92400e;margin:0;line-height:20px;">3. Be available on check-in day for handover</p>
    </div>

    {_button("Go to Dashboard", f"{FRONTEND_URL}/dashboard/owner")}
    """

    owner_text = (
        f"Hi {owner_name},\n\n"
        f"Payment is complete! The booking for {listing_title} is now confirmed.\n\n"
        f"Guest: {seeker_name}\n"
        f"Dates: {check_in} to {check_out}\n\n"
        f"Dashboard: {FRONTEND_URL}/dashboard/owner\n\n"
        f"- The MigRent Team"
    )

    _send_email(owner_email, f"Booking confirmed - {listing_title}", _email_layout(owner_content), owner_text)

    # Email to seeker
    seeker_content = f"""
    <div style="background:#ecfdf5;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#059669;font-size:18px;font-weight:700;margin:0;">Booking Confirmed!</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Welcome to Your New Home!</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {seeker_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Your booking for <strong>{listing_title}</strong> is confirmed!
    </p>

    {_details_box([
        ("Host", owner_name),
        ("Status", "Confirmed"),
        ("Check-in", check_in),
        ("Check-out", check_out),
    ])}

    <div style="background:#fef3c7;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #f59e0b;">
      <p style="font-size:14px;font-weight:600;color:#92400e;margin:0 0 8px;">Next Steps:</p>
      <p style="font-size:13px;color:#92400e;margin:0 0 4px;line-height:20px;">1. Message {owner_name} to coordinate move-in details</p>
      <p style="font-size:13px;color:#92400e;margin:0 0 4px;line-height:20px;">2. Prepare your documents (ID, visa if applicable)</p>
      <p style="font-size:13px;color:#92400e;margin:0;line-height:20px;">3. Arrive on your check-in date</p>
    </div>

    {_button("Go to Dashboard", f"{FRONTEND_URL}/dashboard/seeker")}
    """

    seeker_text = (
        f"Hi {seeker_name},\n\n"
        f"Your booking for {listing_title} is confirmed!\n\n"
        f"Check-in: {check_in}\nCheck-out: {check_out}\n\n"
        f"Dashboard: {FRONTEND_URL}/dashboard/seeker\n\n"
        f"Welcome to your new home!\n\n"
        f"- The MigRent Team"
    )

    _send_email(seeker_email, f"Booking confirmed - {listing_title}", _email_layout(seeker_content), seeker_text)


def send_listing_approved_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
):
    """Notify owner their listing has been approved and is now live."""
    subject = f"Your listing '{listing_title}' is now live!"

    content = f"""
    <div style="background:#ecfdf5;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#059669;font-size:18px;font-weight:700;margin:0;">Listing Approved</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Your Listing is Live!</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {owner_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Great news! Your listing <strong>{listing_title}</strong> has been reviewed and approved by our team.
      It is now visible to seekers on MigRent.
    </p>

    {_details_box([
        ("Listing", listing_title),
        ("Status", "Live"),
    ])}

    {_button("View Your Listing", f"{FRONTEND_URL}/owner/listings")}

    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:8px 0 0;">
      Seekers can now find and book your room.
    </p>
    """

    text = (
        f"Hi {owner_name},\n\n"
        f"Your listing '{listing_title}' has been approved and is now live on MigRent!\n\n"
        f"View your listings: {FRONTEND_URL}/owner/listings\n\n"
        f"- The MigRent Team"
    )

    _send_email(owner_email, subject, _email_layout(content, f"Listing approved: {listing_title}"), text)


def send_listing_rejected_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
    reason: str,
):
    """Notify owner their listing was rejected with a reason."""
    subject = f"Update on your listing '{listing_title}'"

    content = f"""
    <div style="background:#fef2f2;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#dc2626;font-size:18px;font-weight:700;margin:0;">Listing Not Approved</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Listing Update</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {owner_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Unfortunately, your listing <strong>{listing_title}</strong> was not approved.
    </p>

    <div style="background:#fef3c7;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #f59e0b;">
      <p style="font-size:14px;font-weight:600;color:#92400e;margin:0 0 8px;">Reason:</p>
      <p style="font-size:14px;color:#92400e;margin:0;line-height:22px;">{reason}</p>
    </div>

    <p style="font-size:15px;line-height:24px;color:#374151;margin:16px 0 12px;">
      You can update your listing and resubmit it for review.
    </p>

    {_button("Edit Your Listing", f"{FRONTEND_URL}/owner/listings")}

    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:8px 0 0;">
      Need help? Contact our support team.
    </p>
    """

    text = (
        f"Hi {owner_name},\n\n"
        f"Your listing '{listing_title}' was not approved.\n\n"
        f"Reason: {reason}\n\n"
        f"You can edit and resubmit: {FRONTEND_URL}/owner/listings\n\n"
        f"- The MigRent Team"
    )

    _send_email(owner_email, subject, _email_layout(content), text)


def send_listing_changes_requested_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
    changes_needed: str,
):
    """Notify owner that changes are needed before their listing can go live."""
    subject = f"Changes needed for your listing '{listing_title}'"

    content = f"""
    <div style="background:#fff7ed;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#ea580c;font-size:18px;font-weight:700;margin:0;">Changes Requested</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Almost There!</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {owner_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Your listing <strong>{listing_title}</strong> needs a few changes before it can go live.
    </p>

    <div style="background:#eff6ff;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #3b82f6;">
      <p style="font-size:14px;font-weight:600;color:#1e40af;margin:0 0 8px;">What to update:</p>
      <p style="font-size:14px;color:#1e40af;margin:0;line-height:22px;">{changes_needed}</p>
    </div>

    <p style="font-size:15px;line-height:24px;color:#374151;margin:16px 0 12px;">
      Once you make the changes, your listing will be re-reviewed quickly.
    </p>

    {_button("Edit Your Listing", f"{FRONTEND_URL}/owner/listings")}
    """

    text = (
        f"Hi {owner_name},\n\n"
        f"Your listing '{listing_title}' needs some changes before going live.\n\n"
        f"Changes needed: {changes_needed}\n\n"
        f"Edit your listing: {FRONTEND_URL}/owner/listings\n\n"
        f"- The MigRent Team"
    )

    _send_email(owner_email, subject, _email_layout(content, f"Changes needed: {listing_title}"), text)


def send_listing_under_review_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
):
    """Notify owner their listing is under additional review (flagged by spam detection)."""
    subject = f"Your listing '{listing_title}' is under review"

    content = f"""
    <div style="background:#fff7ed;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#ea580c;font-size:18px;font-weight:700;margin:0;">Under Review</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Listing Under Review</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {owner_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Your listing <strong>{listing_title}</strong> is currently under additional review by our team.
      This is a routine part of our quality and safety process - it does not mean there is a problem.
    </p>

    <div style="background:#eff6ff;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #3b82f6;">
      <p style="font-size:14px;font-weight:600;color:#1e40af;margin:0 0 8px;">What happens next?</p>
      <p style="font-size:13px;color:#1e40af;margin:0 0 4px;line-height:20px;">- Our team will review your listing shortly</p>
      <p style="font-size:13px;color:#1e40af;margin:0 0 4px;line-height:20px;">- You will receive an email once the review is complete</p>
      <p style="font-size:13px;color:#1e40af;margin:0;line-height:20px;">- If changes are needed, we will let you know exactly what to update</p>
    </div>

    {_button("View Your Listings", f"{FRONTEND_URL}/owner/listings")}

    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:8px 0 0;">
      If you have questions, please contact our support team.
    </p>
    """

    text = (
        f"Hi {owner_name},\n\n"
        f"Your listing '{listing_title}' is currently under additional review.\n"
        f"This is routine - our team will review it shortly.\n\n"
        f"View your listings: {FRONTEND_URL}/owner/listings\n\n"
        f"- The MigRent Team"
    )

    _send_email(owner_email, subject, _email_layout(content, f"Listing under review: {listing_title}"), text)


def send_listing_removed_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
    reason: str,
):
    """Notify owner their listing has been removed after founder review."""
    subject = f"Your listing '{listing_title}' has been removed"

    content = f"""
    <div style="background:#fef2f2;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#dc2626;font-size:18px;font-weight:700;margin:0;">Listing Removed</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Listing Update</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {owner_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      After review, your listing <strong>{listing_title}</strong> has been removed from MigRent.
    </p>

    <div style="background:#fef3c7;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #f59e0b;">
      <p style="font-size:14px;font-weight:600;color:#92400e;margin:0 0 8px;">Reason:</p>
      <p style="font-size:14px;color:#92400e;margin:0;line-height:22px;">{reason}</p>
    </div>

    <p style="font-size:15px;line-height:24px;color:#374151;margin:16px 0 12px;">
      If you believe this was a mistake, please contact our support team and we will be happy to review.
    </p>

    {_button("Contact Support", f"{FRONTEND_URL}/support")}

    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:8px 0 0;">
      All moderation decisions are reviewed by a real person on our team.
    </p>
    """

    text = (
        f"Hi {owner_name},\n\n"
        f"Your listing '{listing_title}' has been removed.\n\n"
        f"Reason: {reason}\n\n"
        f"If you believe this was a mistake, contact support: {FRONTEND_URL}/support\n\n"
        f"- The MigRent Team"
    )

    _send_email(owner_email, subject, _email_layout(content), text)


def send_new_message_notification(
    recipient_email: str,
    recipient_name: str,
    sender_name: str,
    message_preview: str,
    listing_title: str | None = None,
    thread_url: str = "",
):
    """Send email notification when a user receives a new message."""
    subject = f"New message from {sender_name}"

    preview_text = message_preview[:200] + "..." if len(message_preview) > 200 else message_preview
    about = f" about <strong>{listing_title}</strong>" if listing_title else ""
    thread_link = thread_url or f"{FRONTEND_URL}/messages"

    content = f"""
    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">New Message</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {recipient_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      <strong>{sender_name}</strong> sent you a message{about}:
    </p>

    <div style="background:#f3f4f6;border-radius:8px;padding:20px;margin:16px 0;border-left:3px solid {BRAND_COLOR};">
      <p style="font-size:15px;font-style:italic;color:#374151;line-height:24px;margin:0;">
        "{preview_text}"
      </p>
    </div>

    {_button("Reply Now", thread_link)}

    <p style="font-size:13px;color:#9ca3af;text-align:center;margin:8px 0 0;">
      You can manage your message notifications in your account settings.
    </p>
    """

    text = (
        f"Hi {recipient_name},\n\n"
        f"{sender_name} sent you a message"
        f"{f' about {listing_title}' if listing_title else ''}:\n\n"
        f'"{preview_text}"\n\n'
        f"Reply: {thread_link}\n\n"
        f"- The MigRent Team"
    )

    _send_email(recipient_email, subject, _email_layout(content, f"New message from {sender_name}"), text)
