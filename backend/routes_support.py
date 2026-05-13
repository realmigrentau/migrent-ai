import os
import logging
from typing import Optional, Literal
import resend
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, HTTPException, Request
from db import get_supabase
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/support", tags=["support"])

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SUPPORT_EMAIL = os.environ.get("SUPPORT_EMAIL", "migrentau@gmail.com")


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    role: str = Field(..., pattern="^(seeker|owner)$")
    message: str = Field(..., min_length=10, max_length=5000)


@router.post("/contact")
@limiter.limit("3/minute")
def submit_contact(request: Request, body: ContactRequest):
    sb = get_supabase()
    try:
        sb.table("support_requests").insert({
            "name": body.name,
            "email": body.email,
            "role": body.role,
            "message": body.message,
        }).execute()
    except Exception:
        logger.exception("Failed to save support request")
        raise HTTPException(status_code=500, detail="Failed to submit your request. Please try again.")

    # Send email notification via Resend
    if RESEND_API_KEY:
        try:
            resend.api_key = RESEND_API_KEY
            resend.Emails.send({
                "from": "MigRent Support <onboarding@resend.dev>",
                "to": [SUPPORT_EMAIL],
                "subject": f"New support request from {body.name} ({body.role})",
                "html": f"""
                <h2>New Support Request</h2>
                <p><strong>Name:</strong> {body.name}</p>
                <p><strong>Email:</strong> {body.email}</p>
                <p><strong>Role:</strong> {body.role}</p>
                <p><strong>Message:</strong></p>
                <p>{body.message}</p>
                """,
            })
        except Exception:
            logger.exception("Failed to send support email via Resend")

    return {"status": "ok", "message": "Your message has been received."}


# ──────────────────────────────────────────────────────────────
# Assistant query logging
# ──────────────────────────────────────────────────────────────
class AssistantLogRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    top_article_id: Optional[str] = Field(None, max_length=64)
    confidence: Literal["high", "medium", "low", "none"]
    helpful: Optional[bool] = None
    safety_flag: bool = False
    legal_flag: bool = False
    emergency_flag: bool = False
    escalated: bool = False
    user_id: Optional[str] = None


@router.post("/assistant-log")
@limiter.limit("30/minute")
def log_assistant_query(request: Request, body: AssistantLogRequest):
    """Best-effort log of an assistant interaction. Never blocks the UI."""
    sb = get_supabase()
    try:
        sb.table("assistant_logs").insert({
            "user_id": body.user_id,
            "query": body.query,
            "top_article_id": body.top_article_id,
            "confidence": body.confidence,
            "helpful": body.helpful,
            "safety_flag": body.safety_flag,
            "legal_flag": body.legal_flag,
            "emergency_flag": body.emergency_flag,
            "escalated": body.escalated,
            "user_agent": request.headers.get("user-agent", "")[:500],
        }).execute()
    except Exception:
        logger.exception("Failed to log assistant query")
        # Swallow errors so logging never breaks the assistant UX.
        return {"status": "skipped"}
    return {"status": "ok"}
