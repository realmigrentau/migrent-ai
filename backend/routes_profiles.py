from fastapi import APIRouter, HTTPException, Header
from models import ProfileUpdate
from db import get_supabase, get_supabase_admin
from routes_listings import get_current_user
import time

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me")
def get_my_profile(authorization: str = Header(...)):
    """Get the current user's profile."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    try:
        # Use a simple, direct query
        result = sb.from_("profiles").select("*").eq("id", str(user.id)).execute()

        if not result.data or len(result.data) == 0:
            # Create profile if it doesn't exist
            new_profile = {"id": str(user.id), "role": "user"}
            sb.from_("profiles").insert(new_profile).execute()
            return new_profile

        return result.data[0]
    except Exception as e:
        print(f"ERROR in get_my_profile: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/me")
def update_my_profile(
    body: ProfileUpdate,
    authorization: str = Header(...),
):
    """Update the current user's profile. Only non-null fields are updated."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    # Build update dict from non-None fields
    updates = {}
    for field_name, value in body.model_dump().items():
        if value is not None:
            updates[field_name] = value

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        user_id = str(user.id)

        # Ensure profile exists first
        existing = sb.from_("profiles").select("id").eq("id", user_id).execute()
        if not existing.data:
            sb.from_("profiles").insert({"id": user_id, "role": "user"}).execute()

        # Do the update
        print(f"[UPDATE] User {user_id}: {list(updates.keys())}")
        update_result = sb.from_("profiles").update(updates).eq("id", user_id).execute()
        print(f"[UPDATE] Result: {update_result}")

        # Wait a tiny bit for database to settle
        time.sleep(0.1)

        # Fetch back the updated profile
        fetch_result = sb.from_("profiles").select("*").eq("id", user_id).execute()
        print(f"[FETCH] Result: {fetch_result}")

        if fetch_result.data and len(fetch_result.data) > 0:
            return fetch_result.data[0]
        else:
            # If fetch fails, return the updates we sent
            print(f"[FALLBACK] Returning updates dict")
            return updates

    except Exception as e:
        print(f"ERROR in update_my_profile: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
def get_public_profile(user_id: str):
    """Get a public profile by user ID (limited fields)."""
    sb = get_supabase()

    res = sb.table("profiles").select(
        "id, name, preferred_name, about_me, most_useless_skill, interests, badges, custom_pfp, occupation, verified"
    ).eq("id", user_id).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return res.data[0]


@router.post("/badges/refresh")
def refresh_badges(authorization: str = Header(...)):
    """Recalculate and update badges for the current user based on their activity."""
    user = get_current_user(authorization)
    sb = get_supabase()

    user_id = user.id
    badges = []

    # Check completed deals as seeker
    try:
        seeker_deals = sb.table("deals").select("id").eq(
            "seeker_id", user_id
        ).eq("status", "completed").execute()
        if seeker_deals.data and len(seeker_deals.data) >= 1:
            badges.append("Purchased 1+ homes")
    except Exception:
        pass

    # Check published listings as owner
    try:
        listings = sb.table("listings").select("id").eq(
            "owner_id", user_id
        ).execute()
        listing_count = len(listings.data) if listings.data else 0
        if listing_count >= 1:
            badges.append("Verified host")
        if listing_count >= 3:
            badges.append("Superhost")
    except Exception:
        pass

    # Update badges on profile
    try:
        sb.table("profiles").update({"badges": badges}).eq("id", user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"badges": badges}
