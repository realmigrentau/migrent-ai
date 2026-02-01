from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from models import ListingCreate
from db import get_supabase

router = APIRouter(prefix="/listings", tags=["listings"])


def derive_city(postcode: int) -> Optional[str]:
    if 1000 <= postcode <= 2999:
        return "Sydney"
    if 5000 <= postcode <= 5999:
        return "Adelaide"
    return None


def get_current_user(authorization: str):
    """Validate the Bearer token via Supabase and return the user."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.removeprefix("Bearer ")
    sb = get_supabase()
    try:
        res = sb.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if res is None or res.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return res.user


@router.post("")
def create_listing(
    listing: ListingCreate,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_meta = user.user_metadata or {}
    user_type = user_meta.get("user_type") or user_meta.get("type")
    # Allow owner type OR users without a type set (e.g. Google OAuth users)
    if user_type and user_type != "owner":
        raise HTTPException(status_code=403, detail="Only owners can create listings")

    city = listing.city or derive_city(listing.postcode)

    sb = get_supabase()
    row = {
        "address": listing.address,
        "postcode": listing.postcode,
        "city": city,
        "weekly_price": listing.weekly_price,
        "description": listing.description,
        "images": listing.images,
        "owner_id": user.id,
    }
    try:
        res = sb.table("listings").insert(row).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return res.data[0] if res.data else row


@router.get("")
def list_listings(
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
):
    sb = get_supabase()
    query = sb.table("listings").select("*")
    if city:
        query = query.eq("city", city)
    if min_price is not None:
        query = query.gte("weekly_price", min_price)
    if max_price is not None:
        query = query.lte("weekly_price", max_price)

    res = query.execute()
    return res.data
