import os
import logging
from pydantic import BaseModel, Field
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from db import get_supabase_admin
from limiter import limiter
from admin_panel import admin_panel_unlocked

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["reports"])

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
    sb = get_supabase_admin()
    try:
        user = sb.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def _is_admin(sb, user_id: str) -> bool:
    res = sb.table("profiles").select("role, is_admin").eq("id", user_id).execute()
    row = (res.data or [{}])[0] if res.data else {}
    return bool(row.get("is_admin")) or row.get("role") in ("admin", "superadmin")


def _alert_admins(item_type: str, item_id: str, reason: str, details: str, reporter_id: str) -> None:
    """Tell the support inbox a report came in, in the shared email design
    and through the one sender (email_bookings._send_email). Never raises."""
    try:
        import email_theme as et
        from email_bookings import _send_email
        from hub_common import hub_path

        type_label = {"profile": "Profile", "user": "Profile", "message": "Message", "property": "Property"}.get(item_type, "Listing")
        reports_url = hub_path("/admin/reports")
        if not reports_url.startswith("http"):
            reports_url = f"{os.environ.get('FRONTEND_URL', 'https://migrent.vercel.app').rstrip('/')}{reports_url}"
        t = et.THEMES["security"]
        body = et.render(
            "security",
            eyebrow="Admin: new report",
            title=f"A {type_label.lower()} was reported",
            preheader=f"Reason: {reason}",
            paragraphs=["Someone reported this on Migrent. Review it in the Admin panel and take action if it breaks the rules."],
            blocks=[et.details([("Type", type_label), ("Reason", reason), ("Details", details or "None given"), (f"{type_label} ID", item_id), ("Reporter ID", reporter_id)], t, title="Report")],
            cta=("Open reports", reports_url),
        )
        _send_email(SUPPORT_EMAIL, f"New {type_label.lower()} report: {reason}"[:150], body)
    except Exception:
        logger.exception("Failed to send report email")


@router.post("")
@limiter.limit("5/hour")
def create_report(
    request: Request,
    body: ReportCreate,
    authorization: Optional[str] = Header(None),
):
    user_id = _get_user_id(authorization)
    sb = get_supabase_admin()

    # Normalize fields (support both old and new format)
    resolved_id = body.item_id or body.listing_id or ""
    resolved_type = body.item_type or "listing"
    if resolved_type not in ("listing", "profile", "user", "message", "property", "review"):
        raise HTTPException(status_code=400, detail="Unknown report type")
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

    _alert_admins(resolved_type, resolved_id, resolved_reason, resolved_details, user_id)

    return {"status": "ok", "message": "Report submitted. Our team will review it shortly."}


@router.get("", dependencies=[Depends(admin_panel_unlocked)])
@limiter.limit("30/minute")
def list_reports(
    request: Request,
    authorization: Optional[str] = Header(None),
    status: Optional[str] = None,
):
    """Admin-only: list all reports."""
    user_id = _get_user_id(authorization)
    sb = get_supabase_admin()

    if not _is_admin(sb, user_id):
        raise HTTPException(status_code=403, detail="Admin access required")

    query = sb.table("reports").select("*").order("created_at", desc=True)
    if status:
        query = query.eq("status", status)
    result = query.limit(100).execute()

    return {"reports": result.data}


@router.patch("/{report_id}", dependencies=[Depends(admin_panel_unlocked)])
@limiter.limit("30/minute")
async def update_report(
    report_id: str,
    request: Request,
    authorization: Optional[str] = Header(None),
):
    """Admin-only: update report status (reviewed / dismissed)."""
    user_id = _get_user_id(authorization)
    sb = get_supabase_admin()

    if not _is_admin(sb, user_id):
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        body = await request.json()
    except Exception:
        body = {}
    new_status = body.get("status", "reviewed")
    if new_status not in ("reviewed", "dismissed", "actioned"):
        raise HTTPException(status_code=400, detail="Invalid status")

    try:
        sb.table("reports").update({"status": new_status, "reviewed_by": user_id}).eq("id", report_id).execute()
    except Exception:
        logger.exception("Failed to update report")
        raise HTTPException(status_code=500, detail="Failed to update report.")

    return {"status": "ok"}
