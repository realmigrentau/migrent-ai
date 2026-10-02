"""
Migrent Hub - operations for Migrent administrators.

Everything an administrator does happens here, in the Hub. The older
/admin console has been retired; its pages redirect to these screens.

    GET  /hub/admin/panel                           Admin panel password attempts left
    POST /hub/admin/unlock                          the Admin panel password: an unlock token
    POST /hub/admin/password                        change the Admin panel password
    GET  /hub/admin/overview                        what is waiting, in one call
    GET  /hub/admin/listings                        moderation queues
    GET  /hub/admin/listings/{id}                   one listing, its owner and its history
    POST /hub/admin/listings/{id}/action            approve, ask for changes, reject, pause,
                                                    unpause, hide, send back to review,
                                                    start or confirm removal, rescan
    GET  /hub/admin/id-checks                       owners waiting for an ID check
    GET  /hub/admin/id-checks/{user_id}/document    a five-minute link to the document
    POST /hub/admin/id-checks/{user_id}             approve or reject
    GET  /hub/admin/reports                         the reports queue with context
    POST /hub/admin/reports/{id}                    triage: priority, assignment, outcome
    GET  /hub/admin/emergencies                     emergency repairs not picked up yet
    GET  /hub/admin/support/tickets                 the support inbox
    GET  /hub/admin/support/tickets/{id}            one ticket and its conversation
    POST /hub/admin/support/tickets/{id}/reply      reply to the customer
    POST /hub/admin/support/tickets/{id}            status, priority, category, internal note
    GET  /hub/admin/audit                           the admin audit trail (read-only)
    GET  /hub/admin/users                           find an account (for support)
    POST /hub/admin/users/{id}/suspend              suspend an account (and /unsuspend)
    POST /hub/admin/view-as                         start an audited, read-only view-as
    POST /hub/admin/view-as/end                     end it

The final application review lives with the applications
(routes_applications.admin_queue / admin_decision).

Listing moderation and ID checks run through the same functions as the
older /admin endpoints (routes_admin, routes_spam_moderation,
routes_owner_verification), so the owner's emails, the listing's
moderation history and the audit rows are identical whichever way an
action arrives. Ticket replies share routes_support_tickets the same way.

Everything except /panel, /unlock and /view-as/end also needs the Admin
panel unlocked (admin_panel.require_admin_panel): 423 without it.

Every consequential action writes admin_audit_log before it changes
anything, and requires a reason where the action affects a customer.
Support tickets keep their own history (support_events), as before.
"""


import logging
import uuid
from collections import Counter
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from auth_utils import forget_account_status
from db import get_supabase_admin
from listing_lifecycle import forget_suspended_owners
from hub_common import (
    ADMIN_ROLES,
    CARD_COLUMNS,
    CARD_COLUMNS_LEGACY,
    audit,
    fetch_listings,
    fetch_people,
    hub_actor,
    hub_table_error,
    listing_card,
    load_profile,
    notify_user,
    now_iso,
    now_utc,
    owner_verified_map,
    parse_ts,
    require_admin_actor,
)
from admin_panel import (
    LOCKOUT_WINDOW,
    MAX_ATTEMPTS,
    MIN_PASSWORD_LENGTH,
    UNLOCK_TTL,
    admin_mfa_ok,
    attempt_state,
    hash_password,
    issue_unlock_token,
    require_admin_mfa,
    require_admin_panel,
    session_id,
    stored_hash,
    verify_password,
)
from limiter import limiter
from models_support import TicketUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub/admin", tags=["hub-admin"])


def _count(sb, table: str, **eqs) -> int:
    try:
        q = sb.table(table).select("id", count="exact")
        for k, v in eqs.items():
            q = q.in_(k, v) if isinstance(v, (list, tuple)) else q.eq(k, v)
        return q.execute().count or 0
    except Exception:
        return 0


# ---------------------------------------------------------------------------
# The Admin panel's password (see admin_panel.py)
# ---------------------------------------------------------------------------


@router.get("/panel")
def panel_status(request: Request, authorization: Optional[str] = Header(None)):
    """How many password attempts are left, before the form is shown."""
    actor = hub_actor(request, authorization)
    require_admin_actor(actor)
    state = attempt_state(get_supabase_admin(), actor.id)
    return {
        "attempts_left": max(0, MAX_ATTEMPTS - state["failures"]),
        "locked": bool(state["locked_until"]),
        # The panel will not open on a session without an authenticator code.
        "mfa_required": not admin_mfa_ok(authorization),
    }


class UnlockBody(BaseModel):
    password: str = Field(..., max_length=200)


def _admin_ids(sb) -> list[str]:
    rows = sb.table("profiles").select("id, is_admin, role").execute().data or []
    return [str(r["id"]) for r in rows if r.get("is_admin") or r.get("role") in ADMIN_ROLES]


def _lock_out(sb, actor, authorization: Optional[str]) -> None:
    """Third wrong password: record it, end the account's sign-in sessions and
    alert every admin, including the account's owner in case it wasn't them."""
    audit(sb, admin_id=actor.id, action="admin_panel_lockout", target_type="user", target_id=actor.id, reason=f"{MAX_ATTEMPTS} wrong admin panel passwords")
    try:
        sb.auth.admin.sign_out((authorization or "").split(" ", 1)[-1], "global")
    except Exception:
        logger.exception("could not revoke sessions after an admin panel lockout (%s)", actor.id)
    who = actor.display_name if actor.display_name != "there" else (actor.email or "an admin account")
    for uid in _admin_ids(sb):
        notify_user(
            sb,
            uid,
            "admin_security_alert",
            "Potential threat: admin panel locked",
            f"{MAX_ATTEMPTS} wrong admin panel passwords were entered on {who}'s account. The panel is locked for "
            f"{int(LOCKOUT_WINDOW.total_seconds() // 60)} minutes and the account was signed out. If it wasn't them, "
            "change their Migrent password and the admin panel password.",
            "/admin/audit",
            entity_type="user",
            entity_id=actor.id,
        )


@router.post("/unlock")
@limiter.limit("30/hour")
def unlock(request: Request, body: UnlockBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_actor(actor)
    # Checked before the password, so a session without a two-step sign-in
    # never uses up an attempt.
    require_admin_mfa(authorization)
    sb = get_supabase_admin()
    state = attempt_state(sb, actor.id)
    if state["locked_until"]:
        return {"unlocked": False, "locked": True, "attempts_left": 0}
    stored = stored_hash(sb)
    if not stored:
        raise HTTPException(status_code=503, detail="The admin panel password has not been set up yet.")
    if verify_password(body.password, stored):
        audit(sb, admin_id=actor.id, action="admin_panel_unlock", target_type="user", target_id=actor.id)
        return {"unlocked": True, "token": issue_unlock_token(actor.id, session_id(authorization)), "expires_in_seconds": int(UNLOCK_TTL.total_seconds())}
    audit(sb, admin_id=actor.id, action="admin_panel_failed", target_type="user", target_id=actor.id)
    left = MAX_ATTEMPTS - (state["failures"] + 1)
    if left <= 0:
        _lock_out(sb, actor, authorization)
        return {"unlocked": False, "locked": True, "attempts_left": 0}
    return {"unlocked": False, "locked": False, "attempts_left": left}


class PasswordChangeBody(BaseModel):
    current_password: str = Field(..., max_length=200)
    new_password: str = Field(..., max_length=200)


@router.post("/password")
@limiter.limit("10/hour")
def change_panel_password(request: Request, body: PasswordChangeBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    if not verify_password(body.current_password, stored_hash(sb)):
        raise HTTPException(status_code=400, detail="The current admin password is not right.")
    if len(body.new_password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Use at least {MIN_PASSWORD_LENGTH} characters.")
    audit(sb, admin_id=actor.id, action="admin_panel_password_changed", target_type="user", target_id=actor.id)
    sb.table("admin_panel_settings").upsert({"id": 1, "password_hash": hash_password(body.new_password), "updated_at": now_iso(), "updated_by": actor.id}).execute()
    return {"changed": True}


@router.get("/overview")
def overview(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    return {
        "final_reviews": _count(sb, "applications", status="migrent_review"),
        "open_reports": _count(sb, "reports", status=["pending", "reviewing"]),
        "listings_in_review": _count(sb, "listings", moderation_status=["pending_approval", "flagged"]),
        "id_checks_waiting": _count(sb, "owner_verification", id_status="pending"),
        "mentors_waiting": _count(sb, "mentors", review_status="pending"),
        "open_emergencies": _count(sb, "maintenance_requests", urgency="emergency", status=["submitted", "acknowledged"]),
        "tickets_waiting": _count(sb, "tickets", status=list(TICKET_VIEWS["needs_reply"])),
        # Two plain facts, counted, never estimated.
        "accounts": _count(sb, "profiles"),
        "approved_listings": _count(sb, "listings", moderation_status="approved"),
    }


def _count_since(sb, table: str, column: str, since: str, **eqs) -> int:
    try:
        q = sb.table(table).select("id", count="exact").gte(column, since)
        for k, v in eqs.items():
            q = q.in_(k, v) if isinstance(v, (list, tuple)) else q.eq(k, v)
        return q.execute().count or 0
    except Exception:
        return 0


def _median_hours(pairs: list[tuple[Optional[str], Optional[str]]]) -> Optional[float]:
    from statistics import median

    hours = []
    for start, end in pairs:
        s, e = parse_ts(start), parse_ts(end)
        if s and e and e >= s:
            hours.append((e - s).total_seconds() / 3600)
    return round(median(hours), 1) if hours else None


@router.get("/metrics")
def metrics(request: Request, authorization: Optional[str] = Header(None)):
    """Real counts for Admin > Numbers (MIG-024). Every figure is counted
    from the database at request time; nothing is estimated or padded."""
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    now = now_utc()
    d7 = (now - timedelta(days=7)).isoformat()
    d30 = (now - timedelta(days=30)).isoformat()

    # Hours from a listing being sent for review to the decision, for
    # decisions made in the last 30 days.
    review_pairs: list[tuple[Optional[str], Optional[str]]] = []
    try:
        decided = sb.table("moderation_events").select("listing_id, created_at").in_("event_type", ["approved", "rejected", "changes_requested"]).gte("created_at", d30).limit(200).execute().data or []
        if decided:
            submitted = sb.table("moderation_events").select("listing_id, created_at").eq("event_type", "submitted").in_("listing_id", list({str(d["listing_id"]) for d in decided})).execute().data or []
            for d in decided:
                before = [s["created_at"] for s in submitted if str(s["listing_id"]) == str(d["listing_id"]) and str(s["created_at"]) <= str(d["created_at"])]
                if before:
                    review_pairs.append((max(before), d["created_at"]))
    except Exception:
        pass
    try:
        tickets = sb.table("tickets").select("created_at, first_response_at").gte("created_at", d30).not_.is_("first_response_at", "null").limit(500).execute().data or []
    except Exception:
        tickets = []

    return {
        "generated_at": now.isoformat(),
        "people": {
            "accounts": _count(sb, "profiles"),
            "renters": _count(sb, "profiles", role=["seeker", "renter"]),
            "owners": _count(sb, "profiles", role="owner"),
            "joined_7_days": _count_since(sb, "profiles", "created_at", d7),
            "joined_30_days": _count_since(sb, "profiles", "created_at", d30),
            "id_checked_owners": _count(sb, "owner_verification", id_status="approved"),
        },
        "homes": {
            "live": _count(sb, "listings", moderation_status="approved"),
            "in_review": _count(sb, "listings", moderation_status=["pending_approval", "flagged"]),
            "paused": _count(sb, "listings", moderation_status="paused"),
            "drafts": _count(sb, "listings", moderation_status="draft"),
            "listed_30_days": _count_since(sb, "listings", "created_at", d30),
            "median_review_hours": _median_hours(review_pairs),
        },
        "activity": {
            "messages_7_days": _count_since(sb, "messages", "created_at", d7),
            "applications_30_days": _count_since(sb, "applications", "created_at", d30),
            "inspections_booked_30_days": _count_since(sb, "inspection_bookings", "created_at", d30),
            "stay_requests_30_days": _count_since(sb, "bookings", "created_at", d30),
            "active_tenancies": _count(sb, "tenancies", status="active"),
        },
        "safety": {
            "open_reports": _count(sb, "reports", status=["pending", "reviewing"]),
            "reports_30_days": _count_since(sb, "reports", "created_at", d30),
            "scam_flags_30_days": _count_since(sb, "reports", "created_at", d30, source="system"),
            "suspended_accounts": _count_suspended(sb),
            "open_tickets": _count(sb, "tickets", status=list(TICKET_VIEWS["needs_reply"])),
            "median_first_reply_hours": _median_hours([(t.get("created_at"), t.get("first_response_at")) for t in tickets]),
        },
    }


def _count_suspended(sb) -> int:
    try:
        return sb.table("profiles").select("id", count="exact").not_.is_("disabled_at", "null").execute().count or 0
    except Exception:
        return 0


def _emails(sb, ids) -> dict[str, Optional[str]]:
    """Email addresses for admin screens only. Never sent to customers."""
    wanted = [str(i) for i in {str(x) for x in ids if x}]
    if not wanted:
        return {}
    res = sb.table("profiles").select("id, email").in_("id", wanted).execute()
    return {str(r["id"]): r.get("email") for r in (res.data or [])}


# ---------------------------------------------------------------------------
# Listings: the moderation queues
# ---------------------------------------------------------------------------

# Each tab in Hub > Listings and the moderation states it shows.
LISTING_QUEUES: dict[str, tuple[str, ...]] = {
    "review": ("pending_approval",),
    "flagged": ("flagged",),
    "hidden": ("hidden",),
    "removal": ("delete_requested",),
    "paused": ("paused",),
}

# What a moderator may do to a listing in each state. The Hub shows exactly
# these buttons and the action endpoint refuses anything else.
LISTING_ACTIONS: dict[str, tuple[str, ...]] = {
    "pending_approval": ("approve", "request_changes", "reject", "pause"),
    "changes_requested": ("approve", "reject", "pause"),
    "approved": ("pause", "request_removal"),
    "flagged": ("approve", "unflag", "hide", "request_removal", "rescan"),
    "hidden": ("approve", "unflag", "request_removal", "rescan"),
    "delete_requested": ("confirm_removal", "approve", "unflag"),
    "paused": ("unpause", "request_removal"),
}

# Actions that change what a customer sees need a written reason.
LISTING_ACTIONS_NEEDING_REASON = {"reject", "request_changes", "pause", "hide", "request_removal"}

MODERATION_COLUMNS = (
    "description, moderation_reason, moderation_notes, spam_score, spam_reasons, "
    "flagged_at, delete_requested_at, paused_at"
)


def _listing_rows(sb, build) -> list[dict]:
    """Run a listings query with the card columns plus the moderation
    fields, falling back to the pre-043 column set."""
    last: Exception = RuntimeError("no query ran")
    for cols in (CARD_COLUMNS, CARD_COLUMNS_LEGACY):
        try:
            return build(sb.table("listings").select(f"{cols}, {MODERATION_COLUMNS}")).execute().data or []
        except Exception as e:
            last = e
    raise hub_table_error(last)


def _moderation_items(sb, rows: list[dict]) -> list[dict]:
    owner_ids = [r.get("owner_id") for r in rows]
    people = fetch_people(sb, owner_ids)
    emails = _emails(sb, owner_ids)
    checks = owner_verified_map(sb, owner_ids)
    out = []
    for r in rows:
        oid = str(r.get("owner_id") or "")
        status = r.get("moderation_status") or "draft"
        out.append(
            {
                **(listing_card(r, viewer_is_owner=True) or {}),
                "moderation_status": status,
                "moderation_reason": r.get("moderation_reason"),
                "moderation_notes": r.get("moderation_notes"),
                "spam_score": r.get("spam_score"),
                "spam_reasons": r.get("spam_reasons") or [],
                "flagged_at": r.get("flagged_at"),
                "created_at": r.get("created_at"),
                "updated_at": r.get("updated_at"),
                "owner": {**(people.get(oid) or {"id": oid, "name": "Unknown owner"}), "email": emails.get(oid), "id_check": checks.get(oid, "unverified")},
                "actions": list(LISTING_ACTIONS.get(status, ())),
            }
        )
    return out


@router.get("/listings")
def listing_queue(request: Request, queue: str = "review", q: Optional[str] = None, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    if queue not in LISTING_QUEUES and queue != "all":
        raise HTTPException(status_code=400, detail="Unknown queue")
    sb = get_supabase_admin()
    needle = (q or "").strip().replace(",", " ").replace("(", " ").replace(")", " ")[:80]
    clauses: list[str] = []
    if needle:
        # Title, suburb, the owner's name or email, or a pasted listing id.
        clauses = [f"title.ilike.%{needle}%", f"suburb.ilike.%{needle}%"]
        owners = sb.table("profiles").select("id").or_(f"name.ilike.%{needle}%,preferred_name.ilike.%{needle}%,email.ilike.%{needle}%").limit(20).execute().data or []
        if owners:
            clauses.append(f"owner_id.in.({','.join(str(o['id']) for o in owners)})")
        try:
            clauses.append(f"id.eq.{uuid.UUID(needle)}")
        except ValueError:
            pass

    def build(query):
        if queue != "all":
            query = query.in_("moderation_status", list(LISTING_QUEUES[queue]))
        if clauses:
            query = query.or_(",".join(clauses))
        # Queues are worked oldest first; spam flags by how suspicious they look.
        if queue == "flagged":
            query = query.order("spam_score", desc=True)
        elif queue == "review":
            query = query.order("created_at")
        elif queue == "removal":
            query = query.order("delete_requested_at")
        else:
            query = query.order("updated_at", desc=True)
        return query.limit(100)

    rows = _listing_rows(sb, build)
    counts = {name: _count(sb, "listings", moderation_status=list(states)) for name, states in LISTING_QUEUES.items()}
    return {"listings": _moderation_items(sb, rows), "counts": counts}


def _listing_detail(sb, listing_id: str) -> dict:
    rows = _listing_rows(sb, lambda query: query.eq("id", listing_id))
    if not rows:
        raise HTTPException(status_code=404, detail="Listing not found")
    item = _moderation_items(sb, rows)[0]
    item["description"] = rows[0].get("description")
    item["images"] = rows[0].get("images") or []
    # What renters will be asked for up front (MIG-017), for the reviewer.
    cost_fields = ("bond_weeks", "rent_in_advance_weeks", "bills_estimate_weekly", "newcomer_friendly", "bond")
    try:
        extra = sb.table("listings").select(", ".join(cost_fields)).eq("id", listing_id).execute().data or [{}]
        item.update({k: extra[0].get(k) for k in cost_fields})
    except Exception:
        logger.warning("listing cost columns unavailable for %s", listing_id)
    try:
        events = sb.table("moderation_events").select("*").eq("listing_id", listing_id).order("created_at", desc=True).limit(50).execute().data or []
    except Exception:
        logger.warning("moderation_events unavailable for %s", listing_id)
        events = []
    actors = fetch_people(sb, [e.get("actor_id") for e in events])
    item["history"] = [
        {
            **{k: e.get(k) for k in ("id", "event_type", "old_status", "new_status", "spam_score", "notes", "created_at")},
            "actor": actors.get(str(e.get("actor_id"))) if e.get("actor_id") else None,
            "actor_type": e.get("actor_type") or ("admin" if e.get("actor_id") else "system"),
        }
        for e in events
    ]
    return item


@router.get("/listings/{listing_id}")
def listing_detail(listing_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    return {"listing": _listing_detail(get_supabase_admin(), listing_id)}


class ListingActionBody(BaseModel):
    action: str
    reason: Optional[str] = Field(None, max_length=1000)
    note: Optional[str] = Field(None, max_length=2000)
    required_actions: list[str] = Field(default_factory=list, max_length=12)
    mode: Optional[str] = None  # unpause: "review" (default) or "restore"


def _require_verified_owner(sb, listing_id: str) -> None:
    """The review queue only holds listings whose owner passed the ID check
    (the database enforces it). Say so plainly instead of failing there."""
    from routes_owner_verification import check_owner_verified

    row = sb.table("listings").select("owner_id").eq("id", listing_id).execute().data or [{}]
    if not check_owner_verified(str(row[0].get("owner_id") or "")):
        raise HTTPException(
            status_code=409,
            detail="The owner has not finished their ID check, so this listing cannot go back into review yet. Check their ID first.",
        )


@router.post("/listings/{listing_id}/action")
def listing_action(listing_id: str, request: Request, body: ListingActionBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    res = sb.table("listings").select("id, moderation_status").eq("id", listing_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    status = res.data[0].get("moderation_status") or "draft"
    if body.action not in LISTING_ACTIONS.get(status, ()):
        raise HTTPException(status_code=409, detail="That can't be done to this listing in its current state. Refresh to see where it is now.")
    reason = (body.reason or "").strip()
    note = (body.note or "").strip() or None
    if body.action in LISTING_ACTIONS_NEEDING_REASON and len(reason) < 5:
        raise HTTPException(status_code=400, detail="Add a reason. It is recorded in the audit log.")

    # The older handlers do the work (and check admin rights again), so the
    # owner's emails, the moderation history and the audit row are the same
    # as they have always been. Each writes admin_audit_log first.
    import routes_admin as mod
    import routes_spam_moderation as spam

    if body.action == "approve":
        if status in ("flagged", "hidden", "delete_requested"):
            spam.approve_flagged_listing(listing_id, spam.SpamModerationAction(notes=note), authorization)
        else:
            mod.approve_listing(listing_id, mod.ModerationAction(notes=note), authorization)
    elif body.action == "request_changes":
        mod.request_changes(listing_id, mod.ModerationAction(notes=reason), authorization)
    elif body.action == "reject":
        mod.reject_listing(listing_id, mod.ModerationAction(reason=reason, notes=note), authorization)
    elif body.action == "pause":
        fixes = [a.strip()[:200] for a in body.required_actions if a and a.strip()]
        mod.pause_listing_admin(listing_id, mod.PauseAction(reason=reason, required_actions=fixes), authorization)
    elif body.action == "unpause":
        mode = "restore" if body.mode == "restore" else "review"
        if mode == "review":
            _require_verified_owner(sb, listing_id)
        mod.unpause_listing_admin(listing_id, mod.UnpauseAction(mode=mode, notes=note), authorization)
    elif body.action == "hide":
        spam.hide_listing(listing_id, spam.SpamModerationAction(reason=reason, notes=note), authorization)
    elif body.action == "unflag":
        _require_verified_owner(sb, listing_id)
        spam.unflag_listing(listing_id, spam.SpamModerationAction(notes=note), authorization)
    elif body.action == "request_removal":
        spam.request_delete_listing(listing_id, spam.SpamModerationAction(reason=reason, notes=note), authorization)
    elif body.action == "confirm_removal":
        spam.confirm_delete_listing(listing_id, spam.SpamModerationAction(notes=note), authorization)
    elif body.action == "rescan":
        spam.rescan_listing(listing_id, authorization)
    return {"listing": _listing_detail(sb, listing_id)}


# ---------------------------------------------------------------------------
# Owner ID checks
# ---------------------------------------------------------------------------


@router.get("/id-checks")
def id_checks(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    try:
        rows = (
            sb.table("owner_verification")
            .select("user_id, id_document_type, id_submitted_at, email_verified, phone_verified, id_status")
            .eq("id_status", "pending")
            .order("id_submitted_at")
            .limit(200)
            .execute()
            .data
            or []
        )
    except Exception as e:
        raise hub_table_error(e)
    ids = [str(r["user_id"]) for r in rows]
    people = fetch_people(sb, ids)
    emails = _emails(sb, ids)
    waiting: Counter = Counter()
    if ids:
        drafts = sb.table("listings").select("owner_id").in_("owner_id", ids).in_("moderation_status", ["draft", "pending_approval"]).execute().data or []
        waiting.update(str(d["owner_id"]) for d in drafts)
    return {
        "checks": [
            {
                "user_id": uid,
                "person": people.get(uid) or {"id": uid, "name": "Unknown owner"},
                "email": emails.get(uid),
                "document_type": r.get("id_document_type"),
                "submitted_at": r.get("id_submitted_at"),
                "email_verified": bool(r.get("email_verified")),
                "phone_verified": bool(r.get("phone_verified")),
                "listings_waiting": waiting.get(uid, 0),
            }
            for r, uid in zip(rows, ids)
        ]
    }


@router.get("/id-checks/{user_id}/document")
def id_document(user_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    from routes_owner_verification import get_id_document_url

    sb = get_supabase_admin()
    link = get_id_document_url(user_id, authorization)
    row = sb.table("owner_verification").select("id_file_path").eq("user_id", user_id).execute().data or [{}]
    path = str(row[0].get("id_file_path") or "")
    return {"url": link.get("url"), "kind": "pdf" if path.lower().endswith(".pdf") else "image", "expires_in_seconds": 300}


class IdDecisionBody(BaseModel):
    action: str
    reason: Optional[str] = Field(None, max_length=500)

    @field_validator("action")
    @classmethod
    def _a(cls, v: str) -> str:
        if v not in ("approve", "reject"):
            raise ValueError("Unknown action")
        return v


@router.post("/id-checks/{user_id}")
def id_decision(user_id: str, request: Request, body: IdDecisionBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    reason = (body.reason or "").strip()
    if body.action == "reject" and len(reason) < 5:
        raise HTTPException(status_code=400, detail="Tell the owner what was wrong so they can fix it. It is also recorded in the audit log.")
    from routes_owner_verification import IDReviewAction, review_id_submission

    # Same handler as before: the owner's email and notification, and the
    # audit row (written first).
    out = review_id_submission(user_id, IDReviewAction(action=body.action, reason=reason or None), authorization)
    return {"message": out.get("message"), "fully_verified": out.get("fully_verified")}


# ---------------------------------------------------------------------------
# Mentors: approved after an ID check
# ---------------------------------------------------------------------------
# A mentor is paid through Migrent to meet new arrivals, often in person, so
# they are listed only after Migrent has checked their government ID (the
# same check as a host, in ID checks) and approved the profile here.


def _mentor_row(m: dict, people: dict, emails: dict, ids: dict) -> dict:
    uid = str(m["user_id"])
    v = ids.get(uid) or {}
    return {
        "id": str(m["id"]),
        "user_id": uid,
        "person": people.get(uid) or {"id": uid, "name": "Unknown"},
        "email": emails.get(uid),
        "suburb": m.get("suburb"),
        "postcode": m.get("postcode"),
        "languages": m.get("languages") or [],
        "specialties": m.get("specialties") or [],
        "bio": m.get("bio") or "",
        "hourly_rate": m.get("hourly_rate"),
        "status": m.get("review_status") or "pending",
        "review_reason": m.get("review_reason"),
        "submitted_at": m.get("updated_at") or m.get("created_at"),
        "id_status": v.get("id_status") or "not_submitted",
        "payouts_ready": bool(m.get("stripe_onboarding_complete")),
    }


@router.get("/mentors")
def mentors_queue(request: Request, status: str = "pending", authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    if status not in ("pending", "approved", "rejected", "all"):
        raise HTTPException(status_code=400, detail="Unknown status")
    sb = get_supabase_admin()
    try:
        q = sb.table("mentors").select("*").order("created_at").limit(200)
        if status != "all":
            q = q.eq("review_status", status)
        rows = q.execute().data or []
    except Exception as e:
        raise hub_table_error(e)
    uids = [str(r["user_id"]) for r in rows]
    people = fetch_people(sb, uids)
    emails = _emails(sb, uids)
    ids = {}
    if uids:
        for v in sb.table("owner_verification").select("user_id, id_status").in_("user_id", uids).execute().data or []:
            ids[str(v["user_id"])] = v
    return {"mentors": [_mentor_row(m, people, emails, ids) for m in rows]}


class MentorDecisionBody(BaseModel):
    action: str
    reason: Optional[str] = Field(None, max_length=500)

    @field_validator("action")
    @classmethod
    def _a(cls, v: str) -> str:
        if v not in ("approve", "reject"):
            raise ValueError("Unknown action")
        return v


@router.post("/mentors/{mentor_id}")
def mentor_decision(mentor_id: str, request: Request, body: MentorDecisionBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    rows = sb.table("mentors").select("*").eq("id", mentor_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Mentor not found")
    mentor = rows[0]
    uid = str(mentor["user_id"])
    reason = (body.reason or "").strip()
    if body.action == "approve":
        v = sb.table("owner_verification").select("id_status").eq("user_id", uid).execute().data or [{}]
        if v[0].get("id_status") != "approved":
            raise HTTPException(status_code=400, detail="Their government ID hasn't been checked yet. Approve it in ID checks first.")
    elif len(reason) < 5:
        raise HTTPException(status_code=400, detail="Tell them what to change. It is emailed to them and recorded in the audit log.")
    approve = body.action == "approve"
    audit(sb, admin_id=actor.id, action="approve_mentor" if approve else "reject_mentor", target_type="mentor", target_id=str(mentor["id"]), reason=reason or None)
    sb.table("mentors").update(
        {
            "review_status": "approved" if approve else "rejected",
            "verified": approve,
            "reviewed_at": now_iso(),
            "reviewed_by": actor.id,
            "review_reason": None if approve else reason,
        }
    ).eq("id", mentor_id).execute()
    if approve:
        notify_user(
            sb, uid, "mentor_approved", "You're listed as a Migrent mentor",
            "Migrent checked your ID and approved your mentor profile. New arrivals can now find you. Set up payouts if you haven't, so you can take paid sessions.",
            "/settings", entity_type="mentor", entity_id=str(mentor["id"]),
        )
    else:
        notify_user(
            sb, uid, "mentor_rejected", "Your mentor profile needs changes",
            f"Migrent couldn't approve your mentor profile yet: {reason}",
            "/settings", entity_type="mentor", entity_id=str(mentor["id"]),
        )
    return {"mentor": _mentor_row({**mentor, "review_status": "approved" if approve else "rejected", "review_reason": None if approve else reason}, fetch_people(sb, [uid]), _emails(sb, [uid]), {uid: {"id_status": "approved"}} if approve else {})}


# ---------------------------------------------------------------------------
# Reports queue
# ---------------------------------------------------------------------------


@router.get("/reports")
def reports(request: Request, status: str = "open", authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    try:
        q = sb.table("reports").select("*").order("created_at", desc=True).limit(200)
        if status == "open":
            q = q.in_("status", ["pending", "reviewing"])
        elif status != "all":
            q = q.eq("status", status)
        rows = q.execute().data or []
    except Exception as e:
        raise hub_table_error(e)
    listing_ids = [r.get("item_id") or r.get("listing_id") for r in rows if (r.get("item_type") or "listing") == "listing"]
    listings = fetch_listings(sb, [i for i in listing_ids if i and len(str(i)) == 36])
    people_ids = [r["reporter_id"] for r in rows if r.get("reporter_id")] + [r.get("assigned_to") for r in rows if r.get("assigned_to")]
    people_ids += [r.get("item_id") for r in rows if r.get("item_type") in ("profile", "user") and r.get("item_id") and len(str(r["item_id"])) == 36]
    # Reported messages and reviews: what was said, and between whom.
    message_ids = [str(r["item_id"]) for r in rows if r.get("item_type") == "message" and r.get("item_id")]
    review_ids = [str(r["item_id"]) for r in rows if r.get("item_type") == "review" and r.get("item_id")]
    messages = {str(m["id"]): m for m in (sb.table("messages").select("id, sender_id, receiver_id, message_text, created_at").in_("id", message_ids).execute().data or [])} if message_ids else {}
    reviews = {str(v["id"]): v for v in (sb.table("reviews").select("id, reviewer_id, reviewed_user_id, review_type, rating, review_text, flagged, created_at").in_("id", review_ids).execute().data or [])} if review_ids else {}
    for m in messages.values():
        people_ids += [m.get("sender_id"), m.get("receiver_id")]
    for v in reviews.values():
        people_ids += [v.get("reviewer_id"), v.get("reviewed_user_id")]
    people = fetch_people(sb, [p for p in people_ids if p])
    prio = {"urgent": 0, "high": 1, "normal": 2, "low": 3}
    out = []
    for r in rows:
        kind = r.get("item_type") or "listing"
        target_id = r.get("item_id") or r.get("listing_id")
        target = None
        if kind == "listing":
            target = listing_card(listings.get(str(target_id)), viewer_is_owner=True)
        elif kind in ("profile", "user"):
            target = people.get(str(target_id))
        elif kind == "message" and str(target_id) in messages:
            m = messages[str(target_id)]
            target = {"text": (m.get("message_text") or "")[:1000], "from": people.get(str(m["sender_id"])), "to": people.get(str(m["receiver_id"])), "created_at": m.get("created_at")}
        elif kind == "review" and str(target_id) in reviews:
            v = reviews[str(target_id)]
            target = {
                "text": v.get("review_text") or "",
                "rating": v.get("rating"),
                "about": "a renter" if v.get("review_type") == "owner_to_seeker" else "a host and home",
                "from": people.get(str(v["reviewer_id"])),
                "to": people.get(str(v["reviewed_user_id"])),
                "hidden": bool(v.get("flagged")),
                "created_at": v.get("created_at"),
            }
        out.append(
            {
                **{k: r.get(k) for k in ("id", "reason", "details", "status", "priority", "resolution", "action_taken", "created_at", "resolved_at")},
                "item_type": kind,
                "item_id": target_id,
                "target": target,
                # None for reports the spam check raised (source "system").
                "reporter": people.get(str(r["reporter_id"])) if r.get("reporter_id") else None,
                "source": r.get("source") or "user",
                "assigned_to": people.get(str(r.get("assigned_to"))) if r.get("assigned_to") else None,
            }
        )
    out.sort(key=lambda x: (x["status"] not in ("pending", "reviewing"), prio.get(x.get("priority") or "normal", 2)))
    return {"reports": out}


class ReportTriage(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assign_to_me: Optional[bool] = None
    resolution: Optional[str] = Field(None, max_length=2000)
    action_taken: Optional[str] = Field(None, max_length=200)

    @field_validator("status")
    @classmethod
    def _s(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("pending", "reviewing", "actioned", "dismissed"):
            raise ValueError("Unknown status")
        return v

    @field_validator("priority")
    @classmethod
    def _p(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("low", "normal", "high", "urgent"):
            raise ValueError("Unknown priority")
        return v


@router.post("/reports/{report_id}")
def triage_report(report_id: str, request: Request, body: ReportTriage, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    res = sb.table("reports").select("*").eq("id", report_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Report not found")
    patch: dict = {"updated_at": now_iso()}
    if body.priority:
        patch["priority"] = body.priority
    if body.assign_to_me:
        patch["assigned_to"] = actor.id
        audit(sb, admin_id=actor.id, action="assign_report", target_type="report", target_id=report_id)
    if body.status:
        if body.status in ("actioned", "dismissed"):
            if not (body.resolution or "").strip():
                raise HTTPException(status_code=400, detail="Record what was decided and why")
            patch.update({"resolution": body.resolution.strip(), "action_taken": (body.action_taken or "").strip() or None, "resolved_at": now_iso(), "reviewed_by": actor.id})
            audit(
                sb,
                admin_id=actor.id,
                action="resolve_report" if body.status == "actioned" else "dismiss_report",
                target_type="report",
                target_id=report_id,
                reason=body.resolution.strip(),
                metadata={"action_taken": body.action_taken},
            )
        patch["status"] = body.status
    updated = sb.table("reports").update(patch).eq("id", report_id).execute().data[0]
    return {"report": {k: updated.get(k) for k in ("id", "status", "priority", "resolution", "action_taken", "resolved_at")}}


class ReviewVisibility(BaseModel):
    hidden: bool
    reason: str = Field(..., min_length=5, max_length=1000)


@router.post("/user-reviews/{review_id}")
def set_review_visibility(review_id: str, request: Request, body: ReviewVisibility, authorization: Optional[str] = Header(None)):
    """Hide a review that breaks the rules (abuse, private details, not about
    the tenancy), or put one back. Audited."""
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    res = sb.table("reviews").select("id").eq("id", review_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Review not found")
    audit(sb, admin_id=actor.id, action="hide_review" if body.hidden else "restore_review", target_type="review", target_id=review_id, reason=body.reason.strip())
    sb.table("reviews").update({"flagged": body.hidden, "flag_reason": body.reason.strip() if body.hidden else None, "moderated": True, "moderated_at": now_iso(), "moderated_by": actor.id}).eq("id", review_id).execute()
    return {"review": {"id": review_id, "hidden": body.hidden}}


# ---------------------------------------------------------------------------
# Emergency repairs the owner has not picked up yet
# ---------------------------------------------------------------------------


@router.get("/emergencies")
def emergencies(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    try:
        rows = (
            sb.table("maintenance_requests")
            .select("id, tenancy_id, listing_id, owner_id, renter_id, category, title, description, urgency, status, created_at, updated_at")
            .eq("urgency", "emergency")
            .in_("status", ["submitted", "acknowledged"])
            .order("created_at")
            .limit(200)
            .execute()
            .data
            or []
        )
    except Exception as e:
        raise hub_table_error(e)
    listings = fetch_listings(sb, [r["listing_id"] for r in rows])
    people = fetch_people(sb, [r["owner_id"] for r in rows] + [r["renter_id"] for r in rows])
    return {
        "requests": [
            {
                **{k: r.get(k) for k in ("id", "category", "title", "description", "urgency", "status", "created_at", "updated_at")},
                "listing": listing_card(listings.get(str(r["listing_id"])), viewer_is_owner=True),
                "owner": people.get(str(r["owner_id"])),
                "renter": people.get(str(r["renter_id"])),
            }
            for r in rows
        ]
    }


# ---------------------------------------------------------------------------
# Support tickets
# ---------------------------------------------------------------------------
# Customers raise tickets from the site's help widget (routes_support_tickets).
# Replies and changes are recorded in the ticket's own history
# (support_events), as they always have been.

# Each tab in Hub > Support and the ticket states it shows.
TICKET_VIEWS: dict[str, tuple[str, ...]] = {
    "needs_reply": ("open", "pending_internal"),
    "waiting": ("pending_customer",),
    "done": ("resolved", "closed"),
}
TICKET_PRIORITY = {"urgent": 0, "high": 1, "normal": 2, "low": 3}
TICKET_FIELDS = ("id", "subject", "status", "priority", "category", "source", "created_at", "updated_at", "first_response_at", "resolved_at", "csat_rating", "csat_comment")


def _ticket_row(r: dict, people: dict) -> dict:
    person = people.get(str(r.get("user_id"))) if r.get("user_id") else None
    return {
        **{k: r.get(k) for k in TICKET_FIELDS},
        "requester": {
            "id": str(r["user_id"]) if r.get("user_id") else None,
            "name": (person or {}).get("name") or r.get("name") or r.get("email") or "Guest",
            "email": r.get("email"),
            "avatar_url": (person or {}).get("avatar_url"),
            "has_account": bool(r.get("user_id")),
        },
    }


def _load_ticket(sb, ticket_id: str) -> dict:
    try:
        res = sb.table("tickets").select("*").eq("id", ticket_id).execute()
    except Exception as e:
        raise hub_table_error(e)
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return res.data[0]


def _ticket_detail(sb, ticket_id: str) -> dict:
    t = _load_ticket(sb, ticket_id)
    messages = sb.table("ticket_messages").select("*").eq("ticket_id", ticket_id).order("created_at").execute().data or []
    people = fetch_people(sb, [t.get("user_id")] + [m.get("sender_id") for m in messages])
    return {
        **_ticket_row(t, people),
        "messages": [
            {
                **{k: m.get(k) for k in ("id", "body", "sender_type", "created_at")},
                "is_internal": bool(m.get("is_internal")),
                "sender": people.get(str(m.get("sender_id"))) if m.get("sender_id") else None,
            }
            for m in messages
        ],
    }


@router.get("/support/tickets")
def support_tickets(request: Request, view: str = "needs_reply", authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    if view not in TICKET_VIEWS and view != "all":
        raise HTTPException(status_code=400, detail="Unknown view")
    sb = get_supabase_admin()
    try:
        q = sb.table("tickets").select("*")
        if view != "all":
            q = q.in_("status", list(TICKET_VIEWS[view]))
        rows = q.order("created_at", desc=view != "needs_reply").limit(200).execute().data or []
    except Exception as e:
        raise hub_table_error(e)
    if view == "needs_reply":
        # Most urgent first, then whoever has waited longest.
        rows.sort(key=lambda r: TICKET_PRIORITY.get(r.get("priority") or "normal", 2))
    people = fetch_people(sb, [r.get("user_id") for r in rows])
    counts = {name: _count(sb, "tickets", status=list(states)) for name, states in TICKET_VIEWS.items()}
    return {"tickets": [_ticket_row(r, people) for r in rows], "counts": counts}


@router.get("/support/tickets/{ticket_id}")
def support_ticket(ticket_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    return {"ticket": _ticket_detail(get_supabase_admin(), ticket_id)}


class TicketReplyBody(BaseModel):
    body: str = Field(..., min_length=1, max_length=10000)


@router.post("/support/tickets/{ticket_id}/reply")
def support_reply(ticket_id: str, request: Request, body: TicketReplyBody, background_tasks: BackgroundTasks, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    text = body.body.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Write a reply first")
    sb = get_supabase_admin()
    ticket = _load_ticket(sb, ticket_id)
    if ticket.get("status") == "closed":
        raise HTTPException(status_code=409, detail="This ticket is closed. Reopen it to reply.")
    from routes_support_tickets import _fire_webhook, post_agent_reply

    post_agent_reply(sb, ticket, actor.id, text)
    # The customer is emailed by the support automation, as before.
    if ticket.get("email"):
        background_tasks.add_task(_fire_webhook, "agent-reply", {"ticket_id": ticket_id, "subject": ticket.get("subject"), "email": ticket.get("email"), "reply": text})
    return {"ticket": _ticket_detail(sb, ticket_id)}


@router.post("/support/tickets/{ticket_id}")
def support_update(ticket_id: str, request: Request, body: TicketUpdate, background_tasks: BackgroundTasks, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    ticket = _load_ticket(sb, ticket_id)
    from routes_support_tickets import _fire_webhook, apply_agent_update

    changed = apply_agent_update(sb, ticket, actor.id, body)
    if changed.get("status") == "resolved":
        background_tasks.add_task(_fire_webhook, "ticket-resolved", {"ticket_id": ticket_id, "subject": ticket.get("subject"), "email": ticket.get("email")})
    return {"ticket": _ticket_detail(sb, ticket_id)}


# ---------------------------------------------------------------------------
# Audit log
# ---------------------------------------------------------------------------


@router.get("/audit")
def audit_log(request: Request, limit: int = 100, target_type: Optional[str] = None, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    q = sb.table("admin_audit_log").select("*").order("created_at", desc=True).limit(max(1, min(limit, 500)))
    if target_type:
        q = q.eq("target_type", target_type)
    rows = q.execute().data or []
    admins = fetch_people(sb, [r["admin_id"] for r in rows])
    return {
        "entries": [
            {**{k: r.get(k) for k in ("id", "action", "target_type", "target_id", "reason", "notes", "metadata", "created_at")}, "admin": admins.get(str(r["admin_id"]))}
            for r in rows
        ]
    }


# ---------------------------------------------------------------------------
# Support: find an account, view as (read-only, audited)
# ---------------------------------------------------------------------------


PEOPLE_PAGE = 50
ROLE_FILTER = {"renter": ["seeker", "renter"], "owner": ["owner"], "admin": list(ADMIN_ROLES)}


@router.get("/users")
def find_users(
    request: Request,
    q: str = "",
    role: Optional[str] = None,
    suspended: Optional[bool] = None,
    id_status: Optional[str] = None,
    joined_after: Optional[str] = None,
    offset: int = 0,
    authorization: Optional[str] = Header(None),
):
    """Everyone, newest first, narrowed by name or email and the filters on
    Admin > People (MIG-024). Without a search it lists rather than asking
    for one."""
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    query = sb.table("profiles").select("id, name, preferred_name, email, role, is_admin, created_at, disabled_at", count="exact")
    needle = (q or "").strip()
    if len(needle) >= 2:
        safe = needle.replace(",", " ").replace("(", " ").replace(")", " ")[:80]
        query = query.or_(f"name.ilike.%{safe}%,preferred_name.ilike.%{safe}%,email.ilike.%{safe}%")
    if role in ROLE_FILTER:
        query = query.in_("role", ROLE_FILTER[role])
    if suspended is True:
        query = query.not_.is_("disabled_at", "null")
    elif suspended is False:
        query = query.is_("disabled_at", "null")
    if joined_after:
        query = query.gte("created_at", joined_after[:10])
    if id_status in ("approved", "pending", "rejected", "not_submitted"):
        ids = [r["user_id"] for r in (sb.table("owner_verification").select("user_id").eq("id_status", id_status).limit(1000).execute().data or [])]
        if not ids:
            return {"users": [], "total": 0, "has_more": False}
        query = query.in_("id", ids)
    offset = max(0, offset)
    res = query.order("created_at", desc=True).range(offset, offset + PEOPLE_PAGE - 1).execute()
    rows = res.data or []
    checks = {str(r["user_id"]): r.get("id_status") for r in (sb.table("owner_verification").select("user_id, id_status").in_("user_id", [str(r["id"]) for r in rows]).execute().data or [])} if rows else {}
    total = res.count if res.count is not None else len(rows)
    return {
        "users": [{**_account_row(r), "id_status": checks.get(str(r["id"]))} for r in rows],
        "total": total,
        "has_more": offset + len(rows) < total,
    }


@router.get("/users/{user_id}")
def person_detail(user_id: str, request: Request, authorization: Optional[str] = Header(None)):
    """One person, for an admin: account, ID check, listings, activity,
    reports about and by them, and the admin history (MIG-024)."""
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    profile = load_profile(sb, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")

    def rows(table: str, build) -> list[dict]:
        try:
            return build(sb.table(table)).execute().data or []
        except Exception:
            return []

    check = (rows("owner_verification", lambda t: t.select("*").eq("user_id", user_id)) or [{}])[0]
    listings = rows("listings", lambda t: t.select("id, title, suburb, postcode, weekly_price, moderation_status, created_at").eq("owner_id", user_id).order("created_at", desc=True).limit(50))
    listing_ids = [str(l["id"]) for l in listings]
    reports_about = rows("reports", lambda t: t.select("id, item_type, item_id, reason, status, source, created_at").in_("item_type", ["user", "profile"]).eq("item_id", user_id))
    if listing_ids:
        reports_about += rows("reports", lambda t: t.select("id, item_type, item_id, reason, status, source, created_at").eq("item_type", "listing").in_("item_id", listing_ids))
    reports_about += rows("reports", lambda t: t.select("id, item_type, item_id, reason, status, source, created_at").eq("item_type", "message").like("details", f"Sender {user_id}%"))
    reports_by = rows("reports", lambda t: t.select("id, item_type, item_id, reason, status, created_at").eq("reporter_id", user_id).order("created_at", desc=True).limit(50))
    history = rows("admin_audit_log", lambda t: t.select("*").in_("target_id", [user_id, *listing_ids]).order("created_at", desc=True).limit(50))
    admins = fetch_people(sb, [h["admin_id"] for h in history])
    mentor = (rows("mentors", lambda t: t.select("id, review_status, active").eq("user_id", user_id)) or [None])[0]

    def count(table: str, **eqs) -> int:
        return _count(sb, table, **eqs)

    reports_about.sort(key=lambda r: str(r.get("created_at") or ""), reverse=True)
    return {
        "person": {
            **_account_row(profile),
            "owner_kind": profile.get("owner_kind"),
            "agency_name": profile.get("agency_name"),
            "agency_licence": profile.get("agency_licence"),
        },
        "id_check": {k: check.get(k) for k in ("id_status", "id_document_type", "id_reviewed_at", "id_rejection_reason", "email_verified", "phone_verified")} if check else None,
        "mentor": {"id": str(mentor["id"]), "status": mentor.get("review_status"), "active": bool(mentor.get("active"))} if mentor else None,
        "listings": listings,
        "activity": {
            "applications_sent": count("applications", renter_id=user_id),
            "applications_received": count("applications", owner_id=user_id),
            "tenancies_as_renter": count("tenancies", renter_id=user_id),
            "tenancies_as_owner": count("tenancies", owner_id=user_id),
            "blocked_by": count("blocked_users", blocked_id=user_id),
        },
        "reports_about": reports_about[:50],
        "reports_by": reports_by,
        "history": [
            {**{k: h.get(k) for k in ("id", "action", "target_type", "target_id", "reason", "created_at")}, "admin": admins.get(str(h["admin_id"]))}
            for h in history
        ],
    }


@router.get("/reports/{report_id}/conversation")
def reported_conversation(report_id: str, request: Request, authorization: Optional[str] = Header(None)):
    """The messages around a reported message, so a decision is made on the
    whole exchange. Reading it is recorded in the audit log."""
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    report = (sb.table("reports").select("*").eq("id", report_id).execute().data or [None])[0]
    if not report or report.get("item_type") != "message":
        raise HTTPException(status_code=404, detail="That report is not about a message")
    msg = (sb.table("messages").select("*").eq("id", report.get("item_id")).execute().data or [None])[0]
    if not msg:
        raise HTTPException(status_code=404, detail="The message no longer exists")
    a, b = str(msg["sender_id"]), str(msg["receiver_id"])
    q = sb.table("messages").select("id, sender_id, receiver_id, message_text, attachment_name, created_at").or_(f"and(sender_id.eq.{a},receiver_id.eq.{b}),and(sender_id.eq.{b},receiver_id.eq.{a})")
    q = q.eq("listing_id", msg["listing_id"]) if msg.get("listing_id") else q.is_("listing_id", "null")
    thread = list(reversed(q.order("created_at", desc=True).limit(60).execute().data or []))
    audit(sb, admin_id=actor.id, action="view_conversation", target_type="report", target_id=report_id)
    people = fetch_people(sb, [a, b])
    return {
        "reported_message_id": str(msg["id"]),
        "people": {a: people.get(a), b: people.get(b)},
        "messages": [
            {"id": str(m["id"]), "from": str(m["sender_id"]), "text": m.get("message_text") or "", "attachment_name": m.get("attachment_name"), "created_at": m.get("created_at")}
            for m in thread
        ],
    }


class ViewAsBody(BaseModel):
    user_id: str = Field(..., min_length=36, max_length=36)
    reason: Optional[str] = Field(None, max_length=500)


@router.post("/view-as")
def start_view_as(request: Request, body: ViewAsBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    if body.user_id == actor.id:
        raise HTTPException(status_code=400, detail="That is your own account")
    reason = (body.reason or "").strip()
    if len(reason) < 5:
        raise HTTPException(status_code=400, detail="Say why you need to view this account (recorded in the audit log)")
    sb = get_supabase_admin()
    target = fetch_people(sb, [body.user_id]).get(body.user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    audit(sb, admin_id=actor.id, action="view_as_start", target_type="user", target_id=body.user_id, reason=reason)
    return {"user": target, "read_only": True, "expires_in_minutes": 60}


class EndViewAs(BaseModel):
    user_id: str = Field(..., min_length=36, max_length=36)


@router.post("/view-as/end")
def end_view_as(request: Request, body: EndViewAs, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_actor(actor)
    sb = get_supabase_admin()
    audit(sb, admin_id=actor.id, action="view_as_end", target_type="user", target_id=body.user_id)
    return {"ended": True}


# ---------------------------------------------------------------------------
# Suspending an account
# ---------------------------------------------------------------------------
# A suspended account can still sign in but Migrent Hub refuses every request
# from it (hub_actor checks profiles.disabled_at), the routes outside the Hub
# refuse its writes (auth_utils.get_active_user), and its listings drop out of
# search, listing pages and Hub cards (listing_lifecycle.public_filter and
# mark_suspended_owners). Nothing is deleted and it can be reversed: listing
# statuses are untouched, so reinstating brings them straight back. The
# column cannot be changed by the account itself (migration 046). Admin
# accounts are only ever changed in the database.


class AccountActionBody(BaseModel):
    reason: str = Field(..., max_length=500)


def _account_row(profile: dict) -> dict:
    return {
        "id": str(profile["id"]),
        "name": profile.get("preferred_name") or profile.get("name") or "(no name)",
        "email": profile.get("email"),
        "role": {"seeker": "renter"}.get(profile.get("role"), profile.get("role")),
        "member_since": (profile.get("created_at") or "")[:10],
        "suspended": bool(profile.get("disabled_at")),
        "is_admin": bool(profile.get("is_admin")) or profile.get("role") in ADMIN_ROLES,
    }


def _account_change(request: Request, authorization: Optional[str], user_id: str, body: AccountActionBody, suspend: bool) -> dict:
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    reason = body.reason.strip()
    if len(reason) < 5:
        raise HTTPException(status_code=400, detail="Say why. It is recorded in the audit log.")
    if user_id == actor.id:
        raise HTTPException(status_code=400, detail="That is your own account")
    sb = get_supabase_admin()
    profile = load_profile(sb, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    if _account_row(profile)["is_admin"]:
        raise HTTPException(status_code=400, detail="Admin accounts are changed in the database, not here")
    if bool(profile.get("disabled_at")) == suspend:
        return {"user": _account_row(profile)}
    audit(sb, admin_id=actor.id, action="suspend_user" if suspend else "unsuspend_user", target_type="user", target_id=user_id, reason=reason)
    sb.table("profiles").update({"disabled_at": now_iso() if suspend else None}).eq("id", user_id).execute()
    # Apply it now on this instance: the active-account check and the list of
    # owners whose listings are hidden both cache briefly.
    forget_account_status(user_id)
    forget_suspended_owners()
    return {"user": _account_row(load_profile(sb, user_id))}


@router.post("/users/{user_id}/suspend")
def suspend_account(user_id: str, request: Request, body: AccountActionBody, authorization: Optional[str] = Header(None)):
    return _account_change(request, authorization, user_id, body, suspend=True)


@router.post("/users/{user_id}/unsuspend")
def unsuspend_account(user_id: str, request: Request, body: AccountActionBody, authorization: Optional[str] = Header(None)):
    return _account_change(request, authorization, user_id, body, suspend=False)
