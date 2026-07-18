"""
Suburb stats endpoints for suburb report pages.
Public endpoints - no auth required.
"""

import logging
from fastapi import APIRouter, HTTPException

from db import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/suburb", tags=["suburbs"])


@router.get("/{slug}/stats")
def get_suburb_stats(slug: str):
    """Get suburb statistics by slug (e.g. 'kellyville')."""
    supabase = get_supabase()

    result = supabase.table("suburbs").select("*").eq("slug", slug.lower()).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Suburb not found")

    suburb = result.data[0]

    # Count live listings in this suburb
    listings_result = (
        supabase.table("listings")
        .select("id", count="exact")
        .ilike("suburb", suburb["name"])
        .execute()
    )
    live_count = listings_result.count if listings_result.count else 0

    return {
        "suburb": suburb,
        "live_listings_count": live_count,
    }


@router.get("/")
def list_suburbs():
    """List all suburbs with basic info for sitemap/index."""
    supabase = get_supabase()

    result = (
        supabase.table("suburbs")
        .select("slug, name, state, median_rent_room, vacancy_rate, safety_score, migrant_pct, top_nationalities")
        .order("name")
        .execute()
    )

    return {"suburbs": result.data or []}
