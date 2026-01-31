import random
from fastapi import APIRouter, Header
from db import get_supabase
from routes_listings import derive_city, get_current_user

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("")
def get_matches(postcode: int, authorization: str = Header(...)):
    get_current_user(authorization)
    city = derive_city(postcode)
    sb = get_supabase()

    query = sb.table("listings").select("*")
    if city:
        query = query.eq("city", city)
    query = query.limit(10)

    res = query.execute()
    results = []
    for listing in res.data:
        results.append({
            "listing": listing,
            "match_score": random.randint(0, 100),
        })
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results
