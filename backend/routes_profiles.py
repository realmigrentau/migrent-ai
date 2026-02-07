from fastapi import APIRouter, HTTPException, Header
from models import ProfileUpdate
from db import get_supabase_admin
from routes_listings import get_current_user
from datetime import datetime

router = APIRouter(prefix="/profiles", tags=["profiles"])

LOCKED_FIELDS = {"legal_name", "preferred_name", "residential_address", "phone"}


@router.get("/me")
def get_my_profile(authorization: str = Header(...)):
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        res = sb.table("profiles").select("*").eq("id", uid).execute()
        if not res.data:
            sb.table("profiles").insert({"id": uid}).execute()
            return {"id": uid}

        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me/onboarding-status")
def get_onboarding_status(authorization: str = Header(...)):
    """Check if user has completed onboarding."""
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        res = sb.table("profiles").select("onboarding_completed, onboarding_completed_at").eq("id", uid).execute()
        if not res.data:
            return {"onboarding_completed": False, "onboarding_completed_at": None}

        profile = res.data[0]
        return {
            "onboarding_completed": profile.get("onboarding_completed", False),
            "onboarding_completed_at": profile.get("onboarding_completed_at")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/me/onboarding/complete")
def complete_onboarding(body: ProfileUpdate, authorization: str = Header(...)):
    """Complete onboarding with required fields."""
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        # Check required onboarding fields
        required_fields = ["legal_name", "preferred_name", "residential_address", "phone"]
        for field in required_fields:
            if not getattr(body, field, None):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

        # Build updates with all fields
        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        updates["id"] = uid
        updates["onboarding_completed"] = True
        updates["onboarding_completed_at"] = datetime.utcnow().isoformat()

        # Upsert to create or update profile
        sb.table("profiles").upsert(updates).execute()

        # Fetch and return complete profile
        result = sb.table("profiles").select("*").eq("id", uid).execute()
        return result.data[0] if result.data else updates
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/me")
def update_my_profile(body: ProfileUpdate, authorization: str = Header(...)):
    """Update user profile. Locked fields cannot be changed after onboarding."""
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        # Check if user completed onboarding
        profile_res = sb.table("profiles").select("onboarding_completed").eq("id", uid).execute()
        is_onboarded = False
        if profile_res.data:
            is_onboarded = profile_res.data[0].get("onboarding_completed", False)

        # Extract updates
        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        # If onboarded, block locked fields
        if is_onboarded:
            locked_in_request = LOCKED_FIELDS & set(updates.keys())
            if locked_in_request:
                raise HTTPException(
                    status_code=403,
                    detail=f"Cannot modify fields after onboarding: {', '.join(locked_in_request)}"
                )

        updates["id"] = uid
        sb.table("profiles").upsert(updates).execute()

        result = sb.table("profiles").select("*").eq("id", uid).execute()
        return result.data[0] if result.data else updates
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
def get_public_profile(user_id: str):
    """Get public profile (limited fields)."""
    try:
        sb = get_supabase_admin()
        res = sb.table("profiles").select("id,name,preferred_name,about_me,most_useless_skill,interests,badges,custom_pfp,occupation,verified").eq("id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/badges/refresh")
def refresh_badges(authorization: str = Header(...)):
    """Recalculate user badges."""
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        badges = []

        deals = sb.table("deals").select("id").eq("seeker_id", uid).eq("status", "completed").execute()
        if deals.data and len(deals.data) >= 1:
            badges.append("Purchased 1+ homes")
        if deals.data and len(deals.data) >= 5:
            badges.append("Frequent Flyer")
        if deals.data and len(deals.data) >= 10:
            badges.append("Globe Trotter")

        listings = sb.table("listings").select("id").eq("owner_id", uid).execute()
        if listings.data and len(listings.data) >= 1:
            badges.append("Verified host")
        if listings.data and len(listings.data) >= 3:
            badges.append("Superhost")
        if listings.data and len(listings.data) >= 10:
            badges.append("Mega Host")

        sb.table("profiles").update({"badges": badges}).eq("id", uid).execute()

        return {"badges": badges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
