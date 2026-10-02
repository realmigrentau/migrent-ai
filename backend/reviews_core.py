"""Reviews on real tenancies and stays (MIGRENT_MASTER_AUDIT MIG-011).

Both ways (owner decision, 2026-10-02):

* A renter reviews the home and its host ("seeker_to_owner"). These are
  public: on the listing page and the host's record.
* A host reviews the renter ("owner_to_seeker"). These are never public;
  only a host the renter later applies to sees them, on that application.

Who may review, and when:

* A tenancy, once it has run MIN_TENANCY_DAYS or has ended, until
  REVIEW_WINDOW_DAYS after it ended.
* A stay booked on Migrent (accepted or paid), once check-out has passed,
  until REVIEW_WINDOW_DAYS after it.
* One review per person per tenancy or stay, and no editing afterwards.

Neither side sees the other's review first: a review is shown once both
have written theirs, or BLIND_DAYS after it was written, so nobody can
answer a bad review with a bad one.

Reviews are hidden when flagged (a report to Migrent is reviewed by an
admin; the person reviewed cannot hide one by flagging it).
"""

from datetime import date, datetime, timedelta, timezone
from typing import Any, Optional

MIN_TENANCY_DAYS = 30
REVIEW_WINDOW_DAYS = 60
BLIND_DAYS = 14

RENTER_REVIEW = "seeker_to_owner"
HOST_REVIEW = "owner_to_seeker"

# Stay bookings that actually happened (models.BookingStatus values).
STAY_STATUSES = ("OWNER_ACCEPTED", "PAID", "COMPLETED")


def _day(v: Any) -> Optional[date]:
    if not v:
        return None
    if isinstance(v, date) and not isinstance(v, datetime):
        return v
    try:
        return date.fromisoformat(str(v)[:10])
    except ValueError:
        return None


def _ts(v: Any) -> Optional[datetime]:
    if not v:
        return None
    try:
        t = datetime.fromisoformat(str(v).replace("Z", "+00:00"))
    except ValueError:
        return None
    return t if t.tzinfo else t.replace(tzinfo=timezone.utc)


# ---------------------------------------------------------------------------
# Who may review
# ---------------------------------------------------------------------------


def tenancy_window(t: dict, today: date) -> Optional[tuple[date, date]]:
    """(opens, closes) for reviewing a tenancy, or None if it never will be."""
    status = t.get("status")
    start = _day(t.get("start_date"))
    if status not in ("active", "ended") or not start:
        return None
    end = _day(t.get("end_date"))
    if status == "ended":
        ended = end if end and end <= today else today
        opens = min(start + timedelta(days=MIN_TENANCY_DAYS), ended)
        return opens, ended + timedelta(days=REVIEW_WINDOW_DAYS)
    closes = (end + timedelta(days=REVIEW_WINDOW_DAYS)) if end else date.max
    return start + timedelta(days=MIN_TENANCY_DAYS), closes


def stay_window(b: dict, today: date) -> Optional[tuple[date, date]]:
    if str(b.get("status") or "").upper() not in STAY_STATUSES:
        return None
    out = _day(b.get("check_out_date"))
    if not out:
        return None
    return out, out + timedelta(days=REVIEW_WINDOW_DAYS)


def is_open(window: Optional[tuple[date, date]], today: date) -> bool:
    return bool(window) and window[0] <= today <= window[1]


# ---------------------------------------------------------------------------
# What is shown
# ---------------------------------------------------------------------------


def _context(r: dict) -> Optional[str]:
    if r.get("tenancy_id"):
        return f"t:{r['tenancy_id']}"
    if r.get("booking_id"):
        return f"b:{r['booking_id']}"
    return None


def published(reviews: list[dict], *, now: Optional[datetime] = None) -> list[dict]:
    """The reviews in `reviews` that may be shown: not hidden, and either
    the other side has reviewed the same tenancy or stay, or BLIND_DAYS have
    passed. `reviews` must include both sides' reviews of each context."""
    now = now or datetime.now(timezone.utc)
    by_context: dict[str, set[str]] = {}
    for r in reviews:
        ctx = _context(r)
        if ctx:
            by_context.setdefault(ctx, set()).add(str(r.get("review_type")))
    out = []
    for r in reviews:
        if r.get("flagged"):
            continue
        ctx = _context(r)
        if not ctx:
            continue  # pre-2026-10 reviews tied to retired deals: none exist
        both = len(by_context.get(ctx, set())) == 2
        old_enough = (_ts(r.get("created_at")) or now) <= now - timedelta(days=BLIND_DAYS)
        if both or old_enough:
            out.append(r)
    return out


def _with_counterparts(sb, rows: list[dict]) -> list[dict]:
    """Add the other side's reviews of the same tenancies and stays, so
    published() can tell whether both have reviewed."""
    tenancy_ids = list({str(r["tenancy_id"]) for r in rows if r.get("tenancy_id")})
    booking_ids = list({str(r["booking_id"]) for r in rows if r.get("booking_id")})
    seen = {str(r["id"]) for r in rows}
    extra: list[dict] = []
    for col, ids in (("tenancy_id", tenancy_ids), ("booking_id", booking_ids)):
        if ids:
            for r in sb.table("reviews").select("*").in_(col, ids).execute().data or []:
                if str(r["id"]) not in seen:
                    seen.add(str(r["id"]))
                    extra.append(r)
    return rows + extra


def _people(sb, ids: list[str]) -> dict[str, dict]:
    ids = [i for i in {str(i) for i in ids if i}]
    if not ids:
        return {}
    rows = sb.table("profiles").select("id, name, preferred_name, custom_pfp").in_("id", ids).execute().data or []
    return {str(p["id"]): p for p in rows}


def _first_name(p: dict) -> str:
    return ((p.get("preferred_name") or p.get("name") or "A Migrent member").strip().split(" ") or ["A Migrent member"])[0]


def public_review(r: dict, reviewer: dict) -> dict:
    """What anyone may see of a renter's review: first name only."""
    return {
        "id": r["id"],
        "rating": r.get("rating"),
        "review_text": r.get("review_text"),
        "migrant_friendliness": r.get("migrant_friendliness"),
        "photos": [],
        "created_at": r.get("created_at"),
        "kind": "stay" if r.get("booking_id") else "tenancy",
        "reviewer_name": _first_name(reviewer),
        "reviewer_photo": reviewer.get("custom_pfp"),
    }


def stats(reviews: list[dict]) -> dict:
    n = len(reviews)
    friendly = [r["migrant_friendliness"] for r in reviews if r.get("migrant_friendliness")]
    return {
        "review_count": n,
        "avg_rating": round(sum(int(r.get("rating") or 0) for r in reviews) / n, 2) if n else 0,
        "avg_migrant_friendliness": round(sum(friendly) / len(friendly), 2) if friendly else None,
        "positive_count": sum(1 for r in reviews if int(r.get("rating") or 0) >= 4),
    }


def listing_reviews(sb, listing_id: str) -> list[dict]:
    """Published renter reviews of one listing, newest first."""
    rows = sb.table("reviews").select("*").eq("listing_id", listing_id).eq("review_type", RENTER_REVIEW).execute().data or []
    shown = [r for r in published(_with_counterparts(sb, rows)) if r.get("review_type") == RENTER_REVIEW and str(r.get("listing_id")) == str(listing_id)]
    shown.sort(key=lambda r: str(r.get("created_at") or ""), reverse=True)
    return shown


def host_reviews(sb, host_id: str) -> list[dict]:
    """Published renter reviews of one host, across their homes."""
    rows = sb.table("reviews").select("*").eq("reviewed_user_id", host_id).eq("review_type", RENTER_REVIEW).execute().data or []
    shown = [r for r in published(_with_counterparts(sb, rows)) if r.get("review_type") == RENTER_REVIEW and str(r.get("reviewed_user_id")) == str(host_id)]
    shown.sort(key=lambda r: str(r.get("created_at") or ""), reverse=True)
    return shown


def renter_reviews(sb, renter_id: str) -> list[dict]:
    """Published host reviews of one renter. Only for a host deciding on
    that renter's application; never public."""
    rows = sb.table("reviews").select("*").eq("reviewed_user_id", renter_id).eq("review_type", HOST_REVIEW).execute().data or []
    shown = [r for r in published(_with_counterparts(sb, rows)) if r.get("review_type") == HOST_REVIEW and str(r.get("reviewed_user_id")) == str(renter_id)]
    shown.sort(key=lambda r: str(r.get("created_at") or ""), reverse=True)
    return shown


def present(sb, rows: list[dict], *, host_view: bool = False) -> list[dict]:
    people = _people(sb, [r.get("reviewer_id") for r in rows])
    out = []
    for r in rows:
        item = public_review(r, people.get(str(r.get("reviewer_id")), {}))
        if host_view:
            item.update({"cleanliness_rating": r.get("cleanliness_rating"), "payment_rating": r.get("payment_rating")})
            item.pop("migrant_friendliness", None)
        out.append(item)
    return out
