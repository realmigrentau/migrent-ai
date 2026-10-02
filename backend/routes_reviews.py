"""
Reviews, as the public site reads them (MIGRENT_MASTER_AUDIT MIG-011).

    GET  /reviews/listing/{listing_id}   renters' reviews of a home
    GET  /reviews/user/{user_id}         renters' reviews of a host
    POST /reviews/{review_id}/flag       report a review to Migrent
    PATCH /reviews/{review_id}/moderate  admin: hide or restore

Reviews are written in Migrent Hub after a real tenancy or stay
(routes_hub_reviews.py). Only renters' reviews of homes and hosts are ever
public; hosts' reviews of renters are shown only to hosts deciding on that
renter's application. reviews_core.py has the rules.
"""

from fastapi import APIRouter, Header, HTTPException, Query, Request
from pydantic import BaseModel, Field

from auth_utils import get_active_user, get_current_user, is_admin_user, require_live_session
from db import get_supabase_admin
from limiter import limiter
from reviews_core import host_reviews, listing_reviews, present, stats

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewFlag(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)


def _page(rows: list, page: int, per_page: int) -> list:
    start = (page - 1) * per_page
    return rows[start : start + per_page]


@router.post("")
def create_review_retired():
    raise HTTPException(status_code=410, detail="Reviews are written in Migrent Hub after a tenancy or a stay.")


@router.get("/listing/{listing_id}")
def get_listing_reviews(
    listing_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
):
    sb = get_supabase_admin()
    rows = listing_reviews(sb, listing_id)
    return {"reviews": present(sb, _page(rows, page, per_page)), "stats": stats(rows), "page": page, "per_page": per_page}


@router.get("/user/{user_id}")
def get_user_reviews(
    user_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
):
    """Renters' reviews of this person as a host. Hosts' reviews of renters
    are not public, so a renter's page shows none here."""
    sb = get_supabase_admin()
    rows = host_reviews(sb, user_id)
    s = stats(rows)
    return {
        "reviews": present(sb, _page(rows, page, per_page)),
        "stats": {"seeker_to_owner": {"review_count": s["review_count"], "avg_rating": s["avg_rating"]}} if rows else {},
        "page": page,
        "per_page": per_page,
    }


@router.get("/deal/{deal_id}")
def get_deal_reviews_retired(deal_id: str):
    raise HTTPException(status_code=410, detail="Reviews are written in Migrent Hub after a tenancy or a stay.")


@router.post("/{review_id}/flag")
@limiter.limit("10/hour")
def flag_review(request: Request, review_id: str, body: ReviewFlag, authorization: str = Header(...)):
    """Send a review to Migrent's report queue. It stays up until an admin
    decides, so the person reviewed cannot hide a review by flagging it."""
    user = get_active_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()
    res = sb.table("reviews").select("id, reviewer_id").eq("id", review_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Review not found")
    if str(res.data[0]["reviewer_id"]) == user_id:
        raise HTTPException(status_code=400, detail="You can't report your own review")
    existing = sb.table("reports").select("id").eq("reporter_id", user_id).eq("item_type", "review").eq("item_id", review_id).in_("status", ["pending", "reviewing"]).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="You have already reported this review.")
    try:
        sb.table("reports").insert(
            {
                "reporter_id": user_id,
                "source": "user",
                "item_type": "review",
                "item_id": review_id,
                "listing_id": review_id,
                "reason": "Review reported",
                "details": body.reason,
                "status": "pending",
            }
        ).execute()
    except Exception:
        raise HTTPException(status_code=500, detail="That report didn't send. Please try again.")
    return {"status": "reported"}


@router.patch("/{review_id}/moderate")
def moderate_review(
    review_id: str,
    authorization: str = Header(...),
    action: str = Query(..., pattern="^(approve|remove)$"),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()
    # Admin status comes from the database, never from user_metadata.
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    require_live_session(authorization, user_id)
    patch = {"moderated": True, "moderated_at": "now()", "moderated_by": user_id, "flagged": action == "remove"}
    if action == "approve":
        patch["flag_reason"] = None
    try:
        sb.table("reviews").update(patch).eq("id", review_id).execute()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to moderate review")
    return {"status": action}
