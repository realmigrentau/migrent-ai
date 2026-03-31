"""
Email verification code sending utility.

Sends 6-digit codes via Mailjet for signup verification and 2FA.
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

BRAND_COLOR = "#E11D48"
BRAND_BG = "#f6f9fc"


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
        <span style="color:#ffffff;font-size:28px;font-weight:bold;letter-spacing:-0.5px;">MigRent</span>
      </a>
    </div>
    <div style="padding:32px;">{content}</div>
    <div style="border-top:1px solid #e6ebf1;padding:24px 32px;text-align:center;">
      <p style="color:#8898aa;font-size:14px;margin:0 0 8px;">MigRent - Find your home in Australia</p>
      <p style="color:#b0b8c4;font-size:11px;line-height:16px;margin:8px 0 0;">
        If you did not request this code, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>"""


def _send(to: str, subject: str, html: str):
    if not MAILJET_API_KEY or not MAILJET_SECRET_KEY:
        logger.warning("MAILJET keys not set - skipping email to %s", to)
        return
    try:
        response = httpx.post(
            "https://api.mailjet.com/v3.1/send",
            json={
                "Messages": [{
                    "From": {"Email": FROM_EMAIL, "Name": FROM_NAME},
                    "To": [{"Email": to}],
                    "Subject": subject,
                    "HTMLPart": html,
                }]
            },
            auth=(MAILJET_API_KEY, MAILJET_SECRET_KEY),
            timeout=10,
        )
        response.raise_for_status()
        logger.info("Verification code email sent to %s", to)
    except Exception as e:
        logger.error("Failed to send verification code email to %s: %s", to, e)


def send_signup_verification_code(to_email: str, code: str):
    """Send a 6-digit signup verification code."""
    content = f"""
    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Verify your email</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Welcome to MigRent! Enter this code on the website to verify your email address and complete your sign-up:
    </p>

    <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1a1a1a;margin:0;font-family:monospace;">
        {code}
      </p>
    </div>

    <p style="font-size:14px;color:#6b7280;margin:0 0 8px;">
      This code expires in <strong>10 minutes</strong>.
    </p>
    <p style="font-size:14px;color:#6b7280;margin:0;">
      If you did not create an account on MigRent, you can safely ignore this email.
    </p>
    """
    _send(to_email, f"Your MigRent verification code: {code}", _email_layout(content))


def send_2fa_code(to_email: str, code: str):
    """Send a 6-digit 2FA login verification code."""
    content = f"""
    <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Sign-in verification</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      Someone is trying to sign in to your MigRent account. Enter this code to confirm it is you:
    </p>

    <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1a1a1a;margin:0;font-family:monospace;">
        {code}
      </p>
    </div>

    <p style="font-size:14px;color:#6b7280;margin:0 0 8px;">
      This code expires in <strong>5 minutes</strong>.
    </p>
    <p style="font-size:14px;color:#6b7280;margin:0;">
      If you did not try to sign in, someone may have your password. Change it immediately.
    </p>
    """
    _send(to_email, f"MigRent sign-in code: {code}", _email_layout(content))
