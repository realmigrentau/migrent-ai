from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from models import ListingCreate
from db import get_supabase, get_supabase_admin, SUPABASE_URL, SUPABASE_ANON_KEY
from auth_utils import get_current_user
from supabase import create_client

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
        "suburb": listing.suburb,
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


@router.get("/search")
def search_listings(
    suburb: Optional[str] = None,
    postcode: Optional[str] = None,
    address: Optional[str] = None,
    max_price: Optional[float] = None,
    guests: Optional[int] = None,
    check_in: Optional[str] = None,
    check_out: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = None,
    limit: int = 50,
    offset: int = 0,
):
    """Search listings with filters (public, no auth required)."""
    if limit < 1:
        limit = 1
    if limit > 100:
        limit = 100
    if offset < 0:
        offset = 0

    sb = get_supabase_admin()
    query = sb.table("listings").select("*")

    if max_price is not None:
        query = query.lte("weekly_price", max_price)
    if guests is not None:
        query = query.gte("max_guests", guests)

    # Text-based location filters
    if suburb:
        query = query.ilike("suburb", f"%{suburb}%")
    if postcode:
        query = query.eq("postcode", int(postcode))
    if address:
        query = query.ilike("address", f"%{address}%")

    query = query.range(offset, offset + limit - 1)
    res = query.execute()
    return res.data


@router.get("/{listing_id}")
def get_listing_by_id(listing_id: str, include: Optional[str] = None):
    """Get a single listing by ID (public).

    Optional ?include=reviews,similar to bundle extra data.
    """
    sb = get_supabase_admin()
    res = sb.table("listings").select("*").eq("id", listing_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = res.data[0]

    # Enrich with owner profile
    owner_id = listing.get("owner_id")
    if owner_id:
        profile_res = (
            sb.table("profiles")
            .select("name, custom_pfp, verified, bio, badges, identity_verified")
            .eq("id", owner_id)
            .execute()
        )
        if profile_res.data:
            owner_profile = profile_res.data[0]
            # Count how many listings this owner has
            count_res = sb.table("listings").select("id", count="exact").eq("owner_id", owner_id).execute()
            owner_profile["listings_count"] = count_res.count if count_res.count is not None else 0
            listing["owner_profile"] = owner_profile

    includes = set((include or "").split(","))

    # Reviews
    if "reviews" in includes:
        try:
            stats_res = (
                sb.table("listing_review_stats")
                .select("*")
                .eq("listing_id", listing_id)
                .execute()
            )
            listing["review_stats"] = stats_res.data[0] if stats_res.data else {
                "review_count": 0,
                "avg_rating": 0,
                "avg_migrant_friendliness": None,
                "positive_count": 0,
            }
        except Exception:
            listing["review_stats"] = {
                "review_count": 0,
                "avg_rating": 0,
                "avg_migrant_friendliness": None,
                "positive_count": 0,
            }

        try:
            reviews_res = (
                sb.table("reviews")
                .select("id, reviewer_id, rating, review_text, migrant_friendliness, photos, created_at")
                .eq("listing_id", listing_id)
                .eq("flagged", False)
                .order("created_at", desc=True)
                .limit(5)
                .execute()
            )
            reviews = reviews_res.data or []
            # Enrich with reviewer names
            reviewer_ids = list({r["reviewer_id"] for r in reviews})
            if reviewer_ids:
                profiles_res = (
                    sb.table("profiles")
                    .select("id, name, custom_pfp")
                    .in_("id", reviewer_ids)
                    .execute()
                )
                profile_map = {p["id"]: p for p in (profiles_res.data or [])}
                for r in reviews:
                    p = profile_map.get(r["reviewer_id"], {})
                    r["reviewer_name"] = p.get("name", "Anonymous")
                    r["reviewer_photo"] = p.get("custom_pfp")
            listing["recent_reviews"] = reviews
        except Exception:
            listing["recent_reviews"] = []

    # Similar listings
    if "similar" in includes:
        try:
            price = listing.get("weekly_price", 0)
            suburb = listing.get("suburb")
            min_p = price * 0.7
            max_p = price * 1.3
            q = (
                sb.table("listings")
                .select("id, title, address, suburb, city, postcode, weekly_price, images, instant_book_enabled")
                .neq("id", listing_id)
                .gte("weekly_price", min_p)
                .lte("weekly_price", max_p)
            )
            if suburb:
                q = q.eq("suburb", suburb)
            similar_res = q.limit(4).execute()
            listing["similar_listings"] = similar_res.data or []
            # If not enough from same suburb, fill from same city
            if len(listing["similar_listings"]) < 4 and listing.get("city"):
                existing_ids = [listing_id] + [s["id"] for s in listing["similar_listings"]]
                fill_q = (
                    sb.table("listings")
                    .select("id, title, address, suburb, city, postcode, weekly_price, images, instant_book_enabled")
                    .eq("city", listing["city"])
                    .gte("weekly_price", min_p)
                    .lte("weekly_price", max_p)
                    .limit(4 - len(listing["similar_listings"]))
                )
                for eid in existing_ids:
                    fill_q = fill_q.neq("id", eid)
                fill_res = fill_q.execute()
                listing["similar_listings"].extend(fill_res.data or [])
        except Exception:
            listing["similar_listings"] = []

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


class DeleteListingRequest(BaseModel):
    password: Optional[str] = None
    oauth_confirmed: Optional[bool] = False


@router.delete("/{listing_id}")
def delete_listing(
    listing_id: str,
    body: DeleteListingRequest = DeleteListingRequest(),
    authorization: str = Header(...),
):
    """Delete a listing. Requires password or OAuth re-auth confirmation."""
    user = get_current_user(authorization)
    user_id = str(user.id)

    # Verify the listing exists and belongs to this user
    sb_admin = get_supabase_admin()
    listing_res = sb_admin.table("listings").select("id, owner_id").eq("id", listing_id).execute()
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing_res.data[0]["owner_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings")

    # Verify identity - either password or OAuth re-auth
    if body.oauth_confirmed:
        pass  # Valid session after OAuth redirect is sufficient
    elif body.password:
        email = user.email
        if not email:
            raise HTTPException(status_code=400, detail="Could not verify identity")
        try:
            sb_anon = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
            auth_res = sb_anon.auth.sign_in_with_password({
                "email": email,
                "password": body.password,
            })
            if not auth_res or not auth_res.user:
                raise HTTPException(status_code=401, detail="Incorrect password")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=401, detail="Incorrect password")
    else:
        raise HTTPException(status_code=400, detail="Please confirm with your password or Google sign-in")

    # Delete the listing
    sb_admin.table("listings").delete().eq("id", listing_id).execute()

    return {"message": "Listing deleted successfully"}


@router.get("/auth/provider")
def get_auth_provider(authorization: str = Header(...)):
    """Return the current user's auth provider (email, google, etc)."""
    user = get_current_user(authorization)
    provider = (user.app_metadata or {}).get("provider", "email")
    return {"provider": provider}
