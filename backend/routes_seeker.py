import os
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Header, Query
from db import get_supabase_admin
from auth_utils import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/seeker", tags=["seeker"])


def _verify_seeker(authorization: str):
    """Validate token and return user id."""
    user = get_current_user(authorization)
    return str(user.id)


# -- GET /seeker/metrics --


@router.get("/metrics")
def get_seeker_metrics(authorization: str = Header(...)):
    user_id = _verify_seeker(authorization)
    sb = get_supabase_admin()

    # Saved listings count (from profile wishlist array)
    profile_res = sb.table("profiles").select("wishlist").eq("id", user_id).execute()
    wishlist = []
    if profile_res.data and profile_res.data[0].get("wishlist"):
        wishlist = profile_res.data[0]["wishlist"]
    saved_count = len(wishlist)

    # Bookings data
    bookings_res = (
        sb.table("bookings")
        .select("status")
        .eq("seeker_id", user_id)
        .execute()
    )
    bookings = bookings_res.data or []

    pending_requests = sum(
        1 for b in bookings if b["status"] in ("PENDING_OWNER", "OWNER_ACCEPTED")
    )
    confirmed_bookings = sum(
        1 for b in bookings if b["status"] in ("PAID", "COMPLETED")
    )

    # Recommended count - listings with match_score > 80 (approximate via recent matches)
    # For now, count active listings not owned by this user as potential recommendations
    listings_res = (
        sb.table("listings")
        .select("id", count="exact")
        .neq("owner_id", user_id)
        .limit(1)
        .execute()
    )
    recommended_count = min(
        listings_res.count if hasattr(listings_res, "count") and listings_res.count else 0,
        20,
    )

    return {
        "saved_listings": saved_count,
        "pending_requests": pending_requests,
        "confirmed_bookings": confirmed_bookings,
        "recommended": recommended_count,
    }


# -- GET /seeker/bookings --


@router.get("/bookings")
def get_seeker_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    status: str = Query(None),
    authorization: str = Header(...),
):
    user_id = _verify_seeker(authorization)
    sb = get_supabase_admin()

    query = (
        sb.table("bookings")
        .select("*")
        .eq("seeker_id", user_id)
        .order("created_at", desc=True)
    )

    if status:
        query = query.eq("status", status)

    offset = (page - 1) * per_page
    query = query.range(offset, offset + per_page - 1)

    res = query.execute()
    bookings = res.data or []

    # Enrich with listing + owner data
    for booking in bookings:
        listing_res = (
            sb.table("listings")
            .select("title, address, city, weekly_price, images")
            .eq("id", booking["listing_id"])
            .execute()
        )
        if listing_res.data:
            booking["listing"] = listing_res.data[0]

        owner_res = (
            sb.table("profiles")
            .select("name, custom_pfp, verified")
            .eq("id", booking["owner_id"])
            .execute()
        )
        if owner_res.data:
            booking["owner"] = owner_res.data[0]

    # Total count
    count_query = (
        sb.table("bookings")
        .select("id", count="exact")
        .eq("seeker_id", user_id)
    )
    if status:
        count_query = count_query.eq("status", status)
    count_res = count_query.execute()
    total = (
        count_res.count
        if hasattr(count_res, "count") and count_res.count is not None
        else len(bookings)
    )

    return {
        "bookings": bookings,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


# -- GET /seeker/wishlist --


@router.get("/wishlist")
def get_seeker_wishlist(authorization: str = Header(...)):
    user_id = _verify_seeker(authorization)
    sb = get_supabase_admin()

    # Get wishlist IDs from profile
    profile_res = sb.table("profiles").select("wishlist").eq("id", user_id).execute()
    wishlist_ids = []
    if profile_res.data and profile_res.data[0].get("wishlist"):
        wishlist_ids = profile_res.data[0]["wishlist"]

    if not wishlist_ids:
        return {"listings": [], "total": 0}

    # Fetch listing details for each saved ID
    listings = []
    for lid in wishlist_ids:
        try:
            listing_res = (
                sb.table("listings")
                .select(
                    "id, title, address, city, suburb, postcode, weekly_price, "
                    "images, description, place_type, furnished, bills_included, "
                    "nearest_transport, owner_id"
                )
                .eq("id", lid)
                .execute()
            )
            if listing_res.data:
                listing = listing_res.data[0]
                # Get owner info
                owner_res = (
                    sb.table("profiles")
                    .select("name, custom_pfp, verified")
                    .eq("id", listing["owner_id"])
                    .execute()
                )
                if owner_res.data:
                    listing["owner"] = owner_res.data[0]
                listings.append(listing)
        except Exception as e:
            logger.warning(f"Failed to fetch wishlist listing {lid}: {e}")

    return {"listings": listings, "total": len(listings)}


# -- GET /seeker/recommended --


@router.get("/recommended")
def get_seeker_recommended(
    limit: int = Query(4, ge=1, le=20),
    authorization: str = Header(...),
):
    user_id = _verify_seeker(authorization)
    sb = get_supabase_admin()

    # Get seeker profile for preferences
    profile_res = (
        sb.table("profiles")
        .select("preferred_location, max_budget, wishlist")
        .eq("id", user_id)
        .execute()
    )
    wishlist_ids = []
    if profile_res.data and profile_res.data[0].get("wishlist"):
        wishlist_ids = profile_res.data[0]["wishlist"]

    # Fetch recent active listings not owned by this seeker
    query = (
        sb.table("listings")
        .select(
            "id, title, address, city, suburb, postcode, weekly_price, "
            "images, description, place_type, furnished, bills_included, "
            "nearest_transport, owner_id"
        )
        .neq("owner_id", user_id)
        .order("created_at", desc=True)
        .limit(limit + len(wishlist_ids))
    )

    res = query.execute()
    all_listings = res.data or []

    # Filter out already-saved listings
    recommended = [l for l in all_listings if l["id"] not in wishlist_ids][:limit]

    # Enrich with owner data and compute a simple match score
    for listing in recommended:
        owner_res = (
            sb.table("profiles")
            .select("name, custom_pfp, verified")
            .eq("id", listing["owner_id"])
            .execute()
        )
        if owner_res.data:
            listing["owner"] = owner_res.data[0]

        # Simple match score based on available data
        score = 70
        if listing.get("furnished"):
            score += 10
        if listing.get("bills_included"):
            score += 10
        if listing.get("nearest_transport"):
            score += 10
        listing["match_score"] = min(score, 99)

    # Sort by match score descending
    recommended.sort(key=lambda x: x.get("match_score", 0), reverse=True)

    return {"listings": recommended, "total": len(recommended)}
