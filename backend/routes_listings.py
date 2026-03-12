from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from models import ListingCreate
from db import get_supabase, get_supabase_admin
from auth_utils import get_current_user

router = APIRouter(prefix="/listings", tags=["listings"])


def derive_city(postcode: int) -> Optional[str]:
    """Map Australian postcodes to their capital city/region."""
    if 800 <= postcode <= 899:
        return "Darwin"
    if 900 <= postcode <= 999:
        return "Darwin"  # NT rural
    if 1000 <= postcode <= 1999:
        return "Sydney"
    if 2000 <= postcode <= 2599:
        return "Sydney"
    if 2600 <= postcode <= 2620:
        return "Canberra"
    if 2621 <= postcode <= 2899:
        return "Sydney"  # Regional NSW
    if 2900 <= postcode <= 2999:
        return "Canberra"  # ACT surrounds
    if 3000 <= postcode <= 3999:
        return "Melbourne"
    if 4000 <= postcode <= 4999:
        return "Brisbane"
    if 5000 <= postcode <= 5999:
        return "Adelaide"
    if 6000 <= postcode <= 6999:
        return "Perth"
    if 7000 <= postcode <= 7999:
        return "Hobart"
    return None


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

    sb = get_supabase_admin()
    row = {
        "address": listing.address,
        "postcode": listing.postcode,
        "city": city,
        "weekly_price": listing.weekly_price,
        "description": listing.description,
        "images": listing.images,
        "owner_id": str(user.id),
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
        raise HTTPException(status_code=500, detail="Failed to create listing")

    return res.data[0] if res.data else row


@router.get("/{listing_id}")
def get_listing_by_id(listing_id: str):
    """Get a single listing by ID (public)."""
    sb = get_supabase_admin()
    res = sb.table("listings").select("*").eq("id", listing_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = res.data[0]

    # Enrich with owner profile
    owner_id = listing.get("owner_id")
    if owner_id:
        profile_res = sb.table("profiles").select("name, custom_pfp, verified, bio").eq("id", owner_id).execute()
        if profile_res.data:
            listing["owner_profile"] = profile_res.data[0]

    return listing


@router.get("")
def list_listings(
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    owner: Optional[bool] = None,
    limit: int = 20,
    offset: int = 0,
    authorization: Optional[str] = Header(None),
):
    # Clamp limit to prevent abuse
    if limit < 1:
        limit = 1
    if limit > 100:
        limit = 100
    if offset < 0:
        offset = 0

    sb = get_supabase_admin()
    query = sb.table("listings").select("*")
    if city:
        query = query.eq("city", city)
    if min_price is not None:
        query = query.gte("weekly_price", min_price)
    if max_price is not None:
        query = query.lte("weekly_price", max_price)
    if owner and authorization:
        user = get_current_user(authorization)
        query = query.eq("owner_id", str(user.id))

    query = query.range(offset, offset + limit - 1)

    res = query.execute()
    return res.data
