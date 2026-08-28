import asyncio
import logging
from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel
from typing import Optional
from models import ListingCreate, ListingUpdate
from db import get_supabase, get_supabase_admin, SUPABASE_URL, SUPABASE_ANON_KEY
from auth_utils import get_current_user, is_admin_user
from supabase import create_client
from routes_geocode import geocode_and_find_station
from spam_detection import calculate_spam_score, apply_spam_result, notify_founder_spam
from matching_engine import calculate_match_score, generate_match_reasons
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/listings", tags=["listings"])


def derive_city(postcode: int) -> Optional[str]:
    """Map Australian postcodes to their capital city/region."""
    if 800 <= postcode <= 899:
        return "Darwin"
    if 900 <= postcode <= 999:
        return "Darwin"  # NT rural
    if 1000 <= postcode <= 1999:
        return "Sydney"
    if 2000 <= postcode <= 2599:
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


def redact_address(listing: dict, viewer_is_owner_or_admin: bool) -> dict:
    """Replace the street address with the suburb for everyone else.

    listings.address holds the full street address the owner entered. Renters
    are shown the suburb and postcode only until a booking is agreed, which is
    the convention every Australian rental site follows and which stops the
    exact address of a room, often occupied by a lone new arrival, being
    scraped off a public page.

    The owner and admins see the real thing under `street_address`.
    """
    if viewer_is_owner_or_admin:
        listing["street_address"] = listing.get("address")
        return listing

    suburb = listing.get("suburb") or listing.get("city") or ""
    postcode = listing.get("postcode")
    listing["address"] = f"{suburb} {postcode}".strip() if suburb or postcode else "Australia"
    listing.pop("street_address", None)
    listing.pop("geocoded_address", None)
    return listing


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

    # Verification gates PUBLISHING, not creating.
    #
    # This used to be a hard 403: an owner could not open the listing form at
    # all until they had finished ID verification. That is the right guarantee
    # in the wrong place. It asked for a government ID before the owner had
    # invested anything or seen what listing involves, which is the single
    # biggest brake on getting rooms onto the platform.
    #
    # An unverified owner can now build and save a listing. It is created as a
    # draft, which no search, no public page and no booking can reach, and they
    # submit it for review once verified via POST /listings/{id}/submit. The
    # trust guarantee is identical: nothing unverified is ever visible.
    from routes_owner_verification import check_owner_verified
    is_verified = check_owner_verified(str(user.id))

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
        "moderation_status": "pending_approval" if is_verified else "draft",
    }

    # Add geocoding fields if provided by frontend
    if listing.latitude is not None:
        row["latitude"] = listing.latitude
    if listing.longitude is not None:
        row["longitude"] = listing.longitude

    # Add all extended fields if provided
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
    try:
        res = sb.table("listings").insert(row).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create listing")

    created = res.data[0] if res.data else row

    # Auto-geocode if lat/lng not provided by frontend
    if not row.get("latitude") and created.get("id"):
        try:
            geo = await geocode_and_find_station(listing.address)
            if geo.lat and geo.lng:
                update_data = {
                    "latitude": geo.lat,
                    "longitude": geo.lng,
                }
                if geo.formatted_address:
                    update_data["geocoded_address"] = geo.formatted_address
                if geo.walk_time_minutes is not None:
                    update_data["station_distance_min"] = geo.walk_time_minutes
                if geo.nearest_station:
                    update_data["nearest_transport"] = f"{geo.nearest_station} - {geo.walk_time_minutes} min walk"
                sb.table("listings").update(update_data).eq("id", created["id"]).execute()
                created.update(update_data)
        except Exception as e:
            logger.warning(f"Auto-geocode failed for listing {created.get('id')}: {e}")

    # Run spam detection on the new listing
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
            created["spam_score"] = spam_result["spam_score"]
            created["spam_reasons"] = spam_result["reasons"]

            # Notify founder if flagged or hidden
            if spam_result["action"] in ("flag", "hide"):
                # Get owner name for the email
                owner_name = "Unknown"
                try:
                    profile_res = sb.table("profiles").select("name").eq("id", str(user.id)).execute()
                    if profile_res.data:
                        owner_name = profile_res.data[0].get("name", "Unknown")
                except Exception:
                    pass
                notify_founder_spam(created["id"], spam_result, listing.title, owner_name)

                # Notify owner that listing is under extra review
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
                        logger.warning(f"Failed to send review email to owner: {e}")
        except Exception as e:
            logger.warning(f"Spam detection failed for listing {created.get('id')}: {e}")

    # Tell the client which of the two outcomes happened so it can show either
    # "in review" or "saved as a draft, verify to publish".
    created["is_draft"] = not is_verified
    return created


@router.post("/{listing_id}/submit")
@limiter.limit("20/hour")
def submit_listing_for_review(
    request: Request,
    listing_id: str,
    authorization: str = Header(...),
):
    """Move an owner's draft listing into the moderation queue.

    This is where verification is enforced. Drafts are invisible to everyone
    but their owner, so the platform-wide guarantee that only ID-verified hosts
    appear in search is unchanged.
    """
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    res = sb.table("listings").select("id, owner_id, moderation_status").eq("id", listing_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    row = res.data[0]
    if str(row["owner_id"]) != user_id:
        raise HTTPException(status_code=403, detail="You can only submit your own listings")

    if row["moderation_status"] not in ("draft", "changes_requested", "rejected"):
        raise HTTPException(
            status_code=400,
            detail="This listing is not waiting to be submitted.",
        )

    from routes_owner_verification import check_owner_verified
    if not check_owner_verified(user_id):
        raise HTTPException(
            status_code=403,
            detail="Complete identity verification to publish. Go to Settings > Verification.",
        )

    sb.table("listings").update(
        {"moderation_status": "pending_approval"}
    ).eq("id", listing_id).execute()

    return {"id": listing_id, "moderation_status": "pending_approval"}


@router.get("/search")
@limiter.limit("60/minute")
def search_listings(
    request: Request,
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
    """Search listings with filters. Pass Authorization header for personalised match scores."""
    if limit < 1:
        limit = 1
    if limit > 100:
        limit = 100
    if offset < 0:
        offset = 0

    sb = get_supabase_admin()
    query = sb.table("listings").select("*")

    # Only show approved listings in public search
    query = query.eq("moderation_status", "approved")

    # Price filters
    if min_price is not None:
        query = query.gte("weekly_price", min_price)
    if max_price is not None:
        query = query.lte("weekly_price", max_price)
    if guests is not None:
        query = query.gte("max_guests", guests)

    # Text-based location filters
    if suburb:
        query = query.ilike("suburb", f"%{suburb}%")
    if postcode:
        query = query.eq("postcode", int(postcode))
    if address:
        query = query.ilike("address", f"%{address}%")
    if state:
        # Map state abbreviation to city for filtering
        state_city_map = {
            "NSW": ["Sydney"],
            "VIC": ["Melbourne"],
            "QLD": ["Brisbane"],
            "WA": ["Perth"],
            "SA": ["Adelaide"],
            "TAS": ["Hobart"],
            "ACT": ["Canberra"],
            "NT": ["Darwin"],
        }
        cities = state_city_map.get(state.upper(), [])
        if cities:
            query = query.in_("city", cities)

    # Property type filters
    if property_type:
        query = query.eq("property_type", property_type)
    if place_type:
        query = query.eq("place_type", place_type)

    # Boolean filters
    if furnished is True:
        query = query.eq("furnished", True)
    if bills_included is True:
        query = query.eq("bills_included", True)
    if instant_book is True:
        query = query.eq("instant_book_enabled", True)
    if pets_allowed is True:
        query = query.eq("pets_allowed", True)
    if parking is True:
        query = query.eq("parking", True)
    if air_conditioning is True:
        query = query.eq("air_conditioning", True)
    if couples_ok is True:
        query = query.eq("couples_ok", True)

    # Gender preference filter
    if gender_preference == "female":
        query = query.eq("gender_preference", "female")

    # Available from date filter
    if available_from:
        query = query.lte("available_from", available_from)

    # Min stay filter
    if min_stay:
        query = query.eq("min_stay", min_stay)

    # Verified owner filter - join check via owner profile
    if verified_owner is True:
        # We filter in-memory after fetch since Supabase doesn't support cross-table filters easily
        pass  # handled below after fetch

    # Station proximity filter
    if max_station_min is not None:
        query = query.lte("station_distance_min", max_station_min)
    elif near_station is True:
        query = query.lte("station_distance_min", 15)

    # Filter by station name (partial match on nearest_transport)
    if station_name:
        query = query.ilike("nearest_transport", f"%{station_name}%")

    # Sorting
    best_match_sort = sort == "best_match"
    if sort == "price_asc":
        query = query.order("weekly_price", desc=False)
    elif sort == "price_desc":
        query = query.order("weekly_price", desc=True)
    else:
        query = query.order("created_at", desc=True)

    # For best_match or verified_owner, fetch a larger batch to sort/filter in memory
    if best_match_sort:
        fetch_limit = min(limit * 10, 200)  # cap at 200 for V1
        query = query.range(0, fetch_limit - 1)
    elif verified_owner:
        fetch_limit = limit * 3
        query = query.range(offset, offset + fetch_limit - 1)
    else:
        query = query.range(offset, offset + limit - 1)

    res = query.execute()
    results = res.data or []

    # Post-fetch: verified owner filter
    if verified_owner is True and results:
        owner_ids = list({r["owner_id"] for r in results if r.get("owner_id")})
        if owner_ids:
            profiles_res = (
                sb.table("profiles")
                .select("id, identity_verified")
                .in_("id", owner_ids)
                .eq("identity_verified", True)
                .execute()
            )
            verified_ids = {p["id"] for p in (profiles_res.data or [])}
            results = [r for r in results if r.get("owner_id") in verified_ids]
        if not best_match_sort:
            results = results[:limit]

    # Search is public, so never leak the street address here.
    for row in results:
        redact_address(row, False)

    # Best match scoring and sorting
    if best_match_sort:
        seeker_profile = {}
        if authorization:
            try:
                user = get_current_user(authorization)
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

        for r in results:
            r["match_score"] = calculate_match_score(r, seeker_profile)
            r["match_reasons"] = generate_match_reasons(r, seeker_profile)

        results.sort(key=lambda x: x["match_score"], reverse=True)
        results = results[offset: offset + limit]

    return results


@router.get("/{listing_id}")
def get_listing_by_id(
    listing_id: str,
    include: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    """Get a single listing by ID (public).

    Optional ?include=reviews,similar to bundle extra data.

    Only approved listings are public. This endpoint previously returned any
    listing to anyone holding the id, so a rejected or still-unmoderated
    listing stayed live, linkable and bookable even though search hid it -
    moderation only ever hid things from the search page. The owner and admins
    can still fetch their own non-approved listings so the edit and moderation
    screens keep working.
    """
    sb = get_supabase_admin()
    res = sb.table("listings").select("*").eq("id", listing_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = res.data[0]

    viewer_id = None
    viewer = None
    if authorization:
        try:
            viewer = get_current_user(authorization)
            viewer_id = str(viewer.id)
        except HTTPException:
            viewer, viewer_id = None, None

    is_owner = viewer_id is not None and viewer_id == str(listing.get("owner_id"))
    is_admin = False
    if viewer is not None and not is_owner:
        try:
            is_admin = is_admin_user(viewer)
        except HTTPException:
            is_admin = False

    if listing.get("moderation_status") != "approved":
        # A soft-deleted listing is gone for everyone, including its owner.
        if listing.get("moderation_status") == "deleted" or not (is_owner or is_admin):
            raise HTTPException(status_code=404, detail="Listing not found")

    # Enrich with owner profile
    owner_id = listing.get("owner_id")
    if owner_id:
        profile_res = (
            sb.table("profiles")
            .select("name, custom_pfp, verified, bio, badges, identity_verified")
            .eq("id", owner_id)
            .execute()
        )
        if profile_res.data:
            owner_profile = profile_res.data[0]
            # Count how many listings this owner has
            count_res = sb.table("listings").select("id", count="exact").eq("owner_id", owner_id).execute()
            owner_profile["listings_count"] = count_res.count if count_res.count is not None else 0
            listing["owner_profile"] = owner_profile

    includes = set((include or "").split(","))

    # Reviews
    if "reviews" in includes:
        try:
            stats_res = (
                sb.table("listing_review_stats")
                .select("*")
                .eq("listing_id", listing_id)
                .execute()
            )
            listing["review_stats"] = stats_res.data[0] if stats_res.data else {
                "review_count": 0,
                "avg_rating": 0,
                "avg_migrant_friendliness": None,
                "positive_count": 0,
            }
        except Exception:
            listing["review_stats"] = {
                "review_count": 0,
                "avg_rating": 0,
                "avg_migrant_friendliness": None,
                "positive_count": 0,
            }

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
            # Enrich with reviewer names
            reviewer_ids = list({r["reviewer_id"] for r in reviews})
            if reviewer_ids:
                profiles_res = (
                    sb.table("profiles")
                    .select("id, name, custom_pfp")
                    .in_("id", reviewer_ids)
                    .execute()
                )
                profile_map = {p["id"]: p for p in (profiles_res.data or [])}
                for r in reviews:
                    p = profile_map.get(r["reviewer_id"], {})
                    r["reviewer_name"] = p.get("name", "Anonymous")
                    r["reviewer_photo"] = p.get("custom_pfp")
            listing["recent_reviews"] = reviews
        except Exception:
            listing["recent_reviews"] = []

    # Similar listings
    if "similar" in includes:
        try:
            price = listing.get("weekly_price", 0)
            suburb = listing.get("suburb")
            min_p = price * 0.7
            max_p = price * 1.3
            q = (
                sb.table("listings")
                .select("id, title, address, suburb, city, postcode, weekly_price, images, instant_book_enabled")
                .neq("id", listing_id)
                .gte("weekly_price", min_p)
                .lte("weekly_price", max_p)
            )
            if suburb:
                q = q.eq("suburb", suburb)
            similar_res = q.limit(4).execute()
            listing["similar_listings"] = similar_res.data or []
            # If not enough from same suburb, fill from same city
            if len(listing["similar_listings"]) < 4 and listing.get("city"):
                existing_ids = [listing_id] + [s["id"] for s in listing["similar_listings"]]
                fill_q = (
                    sb.table("listings")
                    .select("id, title, address, suburb, city, postcode, weekly_price, images, instant_book_enabled")
                    .eq("city", listing["city"])
                    .gte("weekly_price", min_p)
                    .lte("weekly_price", max_p)
                    .limit(4 - len(listing["similar_listings"]))
                )
                for eid in existing_ids:
                    fill_q = fill_q.neq("id", eid)
                fill_res = fill_q.execute()
                listing["similar_listings"].extend(fill_res.data or [])
        except Exception:
            listing["similar_listings"] = []

    for similar in listing.get("similar_listings") or []:
        redact_address(similar, False)

    return redact_address(listing, is_owner or is_admin)


@router.get("")
def list_listings(
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    owner: Optional[bool] = None,
    limit: int = 20,
    offset: int = 0,
    authorization: Optional[str] = Header(None),
):
    # Clamp limit to prevent abuse
    if limit < 1:
        limit = 1
    if limit > 100:
        limit = 100
    if offset < 0:
        offset = 0

    sb = get_supabase_admin()
    query = sb.table("listings").select("*")
    if city:
        query = query.eq("city", city)
    if min_price is not None:
        query = query.gte("weekly_price", min_price)
    if max_price is not None:
        query = query.lte("weekly_price", max_price)
    is_owner_view = False
    if owner and authorization:
        user = get_current_user(authorization)
        query = query.eq("owner_id", str(user.id))
        # Exclude permanently deleted listings even for owner
        query = query.neq("moderation_status", "deleted")
        is_owner_view = True
    else:
        # Public listing - only show approved
        query = query.eq("moderation_status", "approved")

    query = query.range(offset, offset + limit - 1)

    res = query.execute()
    rows = res.data or []
    # Owners see their own street addresses; the public feed does not. The
    # query above already scopes owner view to the caller's own listings.
    for row in rows:
        redact_address(row, is_owner_view)
    return rows


@router.patch("/{listing_id}")
def update_listing(
    listing_id: str,
    body: ListingUpdate,
    authorization: str = Header(...),
):
    """Update a listing. Only the owner can update their own listing."""
    user = get_current_user(authorization)
    user_id = str(user.id)

    sb = get_supabase_admin()

    # Verify listing exists and belongs to this user
    listing_res = sb.table("listings").select("id, owner_id").eq("id", listing_id).execute()
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing_res.data[0]["owner_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only edit your own listings")

    # Extract only fields that were explicitly sent
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Derive city from postcode if postcode changed
    if "postcode" in updates and "city" not in updates:
        derived = derive_city(updates["postcode"])
        if derived:
            updates["city"] = derived

    try:
        sb.table("listings").update(updates).eq("id", listing_id).execute()
    except Exception as e:
        logger.exception("Failed to update listing")
        raise HTTPException(status_code=500, detail="Failed to update listing")

    # Re-run spam detection if content fields changed
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
                # Update spam fields but don't auto-change status on edits
                # (owner may be fixing issues - let admin re-review)
                sb.table("listings").update({
                    "spam_score": spam_result["spam_score"],
                    "spam_reasons": spam_result["reasons"],
                    "content_hash": spam_result["content_hash"],
                }).eq("id", listing_id).execute()

                # Record the edit event
                sb.table("moderation_events").insert({
                    "listing_id": listing_id,
                    "actor_id": user_id,
                    "actor_type": "owner",
                    "event_type": "owner_edited",
                    "spam_score": spam_result["spam_score"],
                    "reasons": spam_result["reasons"],
                    "notes": f"Owner edited fields: {', '.join(updates.keys())}",
                }).execute()
        except Exception as e:
            logger.warning(f"Spam rescan failed for listing {listing_id}: {e}")

    # Return the full updated listing
    result = sb.table("listings").select("*").eq("id", listing_id).execute()
    return result.data[0] if result.data else updates


class DeleteListingRequest(BaseModel):
    password: Optional[str] = None
    oauth_confirmed: Optional[bool] = False


@router.delete("/{listing_id}")
def delete_listing(
    listing_id: str,
    body: DeleteListingRequest = DeleteListingRequest(),
    authorization: str = Header(...),
):
    """Delete a listing. Requires password or OAuth re-auth confirmation."""
    user = get_current_user(authorization)
    user_id = str(user.id)

    # Verify the listing exists and belongs to this user
    sb_admin = get_supabase_admin()
    listing_res = sb_admin.table("listings").select("id, owner_id").eq("id", listing_id).execute()
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing_res.data[0]["owner_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings")

    # Verify identity - either password or OAuth re-auth
    if body.oauth_confirmed:
        pass  # Valid session after OAuth redirect is sufficient
    elif body.password:
        email = user.email
        if not email:
            raise HTTPException(status_code=400, detail="Could not verify identity")
        try:
            sb_anon = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
            auth_res = sb_anon.auth.sign_in_with_password({
                "email": email,
                "password": body.password,
            })
            if not auth_res or not auth_res.user:
                raise HTTPException(status_code=401, detail="Incorrect password")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=401, detail="Incorrect password")
    else:
        raise HTTPException(status_code=400, detail="Please confirm with your password or Google sign-in")

    # Soft delete. A hard DELETE used to cascade into bookings and messages,
    # which meant one owner removing a listing destroyed every booking on it -
    # including PAID ones with a real Stripe charge behind them - plus the
    # entire conversation history that would settle a dispute. Neither is
    # recoverable and neither belongs solely to the owner.
    #
    # 'deleted' is excluded from every public read path: search filters on
    # moderation_status = 'approved' (routes_listings.py search_listings), the
    # detail endpoint rejects it, and the RLS policy listings_public_read only
    # exposes approved rows.
    sb_admin.table("listings").update(
        {"moderation_status": "deleted"}
    ).eq("id", listing_id).execute()

    return {"message": "Listing deleted successfully"}


@router.get("/auth/provider")
def get_auth_provider(authorization: str = Header(...)):
    """Return the current user's auth provider (email, google, etc)."""
    user = get_current_user(authorization)
    provider = (user.app_metadata or {}).get("provider", "email")
    return {"provider": provider}
