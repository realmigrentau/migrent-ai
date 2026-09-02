"""
Geocoding endpoints for address lookup and station distance calculation.

Endpoints:
  POST /geocode/address  - Geocode an address and find nearest station
"""

import os
import math
import logging
import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/geocode", tags=["geocode"])

MAPTILER_API_KEY = os.environ.get("MAPTILER_API_KEY", "").strip()


class GeocodeRequest(BaseModel):
    address: str  # e.g. "Kellyville, NSW 2155" or "123 Main St, Sydney"


class GeocodeResponse(BaseModel):
    lat: float | None = None
    lng: float | None = None
    formatted_address: str | None = None
    nearest_station: str | None = None
    walk_time_minutes: int | None = None
    station_distance_km: float | None = None


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in km between two lat/lng points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def geocode_and_find_station(address: str) -> GeocodeResponse:
    """
    Geocode an address via MapTiler and find nearest station via Overpass.
    Reusable by both the API endpoint and listing creation flow.
    """
    if not MAPTILER_API_KEY:
        return GeocodeResponse()

    async with httpx.AsyncClient(timeout=20) as client:
        # Step 1: Geocode via MapTiler
        geocode_resp = await client.get(
            f"https://api.maptiler.com/geocoding/{address}.json",
            params={"key": MAPTILER_API_KEY, "country": "au", "limit": "1"},
        )
        geocode_data = geocode_resp.json()

        features = geocode_data.get("features", [])
        if not features:
            return GeocodeResponse()

        coords = features[0]["geometry"]["coordinates"]  # [lng, lat]
        lng, lat = coords[0], coords[1]
        formatted = features[0].get("place_name", address)

        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            return GeocodeResponse()

        result = GeocodeResponse(lat=lat, lng=lng, formatted_address=formatted)

        # Step 2: Find nearest station via Overpass API
        try:
            overpass_query = f"""
            [out:json][timeout:10];
            (
              node["railway"="station"](around:15000,{lat},{lng});
              node["railway"="halt"](around:15000,{lat},{lng});
              node["station"="subway"](around:15000,{lat},{lng});
              node["railway"="tram_stop"]["name"](around:15000,{lat},{lng});
              node["public_transport"="station"]["train"="yes"](around:15000,{lat},{lng});
            );
            out body;
            """

            overpass_resp = await client.post(
                "https://overpass-api.de/api/interpreter",
                data={"data": overpass_query},
            )
            overpass_data = overpass_resp.json()

            elements = overpass_data.get("elements", [])
            closest = None
            closest_dist = float("inf")
            for el in elements:
                if "lat" not in el or "lon" not in el:
                    continue
                name = el.get("tags", {}).get("name")
                if not name:
                    continue
                dist = haversine(lat, lng, el["lat"], el["lon"])
                if dist < closest_dist:
                    closest_dist = dist
                    closest = el

            if closest:
                station_name = closest.get("tags", {}).get("name", "Unknown Station")
                walk_minutes = round(closest_dist / 5 * 60)
                result.nearest_station = station_name
                result.walk_time_minutes = walk_minutes
                result.station_distance_km = round(closest_dist, 1)
        except Exception as e:
            logger.warning(f"Overpass station lookup failed: {e}")

        return result


@router.post("/address", response_model=GeocodeResponse)
@limiter.limit("20/minute")
async def geocode_address(request: Request, body: GeocodeRequest):
    """
    Geocode an Australian address and find the nearest train/tram station.

    Returns lat/lng, formatted address, nearest station name, and walk time.
    """
    if not body.address or len(body.address.strip()) < 3:
        raise HTTPException(status_code=400, detail="Address too short")

    return await geocode_and_find_station(body.address.strip())


# ---------------------------------------------------------------------------
# Listing location validation
# ---------------------------------------------------------------------------

from dataclasses import dataclass

# A pin further than this from the suburb/postcode centroid is treated as a
# mismatch. Australian suburbs are rarely more than ~10 km across; 25 km
# leaves room for rural postcodes while catching a pin in the wrong city or
# in the sea (the Kellyville listing was pinned 30 km away, offshore).
MAX_CENTROID_DISTANCE_KM = 25.0


@dataclass
class LocationCheck:
    ok: bool
    reason: str | None = None
    lat: float | None = None
    lng: float | None = None
    formatted_address: str | None = None
    source: str | None = None  # "client", "address", "centroid", "skipped"


async def geocode_centroid(query: str) -> tuple[float, float, str] | None:
    """Geocode a free-text place (suburb + postcode) to a centroid."""
    if not MAPTILER_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://api.maptiler.com/geocoding/{query}.json",
                params={"key": MAPTILER_API_KEY, "country": "au", "limit": "1"},
            )
            data = resp.json()
    except Exception as e:
        logger.warning("Centroid geocode failed for %r: %s", query, e)
        return None
    features = data.get("features", [])
    if not features:
        return None
    lng, lat = features[0]["geometry"]["coordinates"][:2]
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        return None
    return float(lat), float(lng), features[0].get("place_name", query)


async def validate_listing_location(
    *,
    address: str | None,
    suburb: str | None,
    postcode: int | str | None,
    latitude: float | None,
    longitude: float | None,
) -> LocationCheck:
    """Make sure a listing's coordinates, suburb and postcode agree.

    Rules:
    * Coordinates must be inside Australia's bounding box.
    * If the client supplied a pin and we can geocode "suburb postcode", the
      pin must be within MAX_CENTROID_DISTANCE_KM of that centroid.
    * If no pin was supplied, geocode the address; if that result is not
      near the suburb centroid (a typo'd street, or an address in another
      city), fall back to the centroid itself so the map is never wrong by
      a whole city.
    * With no geocoding key configured, accept the client pin if it is in
      Australia and otherwise leave coordinates empty. Nothing public ever
      shows an exact pin, so an absent pin is safe; a wrong one is not.
    """
    place_query = " ".join(str(p) for p in (suburb, postcode, "Australia") if p)
    centroid = await geocode_centroid(place_query) if (suburb or postcode) else None

    def in_australia(lat: float, lng: float) -> bool:
        return -44.5 <= lat <= -9.0 and 112.0 <= lng <= 154.5

    if latitude is not None and longitude is not None:
        lat, lng = float(latitude), float(longitude)
        if not in_australia(lat, lng):
            return LocationCheck(ok=False, reason="The map pin is outside Australia. Check the address and try again.")
        if centroid is not None:
            dist = haversine(lat, lng, centroid[0], centroid[1])
            if dist > MAX_CENTROID_DISTANCE_KM:
                return LocationCheck(
                    ok=False,
                    reason=(
                        f"The map pin is {dist:.0f} km from {suburb or ''} {postcode or ''}. "
                        "Check the suburb and postcode match the address."
                    ),
                )
        return LocationCheck(ok=True, lat=lat, lng=lng, source="client")

    # No pin supplied: geocode the address server-side.
    if address:
        try:
            geo = await geocode_and_find_station(address)
        except Exception as e:
            logger.warning("Address geocode failed: %s", e)
            geo = GeocodeResponse()
        if geo.lat is not None and geo.lng is not None and in_australia(geo.lat, geo.lng):
            if centroid is None or haversine(geo.lat, geo.lng, centroid[0], centroid[1]) <= MAX_CENTROID_DISTANCE_KM:
                return LocationCheck(ok=True, lat=geo.lat, lng=geo.lng, formatted_address=geo.formatted_address, source="address")

    if centroid is not None:
        return LocationCheck(ok=True, lat=centroid[0], lng=centroid[1], formatted_address=centroid[2], source="centroid")

    return LocationCheck(ok=True, source="skipped")
