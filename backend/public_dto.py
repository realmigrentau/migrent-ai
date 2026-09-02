"""
Public data contract for anonymous and non-owner responses.

Every public listing, owner and profile payload the API returns is built here
from an explicit allow-list. Nothing outside the allow-list can reach the
browser by accident when a column is added to the database.

Rules encoded here (see docs/security/public-data-contract.md):

* Exact coordinates and the street address are never public. The public
  payload carries an approximate map area centred on a deterministically
  jittered point inside roughly 400 m of the property, plus suburb, postcode
  and city. The exact address is released only to the owner, to admins, and
  to a seeker whose booking the owner has accepted.
* The owner's auth UUID is never public. Public routing uses profiles.public_id.
* Moderation, spam, hidden and deletion metadata never leave the server.
* Trust state is computed from owner_verification, never from a profile's
  free-text badges array or from the paid `verified` flag.
"""

from __future__ import annotations

import hashlib
import math
from datetime import date, datetime
from typing import Any, Iterable, Optional

# ---------------------------------------------------------------------------
# Listing
# ---------------------------------------------------------------------------

# Columns a signed-out visitor may see on a listing card or listing page.
PUBLIC_LISTING_FIELDS: tuple[str, ...] = (
    "id",
    "title",
    "suburb",
    "city",
    "postcode",
    "weekly_price",
    "daily_price",
    "description",
    "images",
    "property_type",
    "place_type",
    "room_type",
    "bedrooms",
    "beds",
    "bathrooms",
    "bathroom_type",
    "max_guests",
    "furnished",
    "bills_included",
    "parking",
    "air_conditioning",
    "pets_allowed",
    "pet_details",
    "couples_ok",
    "gender_preference",
    "instant_book",
    "instant_book_enabled",
    "internet_included",
    "internet_speed",
    "laundry",
    "dishwasher",
    "available_from",
    "available_to",
    "min_stay",
    "min_stay_weeks",
    "max_stay_weeks",
    "nearest_transport",
    "station_distance_min",
    "neighbourhood_vibe",
    "highlights",
    "no_smoking",
    "quiet_hours",
    "tenant_prefs",
    "security_cameras",
    "security_cameras_location",
    "other_safety_details",
    "who_else_lives_here",
    "total_other_people",
    "weekly_discount",
    "monthly_discount",
    "bond",
    "created_at",
    "updated_at",
)

# Columns that must NEVER appear in a public payload. Tests assert against
# this list, and to_public_listing strips anything not in the allow-list, so
# this exists to make the intent explicit and greppable.
FORBIDDEN_PUBLIC_LISTING_FIELDS: tuple[str, ...] = (
    "address",
    "street_address",
    "geocoded_address",
    "latitude",
    "longitude",
    "owner_id",
    "moderation_status",
    "moderation_notes",
    "moderation_reason",
    "moderator_id",
    "moderated_at",
    "spam_score",
    "spam_reasons",
    "flagged_at",
    "reviewed_at",
    "reviewed_by",
    "delete_requested_at",
    "delete_approved_at",
    "hidden_at",
    "content_hash",
    "expiry_notified_at",
    "listing_fee_paid_at",
    "weapons_on_property",
    "weapons_explanation",
)

# Profile columns that never leave the server in any non-owner response.
FORBIDDEN_PUBLIC_PROFILE_FIELDS: tuple[str, ...] = (
    "email",
    "phone",
    "phones",
    "residential_address",
    "emergency_contact",
    "recovery_password_hash",
    "identity_verification_url",
    "age",
    "date_of_birth",
    "visa_type",
    "budget_min",
    "budget_max",
    "move_in_date",
    "preferred_suburbs",
    "is_admin",
    "role",
    "verified",
    "is_verified",
    "legal_name",
    "wishlist",
    "notify_email",
    "notify_sms",
    "disabled_at",
    "onboarding_completed",
)

# Free-text badge strings that must never be shown as a trust signal. Any
# badge containing one of these fragments is dropped from public payloads.
TRUST_VOCABULARY: tuple[str, ...] = (
    "verif",
    "identity",
    "id check",
    "trusted",
    "safe",
    "vetted",
    "checked",
)

# Achievement badges the platform may show. Anything else is dropped.
ALLOWED_ACHIEVEMENT_BADGES: frozenset[str] = frozenset(
    {
        "Booked 1+ rooms",
        "Frequent Renter",
        "Seasoned Renter",
        "Superhost",
        "Mega Host",
        "Early member",
        "Mentor",
    }
)

VERIFICATION_EXPLAINER_URL = "/safety-verification"


def _today() -> date:
    return date.today()


def _parse_date(value: Any) -> Optional[date]:
    if value is None or value == "":
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def approximate_location(listing_id: str, lat: Any, lng: Any, radius_m: float = 400.0) -> Optional[dict]:
    """Return a deterministic, jittered point near the property.

    The offset is derived from a hash of the listing id so it is stable across
    requests (a moving pin would let someone triangulate the true location) and
    is bounded by ``radius_m``. The returned point is rounded to three decimal
    places (roughly 100 m) so the payload itself does not carry sub-block
    precision.
    """
    try:
        lat_f = float(lat)
        lng_f = float(lng)
    except (TypeError, ValueError):
        return None
    if not (-90 <= lat_f <= 90 and -180 <= lng_f <= 180):
        return None

    digest = hashlib.sha256(f"migrent-approx:{listing_id}".encode()).digest()
    angle = (int.from_bytes(digest[0:4], "big") / 0xFFFFFFFF) * 2 * math.pi
    # Bias the distance away from the centre so the true point is not the
    # most likely position.
    dist = radius_m * (0.35 + 0.65 * (int.from_bytes(digest[4:8], "big") / 0xFFFFFFFF))

    d_lat = (dist * math.cos(angle)) / 111_320.0
    d_lng = (dist * math.sin(angle)) / (111_320.0 * max(math.cos(math.radians(lat_f)), 0.01))

    return {
        "approx_lat": round(lat_f + d_lat, 3),
        "approx_lng": round(lng_f + d_lng, 3),
        "radius_m": int(radius_m),
        "precision": "approximate",
    }


def listing_public_state(row: dict, today: Optional[date] = None) -> str:
    """Map the internal moderation status + availability onto the public
    lifecycle vocabulary.

    published        approved, not hidden, availability still open
    expired          approved (or explicitly expired) but available_to has passed
    unavailable      anything else: draft, pending review, paused, rejected,
                     hidden, archived
    """
    today = today or _today()
    status = row.get("moderation_status")
    if status == "expired":
        return "expired"
    if status != "approved" or row.get("hidden_at"):
        return "unavailable"
    available_to = _parse_date(row.get("available_to"))
    if available_to is not None and available_to < today:
        return "expired"
    return "published"


def is_publicly_visible(row: dict, today: Optional[date] = None) -> bool:
    return listing_public_state(row, today) == "published"


def verification_summary(verification_row: Optional[dict]) -> dict:
    """Public trust state derived only from owner_verification.

    ``status`` is one of:
      verified     government ID approved by an admin and email confirmed
      pending      an ID has been submitted and is awaiting review
      unverified   nothing submitted, or the last submission was rejected

    ``checks`` lists each individual check so the UI can say exactly what was
    completed instead of a single ambiguous tick.
    """
    v = verification_row or {}
    id_status = v.get("id_status") or "not_submitted"
    email_ok = bool(v.get("email_verified"))
    phone_ok = bool(v.get("phone_verified"))
    id_ok = id_status == "approved"
    fully = bool(v.get("fully_verified")) and id_ok and email_ok

    if fully:
        status = "verified"
    elif id_status == "pending":
        status = "pending"
    else:
        status = "unverified"

    return {
        "status": status,
        "checks": {
            "email_confirmed": email_ok,
            "phone_confirmed": phone_ok,
            "government_id": id_status if id_status in ("approved", "pending", "rejected") else "not_submitted",
        },
        "verified_at": v.get("id_reviewed_at") if fully else None,
        "explainer_url": VERIFICATION_EXPLAINER_URL,
        # Verification is a check that was completed, not a promise about a
        # person. The UI must always render this sentence next to the badge.
        "disclaimer": "Verification confirms documents were checked. It is not a guarantee of safety or suitability.",
    }


def public_badges(badges: Optional[Iterable[str]]) -> list[str]:
    """Drop any badge that reads as a trust claim, keep known achievements."""
    out: list[str] = []
    for b in badges or []:
        if not isinstance(b, str):
            continue
        lowered = b.lower()
        if any(word in lowered for word in TRUST_VOCABULARY):
            continue
        if b in ALLOWED_ACHIEVEMENT_BADGES:
            out.append(b)
    return out


def to_public_owner(profile_row: Optional[dict], verification_row: Optional[dict]) -> Optional[dict]:
    """The owner card: a name, an avatar, and an honest verification state."""
    if not profile_row:
        return None
    name = profile_row.get("preferred_name") or profile_row.get("name")
    return {
        "public_id": profile_row.get("public_id"),
        "name": name,
        "avatar_url": profile_row.get("custom_pfp"),
        "bio": profile_row.get("bio") or profile_row.get("about_me"),
        "member_since": (profile_row.get("created_at") or "")[:10] or None,
        "listings_count": profile_row.get("listings_count"),
        "achievement_badges": public_badges(profile_row.get("badges")),
        "verification": verification_summary(verification_row),
    }


def to_public_listing(
    row: dict,
    *,
    owner_profile: Optional[dict] = None,
    owner_verification: Optional[dict] = None,
    today: Optional[date] = None,
) -> dict:
    """Serialise a listing row for anyone who is not its owner or an admin."""
    out: dict[str, Any] = {}
    for key in PUBLIC_LISTING_FIELDS:
        if key in row:
            out[key] = row[key]

    # The public "address" is the suburb and postcode, never the street.
    suburb = row.get("suburb") or row.get("city") or ""
    postcode = row.get("postcode")
    out["display_address"] = f"{suburb} {postcode}".strip() if (suburb or postcode) else "Australia"

    out["location"] = approximate_location(str(row.get("id")), row.get("latitude"), row.get("longitude"))
    out["public_state"] = listing_public_state(row, today)
    out["owner"] = to_public_owner(owner_profile, owner_verification)
    out["host_verification"] = out["owner"]["verification"] if out["owner"] else verification_summary(None)
    return out


def to_owner_listing(row: dict, *, owner_profile: Optional[dict] = None, owner_verification: Optional[dict] = None, today: Optional[date] = None) -> dict:
    """The owner's (and an admin's) view: everything public, plus the private
    fields they legitimately need to manage the listing. Internal spam scores
    and moderator identities still stay on the server; moderation notes and
    reasons are shared because the owner has to act on them."""
    out = to_public_listing(row, owner_profile=owner_profile, owner_verification=owner_verification, today=today)
    out["street_address"] = row.get("address")
    out["geocoded_address"] = row.get("geocoded_address")
    out["exact_location"] = (
        {"lat": row.get("latitude"), "lng": row.get("longitude")}
        if row.get("latitude") is not None and row.get("longitude") is not None
        else None
    )
    out["owner_id"] = row.get("owner_id")
    out["moderation_status"] = row.get("moderation_status")
    out["moderation_notes"] = row.get("moderation_notes")
    out["moderation_reason"] = row.get("moderation_reason")
    out["moderated_at"] = row.get("moderated_at")
    out["listing_fee_paid_at"] = row.get("listing_fee_paid_at")
    out["weapons_on_property"] = row.get("weapons_on_property")
    out["weapons_explanation"] = row.get("weapons_explanation")
    return out


def assert_no_forbidden_fields(payload: Any) -> list[str]:
    """Walk a payload and return any forbidden key found. Used by tests and by
    a debug assertion in non-production environments."""
    forbidden = set(FORBIDDEN_PUBLIC_LISTING_FIELDS) | set(FORBIDDEN_PUBLIC_PROFILE_FIELDS)
    found: list[str] = []

    def walk(obj: Any, path: str) -> None:
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k in forbidden:
                    found.append(f"{path}.{k}" if path else k)
                walk(v, f"{path}.{k}" if path else k)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                walk(item, f"{path}[{i}]")

    walk(payload, "")
    return found
