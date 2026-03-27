"""
Owner verification endpoints.

3-step flow: Email verified (Supabase Auth) -> Phone OTP -> Government ID upload.
Owners must complete all 3 steps before they can list rooms.
"""

import os
import re
import random
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from db import get_supabase_admin
from auth_utils import get_current_user
from email_verification import (
    send_phone_otp_email,
    send_id_approved_email,
    send_id_rejected_email,
    send_founder_id_review_alert,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/owner-verification", tags=["owner-verification"])

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# OTP settings
OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 10

# Founder email for ID review alerts
FOUNDER_EMAIL = os.environ.get("FOUNDER_EMAIL", "migrentau@gmail.com")


def _hash_otp(code: str) -> str:
    """Hash OTP code for storage."""
    return hashlib.sha256(code.encode()).hexdigest()


def _get_or_create_verification(sb, user_id: str, user_email: str) -> dict:
    """Get existing verification record or create one."""
    res = sb.table("owner_verification").select("*").eq("user_id", user_id).execute()
    if res.data:
        return res.data[0]

    # Check if email is verified via Supabase Auth
    try:
        user_res = sb.auth.admin.get_user_by_id(user_id)
        email_verified = getattr(user_res, 'user', None) and getattr(user_res.user, 'email_confirmed_at', None) is not None
    except Exception:
        email_verified = True  # Assume verified if we can't check

    new_record = {
        "user_id": user_id,
        "email_verified": email_verified,
    }
    insert_res = sb.table("owner_verification").insert(new_record).execute()
    return insert_res.data[0] if insert_res.data else new_record


def _check_fully_verified(sb, user_id: str, record: dict) -> bool:
    """Check if all 3 steps are complete and update fully_verified flag."""
    is_fully = (
        record.get("email_verified", False)
        and record.get("phone_verified", False)
        and record.get("id_status") == "approved"
    )
    if is_fully != record.get("fully_verified", False):
        sb.table("owner_verification").update({
            "fully_verified": is_fully,
        }).eq("user_id", user_id).execute()
    return is_fully


# ─── GET verification status ─────────────────────────────────────

@router.get("/status")
def get_verification_status(authorization: str = Header(...)):
    """Get the current owner's verification status and progress."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    record = _get_or_create_verification(sb, str(user.id), user.email)
    _check_fully_verified(sb, str(user.id), record)

    # Re-fetch to get updated fully_verified
    record = sb.table("owner_verification").select("*").eq("user_id", str(user.id)).execute().data[0]

    return {
        "email_verified": record.get("email_verified", False),
        "phone": record.get("phone"),
        "phone_verified": record.get("phone_verified", False),
        "id_document_type": record.get("id_document_type"),
        "id_status": record.get("id_status", "not_submitted"),
        "id_rejection_reason": record.get("id_rejection_reason"),
        "fully_verified": record.get("fully_verified", False),
    }


# ─── PHONE OTP ───────────────────────────────────────────────────

class PhoneOTPRequest(BaseModel):
    phone: str  # AU format: +61...


@router.post("/phone/send-otp")
def send_phone_otp(body: PhoneOTPRequest, authorization: str = Header(...)):
    """Send a 6-digit OTP code to the owner's phone via email (V1 - no Twilio yet)."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    # Validate AU phone format
    phone = body.phone.strip()
    if not re.match(r"^\+61\d{9}$", phone):
        raise HTTPException(status_code=400, detail="Please enter a valid Australian phone number (+61XXXXXXXXX)")

    record = _get_or_create_verification(sb, str(user.id), user.email)

    if record.get("phone_verified"):
        raise HTTPException(status_code=400, detail="Phone already verified")

    # Generate OTP
    otp_code = "".join([str(random.randint(0, 9)) for _ in range(OTP_LENGTH)])
    otp_hash = _hash_otp(otp_code)
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)).isoformat()

    # Store hashed OTP
    sb.table("owner_verification").update({
        "phone": phone,
        "phone_otp_code": otp_hash,
        "phone_otp_expires_at": expires_at,
    }).eq("user_id", str(user.id)).execute()

    # V1: Send OTP via email (fallback until Twilio is set up)
    # When TWILIO_SID is configured, this will switch to SMS
    twilio_sid = os.environ.get("TWILIO_SID", "")
    if twilio_sid:
        # Future: send SMS via Twilio
        logger.info(f"[Verify] Would send SMS to {phone} (Twilio not implemented yet)")

    # Always send via email as backup/primary for V1
    try:
        owner_name = ""
        profile_res = sb.table("profiles").select("name, preferred_name").eq("id", str(user.id)).execute()
        if profile_res.data:
            owner_name = profile_res.data[0].get("preferred_name") or profile_res.data[0].get("name") or ""

        send_phone_otp_email(
            to_email=user.email,
            owner_name=owner_name or "there",
            otp_code=otp_code,
            phone=phone,
        )
    except Exception as e:
        logger.error(f"[Verify] Failed to send OTP email: {e}")

    return {"message": f"Verification code sent to your email ({user.email}). Check your inbox.", "expires_in_minutes": OTP_EXPIRY_MINUTES}


class VerifyOTPRequest(BaseModel):
    code: str


@router.post("/phone/verify-otp")
def verify_phone_otp(body: VerifyOTPRequest, authorization: str = Header(...)):
    """Verify the 6-digit OTP code for phone verification."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    record = _get_or_create_verification(sb, str(user.id), user.email)

    if record.get("phone_verified"):
        raise HTTPException(status_code=400, detail="Phone already verified")

    stored_hash = record.get("phone_otp_code")
    expires_at = record.get("phone_otp_expires_at")

    if not stored_hash or not expires_at:
        raise HTTPException(status_code=400, detail="No OTP sent. Please request a new code.")

    # Check expiry
    expiry_time = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expiry_time:
        raise HTTPException(status_code=400, detail="Code expired. Please request a new one.")

    # Verify code
    if _hash_otp(body.code.strip()) != stored_hash:
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")

    # Mark phone as verified
    sb.table("owner_verification").update({
        "phone_verified": True,
        "phone_verified_at": datetime.now(timezone.utc).isoformat(),
        "phone_otp_code": None,
        "phone_otp_expires_at": None,
    }).eq("user_id", str(user.id)).execute()

    # Also update main profile phone
    sb.table("profiles").update({
        "phone": record.get("phone"),
    }).eq("id", str(user.id)).execute()

    # Check if now fully verified
    record["phone_verified"] = True
    _check_fully_verified(sb, str(user.id), record)

    return {"message": "Phone verified successfully!", "phone_verified": True}


# ─── GOVERNMENT ID UPLOAD ────────────────────────────────────────

@router.post("/id/upload")
def upload_government_id(
    authorization: str = Header(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
):
    """Upload a government ID document for manual review."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    # Validate document type
    valid_types = ["passport", "drivers_licence", "visa", "national_id"]
    if document_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Document type must be one of: {', '.join(valid_types)}")

    # Validate file type
    allowed_mimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if file.content_type not in allowed_mimes:
        raise HTTPException(status_code=400, detail="File must be JPEG, PNG, WebP, or PDF")

    # Validate file size (max 10MB)
    file_content = file.file.read()
    if len(file_content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 10MB")
    file.file.seek(0)

    record = _get_or_create_verification(sb, str(user.id), user.email)

    if record.get("id_status") == "approved":
        raise HTTPException(status_code=400, detail="Your ID has already been approved")

    if record.get("id_status") == "pending":
        raise HTTPException(status_code=400, detail="You already have a pending ID submission. Please wait for review.")

    # Upload to Supabase Storage
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    storage_path = f"{user.id}/{document_type}_{int(datetime.now(timezone.utc).timestamp())}.{ext}"

    try:
        sb.storage.from_("owner-id-docs").upload(
            path=storage_path,
            file=file_content,
            file_options={"content-type": file.content_type or "application/octet-stream"},
        )
    except Exception as e:
        logger.error(f"[Verify] Storage upload failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload document. Please try again.")

    # Update verification record
    sb.table("owner_verification").update({
        "id_document_type": document_type,
        "id_file_path": storage_path,
        "id_status": "pending",
        "id_submitted_at": datetime.now(timezone.utc).isoformat(),
        "id_rejection_reason": None,
    }).eq("user_id", str(user.id)).execute()

    # Get owner name for emails
    owner_name = ""
    owner_email = user.email
    try:
        profile_res = sb.table("profiles").select("name, preferred_name, email").eq("id", str(user.id)).execute()
        if profile_res.data:
            p = profile_res.data[0]
            owner_name = p.get("preferred_name") or p.get("name") or ""
            owner_email = p.get("email") or user.email
    except Exception:
        pass

    # Notify founder for review
    try:
        send_founder_id_review_alert(
            founder_email=FOUNDER_EMAIL,
            owner_name=owner_name or owner_email,
            owner_email=owner_email,
            document_type=document_type,
        )
    except Exception as e:
        logger.error(f"[Verify] Failed to send founder alert: {e}")

    return {
        "message": "Document uploaded successfully! We will review it within 24-48 hours.",
        "id_status": "pending",
    }


# ─── ADMIN: Review IDs ───────────────────────────────────────────

@router.get("/admin/pending-ids")
def get_pending_ids(authorization: str = Header(...)):
    """Get all pending ID submissions for admin review."""
    from routes_admin import _require_admin
    _require_admin(authorization)

    sb = get_supabase_admin()
    res = sb.table("owner_verification").select("*").eq("id_status", "pending").order("id_submitted_at", desc=False).execute()

    submissions = res.data or []

    # Enrich with owner profiles
    user_ids = [s["user_id"] for s in submissions]
    if user_ids:
        profiles_res = sb.table("profiles").select("id, name, preferred_name, email, custom_pfp, phone").in_("id", user_ids).execute()
        profile_map = {p["id"]: p for p in (profiles_res.data or [])}
        for sub in submissions:
            profile = profile_map.get(sub["user_id"], {})
            sub["owner_name"] = profile.get("preferred_name") or profile.get("name") or "Unknown"
            sub["owner_email"] = profile.get("email") or ""
            sub["owner_photo"] = profile.get("custom_pfp")

    return {"submissions": submissions, "total": len(submissions)}


@router.get("/admin/id-document-url/{user_id}")
def get_id_document_url(user_id: str, authorization: str = Header(...)):
    """Get a signed URL for viewing an owner's ID document (admin only)."""
    from routes_admin import _require_admin
    _require_admin(authorization)

    sb = get_supabase_admin()
    res = sb.table("owner_verification").select("id_file_path").eq("user_id", user_id).execute()
    if not res.data or not res.data[0].get("id_file_path"):
        raise HTTPException(status_code=404, detail="No document found")

    file_path = res.data[0]["id_file_path"]

    try:
        signed = sb.storage.from_("owner-id-docs").create_signed_url(file_path, 300)  # 5 min expiry
        return {"url": signed.get("signedURL") or signed.get("signedUrl") or signed}
    except Exception as e:
        logger.error(f"[Verify] Failed to create signed URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate document URL")


class IDReviewAction(BaseModel):
    action: str  # "approve" or "reject"
    reason: Optional[str] = None


@router.post("/admin/review-id/{user_id}")
def review_id_submission(
    user_id: str,
    body: IDReviewAction,
    authorization: str = Header(...),
):
    """Approve or reject an owner's ID submission."""
    from routes_admin import _require_admin
    admin_user, admin_profile = _require_admin(authorization)

    if body.action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")

    if body.action == "reject" and not body.reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")

    sb = get_supabase_admin()

    # Get current record
    res = sb.table("owner_verification").select("*").eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Verification record not found")

    record = res.data[0]
    if record.get("id_status") != "pending":
        raise HTTPException(status_code=400, detail=f"ID is not pending review (current: {record.get('id_status')})")

    # Get owner info for email
    owner_name = ""
    owner_email = ""
    try:
        profile_res = sb.table("profiles").select("name, preferred_name, email").eq("id", user_id).execute()
        if profile_res.data:
            p = profile_res.data[0]
            owner_name = p.get("preferred_name") or p.get("name") or "there"
            owner_email = p.get("email") or ""
    except Exception:
        pass

    now = datetime.now(timezone.utc).isoformat()

    if body.action == "approve":
        sb.table("owner_verification").update({
            "id_status": "approved",
            "id_reviewed_at": now,
            "id_reviewed_by": str(admin_user.id),
            "id_rejection_reason": None,
        }).eq("user_id", user_id).execute()

        # Check if now fully verified
        record["id_status"] = "approved"
        is_fully = _check_fully_verified(sb, user_id, record)

        # Email owner
        if owner_email:
            try:
                send_id_approved_email(owner_email, owner_name, is_fully)
            except Exception as e:
                logger.error(f"[Verify] Failed to send approval email: {e}")

        # Audit log
        try:
            sb.table("admin_audit_log").insert({
                "admin_id": str(admin_user.id),
                "action": "approve_id",
                "target_type": "owner_verification",
                "target_id": user_id,
                "notes": "Government ID approved",
            }).execute()
        except Exception:
            pass

        return {"message": "ID approved", "fully_verified": is_fully}

    else:  # reject
        sb.table("owner_verification").update({
            "id_status": "rejected",
            "id_reviewed_at": now,
            "id_reviewed_by": str(admin_user.id),
            "id_rejection_reason": body.reason,
        }).eq("user_id", user_id).execute()

        # Email owner
        if owner_email:
            try:
                send_id_rejected_email(owner_email, owner_name, body.reason or "")
            except Exception as e:
                logger.error(f"[Verify] Failed to send rejection email: {e}")

        # Audit log
        try:
            sb.table("admin_audit_log").insert({
                "admin_id": str(admin_user.id),
                "action": "reject_id",
                "target_type": "owner_verification",
                "target_id": user_id,
                "reason": body.reason,
            }).execute()
        except Exception:
            pass

        return {"message": "ID rejected", "reason": body.reason}


# ─── Verification gate helper (used by listings) ─────────────────

def check_owner_verified(user_id: str) -> bool:
    """Check if an owner is fully verified. Used by listing creation."""
    sb = get_supabase_admin()
    res = sb.table("owner_verification").select("fully_verified").eq("user_id", user_id).execute()
    if not res.data:
        return False
    return res.data[0].get("fully_verified", False)
