"""
Migrent Hub - who you are, what you are here to do, and what to do next.

    GET   /hub/me              account, role, features, view-as state
    POST  /hub/onboarding      the one-screen onboarding (role, name, 18+)
    POST  /hub/role            switch between renting and listing
    PATCH /hub/settings        name, owner kind, notification preferences
    GET   /hub/home            the role-specific home screen in one call
    GET   /hub/counts          badge counts for navigation
    GET   /hub/features        what is switched on (AI, payments, badge)
    POST  /hub/ai/listing-copy optional writing help for owners

Onboarding asks only what is needed to start: what you are here to do,
what to call you, and that you are an adult who accepts the terms. Phone,
address and identity are asked for later, at the moment they are needed.
"""


import base64
import json
import logging
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from db import get_supabase_admin
from hub_common import (
    ADMIN_ROLES,
    OWNER,
    RENTER,
    HubActor,
    hub_actor,
    hub_table_error,
    now_iso,
    parse_day,
    parse_ts,
    require_owner,
    require_writable,
    now_utc,
)
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["hub"])


def public_role(profile: dict, is_admin: bool) -> Optional[str]:
    role = profile.get("role")
    if role == RENTER:
        return "renter"
    if role == OWNER:
        return "owner"
    if is_admin or role in ADMIN_ROLES:
        return "admin"
    return None


def _jwt_claims(authorization: Optional[str]) -> dict:
    """Read claims from a token Supabase has already verified (hub_actor
    calls auth.get_user first). Used only for the assurance level."""
    try:
        token = (authorization or "").split(" ", 1)[1]
        payload = token.split(".")[1]
        payload += "=" * (-len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(payload))
    except Exception:
        return {}


def features(actor: Optional[HubActor] = None) -> dict:
    from ai_provider import listing_assist_enabled
    from billing import fees, payments_mode, renter_verification_available

    return {
        "ai_listing_assist": listing_assist_enabled(),
        "payments": payments_mode(),
        "renter_verification": renter_verification_available(),
        "fees": fees(),
        "view_as": bool(actor and actor.is_admin and not actor.read_only),
    }


@router.get("/features")
def get_features(request: Request):
    return features(None)


@router.get("/me")
def me(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    p = actor.profile
    sb = get_supabase_admin()
    verification = None
    if actor.is_owner:
        from public_dto import verification_summary

        try:
            v = sb.table("owner_verification").select("*").eq("user_id", actor.id).execute().data
            verification = verification_summary(v[0] if v else None)
        except Exception:
            verification = verification_summary(None)
    claims = _jwt_claims(authorization) if not actor.read_only else {}
    return {
        "id": actor.id,
        "email": actor.email,
        "name": actor.display_name if actor.display_name != "there" else "",
        "avatar_url": p.get("custom_pfp"),
        "public_id": p.get("public_id"),
        "role": public_role(p, actor.is_admin),
        "is_admin": actor.is_admin,
        "owner_kind": p.get("owner_kind"),
        "onboarded": bool(p.get("hub_onboarded_at") or (p.get("onboarding_completed") and p.get("role") in (RENTER, OWNER))),
        "notification_prefs": p.get("notification_prefs") or {},
        "owner_verification": verification,
        "member_since": (p.get("created_at") or "")[:10] or None,
        "features": features(actor),
        "assurance_level": claims.get("aal"),
        "viewing_as": {"admin_id": actor.viewer_admin_id} if actor.read_only else None,
    }


class OnboardingBody(BaseModel):
    role: str
    name: str = Field(..., min_length=1, max_length=80)
    owner_kind: Optional[str] = None
    over_18: bool
    accept_terms: bool

    @field_validator("role")
    @classmethod
    def _role(cls, v: str) -> str:
        if v not in ("renter", "owner"):
            raise ValueError("Choose what you are here to do")
        return v

    @field_validator("owner_kind")
    @classmethod
    def _kind(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("individual", "property_manager"):
            raise ValueError("Choose owner or property manager")
        return v


@router.post("/onboarding")
@limiter.limit("20/hour")
def onboarding(request: Request, body: OnboardingBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    if not body.over_18:
        raise HTTPException(status_code=400, detail="Migrent is for people aged 18 or over")
    if not body.accept_terms:
        raise HTTPException(status_code=400, detail="Accept the Terms of Service and Privacy Policy to continue")
    sb = get_supabase_admin()
    now = now_iso()
    patch = {
        "preferred_name": body.name.strip(),
        "hub_onboarded_at": now,
        "onboarding_completed": True,
        "onboarding_completed_at": now,
    }
    # Admin accounts keep their admin role; the Hub gives them the admin view.
    if actor.profile.get("role") not in ADMIN_ROLES:
        patch["role"] = RENTER if body.role == "renter" else OWNER
    if body.role == "owner":
        patch["owner_kind"] = body.owner_kind or "individual"
    if not actor.profile.get("name"):
        patch["name"] = body.name.strip()
    try:
        current = sb.table("profiles").select("over_18_confirmed_at, legal_accepted_at").eq("id", actor.id).execute().data
        cur = current[0] if current else {}
        if not cur.get("over_18_confirmed_at"):
            patch["over_18_confirmed_at"] = now
        if not cur.get("legal_accepted_at"):
            patch["legal_accepted_at"] = now
        sb.table("profiles").update(patch).eq("id", actor.id).execute()
    except Exception:
        # Before 043 the Hub columns are missing: record what we can.
        patch.pop("hub_onboarded_at", None)
        patch.pop("owner_kind", None)
        sb.table("profiles").update(patch).eq("id", actor.id).execute()
    return me(request, authorization)


class RoleBody(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def _role(cls, v: str) -> str:
        if v not in ("renter", "owner"):
            raise ValueError("Choose renting or listing")
        return v


@router.post("/role")
@limiter.limit("10/hour")
def switch_role(request: Request, body: RoleBody, authorization: Optional[str] = Header(None)):
    """Accounts hold one primary role. Switching is allowed, but not in a
    way that strands live listings or a tenancy without anyone managing them."""
    actor = hub_actor(request, authorization)
    require_writable(actor)
    if actor.profile.get("role") in ADMIN_ROLES:
        raise HTTPException(status_code=400, detail="Admin accounts keep their admin role")
    target = RENTER if body.role == "renter" else OWNER
    if actor.profile.get("role") == target:
        return me(request, authorization)
    sb = get_supabase_admin()
    if target == RENTER:
        live = sb.table("listings").select("id").eq("owner_id", actor.id).in_("moderation_status", ["approved", "pending_approval", "changes_requested"]).limit(1).execute().data
        if live:
            raise HTTPException(status_code=409, detail="You have listings that are live or in review. Pause or archive them before switching to renting.")
        try:
            active = sb.table("tenancies").select("id").eq("owner_id", actor.id).in_("status", ["upcoming", "active"]).limit(1).execute().data
        except Exception:
            active = []
        if active:
            raise HTTPException(status_code=409, detail="You have an active tenancy to manage. It needs to end before you switch to renting.")
    patch = {"role": target}
    if target == OWNER and not actor.profile.get("owner_kind"):
        patch["owner_kind"] = "individual"
    try:
        sb.table("profiles").update(patch).eq("id", actor.id).execute()
    except Exception:
        sb.table("profiles").update({"role": target}).eq("id", actor.id).execute()
    actor.profile.update(patch)
    return me(request, authorization)


class SettingsBody(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=80)
    owner_kind: Optional[str] = None
    notification_prefs: Optional[dict] = None

    @field_validator("owner_kind")
    @classmethod
    def _kind(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("individual", "property_manager"):
            raise ValueError("Choose owner or property manager")
        return v


PREF_GROUPS = ("messages", "applications", "inspections", "saved_searches", "maintenance", "listings", "summaries")


@router.patch("/settings")
def update_settings(request: Request, body: SettingsBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    patch: dict = {}
    if body.name is not None:
        patch["preferred_name"] = body.name.strip()
    if body.owner_kind is not None:
        patch["owner_kind"] = body.owner_kind
    if body.notification_prefs is not None:
        email = body.notification_prefs.get("email") if isinstance(body.notification_prefs.get("email"), dict) else {}
        patch["notification_prefs"] = {"email": {g: bool(email.get(g, True)) for g in PREF_GROUPS}}
    if not patch:
        raise HTTPException(status_code=400, detail="Nothing to change")
    sb = get_supabase_admin()
    try:
        sb.table("profiles").update(patch).eq("id", actor.id).execute()
    except Exception as e:
        raise hub_table_error(e)
    actor.profile.update(patch)
    return me(request, authorization)


# ---------------------------------------------------------------------------
# Home
# ---------------------------------------------------------------------------


def _renter_home(sb, actor: HubActor) -> dict:
    from routes_applications import renter_applications
    from routes_hub_messages import build_threads
    from routes_hub_renter import get_renter_profile, list_documents, profile_completion, recommend, renter_verification_status, saved_cards
    from routes_inspections import renter_inspections
    from routes_tenancies import tenancy_summaries

    rp, exists = get_renter_profile(sb, actor.id)
    completion = profile_completion(actor.profile, rp, exists, list_documents(sb, actor.id))
    apps = renter_applications(sb, actor.id, active_only=True)
    inspections = renter_inspections(sb, actor.id, limit=4)
    saved = saved_cards(sb, actor.id, limit=8)
    threads = [t for t in build_threads(sb, actor, limit_messages=400) if not t["archived"]]
    tenancies = tenancy_summaries(sb, actor)
    try:
        recommended = recommend(sb, actor, 6)
    except Exception:
        recommended = []

    actions = []
    soon = now_utc() + timedelta(hours=48)
    for b in inspections:
        start = parse_ts(b["slot"]["starts_at"])
        if start and start <= soon:
            actions.append({"kind": "inspection", "tone": "info", "title": "Inspection coming up", "starts_at": b["slot"]["starts_at"], "timezone": (b.get("listing") or {}).get("timezone"), "body": (b.get("listing") or {}).get("title"), "href": "/inspections"})
            break
    for a in apps:
        if a["status"] == "changes_requested":
            who = "Migrent" if a.get("changes_requested_by") == "migrent" else "The owner"
            actions.append({"kind": "application", "tone": "warning", "title": f"{who} asked for more information", "body": (a.get("listing") or {}).get("title"), "href": f"/applications/{a['id']}"})
    for a in apps:
        if a["status"] == "draft":
            actions.append({"kind": "application", "tone": "neutral", "title": "Finish your application", "body": (a.get("listing") or {}).get("title"), "href": f"/apply/{(a.get('listing') or {}).get('id')}"})
            break
    unread = sum(t["unread_count"] for t in threads if not t["muted"])
    if unread:
        actions.append({"kind": "messages", "tone": "info", "title": f"{unread} unread message{'s' if unread != 1 else ''}", "body": None, "href": "/messages"})
    if not completion["complete"]:
        actions.append({"kind": "profile", "tone": "neutral", "title": "Complete your Rental Profile", "body": f"{completion['percent']}% done. Owners see this when you apply.", "href": "/profile", "percent": completion["percent"]})

    return {
        "role": "renter",
        "next_actions": actions[:4],
        "applications": apps[:4],
        "inspections": inspections,
        "saved": saved,
        "recommended": recommended,
        "messages": threads[:3],
        "completion": completion,
        "tenancy": tenancies[0] if tenancies else None,
        "verification": renter_verification_status(sb, actor.id),
        "has_activity": bool(apps or inspections or saved or threads),
    }


def _owner_home(sb, actor: HubActor) -> dict:
    from routes_applications import owner_applications
    from routes_hub_messages import build_threads
    from routes_hub_owner import listing_performance, portfolio
    from routes_inspections import owner_inspections
    from routes_owner_verification import check_owner_verified
    from routes_tenancies import tenancy_summaries

    folio = portfolio(sb, actor.id)
    try:
        drafts = sb.table("listing_drafts").select("id, data, step, updated_at").eq("owner_id", actor.id).is_("submitted_at", "null").order("updated_at", desc=True).execute().data or []
    except Exception:
        drafts = []
    new_apps = owner_applications(sb, actor.id, limit=6)
    inspections = owner_inspections(sb, actor.id, limit=5)
    threads = [t for t in build_threads(sb, actor, limit_messages=400) if not t["archived"]]
    tenancies = tenancy_summaries(sb, actor)
    all_units = [u for p in folio["properties"] for u in p["units"]] + folio["unassigned"]
    verified = bool(check_owner_verified(actor.id))

    attention = []
    if not verified and (all_units or drafts):
        attention.append({"kind": "verification", "tone": "warning", "title": "Verify your identity to publish", "body": "Listings stay private drafts until your ID has been checked.", "href": "/settings#verification"})
    for u in all_units:
        if u.get("moderation_status") in ("changes_requested", "rejected"):
            attention.append({"kind": "listing", "tone": "warning", "title": "Listing needs changes", "body": f"{u['title']}" + (f": {u['moderation_notes']}" if u.get("moderation_notes") else ""), "href": f"/listings/{u['id']}"})
    unseen = [a for a in new_apps if a.get("unread_by_owner")]
    if unseen:
        attention.append({"kind": "applications", "tone": "info", "title": f"{len(unseen)} new application{'s' if len(unseen) != 1 else ''}", "body": "Review them while the home is fresh.", "href": "/applications"})
    try:
        maint = sb.table("maintenance_requests").select("id, title, urgency, status").eq("owner_id", actor.id).in_("status", ["submitted", "acknowledged"]).execute().data or []
    except Exception:
        maint = []
    for m in sorted(maint, key=lambda m: {"emergency": 0, "urgent": 1}.get(m["urgency"], 2))[:2]:
        attention.append({"kind": "maintenance", "tone": "danger" if m["urgency"] == "emergency" else "warning" if m["urgency"] == "urgent" else "neutral", "title": f"Maintenance: {m['title']}", "body": {"emergency": "Emergency", "urgent": "Urgent"}.get(m["urgency"], "Routine"), "href": f"/maintenance/{m['id']}"})
    for t in tenancies:
        if t.get("ending_soon"):
            attention.append({"kind": "tenancy", "tone": "neutral", "title": "Tenancy ending soon", "body": f"{(t.get('listing') or {}).get('title')} - ends {t.get('end_date')}", "href": f"/tenancies/{t['id']}"})
    today = date.today()
    for u in all_units:
        end = parse_day(u.get("available_to"))
        if u.get("public_state") == "published" and end and today <= end <= today + timedelta(days=7):
            attention.append({"kind": "listing", "tone": "neutral", "title": "Listing ends this week", "body": f"{u['title']} stops showing on {end.isoformat()}. Extend it to keep it live.", "href": f"/listings/{u['id']}"})
    for d in drafts[:1]:
        data = d.get("data") or {}
        attention.append({"kind": "draft", "tone": "neutral", "title": "Finish your listing", "body": data.get("title") or data.get("street_address") or "Draft saved", "href": f"/properties/new?draft={d['id']}"})

    ids = [u["id"] for u in all_units]
    perf = listing_performance(sb, ids, days=30)
    return {
        "role": "owner",
        "verified": verified,
        "portfolio": {"totals": folio["totals"], "properties": folio["properties"][:6], "unassigned": folio["unassigned"][:6]},
        "attention": attention[:6],
        "applications": [a for a in new_apps if a["status"] in ("submitted", "under_review", "shortlisted")][:5],
        "inspections": inspections,
        "messages": threads[:3],
        "tenancies": tenancies[:4],
        "insights": {"days": 30, "totals": perf["totals"], "tracking_since": perf["tracking_since"]},
        "drafts": len(drafts),
    }


@router.get("/home")
def home(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    role = public_role(actor.profile, actor.is_admin)
    try:
        if role == "owner":
            return _owner_home(sb, actor)
        if role == "admin":
            return {"role": "admin"}
        return _renter_home(sb, actor)
    except HTTPException:
        raise
    except Exception as e:
        raise hub_table_error(e)


@router.get("/counts")
def counts(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    from routes_hub_messages import unread_total

    out = {"messages": unread_total(sb, actor), "notifications": 0, "applications": 0, "maintenance": 0, "tenancies": 0}
    try:
        n = sb.table("notifications").select("id", count="exact").eq("user_id", actor.id).eq("is_read", False).execute()
        out["notifications"] = n.count or 0
    except Exception:
        pass
    try:
        if actor.is_owner:
            a = sb.table("applications").select("id", count="exact").eq("owner_id", actor.id).eq("status", "submitted").is_("owner_viewed_at", "null").execute()
            out["applications"] = a.count or 0
            m = sb.table("maintenance_requests").select("id", count="exact").eq("owner_id", actor.id).eq("status", "submitted").execute()
            out["maintenance"] = m.count or 0
        else:
            a = sb.table("applications").select("id", count="exact").eq("renter_id", actor.id).eq("status", "changes_requested").execute()
            out["applications"] = a.count or 0
            t = sb.table("tenancies").select("id", count="exact").eq("renter_id", actor.id).in_("status", ["upcoming", "active"]).execute()
            out["tenancies"] = t.count or 0
    except Exception:
        pass
    return out


# ---------------------------------------------------------------------------
# AI: listing writing help (feature-flagged)
# ---------------------------------------------------------------------------


class ListingCopyBody(BaseModel):
    facts: dict = Field(default_factory=dict)
    tone: str = "warm"
    focus: Optional[str] = Field(None, max_length=300)

    @field_validator("tone")
    @classmethod
    def _tone(cls, v: str) -> str:
        return v if v in ("warm", "concise", "detailed") else "warm"


@router.post("/ai/listing-copy")
@limiter.limit("20/hour")
def listing_copy(request: Request, body: ListingCopyBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    from ai_provider import AIUnavailable, get_listing_copy_provider

    try:
        provider = get_listing_copy_provider()
        suggestion = provider.listing_copy(body.facts, tone=body.tone, focus=body.focus)
    except AIUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))
    return {"suggestion": suggestion, "review_required": True}
