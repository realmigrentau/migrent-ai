from fastapi import APIRouter, HTTPException, Header
from models import ProfileUpdate
from db import get_supabase_admin
from routes_listings import get_current_user

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me")
def get_my_profile(authorization: str = Header(...)):
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        res = sb.table("profiles").select("*").eq("id", uid).execute()
        if not res.data:
            sb.table("profiles").insert({"id": uid, "role": "user"}).execute()
            return {"id": uid, "role": "user"}

        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/me")
def update_my_profile(body: ProfileUpdate, authorization: str = Header(...)):
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        res = sb.table("profiles").select("id").eq("id", uid).execute()
        if not res.data:
            sb.table("profiles").insert({"id": uid, "role": "user"}).execute()

        sb.table("profiles").update(updates).eq("id", uid).execute()

        result = sb.table("profiles").select("*").eq("id", uid).execute()
        return result.data[0] if result.data else updates
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
def get_public_profile(user_id: str):
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
