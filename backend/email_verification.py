"""
Email notifications for the owner verification flow.

Uses Mailjet (same as email_bookings.py). All functions are fire-and-forget.
"""

import os
import logging

logger = logging.getLogger(__name__)

FROM_EMAIL = os.environ.get("FROM_EMAIL", "migrentau@gmail.com")
FROM_NAME = os.environ.get("FROM_NAME", "Migrent")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://migrent.vercel.app")

BRAND_COLOR = "#E11D48"
BRAND_BG = "#f6f9fc"


def _hub_url(path: str) -> str:
    """Absolute link to a Migrent Hub page (MIG-030: not the old /owner and
    /account pages, which bounce through sign-in)."""
    base = os.environ.get("HUB_BASE_URL", "").rstrip("/") or f"{FRONTEND_URL}/hub"
    return f"{base}{path}"


def _email_layout(content: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:{BRAND_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    <div style="background-color:{BRAND_COLOR};padding:24px 32px;text-align:center;">
      <a href="{FRONTEND_URL}" style="text-decoration:none;">
        <span style="color:#ffffff;font-size:28px;font-weight:bold;letter-spacing:-0.5px;">Migrent</span>
      </a>
    </div>
    <div style="padding:32px;">{content}</div>
    <div style="border-top:1px solid #e6ebf1;padding:24px 32px;text-align:center;">
      <p style="color:#8898aa;font-size:14px;margin:0 0 8px;">Migrent - Find your home in Australia</p>
      <p style="color:#b0b8c4;font-size:11px;line-height:16px;margin:8px 0 0;">
        You are receiving this email because you have an account on Migrent.
      </p>
    </div>
  </div>
</body>
</html>"""


def _send(to: str, subject: str, html: str):
    """The one sender for every Migrent email (email_bookings._send_email:
    Gmail SMTP when configured, otherwise Mailjet)."""
    from email_bookings import _send_email

    _send_email(to, subject, html)


def send_id_approved_email(to_email: str, owner_name: str, fully_verified: bool):
    """Notify owner their government ID was approved."""
    extra = ""
    if fully_verified:
        extra = """
        <div style="background:#ecfdf5;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
          <p style="color:#059669;font-size:16px;font-weight:600;margin:0;">You are now fully verified!</p>
          <p style="color:#059669;font-size:14px;margin:8px 0 0;">You can now create and list rooms on Migrent.</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="{url}" style="background-color:#059669;border-radius:8px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;display:inline-block;">List Your Room</a>
        </div>
        """.replace("{url}", _hub_url("/properties/new"))

    content = f"""
    <div style="background:#ecfdf5;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#059669;font-size:18px;font-weight:700;margin:0;">ID Approved</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Your ID Has Been Verified</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {owner_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Your government ID has been reviewed and approved by our team.
    </p>
    {extra}
    """
    _send(to_email, "Your Migrent ID has been approved", _email_layout(content))


def send_id_rejected_email(to_email: str, owner_name: str, reason: str):
    """Notify owner their government ID was rejected with reason."""
    content = f"""
    <div style="background:#fef2f2;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#dc2626;font-size:18px;font-weight:700;margin:0;">ID Not Approved</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">ID Review Update</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">Hi {owner_name},</p>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Unfortunately, your government ID could not be approved at this time.
    </p>

    <div style="background:#fef3c7;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #f59e0b;">
      <p style="font-size:14px;font-weight:600;color:#92400e;margin:0 0 8px;">Reason:</p>
      <p style="font-size:14px;color:#92400e;margin:0;line-height:22px;">{reason}</p>
    </div>

    <p style="font-size:15px;line-height:24px;color:#374151;margin:16px 0 12px;">
      You can upload a new document and try again.
    </p>

    <div style="text-align:center;margin:24px 0;">
      <a href="{_hub_url('/settings#verification')}" style="background-color:{BRAND_COLOR};border-radius:8px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;display:inline-block;">Re-upload ID</a>
    </div>
    """
    _send(to_email, "Update on your Migrent ID verification", _email_layout(content))


def send_founder_id_review_alert(founder_email: str, owner_name: str, owner_email: str, document_type: str):
    """Alert the founder that a new ID needs review."""
    from hub_common import hub_path

    review_url = hub_path("/admin/id-checks")
    review_url = review_url if review_url.startswith("http") else f"{FRONTEND_URL}{review_url}"
    doc_labels = {
        "passport": "Passport",
        "drivers_licence": "Driver's Licence",
        "visa": "Visa",
        "national_id": "National ID",
    }

    content = f"""
    <div style="background:#eff6ff;border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:#2563eb;font-size:18px;font-weight:700;margin:0;">New ID Submission</p>
    </div>

    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Owner ID Needs Review</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      A new government ID has been submitted for verification:
    </p>

    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e5e7eb;">
      <div style="margin-bottom:12px;">
        <p style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Owner</p>
        <p style="font-size:15px;font-weight:500;color:#1a1a1a;margin:0;">{owner_name}</p>
      </div>
      <div style="margin-bottom:12px;">
        <p style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Email</p>
        <p style="font-size:15px;font-weight:500;color:#1a1a1a;margin:0;">{owner_email}</p>
      </div>
      <div>
        <p style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Document Type</p>
        <p style="font-size:15px;font-weight:500;color:#1a1a1a;margin:0;">{doc_labels.get(document_type, document_type)}</p>
      </div>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="{review_url}" style="background-color:#2563eb;border-radius:8px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;display:inline-block;">Review Now</a>
    </div>
    """
    _send(founder_email, f"New ID submission from {owner_name} - review needed", _email_layout(content))
