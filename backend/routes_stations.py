"""
Station search and autocomplete endpoints.

Endpoints:
  GET /stations/search?q=kellyville&city=Sydney  - Autocomplete station names
  GET /stations                                   - List all stations (optional city filter)
  GET /stations/nearby?lat=X&lng=Y&radius=5       - Find stations near a point
"""

import math
import logging
from fastapi import APIRouter, Query
from typing import Optional
from db import get_supabase_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stations", tags=["stations"])


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in km between two lat/lng points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/search")
def search_stations(
    q: str = Query(..., min_length=1, description="Station name query"),
    city: Optional[str] = None,
    limit: int = 10,
):
    """Autocomplete station names. Returns matching stations sorted by name."""
    if limit < 1:
        limit = 1
    if limit > 50:
        limit = 50

    sb = get_supabase_admin()
    query = sb.table("stations").select("id, name, lat, lng, city, line")
    query = query.ilike("name", f"%{q}%")

    if city:
        query = query.eq("city", city)

    query = query.order("name").limit(limit)
    res = query.execute()
    return res.data or []


@router.get("/nearby")
def nearby_stations(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_km: float = Query(3.0, description="Search radius in km"),
    limit: int = 5,
):
    """Find stations near a lat/lng point. Returns stations with walk time."""
    sb = get_supabase_admin()

    # Fetch stations in a rough bounding box first (for performance)
    delta = radius_km / 111.0  # rough degrees per km
    query = (
        sb.table("stations")
        .select("id, name, lat, lng, city, line")
        .gte("lat", lat - delta)
        .lte("lat", lat + delta)
        .gte("lng", lng - delta)
        .lte("lng", lng + delta)
    )
    res = query.execute()

    # Calculate actual distances and filter
    results = []
    for station in (res.data or []):
        dist = haversine(lat, lng, station["lat"], station["lng"])
        if dist <= radius_km:
            walk_min = round(dist / 5 * 60)  # 5 km/h walking speed
            results.append({
                **station,
                "distance_km": round(dist, 2),
                "walk_minutes": walk_min,
            })

    # Sort by distance and limit
    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]


@router.get("")
def list_stations(
    city: Optional[str] = None,
    limit: int = 200,
):
    """List all stations, optionally filtered by city."""
    if limit < 1:
        limit = 1
    if limit > 500:
        limit = 500

    sb = get_supabase_admin()
    query = sb.table("stations").select("id, name, lat, lng, city, line")

    if city:
        query = query.eq("city", city)

    query = query.order("name").limit(limit)
    res = query.execute()
    return res.data or []
