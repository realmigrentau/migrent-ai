"""
Shared plumbing for the Migrent Hub endpoints.

Everything a Hub route needs before it touches its own table: who is asking
(and whether an admin is viewing as them), which role they hold, how to
batch-load listing cards without N+1 queries, Australian time zones, the
admin audit trail, and a guard that turns "the 043 tables are not there
yet" into a clear 503 instead of a stack trace.

Authorisation lives in the route handlers, next to the query it protects.
The helpers here only establish identity.
"""

from __future__ import annotations

import hashlib
import logging
import os
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from typing import Any, Iterable, Optional

from fastapi import HTTPException, Request

from auth_utils import (
    MFA_STEP_UP_DETAIL,
    get_current_user,
    mfa_enrolled,
    mfa_enrolled_cached,
    require_live_session,
    session_aal,
)
from concurrency import run_parallel
from db import get_supabase_admin

logger = logging.getLogger(__name__)

VIEW_AS_HEADER = "x-migrent-view-as"
VIEW_AS_WINDOW = timedelta(hours=1)

RENTER = "seeker"  # the stored value; the interface says "renter"
OWNER = "owner"
ADMIN_ROLES = ("admin", "superadmin")


# ---------------------------------------------------------------------------
# Identity
# ---------------------------------------------------------------------------


@dataclass
class HubActor:
    """The person a request acts for.

    `id` is whose data the request reads. When an admin is viewing as a
    customer, `id` is the customer and `viewer_admin_id` is the admin; the
    request is then read-only (enforced in `hub_actor`).
    """

    id: str
    email: Optional[str]
    profile: dict = field(default_factory=dict)
    is_admin: bool = False
    viewer_admin_id: Optional[str] = None

    @property
    def role(self) -> Optional[str]:
        return self.profile.get("role")

    @property
    def is_owner(self) -> bool:
        return self.role == OWNER

    @property
    def is_renter(self) -> bool:
        return self.role == RENTER

    @property
    def display_name(self) -> str:
        p = self.profile
        return (p.get("preferred_name") or p.get("name") or p.get("full_name") or "").strip() or "there"

    @property
    def read_only(self) -> bool:
        return self.viewer_admin_id is not None


PROFILE_COLUMNS = (
    "id, email, name, preferred_name, full_name, role, is_admin, custom_pfp, public_id, owner_kind, "
    "hub_onboarded_at, notification_prefs, phone, created_at, onboarding_completed, disabled_at, bio, about_me"
)


# Property managers' agency details (migration 049).
AGENCY_COLUMNS = "agency_name, agency_licence"


def load_profile(sb, user_id: str) -> dict:
    res = None
    for cols in (f"{PROFILE_COLUMNS}, {AGENCY_COLUMNS}", PROFILE_COLUMNS):
        try:
            res = sb.table("profiles").select(cols).eq("id", str(user_id)).execute()
            break
        except Exception:
            continue
    if res is None:
        # Before 043 the Hub columns do not exist; fall back to the old set.
        res = sb.table("profiles").select("id, email, name, preferred_name, role, is_admin, custom_pfp, created_at, bio, about_me").eq("id", str(user_id)).execute()
    return (res.data or [{}])[0] if res.data else {}


def _profile_is_admin(profile: dict) -> bool:
    return bool(profile.get("is_admin")) or profile.get("role") in ADMIN_ROLES


# Accounts this process has seen holding an admin role, so hub_actor can
# start their live session check without waiting for the profile.
_known_admins: set[str] = set()


def _view_as_allowed(sb, admin_id: str, target_id: str) -> bool:
    """An admin may view as a customer only inside a window they opened with
    POST /hub/admin/view-as, which writes the audit row this reads."""
    try:
        res = (
            sb.table("admin_audit_log")
            .select("action, target_id, created_at")
            .eq("admin_id", admin_id)
            .eq("target_id", target_id)
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )
    except Exception:
        return False
    for row in res.data or []:
        if row.get("action") == "view_as_end":
            return False
        if row.get("action") == "view_as_start":
            started = parse_ts(row.get("created_at"))
            return bool(started and datetime.now(timezone.utc) - started <= VIEW_AS_WINDOW)
    return False


def hub_actor(request: Request, authorization: Optional[str]) -> HubActor:
    """Resolve the signed-in user, honouring an admin's audited view-as.

    Viewing as someone is read-only by construction: any non-GET request that
    carries the header is refused, so no support session can send a message,
    approve an application or change a setting on a customer's behalf.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Sign in to continue")
    user = get_current_user(authorization)
    uid = str(user.id)
    sb = get_supabase_admin()

    # The profile, the two-step lookup and (for an admin) the live session
    # check are independent network round trips: start them together.
    # Whether someone is an admin is only known once the profile arrives,
    # so the live check runs alongside it for accounts this process has
    # already seen as admins, and after it otherwise. The checks still
    # decide in the original order: suspended, then two-step, then session.
    mfa_known: Optional[bool] = False if session_aal(authorization) == "aal2" else mfa_enrolled_cached(uid)
    live_early = uid in _known_admins

    def live_check() -> Optional[HTTPException]:
        try:
            require_live_session(authorization, uid)
        except HTTPException as e:
            return e
        return None

    tasks = [lambda: load_profile(sb, uid)]
    if mfa_known is None:
        tasks.append(lambda: mfa_enrolled(uid))
    if live_early:
        tasks.append(live_check)
    results = run_parallel(*tasks)
    profile = results[0]
    if mfa_known is None:
        mfa_known = results[1]
    live_error = results[-1] if live_early else None

    if profile.get("disabled_at"):
        raise HTTPException(status_code=403, detail="This account has been suspended. Contact support if you think this is a mistake.")
    if mfa_known:
        raise HTTPException(status_code=401, detail=MFA_STEP_UP_DETAIL)
    actor = HubActor(id=uid, email=getattr(user, "email", None), profile=profile, is_admin=_profile_is_admin(profile))
    if actor.is_admin:
        _known_admins.add(uid)
        # Admin sessions are checked live, so a revoked one stops at once
        # (auth_utils: local token checks cannot see revocation).
        if not live_early:
            live_error = live_check()
        if live_error is not None:
            raise live_error
    else:
        _known_admins.discard(uid)

    target = request.headers.get(VIEW_AS_HEADER)
    if not target or target == actor.id:
        return actor
    if not actor.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed")
    if request.method != "GET":
        raise HTTPException(status_code=403, detail="Viewing as a customer is read-only")
    if not _view_as_allowed(sb, actor.id, target):
        raise HTTPException(status_code=403, detail="Start a view-as session first")
    target_profile = load_profile(sb, target)
    if not target_profile:
        raise HTTPException(status_code=404, detail="User not found")
    return HubActor(
        id=str(target),
        email=target_profile.get("email"),
        profile=target_profile,
        is_admin=False,
        viewer_admin_id=actor.id,
    )


def require_writable(actor: HubActor) -> None:
    if actor.read_only:
        raise HTTPException(status_code=403, detail="Viewing as a customer is read-only")


def require_owner(actor: HubActor) -> None:
    if not actor.is_owner:
        raise HTTPException(status_code=403, detail="This is only available to accounts that list properties")


def require_admin_actor(actor: HubActor) -> None:
    if not actor.is_admin or actor.read_only:
        raise HTTPException(status_code=404, detail="Not found")


# ---------------------------------------------------------------------------
# Errors and time
# ---------------------------------------------------------------------------


def hub_table_error(exc: Exception) -> HTTPException:
    """Map a PostgREST 'relation does not exist' into an honest 503."""
    text = str(exc)
    if "does not exist" in text or "PGRST205" in text or "schema cache" in text:
        logger.error("Hub table missing - has migration 043 run? %s", text)
        return HTTPException(status_code=503, detail="This part of Migrent Hub is still being set up. Please try again soon.")
    logger.exception("Hub query failed")
    return HTTPException(status_code=500, detail="Something went wrong on our side. Please try again.")


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def now_iso() -> str:
    return now_utc().isoformat()


def parse_ts(value: Any) -> Optional[datetime]:
    if not value:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def parse_day(value: Any) -> Optional[date]:
    if not value:
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def timezone_for_postcode(postcode: Any) -> str:
    """IANA zone for an Australian postcode. Inspection times are stored in
    UTC and shown in the property's own zone, not the viewer's."""
    try:
        pc = int(postcode)
    except (TypeError, ValueError):
        return "Australia/Sydney"
    if 800 <= pc <= 999:
        return "Australia/Darwin"
    if 2600 <= pc <= 2618 or 2900 <= pc <= 2920:
        return "Australia/Sydney"  # ACT
    if 2000 <= pc <= 2999 or 1000 <= pc <= 1999:
        return "Australia/Broken_Hill" if pc == 2880 else "Australia/Sydney"
    if 3000 <= pc <= 3999 or 8000 <= pc <= 8999:
        return "Australia/Melbourne"
    if 4000 <= pc <= 4999 or 9000 <= pc <= 9999:
        return "Australia/Brisbane"
    if 5000 <= pc <= 5999:
        return "Australia/Adelaide"
    if 6000 <= pc <= 6999:
        return "Australia/Perth"
    if 7000 <= pc <= 7999:
        return "Australia/Hobart"
    return "Australia/Sydney"


def state_for_postcode(postcode: Any) -> Optional[str]:
    try:
        pc = int(postcode)
    except (TypeError, ValueError):
        return None
    if 800 <= pc <= 999:
        return "NT"
    if 2600 <= pc <= 2618 or 2900 <= pc <= 2920:
        return "ACT"
    if 1000 <= pc <= 2999:
        return "NSW"
    if 3000 <= pc <= 3999 or 8000 <= pc <= 8999:
        return "VIC"
    if 4000 <= pc <= 4999 or 9000 <= pc <= 9999:
        return "QLD"
    if 5000 <= pc <= 5999:
        return "SA"
    if 6000 <= pc <= 6999:
        return "WA"
    if 7000 <= pc <= 7999:
        return "TAS"
    return None


# ---------------------------------------------------------------------------
# Listing cards
# ---------------------------------------------------------------------------

CARD_COLUMNS = (
    "id, owner_id, address, title, suburb, city, postcode, weekly_price, images, property_type, place_type, "
    "bedrooms, bathrooms, parking, furnished, bills_included, pets_allowed, available_from, available_to, "
    "moderation_status, hidden_at, latitude, longitude, created_at, updated_at, property_id, unit_label, "
    "listing_purpose, occupancy, occupied_until, nearest_transport, station_distance_min, min_stay_weeks, "
    "require_verified_renters"
)
CARD_COLUMNS_LEGACY = (
    "id, owner_id, address, title, suburb, city, postcode, weekly_price, images, property_type, place_type, "
    "bedrooms, bathrooms, parking, furnished, bills_included, pets_allowed, available_from, available_to, "
    "moderation_status, hidden_at, latitude, longitude, created_at, updated_at, nearest_transport, "
    "station_distance_min, min_stay_weeks"
)


def fetch_listings(sb, ids: Iterable[str], columns: str = CARD_COLUMNS) -> dict[str, dict]:
    """Batch-load listings keyed by id (one query, not one per card)."""
    wanted = [str(i) for i in {str(x) for x in ids if x}]
    if not wanted:
        return {}
    try:
        res = sb.table("listings").select(columns).in_("id", wanted).execute()
    except Exception:
        res = sb.table("listings").select(CARD_COLUMNS_LEGACY).in_("id", wanted).execute()
    rows = res.data or []
    from listing_lifecycle import mark_suspended_owners

    mark_suspended_owners(rows)
    return {str(r["id"]): r for r in rows}


def listing_card(row: Optional[dict], *, viewer_is_owner: bool = False) -> Optional[dict]:
    """The compact shape every Hub list renders. The street address is only
    included for the listing's owner."""
    if not row:
        return None
    from public_dto import listing_public_state

    images = row.get("images") or []
    if isinstance(images, str):
        images = [images]
    suburb = row.get("suburb") or row.get("city") or ""
    card = {
        "id": str(row.get("id")),
        "title": row.get("title") or (f"{row.get('property_type') or 'Home'} in {suburb}".strip()),
        "suburb": row.get("suburb"),
        "city": row.get("city"),
        "postcode": row.get("postcode"),
        "state": state_for_postcode(row.get("postcode")),
        "timezone": timezone_for_postcode(row.get("postcode")),
        "display_address": f"{suburb} {row.get('postcode') or ''}".strip() or "Australia",
        "weekly_price": row.get("weekly_price"),
        "image": images[0] if images else None,
        "images": images[:6],
        "property_type": row.get("property_type"),
        "place_type": row.get("place_type"),
        "bedrooms": row.get("bedrooms"),
        "bathrooms": row.get("bathrooms"),
        "parking": row.get("parking"),
        "furnished": row.get("furnished"),
        "bills_included": row.get("bills_included"),
        "pets_allowed": row.get("pets_allowed"),
        "available_from": row.get("available_from"),
        "available_to": row.get("available_to"),
        "public_state": listing_public_state(row),
        "unit_label": row.get("unit_label"),
        "listing_purpose": row.get("listing_purpose") or "long_term",
        "nearest_transport": row.get("nearest_transport"),
        "require_verified_renters": bool(row.get("require_verified_renters")),
    }
    if viewer_is_owner:
        card.update(
            {
                "moderation_status": row.get("moderation_status"),
                "property_id": row.get("property_id"),
                "occupancy": row.get("occupancy") or "vacant",
                "occupied_until": row.get("occupied_until"),
                "street_address": row.get("address"),
            }
        )
    return card


def fetch_people(sb, ids: Iterable[str]) -> dict[str, dict]:
    """Names and avatars for the other side of a conversation or application.
    Deliberately excludes contact details and anything private."""
    wanted = [str(i) for i in {str(x) for x in ids if x}]
    if not wanted:
        return {}
    try:
        res = sb.table("profiles").select("id, name, preferred_name, custom_pfp, public_id, created_at").in_("id", wanted).execute()
    except Exception:
        res = sb.table("profiles").select("id, name, preferred_name, custom_pfp, created_at").in_("id", wanted).execute()
    out = {}
    for p in res.data or []:
        out[str(p["id"])] = {
            "id": str(p["id"]),
            "name": (p.get("preferred_name") or p.get("name") or "Migrent member").strip(),
            "avatar_url": p.get("custom_pfp"),
            "public_id": p.get("public_id"),
            "member_since": (p.get("created_at") or "")[:10] or None,
        }
    return out


def owner_verified_map(sb, owner_ids: Iterable[str]) -> dict[str, str]:
    """owner id -> 'verified' | 'pending' | 'unverified', from owner_verification only."""
    from public_dto import verification_summary

    ids = [str(i) for i in {str(x) for x in owner_ids if x}]
    if not ids:
        return {}
    try:
        res = sb.table("owner_verification").select("user_id, id_status, email_verified, phone_verified, fully_verified, id_reviewed_at").in_("user_id", ids).execute()
    except Exception:
        return {}
    rows = {str(r["user_id"]): r for r in (res.data or [])}
    return {i: verification_summary(rows.get(i))["status"] for i in ids}


# ---------------------------------------------------------------------------
# Audit and analytics
# ---------------------------------------------------------------------------


def audit(sb, *, admin_id: str, action: str, target_type: str, target_id: str, reason: Optional[str] = None, metadata: Optional[dict] = None) -> None:
    """Append to admin_audit_log. Raises on failure: an admin action that
    cannot be recorded must not be allowed to look successful."""
    sb.table("admin_audit_log").insert(
        {
            "admin_id": admin_id,
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "reason": reason,
            "metadata": metadata or {},
        }
    ).execute()


_ACTOR_SALT = os.environ.get("ANALYTICS_SALT", "migrent-listing-events")


def actor_hash(value: str) -> str:
    return hashlib.sha256(f"{_ACTOR_SALT}:{value}".encode()).hexdigest()[:24]


def record_listing_event(sb, listing_id: str, event: str, actor_key: Optional[str], source: str = "hub") -> None:
    """Best effort. Analytics must never break the action it measures."""
    try:
        sb.table("listing_events").insert(
            {
                "listing_id": str(listing_id),
                "event": event,
                "actor_hash": actor_hash(actor_key) if actor_key else None,
                "source": source,
            }
        ).execute()
    except Exception:
        logger.warning("listing_events insert failed (%s, %s)", listing_id, event)


def hub_path(path: str) -> str:
    """Absolute URL of a Hub page, for emails and notifications.

    HUB_BASE_URL is the Hub's own origin once it has one (hub.<domain>);
    until then the Hub lives under /hub on the main site.
    """
    base = os.environ.get("HUB_BASE_URL", "").rstrip("/")
    if base:
        return f"{base}{path}"
    return f"/hub{path}"


def user_email(sb, user_id: str) -> Optional[str]:
    try:
        res = sb.auth.admin.get_user_by_id(str(user_id))
        return getattr(getattr(res, "user", None), "email", None)
    except Exception:
        return None


def notify_user(sb, user_id: str, event: str, title: str, body: str, path: str, *, entity_type: Optional[str] = None, entity_id: Optional[str] = None) -> None:
    """In-app notification plus email (subject to the person's preferences),
    deep-linked to a Hub page. Never raises: a failed email must not undo
    the action that triggered it."""
    try:
        from notification_service import notify

        prof = sb.table("profiles").select("name, preferred_name").eq("id", str(user_id)).execute()
        name = None
        if prof.data:
            name = prof.data[0].get("preferred_name") or prof.data[0].get("name")
        notify(
            user_id=str(user_id),
            event=event,
            title=title,
            body=body,
            cta_url=hub_path(path),
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            recipient_email=user_email(sb, user_id),
            recipient_name=(name or "there").split(" ")[0],
        )
    except Exception:
        logger.exception("notify_user failed (%s, %s)", user_id, event)

