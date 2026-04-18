"""
MigRent V1 Matching Engine

Transparent, rules-based scoring against real seeker profile data.
No AI black-box. No hallucinated scores. Degrades gracefully when data is missing.

Score weights (total 100):
  Location:        30
  Budget:          25
  Room type:        5  (V1 partial - no profile field yet)
  Date fit:        10
  Furnished:        7
  Bills included:   6
  Verified owner:   5
  Amenities:        4
  Transport:        3
  Near uni/CBD:     5  (visa-aware bonus)
"""

from datetime import date
import logging

logger = logging.getLogger(__name__)


def generate_match_reasons(listing: dict, seeker_profile: dict) -> list:
    """
    Return up to 4 honest, plain-English reasons why this listing matches.
    Only includes reasons backed by real data. Never invents reasons.
    """
    reasons = []

    seeker_suburb = (seeker_profile.get("suburb_city") or "").lower().strip()
    preferred_suburbs = seeker_profile.get("preferred_suburbs") or []
    listing_suburb = (listing.get("suburb") or "").lower().strip()
    listing_city = (listing.get("city") or "").lower().strip()

    # Location
    location_matched = False
    if seeker_suburb:
        if seeker_suburb in listing_suburb or seeker_suburb in listing_city:
            reasons.append("In your preferred area")
            location_matched = True
        elif listing_city and listing_city in seeker_suburb:
            reasons.append("In your preferred city")
            location_matched = True

    if not location_matched and preferred_suburbs:
        for ps in preferred_suburbs:
            ps_lower = ps.lower().strip()
            if ps_lower in listing_suburb or ps_lower in listing_city:
                reasons.append(f"Near {ps}")
                break

    # Budget
    budget_max = seeker_profile.get("budget_max")
    weekly_price = listing.get("weekly_price")
    if budget_max and weekly_price and weekly_price <= budget_max:
        reasons.append("Matches your budget")

    # Furnished
    if listing.get("furnished"):
        reasons.append("Furnished")

    # Bills included
    if listing.get("bills_included"):
        reasons.append("Bills included")

    # Verified owner
    if listing.get("owner_verified"):
        reasons.append("Verified owner")

    # Transport - only show if genuinely close
    station_min = listing.get("station_distance_min")
    transport = listing.get("nearest_transport") or ""
    station_name = transport.split(" - ")[0] if " - " in transport else transport.strip()
    if station_min is not None and station_min <= 15:
        if station_name:
            reasons.append(f"{station_min} min to {station_name}")
        else:
            reasons.append("Near public transport")

    # Available before desired move-in date
    move_in_date = seeker_profile.get("move_in_date")
    available_from = listing.get("available_from")
    if move_in_date and available_from:
        try:
            mi = date.fromisoformat(str(move_in_date)[:10])
            af = date.fromisoformat(str(available_from)[:10])
            if af <= mi:
                reasons.append("Available when you need it")
        except Exception:
            pass

    # Instant book
    if listing.get("instant_book_enabled"):
        reasons.append("Instant book")

    return reasons[:4]


def calculate_match_score(listing: dict, seeker_profile: dict) -> int:
    """
    Calculate a transparent match score (0-100) using real data only.

    If seeker_profile is empty, falls back to generic affordability scoring.
    Never claims higher confidence than the data supports.
    """
    score = 0

    # --- LOCATION (30 pts) ---
    seeker_suburb = (seeker_profile.get("suburb_city") or "").lower().strip()
    preferred_suburbs = seeker_profile.get("preferred_suburbs") or []
    listing_suburb = (listing.get("suburb") or "").lower().strip()
    listing_city = (listing.get("city") or "").lower().strip()

    location_scored = False
    if seeker_suburb:
        if seeker_suburb in listing_suburb or seeker_suburb in listing_city:
            score += 30
            location_scored = True
        elif listing_city and listing_city in seeker_suburb:
            score += 20
            location_scored = True

    if not location_scored and preferred_suburbs:
        for ps in preferred_suburbs:
            ps_lower = ps.lower().strip()
            if ps_lower in listing_suburb or ps_lower in listing_city:
                score += 25
                location_scored = True
                break

    if not location_scored and listing_city:
        score += 5  # has a city listed, better than nothing

    # --- BUDGET (25 pts) ---
    weekly_price = listing.get("weekly_price")
    budget_min = seeker_profile.get("budget_min")
    budget_max = seeker_profile.get("budget_max")

    if weekly_price is not None:
        if budget_max:
            if weekly_price <= budget_max:
                # Full points if in range, slightly less if below minimum (unusual)
                score += 25 if (not budget_min or weekly_price >= budget_min) else 22
            elif weekly_price <= budget_max * 1.1:
                score += 12  # slightly over budget
            elif weekly_price <= budget_max * 1.2:
                score += 6   # moderately over budget
            # else 0 pts - well over budget
        else:
            # No budget preference - generic affordability heuristic
            if weekly_price <= 250:
                score += 20
            elif weekly_price <= 400:
                score += 15
            elif weekly_price <= 600:
                score += 10
            else:
                score += 5

    # --- ROOM TYPE (5 pts, V1 partial) ---
    # Profile has no explicit room_type preference field yet.
    # Give partial credit if the listing has a defined room type.
    if listing.get("place_type") or listing.get("room_type"):
        score += 5

    # --- DATE FIT (10 pts) ---
    move_in_date = seeker_profile.get("move_in_date")
    available_from = listing.get("available_from")

    if move_in_date and available_from:
        try:
            mi = date.fromisoformat(str(move_in_date)[:10])
            af = date.fromisoformat(str(available_from)[:10])
            diff_days = (mi - af).days  # positive = listing available before move-in
            if diff_days >= 0:
                score += 10  # available on or before desired date
            elif diff_days >= -14:
                score += 6   # available within 2 weeks after desired
            elif diff_days >= -30:
                score += 3   # available within a month
            # else 0 pts - too far out
        except Exception:
            score += 5  # can't parse dates, neutral
    elif not move_in_date and not available_from:
        score += 5  # neither set - neutral
    elif available_from:
        score += 3  # listing has date, seeker hasn't set one

    # --- FURNISHED (7 pts) ---
    if listing.get("furnished"):
        score += 7

    # --- BILLS INCLUDED (6 pts) ---
    if listing.get("bills_included"):
        score += 6

    # --- VERIFIED OWNER (5 pts) ---
    if listing.get("owner_verified"):
        score += 5

    # --- AMENITIES (4 pts, 1 pt each) ---
    amenity_pts = sum([
        bool(listing.get("internet_included")),
        bool(listing.get("parking")),
        bool(listing.get("air_conditioning")),
        bool(listing.get("laundry")),
    ])
    score += min(amenity_pts, 4)

    # --- TRANSPORT (3 pts) ---
    station_min = listing.get("station_distance_min")
    if station_min is not None:
        if station_min <= 10:
            score += 3
        elif station_min <= 20:
            score += 2
        elif station_min <= 30:
            score += 1
    elif listing.get("nearest_transport"):
        score += 1  # has transport listed, distance unknown

    # --- VISA-AWARE BONUS (up to 5 pts, additive) ---
    visa_type = seeker_profile.get("visa_type")
    if visa_type in ("student_500", "graduate_485"):
        if listing.get("near_uni"):
            score = min(score + 5, 100)
        elif listing.get("uni_distance_km") and listing["uni_distance_km"] <= 5:
            score = min(score + 3, 100)
    elif visa_type == "skilled_482":
        if listing.get("near_cbd"):
            score = min(score + 5, 100)
        elif listing.get("cbd_distance_km") and listing["cbd_distance_km"] <= 5:
            score = min(score + 3, 100)

    return min(score, 100)


def match_label(score: int) -> str:
    """Return a safe, plain-English match label for a score."""
    if score >= 80:
        return "Strong match"
    if score >= 65:
        return "Good match"
    if score >= 50:
        return "Possible match"
    return "Partial match"
