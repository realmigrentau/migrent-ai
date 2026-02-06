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

    # Add all extended fields if provided
    extended_fields = {
        "title": listing.title,
        "property_type": listing.property_type,
        "place_type": listing.place_type,
        "max_guests": listing.max_guests,
        "bedrooms": listing.bedrooms,
        "beds": listing.beds,
        "bathrooms": listing.bathrooms,
        "bathroom_type": listing.bathroom_type,
        "who_else_lives_here": listing.who_else_lives_here,
        "total_other_people": listing.total_other_people,
        "furnished": listing.furnished,
        "bills_included": listing.bills_included,
        "parking": listing.parking,
        "highlights": listing.highlights,
        "weekly_discount": listing.weekly_discount,
        "monthly_discount": listing.monthly_discount,
        "bond": listing.bond,
        "no_smoking": listing.no_smoking,
        "quiet_hours": listing.quiet_hours,
        "tenant_prefs": listing.tenant_prefs,
        "min_stay": listing.min_stay,
        "security_cameras": listing.security_cameras,
        "security_cameras_location": listing.security_cameras_location,
        "weapons_on_property": listing.weapons_on_property,
        "weapons_explanation": listing.weapons_explanation,
        "other_safety_details": listing.other_safety_details,
        "available_from": listing.available_from,
        "available_to": listing.available_to,
        "instant_book": listing.instant_book,
        "internet_included": listing.internet_included,
        "internet_speed": listing.internet_speed,
        "pets_allowed": listing.pets_allowed,
        "pet_details": listing.pet_details,
        "air_conditioning": listing.air_conditioning,
        "laundry": listing.laundry,
        "dishwasher": listing.dishwasher,
        "nearest_transport": listing.nearest_transport,
        "neighbourhood_vibe": listing.neighbourhood_vibe,
        "gender_preference": listing.gender_preference,
        "couples_ok": listing.couples_ok,
    }
    for key, value in extended_fields.items():
        if value is not None:
            row[key] = value
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
    owner: Optional[bool] = None,
    authorization: Optional[str] = Header(None),
):
    sb = get_supabase()
    query = sb.table("listings").select("*")
    if city:
        query = query.eq("city", city)
    if min_price is not None:
        query = query.gte("weekly_price", min_price)
    if max_price is not None:
        query = query.lte("weekly_price", max_price)
    if owner and authorization:
        user = get_current_user(authorization)
        query = query.eq("owner_id", user.id)

    res = query.execute()
    return res.data
