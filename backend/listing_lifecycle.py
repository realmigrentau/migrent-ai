"""
Listing lifecycle.

Internal moderation_status values and how they map onto the public lifecycle
vocabulary used in product copy and in docs/product/listing-lifecycle.md:

    public name       moderation_status
    ------------      -----------------------------------------------
    draft             draft
    pending_review    pending_approval, changes_requested, flagged
    published         approved   (and available_to is today or later)
    paused            paused     (owner or admin took it offline, reversible)
    expired           expired    (available_to has passed; owner may renew)
    rejected          rejected
    archived          deleted    (soft delete; never hard-deleted)
    quarantined       hidden     (spam system or admin; invisible everywhere)

The database enumerates every value in listings_moderation_status_check
(migration 042). Only 'approved' rows with an open availability window are
ever publicly visible; that predicate lives in one place, `public_filter`,
and is mirrored by the public_listings view and the RLS policy.
"""

from __future__ import annotations

import logging
from datetime import date, timedelta
from typing import Any, Optional

logger = logging.getLogger(__name__)

STATUS_DRAFT = "draft"
STATUS_PENDING = "pending_approval"
STATUS_CHANGES = "changes_requested"
STATUS_APPROVED = "approved"
STATUS_PAUSED = "paused"
STATUS_EXPIRED = "expired"
STATUS_REJECTED = "rejected"
STATUS_DELETED = "deleted"
STATUS_HIDDEN = "hidden"
STATUS_FLAGGED = "flagged"

ALL_STATUSES = (
    STATUS_DRAFT,
    STATUS_PENDING,
    STATUS_CHANGES,
    STATUS_APPROVED,
    STATUS_PAUSED,
    STATUS_EXPIRED,
    STATUS_REJECTED,
    STATUS_DELETED,
    STATUS_HIDDEN,
    STATUS_FLAGGED,
    "delete_requested",
)

# Statuses an owner may move back into review themselves.
OWNER_SUBMITTABLE = (STATUS_DRAFT, STATUS_CHANGES, STATUS_REJECTED, STATUS_EXPIRED, STATUS_PAUSED)

# How far ahead availability may be set. Anything longer is almost always a
# typo (2062 instead of 2026) and would keep a stale listing live for decades.
MAX_AVAILABILITY_HORIZON = timedelta(days=548)  # ~18 months

# Days before expiry at which the owner is emailed.
EXPIRY_REMINDER_DAYS = 7


class AvailabilityError(ValueError):
    pass


def parse_iso_date(value: Any, field: str) -> Optional[date]:
    if value in (None, ""):
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        raise AvailabilityError(f"{field} must be a date in YYYY-MM-DD form")


def validate_availability_window(
    available_from: Any,
    available_to: Any,
    *,
    today: Optional[date] = None,
    allow_past_start: bool = True,
) -> tuple[Optional[date], Optional[date]]:
    """Validate an owner-supplied availability window.

    - both dates must be ISO dates
    - available_to must be on or after available_from
    - available_to must not already be in the past (a listing cannot be
      published as available until a date that has gone)
    - neither date may be more than ~18 months out
    """
    today = today or date.today()
    start = parse_iso_date(available_from, "available_from")
    end = parse_iso_date(available_to, "available_to")

    horizon = today + MAX_AVAILABILITY_HORIZON
    if start is not None and start > horizon:
        raise AvailabilityError("available_from is too far in the future (maximum 18 months)")
    if end is not None and end > horizon:
        raise AvailabilityError("available_to is too far in the future (maximum 18 months)")
    if start is not None and not allow_past_start and start < today:
        raise AvailabilityError("available_from cannot be in the past")
    if end is not None and end < today:
        raise AvailabilityError("available_to has already passed. Choose a date from today onward.")
    if start is not None and end is not None and end < start:
        raise AvailabilityError("available_to must be on or after available_from")
    return start, end


def validate_search_dates(check_in: Any, check_out: Any, *, today: Optional[date] = None) -> tuple[Optional[date], Optional[date]]:
    """Validate seeker-supplied search dates. Past move-in dates are clamped
    to today rather than rejected, because a link shared last week should
    still work; impossible ranges are rejected."""
    today = today or date.today()
    start = parse_iso_date(check_in, "check_in")
    end = parse_iso_date(check_out, "check_out")
    if start is not None and start < today:
        start = today
    horizon = today + MAX_AVAILABILITY_HORIZON
    if start is not None and start > horizon:
        raise AvailabilityError("check_in is too far in the future")
    if end is not None and end > horizon + timedelta(days=365):
        raise AvailabilityError("check_out is too far in the future")
    if start is not None and end is not None and end <= start:
        raise AvailabilityError("check_out must be after check_in")
    if end is not None and start is None and end <= today:
        raise AvailabilityError("check_out must be in the future")
    return start, end


def public_filter(query, today: Optional[date] = None):
    """Apply the single predicate that decides whether a listing is public.

    Mirrors the `public_listings` view and the `listings_public_read` policy
    from migration 042. Keep the three in sync.
    """
    today = today or date.today()
    iso = today.isoformat()
    query = query.eq("moderation_status", STATUS_APPROVED)
    query = query.is_("hidden_at", "null")
    query = query.or_(f"available_to.is.null,available_to.gte.{iso}")
    return query


def availability_filter(query, check_in: Optional[date], check_out: Optional[date]):
    """Constrain results to listings whose window covers the requested stay."""
    if check_in is not None:
        iso_in = check_in.isoformat()
        # Available on or before the move-in date (or no start date given).
        query = query.or_(f"available_from.is.null,available_from.lte.{iso_in}")
        # Still available on the move-in date.
        query = query.or_(f"available_to.is.null,available_to.gte.{iso_in}")
    if check_out is not None:
        iso_out = check_out.isoformat()
        query = query.or_(f"available_to.is.null,available_to.gte.{iso_out}")
    return query


def record_event(
    sb,
    *,
    listing_id: str,
    actor_id: Optional[str],
    actor_type: str,
    event_type: str,
    old_status: Optional[str],
    new_status: Optional[str],
    notes: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> None:
    """Append to moderation_events. Never raises: an audit failure must not
    roll back the user-facing action, but it must be logged loudly."""
    try:
        sb.table("moderation_events").insert(
            {
                "listing_id": listing_id,
                "actor_id": actor_id,
                "actor_type": actor_type,
                "event_type": event_type,
                "old_status": old_status,
                "new_status": new_status,
                "notes": notes,
                "metadata": metadata or {},
            }
        ).execute()
    except Exception:
        logger.exception("moderation_events insert failed for listing %s (%s)", listing_id, event_type)


def expire_listings(sb, today: Optional[date] = None) -> list[str]:
    """Move approved listings whose availability has ended to 'expired'.

    Returns the ids that were expired. Idempotent: rows already expired are
    not touched. The read paths never rely on this having run, because
    `public_filter` also excludes them by date; this exists so owners get a
    clear status and a renewal prompt.
    """
    today = today or date.today()
    res = (
        sb.table("listings")
        .select("id, owner_id, moderation_status, available_to")
        .eq("moderation_status", STATUS_APPROVED)
        .lt("available_to", today.isoformat())
        .execute()
    )
    expired: list[str] = []
    for row in res.data or []:
        try:
            sb.table("listings").update(
                {"moderation_status": STATUS_EXPIRED, "expired_at": today.isoformat()}
            ).eq("id", row["id"]).eq("moderation_status", STATUS_APPROVED).execute()
            record_event(
                sb,
                listing_id=row["id"],
                actor_id=None,
                actor_type="system",
                event_type="expired",
                old_status=STATUS_APPROVED,
                new_status=STATUS_EXPIRED,
                notes=f"available_to {row.get('available_to')} passed",
            )
            expired.append(row["id"])
        except Exception:
            logger.exception("Failed to expire listing %s", row.get("id"))
    return expired


def listings_expiring_soon(sb, today: Optional[date] = None, days: int = EXPIRY_REMINDER_DAYS) -> list[dict]:
    """Approved listings whose availability ends within `days` and whose
    owner has not yet been reminded."""
    today = today or date.today()
    cutoff = today + timedelta(days=days)
    res = (
        sb.table("listings")
        .select("id, owner_id, title, address, suburb, available_to, expiry_notified_at")
        .eq("moderation_status", STATUS_APPROVED)
        .gte("available_to", today.isoformat())
        .lte("available_to", cutoff.isoformat())
        .is_("expiry_notified_at", "null")
        .execute()
    )
    return res.data or []
