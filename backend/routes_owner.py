import os
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Header, Query
from db import get_supabase_admin
from auth_utils import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/owner", tags=["owner"])


def _verify_owner(authorization: str):
    """Validate token and return user id."""
    user = get_current_user(authorization)
    return str(user.id)


# -- GET /owner/metrics --


@router.get("/metrics")
def get_owner_metrics(authorization: str = Header(...)):
    user_id = _verify_owner(authorization)
    sb = get_supabase_admin()

    # Active listings count
    listings_res = sb.table("listings").select("id, weekly_price").eq("owner_id", user_id).execute()
    listings = listings_res.data or []
    active_listings = len(listings)

    # Bookings data
    bookings_res = sb.table("bookings").select("status, created_at, total_price, updated_at").eq("owner_id", user_id).execute()
    bookings = bookings_res.data or []

    # Pending requests
    pending_requests = sum(1 for b in bookings if b["status"] == "PENDING_OWNER")

    # Earnings this month (from PAID/COMPLETED bookings in current month)
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    earnings_this_month = 0.0
    for b in bookings:
        if b["status"] in ("PAID", "COMPLETED"):
            updated = datetime.fromisoformat(b["updated_at"].replace("Z", "+00:00")).replace(tzinfo=None)
            if updated >= month_start:
                earnings_this_month += float(b.get("total_price", 0) or 0)

    # Response rate (responded bookings / total that needed response)
    needs_response = [b for b in bookings if b["status"] in (
        "PENDING_OWNER", "OWNER_ACCEPTED", "OWNER_DECLINED", "PAID", "COMPLETED"
    )]
    responded = [b for b in bookings if b["status"] in (
        "OWNER_ACCEPTED", "OWNER_DECLINED", "PAID", "COMPLETED"
    )]
    # None, not 100: a host with no requests has no response rate to report.
    response_rate = round((len(responded) / len(needs_response) * 100)) if needs_response else None

    return {
        "active_listings": active_listings,
        "pending_requests": pending_requests,
        "earnings_this_month": round(earnings_this_month, 2),
        "response_rate": response_rate,
    }


# -- GET /owner/bookings --


@router.get("/bookings")
def get_owner_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    status: str = Query(None),
    authorization: str = Header(...),
):
    user_id = _verify_owner(authorization)
    sb = get_supabase_admin()

    query = sb.table("bookings").select("*").eq("owner_id", user_id).order("created_at", desc=True)

    if status:
        query = query.eq("status", status)

    # Pagination
    offset = (page - 1) * per_page
    query = query.range(offset, offset + per_page - 1)

    res = query.execute()
    bookings = res.data or []

    # Enrich with listing + seeker data
    for booking in bookings:
        listing_res = sb.table("listings").select("title, address, city, weekly_price, images").eq("id", booking["listing_id"]).execute()
        if listing_res.data:
            booking["listing"] = listing_res.data[0]

        seeker_res = sb.table("profiles").select("name, custom_pfp, verified").eq("id", booking["seeker_id"]).execute()
        if seeker_res.data:
            booking["seeker"] = seeker_res.data[0]

    # Total count for pagination
    count_query = sb.table("bookings").select("id", count="exact").eq("owner_id", user_id)
    if status:
        count_query = count_query.eq("status", status)
    count_res = count_query.execute()
    total = count_res.count if hasattr(count_res, "count") and count_res.count is not None else len(bookings)

    return {
        "bookings": bookings,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


# -- GET /owner/activity --


@router.get("/activity")
def get_owner_activity(
    limit: int = Query(10, ge=1, le=50),
    authorization: str = Header(...),
):
    user_id = _verify_owner(authorization)
    sb = get_supabase_admin()

    activities = []

    # Recent bookings (all statuses, last 30 days)
    thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
    bookings_res = (
        sb.table("bookings")
        .select("id, status, created_at, updated_at, listing_id, seeker_id, total_price, booking_type")
        .eq("owner_id", user_id)
        .gte("created_at", thirty_days_ago)
        .order("updated_at", desc=True)
        .limit(limit)
        .execute()
    )

    for b in bookings_res.data or []:
        # Get seeker name
        seeker_name = "A seeker"
        seeker_res = sb.table("profiles").select("name").eq("id", b["seeker_id"]).execute()
        if seeker_res.data and seeker_res.data[0].get("name"):
            seeker_name = seeker_res.data[0]["name"]

        # Get listing title
        listing_title = "your listing"
        listing_res = sb.table("listings").select("title, address").eq("id", b["listing_id"]).execute()
        if listing_res.data:
            listing_title = listing_res.data[0].get("title") or listing_res.data[0].get("address", "your listing")

        status = b["status"]
        timestamp = b["updated_at"] or b["created_at"]

        if status == "PENDING_OWNER":
            activities.append({
                "id": b["id"],
                "type": "booking_request",
                "title": f"New request from {seeker_name}",
                "description": listing_title,
                "timestamp": timestamp,
                "status": "pending",
            })
        elif status == "OWNER_ACCEPTED":
            activities.append({
                "id": b["id"],
                "type": "booking_accepted",
                "title": f"You accepted {seeker_name}'s request",
                "description": f"{listing_title} - awaiting payment",
                "timestamp": timestamp,
                "status": "success",
            })
        elif status == "PAID":
            amount = b.get("total_price", 0)
            activities.append({
                "id": b["id"],
                "type": "payment_received",
                "title": f"Booking confirmed - ${amount}",
                "description": f"{seeker_name} for {listing_title}",
                "timestamp": timestamp,
                "status": "success",
            })
        elif status == "OWNER_DECLINED":
            activities.append({
                "id": b["id"],
                "type": "booking_declined",
                "title": f"Declined request from {seeker_name}",
                "description": listing_title,
                "timestamp": timestamp,
                "status": "declined",
            })
        elif status == "COMPLETED":
            activities.append({
                "id": b["id"],
                "type": "booking_completed",
                "title": f"Booking completed",
                "description": f"{seeker_name} - {listing_title}",
                "timestamp": timestamp,
                "status": "success",
            })

    # Recent listing views (check if listings table has a views field)
    listings_res = sb.table("listings").select("id, title, address, created_at").eq("owner_id", user_id).order("created_at", desc=True).limit(3).execute()
    for l in listings_res.data or []:
        title = l.get("title") or l.get("address", "Listing")
        activities.append({
            "id": f"listing-{l['id']}",
            "type": "listing_active",
            "title": f"Listing active: {title}",
            "description": "Your listing is live and visible to seekers",
            "timestamp": l["created_at"],
            "status": "info",
        })

    # Sort by timestamp desc and limit
    activities.sort(key=lambda a: a["timestamp"], reverse=True)
    return {"activities": activities[:limit]}
