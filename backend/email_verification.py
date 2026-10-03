"""
Email notifications for the owner verification flow.

Sent through email_bookings._send_email in the shared design (email_theme.py).
All functions are fire-and-forget.
"""

import os
import logging

logger = logging.getLogger(__name__)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://migrent.vercel.app")



def _hub_url(path: str) -> str:
    """Absolute link to a Migrent Hub page (MIG-030: not the old /owner and
    /account pages, which bounce through sign-in)."""
    base = os.environ.get("HUB_BASE_URL", "").rstrip("/") or f"{FRONTEND_URL}/hub"
    return f"{base}{path}"


def _send(to: str, subject: str, html: str):
    """The one sender for every Migrent email (email_bookings._send_email:
    Gmail SMTP when configured, otherwise Mailjet)."""
    from email_bookings import _send_email

    _send_email(to, subject, html)


def send_id_approved_email(to_email: str, owner_name: str, fully_verified: bool):
    """Notify owner their government ID was approved."""
    import email_theme as et

    t = et.THEMES["identity"]
    first = ((owner_name or "").split(" ")[0]) or "there"
    body = et.render(
        "identity",
        eyebrow="ID approved",
        title="Your ID is checked",
        preheader="Your government ID was approved." + (" You can list rooms now." if fully_verified else ""),
        greeting=first,
        paragraphs=["Your government ID has been reviewed and approved by our team. Renters now see the ID-checked badge on your profile and listings."],
        blocks=[et.details([("ID check", "Approved"), ("Badge", "ID-checked host")], t)],
        cta=("List your room", _hub_url("/properties/new")) if fully_verified else ("Open Migrent Hub", _hub_url("/")),
        after=[et.tip("Your document is private", "Renters never see your ID itself, only that Migrent checked it.", t)],
    )
    _send(to_email, "Your Migrent ID has been approved", body)


def send_id_rejected_email(to_email: str, owner_name: str, reason: str):
    """Notify owner their government ID was rejected with reason."""
    import email_theme as et

    t = et.THEMES["identity"]
    first = ((owner_name or "").split(" ")[0]) or "there"
    body = et.render(
        "identity",
        eyebrow="ID check",
        title="We couldn't approve your ID",
        preheader="Your ID needs another try. Here's why.",
        greeting=first,
        paragraphs=["Your government ID couldn't be approved this time. It's usually a quick fix."],
        blocks=[et.note("Why", reason, t), et.steps(["Take a clear photo in good light", "Make sure every corner and your name are visible", "Upload it again in Settings"], t, title="Try again")],
        cta=("Upload your ID again", _hub_url("/settings#verification")),
    )
    _send(to_email, "Update on your Migrent ID verification", body)


def send_founder_id_review_alert(founder_email: str, owner_name: str, owner_email: str, document_type: str):
    """Alert the founder that a new ID needs review."""
    import email_theme as et
    from hub_common import hub_path

    review_url = hub_path("/admin/id-checks")
    review_url = review_url if review_url.startswith("http") else f"{FRONTEND_URL}{review_url}"
    doc_labels = {"passport": "Passport", "drivers_licence": "Driver's Licence", "visa": "Visa", "national_id": "National ID"}
    t = et.THEMES["identity"]
    body = et.render(
        "identity",
        eyebrow="Admin: new ID",
        title="An ID is waiting for review",
        preheader=f"{owner_name} sent a {doc_labels.get(document_type, document_type)} for checking.",
        paragraphs=["A new government ID was sent for checking. Their listings wait until it's approved."],
        blocks=[et.details([("Name", owner_name), ("Email", owner_email), ("Document", doc_labels.get(document_type, document_type))], t, title="Submission")],
        cta=("Review in the Admin panel", review_url),
    )
    _send(founder_email, f"New ID submission from {owner_name} - review needed", body)
