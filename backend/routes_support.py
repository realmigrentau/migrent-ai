import logging
from typing import Optional

from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, HTTPException, Request
from db import get_supabase_admin
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/support", tags=["support"])

# The Contact page's topics and the support queue category each lands in
# (tickets_category_check). Safety reports are answered first.
TOPIC_CATEGORY = {
    "ACCOUNT": "onboarding",
    "VERIFY": "verification",
    "LISTING": "listings",
    "APPLICATION": "onboarding",
    "BOOKING": "billing",
    "SAFETY": "trust_safety",
    "GENERAL": "feedback",
}
TOPIC_LABEL = {
    "ACCOUNT": "My account or signing in",
    "VERIFY": "ID checks",
    "LISTING": "A listing",
    "APPLICATION": "An application or inspection",
    "BOOKING": "A stay booking or a fee",
    "SAFETY": "Safety, or reporting someone",
    "GENERAL": "Something else",
}


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    role: str = Field(..., pattern="^(seeker|owner)$")
    message: str = Field(..., min_length=10, max_length=5000)
    topic: Optional[str] = Field(None, max_length=20)
    subject: Optional[str] = Field(None, max_length=120)
    # Hidden from people; bots fill it in (see support_guard.is_bot).
    website: Optional[str] = Field(None, max_length=200)


@router.post("/contact")
@limiter.limit("3/minute")
def submit_contact(request: Request, body: ContactRequest):
    """The public Contact page.

    Each message becomes a ticket in the Admin panel's Support queue, exactly
    as the help button's messages do, and the sender gets a confirmation with
    a reference. These used to go into support_requests, which no screen
    read (migration 046 moved the old ones across).
    """
    sb = get_supabase_admin()
    from support_guard import guest_limit_reached, is_bot

    if is_bot(body.website):
        return {"status": "ok", "reference": "received"}
    if guest_limit_reached(sb, body.email):
        raise HTTPException(status_code=429, detail="We have your messages. We'll reply by email; please wait for that before sending more.")
    topic = (body.topic or "GENERAL").upper()
    if topic not in TOPIC_CATEGORY:
        topic = "GENERAL"
    subject = (body.subject or "").strip() or TOPIC_LABEL[topic]
    try:
        ticket = (
            sb.table("tickets")
            .insert(
                {
                    "user_id": None,
                    "email": body.email,
                    "name": body.name,
                    "subject": subject[:300],
                    "status": "open",
                    "priority": "high" if topic == "SAFETY" else "normal",
                    "category": TOPIC_CATEGORY[topic],
                    "source": "contact_form",
                }
            )
            .execute()
            .data[0]
        )
        role = "renting" if body.role == "seeker" else "hosting"
        sb.table("ticket_messages").insert(
            {
                "ticket_id": ticket["id"],
                "sender_id": None,
                "sender_type": "user",
                "body": f"{body.message}\n\n(Contact page. They are {role}.)",
                "is_internal": False,
            }
        ).execute()
    except Exception:
        logger.exception("Failed to save contact message")
        raise HTTPException(status_code=500, detail="Failed to send your message. Please try again.")

    try:
        sb.table("support_events").insert({"ticket_id": ticket["id"], "actor_id": None, "event_type": "created", "metadata": {"source": "contact_form"}}).execute()
    except Exception:
        logger.warning("Could not record support event for ticket %s", ticket["id"])

    reference = str(ticket["id"])[:8]
    try:
        from email_bookings import send_support_request_received

        send_support_request_received(body.email, body.name, reference, subject)
    except Exception:
        logger.warning("Could not send contact confirmation for ticket %s", ticket["id"])

    return {"status": "ok", "message": "Your message has been received.", "reference": reference}
