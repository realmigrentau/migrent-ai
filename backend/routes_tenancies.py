"""
Migrent Hub - tenancies, the rent ledger and maintenance.

A tenancy is created when Migrent finalises an application
(routes_applications.create_tenancy_for). Migrent does not generate lease
documents and does not collect rent or bond: the ledger is the owner's
record of what was due and what they received, and the provider columns
on rent_payments are where a payment processor would write later
(see billing.py for the boundary).

Maintenance requests belong to a tenancy. Emergencies are never left to an
inbox: creating one returns the emergency guidance the Hub shows in full,
and the owner is notified by every channel they have switched on.
"""


import logging
import uuid
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, File, Header, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field, field_validator

from db import get_supabase_admin
from hub_common import (
    HubActor,
    fetch_listings,
    fetch_people,
    hub_actor,
    hub_table_error,
    listing_card,
    notify_user,
    now_iso,
    parse_day,
    require_writable,
    state_for_postcode,
)
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["hub-tenancies"])

PHOTO_BUCKET = "maintenance-photos"
CATEGORIES = ("plumbing", "electrical", "appliance", "heating_cooling", "pest", "security", "structural", "outdoor", "internet", "other")
MAINTENANCE_FLOW = {
    "submitted": ("acknowledged", "scheduled", "in_progress", "resolved"),
    "acknowledged": ("scheduled", "in_progress", "resolved"),
    "scheduled": ("in_progress", "resolved", "acknowledged"),
    "in_progress": ("resolved", "scheduled"),
    "resolved": ("closed", "in_progress"),
    "closed": (),
}

# Plain guidance, not legal advice. Each state's tenancy authority publishes
# what counts as an urgent repair and what a renter may do if the owner
# cannot be reached; the Hub links to it rather than restating it.
TENANCY_AUTHORITIES = {
    "NSW": ("NSW Fair Trading", "https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/repairs-and-maintenance"),
    "VIC": ("Consumer Affairs Victoria", "https://www.consumer.vic.gov.au/housing/renting/repairs-alterations-safety-and-pets/repairs"),
    "QLD": ("Residential Tenancies Authority", "https://www.rta.qld.gov.au/during-a-tenancy/repairs-and-maintenance"),
    "SA": ("Consumer and Business Services", "https://www.sa.gov.au/topics/housing/renting-and-letting/renting-privately/repairs-and-maintenance"),
    "WA": ("Consumer Protection WA", "https://www.commerce.wa.gov.au/consumer-protection/repairs-and-maintenance"),
    "TAS": ("Consumer, Building and Occupational Services", "https://www.cbos.tas.gov.au/topics/housing/renting/during-tenancy/repairs"),
    "ACT": ("ACT Government - renting", "https://www.act.gov.au/housing-planning-and-property/renting/repairs-and-maintenance"),
    "NT": ("NT Consumer Affairs", "https://consumeraffairs.nt.gov.au/for-consumers/renting-a-home/repairs-and-maintenance"),
}


def emergency_guidance(postcode) -> dict:
    state = state_for_postcode(postcode)
    authority = TENANCY_AUTHORITIES.get(state or "", ("your state's tenancy authority", None))
    return {
        "lines": [
            "If anyone is in danger, or there is fire, a gas leak or live electrical wiring, call 000 now.",
            "For a burst pipe, turn off the water at the mains. For a gas smell, leave and call your gas distributor's emergency line.",
            "Phone the owner or manager as well as sending this request - do not rely on a message alone for an emergency.",
        ],
        "authority_name": authority[0],
        "authority_url": authority[1],
    }


# ---------------------------------------------------------------------------
# Tenancies
# ---------------------------------------------------------------------------


def _viewer(actor: HubActor, t: dict) -> str:
    if str(t["owner_id"]) == actor.id:
        return "owner"
    if str(t["renter_id"]) == actor.id:
        return "renter"
    raise HTTPException(status_code=404, detail="Tenancy not found")


def _load_tenancy(sb, tenancy_id: str) -> dict:
    try:
        res = sb.table("tenancies").select("*").eq("id", tenancy_id).execute()
    except Exception as e:
        raise hub_table_error(e)
    if not res.data:
        raise HTTPException(status_code=404, detail="Tenancy not found")
    return res.data[0]


def _next_due(payments: list[dict]) -> Optional[dict]:
    due = [p for p in payments if p["status"] in ("due", "partial")]
    due.sort(key=lambda p: p["due_date"])
    return due[0] if due else None


def tenancy_summaries(sb, actor: HubActor, *, statuses: tuple = ("upcoming", "active")) -> list[dict]:
    col = "owner_id" if actor.is_owner else "renter_id"
    rows = sb.table("tenancies").select("*").eq(col, actor.id).in_("status", list(statuses)).order("start_date", desc=True).execute().data or []
    if not rows:
        return []
    ids = [r["id"] for r in rows]
    listings = fetch_listings(sb, [r["listing_id"] for r in rows])
    people = fetch_people(sb, [r["renter_id"] for r in rows] + [r["owner_id"] for r in rows])
    payments = sb.table("rent_payments").select("*").in_("tenancy_id", ids).execute().data or []
    maint = sb.table("maintenance_requests").select("id, tenancy_id, status").in_("tenancy_id", ids).execute().data or []
    out = []
    for t in rows:
        mine = [p for p in payments if str(p["tenancy_id"]) == str(t["id"])]
        listing = listings.get(str(t["listing_id"]))
        card = listing_card(listing, viewer_is_owner=actor.is_owner)
        if card:
            card["street_address"] = (listing or {}).get("address")
        out.append(
            {
                **{k: t.get(k) for k in ("id", "status", "start_date", "end_date", "rent_amount", "rent_frequency", "bond_amount", "application_id")},
                "listing": card,
                "renter": people.get(str(t["renter_id"])),
                "owner": people.get(str(t["owner_id"])),
                "next_payment": _next_due(mine),
                "open_maintenance": sum(1 for m in maint if str(m["tenancy_id"]) == str(t["id"]) and m["status"] not in ("resolved", "closed")),
                "ending_soon": bool(t.get("end_date") and parse_day(t["end_date"]) and parse_day(t["end_date"]) <= date.today() + timedelta(days=45)),
            }
        )
    return out


@router.get("/tenancies")
def list_tenancies(request: Request, scope: str = "current", authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    statuses = ("upcoming", "active") if scope == "current" else ("upcoming", "active", "ended", "cancelled")
    try:
        return {"tenancies": tenancy_summaries(sb, actor, statuses=statuses)}
    except Exception as e:
        raise hub_table_error(e)


@router.get("/tenancies/{tenancy_id}")
def get_tenancy(tenancy_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    t = _load_tenancy(sb, tenancy_id)
    viewer = _viewer(actor, t)
    listing = fetch_listings(sb, [t["listing_id"]]).get(str(t["listing_id"]))
    card = listing_card(listing, viewer_is_owner=viewer == "owner")
    if card:
        card["street_address"] = (listing or {}).get("address")
    people = fetch_people(sb, [t["renter_id"], t["owner_id"]])
    payments = sb.table("rent_payments").select("*").eq("tenancy_id", tenancy_id).order("due_date").execute().data or []
    maint = sb.table("maintenance_requests").select("id, category, title, urgency, status, created_at, updated_at").eq("tenancy_id", tenancy_id).order("created_at", desc=True).execute().data or []
    paid = round(sum(float(p.get("amount_paid") or 0) for p in payments), 2)
    return {
        "viewer": viewer,
        "tenancy": {k: t.get(k) for k in ("id", "status", "start_date", "end_date", "rent_amount", "rent_frequency", "bond_amount", "notes", "application_id", "created_at")},
        "listing": card,
        "renter": people.get(str(t["renter_id"])),
        "owner": people.get(str(t["owner_id"])),
        "payments": payments,
        "ledger": {"recorded_paid": paid, "next_payment": _next_due(payments)},
        "maintenance": maint,
        "emergency": emergency_guidance((listing or {}).get("postcode")),
        "payments_note": "Migrent does not collect rent or bond. This is a record of what was due and what the owner has recorded as received.",
    }


class TenancyPatch(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    rent_amount: Optional[float] = Field(None, ge=0, le=50000)
    rent_frequency: Optional[str] = None
    bond_amount: Optional[float] = Field(None, ge=0, le=200000)
    notes: Optional[str] = Field(None, max_length=2000)
    status: Optional[str] = None

    @field_validator("rent_frequency")
    @classmethod
    def _f(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("weekly", "fortnightly", "monthly"):
            raise ValueError("Choose weekly, fortnightly or monthly")
        return v

    @field_validator("status")
    @classmethod
    def _s(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("upcoming", "active", "ended", "cancelled"):
            raise ValueError("Unknown status")
        return v


@router.patch("/tenancies/{tenancy_id}")
def update_tenancy(tenancy_id: str, request: Request, body: TenancyPatch, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    t = _load_tenancy(sb, tenancy_id)
    if _viewer(actor, t) != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can change tenancy details")
    patch = body.model_dump(exclude_unset=True)
    for k in ("start_date", "end_date"):
        if k in patch and patch[k] is not None:
            patch[k] = patch[k].isoformat()
    start = parse_day(patch.get("start_date", t.get("start_date")))
    end = parse_day(patch.get("end_date", t.get("end_date")))
    if start and end and end <= start:
        raise HTTPException(status_code=400, detail="The end date must be after the start date")
    if not patch:
        raise HTTPException(status_code=400, detail="Nothing to change")
    updated = sb.table("tenancies").update(patch).eq("id", tenancy_id).execute().data[0]
    if patch.get("status") == "ended":
        try:
            sb.table("listings").update({"occupancy": "vacant", "occupied_until": None}).eq("id", t["listing_id"]).execute()
        except Exception:
            pass
    return {"tenancy": updated}


def _step(freq: str) -> timedelta | None:
    return {"weekly": timedelta(weeks=1), "fortnightly": timedelta(weeks=2)}.get(freq)


def _add_month(d: date) -> date:
    month = d.month % 12 + 1
    year = d.year + (1 if d.month == 12 else 0)
    day = min(d.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date(year, month, day)


def schedule_dates(start: date, end: Optional[date], freq: str, *, horizon_weeks: int = 26) -> list[date]:
    last = end or (start + timedelta(weeks=horizon_weeks))
    last = min(last, start + timedelta(weeks=104))
    out, cur = [], start
    while cur < last and len(out) < 120:
        out.append(cur)
        step = _step(freq)
        cur = cur + step if step else _add_month(cur)
    return out


@router.post("/tenancies/{tenancy_id}/schedule")
def build_schedule(tenancy_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    t = _load_tenancy(sb, tenancy_id)
    if _viewer(actor, t) != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can set up the rent schedule")
    start = parse_day(t["start_date"])
    end = parse_day(t.get("end_date"))
    amount = float(t["rent_amount"] or 0)
    freq = t.get("rent_frequency") or "weekly"
    if freq == "fortnightly":
        amount *= 2
    elif freq == "monthly":
        amount = round(amount * 52 / 12, 2)
    existing = {p["due_date"] for p in sb.table("rent_payments").select("due_date").eq("tenancy_id", tenancy_id).execute().data or []}
    rows = [
        {"tenancy_id": tenancy_id, "due_date": d.isoformat(), "amount_due": round(amount, 2), "amount_paid": 0, "status": "due"}
        for d in schedule_dates(start, end, freq)
        if d.isoformat() not in existing
    ]
    if rows:
        sb.table("rent_payments").insert(rows).execute()
    return {"added": len(rows)}


class PaymentPatch(BaseModel):
    status: str
    amount_paid: Optional[float] = Field(None, ge=0, le=200000)
    paid_on: Optional[date] = None
    method: Optional[str] = None
    reference: Optional[str] = Field(None, max_length=120)

    @field_validator("status")
    @classmethod
    def _s(cls, v: str) -> str:
        if v not in ("due", "paid", "partial", "waived"):
            raise ValueError("Unknown status")
        return v

    @field_validator("method")
    @classmethod
    def _m(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("bank_transfer", "cash", "other"):
            raise ValueError("Choose bank transfer, cash or other")
        return v


@router.post("/tenancies/{tenancy_id}/payments/{payment_id}")
def record_payment(tenancy_id: str, payment_id: str, request: Request, body: PaymentPatch, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    t = _load_tenancy(sb, tenancy_id)
    if _viewer(actor, t) != "owner":
        raise HTTPException(status_code=403, detail="Only the owner records payments")
    res = sb.table("rent_payments").select("*").eq("id", payment_id).eq("tenancy_id", tenancy_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Payment not found")
    p = res.data[0]
    if p.get("provider"):
        raise HTTPException(status_code=409, detail="This payment was recorded by the payment provider and cannot be edited here")
    patch = {"status": body.status, "method": body.method, "reference": (body.reference or "").strip() or None, "recorded_by": actor.id}
    if body.status == "paid":
        patch["amount_paid"] = body.amount_paid if body.amount_paid is not None else p["amount_due"]
        patch["paid_on"] = (body.paid_on or date.today()).isoformat()
    elif body.status == "partial":
        if not body.amount_paid:
            raise HTTPException(status_code=400, detail="Enter the amount received")
        patch["amount_paid"] = body.amount_paid
        patch["paid_on"] = (body.paid_on or date.today()).isoformat()
    else:
        patch["amount_paid"] = 0
        patch["paid_on"] = None
    updated = sb.table("rent_payments").update(patch).eq("id", payment_id).execute().data[0]
    return {"payment": updated}


# ---------------------------------------------------------------------------
# Maintenance
# ---------------------------------------------------------------------------


class MaintenanceBody(BaseModel):
    category: str
    title: str = Field(..., min_length=3, max_length=120)
    description: str = Field(..., min_length=3, max_length=3000)
    urgency: str = "routine"
    access_notes: Optional[str] = Field(None, max_length=500)

    @field_validator("category")
    @classmethod
    def _c(cls, v: str) -> str:
        if v not in CATEGORIES:
            raise ValueError("Choose a category")
        return v

    @field_validator("urgency")
    @classmethod
    def _u(cls, v: str) -> str:
        if v not in ("routine", "urgent", "emergency"):
            raise ValueError("Choose how urgent this is")
        return v


@router.post("/tenancies/{tenancy_id}/maintenance")
@limiter.limit("20/hour")
def create_request(tenancy_id: str, request: Request, body: MaintenanceBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    t = _load_tenancy(sb, tenancy_id)
    if _viewer(actor, t) != "renter":
        raise HTTPException(status_code=403, detail="Maintenance requests come from the renter")
    if t["status"] not in ("active", "upcoming"):
        raise HTTPException(status_code=409, detail="This tenancy has ended")
    row = sb.table("maintenance_requests").insert(
        {
            "tenancy_id": tenancy_id,
            "listing_id": t["listing_id"],
            "owner_id": t["owner_id"],
            "renter_id": actor.id,
            "category": body.category,
            "title": body.title.strip(),
            "description": body.description.strip(),
            "urgency": body.urgency,
            "status": "submitted",
            "photos": [],
            "access_notes": (body.access_notes or "").strip() or None,
        }
    ).execute().data[0]
    sb.table("maintenance_updates").insert({"request_id": row["id"], "author_id": actor.id, "author_role": "renter", "status_to": "submitted", "body": None, "internal": False}).execute()
    label = {"routine": "", "urgent": "Urgent: ", "emergency": "EMERGENCY: "}[body.urgency]
    notify_user(
        sb, t["owner_id"], "maintenance_created", f"{label}New maintenance request",
        f"{actor.display_name} reported: {body.title.strip()}.", f"/maintenance/{row['id']}", entity_type="maintenance", entity_id=row["id"],
    )
    listing = fetch_listings(sb, [t["listing_id"]]).get(str(t["listing_id"])) or {}
    return {"request": row, "emergency": emergency_guidance(listing.get("postcode")) if body.urgency != "routine" else None}


def _load_request(sb, actor: HubActor, request_id: str) -> tuple[dict, str]:
    try:
        res = sb.table("maintenance_requests").select("*").eq("id", request_id).execute()
    except Exception as e:
        raise hub_table_error(e)
    if not res.data:
        raise HTTPException(status_code=404, detail="Request not found")
    r = res.data[0]
    if str(r["owner_id"]) == actor.id:
        return r, "owner"
    if str(r["renter_id"]) == actor.id:
        return r, "renter"
    raise HTTPException(status_code=404, detail="Request not found")


@router.get("/maintenance")
def list_requests(request: Request, status: str = "open", authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    col = "owner_id" if actor.is_owner else "renter_id"
    try:
        rows = sb.table("maintenance_requests").select("*").eq(col, actor.id).order("created_at", desc=True).limit(200).execute().data or []
    except Exception as e:
        raise hub_table_error(e)
    if status == "open":
        rows = [r for r in rows if r["status"] not in ("resolved", "closed")]
    listings = fetch_listings(sb, [r["listing_id"] for r in rows])
    people = fetch_people(sb, [r["renter_id"] for r in rows])
    urgency_rank = {"emergency": 0, "urgent": 1, "routine": 2}
    # Newest first, then (stable) open before closed and most urgent first.
    rows.sort(key=lambda r: r["created_at"], reverse=True)
    rows.sort(key=lambda r: (r["status"] in ("resolved", "closed"), urgency_rank.get(r["urgency"], 3)))
    return {
        "requests": [
            {
                **{k: r.get(k) for k in ("id", "category", "title", "urgency", "status", "scheduled_for", "created_at", "updated_at", "tenancy_id")},
                "photo_count": len(r.get("photos") or []),
                "listing": listing_card(listings.get(str(r["listing_id"])), viewer_is_owner=actor.is_owner),
                "renter": people.get(str(r["renter_id"])),
            }
            for r in rows
        ]
    }


@router.get("/maintenance/{request_id}")
def get_request(request_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    r, viewer = _load_request(sb, actor, request_id)
    updates = sb.table("maintenance_updates").select("*").eq("request_id", request_id).order("created_at").execute().data or []
    if viewer != "owner":
        updates = [u for u in updates if not u.get("internal")]
    photos = []
    for path in r.get("photos") or []:
        try:
            signed = sb.storage.from_(PHOTO_BUCKET).create_signed_url(path, 600)
            photos.append(signed.get("signedURL") or signed.get("signedUrl"))
        except Exception:
            photos.append(None)
    listing = fetch_listings(sb, [r["listing_id"]]).get(str(r["listing_id"])) or {}
    people = fetch_people(sb, [r["renter_id"], r["owner_id"]])
    return {
        "viewer": viewer,
        "request": {k: r.get(k) for k in ("id", "tenancy_id", "category", "title", "description", "urgency", "status", "access_notes", "scheduled_for", "created_at", "updated_at", "resolved_at", "closed_at")},
        "photos": [p for p in photos if p],
        "updates": [{k: u.get(k) for k in ("id", "author_role", "body", "status_from", "status_to", "internal", "created_at")} for u in updates],
        "listing": listing_card(listing, viewer_is_owner=viewer == "owner"),
        "renter": people.get(str(r["renter_id"])),
        "owner": people.get(str(r["owner_id"])),
        "next_statuses": list(MAINTENANCE_FLOW.get(r["status"], ())) if viewer == "owner" else (["closed"] if r["status"] == "resolved" else []),
        "emergency": emergency_guidance(listing.get("postcode")) if r["urgency"] != "routine" else None,
    }


class UpdateBody(BaseModel):
    body: Optional[str] = Field(None, max_length=2000)
    status_to: Optional[str] = None
    internal: bool = False
    scheduled_for: Optional[str] = None


@router.post("/maintenance/{request_id}/updates")
@limiter.limit("60/hour")
def add_update(request_id: str, request: Request, body: UpdateBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    r, viewer = _load_request(sb, actor, request_id)
    text = (body.body or "").strip() or None
    to = body.status_to
    if to:
        allowed = MAINTENANCE_FLOW.get(r["status"], ()) if viewer == "owner" else (("closed",) if r["status"] == "resolved" else ())
        if to not in allowed:
            raise HTTPException(status_code=409, detail="That status change is not available")
    if not text and not to:
        raise HTTPException(status_code=400, detail="Write an update or change the status")
    internal = bool(body.internal) and viewer == "owner" and not to
    patch: dict = {}
    if to:
        patch["status"] = to
        if to == "resolved":
            patch["resolved_at"] = now_iso()
        if to == "closed":
            patch["closed_at"] = now_iso()
    if body.scheduled_for and viewer == "owner":
        patch["scheduled_for"] = body.scheduled_for
    if patch:
        sb.table("maintenance_requests").update(patch).eq("id", request_id).execute()
    sb.table("maintenance_updates").insert(
        {"request_id": request_id, "author_id": actor.id, "author_role": viewer, "body": text, "status_from": r["status"] if to else None, "status_to": to, "internal": internal}
    ).execute()
    if not internal:
        other = r["renter_id"] if viewer == "owner" else r["owner_id"]
        status_words = {
            "acknowledged": "has been acknowledged", "scheduled": "has been scheduled", "in_progress": "is being worked on",
            "resolved": "is marked resolved", "closed": "is closed",
        }
        title = f"Maintenance update: {r['title']}"
        msg = f"Your request {status_words[to]}." if (to and viewer == "owner") else (text or "There is an update on this request.")
        notify_user(sb, other, "maintenance_updated", title, msg, f"/maintenance/{request_id}", entity_type="maintenance", entity_id=request_id)
    return get_request(request_id, request, authorization)


@router.post("/maintenance/{request_id}/photos")
@limiter.limit("30/hour")
async def add_photo(request_id: str, request: Request, file: UploadFile = File(...), authorization: Optional[str] = Header(None)):
    from uploads import ImageValidationError, prepare_public_image

    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    r, _viewer_kind = _load_request(sb, actor, request_id)
    if len(r.get("photos") or []) >= 8:
        raise HTTPException(status_code=400, detail="Up to 8 photos per request")
    data = await file.read()
    try:
        prepared = prepare_public_image(data, max_bytes=10 * 1024 * 1024, max_side=2048, min_side=100)
    except ImageValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    path = f"{r['tenancy_id']}/{uuid.uuid4().hex}.{prepared.extension}"
    try:
        sb.storage.from_(PHOTO_BUCKET).upload(path, prepared.data, file_options={"content-type": prepared.content_type})
    except Exception:
        logger.exception("maintenance photo upload failed")
        raise HTTPException(status_code=502, detail="The photo could not be saved. Please try again.")
    photos = list(r.get("photos") or []) + [path]
    sb.table("maintenance_requests").update({"photos": photos}).eq("id", request_id).execute()
    return {"photos": len(photos)}
