from fastapi import APIRouter, HTTPException, Header
from models import ProfileUpdate
from db import get_supabase_admin
from routes_listings import get_current_user

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me")
def get_my_profile(authorization: str = Header(...)):
    """Get the current user's profile."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    try:
        res = sb.table("profiles").select("*").eq("id", user.id).execute()

        if not res.data:
            # Create if doesn't exist
            row = {"id": str(user.id), "role": "user"}
            sb.table("profiles").insert(row).execute()
            return row

        return res.data[0]
    except Exception as e:
        print(f"Error in get_my_profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/me")
def update_my_profile(
    body: ProfileUpdate,
    authorization: str = Header(...),
):
    """Update the current user's profile."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    try:
        # Build updates
        updates = {k: v for k, v in body.model_dump().items() if v is not None}

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        # Ensure profile exists
        existing = sb.table("profiles").select("id").eq("id", user.id).execute()
        if not existing.data:
            sb.table("profiles").insert({"id": str(user.id), "role": "user"}).execute()

        # Update
        sb.table("profiles").update(updates).eq("id", user.id).execute()

        # Fetch back
        result = sb.table("profiles").select("*").eq("id", user.id).execute()

        if result.data:
            return result.data[0]

        return updates
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_my_profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
def get_public_profile(user_id: str):
    """Get a public profile."""
    sb = get_supabase_admin()

    try:
        res = sb.table("profiles").select(
            "id,name,preferred_name,about_me,most_useless_skill,interests,badges,custom_pfp,occupation,verified"
        ).eq("id", user_id).execute()

        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")

        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/badges/refresh")
def refresh_badges(authorization: str = Header(...)):
    """Refresh user badges."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    try:
        badges = []

        # Seeker badges
        deals = sb.table("deals").select("id").eq("seeker_id", user.id).eq("status", "completed").execute()
        deal_count = len(deals.data) if deals.data else 0
        if deal_count >= 1:
            badges.append("Purchased 1+ homes")
        if deal_count >= 5:
            badges.append("Frequent Flyer")

        # Owner badges
        listings = sb.table("listings").select("id").eq("owner_id", user.id).execute()
        listing_count = len(listings.data) if listings.data else 0
        if listing_count >= 1:
            badges.append("Verified host")
        if listing_count >= 3:
            badges.append("Superhost")

        # Update
        sb.table("profiles").update({"badges": badges}).eq("id", user.id).execute()

        return {"badges": badges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
