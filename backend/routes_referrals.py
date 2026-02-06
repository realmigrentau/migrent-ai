import uuid
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from db import get_supabase
from routes_listings import get_current_user

router = APIRouter(prefix="/referrals", tags=["referrals"])


class ReferralUse(BaseModel):
    referral_code: str


@router.post("/generate")
def generate_referral_code(authorization: str = Header(...)):
    """Generate a unique referral code for the authenticated user."""
    user = get_current_user(authorization)
    sb = get_supabase()

    # Check if user already has a pending code
    existing = sb.table("referrals").select("*").eq("referrer_id", user.id).eq("status", "pending").execute()
    if existing.data:
        return {"referral_code": existing.data[0]["referral_code"]}

    code = f"MIGRENT-{uuid.uuid4().hex[:8].upper()}"

    try:
        res = sb.table("referrals").insert({
            "referrer_id": user.id,
            "referral_code": code,
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"referral_code": code}


@router.post("/use")
def use_referral_code(body: ReferralUse, authorization: str = Header(...)):
    """Apply a referral code during signup/onboarding."""
    user = get_current_user(authorization)
    sb = get_supabase()

    # Find the referral
    res = sb.table("referrals").select("*").eq("referral_code", body.referral_code).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Invalid referral code")

    referral = res.data[0]

    if referral["referrer_id"] == user.id:
        raise HTTPException(status_code=400, detail="Cannot use your own referral code")

    if referral["status"] != "pending":
        raise HTTPException(status_code=400, detail="Referral code already used")

    try:
        sb.table("referrals").update({
            "referred_user_id": user.id,
            "status": "signed_up",
            "used_at": "now()",
        }).eq("id", referral["id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Referral code applied", "referral_code": body.referral_code}


@router.get("/my-referrals")
def get_my_referrals(authorization: str = Header(...)):
    """Get all referral codes created by the current user."""
    user = get_current_user(authorization)
    sb = get_supabase()

    res = sb.table("referrals").select("*").eq("referrer_id", user.id).execute()
    return res.data or []
