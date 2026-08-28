from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel, Field
from typing import Optional
from db import get_supabase_admin
from auth_utils import get_current_user, is_admin_user

router = APIRouter(prefix="/reviews", tags=["reviews"])


# -- Models --

class ReviewCreate(BaseModel):
    deal_id: str
    reviewed_user_id: str
    listing_id: Optional[str] = None
    review_type: str = Field(..., pattern="^(seeker_to_owner|owner_to_seeker)$")
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = Field(None, max_length=2000)
    migrant_friendliness: Optional[int] = Field(None, ge=1, le=5)
    communication_language: Optional[str] = Field(None, max_length=50)
    reliability_rating: Optional[int] = Field(None, ge=1, le=5)
    cleanliness_rating: Optional[int] = Field(None, ge=1, le=5)
    payment_rating: Optional[int] = Field(None, ge=1, le=5)
    photos: Optional[list[str]] = Field(default=[])


class ReviewFlag(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)


# -- POST /reviews --

@router.post("")
def create_review(
    body: ReviewCreate,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    # Verify the deal exists and is completed
    deal_res = sb.table("deals").select("*").eq("id", body.deal_id).execute()
    if not deal_res.data:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal = deal_res.data[0]

    if deal["status"] != "completed":
        raise HTTPException(status_code=400, detail="Reviews can only be submitted for completed deals")

    # Verify reviewer is part of this deal
    if user_id not in (str(deal.get("owner_id", "")), str(deal.get("seeker_id", ""))):
        raise HTTPException(status_code=403, detail="You are not part of this deal")

    # Verify review type matches role
    is_owner = user_id == str(deal.get("owner_id", ""))
    if body.review_type == "owner_to_seeker" and not is_owner:
        raise HTTPException(status_code=400, detail="Only the owner can submit owner_to_seeker reviews")
    if body.review_type == "seeker_to_owner" and is_owner:
        raise HTTPException(status_code=400, detail="Only the seeker can submit seeker_to_owner reviews")

    # Check for duplicate review
    existing = sb.table("reviews").select("id").eq("deal_id", body.deal_id).eq("reviewer_id", user_id).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="You have already reviewed this deal")

    # Build the review row
    review_row = {
        "deal_id": body.deal_id,
        "reviewer_id": user_id,
        "reviewed_user_id": body.reviewed_user_id,
        "listing_id": body.listing_id or deal.get("listing_id"),
        "review_type": body.review_type,
        "rating": body.rating,
        "review_text": body.review_text,
        "photos": body.photos or [],
    }

    # Add migrant-specific fields for seeker_to_owner
    if body.review_type == "seeker_to_owner":
        if body.migrant_friendliness is not None:
            review_row["migrant_friendliness"] = body.migrant_friendliness
        if body.communication_language:
            review_row["communication_language"] = body.communication_language

    # Add owner-specific fields for owner_to_seeker
    if body.review_type == "owner_to_seeker":
        if body.reliability_rating is not None:
            review_row["reliability_rating"] = body.reliability_rating
        if body.cleanliness_rating is not None:
            review_row["cleanliness_rating"] = body.cleanliness_rating
        if body.payment_rating is not None:
            review_row["payment_rating"] = body.payment_rating

    try:
        res = sb.table("reviews").insert(review_row).execute()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create review")

    return res.data[0] if res.data else {"status": "created"}


# -- GET /reviews/listing/{listing_id} --

@router.get("/listing/{listing_id}")
def get_listing_reviews(
    listing_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
):
    sb = get_supabase_admin()
    offset = (page - 1) * per_page

    # Get reviews for this listing
    res = sb.table("reviews") \
        .select("*") \
        .eq("listing_id", listing_id) \
        .eq("flagged", False) \
        .order("created_at", desc=True) \
        .range(offset, offset + per_page - 1) \
        .execute()

    # Get stats
    stats_res = sb.table("listing_review_stats") \
        .select("*") \
        .eq("listing_id", listing_id) \
        .execute()

    stats = stats_res.data[0] if stats_res.data else {
        "review_count": 0,
        "avg_rating": 0,
        "avg_migrant_friendliness": None,
        "positive_count": 0,
    }

    # Enrich reviews with reviewer info
    reviews = res.data or []
    reviewer_ids = list(set(r["reviewer_id"] for r in reviews))
    profiles = {}
    if reviewer_ids:
        prof_res = sb.table("profiles") \
            .select("id, name, preferred_name, custom_pfp") \
            .in_("id", reviewer_ids) \
            .execute()
        for p in (prof_res.data or []):
            profiles[p["id"]] = p

    enriched = []
    for r in reviews:
        prof = profiles.get(r["reviewer_id"], {})
        enriched.append({
            **r,
            "reviewer_name": prof.get("preferred_name") or prof.get("name") or "Anonymous",
            "reviewer_photo": prof.get("custom_pfp"),
        })

    return {
        "reviews": enriched,
        "stats": stats,
        "page": page,
        "per_page": per_page,
    }


# -- GET /reviews/user/{user_id} --

@router.get("/user/{user_id}")
def get_user_reviews(
    user_id: str,
    review_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
):
    sb = get_supabase_admin()
    offset = (page - 1) * per_page

    query = sb.table("reviews") \
        .select("*") \
        .eq("reviewed_user_id", user_id) \
        .eq("flagged", False)

    if review_type:
        query = query.eq("review_type", review_type)

    res = query.order("created_at", desc=True) \
        .range(offset, offset + per_page - 1) \
        .execute()

    # Get user stats
    stats_res = sb.table("user_review_stats") \
        .select("*") \
        .eq("reviewed_user_id", user_id) \
        .execute()

    stats = {}
    for s in (stats_res.data or []):
        stats[s["review_type"]] = {
            "review_count": s["review_count"],
            "avg_rating": float(s["avg_rating"]) if s["avg_rating"] else 0,
        }

    # Enrich with reviewer info
    reviews = res.data or []
    reviewer_ids = list(set(r["reviewer_id"] for r in reviews))
    profiles = {}
    if reviewer_ids:
        prof_res = sb.table("profiles") \
            .select("id, name, preferred_name, custom_pfp") \
            .in_("id", reviewer_ids) \
            .execute()
        for p in (prof_res.data or []):
            profiles[p["id"]] = p

    enriched = []
    for r in reviews:
        prof = profiles.get(r["reviewer_id"], {})
        enriched.append({
            **r,
            "reviewer_name": prof.get("preferred_name") or prof.get("name") or "Anonymous",
            "reviewer_photo": prof.get("custom_pfp"),
        })

    return {
        "reviews": enriched,
        "stats": stats,
        "page": page,
        "per_page": per_page,
    }


# -- GET /reviews/deal/{deal_id} --

@router.get("/deal/{deal_id}")
def get_deal_reviews(
    deal_id: str,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    # Verify user is part of deal
    deal_res = sb.table("deals").select("owner_id, seeker_id, listing_id, status").eq("id", deal_id).execute()
    if not deal_res.data:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal = deal_res.data[0]
    if user_id not in (str(deal.get("owner_id", "")), str(deal.get("seeker_id", ""))):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get existing reviews for this deal
    reviews_res = sb.table("reviews").select("*").eq("deal_id", deal_id).execute()

    # Get profile info for the other party
    other_id = str(deal["seeker_id"]) if user_id == str(deal["owner_id"]) else str(deal["owner_id"])
    prof_res = sb.table("profiles").select("id, name, preferred_name, custom_pfp").eq("id", other_id).execute()
    other_profile = prof_res.data[0] if prof_res.data else {}

    # Get listing info
    listing = {}
    if deal.get("listing_id"):
        listing_res = sb.table("listings").select("id, title, address, postcode, weekly_price").eq("id", deal["listing_id"]).execute()
        listing = listing_res.data[0] if listing_res.data else {}

    my_review = None
    other_review = None
    for r in (reviews_res.data or []):
        if str(r["reviewer_id"]) == user_id:
            my_review = r
        else:
            other_review = r

    is_owner = user_id == str(deal["owner_id"])

    return {
        "deal": {
            "id": deal_id,
            "status": deal["status"],
            "listing_id": deal.get("listing_id"),
            "owner_id": str(deal["owner_id"]),
            "seeker_id": str(deal["seeker_id"]),
        },
        "listing": listing,
        "other_user": {
            "id": other_id,
            "name": other_profile.get("preferred_name") or other_profile.get("name") or "User",
            "photo": other_profile.get("custom_pfp"),
        },
        "my_review": my_review,
        "other_review": other_review,
        "is_owner": is_owner,
        "can_review": deal["status"] == "completed" and my_review is None,
    }


# -- POST /reviews/{review_id}/flag --

@router.post("/{review_id}/flag")
def flag_review(
    review_id: str,
    body: ReviewFlag,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    # Check review exists
    res = sb.table("reviews").select("id, reviewer_id").eq("id", review_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Review not found")

    # Can't flag your own review
    if str(res.data[0]["reviewer_id"]) == user_id:
        raise HTTPException(status_code=400, detail="Cannot flag your own review")

    try:
        sb.table("reviews").update({
            "flagged": True,
            "flag_reason": body.reason,
        }).eq("id", review_id).execute()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to flag review")

    return {"status": "flagged"}


# -- Admin: PATCH /reviews/{review_id}/moderate --

@router.patch("/{review_id}/moderate")
def moderate_review(
    review_id: str,
    authorization: str = Header(...),
    action: str = Query(..., pattern="^(approve|remove)$"),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb_admin = get_supabase_admin()

    # Admin status comes from the database, never from user_metadata. This
    # previously read user_meta["is_superadmin"], which any signed-in user can
    # set on themselves, so anyone could unflag or remove any review.
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")

    update_data = {
        "moderated": True,
        "moderated_at": "now()",
        "moderated_by": user_id,
    }

    if action == "approve":
        update_data["flagged"] = False
        update_data["flag_reason"] = None
    elif action == "remove":
        update_data["flagged"] = True

    try:
        sb_admin.table("reviews").update(update_data).eq("id", review_id).execute()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to moderate review")

    return {"status": action}
