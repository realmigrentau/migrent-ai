from fastapi import APIRouter, HTTPException, Header
from models import ProfileUpdate
from db import get_supabase
from routes_listings import get_current_user

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me")
def get_my_profile(authorization: str = Header(...)):
    user = get_current_user(authorization)
    sb = get_supabase()

    res = sb.table("profiles").select("*").eq("id", user.id).execute()
    if not res.data:
        sb.table("profiles").insert({"id": str(user.id), "role": "user"}).execute()
        return {"id": str(user.id), "role": "user"}

    return res.data[0]


@router.patch("/me")
def update_my_profile(body: ProfileUpdate, authorization: str = Header(...)):
    user = get_current_user(authorization)
    sb = get_supabase()

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    res = sb.table("profiles").select("id").eq("id", user.id).execute()
    if not res.data:
        sb.table("profiles").insert({"id": str(user.id), "role": "user"}).execute()

    sb.table("profiles").update(updates).eq("id", user.id).execute()

    result = sb.table("profiles").select("*").eq("id", user.id).execute()
    return result.data[0] if result.data else updates


@router.get("/{user_id}")
def get_public_profile(user_id: str):
    sb = get_supabase()
    res = sb.table("profiles").select("id,name,preferred_name,about_me,most_useless_skill,interests,badges,custom_pfp,occupation,verified").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return res.data[0]


@router.post("/badges/refresh")
def refresh_badges(authorization: str = Header(...)):
    user = get_current_user(authorization)
    sb = get_supabase()

    badges = []

    deals = sb.table("deals").select("id").eq("seeker_id", user.id).eq("status", "completed").execute()
    if deals.data and len(deals.data) >= 1:
        badges.append("Purchased 1+ homes")
    if deals.data and len(deals.data) >= 5:
        badges.append("Frequent Flyer")
    if deals.data and len(deals.data) >= 10:
        badges.append("Globe Trotter")

    listings = sb.table("listings").select("id").eq("owner_id", user.id).execute()
    if listings.data and len(listings.data) >= 1:
        badges.append("Verified host")
    if listings.data and len(listings.data) >= 3:
        badges.append("Superhost")
    if listings.data and len(listings.data) >= 10:
        badges.append("Mega Host")

    sb.table("profiles").update({"badges": badges}).eq("id", user.id).execute()

    return {"badges": badges}
