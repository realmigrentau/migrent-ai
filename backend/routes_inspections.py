"""
Migrent Hub - inspections.

Owners open inspection windows on a listing (time, length, capacity,
instructions). Renters book a place in a window, reschedule to another, or
cancel. Times are stored in UTC and always shown in the property's own
time zone (hub_common.timezone_for_postcode), never the viewer's.

Address release: a listing's street address is private (public_dto). The
owner opens a window knowing that the people who book it will be told where
to go, and the Hub says so on the screen where the window is created.
"""


import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request
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
    now_utc,
    parse_ts,
    record_listing_event,
    require_owner,
    require_writable,
)
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["hub-inspections"])

MAX_SLOTS_PER_REQUEST = 12


def _slot_out(slot: dict, booked: int, listing: Optional[dict], *, mine: Optional[dict] = None, owner_view: bool = False) -> dict:
    card = listing_card(listing, viewer_is_owner=owner_view)
    out = {
        "id": slot["id"],
        "listing_id": slot["listing_id"],
        "starts_at": slot["starts_at"],
        "ends_at": slot["ends_at"],
        "capacity": slot["capacity"],
        "booked": booked,
        "spaces_left": max(0, int(slot["capacity"]) - booked),
        "instructions": slot.get("instructions"),
        "status": slot["status"],
        "listing": card,
    }
    if mine is not None:
        out["my_booking"] = mine
    return out


def _booked_counts(sb, slot_ids: list[str]) -> dict[str, int]:
    if not slot_ids:
        return {}
    rows = sb.table("inspection_bookings").select("slot_id, status").in_("slot_id", slot_ids).eq("status", "booked").execute().data or []
    counts: dict[str, int] = {}
    for r in rows:
        counts[str(r["slot_id"])] = counts.get(str(r["slot_id"]), 0) + 1
    return counts


def _own_listing(sb, actor: HubActor, listing_id: str) -> dict:
    listing = fetch_listings(sb, [listing_id]).get(str(listing_id))
    if not listing or str(listing.get("owner_id")) != actor.id:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.get("moderation_status") in ("deleted",):
        raise HTTPException(status_code=409, detail="This listing has been archived")
    return listing


# ---------------------------------------------------------------------------
# Owner: windows
# ---------------------------------------------------------------------------


class SlotIn(BaseModel):
    starts_at: datetime
    duration_minutes: int = Field(30, ge=10, le=480)

    @field_validator("starts_at")
    @classmethod
    def _aware(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            raise ValueError("Include a time zone offset")
        return v.astimezone(timezone.utc)


class CreateSlotsBody(BaseModel):
    listing_id: str = Field(..., min_length=36, max_length=36)
    slots: list[SlotIn] = Field(..., min_length=1, max_length=MAX_SLOTS_PER_REQUEST)
    capacity: int = Field(6, ge=1, le=100)
    instructions: Optional[str] = Field(None, max_length=1000)


@router.post("/inspections/slots")
@limiter.limit("60/hour")
def create_slots(request: Request, body: CreateSlotsBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    sb = get_supabase_admin()
    listing = _own_listing(sb, actor, body.listing_id)
    now = now_utc()
    rows = []
    for s in body.slots:
        if s.starts_at < now + timedelta(minutes=30):
            raise HTTPException(status_code=400, detail="Inspection times need to be at least 30 minutes from now")
        if s.starts_at > now + timedelta(days=120):
            raise HTTPException(status_code=400, detail="Inspection times can be up to four months ahead")
        rows.append(
            {
                "listing_id": body.listing_id,
                "owner_id": actor.id,
                "starts_at": s.starts_at.isoformat(),
                "ends_at": (s.starts_at + timedelta(minutes=s.duration_minutes)).isoformat(),
                "capacity": body.capacity,
                "instructions": (body.instructions or "").strip() or None,
                "status": "scheduled",
            }
        )
    try:
        created = sb.table("inspection_slots").insert(rows).execute().data or []
    except Exception as e:
        raise hub_table_error(e)
    return {"slots": [_slot_out(s, 0, listing, owner_view=True) for s in created]}


class UpdateSlotBody(BaseModel):
    starts_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=10, le=480)
    capacity: Optional[int] = Field(None, ge=1, le=100)
    instructions: Optional[str] = Field(None, max_length=1000)


def _own_slot(sb, actor: HubActor, slot_id: str) -> dict:
    res = sb.table("inspection_slots").select("*").eq("id", slot_id).execute()
    if not res.data or str(res.data[0]["owner_id"]) != actor.id:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return res.data[0]


def _attendees(sb, slot_id: str) -> list[dict]:
    return sb.table("inspection_bookings").select("*").eq("slot_id", slot_id).eq("status", "booked").execute().data or []


@router.patch("/inspections/slots/{slot_id}")
def update_slot(slot_id: str, request: Request, body: UpdateSlotBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    sb = get_supabase_admin()
    slot = _own_slot(sb, actor, slot_id)
    if slot["status"] != "scheduled":
        raise HTTPException(status_code=409, detail="This inspection was cancelled")
    start = parse_ts(slot["starts_at"])
    end = parse_ts(slot["ends_at"])
    duration = int((end - start).total_seconds() // 60)
    patch: dict = {}
    moved = False
    if body.starts_at is not None:
        new_start = body.starts_at if body.starts_at.tzinfo else body.starts_at.replace(tzinfo=timezone.utc)
        if new_start < now_utc() + timedelta(minutes=30):
            raise HTTPException(status_code=400, detail="Choose a time at least 30 minutes from now")
        moved = new_start != start
        start = new_start.astimezone(timezone.utc)
        patch["starts_at"] = start.isoformat()
    if body.duration_minutes is not None:
        duration = body.duration_minutes
    if body.starts_at is not None or body.duration_minutes is not None:
        patch["ends_at"] = (start + timedelta(minutes=duration)).isoformat()
    booked = _attendees(sb, slot_id)
    if body.capacity is not None:
        if body.capacity < len(booked):
            raise HTTPException(status_code=400, detail=f"{len(booked)} people have already booked. Capacity cannot go below that.")
        patch["capacity"] = body.capacity
    if body.instructions is not None:
        patch["instructions"] = body.instructions.strip() or None
    if not patch:
        return {"slot": slot}
    updated = sb.table("inspection_slots").update(patch).eq("id", slot_id).execute().data[0]
    if moved and booked:
        listing = fetch_listings(sb, [slot["listing_id"]]).get(str(slot["listing_id"]))
        title = (listing_card(listing) or {}).get("title", "a home")
        for b in booked:
            notify_user(
                sb, b["renter_id"], "inspection_changed", "Inspection time changed",
                f"The inspection for {title} has moved. Check the new time, and reschedule or cancel if it no longer suits.",
                "/inspections", entity_type="inspection", entity_id=b["id"],
            )
    return {"slot": updated}


class CancelBody(BaseModel):
    reason: Optional[str] = Field(None, max_length=500)


@router.post("/inspections/slots/{slot_id}/cancel")
def cancel_slot(slot_id: str, request: Request, body: CancelBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    sb = get_supabase_admin()
    slot = _own_slot(sb, actor, slot_id)
    if slot["status"] == "cancelled":
        return {"slot": slot}
    booked = _attendees(sb, slot_id)
    updated = sb.table("inspection_slots").update({"status": "cancelled", "cancel_reason": (body.reason or "").strip() or None}).eq("id", slot_id).execute().data[0]
    sb.table("inspection_bookings").update({"status": "cancelled", "cancelled_at": now_iso()}).eq("slot_id", slot_id).eq("status", "booked").execute()
    listing = fetch_listings(sb, [slot["listing_id"]]).get(str(slot["listing_id"]))
    title = (listing_card(listing) or {}).get("title", "a home")
    for b in booked:
        notify_user(
            sb, b["renter_id"], "inspection_cancelled", "Inspection cancelled",
            f"The owner cancelled the inspection for {title}." + (f" They said: {body.reason.strip()}" if body.reason and body.reason.strip() else "") + " Other times may still be available.",
            f"/homes/{slot['listing_id']}#inspections", entity_type="inspection", entity_id=b["id"],
        )
    return {"slot": updated}


@router.get("/inspections/slots/{slot_id}/attendees")
def slot_attendees(slot_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    _own_slot(sb, actor, slot_id)
    rows = sb.table("inspection_bookings").select("*").eq("slot_id", slot_id).order("created_at").execute().data or []
    people = fetch_people(sb, [r["renter_id"] for r in rows])
    return {
        "attendees": [
            {"booking_id": r["id"], "status": r["status"], "note": r.get("note"), "person": people.get(str(r["renter_id"])), "booked_at": r["created_at"]}
            for r in rows
        ]
    }


class AttendanceBody(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def _s(cls, v: str) -> str:
        if v not in ("attended", "no_show", "booked"):
            raise ValueError("Unknown status")
        return v


@router.post("/inspections/bookings/{booking_id}/attendance")
def mark_attendance(booking_id: str, request: Request, body: AttendanceBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    res = sb.table("inspection_bookings").select("*").eq("id", booking_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking = res.data[0]
    _own_slot(sb, actor, booking["slot_id"])
    if booking["status"] == "cancelled":
        raise HTTPException(status_code=409, detail="That booking was cancelled")
    updated = sb.table("inspection_bookings").update({"status": body.status}).eq("id", booking_id).execute().data[0]
    return {"booking": {"id": updated["id"], "status": updated["status"]}}


# ---------------------------------------------------------------------------
# Renter: book, reschedule, cancel
# ---------------------------------------------------------------------------


@router.get("/listings/{listing_id}/inspection-slots")
def listing_slots(listing_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    listing = fetch_listings(sb, [listing_id]).get(str(listing_id))
    card = listing_card(listing)
    is_owner = bool(listing and str(listing.get("owner_id")) == actor.id)
    if not card or (card["public_state"] != "published" and not is_owner):
        raise HTTPException(status_code=404, detail="Listing not found")
    try:
        slots = (
            sb.table("inspection_slots")
            .select("*")
            .eq("listing_id", listing_id)
            .eq("status", "scheduled")
            .gte("starts_at", now_iso())
            .order("starts_at")
            .limit(30)
            .execute()
            .data
            or []
        )
    except Exception as e:
        raise hub_table_error(e)
    counts = _booked_counts(sb, [s["id"] for s in slots])
    mine = {}
    if slots:
        rows = sb.table("inspection_bookings").select("id, slot_id, status").eq("renter_id", actor.id).eq("status", "booked").in_("slot_id", [s["id"] for s in slots]).execute().data or []
        mine = {str(r["slot_id"]): {"id": r["id"], "status": r["status"]} for r in rows}
    return {
        "timezone": card["timezone"],
        "slots": [
            {k: v for k, v in _slot_out(s, counts.get(str(s["id"]), 0), None, mine=mine.get(str(s["id"]))).items() if k != "listing"}
            for s in slots
        ],
    }


class BookBody(BaseModel):
    slot_id: str = Field(..., min_length=36, max_length=36)
    note: Optional[str] = Field(None, max_length=500)


def _book(sb, actor: HubActor, slot_id: str, note: Optional[str]) -> tuple[dict, dict, dict]:
    res = sb.table("inspection_slots").select("*").eq("id", slot_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="That inspection time is no longer available")
    slot = res.data[0]
    if slot["status"] != "scheduled" or (parse_ts(slot["starts_at"]) or now_utc()) <= now_utc():
        raise HTTPException(status_code=409, detail="That inspection time is no longer available")
    listing = fetch_listings(sb, [slot["listing_id"]]).get(str(slot["listing_id"]))
    card = listing_card(listing)
    if not card or card["public_state"] != "published":
        raise HTTPException(status_code=409, detail="This home is no longer available")
    if str(listing["owner_id"]) == actor.id:
        raise HTTPException(status_code=400, detail="You cannot book an inspection of your own listing")
    from blocks import require_not_blocked

    require_not_blocked(sb, actor.id, str(listing["owner_id"]))
    already = sb.table("inspection_bookings").select("id").eq("slot_id", slot_id).eq("renter_id", actor.id).eq("status", "booked").execute()
    if already.data:
        raise HTTPException(status_code=409, detail="You are already booked for this time")
    if _booked_counts(sb, [slot_id]).get(str(slot_id), 0) >= int(slot["capacity"]):
        raise HTTPException(status_code=409, detail="That time is full. Choose another time.")
    booking = sb.table("inspection_bookings").insert(
        {"slot_id": slot_id, "listing_id": slot["listing_id"], "renter_id": actor.id, "status": "booked", "note": (note or "").strip() or None}
    ).execute().data[0]
    return booking, slot, listing


@router.post("/inspections/bookings")
@limiter.limit("30/hour")
def book_inspection(request: Request, body: BookBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    try:
        booking, slot, listing = _book(sb, actor, body.slot_id, body.note)
    except HTTPException:
        raise
    except Exception as e:
        raise hub_table_error(e)
    record_listing_event(sb, slot["listing_id"], "inspection_booked", actor.id)
    title = (listing_card(listing) or {}).get("title", "your home")
    notify_user(
        sb, listing["owner_id"], "inspection_booked", "New inspection booking",
        f"{actor.display_name} booked an inspection of {title}.",
        "/inspections", entity_type="inspection", entity_id=booking["id"],
    )
    notify_user(
        sb, actor.id, "inspection_booked", "Inspection booked",
        f"You are booked to inspect {title}. The address and any instructions are in Migrent Hub.",
        "/inspections", entity_type="inspection", entity_id=booking["id"],
    )
    return {"booking": booking_out(sb, booking, slot, listing)}


def booking_out(sb, booking: dict, slot: dict, listing: Optional[dict]) -> dict:
    card = listing_card(listing)
    if card:
        # The street address is released to people with a booking.
        card["street_address"] = (listing or {}).get("address")
    return {
        "id": booking["id"],
        "status": booking["status"],
        "note": booking.get("note"),
        "slot": {
            "id": slot["id"],
            "starts_at": slot["starts_at"],
            "ends_at": slot["ends_at"],
            "instructions": slot.get("instructions"),
            "status": slot["status"],
        },
        "listing": card,
        "created_at": booking.get("created_at"),
    }


def _own_booking(sb, actor: HubActor, booking_id: str) -> dict:
    res = sb.table("inspection_bookings").select("*").eq("id", booking_id).execute()
    if not res.data or str(res.data[0]["renter_id"]) != actor.id:
        raise HTTPException(status_code=404, detail="Booking not found")
    return res.data[0]


@router.post("/inspections/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    booking = _own_booking(sb, actor, booking_id)
    if booking["status"] != "booked":
        return {"booking": {"id": booking["id"], "status": booking["status"]}}
    sb.table("inspection_bookings").update({"status": "cancelled", "cancelled_at": now_iso()}).eq("id", booking_id).execute()
    slot = sb.table("inspection_slots").select("*").eq("id", booking["slot_id"]).execute().data[0]
    listing = fetch_listings(sb, [slot["listing_id"]]).get(str(slot["listing_id"]))
    notify_user(
        sb, slot["owner_id"], "inspection_cancelled", "An inspection booking was cancelled",
        f"{actor.display_name} cancelled their inspection of {(listing_card(listing) or {}).get('title', 'your home')}.",
        "/inspections", entity_type="inspection", entity_id=booking_id,
    )
    return {"booking": {"id": booking_id, "status": "cancelled"}}


class RescheduleBody(BaseModel):
    slot_id: str = Field(..., min_length=36, max_length=36)


@router.post("/inspections/bookings/{booking_id}/reschedule")
def reschedule_booking(booking_id: str, request: Request, body: RescheduleBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    booking = _own_booking(sb, actor, booking_id)
    if booking["status"] != "booked":
        raise HTTPException(status_code=409, detail="This booking is no longer active")
    new_slot = sb.table("inspection_slots").select("listing_id").eq("id", body.slot_id).execute()
    if not new_slot.data or str(new_slot.data[0]["listing_id"]) != str(booking["listing_id"]):
        raise HTTPException(status_code=400, detail="Choose another time for the same home")
    # Book the new time first, so a full slot leaves the old booking intact.
    new_booking, slot, listing = _book(sb, actor, body.slot_id, booking.get("note"))
    sb.table("inspection_bookings").update({"status": "cancelled", "cancelled_at": now_iso()}).eq("id", booking_id).execute()
    notify_user(
        sb, slot["owner_id"], "inspection_changed", "An inspection booking moved",
        f"{actor.display_name} moved their inspection of {(listing_card(listing) or {}).get('title', 'your home')} to another time.",
        "/inspections", entity_type="inspection", entity_id=new_booking["id"],
    )
    return {"booking": booking_out(sb, new_booking, slot, listing)}


# ---------------------------------------------------------------------------
# Lists
# ---------------------------------------------------------------------------


def renter_inspections(sb, renter_id: str, *, upcoming_only: bool = True, limit: Optional[int] = None) -> list[dict]:
    rows = sb.table("inspection_bookings").select("*").eq("renter_id", renter_id).order("created_at", desc=True).limit(100).execute().data or []
    if not rows:
        return []
    slot_rows = sb.table("inspection_slots").select("*").in_("id", [r["slot_id"] for r in rows]).execute().data or []
    slots = {str(s["id"]): s for s in slot_rows}
    listings = fetch_listings(sb, [r["listing_id"] for r in rows])
    out = []
    now = now_utc()
    for r in rows:
        slot = slots.get(str(r["slot_id"]))
        if not slot:
            continue
        start = parse_ts(slot["starts_at"])
        is_upcoming = r["status"] == "booked" and slot["status"] == "scheduled" and start and start > now - timedelta(hours=1)
        if upcoming_only and not is_upcoming:
            continue
        item = booking_out(sb, r, slot, listings.get(str(r["listing_id"])))
        item["upcoming"] = bool(is_upcoming)
        out.append(item)
    out.sort(key=lambda b: b["slot"]["starts_at"], reverse=not upcoming_only)
    if upcoming_only:
        out.sort(key=lambda b: b["slot"]["starts_at"])
    return out[:limit] if limit else out


def owner_inspections(sb, owner_id: str, *, upcoming_only: bool = True, limit: Optional[int] = None) -> list[dict]:
    q = sb.table("inspection_slots").select("*").eq("owner_id", owner_id)
    if upcoming_only:
        q = q.gte("ends_at", now_iso())
    slots = q.order("starts_at").limit(200).execute().data or []
    counts = _booked_counts(sb, [s["id"] for s in slots])
    listings = fetch_listings(sb, [s["listing_id"] for s in slots])
    out = [_slot_out(s, counts.get(str(s["id"]), 0), listings.get(str(s["listing_id"])), owner_view=True) for s in slots]
    return out[:limit] if limit else out


@router.get("/inspections")
def list_inspections(request: Request, scope: str = "upcoming", authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    upcoming = scope != "all"
    try:
        if actor.is_owner:
            return {"role": "owner", "slots": owner_inspections(sb, actor.id, upcoming_only=upcoming)}
        return {"role": "renter", "bookings": renter_inspections(sb, actor.id, upcoming_only=upcoming)}
    except Exception as e:
        raise hub_table_error(e)


def send_inspection_reminders(sb) -> list[str]:
    """Remind renters the day before. Idempotent via reminder_sent_at."""
    now = now_utc()
    horizon = (now + timedelta(hours=24)).isoformat()
    slots = sb.table("inspection_slots").select("*").eq("status", "scheduled").gte("starts_at", now.isoformat()).lte("starts_at", horizon).execute().data or []
    if not slots:
        return []
    slot_map = {str(s["id"]): s for s in slots}
    bookings = sb.table("inspection_bookings").select("*").in_("slot_id", list(slot_map)).eq("status", "booked").is_("reminder_sent_at", "null").execute().data or []
    listings = fetch_listings(sb, [s["listing_id"] for s in slots])
    sent = []
    for b in bookings:
        slot = slot_map[str(b["slot_id"])]
        title = (listing_card(listings.get(str(slot["listing_id"]))) or {}).get("title", "a home")
        notify_user(
            sb, b["renter_id"], "inspection_reminder", "Inspection tomorrow",
            f"A reminder that you are booked to inspect {title}. The address and instructions are in Migrent Hub.",
            "/inspections", entity_type="inspection", entity_id=b["id"],
        )
        sb.table("inspection_bookings").update({"reminder_sent_at": now_iso()}).eq("id", b["id"]).execute()
        sent.append(str(b["id"]))
    return sent
