from fastapi import APIRouter, HTTPException, Header
from models import ProfileUpdate
from db import get_supabase
from routes_listings import get_current_user

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me")
def get_my_profile(authorization: str = Header(...)):
    """Get the current user's profile."""
    user = get_current_user(authorization)
    sb = get_supabase()

    res = sb.table("profiles").select("*").eq("id", user.id).execute()
    if not res.data:
        # Auto-create a profile row if it doesn't exist
        row = {"id": user.id, "role": "user"}
        try:
            sb.table("profiles").insert(row).execute()
        except Exception:
            pass
        return row

    return res.data[0]


@router.patch("/me")
def update_my_profile(
    body: ProfileUpdate,
    authorization: str = Header(...),
):
    """Update the current user's profile. Only non-null fields are updated."""
    user = get_current_user(authorization)
    sb = get_supabase()

    # Build update dict from non-None fields
    updates = {}
    for field_name, value in body.model_dump().items():
        if value is not None:
            updates[field_name] = value

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Ensure profile row exists
    existing = sb.table("profiles").select("id").eq("id", user.id).execute()
    if not existing.data:
        # Create the profile first
        try:
            sb.table("profiles").insert({"id": user.id, "role": "user"}).execute()
        except Exception:
            pass

    try:
        res = sb.table("profiles").update(updates).eq("id", user.id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return res.data[0] if res.data else updates


@router.get("/{user_id}")
def get_public_profile(user_id: str):
    """Get a public profile by user ID (limited fields)."""
    sb = get_supabase()

    res = sb.table("profiles").select(
        "id, name, about_me, most_useless_skill, interests, badges, custom_pfp, occupation, verified"
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
