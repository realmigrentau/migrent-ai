import logging
from fastapi import APIRouter, HTTPException, Header, Request
from models import ProfileUpdate
from db import get_supabase_admin
from routes_listings import get_current_user
from limiter import limiter
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profiles", tags=["profiles"])

LOCKED_FIELDS = {"legal_name", "preferred_name", "residential_address", "suburb_city", "nearest_station", "phone"}


@router.get("/me")
@limiter.limit("30/minute")
def get_my_profile(request: Request, authorization: str = Header(...)):
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        res = sb.table("profiles").select("*").eq("id", uid).execute()
        if not res.data:
            sb.table("profiles").insert({"id": uid}).execute()
            return {"id": uid}

        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to fetch profile")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")


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
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to fetch onboarding status")
        raise HTTPException(status_code=500, detail="Failed to fetch onboarding status")


@router.post("/me/onboarding/complete")
@limiter.limit("10/minute")
def complete_onboarding(request: Request, body: ProfileUpdate, authorization: str = Header(...)):
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
        logger.exception("Failed to complete onboarding")
        raise HTTPException(status_code=500, detail="Failed to complete onboarding")


@router.patch("/me")
@limiter.limit("10/minute")
def update_my_profile(request: Request, body: ProfileUpdate, authorization: str = Header(...)):
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

        # If onboarded, silently strip locked fields instead of blocking
        if is_onboarded:
            for field in LOCKED_FIELDS:
                updates.pop(field, None)
            if not updates:
                raise HTTPException(status_code=400, detail="No updatable fields provided")

        updates["id"] = uid
        sb.table("profiles").upsert(updates).execute()

        result = sb.table("profiles").select("*").eq("id", uid).execute()
        return result.data[0] if result.data else updates
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to update profile")
        raise HTTPException(status_code=500, detail="Failed to update profile")


@router.get("/featured/community")
def get_featured_profiles(request: Request):
    """Get top listers and active community members for the dashboard."""
    try:
        sb = get_supabase_admin()

        # Top listers: count listings per owner
        listings_res = sb.table("listings").select("owner_id").execute()
        owner_counts: dict[str, int] = {}
        if listings_res.data:
            for row in listings_res.data:
                oid = row.get("owner_id")
                if oid:
                    owner_counts[oid] = owner_counts.get(oid, 0) + 1

        sorted_owners = sorted(owner_counts.items(), key=lambda x: x[1], reverse=True)[:6]
        top_owner_ids = [oid for oid, _ in sorted_owners]

        top_listers = []
        if top_owner_ids:
            profiles_res = sb.table("profiles").select(
                "id,name,preferred_name,custom_pfp,badges,occupation,about_me"
            ).in_("id", top_owner_ids).execute()
            if profiles_res.data:
                profile_map = {p["id"]: p for p in profiles_res.data}
                for oid, count in sorted_owners:
                    p = profile_map.get(oid)
                    if p:
                        top_listers.append({**p, "listing_count": count})

        # Top community members: profiles with badges
        all_profiles = sb.table("profiles").select(
            "id,name,preferred_name,custom_pfp,badges,occupation,about_me"
        ).limit(50).execute()

        top_members = []
        if all_profiles.data:
            with_badges = [p for p in all_profiles.data if p.get("badges") and len(p["badges"]) > 0]
            top_members = sorted(with_badges, key=lambda p: len(p["badges"]), reverse=True)[:6]

        return {
            "top_listers": top_listers,
            "top_members": top_members,
        }
    except Exception as e:
        logger.exception("Failed to fetch featured profiles")
        raise HTTPException(status_code=500, detail="Failed to fetch featured profiles")


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
        logger.exception("Failed to fetch public profile")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")


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
        logger.exception("Failed to refresh badges")
        raise HTTPException(status_code=500, detail="Failed to refresh badges")
