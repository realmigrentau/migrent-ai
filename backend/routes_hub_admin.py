"""
Migrent Hub - operations for Migrent administrators.

The existing admin console (/admin: listing moderation, spam, ID review,
users) stays where it is. This module adds what the Hub introduced:

    GET  /hub/admin/overview          what is waiting, in one call
    GET  /hub/admin/reports           the reports queue with context
    POST /hub/admin/reports/{id}      triage: priority, assignment, outcome
    GET  /hub/admin/audit             the admin audit trail (read-only)
    GET  /hub/admin/users             find an account (for support)
    POST /hub/admin/view-as           start an audited, read-only view-as
    POST /hub/admin/view-as/end       end it

The final application review lives with the applications
(routes_applications.admin_queue / admin_decision).

Every consequential action writes admin_audit_log before it returns, and
requires a reason where the action affects a customer.
"""


import logging
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from db import get_supabase_admin
from hub_common import (
    audit,
    fetch_listings,
    fetch_people,
    hub_actor,
    hub_table_error,
    listing_card,
    now_iso,
    require_admin_actor,
)

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


@router.get("/overview")
def overview(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_actor(actor)
    sb = get_supabase_admin()
    return {
        "final_reviews": _count(sb, "applications", status="migrent_review"),
        "open_reports": _count(sb, "reports", status=["pending", "reviewing"]),
        "listings_in_review": _count(sb, "listings", moderation_status=["pending_approval", "flagged"]),
        "id_checks_waiting": _count(sb, "owner_verification", id_status="pending"),
        "open_emergencies": _count(sb, "maintenance_requests", urgency="emergency", status=["submitted", "acknowledged"]),
    }


# ---------------------------------------------------------------------------
# Reports queue
# ---------------------------------------------------------------------------


@router.get("/reports")
def reports(request: Request, status: str = "open", authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_actor(actor)
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
    people_ids = [r["reporter_id"] for r in rows] + [r.get("assigned_to") for r in rows if r.get("assigned_to")]
    people_ids += [r.get("item_id") for r in rows if r.get("item_type") in ("profile", "user") and r.get("item_id") and len(str(r["item_id"])) == 36]
    people = fetch_people(sb, people_ids)
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
        out.append(
            {
                **{k: r.get(k) for k in ("id", "reason", "details", "status", "priority", "resolution", "action_taken", "created_at", "resolved_at")},
                "item_type": kind,
                "item_id": target_id,
                "target": target,
                "reporter": people.get(str(r["reporter_id"])),
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
    require_admin_actor(actor)
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


# ---------------------------------------------------------------------------
# Audit log
# ---------------------------------------------------------------------------


@router.get("/audit")
def audit_log(request: Request, limit: int = 100, target_type: Optional[str] = None, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_actor(actor)
    sb = get_supabase_admin()
    q = sb.table("admin_audit_log").select("*").order("created_at", desc=True).limit(max(1, min(limit, 500)))
    if target_type:
        q = q.eq("target_type", target_type)
    rows = q.execute().data or []
    admins = fetch_people(sb, [r["admin_id"] for r in rows])
    return {
        "entries": [
            {**{k: r.get(k) for k in ("id", "action", "target_type", "target_id", "reason", "metadata", "created_at")}, "admin": admins.get(str(r["admin_id"]))}
            for r in rows
        ]
    }


# ---------------------------------------------------------------------------
# Support: find an account, view as (read-only, audited)
# ---------------------------------------------------------------------------


@router.get("/users")
def find_users(request: Request, q: str, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_actor(actor)
    needle = (q or "").strip()
    if len(needle) < 2:
        return {"users": []}
    sb = get_supabase_admin()
    safe = needle.replace(",", " ").replace("(", " ").replace(")", " ")[:80]
    rows = (
        sb.table("profiles")
        .select("id, name, preferred_name, email, role, created_at, disabled_at")
        .or_(f"name.ilike.%{safe}%,preferred_name.ilike.%{safe}%,email.ilike.%{safe}%")
        .limit(20)
        .execute()
        .data
        or []
    )
    return {
        "users": [
            {
                "id": r["id"],
                "name": r.get("preferred_name") or r.get("name") or "(no name)",
                "email": r.get("email"),
                "role": {"seeker": "renter"}.get(r.get("role"), r.get("role")),
                "member_since": (r.get("created_at") or "")[:10],
                "suspended": bool(r.get("disabled_at")),
            }
            for r in rows
        ]
    }


class ViewAsBody(BaseModel):
    user_id: str = Field(..., min_length=36, max_length=36)
    reason: Optional[str] = Field(None, max_length=500)


@router.post("/view-as")
def start_view_as(request: Request, body: ViewAsBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_actor(actor)
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
