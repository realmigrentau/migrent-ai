"""
Migrent Hub - reviews after a tenancy or a stay (MIGRENT_MASTER_AUDIT MIG-011).

    GET  /hub/reviews/pending   tenancies and stays you can review now
    POST /hub/reviews           write one

The rules (who, when, what is shown to whom) live in reviews_core.py.
"""

import logging
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from db import get_supabase_admin
from hub_common import (
    fetch_listings,
    fetch_people,
    hub_actor,
    hub_table_error,
    listing_card,
    notify_user,
    require_writable,
)
from limiter import limiter
from reviews_core import (
    HOST_REVIEW,
    MIN_TENANCY_DAYS,
    RENTER_REVIEW,
    STAY_STATUSES,
    is_open,
    stay_window,
    tenancy_window,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["hub-reviews"])


def _contexts(sb, actor_id: str) -> list[dict]:
    """Every tenancy and stay the person was part of, in one shape:
    {kind, id, listing_id, renter_id, owner_id, window, ends}."""
    today = date.today()
    out: list[dict] = []
    try:
        tenancies = sb.table("tenancies").select("id, listing_id, owner_id, renter_id, status, start_date, end_date").or_(f"renter_id.eq.{actor_id},owner_id.eq.{actor_id}").execute().data or []
    except Exception:
        tenancies = []
    for t in tenancies:
        out.append({"kind": "tenancy", "id": str(t["id"]), "listing_id": str(t["listing_id"]), "renter_id": str(t["renter_id"]), "owner_id": str(t["owner_id"]), "window": tenancy_window(t, today)})
    try:
        stays = sb.table("bookings").select("id, listing_id, owner_id, seeker_id, status, check_in_date, check_out_date").or_(f"seeker_id.eq.{actor_id},owner_id.eq.{actor_id}").execute().data or []
    except Exception:
        stays = []
    for b in stays:
        out.append({"kind": "stay", "id": str(b["id"]), "listing_id": str(b["listing_id"]), "renter_id": str(b["seeker_id"]), "owner_id": str(b["owner_id"]), "window": stay_window(b, today)})
    return out


def _already_reviewed(sb, actor_id: str) -> set[str]:
    rows = sb.table("reviews").select("tenancy_id, booking_id").eq("reviewer_id", actor_id).execute().data or []
    done = set()
    for r in rows:
        if r.get("tenancy_id"):
            done.add(f"tenancy:{r['tenancy_id']}")
        if r.get("booking_id"):
            done.add(f"stay:{r['booking_id']}")
    return done


@router.get("/reviews/pending")
def pending_reviews(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    today = date.today()
    try:
        done = _already_reviewed(sb, actor.id)
        open_ = [c for c in _contexts(sb, actor.id) if is_open(c["window"], today) and f"{c['kind']}:{c['id']}" not in done]
    except Exception as e:
        raise hub_table_error(e)
    listings = fetch_listings(sb, [c["listing_id"] for c in open_])
    people = fetch_people(sb, [c["owner_id"] if c["renter_id"] == actor.id else c["renter_id"] for c in open_])
    items = []
    for c in open_:
        as_renter = c["renter_id"] == actor.id
        other = c["owner_id"] if as_renter else c["renter_id"]
        items.append(
            {
                "kind": c["kind"],
                "id": c["id"],
                "direction": RENTER_REVIEW if as_renter else HOST_REVIEW,
                "listing": listing_card(listings.get(c["listing_id"]), viewer_is_owner=not as_renter),
                "other": people.get(other) or {"id": other, "name": "Migrent member", "avatar_url": None},
                "closes_on": None if c["window"][1] == date.max else c["window"][1].isoformat(),
            }
        )
    return {"pending": items}


class ReviewBody(BaseModel):
    kind: str
    id: str = Field(..., min_length=36, max_length=36)
    rating: int = Field(..., ge=1, le=5)
    text: Optional[str] = Field(None, max_length=2000)
    # A renter reviewing a host: how welcoming they were to someone new.
    migrant_friendliness: Optional[int] = Field(None, ge=1, le=5)
    # A host reviewing a renter.
    cleanliness_rating: Optional[int] = Field(None, ge=1, le=5)
    payment_rating: Optional[int] = Field(None, ge=1, le=5)

    @field_validator("kind")
    @classmethod
    def _kind(cls, v: str) -> str:
        if v not in ("tenancy", "stay"):
            raise ValueError("Choose a tenancy or a stay")
        return v


@router.post("/reviews")
@limiter.limit("20/hour")
def write_review(request: Request, body: ReviewBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    from auth_utils import get_active_user

    get_active_user(authorization)  # suspended accounts cannot write reviews
    sb = get_supabase_admin()
    context = next((c for c in _contexts(sb, actor.id) if c["kind"] == body.kind and c["id"] == body.id.lower()), None)
    if not context:
        raise HTTPException(status_code=404, detail="We couldn't find that tenancy or stay")
    today = date.today()
    window = context["window"]
    if not window:
        raise HTTPException(status_code=400, detail="This can't be reviewed")
    if today < window[0]:
        when = "once you have lived there a month or it has ended" if body.kind == "tenancy" else "after the stay"
        raise HTTPException(status_code=400, detail=f"You can write a review {when}.")
    if today > window[1]:
        raise HTTPException(status_code=400, detail="The time to review this has passed.")
    if f"{body.kind}:{context['id']}" in _already_reviewed(sb, actor.id):
        raise HTTPException(status_code=409, detail="You have already reviewed this.")

    as_renter = context["renter_id"] == actor.id
    from routes_messages import _strip_markup

    row = {
        "reviewer_id": actor.id,
        "reviewed_user_id": context["owner_id"] if as_renter else context["renter_id"],
        "listing_id": context["listing_id"],
        "review_type": RENTER_REVIEW if as_renter else HOST_REVIEW,
        "tenancy_id": context["id"] if body.kind == "tenancy" else None,
        "booking_id": context["id"] if body.kind == "stay" else None,
        "rating": body.rating,
        "review_text": (_strip_markup(body.text or "").strip() or None),
        "photos": [],
    }
    if as_renter:
        row["migrant_friendliness"] = body.migrant_friendliness
    else:
        row["cleanliness_rating"] = body.cleanliness_rating
        row["payment_rating"] = body.payment_rating
    try:
        created = sb.table("reviews").insert(row).execute().data[0]
    except Exception as e:
        raise hub_table_error(e)

    # Tell the other side, without saying what was written: they see it once
    # they have reviewed too, or after the blind period.
    other = row["reviewed_user_id"]
    name = (fetch_people(sb, [actor.id]).get(actor.id) or {}).get("name") or "Someone"
    first = name.split(" ")[0]
    what = "your tenancy" if body.kind == "tenancy" else "the stay"
    notify_user(
        sb,
        other,
        "review_received",
        f"{first} reviewed {what}",
        "Write your own review to see theirs. Reviews appear once you have both written one, or after 14 days.",
        "/",
        entity_type="review",
        entity_id=created["id"],
    )
    return {"review": {"id": created["id"], "kind": body.kind, "context_id": context["id"]}}


def send_review_prompts(sb, today: Optional[date] = None) -> list[str]:
    """Daily: ask both sides for a review when a tenancy reaches a month,
    when one ends, and the day after a stay. Each person is asked once per
    tenancy or stay. Returns the context ids prompted."""
    today = today or date.today()
    prompted: list[str] = []
    month_ago = (today - timedelta(days=MIN_TENANCY_DAYS)).isoformat()
    yesterday = (today - timedelta(days=1)).isoformat()
    contexts: list[dict] = []
    try:
        for t in sb.table("tenancies").select("id, listing_id, owner_id, renter_id, status, start_date, end_date").eq("status", "active").eq("start_date", month_ago).execute().data or []:
            contexts.append({"kind": "tenancy", **t, "renter": t["renter_id"]})
        for t in sb.table("tenancies").select("id, listing_id, owner_id, renter_id, status, start_date, end_date").eq("status", "ended").eq("end_date", yesterday).execute().data or []:
            contexts.append({"kind": "tenancy", **t, "renter": t["renter_id"]})
        for b in sb.table("bookings").select("id, listing_id, owner_id, seeker_id, status, check_out_date").in_("status", list(STAY_STATUSES)).eq("check_out_date", yesterday).execute().data or []:
            contexts.append({"kind": "stay", **b, "renter": b["seeker_id"]})
    except Exception:
        logger.exception("review prompts: could not load tenancies and stays")
        return prompted
    for c in contexts:
        listing = fetch_listings(sb, [c["listing_id"]]).get(str(c["listing_id"])) or {}
        home = listing.get("title") or listing.get("suburb") or "your home"
        for uid in (str(c["renter"]), str(c["owner_id"])):
            try:
                asked = sb.table("notifications").select("id").eq("user_id", uid).eq("type", "review_prompt").eq("entity_id", str(c["id"])).limit(1).execute().data
                if asked:
                    continue
                reviewed = sb.table("reviews").select("id").eq("reviewer_id", uid).eq("tenancy_id" if c["kind"] == "tenancy" else "booking_id", str(c["id"])).limit(1).execute().data
                if reviewed:
                    continue
            except Exception:
                continue
            renter = uid == str(c["renter"])
            title = f"How was {home}?" if renter else f"How was your renter at {home}?"
            text = (
                "Your review helps the next person who is new to Australia choose well. It takes a minute."
                if renter
                else "A short review helps other hosts. Only hosts the renter applies to will see it."
            )
            notify_user(sb, uid, "review_prompt", title, text, "/", entity_type=c["kind"], entity_id=str(c["id"]))
        prompted.append(str(c["id"]))
    return prompted
