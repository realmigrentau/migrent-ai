from fastapi import APIRouter, Header
from db import get_supabase
from routes_listings import derive_city
from auth_utils import get_current_user

router = APIRouter(prefix="/matches", tags=["matches"])


def _calculate_match_score(listing: dict, seeker_profile: dict) -> int:
    """
    Calculate a match score (0-100) based on seeker preferences vs listing attributes.

    Scoring factors:
    - Location match (same city): 30 points
    - Price range (affordability): 25 points
    - Furnished preference: 15 points
    - Bills included: 10 points
    - Room amenities (internet, parking, AC, laundry): 5 points each (20 total)
    """
    score = 0

    # Location match - same city/suburb
    seeker_suburb = seeker_profile.get("suburb_city", "") or ""
    listing_city = listing.get("city", "") or ""
    if seeker_suburb and listing_city:
        if listing_city.lower() in seeker_suburb.lower():
            score += 30
        else:
            score += 5
    elif listing_city:
        score += 10  # Has a city listed, partial credit

    # Price affordability
    weekly_price = listing.get("weekly_price")
    if weekly_price is not None:
        if weekly_price <= 200:
            score += 25
        elif weekly_price <= 350:
            score += 20
        elif weekly_price <= 500:
            score += 15
        else:
            score += 5

    # Furnished bonus
    if listing.get("furnished"):
        score += 15
    else:
        score += 5

    # Bills included bonus
    if listing.get("bills_included"):
        score += 10

    # Amenities bonuses (5 points each, max 20)
    amenity_score = 0
    if listing.get("internet_included"):
        amenity_score += 5
    if listing.get("parking"):
        amenity_score += 5
    if listing.get("air_conditioning"):
        amenity_score += 5
    if listing.get("laundry"):
        amenity_score += 5
    score += min(amenity_score, 20)

    return min(score, 100)


@router.get("")
def get_matches(postcode: int, authorization: str = Header(...)):
    user = get_current_user(authorization)
    city = derive_city(postcode)
    sb = get_supabase()

    # Get seeker profile for preference matching
    seeker_profile = {}
    try:
        profile_res = sb.table("profiles").select("*").eq("id", str(user.id)).execute()
        if profile_res.data:
            seeker_profile = profile_res.data[0]
    except Exception:
        pass  # Continue without profile - scoring will use defaults

    query = sb.table("listings").select("*")
    if city:
        query = query.eq("city", city)
    query = query.limit(20)

    res = query.execute()
    results = []
    for listing in res.data:
        match_score = _calculate_match_score(listing, seeker_profile)
        flat = {**listing, "match_score": match_score}
        results.append(flat)
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results
