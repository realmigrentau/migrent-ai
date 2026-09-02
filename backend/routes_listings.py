import logging
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field
from supabase import create_client

from auth_utils import get_current_user, is_admin_user
from db import SUPABASE_ANON_KEY, SUPABASE_URL, get_supabase_admin
from limiter import limiter
from listing_lifecycle import (
    OWNER_SUBMITTABLE,
    STATUS_APPROVED,
    STATUS_CHANGES,
    STATUS_DELETED,
    STATUS_DRAFT,
    STATUS_EXPIRED,
    STATUS_PAUSED,
    STATUS_PENDING,
    STATUS_REJECTED,
    AvailabilityError,
    availability_filter,
    public_filter,
    record_event,
    validate_availability_window,
    validate_search_dates,
)
from matching_engine import calculate_match_score, generate_match_reasons
from models import ListingCreate, ListingUpdate
from public_dto import (
    listing_public_state,
    to_owner_listing,
    to_public_listing,
)
from routes_geocode import geocode_and_find_station, validate_listing_location
from spam_detection import apply_spam_result, calculate_spam_score, notify_founder_spam

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/listings", tags=["listings"])

# Every column the server needs to build a public card or page. The DTO layer
# strips what the viewer may not see; selecting an explicit list keeps the
# payload small on the hottest endpoint on the site.
SEARCH_COLUMNS = (
    "id, owner_id, title, address, suburb, city, postcode, weekly_price, daily_price, "
    "description, images, property_type, place_type, room_type, bedrooms, beds, bathrooms, "
    "bathroom_type, max_guests, furnished, bills_included, parking, air_conditioning, "
    "pets_allowed, couples_ok, gender_preference, instant_book, instant_book_enabled, "
    "available_from, available_to, min_stay, min_stay_weeks, max_stay_weeks, latitude, "
    "longitude, nearest_transport, station_distance_min, moderation_status, hidden_at, created_at"
)

OWNER_PROFILE_COLUMNS = "id, public_id, name, preferred_name, custom_pfp, bio, about_me, badges, created_at"
VERIFICATION_COLUMNS = "user_id, email_verified, phone_verified, id_status, fully_verified, id_reviewed_at"


def derive_city(postcode: int) -> Optional[str]:
    """Map Australian postcodes to their capital city/region."""
    if 800 <= postcode <= 999:
        return "Darwin"
    if 1000 <= postcode <= 2599:
        return "Sydney"
    if 2600 <= postcode <= 2620:
        return "Canberra"
    if 2621 <= postcode <= 2899:
        return "Sydney"  # Regional NSW
    if 2900 <= postcode <= 2999:
        return "Canberra"  # ACT surrounds
    if 3000 <= postcode <= 3999:
        return "Melbourne"
    if 4000 <= postcode <= 4999:
        return "Brisbane"
    if 5000 <= postcode <= 5999:
        return "Adelaide"
    if 6000 <= postcode <= 6999:
        return "Perth"
    if 7000 <= postcode <= 7999:
        return "Hobart"
    return None


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------


def _optional_viewer(authorization: Optional[str]):
    if not authorization:
        return None
    try:
        return get_current_user(authorization)
    except HTTPException:
        return None


def _load_owner_context(sb, owner_ids: list[str]) -> tuple[dict, dict]:
    """Batch-load owner profiles and verification rows keyed by owner id."""
    profiles: dict = {}
    verifications: dict = {}
    ids = [i for i in {str(o) for o in owner_ids if o}]
    if not ids:
        return profiles, verifications
    try:
        pr = sb.table("profiles").select(OWNER_PROFILE_COLUMNS).in_("id", ids).execute()
        profiles = {str(p["id"]): p for p in (pr.data or [])}
    except Exception:
        logger.exception("Failed to load owner profiles")
    try:
        vr = sb.table("owner_verification").select(VERIFICATION_COLUMNS).in_("user_id", ids).execute()
        verifications = {str(v["user_id"]): v for v in (vr.data or [])}
    except Exception:
        logger.exception("Failed to load owner verification")
    return profiles, verifications


def _public_rows(sb, rows: list[dict], today: Optional[date] = None) -> list[dict]:
    profiles, verifications = _load_owner_context(sb, [r.get("owner_id") for r in rows])
    out = []
    for r in rows:
        oid = str(r.get("owner_id"))
        out.append(
            to_public_listing(
                r,
                owner_profile=profiles.get(oid),
                owner_verification=verifications.get(oid),
                today=today,
            )
        )
    return out


def _availability_or_400(available_from, available_to, *, allow_past_start: bool):
    try:
        return validate_availability_window(available_from, available_to, allow_past_start=allow_past_start)
    except AvailabilityError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


@router.post("")
@limiter.limit("10/hour")
async def create_listing(
    request: Request,
    listing: ListingCreate,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_meta = user.user_metadata or {}
    user_type = user_meta.get("user_type") or user_meta.get("type")
    # Allow owner type OR users without a type set (e.g. Google OAuth users)
    if user_type and user_type != "owner":
        raise HTTPException(status_code=403, detail="Only owners can create listings")

    # Verification gates PUBLISHING, not creating. An unverified owner can
    # build and save a draft, which no search, public page or booking can
    # reach, and submit it once verified via POST /listings/{id}/submit.
    from routes_owner_verification import check_owner_verified

    is_verified = check_owner_verified(str(user.id))

    _availability_or_400(listing.available_from, listing.available_to, allow_past_start=True)

    city = listing.city or derive_city(listing.postcode)

    sb = get_supabase_admin()
    row = {
        "address": listing.address,
        "suburb": listing.suburb,
        "postcode": listing.postcode,
        "city": city,
        "weekly_price": listing.weekly_price,
        "description": listing.description,
        "images": listing.images,
        "owner_id": str(user.id),
        "moderation_status": STATUS_PENDING if is_verified else STATUS_DRAFT,
    }

    extended_fields = {
        "title": listing.title,
        "property_type": listing.property_type,
        "place_type": listing.place_type,
        "max_guests": listing.max_guests,
        "bedrooms": listing.bedrooms,
        "beds": listing.beds,
        "bathrooms": listing.bathrooms,
        "bathroom_type": listing.bathroom_type,
        "who_else_lives_here": listing.who_else_lives_here,
        "total_other_people": listing.total_other_people,
        "furnished": listing.furnished,
        "bills_included": listing.bills_included,
        "parking": listing.parking,
        "highlights": listing.highlights,
        "weekly_discount": listing.weekly_discount,
        "monthly_discount": listing.monthly_discount,
        "bond": listing.bond,
        "no_smoking": listing.no_smoking,
        "quiet_hours": listing.quiet_hours,
        "tenant_prefs": listing.tenant_prefs,
        "min_stay": listing.min_stay,
        "security_cameras": listing.security_cameras,
        "security_cameras_location": listing.security_cameras_location,
        "weapons_on_property": listing.weapons_on_property,
        "weapons_explanation": listing.weapons_explanation,
        "other_safety_details": listing.other_safety_details,
        "available_from": listing.available_from,
        "available_to": listing.available_to,
        "instant_book": listing.instant_book,
        "internet_included": listing.internet_included,
        "internet_speed": listing.internet_speed,
        "pets_allowed": listing.pets_allowed,
        "pet_details": listing.pet_details,
        "air_conditioning": listing.air_conditioning,
        "laundry": listing.laundry,
        "dishwasher": listing.dishwasher,
        "nearest_transport": listing.nearest_transport,
        "neighbourhood_vibe": listing.neighbourhood_vibe,
        "gender_preference": listing.gender_preference,
        "couples_ok": listing.couples_ok,
    }
    for key, value in extended_fields.items():
        if value is not None:
            row[key] = value

    # Location. If the client sent coordinates, they must agree with the
    # suburb and postcode; otherwise geocode the address server-side.
    location = await validate_listing_location(
        address=listing.address,
        suburb=listing.suburb,
        postcode=listing.postcode,
        latitude=listing.latitude,
        longitude=listing.longitude,
    )
    if not location.ok:
        raise HTTPException(status_code=400, detail=location.reason)
    if location.lat is not None and location.lng is not None:
        row["latitude"] = location.lat
        row["longitude"] = location.lng
        if location.formatted_address:
            row["geocoded_address"] = location.formatted_address

    try:
        res = sb.table("listings").insert(row).execute()
    except Exception:
        logger.exception("Failed to create listing")
        raise HTTPException(status_code=500, detail="Failed to create listing")

    created = res.data[0] if res.data else row

    # Nearest station enrichment for the card (best effort).
    if created.get("id") and row.get("latitude") is not None and not created.get("station_distance_min"):
        try:
            geo = await geocode_and_find_station(listing.address)
            update_data = {}
            if geo.walk_time_minutes is not None:
                update_data["station_distance_min"] = geo.walk_time_minutes
            if geo.nearest_station:
                update_data["nearest_transport"] = f"{geo.nearest_station} - {geo.walk_time_minutes} min walk"
            if update_data:
                sb.table("listings").update(update_data).eq("id", created["id"]).execute()
                created.update(update_data)
        except Exception as e:
            logger.warning("Station lookup failed for listing %s: %s", created.get("id"), e)

    # Spam detection on the new listing
    if created.get("id"):
        try:
            spam_result = calculate_spam_score(
                title=listing.title,
                description=listing.description,
                images=listing.images,
                weekly_price=listing.weekly_price,
                owner_id=str(user.id),
                suburb=listing.suburb,
                listing_id=created["id"],
            )
            apply_spam_result(created["id"], spam_result, str(user.id))

            if spam_result["action"] in ("flag", "hide"):
                owner_name = "Unknown"
                try:
                    profile_res = sb.table("profiles").select("name").eq("id", str(user.id)).execute()
                    if profile_res.data:
                        owner_name = profile_res.data[0].get("name", "Unknown")
                except Exception:
                    pass
                notify_founder_spam(created["id"], spam_result, listing.title, owner_name)

                if spam_result["action"] == "hide":
                    try:
                        from email_bookings import send_listing_under_review_to_owner

                        owner_profile = sb.table("profiles").select("name, email").eq("id", str(user.id)).execute()
                        if owner_profile.data:
                            op = owner_profile.data[0]
                            send_listing_under_review_to_owner(
                                owner_email=op.get("email", ""),
                                owner_name=op.get("name", "there"),
                                listing_title=listing.title or "Your listing",
                            )
                    except Exception as e:
                        logger.warning("Failed to send review email to owner: %s", e)
        except Exception as e:
            logger.warning("Spam detection failed for listing %s: %s", created.get("id"), e)

    record_event(
        sb,
        listing_id=str(created.get("id")),
        actor_id=str(user.id),
        actor_type="owner",
        event_type="submitted" if is_verified else "owner_edited",
        old_status=None,
        new_status=created.get("moderation_status"),
        notes="created",
    )

    out = to_owner_listing(created)
    out["is_draft"] = not is_verified
    return out


# ---------------------------------------------------------------------------
# Owner lifecycle actions
# ---------------------------------------------------------------------------


def _owner_row_or_404(sb, listing_id: str, user_id: str, columns: str = "id, owner_id, moderation_status, available_from, available_to, title") -> dict:
    res = sb.table("listings").select(columns).eq("id", listing_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    row = res.data[0]
    if str(row["owner_id"]) != user_id:
        raise HTTPException(status_code=403, detail="You can only manage your own listings")
    if row.get("moderation_status") == STATUS_DELETED:
        raise HTTPException(status_code=404, detail="Listing not found")
    return row


@router.post("/{listing_id}/submit")
@limiter.limit("20/hour")
def submit_listing_for_review(
    request: Request,
    listing_id: str,
    authorization: str = Header(...),
):
    """Move an owner's draft listing into the moderation queue.

    This is where verification is enforced. Drafts are invisible to everyone
    but their owner, so the platform-wide guarantee that only ID-verified
    hosts appear in search is unchanged. The database enforces the same rule
    with the listings_require_verified_owner trigger.
    """
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    row = _owner_row_or_404(sb, listing_id, user_id)

    if row["moderation_status"] not in OWNER_SUBMITTABLE:
        raise HTTPException(status_code=400, detail="This listing is not waiting to be submitted.")

    from routes_owner_verification import check_owner_verified

    if not check_owner_verified(user_id):
        raise HTTPException(
            status_code=403,
            detail="Complete identity verification to publish. Go to Settings > Verification.",
        )

    _availability_or_400(row.get("available_from"), row.get("available_to"), allow_past_start=True)

    sb.table("listings").update({"moderation_status": STATUS_PENDING}).eq("id", listing_id).execute()
    record_event(
        sb,
        listing_id=listing_id,
        actor_id=user_id,
        actor_type="owner",
        event_type="submitted",
        old_status=row["moderation_status"],
        new_status=STATUS_PENDING,
    )

    return {"id": listing_id, "moderation_status": STATUS_PENDING}


class RenewRequest(BaseModel):
    available_from: Optional[str] = Field(None, max_length=10)
    available_to: str = Field(..., max_length=10)


@router.post("/{listing_id}/renew")
@limiter.limit("20/hour")
def renew_listing(
    request: Request,
    listing_id: str,
    body: RenewRequest,
    authorization: str = Header(...),
):
    """Extend or renew availability.

    Extending a listing that is still live keeps it live. Renewing one that
    has expired sends it back through review, so a room that quietly sat
    unavailable for months is looked at by a person before it reappears.
    """
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()
    row = _owner_row_or_404(sb, listing_id, user_id)

    start, end = _availability_or_400(body.available_from or row.get("available_from"), body.available_to, allow_past_start=True)
    if end is None:
        raise HTTPException(status_code=400, detail="available_to is required")

    old_status = row["moderation_status"]
    updates = {"available_to": end.isoformat(), "expiry_notified_at": None}
    if start is not None:
        updates["available_from"] = start.isoformat()

    if old_status == STATUS_APPROVED:
        new_status = STATUS_APPROVED
    elif old_status in (STATUS_EXPIRED, STATUS_PAUSED, STATUS_CHANGES, STATUS_REJECTED, STATUS_DRAFT):
        from routes_owner_verification import check_owner_verified

        if not check_owner_verified(user_id):
            raise HTTPException(status_code=403, detail="Complete identity verification before renewing.")
        new_status = STATUS_PENDING
    else:
        raise HTTPException(status_code=400, detail="This listing cannot be renewed in its current state.")

    updates["moderation_status"] = new_status
    if new_status != old_status:
        updates["expired_at"] = None
    sb.table("listings").update(updates).eq("id", listing_id).execute()
    record_event(
        sb,
        listing_id=listing_id,
        actor_id=user_id,
        actor_type="owner",
        event_type="renewed",
        old_status=old_status,
        new_status=new_status,
        notes=f"available_to -> {end.isoformat()}",
    )
    return {"id": listing_id, "moderation_status": new_status, "available_to": end.isoformat()}


@router.post("/{listing_id}/pause")
@limiter.limit("20/hour")
def pause_listing(request: Request, listing_id: str, authorization: str = Header(...)):
    """Owner takes a live listing offline. Reversible with /resume."""
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()
    row = _owner_row_or_404(sb, listing_id, user_id)
    if row["moderation_status"] != STATUS_APPROVED:
        raise HTTPException(status_code=400, detail="Only a live listing can be paused.")
    sb.table("listings").update(
        {"moderation_status": STATUS_PAUSED, "paused_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", listing_id).execute()
    record_event(sb, listing_id=listing_id, actor_id=user_id, actor_type="owner", event_type="paused", old_status=STATUS_APPROVED, new_status=STATUS_PAUSED)
    return {"id": listing_id, "moderation_status": STATUS_PAUSED}


@router.post("/{listing_id}/resume")
@limiter.limit("20/hour")
def resume_listing(request: Request, listing_id: str, authorization: str = Header(...)):
    """Owner brings a paused listing back. Goes straight back live if it was
    paused by the owner, is still verified and its dates are still open;
    otherwise back into review."""
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()
    row = _owner_row_or_404(sb, listing_id, user_id, "id, owner_id, moderation_status, available_from, available_to, title, paused_by_admin")
    if row["moderation_status"] != STATUS_PAUSED:
        raise HTTPException(status_code=400, detail="This listing is not paused.")
    if row.get("paused_by_admin"):
        raise HTTPException(status_code=403, detail="This listing was paused by MigRent. Contact support to have it reviewed.")

    from routes_owner_verification import check_owner_verified

    if not check_owner_verified(user_id):
        raise HTTPException(status_code=403, detail="Complete identity verification before resuming.")

    try:
        _, end = validate_availability_window(row.get("available_from"), row.get("available_to"), allow_past_start=True)
        new_status = STATUS_APPROVED
    except AvailabilityError:
        raise HTTPException(status_code=400, detail="Update the availability dates before resuming; the current window has passed.")

    sb.table("listings").update({"moderation_status": new_status, "paused_at": None}).eq("id", listing_id).execute()
    record_event(sb, listing_id=listing_id, actor_id=user_id, actor_type="owner", event_type="unpaused", old_status=STATUS_PAUSED, new_status=new_status)
    return {"id": listing_id, "moderation_status": new_status}


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------


@router.get("/search")
@limiter.limit("60/minute")
def search_listings(
    request: Request,
    response: Response,
    suburb: Optional[str] = None,
    postcode: Optional[str] = None,
    state: Optional[str] = None,
    address: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    guests: Optional[int] = None,
    check_in: Optional[str] = None,
    check_out: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = None,
    furnished: Optional[bool] = None,
    bills_included: Optional[bool] = None,
    gender_preference: Optional[str] = None,
    instant_book: Optional[bool] = None,
    near_station: Optional[bool] = None,
    max_station_min: Optional[int] = None,
    station_name: Optional[str] = None,
    property_type: Optional[str] = None,
    place_type: Optional[str] = None,
    available_from: Optional[str] = None,
    min_stay: Optional[str] = None,
    verified_owner: Optional[bool] = None,
    pets_allowed: Optional[bool] = None,
    parking: Optional[bool] = None,
    air_conditioning: Optional[bool] = None,
    couples_ok: Optional[bool] = None,
    sort: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    authorization: Optional[str] = Header(None),
):
    """Public search. Returns a JSON array of public listing DTOs.

    Pagination metadata travels in headers so the response shape stays a bare
    array for older clients:
        X-Total-Count   number of matches before offset/limit
        X-Has-More      "true" when another page exists
    """
    limit = max(1, min(limit, 100))
    offset = max(0, offset)
    today = date.today()

    # Dates: `available_from` is the legacy name for the move-in date.
    try:
        move_in, move_out = validate_search_dates(check_in or available_from, check_out, today=today)
    except AvailabilityError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if postcode:
        if not postcode.isdigit() or not (800 <= int(postcode) <= 9999):
            raise HTTPException(status_code=400, detail="postcode must be a four digit Australian postcode")
    if min_price is not None and max_price is not None and max_price < min_price:
        raise HTTPException(status_code=400, detail="max_price must be at least min_price")

    sb = get_supabase_admin()

    def base_query(select_cols: str, count: Optional[str] = None):
        q = sb.table("listings").select(select_cols, count=count) if count else sb.table("listings").select(select_cols)
        q = public_filter(q, today)
        q = availability_filter(q, move_in, move_out)

        if min_price is not None:
            q = q.gte("weekly_price", min_price)
        if max_price is not None:
            q = q.lte("weekly_price", max_price)
        if guests is not None:
            q = q.gte("max_guests", guests)
        if suburb:
            q = q.ilike("suburb", f"%{suburb}%")
        if postcode:
            q = q.eq("postcode", int(postcode))
        if address:
            # Street addresses are private; match the suburb and city instead.
            q = q.or_(f"suburb.ilike.%{address}%,city.ilike.%{address}%")
        if state:
            state_city_map = {
                "NSW": ["Sydney"], "VIC": ["Melbourne"], "QLD": ["Brisbane"], "WA": ["Perth"],
                "SA": ["Adelaide"], "TAS": ["Hobart"], "ACT": ["Canberra"], "NT": ["Darwin"],
            }
            cities = state_city_map.get(state.upper(), [])
            if cities:
                q = q.in_("city", cities)
        if property_type:
            q = q.eq("property_type", property_type)
        if place_type:
            q = q.eq("place_type", place_type)
        if furnished is True:
            q = q.eq("furnished", True)
        if bills_included is True:
            q = q.eq("bills_included", True)
        if instant_book is True:
            q = q.eq("instant_book_enabled", True)
        if pets_allowed is True:
            q = q.eq("pets_allowed", True)
        if parking is True:
            q = q.eq("parking", True)
        if air_conditioning is True:
            q = q.eq("air_conditioning", True)
        if couples_ok is True:
            q = q.eq("couples_ok", True)
        if gender_preference == "female":
            q = q.eq("gender_preference", "female")
        if min_stay:
            q = q.eq("min_stay", min_stay)
        if max_station_min is not None:
            q = q.lte("station_distance_min", max_station_min)
        elif near_station is True:
            q = q.lte("station_distance_min", 15)
        if station_name:
            q = q.ilike("nearest_transport", f"%{station_name}%")
        return q

    best_match_sort = sort == "best_match"
    query = base_query(SEARCH_COLUMNS)
    if sort == "price_asc":
        query = query.order("weekly_price", desc=False)
    elif sort == "price_desc":
        query = query.order("weekly_price", desc=True)
    else:
        query = query.order("created_at", desc=True)

    if best_match_sort or verified_owner:
        fetch_limit = min(max(limit * 10, 100), 200)
        query = query.range(0, fetch_limit - 1)
    else:
        query = query.range(offset, offset + limit - 1)

    res = query.execute()
    results = res.data or []

    # Verified-owner filter reads the authoritative table, never the paid
    # `profiles.verified` flag or a badge string.
    if verified_owner is True and results:
        owner_ids = list({r["owner_id"] for r in results if r.get("owner_id")})
        verified_ids: set = set()
        if owner_ids:
            vr = (
                sb.table("owner_verification")
                .select("user_id, fully_verified")
                .in_("user_id", owner_ids)
                .eq("fully_verified", True)
                .execute()
            )
            verified_ids = {str(v["user_id"]) for v in (vr.data or [])}
        results = [r for r in results if str(r.get("owner_id")) in verified_ids]

    # Total count for honest pagination copy ("Showing 20 of 43").
    if best_match_sort or verified_owner:
        total = len(results)
    else:
        try:
            count_res = base_query("id", count="exact").execute()
            total = count_res.count if count_res.count is not None else len(results)
        except Exception:
            total = None

    if best_match_sort:
        seeker_profile = {}
        viewer = _optional_viewer(authorization)
        if viewer is not None:
            try:
                profile_res = (
                    sb.table("profiles")
                    .select("suburb_city, preferred_suburbs, budget_min, budget_max, move_in_date, visa_type")
                    .eq("id", str(viewer.id))
                    .execute()
                )
                if profile_res.data:
                    seeker_profile = profile_res.data[0]
            except Exception:
                pass
        for r in results:
            r["match_score"] = calculate_match_score(r, seeker_profile)
            r["match_reasons"] = generate_match_reasons(r, seeker_profile)
        results.sort(key=lambda x: x["match_score"], reverse=True)
        results = results[offset : offset + limit]
    elif verified_owner:
        results = results[offset : offset + limit]

    public = _public_rows(sb, results, today)
    if best_match_sort:
        for src, dst in zip(results, public):
            dst["match_score"] = src.get("match_score")
            dst["match_reasons"] = src.get("match_reasons", [])

    has_more = (offset + len(public)) < total if isinstance(total, int) else len(public) == limit
    response.headers["X-Total-Count"] = str(total if isinstance(total, int) else "")
    response.headers["X-Has-More"] = "true" if has_more else "false"
    response.headers["Access-Control-Expose-Headers"] = "X-Total-Count, X-Has-More"
    response.headers["Cache-Control"] = "public, max-age=30, s-maxage=60"
    return public


# ---------------------------------------------------------------------------
# Detail
# ---------------------------------------------------------------------------


@router.get("/{listing_id}")
def get_listing_by_id(
    listing_id: str,
    response: Response,
    include: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    """Get a single listing.

    Anonymous and non-owner viewers get the public contract only. The owner
    and admins get the management view (street address, exact pin, moderation
    notes). A listing whose availability has ended is returned to the public
    with public_state = "expired" and no booking data so the page can say so
    honestly instead of pretending the room is still on offer.
    """
    sb = get_supabase_admin()
    res = sb.table("listings").select("*").eq("id", listing_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = res.data[0]
    today = date.today()

    viewer = _optional_viewer(authorization)
    viewer_id = str(viewer.id) if viewer else None
    is_owner = viewer_id is not None and viewer_id == str(listing.get("owner_id"))
    is_admin = False
    if viewer is not None and not is_owner:
        try:
            is_admin = is_admin_user(viewer)
        except HTTPException:
            is_admin = False

    state = listing_public_state(listing, today)
    status = listing.get("moderation_status")

    if status == STATUS_DELETED:
        # Gone for everyone, including the owner.
        raise HTTPException(status_code=404, detail="Listing not found")

    if state != "published" and not (is_owner or is_admin):
        if state == "expired":
            response.status_code = 410
        else:
            raise HTTPException(status_code=404, detail="Listing not found")

    owner_id = str(listing.get("owner_id")) if listing.get("owner_id") else None
    profiles, verifications = _load_owner_context(sb, [owner_id] if owner_id else [])
    owner_profile = profiles.get(owner_id) if owner_id else None
    owner_verification = verifications.get(owner_id) if owner_id else None
    if owner_profile is not None:
        try:
            count_res = (
                sb.table("listings")
                .select("id", count="exact")
                .eq("owner_id", owner_id)
                .eq("moderation_status", STATUS_APPROVED)
                .execute()
            )
            owner_profile["listings_count"] = count_res.count if count_res.count is not None else 0
        except Exception:
            owner_profile["listings_count"] = None

    if is_owner or is_admin:
        out = to_owner_listing(listing, owner_profile=owner_profile, owner_verification=owner_verification, today=today)
    else:
        out = to_public_listing(listing, owner_profile=owner_profile, owner_verification=owner_verification, today=today)

    out["viewer"] = {"is_owner": is_owner, "can_moderate": is_admin}

    includes = set((include or "").split(","))

    if "reviews" in includes:
        empty = {"review_count": 0, "avg_rating": 0, "avg_migrant_friendliness": None, "positive_count": 0}
        try:
            stats_res = sb.table("listing_review_stats").select("*").eq("listing_id", listing_id).execute()
            out["review_stats"] = stats_res.data[0] if stats_res.data else empty
        except Exception:
            out["review_stats"] = empty
        try:
            reviews_res = (
                sb.table("reviews")
                .select("id, reviewer_id, rating, review_text, migrant_friendliness, photos, created_at")
                .eq("listing_id", listing_id)
                .eq("flagged", False)
                .order("created_at", desc=True)
                .limit(5)
                .execute()
            )
            reviews = reviews_res.data or []
            reviewer_ids = list({r["reviewer_id"] for r in reviews if r.get("reviewer_id")})
            profile_map = {}
            if reviewer_ids:
                pr = sb.table("profiles").select("id, name, preferred_name, custom_pfp").in_("id", reviewer_ids).execute()
                profile_map = {p["id"]: p for p in (pr.data or [])}
            public_reviews = []
            for r in reviews:
                p = profile_map.get(r.get("reviewer_id"), {})
                public_reviews.append(
                    {
                        "id": r.get("id"),
                        "rating": r.get("rating"),
                        "review_text": r.get("review_text"),
                        "migrant_friendliness": r.get("migrant_friendliness"),
                        "photos": r.get("photos") or [],
                        "created_at": r.get("created_at"),
                        "reviewer_name": p.get("preferred_name") or p.get("name") or "Anonymous",
                        "reviewer_photo": p.get("custom_pfp"),
                    }
                )
            out["recent_reviews"] = public_reviews
        except Exception:
            out["recent_reviews"] = []

    if "similar" in includes and state == "published":
        similar_rows: list[dict] = []
        try:
            price = float(listing.get("weekly_price") or 0)
            suburb = listing.get("suburb")
            min_p, max_p = price * 0.7, price * 1.3
            q = public_filter(sb.table("listings").select(SEARCH_COLUMNS), today)
            q = q.neq("id", listing_id).gte("weekly_price", min_p).lte("weekly_price", max_p)
            if suburb:
                q = q.eq("suburb", suburb)
            similar_rows = q.limit(4).execute().data or []
            if len(similar_rows) < 4 and listing.get("city"):
                existing = {listing_id, *[s["id"] for s in similar_rows]}
                fill_q = public_filter(sb.table("listings").select(SEARCH_COLUMNS), today)
                fill_q = fill_q.eq("city", listing["city"]).gte("weekly_price", min_p).lte("weekly_price", max_p)
                fill_rows = fill_q.limit(8).execute().data or []
                for row in fill_rows:
                    if row["id"] not in existing and len(similar_rows) < 4:
                        similar_rows.append(row)
                        existing.add(row["id"])
        except Exception:
            similar_rows = []
        out["similar_listings"] = _public_rows(sb, similar_rows, today)
    elif "similar" in includes:
        out["similar_listings"] = []

    if state == "published":
        response.headers["Cache-Control"] = "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" if not (is_owner or is_admin) else "private, no-store"
    else:
        response.headers["Cache-Control"] = "private, no-store"
    return out


# ---------------------------------------------------------------------------
# List (public feed / owner's own)
# ---------------------------------------------------------------------------


@router.get("")
def list_listings(
    response: Response,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    owner: Optional[bool] = None,
    limit: int = 20,
    offset: int = 0,
    authorization: Optional[str] = Header(None),
):
    limit = max(1, min(limit, 100))
    offset = max(0, offset)
    today = date.today()

    sb = get_supabase_admin()
    is_owner_view = False
    if owner and authorization:
        user = get_current_user(authorization)
        query = sb.table("listings").select("*").eq("owner_id", str(user.id)).neq("moderation_status", STATUS_DELETED)
        is_owner_view = True
    else:
        query = public_filter(sb.table("listings").select(SEARCH_COLUMNS), today)

    if city:
        query = query.eq("city", city)
    if min_price is not None:
        query = query.gte("weekly_price", min_price)
    if max_price is not None:
        query = query.lte("weekly_price", max_price)

    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    rows = query.execute().data or []

    if is_owner_view:
        response.headers["Cache-Control"] = "private, no-store"
        return [to_owner_listing(r, today=today) for r in rows]
    response.headers["Cache-Control"] = "public, max-age=30, s-maxage=60"
    return _public_rows(sb, rows, today)


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------


@router.patch("/{listing_id}")
async def update_listing(
    listing_id: str,
    body: ListingUpdate,
    authorization: str = Header(...),
):
    """Update a listing. Only the owner can update their own listing."""
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    listing_res = sb.table("listings").select("id, owner_id, moderation_status, address, suburb, postcode, latitude, longitude, available_from, available_to").eq("id", listing_id).execute()
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    current = listing_res.data[0]
    if str(current["owner_id"]) != user_id:
        raise HTTPException(status_code=403, detail="You can only edit your own listings")
    if current.get("moderation_status") == STATUS_DELETED:
        raise HTTPException(status_code=404, detail="Listing not found")

    updates = body.model_dump(exclude_unset=True)
    updates.pop("is_active", None)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    if "postcode" in updates and "city" not in updates:
        derived = derive_city(updates["postcode"])
        if derived:
            updates["city"] = derived

    if "available_from" in updates or "available_to" in updates:
        _availability_or_400(
            updates.get("available_from", current.get("available_from")),
            updates.get("available_to", current.get("available_to")),
            allow_past_start=True,
        )

    location_keys = {"address", "suburb", "postcode", "latitude", "longitude"}
    if location_keys & set(updates.keys()):
        location = await validate_listing_location(
            address=updates.get("address", current.get("address")),
            suburb=updates.get("suburb", current.get("suburb")),
            postcode=updates.get("postcode", current.get("postcode")),
            latitude=updates.get("latitude", current.get("latitude") if "address" not in updates else None),
            longitude=updates.get("longitude", current.get("longitude") if "address" not in updates else None),
        )
        if not location.ok:
            raise HTTPException(status_code=400, detail=location.reason)
        if location.lat is not None and location.lng is not None:
            updates["latitude"] = location.lat
            updates["longitude"] = location.lng
            if location.formatted_address:
                updates["geocoded_address"] = location.formatted_address

    try:
        sb.table("listings").update(updates).eq("id", listing_id).execute()
    except Exception:
        logger.exception("Failed to update listing")
        raise HTTPException(status_code=500, detail="Failed to update listing")

    content_fields = {"title", "description", "images", "weekly_price", "address", "suburb"}
    if content_fields & set(updates.keys()):
        try:
            full_listing = sb.table("listings").select("*").eq("id", listing_id).execute()
            if full_listing.data:
                fl = full_listing.data[0]
                spam_result = calculate_spam_score(
                    title=fl.get("title"),
                    description=fl.get("description", ""),
                    images=fl.get("images", []),
                    weekly_price=fl.get("weekly_price", 0),
                    owner_id=user_id,
                    suburb=fl.get("suburb"),
                    listing_id=listing_id,
                )
                sb.table("listings").update(
                    {
                        "spam_score": spam_result["spam_score"],
                        "spam_reasons": spam_result["reasons"],
                        "content_hash": spam_result["content_hash"],
                    }
                ).eq("id", listing_id).execute()
                record_event(
                    sb,
                    listing_id=listing_id,
                    actor_id=user_id,
                    actor_type="owner",
                    event_type="owner_edited",
                    old_status=current.get("moderation_status"),
                    new_status=current.get("moderation_status"),
                    notes=f"Owner edited fields: {', '.join(sorted(updates.keys()))}",
                    metadata={"spam_score": spam_result["spam_score"]},
                )
        except Exception as e:
            logger.warning("Spam rescan failed for listing %s: %s", listing_id, e)

    result = sb.table("listings").select("*").eq("id", listing_id).execute()
    return to_owner_listing(result.data[0]) if result.data else updates


# ---------------------------------------------------------------------------
# Delete (soft)
# ---------------------------------------------------------------------------


class DeleteListingRequest(BaseModel):
    password: Optional[str] = None
    oauth_confirmed: Optional[bool] = False


@router.delete("/{listing_id}")
@limiter.limit("10/hour")
def delete_listing(
    request: Request,
    listing_id: str,
    body: DeleteListingRequest = DeleteListingRequest(),
    authorization: str = Header(...),
):
    """Archive a listing (soft delete). Requires re-authentication.

    A hard DELETE used to cascade into bookings and messages. Nothing is
    ever hard-deleted now: the row becomes 'deleted' (archived), which every
    public read path excludes.
    """
    user = get_current_user(authorization)
    user_id = str(user.id)

    sb_admin = get_supabase_admin()
    listing_res = sb_admin.table("listings").select("id, owner_id, moderation_status").eq("id", listing_id).execute()
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    if str(listing_res.data[0]["owner_id"]) != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings")

    provider = (user.app_metadata or {}).get("provider", "email")
    if provider != "email":
        # OAuth accounts have no password to re-enter. A valid session issued
        # by the identity provider is the confirmation.
        pass
    elif body.password:
        email = user.email
        if not email:
            raise HTTPException(status_code=400, detail="Could not verify identity")
        try:
            sb_anon = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
            auth_res = sb_anon.auth.sign_in_with_password({"email": email, "password": body.password})
            if not auth_res or not auth_res.user:
                raise HTTPException(status_code=401, detail="Incorrect password")
            try:
                sb_anon.auth.sign_out()
            except Exception:
                pass
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=401, detail="Incorrect password")
    else:
        raise HTTPException(status_code=400, detail="Please confirm with your password")

    old_status = listing_res.data[0].get("moderation_status")
    sb_admin.table("listings").update({"moderation_status": STATUS_DELETED}).eq("id", listing_id).execute()
    record_event(sb_admin, listing_id=listing_id, actor_id=user_id, actor_type="owner", event_type="archived", old_status=old_status, new_status=STATUS_DELETED)

    return {"message": "Listing deleted successfully"}


@router.get("/auth/provider")
def get_auth_provider(authorization: str = Header(...)):
    """Return the current user's auth provider (email, google, etc)."""
    user = get_current_user(authorization)
    provider = (user.app_metadata or {}).get("provider", "email")
    return {"provider": provider}
