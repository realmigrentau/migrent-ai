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
