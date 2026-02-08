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
    # Support both old format (listing_id + reason) and new format (item_type + item_id + category)
    listing_id: Optional[str] = None
    item_type: Optional[str] = "listing"
    item_id: Optional[str] = None
    reason: Optional[str] = None
    category: Optional[str] = None
    details: Optional[str] = Field(None, max_length=2000)
    message: Optional[str] = Field(None, max_length=2000)


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

    # Normalize fields (support both old and new format)
    resolved_id = body.item_id or body.listing_id or ""
    resolved_type = body.item_type or "listing"
    resolved_reason = body.category or body.reason or "Other"
    resolved_details = body.message or body.details or ""

    if not resolved_id:
        raise HTTPException(status_code=400, detail="Missing item_id or listing_id")

    # Check for duplicate report
    existing = (
        sb.table("reports")
        .select("id")
        .eq("reporter_id", user_id)
        .eq("listing_id", resolved_id)
        .eq("status", "pending")
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="You have already reported this.")

    try:
        result = sb.table("reports").insert({
            "reporter_id": user_id,
            "listing_id": resolved_id,
            "item_type": resolved_type,
            "item_id": resolved_id,
            "reason": resolved_reason,
            "details": resolved_details,
            "status": "pending",
        }).execute()
    except Exception:
        logger.exception("Failed to save report")
        raise HTTPException(status_code=500, detail="Failed to submit report.")

    # Email notification to admin via Resend
    if RESEND_API_KEY:
        try:
            resend.api_key = RESEND_API_KEY

            type_label = "Profile" if resolved_type == "profile" else "Listing"

            resend.Emails.send({
                "from": "MigRent Reports <onboarding@resend.dev>",
                "to": [SUPPORT_EMAIL],
                "subject": f"🚩 New {type_label} Report – {resolved_reason}",
                "html": f"""
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #f43f5e, #e11d48); padding: 24px; border-radius: 12px 12px 0 0;">
                        <h2 style="color: white; margin: 0;">🚩 New {type_label} Report</h2>
                    </div>
                    <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Type:</td>
                                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">{type_label}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">{type_label} ID:</td>
                                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-family: monospace;">{resolved_id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Reporter ID:</td>
                                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-family: monospace;">{user_id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Reason:</td>
                                <td style="padding: 8px 0; color: #e11d48; font-size: 14px; font-weight: 600;">{resolved_reason}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Details:</td>
                                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">{resolved_details or 'No additional details provided.'}</td>
                            </tr>
                        </table>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">This report requires your review. Log into the admin dashboard to take action.</p>
                    </div>
                </div>
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
