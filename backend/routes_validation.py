"""
Validation & utility endpoints for onboarding.

Endpoints:
  GET  /utils/nearest-station?suburb_city=Kellyville/Sydney
  POST /validate/address
  POST /validate/phone
"""

import os
import math
import logging
import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(tags=["validation"])

# ── Environment variables ──────────────────────────────────
MAPTILER_API_KEY = os.environ.get("MAPTILER_API_KEY", "").strip()
ADDRESSIFY_API_KEY = os.environ.get("ADDRESSIFY_API_KEY", "").strip()
PHONE_VALIDATION_API_KEY = os.environ.get("PHONE_VALIDATION_API_KEY", "").strip()


# ── Models ─────────────────────────────────────────────────

class AddressValidationRequest(BaseModel):
    suburb_city: str  # e.g. "Kellyville/Sydney"
    postcode: str     # e.g. "2155"


class PhoneValidationRequest(BaseModel):
    phone: str  # e.g. "+61412345678"


class ValidationResponse(BaseModel):
    valid: bool
    reason: str | None = None


# ── Nearest Station ────────────────────────────────────────

OVERPASS_ENDPOINTS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
]


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in km between two lat/lng points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/utils/nearest-station")
async def nearest_station(suburb_city: str = Query(..., description="Format: Suburb/City e.g. Kellyville/Sydney")):
    """
    Find the nearest train station for a given suburb/city.

    Uses MapTiler Geocoding (free) + Overpass API (free, no key).
    Tries a fast mirror first, falls back to the main server.
    Target: <5 seconds total.
    """
    if "/" not in suburb_city:
        raise HTTPException(status_code=400, detail="Format must be Suburb/City (e.g. Kellyville/Sydney)")

    if not MAPTILER_API_KEY:
        return {"station": None, "message": "Station lookup not configured yet"}

    suburb, city = suburb_city.split("/", 1)
    query = f"{suburb.strip()}, {city.strip()}, Australia"

    async with httpx.AsyncClient() as client:
        # Step 1: Geocode via MapTiler (fast, ~200ms)
        try:
            geocode_resp = await client.get(
                f"https://api.maptiler.com/geocoding/{query}.json",
                params={"key": MAPTILER_API_KEY, "country": "au", "limit": "1"},
                timeout=3,
            )
            geocode_data = geocode_resp.json()
        except Exception:
            return {"station": None, "message": "Geocoding timed out"}

        features = geocode_data.get("features", [])
        if not features:
            return {"station": None, "message": "Could not locate that suburb"}

        coords = features[0]["geometry"]["coordinates"]  # [lng, lat]
        lng, lat = coords[0], coords[1]

        # Step 2: Find nearest station via Overpass (compact query, 5km first)
        # Uses a tight radius for speed; expands if nothing found
        overpass_data = None
        for radius in [5000, 10000]:
            overpass_query = (
                f'[out:json][timeout:4];'
                f'('
                f'node["railway"="station"](around:{radius},{lat},{lng});'
                f'node["railway"="halt"](around:{radius},{lat},{lng});'
                f'node["railway"="stop"]["subway"="yes"](around:{radius},{lat},{lng});'
                f'node["railway"="light_rail"]["name"](around:{radius},{lat},{lng});'
                f'node["railway"="stop"]["light_rail"="yes"](around:{radius},{lat},{lng});'
                f');'
                f'out body;'
            )

            for endpoint in OVERPASS_ENDPOINTS:
                try:
                    resp = await client.post(
                        endpoint,
                        data={"data": overpass_query},
                        timeout=4,
                    )
                    overpass_data = resp.json()
                    if overpass_data.get("elements"):
                        break
                except Exception:
                    continue

            if overpass_data and overpass_data.get("elements"):
                break

        if not overpass_data or not overpass_data.get("elements"):
            return {"station": None, "message": "No train station found nearby"}

        # Step 3: Pick the closest station by haversine distance
        # Deduplicate by name (e.g. platform 1 and 2 of same station)
        elements = overpass_data["elements"]
        seen_names: dict[str, tuple[float, dict]] = {}

        for el in elements:
            if "lat" not in el or "lon" not in el:
                continue
            tags = el.get("tags", {})
            name = tags.get("name")
            if not name:
                continue
            dist = _haversine(lat, lng, el["lat"], el["lon"])
            if name not in seen_names or dist < seen_names[name][0]:
                seen_names[name] = (dist, el)

        if not seen_names:
            return {"station": None, "message": "No named station found nearby"}

        # Find the closest unique station
        station_name, (closest_dist, closest) = min(
            seen_names.items(), key=lambda x: x[1][0]
        )

        tags = closest.get("tags", {})
        operator = tags.get("operator", tags.get("network", ""))

        display = f"{station_name} – {operator}" if operator else station_name

        return {
            "station": station_name,
            "vicinity": operator,
            "display": display,
            "distance_km": round(closest_dist, 1),
        }


# ── Address Validation ─────────────────────────────────────

@router.post("/validate/address", response_model=ValidationResponse)
async def validate_address(body: AddressValidationRequest):
    """
    Validate an Australian suburb/city + postcode combination.

    Uses Addressify API (or AusPost Postcode Search) to confirm
    that the suburb exists in Australia and matches the postcode.

    Example request:
      { "suburb_city": "Kellyville/Sydney", "postcode": "2155" }

    Example response:
      { "valid": true, "reason": null }
      { "valid": false, "reason": "Suburb/City combination doesn't look valid in Australia" }
    """
    if "/" not in body.suburb_city:
        return ValidationResponse(valid=False, reason="Format must be Suburb/City (e.g. Kellyville/Sydney)")

    suburb = body.suburb_city.split("/", 1)[0].strip()
    postcode = body.postcode.strip()

    if not postcode.isdigit() or len(postcode) != 4:
        return ValidationResponse(valid=False, reason="Australian postcodes must be exactly 4 digits")

    # If Addressify API key is configured, use it for real validation
    if ADDRESSIFY_API_KEY:
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                resp = await client.get(
                    "https://api.addressify.com.au/address/getSuburb",
                    params={
                        "api_key": ADDRESSIFY_API_KEY,
                        "suburb": suburb,
                        "postcode": postcode,
                        "state": "",
                    },
                )
                data = resp.json()
                # Addressify returns a list of matching suburbs
                if isinstance(data, list) and len(data) > 0:
                    return ValidationResponse(valid=True)
                return ValidationResponse(
                    valid=False,
                    reason="Suburb/City combination doesn't look valid in Australia",
                )
            except Exception as e:
                logger.warning(f"Addressify API error: {e}")
                # Fall through to basic validation

    # Basic validation fallback: check postcode range for Australian states
    postcode_int = int(postcode)
    valid_ranges = [
        (200, 299),    # ACT
        (2600, 2618),  # ACT
        (2900, 2920),  # ACT
        (1000, 2599),  # NSW
        (2619, 2899),  # NSW
        (2921, 2999),  # NSW
        (3000, 3999),  # VIC
        (4000, 4999),  # QLD
        (5000, 5799),  # SA
        (6000, 6797),  # WA
        (7000, 7799),  # TAS
        (800, 899),    # NT
        (900, 999),    # NT
    ]
    in_range = any(lo <= postcode_int <= hi for lo, hi in valid_ranges)
    if not in_range:
        return ValidationResponse(valid=False, reason="Postcode is not a valid Australian postcode")

    return ValidationResponse(valid=True)


# ── Phone Validation ───────────────────────────────────────

@router.post("/validate/phone", response_model=ValidationResponse)
async def validate_phone(body: PhoneValidationRequest):
    """
    Validate an Australian phone number.

    Uses a phone validation API (e.g. NumVerify, AbstractAPI) to check
    if the number is valid, active, and Australian.

    Example request:
      { "phone": "+61412345678" }

    Example response:
      { "valid": true, "reason": null }
      { "valid": false, "reason": "Phone number appears invalid or not active" }
    """
    phone = body.phone.strip()

    # Basic format check
    if not phone:
        return ValidationResponse(valid=False, reason="Phone number is required")

    # Normalise: remove spaces, dashes, parentheses
    normalised = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")

    # Must be Australian format
    if not (normalised.startswith("+61") or normalised.startswith("04") or normalised.startswith("02")
            or normalised.startswith("03") or normalised.startswith("07") or normalised.startswith("08")):
        return ValidationResponse(valid=False, reason="Phone number must be an Australian number (starting with +61 or 04/02/03/07/08)")

    # Check length after normalisation
    if normalised.startswith("+61"):
        if len(normalised) != 12:  # +61 + 9 digits
            return ValidationResponse(valid=False, reason="Australian phone numbers must have 9 digits after +61")
    elif normalised.startswith("04"):
        if len(normalised) != 10:  # 04XX XXX XXX
            return ValidationResponse(valid=False, reason="Australian mobile numbers must be 10 digits")
    else:
        if len(normalised) != 10:  # landline 0X XXXX XXXX
            return ValidationResponse(valid=False, reason="Australian landline numbers must be 10 digits")

    # If phone validation API key is configured, do a real check
    if PHONE_VALIDATION_API_KEY:
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                # Example using AbstractAPI Phone Validation
                resp = await client.get(
                    "https://phonevalidation.abstractapi.com/v1/",
                    params={
                        "api_key": PHONE_VALIDATION_API_KEY,
                        "phone": normalised if normalised.startswith("+") else f"+61{normalised[1:]}",
                    },
                )
                data = resp.json()
                if data.get("valid") is False:
                    return ValidationResponse(valid=False, reason="Phone number appears invalid or not active")
                if data.get("country", {}).get("code") != "AU":
                    return ValidationResponse(valid=False, reason="Phone number is not an Australian number")
                return ValidationResponse(valid=True)
            except Exception as e:
                logger.warning(f"Phone validation API error: {e}")
                # Fall through to basic validation pass

    return ValidationResponse(valid=True)
