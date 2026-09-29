"""
Migrent Hub - applications.

The workflow, in the words the Hub uses:

    draft              Started, not sent
    submitted          Sent to the owner
    under_review       The owner has opened it
    shortlisted        The owner shortlisted it
    changes_requested  The owner (or Migrent) asked for something
    migrent_review     The owner approved it; Migrent is doing its final check
    finalised          Approved and finalised; a tenancy is set up
    declined           The owner decided not to go ahead
    withdrawn          The renter withdrew it
    not_proceeding     Migrent stopped it at final review

Transitions are listed once, in TRANSITIONS, and every change writes an
application_events row. The owner cannot skip Migrent's final review: an
approval always lands in migrent_review, and only an admin can finalise.
No step is automated beyond moving an approval into review - nothing here
scores, ranks or decides on a renter.
"""


import logging
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from db import get_supabase_admin
from hub_common import (
    HubActor,
    audit,
    fetch_listings,
    fetch_people,
    hub_actor,
    hub_table_error,
    listing_card,
    notify_user,
    now_iso,
    parse_day,
    record_listing_event,
    require_writable,
)
from admin_panel import panel_unlocked, require_admin_panel
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["hub-applications"])

ACTIVE = ("draft", "submitted", "under_review", "shortlisted", "changes_requested", "owner_approved", "migrent_review")
CLOSED = ("declined", "withdrawn", "not_proceeding")
OWNER_VISIBLE = ("submitted", "under_review", "shortlisted", "changes_requested", "owner_approved", "migrent_review", "finalised", "declined", "withdrawn", "not_proceeding")
DOCS_VISIBLE_TO_OWNER = ("submitted", "under_review", "shortlisted", "changes_requested", "owner_approved", "migrent_review", "finalised")

# (actor, action) -> allowed from-statuses and the resulting status.
TRANSITIONS: dict[tuple[str, str], tuple[tuple[str, ...], str]] = {
    ("renter", "submit"): (("draft",), "submitted"),
    ("renter", "resubmit"): (("changes_requested",), "submitted"),
    ("renter", "withdraw"): (("draft", "submitted", "under_review", "shortlisted", "changes_requested", "migrent_review"), "withdrawn"),
    ("owner", "view"): (("submitted",), "under_review"),
    ("owner", "shortlist"): (("submitted", "under_review"), "shortlisted"),
    ("owner", "request_changes"): (("submitted", "under_review", "shortlisted"), "changes_requested"),
    ("owner", "approve"): (("submitted", "under_review", "shortlisted"), "migrent_review"),
    ("owner", "decline"): (("submitted", "under_review", "shortlisted", "changes_requested"), "declined"),
    ("admin", "finalise"): (("migrent_review",), "finalised"),
    ("admin", "request_corrections"): (("migrent_review",), "changes_requested"),
    ("admin", "stop"): (("migrent_review",), "not_proceeding"),
}

EVENT_COPY = {
    "created": "Application started",
    "submitted": "Application sent to the owner",
    "resubmitted": "Updated application sent",
    "viewed": "Owner opened the application",
    "shortlisted": "Shortlisted by the owner",
    "changes_requested": "Owner asked for more information",
    "corrections_requested": "Migrent asked for more information",
    "owner_approved": "Owner approved the application",
    "migrent_review_started": "Migrent is doing its final review",
    "finalised": "Application finalised",
    "declined": "The owner decided not to go ahead",
    "withdrawn": "Application withdrawn",
    "not_proceeding": "Migrent could not finalise this application",
    "tenancy_created": "Tenancy set up",
    "note": "Note",
}


def can_transition(actor_kind: str, action: str, current: str) -> Optional[str]:
    rule = TRANSITIONS.get((actor_kind, action))
    if not rule:
        return None
    allowed, to = rule
    return to if current in allowed else None


# ---------------------------------------------------------------------------
# Loading and shaping
# ---------------------------------------------------------------------------


def _load(sb, application_id: str) -> dict:
    try:
        res = sb.table("applications").select("*").eq("id", application_id).execute()
    except Exception as e:
        raise hub_table_error(e)
    if not res.data:
        raise HTTPException(status_code=404, detail="Application not found")
    return res.data[0]


def _viewer_kind(actor: HubActor, app: dict, admin_unlocked: bool = False) -> str:
    """'renter' | 'owner' | 'admin', or 404 - never reveal that an
    application exists to someone who is not party to it. An admin sees
    other people's applications only with the Admin panel unlocked."""
    if str(app["renter_id"]) == actor.id:
        return "renter"
    if str(app["owner_id"]) == actor.id and app["status"] in OWNER_VISIBLE:
        return "owner"
    if actor.is_admin and not actor.read_only and admin_unlocked:
        return "admin"
    raise HTTPException(status_code=404, detail="Application not found")


def _event(sb, app_id: str, *, actor: Optional[HubActor], role: str, event: str, frm: Optional[str], to: Optional[str], note: Optional[str] = None, visibility: str = "shared") -> None:
    sb.table("application_events").insert(
        {
            "application_id": app_id,
            "actor_id": actor.id if actor else None,
            "actor_role": role,
            "event": event,
            "from_status": frm,
            "to_status": to,
            "note": (note or None),
            "visibility": visibility,
        }
    ).execute()


def _set_status(sb, app: dict, to: str, extra: Optional[dict] = None) -> dict:
    patch = {"status": to, **(extra or {})}
    res = sb.table("applications").update(patch).eq("id", app["id"]).eq("status", app["status"]).execute()
    if not res.data:
        # Someone else changed it between our read and this write.
        raise HTTPException(status_code=409, detail="This application changed while you were looking at it. Refresh and try again.")
    return res.data[0]


def _events_for(sb, app_id: str, viewer: str) -> list[dict]:
    rows = sb.table("application_events").select("*").eq("application_id", app_id).order("created_at").execute().data or []
    allowed = {"renter": ("shared",), "owner": ("shared", "owner"), "admin": ("shared", "owner", "admin")}[viewer]
    out = []
    for r in rows:
        if r.get("visibility") not in allowed:
            continue
        out.append(
            {
                "id": r["id"],
                "event": r["event"],
                "label": EVENT_COPY.get(r["event"], r["event"].replace("_", " ").capitalize()),
                "actor_role": r["actor_role"],
                "note": r.get("note"),
                "to_status": r.get("to_status"),
                "created_at": r["created_at"],
            }
        )
    return out


def _summary(app: dict, listing: Optional[dict], person: Optional[dict], viewer: str) -> dict:
    return {
        "id": app["id"],
        "status": app["status"],
        "listing": listing_card(listing, viewer_is_owner=(viewer == "owner")),
        "person": person,
        "move_in_date": app.get("move_in_date"),
        "lease_months": app.get("lease_months"),
        "occupants": app.get("occupants"),
        "submitted_at": app.get("submitted_at"),
        "updated_at": app.get("updated_at"),
        "created_at": app.get("created_at"),
        "changes_requested_by": app.get("changes_requested_by"),
        "unread_by_owner": viewer == "owner" and app["status"] == "submitted" and not app.get("owner_viewed_at"),
    }


# ---------------------------------------------------------------------------
# Lists
# ---------------------------------------------------------------------------


def renter_applications(sb, renter_id: str, *, active_only: bool = False, limit: Optional[int] = None) -> list[dict]:
    q = sb.table("applications").select("*").eq("renter_id", renter_id).order("updated_at", desc=True)
    rows = q.execute().data or []
    if active_only:
        rows = [r for r in rows if r["status"] in ACTIVE or r["status"] == "finalised"]
    if limit:
        rows = rows[:limit]
    listings = fetch_listings(sb, [r["listing_id"] for r in rows])
    owners = fetch_people(sb, [r["owner_id"] for r in rows])
    return [_summary(r, listings.get(str(r["listing_id"])), owners.get(str(r["owner_id"])), "renter") for r in rows]


def owner_applications(sb, owner_id: str, *, status: Optional[str] = None, listing_id: Optional[str] = None, limit: Optional[int] = None) -> list[dict]:
    q = sb.table("applications").select("*").eq("owner_id", owner_id).in_("status", list(OWNER_VISIBLE)).order("updated_at", desc=True)
    if status:
        q = q.eq("status", status)
    if listing_id:
        q = q.eq("listing_id", listing_id)
    rows = q.execute().data or []
    if limit:
        rows = rows[:limit]
    listings = fetch_listings(sb, [r["listing_id"] for r in rows])
    renters = fetch_people(sb, [r["renter_id"] for r in rows])
    out = []
    for r in rows:
        s = _summary(r, listings.get(str(r["listing_id"])), renters.get(str(r["renter_id"])), "owner")
        snap = r.get("snapshot") or {}
        s["household"] = (snap.get("household") or {}) if snap else {}
        s["verification"] = snap.get("verification") if snap else None
        out.append(s)
    return out


@router.get("/applications")
def list_applications(
    request: Request,
    status: Optional[str] = None,
    listing_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    try:
        if actor.is_owner:
            return {"role": "owner", "applications": owner_applications(sb, actor.id, status=status, listing_id=listing_id)}
        return {"role": "renter", "applications": renter_applications(sb, actor.id)}
    except HTTPException:
        raise
    except Exception as e:
        raise hub_table_error(e)


# ---------------------------------------------------------------------------
# Renter: start, edit, submit, withdraw
# ---------------------------------------------------------------------------


class StartBody(BaseModel):
    listing_id: str = Field(..., min_length=36, max_length=36)


@router.post("/applications")
@limiter.limit("30/hour")
def start_application(request: Request, body: StartBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    if actor.is_owner:
        raise HTTPException(
            status_code=403,
            detail="Applications are made from a renter account. Switch your account type in Settings to apply for a home.",
        )
    sb = get_supabase_admin()
    listing = fetch_listings(sb, [body.listing_id]).get(body.listing_id)
    card = listing_card(listing)
    if not card or card["public_state"] != "published":
        raise HTTPException(status_code=404, detail="That home is no longer taking applications")
    if str(listing["owner_id"]) == actor.id:
        raise HTTPException(status_code=400, detail="You cannot apply for your own listing")
    if (listing.get("listing_purpose") or "long_term") == "sale":
        raise HTTPException(status_code=400, detail="This home is for sale, so there is no rental application")
    try:
        existing = (
            sb.table("applications")
            .select("*")
            .eq("listing_id", body.listing_id)
            .eq("renter_id", actor.id)
            .in_("status", list(ACTIVE) + ["finalised"])
            .execute()
        )
        if existing.data:
            return {"application": existing.data[0], "created": False}
        from routes_hub_renter import get_renter_profile

        rp, _ = get_renter_profile(sb, actor.id)
        row = {
            "listing_id": body.listing_id,
            "renter_id": actor.id,
            "owner_id": str(listing["owner_id"]),
            "status": "draft",
            "share_income": False,
            "move_in_date": rp.get("preferred_move_date"),
            "lease_months": rp.get("preferred_lease_months"),
            "occupants": (rp.get("household_adults") or 1) + (rp.get("household_children") or 0),
        }
        res = sb.table("applications").insert(row).execute()
        app = res.data[0]
        _event(sb, app["id"], actor=actor, role="renter", event="created", frm=None, to="draft", visibility="shared")
    except HTTPException:
        raise
    except Exception as e:
        raise hub_table_error(e)
    record_listing_event(sb, body.listing_id, "application_started", actor.id)
    return {"application": app, "created": True}


class DraftPatch(BaseModel):
    move_in_date: Optional[date] = None
    lease_months: Optional[int] = Field(None, ge=1, le=60)
    occupants: Optional[int] = Field(None, ge=1, le=20)
    message: Optional[str] = Field(None, max_length=2000)
    share_income: Optional[bool] = None
    document_ids: Optional[list[str]] = Field(None, max_length=20)


@router.patch("/applications/{application_id}")
def update_draft(application_id: str, request: Request, body: DraftPatch, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    app = _load(sb, application_id)
    if _viewer_kind(actor, app) != "renter":
        raise HTTPException(status_code=404, detail="Application not found")
    if app["status"] not in ("draft", "changes_requested"):
        raise HTTPException(status_code=409, detail="This application has been sent. Withdraw it if you need to start again.")
    patch = body.model_dump(exclude_unset=True)
    doc_ids = patch.pop("document_ids", None)
    if "move_in_date" in patch and patch["move_in_date"] is not None:
        if patch["move_in_date"] < date.today():
            raise HTTPException(status_code=400, detail="Choose a move-in date from today onwards")
        patch["move_in_date"] = patch["move_in_date"].isoformat()
    if patch:
        sb.table("applications").update(patch).eq("id", application_id).execute()
    if doc_ids is not None:
        owned = sb.table("renter_documents").select("id").eq("user_id", actor.id).execute().data or []
        owned_ids = {str(d["id"]) for d in owned}
        wanted = [d for d in doc_ids if d in owned_ids]
        sb.table("application_documents").delete().eq("application_id", application_id).execute()
        for d in wanted:
            sb.table("application_documents").insert({"application_id": application_id, "document_id": d}).execute()
    return get_application(application_id, request, authorization)


def _submission_problems(sb, actor: HubActor, app: dict) -> list[str]:
    from routes_hub_renter import get_renter_profile

    rp, exists = get_renter_profile(sb, actor.id)
    problems = []
    if not app.get("move_in_date"):
        problems.append("Choose your move-in date")
    elif parse_day(app["move_in_date"]) and parse_day(app["move_in_date"]) < date.today():
        problems.append("Your move-in date has passed. Choose a new one")
    if not app.get("occupants"):
        problems.append("Say how many people will live there")
    if not (actor.profile.get("preferred_name") or actor.profile.get("name")):
        problems.append("Add your name to your Rental Profile")
    if len((rp.get("intro") or "").strip()) < 40:
        problems.append("Write a short introduction in your Rental Profile (a few sentences)")
    if not rp.get("employment_status"):
        problems.append("Add your work or study situation to your Rental Profile")
    return problems


@router.post("/applications/{application_id}/submit")
@limiter.limit("20/hour")
def submit_application(application_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    app = _load(sb, application_id)
    if _viewer_kind(actor, app) != "renter":
        raise HTTPException(status_code=404, detail="Application not found")
    resubmit = app["status"] == "changes_requested"
    action = "resubmit" if resubmit else "submit"
    to = can_transition("renter", action, app["status"])
    if not to:
        raise HTTPException(status_code=409, detail="This application cannot be sent in its current state")
    problems = _submission_problems(sb, actor, app)
    if problems:
        raise HTTPException(status_code=422, detail={"message": "A few things are needed before you send this", "problems": problems})

    listing = fetch_listings(sb, [app["listing_id"]]).get(str(app["listing_id"]))
    card = listing_card(listing)
    if not card or (card["public_state"] != "published" and not resubmit):
        raise HTTPException(status_code=409, detail="This home is no longer taking applications")

    from routes_hub_renter import build_snapshot

    # Corrections Migrent asked for go straight back to Migrent's review: the
    # owner has already approved this application.
    if resubmit and app.get("changes_requested_by") == "migrent":
        to = "migrent_review"
    extra = {"snapshot": build_snapshot(sb, actor, share_income=bool(app.get("share_income"))), "changes_requested_by": None}
    if not resubmit:
        extra["submitted_at"] = now_iso()
    updated = _set_status(sb, app, to, extra)
    _event(sb, app["id"], actor=actor, role="renter", event="resubmitted" if resubmit else "submitted", frm=app["status"], to=to)
    record_listing_event(sb, app["listing_id"], "application_submitted", actor.id)

    if to == "submitted":
        notify_user(
            sb,
            app["owner_id"],
            "application_submitted",
            "Updated application" if resubmit else "New application",
            f"{actor.display_name} {'updated their' if resubmit else 'applied for'} {card['title']}{' application' if resubmit else ''}.",
            f"/applications/{app['id']}",
            entity_type="application",
            entity_id=app["id"],
        )
    return {"application": updated}


class ReasonBody(BaseModel):
    note: Optional[str] = Field(None, max_length=2000)


@router.post("/applications/{application_id}/withdraw")
def withdraw_application(application_id: str, request: Request, body: ReasonBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    app = _load(sb, application_id)
    if _viewer_kind(actor, app) != "renter":
        raise HTTPException(status_code=404, detail="Application not found")
    to = can_transition("renter", "withdraw", app["status"])
    if not to:
        raise HTTPException(status_code=409, detail="This application can no longer be withdrawn here. Message the owner or contact support.")
    was_sent = app["status"] != "draft"
    updated = _set_status(sb, app, to, {"decided_at": now_iso()})
    _event(sb, app["id"], actor=actor, role="renter", event="withdrawn", frm=app["status"], to=to, note=body.note)
    if was_sent:
        notify_user(
            sb,
            app["owner_id"],
            "application_withdrawn",
            "An application was withdrawn",
            f"{actor.display_name} withdrew their application.",
            f"/applications/{app['id']}",
            entity_type="application",
            entity_id=app["id"],
        )
    return {"application": updated}


# ---------------------------------------------------------------------------
# Detail
# ---------------------------------------------------------------------------


@router.get("/applications/{application_id}")
def get_application(application_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    app = _load(sb, application_id)
    viewer = _viewer_kind(actor, app, admin_unlocked=panel_unlocked(actor.id, request, authorization))

    # The owner opening a new application is itself a step the renter can see.
    if viewer == "owner" and not actor.read_only and app["status"] == "submitted" and not app.get("owner_viewed_at"):
        try:
            app = _set_status(sb, app, "under_review", {"owner_viewed_at": now_iso()})
            _event(sb, app["id"], actor=actor, role="owner", event="viewed", frm="submitted", to="under_review")
        except HTTPException:
            app = _load(sb, application_id)

    listing = fetch_listings(sb, [app["listing_id"]]).get(str(app["listing_id"]))
    people = fetch_people(sb, [app["renter_id"], app["owner_id"]])
    out = {
        "viewer": viewer,
        "application": {
            k: app.get(k)
            for k in (
                "id", "status", "move_in_date", "lease_months", "occupants", "message", "share_income", "submitted_at",
                "owner_approved_at", "decided_at", "finalised_at", "created_at", "updated_at", "changes_requested_by",
            )
        },
        "listing": listing_card(listing, viewer_is_owner=(viewer in ("owner", "admin"))),
        "events": _events_for(sb, app["id"], viewer),
        "renter": people.get(str(app["renter_id"])),
        "owner": people.get(str(app["owner_id"])),
    }

    links = sb.table("application_documents").select("document_id").eq("application_id", app["id"]).execute().data or []
    doc_ids = [str(l["document_id"]) for l in links]
    docs = []
    if doc_ids:
        docs = sb.table("renter_documents").select("id, kind, label, file_name, mime_type, size_bytes, file_path, created_at").in_("id", doc_ids).execute().data or []

    if viewer == "renter":
        from routes_hub_renter import get_renter_profile, list_documents, profile_completion

        rp, exists = get_renter_profile(sb, actor.id)
        all_docs = list_documents(sb, actor.id)
        out["completion"] = profile_completion(actor.profile, rp, exists, all_docs)
        out["documents"] = [{k: d.get(k) for k in ("id", "kind", "label", "file_name", "mime_type", "size_bytes")} for d in docs]
        out["available_documents"] = all_docs
        out["problems"] = _submission_problems(sb, actor, app) if app["status"] in ("draft", "changes_requested") else []
        return out

    # Owner and admin: the snapshot the renter submitted, and time-limited
    # links to the documents they chose to share - only while the
    # application is live.
    from routes_hub_renter import signed_document_url

    out["snapshot"] = app.get("snapshot")
    out["documents"] = [
        {
            **{k: d.get(k) for k in ("id", "kind", "label", "file_name", "mime_type", "size_bytes")},
            "url": signed_document_url(sb, d["file_path"]) if app["status"] in DOCS_VISIBLE_TO_OWNER else None,
        }
        for d in docs
    ]
    if viewer in ("owner", "admin"):
        notes = sb.table("application_owner_notes").select("id, body, created_at").eq("application_id", app["id"]).order("created_at").execute().data or []
        out["owner_notes"] = notes if viewer == "owner" else []
        # Other applications this renter made to this same owner - never to
        # anyone else.
        others = (
            sb.table("applications")
            .select("id, listing_id, status, submitted_at")
            .eq("owner_id", app["owner_id"])
            .eq("renter_id", app["renter_id"])
            .neq("id", app["id"])
            .in_("status", list(OWNER_VISIBLE))
            .execute()
            .data
            or []
        )
        other_listings = fetch_listings(sb, [o["listing_id"] for o in others])
        out["other_applications_with_you"] = [
            {"id": o["id"], "status": o["status"], "listing": listing_card(other_listings.get(str(o["listing_id"])), viewer_is_owner=True)}
            for o in others
        ]
        out["allowed_actions"] = [
            action for (kind, action), (frm, _to) in TRANSITIONS.items() if kind == viewer and app["status"] in frm and action != "view"
        ]
    return out


# ---------------------------------------------------------------------------
# Owner decisions
# ---------------------------------------------------------------------------


class OwnerActionBody(BaseModel):
    action: str
    note: Optional[str] = Field(None, max_length=2000)

    @field_validator("action")
    @classmethod
    def _action(cls, v: str) -> str:
        if v not in ("shortlist", "request_changes", "approve", "decline"):
            raise ValueError("Unknown action")
        return v


@router.post("/applications/{application_id}/owner-action")
@limiter.limit("60/hour")
def owner_action(application_id: str, request: Request, body: OwnerActionBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    app = _load(sb, application_id)
    if _viewer_kind(actor, app) != "owner":
        raise HTTPException(status_code=404, detail="Application not found")
    to = can_transition("owner", body.action, app["status"])
    if not to:
        raise HTTPException(status_code=409, detail="That step is not available for this application any more")
    note = (body.note or "").strip() or None
    if body.action == "request_changes" and not note:
        raise HTTPException(status_code=400, detail="Tell the renter what you need")

    listing = fetch_listings(sb, [app["listing_id"]]).get(str(app["listing_id"]))
    title = (listing_card(listing) or {}).get("title", "your home")

    if body.action == "approve":
        # One approved applicant per home at a time.
        clash = (
            sb.table("applications")
            .select("id")
            .eq("listing_id", app["listing_id"])
            .in_("status", ["migrent_review", "finalised", "owner_approved"])
            .neq("id", app["id"])
            .execute()
        )
        if clash.data:
            raise HTTPException(status_code=409, detail="You have already approved an applicant for this home. Migrent is reviewing that application.")
        updated = _set_status(sb, app, to, {"owner_approved_at": now_iso(), "decided_at": now_iso()})
        _event(sb, app["id"], actor=actor, role="owner", event="owner_approved", frm=app["status"], to="owner_approved", note=note)
        _event(sb, app["id"], actor=None, role="system", event="migrent_review_started", frm="owner_approved", to="migrent_review")
        notify_user(
            sb, app["renter_id"], "application_approved", "The owner approved your application",
            f"Good news - the owner of {title} approved your application. Migrent is now doing a final review, and we will let you know what happens next.",
            f"/applications/{app['id']}", entity_type="application", entity_id=app["id"],
        )
        return {"application": updated}

    extra = {}
    if body.action == "request_changes":
        extra["changes_requested_by"] = "owner"
    if body.action == "decline":
        extra["decided_at"] = now_iso()
    updated = _set_status(sb, app, to, extra)
    event = {"shortlist": "shortlisted", "request_changes": "changes_requested", "decline": "declined"}[body.action]
    # A decline reason stays with the owner unless they wrote it to be
    # shared; a request for changes is always shared (it is the request).
    visibility = "shared" if body.action in ("request_changes", "shortlist") else "owner"
    _event(sb, app["id"], actor=actor, role="owner", event=event, frm=app["status"], to=to, note=note, visibility=visibility)
    copy = {
        "shortlist": ("application_status_changed", "You have been shortlisted", f"The owner of {title} shortlisted your application."),
        "request_changes": ("application_changes_requested", "The owner asked for more information", f"The owner of {title} asked: {note}"),
        "decline": ("application_status_changed", "Update on your application", f"The owner of {title} decided not to go ahead with your application. Your Rental Profile is ready for the next one."),
    }[body.action]
    notify_user(sb, app["renter_id"], copy[0], copy[1], copy[2], f"/applications/{app['id']}", entity_type="application", entity_id=app["id"])
    return {"application": updated}


class NoteBody(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)


@router.post("/applications/{application_id}/notes")
def add_owner_note(application_id: str, request: Request, body: NoteBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    app = _load(sb, application_id)
    if _viewer_kind(actor, app) != "owner":
        raise HTTPException(status_code=404, detail="Application not found")
    res = sb.table("application_owner_notes").insert({"application_id": app["id"], "owner_id": actor.id, "body": body.body.strip()}).execute()
    return {"note": {k: res.data[0].get(k) for k in ("id", "body", "created_at")}}


# ---------------------------------------------------------------------------
# Migrent final review (admins)
# ---------------------------------------------------------------------------


@router.get("/admin/applications")
def admin_queue(request: Request, status: str = "migrent_review", authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    try:
        rows = sb.table("applications").select("*").eq("status", status).order("owner_approved_at").limit(200).execute().data or []
    except Exception as e:
        raise hub_table_error(e)
    listings = fetch_listings(sb, [r["listing_id"] for r in rows])
    people = fetch_people(sb, [r["renter_id"] for r in rows] + [r["owner_id"] for r in rows])
    return {
        "applications": [
            {
                **_summary(r, listings.get(str(r["listing_id"])), people.get(str(r["renter_id"])), "owner"),
                "owner": people.get(str(r["owner_id"])),
                "owner_approved_at": r.get("owner_approved_at"),
            }
            for r in rows
        ]
    }


class AdminDecisionBody(BaseModel):
    action: str
    reason: Optional[str] = Field(None, max_length=2000)
    tenancy_start: Optional[date] = None

    @field_validator("action")
    @classmethod
    def _action(cls, v: str) -> str:
        if v not in ("finalise", "request_corrections", "stop"):
            raise ValueError("Unknown action")
        return v


def create_tenancy_for(sb, app: dict, *, start: Optional[date] = None) -> dict:
    listing = fetch_listings(sb, [app["listing_id"]]).get(str(app["listing_id"])) or {}
    start_day = start or parse_day(app.get("move_in_date")) or date.today()
    end_day = None
    if app.get("lease_months"):
        end_day = start_day + timedelta(days=round(int(app["lease_months"]) * 30.44))
    existing = sb.table("tenancies").select("*").eq("application_id", app["id"]).execute()
    if existing.data:
        return existing.data[0]
    row = {
        "listing_id": app["listing_id"],
        "property_id": listing.get("property_id"),
        "owner_id": app["owner_id"],
        "renter_id": app["renter_id"],
        "application_id": app["id"],
        "status": "upcoming" if start_day > date.today() else "active",
        "start_date": start_day.isoformat(),
        "end_date": end_day.isoformat() if end_day else None,
        "rent_amount": listing.get("weekly_price") or 0,
        "rent_frequency": "weekly",
    }
    return sb.table("tenancies").insert(row).execute().data[0]


@router.post("/admin/applications/{application_id}/decision")
@limiter.limit("120/hour")
def admin_decision(application_id: str, request: Request, body: AdminDecisionBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    app = _load(sb, application_id)
    to = can_transition("admin", body.action, app["status"])
    if not to:
        raise HTTPException(status_code=409, detail="This application is not waiting for Migrent's review")
    reason = (body.reason or "").strip() or None
    if body.action in ("request_corrections", "stop") and not reason:
        raise HTTPException(status_code=400, detail="A reason is required and is recorded in the audit log")

    audit_action = {"finalise": "finalise_application", "request_corrections": "request_application_corrections", "stop": "stop_application"}[body.action]
    audit(sb, admin_id=actor.id, action=audit_action, target_type="application", target_id=app["id"], reason=reason, metadata={"from": app["status"], "to": to})

    listing = fetch_listings(sb, [app["listing_id"]]).get(str(app["listing_id"])) or {}
    title = (listing_card(listing) or {}).get("title", "the home")

    if body.action == "finalise":
        updated = _set_status(sb, app, to, {"finalised_at": now_iso()})
        _event(sb, app["id"], actor=actor, role="admin", event="finalised", frm=app["status"], to=to, note=None)
        tenancy = create_tenancy_for(sb, updated, start=body.tenancy_start)
        _event(sb, app["id"], actor=None, role="system", event="tenancy_created", frm=to, to=to)
        # The home is taken: stop new applications without deleting anything.
        try:
            from listing_lifecycle import record_event

            prev = listing.get("moderation_status")
            patch = {"occupancy": "occupied", "occupied_until": tenancy.get("end_date")}
            if prev == "approved":
                patch.update({"moderation_status": "paused", "paused_at": now_iso()})
            sb.table("listings").update(patch).eq("id", app["listing_id"]).execute()
            if prev == "approved":
                record_event(sb, listing_id=str(app["listing_id"]), actor_id=actor.id, actor_type="admin", event_type="paused", old_status=prev, new_status="paused", notes="Tenancy finalised")
        except Exception:
            logger.exception("could not mark listing occupied after finalising %s", app["id"])
        for uid, text in (
            (app["renter_id"], f"Your application for {title} is finalised. Your new home is set up in Migrent Hub."),
            (app["owner_id"], f"Migrent finalised the application for {title}. The tenancy is set up in Migrent Hub."),
        ):
            notify_user(sb, uid, "application_finalised", "Application finalised", text, f"/applications/{app['id']}", entity_type="application", entity_id=app["id"])
        return {"application": updated, "tenancy": tenancy}

    if body.action == "request_corrections":
        updated = _set_status(sb, app, to, {"changes_requested_by": "migrent"})
        _event(sb, app["id"], actor=actor, role="admin", event="corrections_requested", frm=app["status"], to=to, note=reason)
        notify_user(sb, app["renter_id"], "application_changes_requested", "Migrent needs a little more information", reason or "", f"/applications/{app['id']}", entity_type="application", entity_id=app["id"])
        return {"application": updated}

    updated = _set_status(sb, app, to, {"decided_at": now_iso()})
    _event(sb, app["id"], actor=actor, role="admin", event="not_proceeding", frm=app["status"], to=to, note=reason, visibility="admin")
    for uid in (app["renter_id"], app["owner_id"]):
        notify_user(
            sb, uid, "application_status_changed", "Update on an application",
            f"Migrent could not finalise the application for {title}. Contact support if you would like to know more.",
            f"/applications/{app['id']}", entity_type="application", entity_id=app["id"],
        )
    return {"application": updated}
