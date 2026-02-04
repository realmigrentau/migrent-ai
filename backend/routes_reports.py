import os
import logging
import resend
from pydantic import BaseModel, Field
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Header
from db import get_supabase
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["reports"])

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SUPPORT_EMAIL = os.environ.get("SUPPORT_EMAIL", "migrentau@gmail.com")


class ReportCreate(BaseModel):
    listing_id: str = Field(..., min_length=1)
    reason: str = Field(..., min_length=1, max_length=100)
    details: Optional[str] = Field(None, max_length=2000)


def _get_user_id(authorization: str | None) -> str:
    """Extract user ID from Supabase JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ", 1)[1]
    sb = get_supabase()
    try:
        user = sb.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("")
@limiter.limit("5/hour")
def create_report(
    request: Request,
    body: ReportCreate,
    authorization: Optional[str] = Header(None),
):
    user_id = _get_user_id(authorization)
    sb = get_supabase()

    # Check for duplicate report
    existing = (
        sb.table("reports")
        .select("id")
        .eq("reporter_id", user_id)
        .eq("listing_id", body.listing_id)
        .eq("status", "pending")
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="You have already reported this listing.")

    try:
        result = sb.table("reports").insert({
            "reporter_id": user_id,
            "listing_id": body.listing_id,
            "reason": body.reason,
            "details": body.details or "",
            "status": "pending",
        }).execute()
    except Exception:
        logger.exception("Failed to save report")
        raise HTTPException(status_code=500, detail="Failed to submit report.")

    # Email notification to admin
    if RESEND_API_KEY:
        try:
            resend.api_key = RESEND_API_KEY
            resend.Emails.send({
                "from": "MigRent Reports <onboarding@resend.dev>",
                "to": [SUPPORT_EMAIL],
                "subject": f"🚩 New listing report – {body.reason}",
                "html": f"""
                <h2>New Listing Report</h2>
                <p><strong>Listing ID:</strong> {body.listing_id}</p>
                <p><strong>Reporter:</strong> {user_id}</p>
                <p><strong>Reason:</strong> {body.reason}</p>
                <p><strong>Details:</strong> {body.details or 'N/A'}</p>
                """,
            })
        except Exception:
            logger.exception("Failed to send report email")

    return {"status": "ok", "message": "Report submitted. Our team will review it shortly."}


@router.get("")
@limiter.limit("30/minute")
def list_reports(
    request: Request,
    authorization: Optional[str] = Header(None),
    status: Optional[str] = None,
):
    """Admin-only: list all reports."""
    user_id = _get_user_id(authorization)
    sb = get_supabase()

    # Check admin status
    profile = sb.table("profiles").select("role").eq("id", user_id).single().execute()
    if not profile.data or profile.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    query = sb.table("reports").select("*").order("created_at", desc=True)
    if status:
        query = query.eq("status", status)
    result = query.limit(100).execute()

    return {"reports": result.data}


@router.patch("/{report_id}")
@limiter.limit("30/minute")
def update_report(
    report_id: str,
    request: Request,
    authorization: Optional[str] = Header(None),
):
    """Admin-only: update report status (reviewed / dismissed)."""
    user_id = _get_user_id(authorization)
    sb = get_supabase()

    profile = sb.table("profiles").select("role").eq("id", user_id).single().execute()
    if not profile.data or profile.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    import json
    body = json.loads(request._body) if hasattr(request, '_body') else {}
    new_status = body.get("status", "reviewed")
    if new_status not in ("reviewed", "dismissed", "actioned"):
        raise HTTPException(status_code=400, detail="Invalid status")

    try:
        sb.table("reports").update({"status": new_status, "reviewed_by": user_id}).eq("id", report_id).execute()
    except Exception:
        logger.exception("Failed to update report")
        raise HTTPException(status_code=500, detail="Failed to update report.")

    return {"status": "ok"}
