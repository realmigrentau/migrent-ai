import logging
import re
from datetime import datetime, timezone

from fastapi import APIRouter, File, Header, HTTPException, Request, UploadFile

from auth_utils import get_current_user
from db import SUPABASE_URL, get_supabase_admin
from limiter import limiter
from models import ProfileUpdate
from public_dto import (
    ALLOWED_ACHIEVEMENT_BADGES,
    public_badges,
    to_public_owner,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profiles", tags=["profiles"])

LOCKED_FIELDS = {"legal_name", "preferred_name", "residential_address", "suburb_city", "nearest_station", "phone"}

UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)
PUBLIC_ID_RE = re.compile(r"^[a-z0-9]{6,32}$")

# What /profiles/{id} may read. Everything else on the row is private.
PUBLIC_PROFILE_COLUMNS = "id, public_id, name, preferred_name, about_me, bio, most_useless_skill, interests, badges, custom_pfp, occupation, created_at"
VERIFICATION_COLUMNS = "user_id, email_verified, phone_verified, id_status, fully_verified, id_reviewed_at"


@router.get("/me")
@limiter.limit("30/minute")
def get_my_profile(request: Request, authorization: str = Header(...)):
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        res = sb.table("profiles").select("*").eq("id", uid).execute()
        if not res.data:
            sb.table("profiles").insert({"id": uid}).execute()
            return {"id": uid}

        row = res.data[0]
        # Never hand the browser credential material, even the owner's own.
        row.pop("recovery_password_hash", None)
        return row
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to fetch profile")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")


@router.get("/me/onboarding-status")
def get_onboarding_status(authorization: str = Header(...)):
    """Check if user has completed onboarding."""
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        res = sb.table("profiles").select("onboarding_completed, onboarding_completed_at").eq("id", uid).execute()
        if not res.data:
            return {"onboarding_completed": False, "onboarding_completed_at": None}

        profile = res.data[0]
        return {
            "onboarding_completed": profile.get("onboarding_completed", False),
            "onboarding_completed_at": profile.get("onboarding_completed_at"),
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to fetch onboarding status")
        raise HTTPException(status_code=500, detail="Failed to fetch onboarding status")


@router.post("/me/onboarding/complete")
@limiter.limit("10/minute")
def complete_onboarding(request: Request, body: ProfileUpdate, authorization: str = Header(...)):
    """Complete onboarding with required fields."""
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        required_fields = ["legal_name", "preferred_name", "residential_address", "phone"]
        for field in required_fields:
            if not getattr(body, field, None):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

        # MigRent is for adults. The onboarding form must carry the explicit
        # over-18 confirmation; nothing can be published without it (see the
        # listings_require_verified_owner trigger and docs/policies).
        if not body.over_18:
            raise HTTPException(status_code=400, detail="You must confirm you are 18 or older to use MigRent.")

        updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
        updates.pop("over_18", None)
        updates["id"] = uid
        updates["onboarding_completed"] = True
        updates["onboarding_completed_at"] = datetime.now(timezone.utc).isoformat()
        updates["over_18_confirmed_at"] = datetime.now(timezone.utc).isoformat()

        sb.table("profiles").upsert(updates).execute()

        result = sb.table("profiles").select("*").eq("id", uid).execute()
        row = result.data[0] if result.data else updates
        row.pop("recovery_password_hash", None)
        return row
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to complete onboarding")
        raise HTTPException(status_code=500, detail="Failed to complete onboarding")


@router.patch("/me")
@limiter.limit("10/minute")
def update_my_profile(request: Request, body: ProfileUpdate, authorization: str = Header(...)):
    """Update user profile. Locked fields cannot be changed after onboarding."""
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        profile_res = sb.table("profiles").select("onboarding_completed").eq("id", uid).execute()
        is_onboarded = False
        if profile_res.data:
            is_onboarded = profile_res.data[0].get("onboarding_completed", False)

        updates = body.model_dump(exclude_unset=True)
        updates.pop("over_18", None)
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        if is_onboarded:
            for field in LOCKED_FIELDS:
                updates.pop(field, None)
            if not updates:
                raise HTTPException(status_code=400, detail="No updatable fields provided")

        updates["id"] = uid
        sb.table("profiles").upsert(updates).execute()

        result = sb.table("profiles").select("*").eq("id", uid).execute()
        row = result.data[0] if result.data else updates
        row.pop("recovery_password_hash", None)
        return row
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to update profile")
        raise HTTPException(status_code=500, detail="Failed to update profile")


@router.get("/me/export")
@limiter.limit("3/hour")
def export_my_data(request: Request, authorization: str = Header(...)):
    """Return everything MigRent holds about the caller, as JSON.

    Supports the access right under the Australian Privacy Principles. The
    export is built from the caller's own rows only; other people's data
    (the other side of a message thread, for example) is limited to ids.
    """
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    uid = str(user.id)

    def rows(table: str, column: str) -> list[dict]:
        try:
            return sb.table(table).select("*").eq(column, uid).execute().data or []
        except Exception:
            logger.warning("Export: could not read %s.%s", table, column)
            return []

    profile = rows("profiles", "id")
    for p in profile:
        p.pop("recovery_password_hash", None)

    export = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "account": {"id": uid, "email": user.email},
        "profile": profile,
        "verification": [
            {k: v for k, v in r.items() if k not in ("phone_otp_code", "id_file_path")}
            for r in rows("owner_verification", "user_id")
        ],
        "listings": rows("listings", "owner_id"),
        "bookings_as_seeker": rows("bookings", "seeker_id"),
        "bookings_as_owner": rows("bookings", "owner_id"),
        "messages_sent": rows("messages", "sender_id"),
        "messages_received": rows("messages", "receiver_id"),
        "reviews_written": rows("reviews", "reviewer_id"),
        "reports_filed": rows("reports", "reporter_id"),
        "notifications": rows("notifications", "user_id"),
    }
    return export


@router.get("/featured/community")
def get_featured_profiles(request: Request):
    """Get top listers and active community members for the dashboard."""
    try:
        sb = get_supabase_admin()

        listings_res = sb.table("listings").select("owner_id").eq("moderation_status", "approved").execute()
        owner_counts: dict[str, int] = {}
        for row in listings_res.data or []:
            oid = row.get("owner_id")
            if oid:
                owner_counts[oid] = owner_counts.get(oid, 0) + 1

        sorted_owners = sorted(owner_counts.items(), key=lambda x: x[1], reverse=True)[:6]
        top_owner_ids = [oid for oid, _ in sorted_owners]

        def public_card(p: dict) -> dict:
            return {
                "public_id": p.get("public_id"),
                "name": p.get("preferred_name") or p.get("name"),
                "custom_pfp": p.get("custom_pfp"),
                "occupation": p.get("occupation"),
                "about_me": p.get("about_me"),
                "badges": public_badges(p.get("badges")),
            }

        top_listers = []
        if top_owner_ids:
            profiles_res = sb.table("profiles").select(PUBLIC_PROFILE_COLUMNS).in_("id", top_owner_ids).execute()
            profile_map = {p["id"]: p for p in (profiles_res.data or [])}
            for oid, count in sorted_owners:
                p = profile_map.get(oid)
                if p:
                    top_listers.append({**public_card(p), "listing_count": count})

        all_profiles = sb.table("profiles").select(PUBLIC_PROFILE_COLUMNS).limit(50).execute()
        with_badges = [p for p in (all_profiles.data or []) if public_badges(p.get("badges"))]
        top_members = [public_card(p) for p in sorted(with_badges, key=lambda p: len(public_badges(p.get("badges"))), reverse=True)[:6]]

        return {"top_listers": top_listers, "top_members": top_members}
    except Exception:
        logger.exception("Failed to fetch featured profiles")
        raise HTTPException(status_code=500, detail="Failed to fetch featured profiles")


@router.post("/me/photo")
@limiter.limit("10/minute")
async def upload_profile_photo(request: Request, file: UploadFile = File(...), authorization: str = Header(...)):
    """Upload a profile photo to Supabase storage and update the profile."""
    from uploads import ImageValidationError, prepare_public_image

    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        content = await file.read()
        try:
            prepared = prepare_public_image(content, max_bytes=5 * 1024 * 1024, max_side=1024)
        except ImageValidationError as e:
            raise HTTPException(status_code=400, detail=str(e))

        path = f"profile-photos/{uid}.{prepared.extension}"
        bucket = "avatars"
        file_opts = {"content-type": prepared.content_type, "upsert": "true"}

        try:
            sb.storage.from_(bucket).upload(path, prepared.data, file_opts)
        except Exception as upload_err:
            logger.warning("First upload attempt failed: %s, trying remove + upload", upload_err)
            try:
                sb.storage.from_(bucket).remove([path])
            except Exception:
                pass
            sb.storage.from_(bucket).upload(path, prepared.data, {"content-type": prepared.content_type})

        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}"
        final_url = f"{public_url}?t={int(datetime.now(timezone.utc).timestamp())}"
        sb.table("profiles").upsert({"id": uid, "custom_pfp": final_url}).execute()

        return {"url": final_url}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to upload profile photo")
        raise HTTPException(status_code=500, detail="Failed to upload photo")


def _public_profile_payload(sb, profile_row: dict) -> dict:
    uid = str(profile_row["id"])
    verification = None
    try:
        vr = sb.table("owner_verification").select(VERIFICATION_COLUMNS).eq("user_id", uid).execute()
        verification = vr.data[0] if vr.data else None
    except Exception:
        verification = None
    try:
        count_res = sb.table("listings").select("id", count="exact").eq("owner_id", uid).eq("moderation_status", "approved").execute()
        profile_row["listings_count"] = count_res.count if count_res.count is not None else 0
    except Exception:
        profile_row["listings_count"] = None
    out = to_public_owner(profile_row, verification) or {}
    out["most_useless_skill"] = profile_row.get("most_useless_skill")
    out["interests"] = profile_row.get("interests") or []
    out["occupation"] = profile_row.get("occupation")
    return out


@router.get("/public/{public_id}")
def get_public_profile_by_public_id(public_id: str):
    """Public profile by opaque public id. Never accepts the auth UUID."""
    if not PUBLIC_ID_RE.match(public_id):
        raise HTTPException(status_code=404, detail="Profile not found")
    sb = get_supabase_admin()
    res = sb.table("profiles").select(PUBLIC_PROFILE_COLUMNS).eq("public_id", public_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _public_profile_payload(sb, res.data[0])


@router.get("/{user_id}")
def get_public_profile(user_id: str):
    """Public profile (limited fields).

    Accepts either the opaque public id or, for links that predate public
    ids, the auth UUID. Nothing sensitive depends on the UUID being secret:
    this endpoint only ever returns the public contract.
    """
    sb = get_supabase_admin()
    try:
        if UUID_RE.match(user_id):
            res = sb.table("profiles").select(PUBLIC_PROFILE_COLUMNS).eq("id", user_id).execute()
        elif PUBLIC_ID_RE.match(user_id):
            res = sb.table("profiles").select(PUBLIC_PROFILE_COLUMNS).eq("public_id", user_id).execute()
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return _public_profile_payload(sb, res.data[0])
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to fetch public profile")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")


@router.post("/badges/refresh")
def refresh_badges(authorization: str = Header(...)):
    """Recalculate achievement badges.

    Trust is not a badge. "Verified host" used to be awarded here to anyone
    with at least one listing, which is how an unverified owner's listing
    page came to display "Verified host" next to identity_verified = false.
    Verification state now comes only from owner_verification (see
    public_dto.verification_summary); this endpoint awards activity badges.
    """
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()
        uid = str(user.id)

        badges: list[str] = []

        completed = sb.table("bookings").select("id").eq("seeker_id", uid).eq("status", "COMPLETED").execute()
        n_completed = len(completed.data or [])
        if n_completed >= 1:
            badges.append("Booked 1+ rooms")
        if n_completed >= 5:
            badges.append("Frequent Renter")
        if n_completed >= 10:
            badges.append("Seasoned Renter")

        listings = sb.table("listings").select("id").eq("owner_id", uid).eq("moderation_status", "approved").execute()
        n_listings = len(listings.data or [])
        if n_listings >= 3:
            badges.append("Superhost")
        if n_listings >= 10:
            badges.append("Mega Host")

        badges = [b for b in badges if b in ALLOWED_ACHIEVEMENT_BADGES]
        sb.table("profiles").update({"badges": badges}).eq("id", uid).execute()

        return {"badges": badges}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to refresh badges")
        raise HTTPException(status_code=500, detail="Failed to refresh badges")


@router.get("/resolve/{public_id}")
@limiter.limit("60/minute")
def resolve_public_id(request: Request, public_id: str, authorization: str = Header(...)):
    """Map an opaque public id to the recipient details a signed-in user
    needs to start a conversation. Requires a session; returns only the
    name, avatar and the id the messages API addresses. Authorisation never
    depends on this id being secret."""
    get_current_user(authorization)
    if not PUBLIC_ID_RE.match(public_id):
        raise HTTPException(status_code=404, detail="Profile not found")
    sb = get_supabase_admin()
    res = sb.table("profiles").select("id, public_id, name, preferred_name, custom_pfp").eq("public_id", public_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    row = res.data[0]
    return {
        "id": row["id"],
        "public_id": row.get("public_id"),
        "name": row.get("preferred_name") or row.get("name"),
        "custom_pfp": row.get("custom_pfp"),
    }
