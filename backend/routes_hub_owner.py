"""
Migrent Hub - the owner's side.

    /hub/properties            the portfolio: properties and their units
    /hub/listing-drafts        the listing wizard's autosave, and submit
    /hub/listing-photos        server-validated listing photo upload
    /hub/listings/{id}         the owner's view of one listing, and actions
    /hub/insights              listing performance from tracked events
    /hub/listing-events        public, rate-limited view tracking

A listing is still created by routes_listings.create_listing - geocoding,
spam scoring, the verification gate and the moderation trail all run as
they always have. The wizard only holds the half-finished version.

Insights are counted from listing_events, which starts empty. Nothing is
estimated or back-filled: a new listing shows zeros until people look at it.
"""


import logging
import uuid
from datetime import date, timedelta
from typing import Any, Optional

from fastapi import APIRouter, File, Header, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field, ValidationError, field_validator

from concurrency import run_parallel
from db import get_supabase_admin
from public_dto import canonical_place_type
from hub_common import (
    CARD_COLUMNS,
    HubActor,
    fetch_listings,
    hub_actor,
    hub_table_error,
    listing_card,
    now_iso,
    now_utc,
    record_listing_event,
    require_owner,
    require_writable,
    state_for_postcode,
)
from limiter import limiter
from listing_rules import bond_weeks_from_text, check_location, cost_problems, location_problem

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["hub-owner"])

LISTING_PHOTO_BUCKET = "listing-images"
STATES = ("NSW", "VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT")


# ---------------------------------------------------------------------------
# Properties
# ---------------------------------------------------------------------------


def clean_state(v: Optional[str]) -> Optional[str]:
    if v is None or v == "":
        return None
    v = v.upper().strip()
    if v not in STATES:
        raise ValueError("Choose an Australian state or territory")
    return v


class PropertyBody(BaseModel):
    street_address: str = Field(..., min_length=3, max_length=300)
    suburb: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = None
    postcode: Optional[int] = Field(None, ge=800, le=9999)
    property_type: Optional[str] = Field(None, max_length=40)
    relationship: str = "owner"
    nickname: Optional[str] = Field(None, max_length=80)
    bedrooms: Optional[int] = Field(None, ge=0, le=30)
    bathrooms: Optional[int] = Field(None, ge=0, le=20)
    parking_spaces: Optional[int] = Field(None, ge=0, le=20)

    @field_validator("state")
    @classmethod
    def _state(cls, v: Optional[str]) -> Optional[str]:
        return clean_state(v)

    @field_validator("relationship")
    @classmethod
    def _rel(cls, v: str) -> str:
        if v not in ("owner", "manager"):
            raise ValueError("Choose owner or manager")
        return v


def _properties(sb, owner_id: str) -> list[dict]:
    return sb.table("properties").select("*").eq("owner_id", owner_id).is_("archived_at", "null").order("created_at", desc=True).execute().data or []


def _owner_listings(sb, owner_id: str) -> list[dict]:
    try:
        rows = sb.table("listings").select(CARD_COLUMNS + ", moderation_notes, moderation_reason, listing_fee_paid_at, paused_at").eq("owner_id", owner_id).order("created_at", desc=True).execute().data or []
    except Exception:
        rows = sb.table("listings").select(CARD_COLUMNS).eq("owner_id", owner_id).order("created_at", desc=True).execute().data or []
    return [r for r in rows if r.get("moderation_status") != "deleted"]


def unit_status(row: dict, pending_apps: int = 0) -> dict:
    """One plain-language status per unit, for the portfolio view."""
    status = row.get("moderation_status")
    occupied = (row.get("occupancy") or "vacant") == "occupied"
    if occupied:
        label, tone = "Occupied", "neutral"
    elif status == "approved":
        from public_dto import listing_public_state

        if listing_public_state(row) == "expired":
            label, tone = "Listing expired", "warning"
        elif pending_apps:
            label, tone = f"{pending_apps} application{'s' if pending_apps != 1 else ''}", "info"
        else:
            label, tone = "Available", "success"
    elif status == "draft":
        label, tone = "Draft", "neutral"
    elif status in ("pending_approval", "flagged"):
        label, tone = "In review", "info"
    elif status == "changes_requested":
        label, tone = "Changes requested", "warning"
    elif status == "paused":
        label, tone = "Paused", "neutral"
    elif status == "expired":
        label, tone = "Listing expired", "warning"
    elif status == "rejected":
        label, tone = "Not approved", "danger"
    elif status == "hidden":
        label, tone = "Under review", "warning"
    else:
        label, tone = (status or "Unknown").replace("_", " ").capitalize(), "neutral"
    return {"label": label, "tone": tone}


def _counts_by_listing(sb, owner_id: str) -> tuple[dict[str, int], dict[str, int]]:
    def _tally(query) -> dict[str, int]:
        out: dict[str, int] = {}
        try:
            for r in query.execute().data or []:
                out[str(r["listing_id"])] = out.get(str(r["listing_id"]), 0) + 1
        except Exception:
            pass
        return out

    apps, slots = run_parallel(
        lambda: _tally(sb.table("applications").select("listing_id, status").eq("owner_id", owner_id).in_("status", ["submitted", "under_review", "shortlisted"])),
        lambda: _tally(sb.table("inspection_slots").select("listing_id").eq("owner_id", owner_id).eq("status", "scheduled").gte("starts_at", now_iso())),
    )
    return apps, slots


def portfolio(sb, owner_id: str) -> dict:
    # Independent reads, fetched together (concurrency.py).
    props, listings, (apps, slots) = run_parallel(
        lambda: _properties(sb, owner_id),
        lambda: _owner_listings(sb, owner_id),
        lambda: _counts_by_listing(sb, owner_id),
    )
    by_prop: dict[str, list[dict]] = {}
    unassigned = []
    for row in listings:
        card = listing_card(row, viewer_is_owner=True)
        card["status"] = unit_status(row, apps.get(card["id"], 0))
        card["pending_applications"] = apps.get(card["id"], 0)
        card["upcoming_inspections"] = slots.get(card["id"], 0)
        card["moderation_notes"] = row.get("moderation_notes") if row.get("moderation_status") in ("changes_requested", "rejected") else None
        pid = str(row.get("property_id")) if row.get("property_id") else None
        if pid:
            by_prop.setdefault(pid, []).append(card)
        else:
            unassigned.append(card)
    out = []
    for p in props:
        units = by_prop.pop(str(p["id"]), [])
        cover = next((u["image"] for u in units if u.get("image")), None)
        out.append(
            {
                **{k: p.get(k) for k in ("id", "nickname", "relationship", "street_address", "suburb", "state", "postcode", "property_type", "bedrooms", "bathrooms", "parking_spaces", "created_at")},
                "cover_image": cover,
                "units": units,
                "summary": {
                    "units": len(units),
                    "available": sum(1 for u in units if u["status"]["tone"] in ("success", "info") and u.get("occupancy") != "occupied" and u.get("public_state") == "published"),
                    "occupied": sum(1 for u in units if u.get("occupancy") == "occupied"),
                    "applications": sum(u["pending_applications"] for u in units),
                    "inspections": sum(u["upcoming_inspections"] for u in units),
                },
            }
        )
    # Units whose property row is archived or missing still belong somewhere.
    for leftovers in by_prop.values():
        unassigned.extend(leftovers)
    totals = {
        "properties": len(out),
        "units": len(listings),
        "available": sum(p["summary"]["available"] for p in out) + sum(1 for u in unassigned if u.get("public_state") == "published" and u.get("occupancy") != "occupied"),
        "occupied": sum(1 for l in listings if (l.get("occupancy") or "vacant") == "occupied"),
        "applications": sum(apps.values()),
        "inspections": sum(slots.values()),
        "drafts": sum(1 for l in listings if l.get("moderation_status") == "draft"),
    }
    return {"properties": out, "unassigned": unassigned, "totals": totals}


@router.get("/properties")
def list_properties(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_owner(actor)
    sb = get_supabase_admin()
    try:
        data, drafts = run_parallel(
            lambda: portfolio(sb, actor.id),
            lambda: sb.table("listing_drafts").select("id, property_id, data, step, updated_at").eq("owner_id", actor.id).is_("submitted_at", "null").order("updated_at", desc=True).execute().data or [],
        )
    except Exception as e:
        raise hub_table_error(e)
    data["drafts"] = [_draft_summary(d) for d in drafts]
    return data


@router.post("/properties")
@limiter.limit("30/hour")
def create_property(request: Request, body: PropertyBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    sb = get_supabase_admin()
    row = body.model_dump()
    row["state"] = row.get("state") or state_for_postcode(row.get("postcode"))
    place_problem = location_problem(row.get("suburb"), row.get("postcode"), row.get("state"))
    if place_problem:
        raise HTTPException(status_code=400, detail=place_problem)
    try:
        created = sb.table("properties").insert({**row, "owner_id": actor.id, "archived_at": None}).execute().data[0]
    except Exception as e:
        raise hub_table_error(e)
    return {"property": created}


def _own_property(sb, actor: HubActor, property_id: str) -> dict:
    try:
        res = sb.table("properties").select("*").eq("id", property_id).execute()
    except Exception as e:
        raise hub_table_error(e)
    if not res.data or str(res.data[0]["owner_id"]) != actor.id or res.data[0].get("archived_at"):
        raise HTTPException(status_code=404, detail="Property not found")
    return res.data[0]


@router.get("/location-check")
@limiter.limit("120/minute")
def location_check(
    request: Request,
    suburb: str = "",
    postcode: str = "",
    state: str = "",
    authorization: Optional[str] = Header(None),
):
    """The wizard's live check of suburb, state and postcode. `problem`
    blocks the listing (the same rule runs on submit); `hint` is advice."""
    hub_actor(request, authorization)
    return check_location(suburb[:100], postcode[:4], (state or "")[:3] or None)


@router.get("/properties/{property_id}")
def get_property(property_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_owner(actor)
    sb = get_supabase_admin()
    prop = _own_property(sb, actor, property_id)
    data = portfolio(sb, actor.id)
    entry = next((p for p in data["properties"] if str(p["id"]) == str(property_id)), None) or {**prop, "units": [], "summary": {}}
    unit_ids = [u["id"] for u in entry.get("units", [])]
    tenancies = []
    try:
        if unit_ids:
            rows = sb.table("tenancies").select("*").in_("listing_id", unit_ids).in_("status", ["upcoming", "active"]).execute().data or []
            from hub_common import fetch_people

            people = fetch_people(sb, [t["renter_id"] for t in rows])
            tenancies = [{**{k: t.get(k) for k in ("id", "listing_id", "status", "start_date", "end_date", "rent_amount", "rent_frequency")}, "renter": people.get(str(t["renter_id"]))} for t in rows]
    except Exception:
        tenancies = []
    entry["tenancies"] = tenancies
    entry["performance"] = listing_performance(sb, unit_ids, days=30)
    return {"property": entry}


class PropertyPatch(BaseModel):
    street_address: Optional[str] = Field(None, min_length=3, max_length=300)
    suburb: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = None
    postcode: Optional[int] = Field(None, ge=800, le=9999)
    property_type: Optional[str] = Field(None, max_length=40)
    relationship: Optional[str] = None
    nickname: Optional[str] = Field(None, max_length=80)
    bedrooms: Optional[int] = Field(None, ge=0, le=30)
    bathrooms: Optional[int] = Field(None, ge=0, le=20)
    parking_spaces: Optional[int] = Field(None, ge=0, le=20)


@router.patch("/properties/{property_id}")
def update_property(property_id: str, request: Request, body: PropertyPatch, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    sb = get_supabase_admin()
    prop = _own_property(sb, actor, property_id)
    patch = body.model_dump(exclude_unset=True)
    if "state" in patch:
        try:
            patch["state"] = clean_state(patch["state"])
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    if {"suburb", "state", "postcode"} & set(patch):
        merged = {**prop, **patch}
        place_problem = location_problem(merged.get("suburb"), merged.get("postcode"), merged.get("state"))
        if place_problem:
            raise HTTPException(status_code=400, detail=place_problem)
    if "relationship" in patch and patch["relationship"] not in ("owner", "manager"):
        raise HTTPException(status_code=400, detail="Choose owner or manager")
    if not patch:
        raise HTTPException(status_code=400, detail="Nothing to change")
    updated = sb.table("properties").update(patch).eq("id", property_id).execute().data[0]
    return {"property": updated}


@router.post("/properties/{property_id}/archive")
def archive_property(property_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    sb = get_supabase_admin()
    _own_property(sb, actor, property_id)
    live = [l for l in _owner_listings(sb, actor.id) if str(l.get("property_id")) == str(property_id) and l.get("moderation_status") in ("approved", "pending_approval", "paused", "changes_requested", "draft")]
    if live:
        raise HTTPException(status_code=409, detail="Archive or remove this property's listings first")
    try:
        active = sb.table("tenancies").select("id").eq("property_id", property_id).in_("status", ["upcoming", "active"]).execute().data
    except Exception:
        active = []
    if active:
        raise HTTPException(status_code=409, detail="This property has an active tenancy")
    sb.table("properties").update({"archived_at": now_iso()}).eq("id", property_id).execute()
    return {"archived": True}


# ---------------------------------------------------------------------------
# Listing drafts (the wizard)
# ---------------------------------------------------------------------------

# What the wizard may store. Anything else in `data` is dropped on save.
DRAFT_FIELDS = {
    # property
    "street_address", "suburb", "state", "postcode", "property_type", "relationship", "nickname",
    "property_bedrooms", "property_bathrooms", "parking_spaces", "latitude", "longitude",
    # space
    "place_type", "unit_label", "bedrooms", "bathrooms", "bathroom_type", "beds", "max_guests", "parking",
    "who_else_lives_here", "total_other_people",
    # details
    "title", "description", "highlights", "furnished", "bills_included", "internet_included", "internet_speed",
    "air_conditioning", "laundry", "dishwasher", "pets_allowed", "pet_details", "no_smoking", "quiet_hours",
    "security_cameras", "security_cameras_location", "lockable_bedroom", "weapons_on_property", "weapons_explanation",
    "other_safety_details", "nearest_transport", "neighbourhood_vibe", "accessibility_notes",
    # photos
    "images",
    # pricing
    "weekly_price", "bond_weeks", "rent_in_advance_weeks", "bills_estimate_weekly",
    "weekly_discount", "monthly_discount", "fees_note",
    # availability
    "available_from", "available_to", "min_stay_weeks", "max_stay_weeks", "listing_purpose", "lease_months",
    # preferences
    "tenant_prefs", "couples_ok", "gender_preference", "newcomer_friendly",
}


def _draft_summary(d: dict) -> dict:
    data = d.get("data") or {}
    images = data.get("images") or []
    return {
        "id": d["id"],
        "property_id": d.get("property_id"),
        "step": d.get("step") or 0,
        "title": data.get("title") or data.get("unit_label") or (data.get("street_address") and f"{data.get('street_address')}") or "Untitled listing",
        "suburb": data.get("suburb"),
        "image": images[0] if images else None,
        "updated_at": d.get("updated_at"),
    }


class DraftCreate(BaseModel):
    property_id: Optional[str] = None
    from_listing_id: Optional[str] = None
    data: dict = Field(default_factory=dict)


def _clean_draft(data: dict) -> dict:
    return {k: v for k, v in (data or {}).items() if k in DRAFT_FIELDS}


LISTING_TO_DRAFT = {
    "place_type": "place_type", "unit_label": "unit_label", "bedrooms": "bedrooms", "bathrooms": "bathrooms",
    "bathroom_type": "bathroom_type", "beds": "beds", "max_guests": "max_guests", "parking": "parking",
    "who_else_lives_here": "who_else_lives_here", "total_other_people": "total_other_people", "title": "title",
    "description": "description", "highlights": "highlights", "furnished": "furnished", "bills_included": "bills_included",
    "internet_included": "internet_included", "internet_speed": "internet_speed", "air_conditioning": "air_conditioning",
    "laundry": "laundry", "dishwasher": "dishwasher", "pets_allowed": "pets_allowed", "pet_details": "pet_details",
    "no_smoking": "no_smoking", "quiet_hours": "quiet_hours", "security_cameras": "security_cameras",
    "security_cameras_location": "security_cameras_location", "lockable_bedroom": "lockable_bedroom",
    "weapons_on_property": "weapons_on_property",
    "weapons_explanation": "weapons_explanation", "other_safety_details": "other_safety_details",
    "nearest_transport": "nearest_transport", "neighbourhood_vibe": "neighbourhood_vibe", "images": "images",
    "weekly_price": "weekly_price", "bond_weeks": "bond_weeks", "rent_in_advance_weeks": "rent_in_advance_weeks",
    "bills_estimate_weekly": "bills_estimate_weekly", "weekly_discount": "weekly_discount", "monthly_discount": "monthly_discount",
    "min_stay_weeks": "min_stay_weeks", "max_stay_weeks": "max_stay_weeks", "listing_purpose": "listing_purpose",
    "tenant_prefs": "tenant_prefs", "couples_ok": "couples_ok", "gender_preference": "gender_preference",
    "newcomer_friendly": "newcomer_friendly", "address": "street_address", "suburb": "suburb", "postcode": "postcode", "property_type": "property_type",
}


@router.get("/listing-drafts")
def list_drafts(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    try:
        rows = sb.table("listing_drafts").select("*").eq("owner_id", actor.id).is_("submitted_at", "null").order("updated_at", desc=True).execute().data or []
    except Exception as e:
        raise hub_table_error(e)
    return {"drafts": [_draft_summary(d) for d in rows]}


@router.post("/listing-drafts")
@limiter.limit("60/hour")
def create_draft(request: Request, body: DraftCreate, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    sb = get_supabase_admin()
    data = _clean_draft(body.data)
    step = 0
    if body.property_id:
        prop = _own_property(sb, actor, body.property_id)
        data.update(
            {
                "street_address": prop.get("street_address"),
                "suburb": prop.get("suburb"),
                "state": prop.get("state"),
                "postcode": prop.get("postcode"),
                "property_type": prop.get("property_type"),
                "relationship": prop.get("relationship"),
                "nickname": prop.get("nickname"),
                "property_bedrooms": prop.get("bedrooms"),
                "property_bathrooms": prop.get("bathrooms"),
                "parking_spaces": prop.get("parking_spaces"),
            }
        )
        step = 1
    if body.from_listing_id:
        src = sb.table("listings").select("*").eq("id", body.from_listing_id).execute().data
        if not src or str(src[0]["owner_id"]) != actor.id:
            raise HTTPException(status_code=404, detail="Listing not found")
        for col, key in LISTING_TO_DRAFT.items():
            if src[0].get(col) is not None and key not in ("unit_label",):
                data[key] = src[0][col]
        data["state"] = data.get("state") or state_for_postcode(src[0].get("postcode"))
        # Listings from before bond was counted in weeks carry it as text.
        if data.get("bond_weeks") is None:
            weeks = bond_weeks_from_text(src[0].get("bond"))
            if weeks is not None:
                data["bond_weeks"] = weeks
        # A copy is a new room or a relist, never the same dates.
        data.pop("available_from", None)
        data.pop("available_to", None)
        if src[0].get("unit_label"):
            data["unit_label"] = None
        if not body.property_id and src[0].get("property_id"):
            body.property_id = str(src[0]["property_id"])
        step = 1
    try:
        row = sb.table("listing_drafts").insert({"owner_id": actor.id, "property_id": body.property_id, "data": data, "step": step, "submitted_at": None}).execute().data[0]
    except Exception as e:
        raise hub_table_error(e)
    return {"draft": row}


def _own_draft(sb, actor: HubActor, draft_id: str) -> dict:
    try:
        res = sb.table("listing_drafts").select("*").eq("id", draft_id).execute()
    except Exception as e:
        raise hub_table_error(e)
    if not res.data or str(res.data[0]["owner_id"]) != actor.id:
        raise HTTPException(status_code=404, detail="Draft not found")
    return res.data[0]


@router.get("/listing-drafts/{draft_id}")
def get_draft(draft_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    return {"draft": _own_draft(sb, actor, draft_id)}


class DraftSave(BaseModel):
    data: dict
    step: int = Field(0, ge=0, le=20)


@router.put("/listing-drafts/{draft_id}")
@limiter.limit("240/hour")
def save_draft(draft_id: str, request: Request, body: DraftSave, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    draft = _own_draft(sb, actor, draft_id)
    if draft.get("submitted_at"):
        raise HTTPException(status_code=409, detail="This listing has already been submitted")
    data = _clean_draft(body.data)
    row = sb.table("listing_drafts").update({"data": data, "step": body.step}).eq("id", draft_id).execute().data[0]
    return {"draft": {"id": row["id"], "step": row["step"], "updated_at": row.get("updated_at")}}


@router.delete("/listing-drafts/{draft_id}")
def delete_draft(draft_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    _own_draft(sb, actor, draft_id)
    sb.table("listing_drafts").delete().eq("id", draft_id).execute()
    return {"deleted": True}


def _whole(v: Any) -> Optional[int]:
    try:
        return int(v) if v is not None and v != "" else None
    except (TypeError, ValueError):
        return None


def _draft_to_listing(data: dict) -> tuple[dict, str, Optional[int]]:
    """Map the wizard's fields onto the ListingCreate payload."""
    purpose = data.get("listing_purpose") or "long_term"
    min_stay_weeks = data.get("min_stay_weeks")
    if not min_stay_weeks and data.get("lease_months"):
        try:
            min_stay_weeks = int(round(float(data["lease_months"]) * 4.345))
        except (TypeError, ValueError):
            min_stay_weeks = None
    payload: dict[str, Any] = {
        "address": data.get("street_address"),
        "suburb": data.get("suburb"),
        "postcode": data.get("postcode"),
        "weekly_price": data.get("weekly_price"),
        "description": data.get("description"),
        "images": data.get("images") or [],
        "title": data.get("title"),
        "property_type": data.get("property_type"),
        "place_type": canonical_place_type(data.get("place_type")),
        "max_guests": data.get("max_guests"),
        "bedrooms": data.get("bedrooms"),
        "beds": data.get("beds"),
        "bathrooms": data.get("bathrooms"),
        "bathroom_type": data.get("bathroom_type"),
        "who_else_lives_here": data.get("who_else_lives_here"),
        "total_other_people": data.get("total_other_people"),
        "furnished": data.get("furnished"),
        "bills_included": data.get("bills_included"),
        "parking": data.get("parking"),
        "highlights": data.get("highlights"),
        "weekly_discount": data.get("weekly_discount"),
        "monthly_discount": data.get("monthly_discount"),
        "bond_weeks": _whole(data.get("bond_weeks")),
        "rent_in_advance_weeks": _whole(data.get("rent_in_advance_weeks")) if purpose == "long_term" else None,
        "bills_estimate_weekly": _whole(data.get("bills_estimate_weekly")) if not data.get("bills_included") else None,
        "newcomer_friendly": data.get("newcomer_friendly"),
        "no_smoking": data.get("no_smoking"),
        "quiet_hours": data.get("quiet_hours"),
        "tenant_prefs": data.get("tenant_prefs"),
        "min_stay": f"{min_stay_weeks} weeks" if min_stay_weeks else None,
        "security_cameras": data.get("security_cameras"),
        "security_cameras_location": data.get("security_cameras_location"),
        "lockable_bedroom": data.get("lockable_bedroom"),
        "weapons_on_property": data.get("weapons_on_property"),
        "weapons_explanation": data.get("weapons_explanation"),
        "other_safety_details": data.get("other_safety_details"),
        "available_from": data.get("available_from"),
        "available_to": data.get("available_to"),
        "instant_book": False,
        "internet_included": data.get("internet_included"),
        "internet_speed": data.get("internet_speed"),
        "pets_allowed": data.get("pets_allowed"),
        "pet_details": data.get("pet_details"),
        "air_conditioning": data.get("air_conditioning"),
        "laundry": data.get("laundry"),
        "dishwasher": data.get("dishwasher"),
        "nearest_transport": data.get("nearest_transport"),
        "neighbourhood_vibe": data.get("neighbourhood_vibe"),
        "gender_preference": data.get("gender_preference") if canonical_place_type(data.get("place_type")) in ("private_room", "shared_room") else None,
        "couples_ok": data.get("couples_ok"),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
    }
    return {k: v for k, v in payload.items() if v is not None}, purpose, min_stay_weeks


def draft_problems(data: dict) -> list[dict]:
    """Every field the listing API requires, as a list the wizard can point at."""
    problems = []

    def need(cond: bool, step: str, field: str, message: str):
        if not cond:
            problems.append({"step": step, "field": field, "message": message})

    need(bool((data.get("street_address") or "").strip()) and len(data.get("street_address", "")) >= 5, "property", "street_address", "Add the street address")
    need(bool(data.get("suburb")), "property", "suburb", "Add the suburb")
    try:
        pc = int(data.get("postcode") or 0)
    except (TypeError, ValueError):
        pc = 0
    need(800 <= pc <= 9999, "property", "postcode", "Add a four-digit postcode")
    need(bool(data.get("place_type")), "space", "place_type", "Choose whether this is the whole place or a room")
    need(bool((data.get("title") or "").strip()), "details", "title", "Give the listing a title")
    need(len((data.get("description") or "").strip()) >= 10, "details", "description", "Write a description (at least a sentence)")
    need(len(data.get("images") or []) >= 1, "photos", "images", "Add at least one photo")
    try:
        price = float(data.get("weekly_price") or 0)
    except (TypeError, ValueError):
        price = 0
    need(0 < price <= 50000, "pricing", "weekly_price", "Set the weekly rent")
    need(bool(data.get("available_from")), "availability", "available_from", "Choose when it is available from")
    problems.extend(cost_problems(data, data.get("listing_purpose") or "long_term"))
    if 800 <= pc <= 9999 and data.get("suburb"):
        place_problem = location_problem(data.get("suburb"), pc, data.get("state"))
        if place_problem:
            problems.append({"step": "property", "field": "suburb", "message": place_problem})
    if data.get("weapons_on_property"):
        need(bool((data.get("weapons_explanation") or "").strip()), "details", "weapons_explanation", "Explain the weapons disclosure")
    return problems


@router.post("/listing-drafts/{draft_id}/submit")
@limiter.limit("20/hour")
async def submit_draft(draft_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    sb = get_supabase_admin()
    draft = _own_draft(sb, actor, draft_id)
    if draft.get("submitted_at") and draft.get("listing_id"):
        return {"listing_id": draft["listing_id"], "already_submitted": True}
    data = draft.get("data") or {}
    problems = draft_problems(data)
    if problems:
        raise HTTPException(status_code=422, detail={"message": "A few things are needed before this can go live", "problems": problems})

    payload, purpose, min_stay_weeks = _draft_to_listing(data)
    from models import ListingCreate
    from routes_listings import create_listing

    try:
        listing_in = ListingCreate(**payload)
    except ValidationError as e:
        first = e.errors()[0] if e.errors() else {}
        raise HTTPException(status_code=422, detail={"message": "Some details need another look", "problems": [{"step": "review", "field": ".".join(str(x) for x in first.get("loc", [])), "message": first.get("msg", "Invalid value")}]})

    created = await create_listing(request=request, listing=listing_in, authorization=authorization)
    listing_id = created["id"]

    # Link to a property: the one the draft started from, or a new one.
    property_id = draft.get("property_id")
    try:
        if not property_id:
            prop = sb.table("properties").insert(
                {
                    "owner_id": actor.id,
                    "archived_at": None,
                    "street_address": data.get("street_address"),
                    "suburb": data.get("suburb"),
                    "state": data.get("state") or state_for_postcode(data.get("postcode")),
                    "postcode": int(data["postcode"]) if data.get("postcode") else None,
                    "property_type": data.get("property_type"),
                    "relationship": data.get("relationship") or "owner",
                    "nickname": data.get("nickname"),
                    "bedrooms": data.get("property_bedrooms"),
                    "bathrooms": data.get("property_bathrooms"),
                    "parking_spaces": data.get("parking_spaces"),
                    "latitude": created.get("exact_location", {}).get("lat") if created.get("exact_location") else None,
                    "longitude": created.get("exact_location", {}).get("lng") if created.get("exact_location") else None,
                }
            ).execute().data[0]
            property_id = prop["id"]
        link = {
            "property_id": property_id,
            "unit_label": (data.get("unit_label") or None),
            "listing_purpose": purpose if purpose in ("long_term", "short_stay", "sale") else "long_term",
        }
        if min_stay_weeks:
            link["min_stay_weeks"] = int(min_stay_weeks)
        if data.get("max_stay_weeks"):
            link["max_stay_weeks"] = int(data["max_stay_weeks"])
        sb.table("listings").update(link).eq("id", listing_id).execute()
        sb.table("listing_drafts").update({"submitted_at": now_iso(), "listing_id": listing_id, "property_id": property_id}).eq("id", draft_id).execute()
    except Exception:
        logger.exception("listing %s created but linking to its property failed", listing_id)

    return {
        "listing_id": listing_id,
        "property_id": property_id,
        "moderation_status": created.get("moderation_status"),
        "needs_verification": bool(created.get("is_draft")),
    }


# ---------------------------------------------------------------------------
# Photos
# ---------------------------------------------------------------------------


@router.post("/listing-photos")
@limiter.limit("120/hour")
async def upload_listing_photo(request: Request, file: UploadFile = File(...), authorization: Optional[str] = Header(None)):
    """Validate by content (not the file name), strip EXIF, re-encode to WebP
    and store under the owner's folder in the public listing bucket."""
    from uploads import ImageValidationError, prepare_public_image

    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    data = await file.read()
    try:
        prepared = prepare_public_image(data, max_bytes=15 * 1024 * 1024, max_side=2400, min_side=400)
    except ImageValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    path = f"{actor.id}/{uuid.uuid4().hex}.{prepared.extension}"
    sb = get_supabase_admin()
    try:
        sb.storage.from_(LISTING_PHOTO_BUCKET).upload(path, prepared.data, file_options={"content-type": prepared.content_type, "cache-control": "31536000"})
        url = sb.storage.from_(LISTING_PHOTO_BUCKET).get_public_url(path)
    except Exception:
        logger.exception("listing photo upload failed")
        raise HTTPException(status_code=502, detail="The photo could not be saved. Please try again.")
    if isinstance(url, dict):
        url = url.get("publicUrl") or url.get("publicURL")
    return {"url": str(url).rstrip("?"), "width": prepared.width, "height": prepared.height}


# ---------------------------------------------------------------------------
# One listing, owner view, and actions
# ---------------------------------------------------------------------------


class BulkBody(BaseModel):
    listing_ids: list[str] = Field(..., min_length=1, max_length=50)
    action: str
    # For "renew": the new last day the listing is open.
    available_to: Optional[str] = Field(None, max_length=10)

    @field_validator("action")
    @classmethod
    def _action(cls, v: str) -> str:
        if v not in ("pause", "resume", "renew"):
            raise ValueError("Choose pause, resume or renew")
        return v


@router.post("/listings/bulk")
@limiter.limit("20/hour")
def bulk_listings(request: Request, body: BulkBody, authorization: Optional[str] = Header(None)):
    """Pause, resume or renew several of the owner's listings at once
    (property managers, MIG-026). Each listing goes through exactly the same
    rules as on its own page; one that cannot be changed is reported, not
    skipped silently, and the rest still go ahead."""
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    if body.action == "renew" and not body.available_to:
        raise HTTPException(status_code=400, detail="Choose the new last day for the listings")
    from auth_utils import get_active_user

    if body.action != "pause":
        get_active_user(authorization)  # suspended accounts cannot bring listings back
    from routes_listings import pause_for_owner, renew_for_owner, resume_for_owner

    sb = get_supabase_admin()
    results = []
    for listing_id in dict.fromkeys(body.listing_ids):
        try:
            if body.action == "pause":
                out = pause_for_owner(sb, actor.id, listing_id)
            elif body.action == "resume":
                out = resume_for_owner(sb, actor.id, listing_id)
            else:
                out = renew_for_owner(sb, actor.id, listing_id, None, body.available_to or "")
            results.append({"id": listing_id, "ok": True, "moderation_status": out.get("moderation_status")})
        except HTTPException as e:
            results.append({"id": listing_id, "ok": False, "error": e.detail if isinstance(e.detail, str) else "That listing could not be changed"})
    return {"results": results, "changed": sum(1 for r in results if r["ok"])}


def _own_listing_row(sb, actor: HubActor, listing_id: str) -> dict:
    res = sb.table("listings").select("*").eq("id", listing_id).execute()
    if not res.data or str(res.data[0]["owner_id"]) != actor.id or res.data[0].get("moderation_status") == "deleted":
        raise HTTPException(status_code=404, detail="Listing not found")
    return res.data[0]


@router.get("/listings/{listing_id}")
def owner_listing(listing_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    row = _own_listing_row(sb, actor, listing_id)
    from public_dto import to_owner_listing

    out = to_owner_listing(row)
    for k in ("property_id", "unit_label", "listing_purpose", "occupancy", "occupied_until", "paused_at", "expired_at"):
        out[k] = row.get(k)
    apps, slots = _counts_by_listing(sb, actor.id)
    out["status"] = unit_status(row, apps.get(listing_id, 0))
    out["pending_applications"] = apps.get(listing_id, 0)
    out["upcoming_inspections"] = slots.get(listing_id, 0)
    out["performance"] = listing_performance(sb, [listing_id], days=30)
    from routes_owner_verification import check_owner_verified

    out["owner_verified"] = bool(check_owner_verified(actor.id))
    return {"listing": out}


class OccupancyBody(BaseModel):
    occupancy: str
    occupied_until: Optional[date] = None

    @field_validator("occupancy")
    @classmethod
    def _o(cls, v: str) -> str:
        if v not in ("vacant", "occupied"):
            raise ValueError("Choose occupied or vacant")
        return v


@router.post("/listings/{listing_id}/occupancy")
def set_occupancy(listing_id: str, request: Request, body: OccupancyBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    _own_listing_row(sb, actor, listing_id)
    patch = {"occupancy": body.occupancy, "occupied_until": body.occupied_until.isoformat() if (body.occupied_until and body.occupancy == "occupied") else None}
    row = sb.table("listings").update(patch).eq("id", listing_id).execute().data[0]
    return {"listing_id": listing_id, "occupancy": row.get("occupancy"), "occupied_until": row.get("occupied_until")}


class UnitPatch(BaseModel):
    unit_label: Optional[str] = Field(None, max_length=40)
    listing_purpose: Optional[str] = None
    property_id: Optional[str] = None
    min_stay_weeks: Optional[int] = Field(None, ge=1, le=104)
    max_stay_weeks: Optional[int] = Field(None, ge=1, le=260)


@router.patch("/listings/{listing_id}/unit")
def update_unit(listing_id: str, request: Request, body: UnitPatch, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    _own_listing_row(sb, actor, listing_id)
    patch = body.model_dump(exclude_unset=True)
    if "listing_purpose" in patch and patch["listing_purpose"] not in ("long_term", "short_stay", "sale"):
        raise HTTPException(status_code=400, detail="Unknown listing type")
    if patch.get("property_id"):
        _own_property(sb, actor, patch["property_id"])
    lo = patch.get("min_stay_weeks")
    hi = patch.get("max_stay_weeks")
    if lo and hi and hi < lo:
        raise HTTPException(status_code=400, detail="The longest stay must be at least the shortest")
    if not patch:
        raise HTTPException(status_code=400, detail="Nothing to change")
    row = sb.table("listings").update(patch).eq("id", listing_id).execute().data[0]
    return {"listing_id": listing_id, **{k: row.get(k) for k in ("unit_label", "listing_purpose", "property_id", "min_stay_weeks", "max_stay_weeks")}}


# ---------------------------------------------------------------------------
# Insights (tracked events only)
# ---------------------------------------------------------------------------

FUNNEL = ("view", "save", "enquiry", "inspection_booked", "application_started", "application_submitted")


def listing_performance(sb, listing_ids: list[str], *, days: int = 30) -> dict:
    empty = {e: 0 for e in FUNNEL}
    if not listing_ids:
        return {"days": days, "totals": {**empty, "unique_views": 0}, "by_listing": {}, "tracking_since": None}
    since = (now_utc() - timedelta(days=days)).isoformat()
    try:
        rows, first = run_parallel(
            lambda: sb.table("listing_events").select("listing_id, event, actor_hash, created_at").in_("listing_id", listing_ids).gte("created_at", since).limit(20000).execute().data or [],
            lambda: sb.table("listing_events").select("created_at").in_("listing_id", listing_ids).order("created_at").limit(1).execute().data,
        )
    except Exception:
        return {"days": days, "totals": {**empty, "unique_views": 0}, "by_listing": {}, "tracking_since": None}
    by: dict[str, dict] = {}
    uniques: dict[str, set] = {}
    for r in rows:
        lid = str(r["listing_id"])
        b = by.setdefault(lid, {**empty})
        if r["event"] in b:
            b[r["event"]] += 1
        if r["event"] == "view" and r.get("actor_hash"):
            uniques.setdefault(lid, set()).add(r["actor_hash"])
    for lid, b in by.items():
        b["unique_views"] = len(uniques.get(lid, set()))
    totals = {e: sum(b.get(e, 0) for b in by.values()) for e in FUNNEL}
    totals["unique_views"] = sum(len(s) for s in uniques.values())
    return {"days": days, "totals": totals, "by_listing": by, "tracking_since": first[0]["created_at"] if first else None}


def median_reply_hours(sb, owner_id: str) -> Optional[float]:
    try:
        res = sb.table("public_profiles").select("median_reply_hours, response_sample_size").eq("id", owner_id).execute()
        if res.data and res.data[0].get("median_reply_hours") is not None:
            return round(float(res.data[0]["median_reply_hours"]), 1)
    except Exception:
        pass
    return None


@router.get("/insights")
def insights(request: Request, days: int = 30, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_owner(actor)
    days = 7 if days <= 7 else 90 if days >= 90 else 30
    sb = get_supabase_admin()
    today = date.today()

    def _revenue():
        try:
            tenancy_ids = [t["id"] for t in sb.table("tenancies").select("id").eq("owner_id", actor.id).execute().data or []]
            if not tenancy_ids:
                return None
            since = (today - timedelta(days=days)).isoformat()
            paid = sb.table("rent_payments").select("amount_paid, paid_on").in_("tenancy_id", tenancy_ids).gte("paid_on", since).execute().data or []
            return round(sum(float(p.get("amount_paid") or 0) for p in paid), 2)
        except Exception:
            return None

    def _listings_and_performance():
        listings = _owner_listings(sb, actor.id)
        return listings, listing_performance(sb, [str(l["id"]) for l in listings], days=days)

    # Three independent chains, run together (concurrency.py).
    (listings, perf), revenue, reply_hours = run_parallel(
        _listings_and_performance,
        _revenue,
        lambda: median_reply_hours(sb, actor.id),
    )
    occupied = sum(1 for l in listings if (l.get("occupancy") or "vacant") == "occupied")
    vacant_days = []
    for l in listings:
        if (l.get("occupancy") or "vacant") == "vacant" and l.get("moderation_status") == "approved":
            try:
                start = date.fromisoformat(str(l.get("available_from") or l.get("created_at"))[:10])
                vacant_days.append(max(0, (today - start).days))
            except ValueError:
                pass
    per_listing = []
    for l in listings:
        b = perf["by_listing"].get(str(l["id"]), {})
        per_listing.append({"listing": listing_card(l, viewer_is_owner=True), **{e: b.get(e, 0) for e in FUNNEL}, "unique_views": b.get("unique_views", 0)})
    per_listing.sort(key=lambda x: x["view"], reverse=True)
    return {
        "days": days,
        "tracking_since": perf["tracking_since"],
        "funnel": perf["totals"],
        "listings": per_listing,
        "occupancy": {"occupied": occupied, "units": len(listings)},
        "median_days_vacant": sorted(vacant_days)[len(vacant_days) // 2] if vacant_days else None,
        "median_reply_hours": reply_hours,
        "rent_recorded": revenue,
    }


class ListingEventBody(BaseModel):
    listing_id: str = Field(..., min_length=36, max_length=36)
    event: str = "view"
    visitor: Optional[str] = Field(None, max_length=64)
    source: str = "public"


@router.post("/listing-events")
@limiter.limit("120/minute")
def listing_event(request: Request, body: ListingEventBody, authorization: Optional[str] = Header(None)):
    """Public. Counts a view (or share) of a published listing. The visitor
    id is a random value the browser keeps; it is hashed before storage."""
    if body.event not in ("view", "share"):
        raise HTTPException(status_code=400, detail="Unsupported event")
    sb = get_supabase_admin()
    listing = fetch_listings(sb, [body.listing_id]).get(body.listing_id)
    card = listing_card(listing)
    if not card or card["public_state"] != "published":
        return {"ok": True}
    key = body.visitor
    if authorization:
        try:
            from auth_utils import get_current_user

            user = get_current_user(authorization)
            if str(user.id) == str(listing.get("owner_id")):
                return {"ok": True}  # owners looking at their own listing do not count
            key = str(user.id)
        except HTTPException:
            pass
    record_listing_event(sb, body.listing_id, body.event, key, source="hub" if body.source == "hub" else "public")
    return {"ok": True}
