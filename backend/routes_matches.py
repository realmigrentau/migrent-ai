from fastapi import APIRouter, Header
from db import get_supabase_admin
from auth_utils import get_current_user
from matching_engine import calculate_match_score, generate_match_reasons

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("")
def get_matches(postcode: int, authorization: str = Header(...)):
    user = get_current_user(authorization)
    sb = get_supabase_admin()

    seeker_profile = {}
    try:
        profile_res = (
            sb.table("profiles")
            .select("suburb_city, preferred_suburbs, budget_min, budget_max, move_in_date, visa_type")
            .eq("id", str(user.id))
            .execute()
        )
        if profile_res.data:
            seeker_profile = profile_res.data[0]
    except Exception:
        pass

    res = (
        sb.table("listings")
        .select("*")
        .eq("moderation_status", "approved")
        .eq("postcode", postcode)
        .limit(50)
        .execute()
    )

    results = []
    for listing in res.data or []:
        score = calculate_match_score(listing, seeker_profile)
        reasons = generate_match_reasons(listing, seeker_profile)
        results.append({**listing, "match_score": score, "match_reasons": reasons})

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:20]
