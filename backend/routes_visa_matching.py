import math
import logging
from fastapi import APIRouter, HTTPException, Header, Query
from db import get_supabase_admin
from auth_utils import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/visa", tags=["visa-matching"])

# Visa type definitions
VISA_TYPES = {
    "student_500": {"name": "Student Visa 500", "uni_focus": True, "cbd_focus": False, "flexible": False, "duration_weeks": 52},
    "skilled_482": {"name": "Skilled Work 482", "uni_focus": False, "cbd_focus": True, "flexible": False, "duration_weeks": 52},
    "whv_417": {"name": "Working Holiday 417", "uni_focus": False, "cbd_focus": False, "flexible": True, "duration_weeks": 26},
    "graduate_485": {"name": "Graduate 485", "uni_focus": True, "cbd_focus": False, "flexible": False, "duration_weeks": 26},
}


def visa_match_score(listing: dict, visa_type: str) -> int:
    """Calculate a visa-aware match score (0-100) for a listing."""
    visa = VISA_TYPES.get(visa_type)
    if not visa:
        return 50

    score = 50

    # University proximity bonus for student/graduate visas
    if visa["uni_focus"] and listing.get("near_uni"):
        score += 20
    elif visa["uni_focus"] and listing.get("uni_distance_km") is not None:
        dist = listing["uni_distance_km"]
        if dist <= 3:
            score += 18
        elif dist <= 5:
            score += 15
        elif dist <= 10:
            score += 8

    # CBD proximity bonus for skilled worker visas
    if visa["cbd_focus"] and listing.get("near_cbd"):
        score += 20
    elif visa["cbd_focus"] and listing.get("cbd_distance_km") is not None:
        dist = listing["cbd_distance_km"]
        if dist <= 3:
            score += 18
        elif dist <= 5:
            score += 15
        elif dist <= 10:
            score += 8

    # Flexible visa - bonus for transport access and affordability
    if visa["flexible"]:
        if listing.get("nearest_transport"):
            score += 10
        if listing.get("weekly_price") and listing["weekly_price"] <= 300:
            score += 10

    # Duration compatibility - check min_stay_weeks vs visa duration
    min_stay = listing.get("min_stay_weeks") or listing.get("min_stay")
    if min_stay:
        try:
            min_weeks = int(min_stay)
            if visa["duration_weeks"] >= min_weeks:
                score += 10
            else:
                score -= 10
        except (ValueError, TypeError):
            pass
    else:
        score += 5

    # Furnished bonus (important for migrants)
    if listing.get("furnished"):
        score += 5

    # Bills included bonus (simpler for newcomers)
    if listing.get("bills_included"):
        score += 5

    # Transport bonus
    if listing.get("nearest_transport"):
        score += 5

    return min(max(score, 0), 99)


def _visa_label(visa_type: str) -> str:
    """Get a human-friendly label for a visa type."""
    visa = VISA_TYPES.get(visa_type)
    return visa["name"] if visa else "Your Visa"


# -- GET /visa/types --

@router.get("/types")
def get_visa_types():
    """Return all supported visa types."""
    return {
        "visa_types": [
            {"id": k, **v} for k, v in VISA_TYPES.items()
        ]
    }


# -- GET /visa/recommended --

@router.get("/recommended")
def get_visa_recommended(
    limit: int = Query(12, ge=1, le=50),
    authorization: str = Header(...),
):
    """Get top listings matched to the seeker's visa type."""
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    # Get seeker profile with visa type
    profile_res = (
        sb.table("profiles")
        .select("visa_type, wishlist")
        .eq("id", user_id)
        .execute()
    )

    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile = profile_res.data[0]
    visa_type = profile.get("visa_type")

    if not visa_type or visa_type not in VISA_TYPES:
        return {"listings": [], "total": 0, "visa_type": None, "visa_label": None}

    wishlist_ids = profile.get("wishlist") or []

    # Fetch listings with geo data
    res = (
        sb.table("listings")
        .select(
            "id, title, address, city, suburb, postcode, weekly_price, "
            "images, description, place_type, furnished, bills_included, "
            "nearest_transport, owner_id, latitude, longitude, "
            "uni_distance_km, cbd_distance_km, near_uni, near_cbd, "
            "min_stay_weeks, station_distance_min"
        )
        .neq("owner_id", user_id)
        .order("created_at", desc=True)
        .limit(100)
        .execute()
    )

    all_listings = res.data or []

    # Score each listing
    for listing in all_listings:
        listing["visa_match_score"] = visa_match_score(listing, visa_type)

    # Sort by visa match score descending
    all_listings.sort(key=lambda x: x["visa_match_score"], reverse=True)

    # Filter out wishlist and take top results
    recommended = [l for l in all_listings if l["id"] not in wishlist_ids][:limit]

    # Enrich with owner data
    for listing in recommended:
        owner_res = (
            sb.table("profiles")
            .select("name, custom_pfp, verified")
            .eq("id", listing["owner_id"])
            .execute()
        )
        if owner_res.data:
            listing["owner"] = owner_res.data[0]

        listing["match_score"] = listing["visa_match_score"]

    return {
        "listings": recommended,
        "total": len(recommended),
        "visa_type": visa_type,
        "visa_label": _visa_label(visa_type),
    }


# -- GET /visa/score --

@router.get("/score")
def get_visa_score_for_listing(
    listing_id: str = Query(...),
    authorization: str = Header(...),
):
    """Get the visa match score for a specific listing."""
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    # Get seeker visa type
    profile_res = (
        sb.table("profiles")
        .select("visa_type")
        .eq("id", user_id)
        .execute()
    )
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    visa_type = profile_res.data[0].get("visa_type")
    if not visa_type or visa_type not in VISA_TYPES:
        return {"score": None, "visa_type": None, "label": None}

    # Get listing
    listing_res = (
        sb.table("listings")
        .select(
            "id, weekly_price, furnished, bills_included, nearest_transport, "
            "uni_distance_km, cbd_distance_km, near_uni, near_cbd, "
            "min_stay_weeks, station_distance_min"
        )
        .eq("id", listing_id)
        .execute()
    )
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]
    score = visa_match_score(listing, visa_type)

    # Generate a human-readable reason
    visa = VISA_TYPES[visa_type]
    reasons = []
    if visa["uni_focus"] and listing.get("near_uni"):
        reasons.append("Close to university")
    if visa["cbd_focus"] and listing.get("near_cbd"):
        reasons.append("Close to CBD")
    if listing.get("furnished"):
        reasons.append("Furnished")
    if listing.get("bills_included"):
        reasons.append("Bills included")
    if listing.get("nearest_transport"):
        reasons.append("Near transport")

    label = f"Great for {visa['name'].split(' ')[0].lower()} visa holders"
    if score >= 85:
        label = f"Excellent match for {visa['name']}"
    elif score >= 70:
        label = f"Good match for {visa['name']}"

    return {
        "score": score,
        "visa_type": visa_type,
        "label": label,
        "reasons": reasons,
    }
