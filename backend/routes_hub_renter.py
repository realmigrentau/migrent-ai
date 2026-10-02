"""
Migrent Hub - the renter's side.

    /hub/rental-profile            the reusable Rental Profile
    /hub/documents                 private supporting documents
    /hub/saved                     saved homes (the existing `favorites` table)
    /hub/searches                  saved searches and their alerts
    /hub/compare                   2-4 homes side by side
    /hub/recommendations           transparent, rules-based suggestions

Recommendations are not machine learning and the API says so: every result
carries the plain reasons it was picked ("Under your $450 budget", "In
Parramatta, one of your suburbs").
"""


import logging
import uuid
from datetime import date
from typing import Any, Optional

from fastapi import APIRouter, File, Form, Header, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field, field_validator

from concurrency import run_parallel
from db import get_supabase_admin
from hub_common import (
    HubActor,
    fetch_listings,
    hub_actor,
    hub_table_error,
    listing_card,
    now_iso,
    record_listing_event,
    require_writable,
)
from limiter import limiter
from listing_lifecycle import public_filter
from public_dto import place_type_spellings, property_type_spellings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["hub-renter"])

DOCUMENT_BUCKET = "renter-documents"
DOCUMENT_KINDS = ("identity", "income", "employment", "rental_history", "reference", "study", "other")
SIGNED_URL_SECONDS = 300


# ---------------------------------------------------------------------------
# Rental Profile
# ---------------------------------------------------------------------------


class RentalHistoryEntry(BaseModel):
    suburb: str = Field(..., min_length=2, max_length=120)
    from_month: Optional[str] = Field(None, max_length=7)  # YYYY-MM
    to_month: Optional[str] = Field(None, max_length=7)
    weekly_rent: Optional[int] = Field(None, ge=0, le=20000)
    landlord_name: Optional[str] = Field(None, max_length=120)
    reason_for_leaving: Optional[str] = Field(None, max_length=300)
    country: Optional[str] = Field(None, max_length=60)


class Referee(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    relationship: str = Field(..., min_length=2, max_length=80)
    email: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=40)

    @field_validator("email")
    @classmethod
    def _email(cls, v: Optional[str]) -> Optional[str]:
        if v and ("@" not in v or " " in v.strip()):
            raise ValueError("Enter a valid email address")
        return v.strip() if v else v


class RentalProfileUpdate(BaseModel):
    intro: Optional[str] = Field(None, max_length=1500)
    preferred_move_date: Optional[date] = None
    preferred_lease_months: Optional[int] = Field(None, ge=1, le=60)
    preferred_suburbs: Optional[list[str]] = Field(None, max_length=10)
    budget_weekly: Optional[int] = Field(None, ge=0, le=20000)
    bedrooms_min: Optional[int] = Field(None, ge=0, le=10)
    household_adults: Optional[int] = Field(None, ge=1, le=20)
    household_children: Optional[int] = Field(None, ge=0, le=20)
    household_notes: Optional[str] = Field(None, max_length=500)
    has_pets: Optional[bool] = None
    pet_details: Optional[str] = Field(None, max_length=300)
    employment_status: Optional[str] = None
    employer: Optional[str] = Field(None, max_length=120)
    job_title: Optional[str] = Field(None, max_length=120)
    employment_since: Optional[date] = None
    income_weekly: Optional[int] = Field(None, ge=0, le=100000)
    rental_history: Optional[list[RentalHistoryEntry]] = Field(None, max_length=10)
    first_time_renter: Optional[bool] = None
    referees: Optional[list[Referee]] = Field(None, max_length=5)
    # Lives on profiles, edited from the same screen.
    display_name: Optional[str] = Field(None, min_length=1, max_length=80)

    @field_validator("employment_status")
    @classmethod
    def _employment(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("employed", "self_employed", "student", "looking", "retired", "other"):
            raise ValueError("Choose one of the listed options")
        return v

    @field_validator("preferred_suburbs")
    @classmethod
    def _suburbs(cls, v: Optional[list[str]]) -> Optional[list[str]]:
        if v is None:
            return v
        cleaned = []
        for s in v:
            s = (s or "").strip()
            if s and len(s) <= 80 and s.lower() not in [c.lower() for c in cleaned]:
                cleaned.append(s)
        return cleaned


PROFILE_DEFAULTS: dict[str, Any] = {
    "intro": None,
    "preferred_move_date": None,
    "preferred_lease_months": None,
    "preferred_suburbs": [],
    "budget_weekly": None,
    "bedrooms_min": None,
    "household_adults": 1,
    "household_children": 0,
    "household_notes": None,
    "has_pets": False,
    "pet_details": None,
    "employment_status": None,
    "employer": None,
    "job_title": None,
    "employment_since": None,
    "income_weekly": None,
    "rental_history": [],
    "first_time_renter": False,
    "referees": [],
    "updated_at": None,
}


def get_renter_profile(sb, user_id: str) -> tuple[dict, bool]:
    """(profile, exists). Missing rows come back as defaults."""
    res = sb.table("renter_profiles").select("*").eq("user_id", str(user_id)).execute()
    if res.data:
        row = {**PROFILE_DEFAULTS, **res.data[0]}
        return row, True
    return {**PROFILE_DEFAULTS, "user_id": str(user_id)}, False


def list_documents(sb, user_id: str) -> list[dict]:
    res = (
        sb.table("renter_documents")
        .select("id, kind, label, file_name, mime_type, size_bytes, created_at")
        .eq("user_id", str(user_id))
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


def profile_completion(account: dict, rp: dict, exists: bool, documents: list[dict]) -> dict:
    """Seven checks an owner reading an application actually cares about.

    Each item says what is missing in plain words, so the Hub can show a
    to-do list instead of a bare percentage.
    """
    name = (account.get("preferred_name") or account.get("name") or "").strip()
    employed = rp.get("employment_status") in ("employed", "self_employed")
    items = [
        {"key": "about", "label": "Your name and a short introduction", "done": bool(name) and len((rp.get("intro") or "").strip()) >= 40},
        {"key": "move", "label": "When you want to move and for how long", "done": bool(rp.get("preferred_move_date") and rp.get("preferred_lease_months"))},
        {"key": "household", "label": "Who will live with you", "done": exists and rp.get("household_adults", 0) >= 1},
        {
            "key": "work",
            "label": "Work or study",
            "done": bool(rp.get("employment_status")) and (not employed or bool(rp.get("employer"))),
        },
        {"key": "history", "label": "Rental history (or that this is your first rental)", "done": bool(rp.get("rental_history")) or bool(rp.get("first_time_renter"))},
        {"key": "referees", "label": "At least one referee", "done": bool(rp.get("referees"))},
        {"key": "documents", "label": "A supporting document", "done": len(documents) > 0},
    ]
    done = sum(1 for i in items if i["done"])
    return {"percent": round(100 * done / len(items)), "items": items, "complete": done == len(items)}


def build_snapshot(sb, actor: HubActor, *, share_income: bool) -> dict:
    """What the owner sees: a copy of the Rental Profile at submission time.

    Owners never read the live profile, so later edits (or deleting a
    referee) do not silently change an application they already assessed.
    Income is included only when the renter ticked "share my income" for
    this application.
    """
    rp, _ = get_renter_profile(sb, actor.id)
    verification = renter_verification_status(sb, actor.id)
    snap = {
        "name": actor.display_name,
        "avatar_url": actor.profile.get("custom_pfp"),
        "member_since": (actor.profile.get("created_at") or "")[:10] or None,
        "intro": rp.get("intro"),
        "household": {
            "adults": rp.get("household_adults"),
            "children": rp.get("household_children"),
            "notes": rp.get("household_notes"),
            "has_pets": rp.get("has_pets"),
            "pet_details": rp.get("pet_details"),
        },
        "employment": {
            "status": rp.get("employment_status"),
            "employer": rp.get("employer"),
            "job_title": rp.get("job_title"),
            "since": rp.get("employment_since"),
        },
        "income_weekly": rp.get("income_weekly") if share_income else None,
        "rental_history": rp.get("rental_history") or [],
        "first_time_renter": bool(rp.get("first_time_renter")),
        "referees": rp.get("referees") or [],
        "preferred_lease_months": rp.get("preferred_lease_months"),
        "verification": verification,
        "captured_at": now_iso(),
    }
    return snap


def renter_verification_status(sb, user_id: str) -> str:
    try:
        res = sb.table("renter_verifications").select("status, expires_at").eq("user_id", str(user_id)).execute()
    except Exception:
        return "not_started"
    if not res.data:
        return "not_started"
    return res.data[0].get("status") or "not_started"


@router.get("/rental-profile")
def get_rental_profile(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    try:
        # Independent reads, fetched together (concurrency.py).
        (rp, exists), docs, verification = run_parallel(
            lambda: get_renter_profile(sb, actor.id),
            lambda: list_documents(sb, actor.id),
            lambda: renter_verification_status(sb, actor.id),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise hub_table_error(e)
    return {
        "profile": rp,
        "exists": exists,
        "display_name": actor.profile.get("preferred_name") or actor.profile.get("name") or "",
        "avatar_url": actor.profile.get("custom_pfp"),
        "documents": docs,
        "completion": profile_completion(actor.profile, rp, exists, docs),
        "verification": verification,
    }


@router.put("/rental-profile")
@limiter.limit("60/minute")
def put_rental_profile(request: Request, body: RentalProfileUpdate, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    data = body.model_dump(exclude_unset=True)
    display_name = data.pop("display_name", None)
    for key in ("preferred_move_date", "employment_since"):
        if key in data and data[key] is not None:
            data[key] = data[key].isoformat()
    if "rental_history" in data and data["rental_history"] is not None:
        data["rental_history"] = [dict(e) for e in data["rental_history"]]
    if "referees" in data and data["referees"] is not None:
        data["referees"] = [dict(r) for r in data["referees"]]
    try:
        existing = sb.table("renter_profiles").select("user_id").eq("user_id", actor.id).execute()
        if existing.data:
            if data:
                sb.table("renter_profiles").update(data).eq("user_id", actor.id).execute()
        else:
            sb.table("renter_profiles").insert({"user_id": actor.id, **data}).execute()
        if display_name is not None:
            sb.table("profiles").update({"preferred_name": display_name.strip()}).eq("id", actor.id).execute()
            actor.profile["preferred_name"] = display_name.strip()
    except Exception as e:
        raise hub_table_error(e)
    return get_rental_profile(request, authorization)


# ---------------------------------------------------------------------------
# Documents (private bucket, signed URLs only)
# ---------------------------------------------------------------------------


@router.get("/documents")
def get_documents(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    try:
        return {"documents": list_documents(sb, actor.id)}
    except Exception as e:
        raise hub_table_error(e)


@router.post("/documents")
@limiter.limit("20/hour")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    kind: str = Form(...),
    label: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None),
):
    from uploads import ImageValidationError, validate_private_document

    actor = hub_actor(request, authorization)
    require_writable(actor)
    if kind not in DOCUMENT_KINDS:
        raise HTTPException(status_code=400, detail="Choose what kind of document this is")
    data = await file.read()
    try:
        content_type, ext = validate_private_document(data)
    except ImageValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    sb = get_supabase_admin()
    try:
        count = sb.table("renter_documents").select("id", count="exact").eq("user_id", actor.id).execute()
        if (count.count or 0) >= 20:
            raise HTTPException(status_code=400, detail="You can keep up to 20 documents. Remove one to add another.")
        path = f"{actor.id}/{uuid.uuid4().hex}.{ext}"
        sb.storage.from_(DOCUMENT_BUCKET).upload(path, data, file_options={"content-type": content_type, "upsert": "false"})
        name = (file.filename or f"document.{ext}").replace("/", "_")[:120]
        row = {
            "user_id": actor.id,
            "kind": kind,
            "label": (label or "").strip()[:120] or None,
            "file_path": path,
            "file_name": name,
            "mime_type": content_type,
            "size_bytes": len(data),
        }
        res = sb.table("renter_documents").insert(row).execute()
    except HTTPException:
        raise
    except Exception as e:
        raise hub_table_error(e)
    doc = (res.data or [row])[0]
    doc.pop("file_path", None)
    doc.pop("user_id", None)
    return doc


def signed_document_url(sb, file_path: str) -> Optional[str]:
    try:
        signed = sb.storage.from_(DOCUMENT_BUCKET).create_signed_url(file_path, SIGNED_URL_SECONDS)
        return signed.get("signedURL") or signed.get("signed_url") or signed.get("signedUrl")
    except Exception:
        logger.exception("signed url failed")
        return None


@router.get("/documents/{document_id}/url")
def document_url(document_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    res = sb.table("renter_documents").select("id, user_id, file_path").eq("id", document_id).execute()
    if not res.data or str(res.data[0]["user_id"]) != actor.id:
        raise HTTPException(status_code=404, detail="Document not found")
    url = signed_document_url(sb, res.data[0]["file_path"])
    if not url:
        raise HTTPException(status_code=502, detail="Could not open that document right now")
    return {"url": url, "expires_in": SIGNED_URL_SECONDS}


@router.delete("/documents/{document_id}")
def delete_document(document_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    res = sb.table("renter_documents").select("id, user_id, file_path").eq("id", document_id).execute()
    if not res.data or str(res.data[0]["user_id"]) != actor.id:
        raise HTTPException(status_code=404, detail="Document not found")
    try:
        sb.storage.from_(DOCUMENT_BUCKET).remove([res.data[0]["file_path"]])
    except Exception:
        logger.warning("storage remove failed for %s", document_id)
    sb.table("application_documents").delete().eq("document_id", document_id).execute()
    sb.table("renter_documents").delete().eq("id", document_id).execute()
    return {"deleted": True}


# ---------------------------------------------------------------------------
# Saved homes
# ---------------------------------------------------------------------------


class SaveBody(BaseModel):
    listing_id: str = Field(..., min_length=36, max_length=36)


def saved_rows(sb, user_id: str) -> list[dict]:
    res = sb.table("favorites").select("*").eq("user_id", str(user_id)).order("created_at", desc=True).execute()
    return res.data or []


def saved_cards(sb, user_id: str, limit: Optional[int] = None) -> list[dict]:
    rows = saved_rows(sb, user_id)
    if limit:
        rows = rows[:limit]
    listings = fetch_listings(sb, [r.get("listing_id") for r in rows])
    out = []
    for r in rows:
        card = listing_card(listings.get(str(r.get("listing_id"))))
        if not card:
            continue
        before = r.get("price_at_save")
        now = card.get("weekly_price")
        change = None
        if before is not None and now is not None:
            try:
                diff = round(float(now) - float(before))
                change = diff if diff != 0 else None
            except (TypeError, ValueError):
                change = None
        out.append({**card, "saved_at": r.get("created_at"), "price_change": change})
    return out


@router.get("/saved")
def get_saved(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    try:
        return {"homes": saved_cards(sb, actor.id)}
    except Exception as e:
        raise hub_table_error(e)


@router.get("/saved/ids")
def get_saved_ids(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    return {"ids": [str(r.get("listing_id")) for r in saved_rows(sb, actor.id) if r.get("listing_id")]}


@router.post("/saved")
@limiter.limit("120/minute")
def save_home(request: Request, body: SaveBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    listing = fetch_listings(sb, [body.listing_id]).get(body.listing_id)
    card = listing_card(listing)
    if not card or card["public_state"] != "published":
        raise HTTPException(status_code=404, detail="That home is no longer available")
    existing = sb.table("favorites").select("id").eq("user_id", actor.id).eq("listing_id", body.listing_id).execute()
    if not existing.data:
        row = {"user_id": actor.id, "listing_id": body.listing_id}
        try:
            sb.table("favorites").insert({**row, "price_at_save": listing.get("weekly_price")}).execute()
        except Exception:
            sb.table("favorites").insert(row).execute()  # before 043
        record_listing_event(sb, body.listing_id, "save", actor.id)
    return {"saved": True, "listing_id": body.listing_id}


@router.delete("/saved/{listing_id}")
def unsave_home(listing_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    removed = sb.table("favorites").delete().eq("user_id", actor.id).eq("listing_id", listing_id).execute()
    if removed.data:
        record_listing_event(sb, listing_id, "unsave", actor.id)
    return {"saved": False, "listing_id": listing_id}


# ---------------------------------------------------------------------------
# Searching the shared listing data
# ---------------------------------------------------------------------------

SEARCH_KEYS = {
    "q", "suburb", "postcode", "state", "city", "min_price", "max_price", "property_type", "place_type",
    "bedrooms", "furnished", "bills_included", "pets_allowed", "parking", "available_from", "listing_purpose",
    "newcomer_friendly",
}
BOOL_KEYS = {"furnished", "bills_included", "pets_allowed", "parking", "newcomer_friendly"}


def clean_search_params(params: dict) -> dict:
    out: dict[str, Any] = {}
    for k, v in (params or {}).items():
        if k not in SEARCH_KEYS or v in (None, "", []):
            continue
        if k in BOOL_KEYS:
            out[k] = str(v).lower() in ("true", "1", "yes")
        elif k in ("min_price", "max_price", "bedrooms", "postcode"):
            try:
                out[k] = int(float(v))
            except (TypeError, ValueError):
                continue
        else:
            out[k] = str(v)[:80]
    return out


def query_public_listings(sb, params: dict, *, limit: int = 12, created_after: Optional[str] = None) -> list[dict]:
    """The same public predicate search uses (listing_lifecycle.public_filter),
    with the filters a saved search or recommendation can express."""
    p = clean_search_params(params)
    q = sb.table("listings").select(
        "id, owner_id, address, title, suburb, city, postcode, weekly_price, images, property_type, place_type, bedrooms, bathrooms, "
        "parking, furnished, bills_included, pets_allowed, available_from, available_to, moderation_status, hidden_at, created_at, "
        "nearest_transport"
    )
    q = public_filter(q)
    if p.get("suburb"):
        q = q.ilike("suburb", p["suburb"])
    if p.get("city"):
        q = q.ilike("city", p["city"])
    if p.get("postcode"):
        q = q.eq("postcode", p["postcode"])
    if p.get("min_price") is not None:
        q = q.gte("weekly_price", p["min_price"])
    if p.get("max_price") is not None:
        q = q.lte("weekly_price", p["max_price"])
    if p.get("property_type"):
        q = q.in_("property_type", property_type_spellings(str(p["property_type"])))
    if p.get("place_type"):
        q = q.in_("place_type", place_type_spellings(str(p["place_type"])))
    if p.get("bedrooms"):
        q = q.gte("bedrooms", p["bedrooms"])
    # As in /listings/search: listings that never said count as leases.
    if p.get("listing_purpose") == "long_term":
        q = q.or_("listing_purpose.is.null,listing_purpose.eq.long_term")
    elif p.get("listing_purpose") == "short_stay":
        q = q.eq("listing_purpose", "short_stay")
    for b in BOOL_KEYS:
        if p.get(b) is True:
            q = q.eq(b, True)
    if created_after:
        q = q.gt("created_at", created_after)
    res = q.order("created_at", desc=True).limit(limit).execute()
    return res.data or []


# ---------------------------------------------------------------------------
# Saved searches
# ---------------------------------------------------------------------------


class SavedSearchBody(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    params: dict = Field(default_factory=dict)
    alert: str = "daily"

    @field_validator("alert")
    @classmethod
    def _alert(cls, v: str) -> str:
        if v not in ("off", "instant", "daily", "weekly"):
            raise ValueError("Choose how often to hear about new homes")
        return v


class SavedSearchPatch(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=80)
    params: Optional[dict] = None
    alert: Optional[str] = None

    @field_validator("alert")
    @classmethod
    def _alert(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("off", "instant", "daily", "weekly"):
            raise ValueError("Choose how often to hear about new homes")
        return v


def _search_with_counts(sb, row: dict) -> dict:
    params = row.get("params") or {}
    since = row.get("last_checked_at") or row.get("created_at")
    try:
        matches = query_public_listings(sb, params, limit=50)
    except Exception:
        matches = []
    new = [m for m in matches if since and str(m.get("created_at") or "") > str(since)]
    return {
        **{k: row.get(k) for k in ("id", "name", "params", "alert", "created_at", "updated_at", "last_checked_at")},
        "match_count": len(matches),
        "new_count": len(new),
        "preview": [listing_card(m) for m in matches[:3]],
    }


@router.get("/searches")
def list_searches(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    try:
        rows = sb.table("saved_searches").select("*").eq("user_id", actor.id).order("created_at", desc=True).execute().data or []
    except Exception as e:
        raise hub_table_error(e)
    return {"searches": [_search_with_counts(sb, r) for r in rows]}


@router.post("/searches")
@limiter.limit("30/hour")
def create_search(request: Request, body: SavedSearchBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    params = clean_search_params(body.params)
    sb = get_supabase_admin()
    try:
        count = sb.table("saved_searches").select("id", count="exact").eq("user_id", actor.id).execute()
        if (count.count or 0) >= 20:
            raise HTTPException(status_code=400, detail="You can keep up to 20 saved searches")
        res = sb.table("saved_searches").insert(
            {"user_id": actor.id, "name": body.name.strip(), "params": params, "alert": body.alert, "last_checked_at": now_iso()}
        ).execute()
    except HTTPException:
        raise
    except Exception as e:
        raise hub_table_error(e)
    return _search_with_counts(sb, res.data[0])


def _own_search(sb, actor: HubActor, search_id: str) -> dict:
    res = sb.table("saved_searches").select("*").eq("id", search_id).execute()
    if not res.data or str(res.data[0]["user_id"]) != actor.id:
        raise HTTPException(status_code=404, detail="Saved search not found")
    return res.data[0]


@router.patch("/searches/{search_id}")
def update_search(search_id: str, request: Request, body: SavedSearchPatch, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    _own_search(sb, actor, search_id)
    patch = body.model_dump(exclude_unset=True)
    if "params" in patch and patch["params"] is not None:
        patch["params"] = clean_search_params(patch["params"])
    if "name" in patch and patch["name"]:
        patch["name"] = patch["name"].strip()
    res = sb.table("saved_searches").update(patch).eq("id", search_id).execute()
    return _search_with_counts(sb, res.data[0])


@router.post("/searches/{search_id}/seen")
def mark_search_seen(search_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    _own_search(sb, actor, search_id)
    sb.table("saved_searches").update({"last_checked_at": now_iso()}).eq("id", search_id).execute()
    return {"ok": True}


@router.delete("/searches/{search_id}")
def delete_search(search_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    _own_search(sb, actor, search_id)
    sb.table("saved_searches").delete().eq("id", search_id).execute()
    return {"deleted": True}


def run_saved_search_alerts(sb, *, cadence: str) -> list[str]:
    """Notify people about homes listed since their search last ran.

    `cadence` is 'instant', 'daily' or 'weekly'; the scheduler calls each at
    its own interval. Returns the ids of searches that produced a
    notification. Only homes created after last_notified_at count, so a
    search never announces the same home twice.
    """
    from hub_common import notify_user

    notified: list[str] = []
    rows = sb.table("saved_searches").select("*").eq("alert", cadence).execute().data or []
    for row in rows:
        since = row.get("last_notified_at") or row.get("created_at")
        try:
            fresh = query_public_listings(sb, row.get("params") or {}, limit=10, created_after=since)
        except Exception:
            logger.exception("saved search %s failed", row.get("id"))
            continue
        stamp = {"last_notified_at": now_iso()}
        if fresh:
            n = len(fresh)
            first = listing_card(fresh[0])
            notify_user(
                sb,
                row["user_id"],
                "saved_search_match",
                f"{n} new home{'s' if n != 1 else ''} for “{row.get('name')}”",
                f"Including {first['title']} at ${int(first['weekly_price'] or 0)} a week in {first['display_address']}." if first else "New homes match your search.",
                f"/saved?tab=searches&search={row['id']}",
                entity_type="saved_search",
                entity_id=row["id"],
            )
            notified.append(str(row["id"]))
        sb.table("saved_searches").update(stamp).eq("id", row["id"]).execute()
    return notified


# ---------------------------------------------------------------------------
# Compare and recommendations
# ---------------------------------------------------------------------------


@router.get("/compare")
def compare(ids: str, request: Request, authorization: Optional[str] = Header(None)):
    hub_actor(request, authorization)
    wanted = [i.strip() for i in ids.split(",") if i.strip()][:4]
    if len(wanted) < 2:
        raise HTTPException(status_code=400, detail="Choose at least two homes to compare")
    sb = get_supabase_admin()
    rows = fetch_listings(
        sb,
        wanted,
        columns=(
            "id, owner_id, address, title, suburb, city, postcode, weekly_price, images, property_type, place_type, bedrooms, bathrooms, "
            "parking, furnished, bills_included, pets_allowed, available_from, available_to, moderation_status, hidden_at, "
            "min_stay_weeks, internet_included, air_conditioning, laundry, dishwasher, nearest_transport, station_distance_min, bond, "
            "bond_weeks, rent_in_advance_weeks, bills_estimate_weekly, newcomer_friendly, listing_purpose, created_at"
        ),
    )
    from hub_common import owner_verified_map

    verified = owner_verified_map(sb, [r.get("owner_id") for r in rows.values()])
    now_slots = _upcoming_slot_counts(sb, wanted)
    out = []
    for lid in wanted:
        r = rows.get(lid)
        card = listing_card(r)
        if not card or card["public_state"] != "published":
            continue
        card.update(
            {
                "min_stay_weeks": r.get("min_stay_weeks"),
                "internet_included": r.get("internet_included"),
                "air_conditioning": r.get("air_conditioning"),
                "laundry": r.get("laundry"),
                "dishwasher": r.get("dishwasher"),
                "station_distance_min": r.get("station_distance_min"),
                "bond": r.get("bond"),
                "bond_weeks": r.get("bond_weeks"),
                "rent_in_advance_weeks": r.get("rent_in_advance_weeks"),
                "bills_estimate_weekly": r.get("bills_estimate_weekly"),
                "newcomer_friendly": r.get("newcomer_friendly"),
                "listing_purpose": r.get("listing_purpose"),
                "host_verification": verified.get(str(r.get("owner_id")), "unverified"),
                "upcoming_inspections": now_slots.get(lid, 0),
            }
        )
        out.append(card)
    return {"homes": out}


def _upcoming_slot_counts(sb, listing_ids: list[str]) -> dict[str, int]:
    try:
        res = (
            sb.table("inspection_slots")
            .select("listing_id, starts_at, status")
            .in_("listing_id", listing_ids)
            .eq("status", "scheduled")
            .gte("starts_at", now_iso())
            .execute()
        )
    except Exception:
        return {}
    counts: dict[str, int] = {}
    for r in res.data or []:
        counts[str(r["listing_id"])] = counts.get(str(r["listing_id"]), 0) + 1
    return counts


def recommend(sb, actor: HubActor, limit: int = 6) -> list[dict]:
    """Rules, not a model. Scores each available home against what the
    renter told us, and returns the reasons alongside the home."""
    def _searches():
        try:
            return sb.table("saved_searches").select("params").eq("user_id", actor.id).limit(5).execute().data or []
        except Exception:
            return []

    # Four independent reads: fetch them together (concurrency.py).
    (rp, _), searches, saved, pool = run_parallel(
        lambda: get_renter_profile(sb, actor.id),
        _searches,
        lambda: saved_rows(sb, actor.id),
        lambda: query_public_listings(sb, {}, limit=80),
    )
    saved_ids = {str(r.get("listing_id")) for r in saved}

    suburbs = [s.lower() for s in (rp.get("preferred_suburbs") or [])]
    for s in searches:
        sub = (s.get("params") or {}).get("suburb")
        if sub and sub.lower() not in suburbs:
            suburbs.append(sub.lower())
    budget = rp.get("budget_weekly")
    if not budget:
        prices = [(s.get("params") or {}).get("max_price") for s in searches]
        prices = [int(p) for p in prices if p]
        budget = max(prices) if prices else None
    beds = rp.get("bedrooms_min")
    move = rp.get("preferred_move_date")

    scored = []
    for row in pool:
        lid = str(row.get("id"))
        if lid in saved_ids or str(row.get("owner_id")) == actor.id:
            continue
        reasons, score = [], 0
        price = row.get("weekly_price")
        if budget and price is not None:
            if price <= budget:
                score += 3
                reasons.append(f"Within your ${budget} a week budget")
            elif price > budget * 1.15:
                continue
        sub = (row.get("suburb") or "").lower()
        if suburbs and sub in suburbs:
            score += 4
            reasons.append(f"In {row.get('suburb')}, one of your suburbs")
        if beds and (row.get("bedrooms") or 0) >= beds:
            score += 1
            reasons.append(f"{row.get('bedrooms')} bedroom{'s' if (row.get('bedrooms') or 0) != 1 else ''}")
        if move and row.get("available_from") and str(row["available_from"])[:10] <= str(move)[:10]:
            score += 1
            reasons.append("Available by your move date")
        if rp.get("has_pets") and row.get("pets_allowed"):
            score += 2
            reasons.append("Pets considered")
        if not reasons:
            reasons.append("Recently listed")
        scored.append((score, str(row.get("created_at") or ""), row, reasons))
    scored.sort(key=lambda t: (t[0], t[1]), reverse=True)
    return [{**listing_card(row), "reasons": reasons[:3]} for _, _, row, reasons in scored[:limit]]


@router.get("/recommendations")
def recommendations(request: Request, limit: int = 6, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    limit = max(1, min(limit, 24))
    try:
        homes = recommend(sb, actor, limit)
    except Exception as e:
        raise hub_table_error(e)
    return {
        "homes": homes,
        "method": "Matched on your budget, suburbs, bedrooms, move date and pets from your Rental Profile and saved searches.",
    }
