"""
Migrent Hub - the inbox.

A conversation is a renter, an owner and a home: "<listing_id>_<other_user_id>"
(or "direct_<other_user_id>" for the few conversations without a home). So
one owner can be in two separate conversations with the same renter about
two different rooms, each with its own context.

Messages themselves stay in `messages` and are still written only by
POST /messages/send (spam, blocking and attachment checks live there). This
module adds what an inbox needs around them: one call for the list with
the home, the person, unread counts and application context; archive and
mute; starting an enquiry from a listing without the browser ever learning
the owner's account id; and owner reply templates.
"""


import logging
import re
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, Field

from concurrency import run_parallel
from db import get_supabase_admin
from hub_common import (
    HubActor,
    fetch_listings,
    fetch_people,
    hub_actor,
    hub_table_error,
    listing_card,
    now_iso,
    record_listing_event,
    require_owner,
    require_writable,
)
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["hub-messages"])

UUID = r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
KEY_RE = re.compile(rf"^(direct|{UUID})_({UUID})$", re.IGNORECASE)

DEFAULT_TEMPLATES = [
    {
        "id": "builtin-inspection",
        "title": "Invite to inspect",
        "body": "Thanks for your interest. I have inspection times open this week - you can book one straight from the listing in Migrent Hub. Let me know if none of them suit.",
    },
    {
        "id": "builtin-documents",
        "title": "Ask for documents",
        "body": "Thanks for applying. Could you add a recent payslip or proof of income to your application? You can attach it from your Rental Profile.",
    },
    {
        "id": "builtin-received",
        "title": "Application received",
        "body": "Thanks - I have received your application and will be in touch after the inspections have finished.",
    },
    {
        "id": "builtin-update",
        "title": "Application update",
        "body": "A quick update on your application: I am still reviewing and expect to decide by the end of the week.",
    },
    {
        "id": "builtin-followup",
        "title": "After the inspection",
        "body": "Thanks for coming to the inspection. If you would like to go ahead, you can apply from the listing in Migrent Hub.",
    },
]


def parse_key(key: str) -> tuple[Optional[str], str]:
    m = KEY_RE.match(key or "")
    if not m:
        raise HTTPException(status_code=404, detail="Conversation not found")
    listing = None if m.group(1).lower() == "direct" else m.group(1).lower()
    return listing, m.group(2).lower()


def make_key(listing_id: Optional[str], other_id: str) -> str:
    return f"{listing_id or 'direct'}_{other_id}"


def _states(sb, user_id: str) -> dict[str, dict]:
    try:
        rows = sb.table("conversation_states").select("*").eq("user_id", user_id).execute().data or []
    except Exception:
        return {}
    return {r["thread_key"]: r for r in rows}


def build_threads(sb, actor: HubActor, *, limit_messages: int = 2000) -> list[dict]:
    uid = actor.id
    msgs = (
        sb.table("messages")
        .select("id, sender_id, receiver_id, listing_id, message_text, attachment_name, attachment_path, attachment_url, read_at, created_at")
        .or_(f"sender_id.eq.{uid},receiver_id.eq.{uid}")
        .order("created_at", desc=True)
        .limit(limit_messages)
        .execute()
        .data
        or []
    )
    threads: dict[str, dict] = {}
    for m in msgs:
        other = str(m["receiver_id"] if str(m["sender_id"]) == uid else m["sender_id"])
        key = make_key(str(m["listing_id"]) if m.get("listing_id") else None, other)
        t = threads.get(key)
        if t is None:
            t = threads[key] = {
                "key": key,
                "listing_id": str(m["listing_id"]) if m.get("listing_id") else None,
                "other_user_id": other,
                "last_message": {
                    "text": (m.get("message_text") or "")[:200],
                    "from_me": str(m["sender_id"]) == uid,
                    "has_attachment": bool(m.get("attachment_path") or m.get("attachment_url")),
                    "created_at": m["created_at"],
                },
                "unread_count": 0,
                "message_count": 0,
            }
        t["message_count"] += 1
        if str(m["receiver_id"]) == uid and not m.get("read_at"):
            t["unread_count"] += 1

    if not threads:
        return []
    listing_ids = [t["listing_id"] for t in threads.values() if t["listing_id"]]

    # Application context: the one live application between these two people
    # about this home, whichever side the viewer is on.
    def _apps() -> dict[tuple[str, str], dict]:
        apps: dict[tuple[str, str], dict] = {}
        if not listing_ids:
            return apps
        try:
            rows = sb.table("applications").select("id, listing_id, renter_id, owner_id, status").in_("listing_id", listing_ids).neq("status", "draft").execute().data or []
            for a in rows:
                if uid in (str(a["renter_id"]), str(a["owner_id"])):
                    other = str(a["owner_id"]) if str(a["renter_id"]) == uid else str(a["renter_id"])
                    apps[(str(a["listing_id"]), other)] = {"id": a["id"], "status": a["status"]}
        except Exception:
            pass
        return apps

    # Independent reads, fetched together (concurrency.py).
    listings, people, states, apps = run_parallel(
        lambda: fetch_listings(sb, listing_ids),
        lambda: _people_with_id_check(sb, [t["other_user_id"] for t in threads.values()]),
        lambda: _states(sb, uid),
        _apps,
    )

    out = []
    for t in threads.values():
        listing = listings.get(t["listing_id"]) if t["listing_id"] else None
        st = states.get(t["key"], {})
        t["listing"] = listing_card(listing, viewer_is_owner=bool(listing and str(listing.get("owner_id")) == uid))
        t["other"] = people.get(t["other_user_id"]) or {"id": t["other_user_id"], "name": "Migrent member", "avatar_url": None}
        t["my_side"] = "owner" if listing and str(listing.get("owner_id")) == uid else "renter"
        t["archived"] = bool(st.get("archived_at"))
        t["muted"] = bool(st.get("muted"))
        t["application"] = apps.get((t["listing_id"], t["other_user_id"])) if t["listing_id"] else None
        out.append(t)
    out.sort(key=lambda t: t["last_message"]["created_at"], reverse=True)
    return out


def _people_with_id_check(sb, ids):
    # The other person's green "ID verified" badge (renter_id.py).
    from renter_id import people_with_id_check

    return people_with_id_check(sb, ids)


@router.get("/inbox")
def inbox(request: Request, filter: str = "all", q: Optional[str] = None, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    try:
        threads = build_threads(sb, actor)
    except Exception as e:
        raise hub_table_error(e)
    if filter == "archived":
        threads = [t for t in threads if t["archived"]]
    else:
        threads = [t for t in threads if not t["archived"]]
        if filter == "unread":
            threads = [t for t in threads if t["unread_count"]]
    if q:
        needle = q.strip().lower()[:80]
        threads = [
            t
            for t in threads
            if needle in (t["other"].get("name") or "").lower()
            or needle in ((t["listing"] or {}).get("title") or "").lower()
            or needle in ((t["listing"] or {}).get("suburb") or "").lower()
            or needle in (t["last_message"]["text"] or "").lower()
        ]
    return {"threads": threads, "unread_total": sum(t["unread_count"] for t in threads if not t["muted"])}


def unread_total(sb, actor: HubActor) -> int:
    def _unread():
        try:
            return sb.table("messages").select("id, sender_id, listing_id").eq("receiver_id", actor.id).is_("read_at", "null").limit(500).execute().data or []
        except Exception:
            return None

    # Independent reads, fetched together (concurrency.py).
    rows, states = run_parallel(_unread, lambda: _states(sb, actor.id))
    if rows is None:
        return 0
    muted = {k for k, v in states.items() if v.get("muted") or v.get("archived_at")}
    return sum(1 for r in rows if make_key(str(r["listing_id"]) if r.get("listing_id") else None, str(r["sender_id"])) not in muted)


@router.get("/inbox/{key}")
def conversation(key: str, request: Request, before: Optional[str] = None, limit: int = 50, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    listing_id, other = parse_key(key)
    sb = get_supabase_admin()
    uid = actor.id
    limit = max(1, min(limit, 100))
    q = sb.table("messages").select("*").or_(f"and(sender_id.eq.{uid},receiver_id.eq.{other}),and(sender_id.eq.{other},receiver_id.eq.{uid})")
    q = q.eq("listing_id", listing_id) if listing_id else q.is_("listing_id", "null")
    if before:
        q = q.lt("created_at", before)
    # The page of messages and the home are independent reads.
    rows, listing = run_parallel(
        lambda: q.order("created_at", desc=True).limit(limit + 1).execute().data or [],
        lambda: fetch_listings(sb, [listing_id]).get(listing_id) if listing_id else None,
    )
    has_more = len(rows) > limit
    rows = list(reversed(rows[:limit]))

    if not rows and not listing:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if not rows and listing and uid not in (str(listing.get("owner_id")), ) and other != str(listing.get("owner_id")):
        # A new conversation is only ever renter -> the listing's owner.
        raise HTTPException(status_code=404, detail="Conversation not found")

    unread = [m["id"] for m in rows if str(m["receiver_id"]) == uid and not m.get("read_at")] if not actor.read_only else []

    def _mark_read():
        if unread:
            sb.table("messages").update({"read_at": now_iso()}).in_("id", unread).eq("receiver_id", uid).execute()

    from routes_messages import _sign_attachments
    from message_safety import RISK_LABELS, message_risks
    from blocks import block_state

    def _blocked():
        try:
            return block_state(sb, uid, other)
        except Exception:
            return {"by_me": False, "by_them": False}

    my_side = "owner" if listing and str(listing.get("owner_id")) == uid else "renter"

    def _context() -> dict:
        context: dict = {"application": None, "inspection": None}
        if not listing_id:
            return context
        renter_id = other if my_side == "owner" else uid

        def _application():
            app = (
                sb.table("applications")
                .select("id, status, updated_at")
                .eq("listing_id", listing_id)
                .eq("renter_id", renter_id)
                .neq("status", "draft")
                .order("updated_at", desc=True)
                .limit(1)
                .execute()
                .data
            )
            return app[0] if app else None

        def _inspection():
            bookings = (
                sb.table("inspection_bookings").select("id, slot_id, status").eq("listing_id", listing_id).eq("renter_id", renter_id).eq("status", "booked").execute().data
                or []
            )
            if not bookings:
                return None
            slots = sb.table("inspection_slots").select("id, starts_at, ends_at, status").in_("id", [b["slot_id"] for b in bookings]).gte("starts_at", now_iso()).order("starts_at").limit(1).execute().data or []
            if not slots:
                return None
            return {"booking_id": next(b["id"] for b in bookings if str(b["slot_id"]) == str(slots[0]["id"])), **slots[0]}

        try:
            context["application"], context["inspection"] = run_parallel(_application, _inspection)
        except Exception:
            pass
        return context

    def _messages():
        return _sign_attachments(
            sb,
            [
                {
                    "id": m["id"],
                    "from_me": str(m["sender_id"]) == uid,
                    "text": m.get("message_text") or "",
                    "attachment_path": m.get("attachment_path"),
                    "attachment_url": None,
                    "attachment_name": m.get("attachment_name"),
                    "attachment_type": m.get("attachment_type"),
                    "read_at": m.get("read_at"),
                    "created_at": m["created_at"],
                    # Scam signs, shown to the person receiving the message.
                    "risks": [RISK_LABELS[r] for r in message_risks(m.get("message_text"))] if str(m["sender_id"]) != uid else [],
                }
                for m in rows
            ],
        )

    # Everything else the screen needs is independent: fetch it together.
    _, messages, people, states, blocked, context = run_parallel(
        _mark_read,
        _messages,
        lambda: _people_with_id_check(sb, [other]),
        lambda: _states(sb, uid),
        _blocked,
        _context,
    )
    state = states.get(key, {})

    return {
        "key": key,
        "listing": listing_card(listing, viewer_is_owner=(my_side == "owner")),
        "other": people.get(other) or {"id": other, "name": "Migrent member", "avatar_url": None},
        "other_user_id": other,
        "my_side": my_side,
        "archived": bool(state.get("archived_at")),
        "muted": bool(state.get("muted")),
        # Who blocked whom is not said: either way the conversation is closed.
        "blocked": {"by_me": blocked["by_me"], "closed": blocked["by_me"] or blocked["by_them"]},
        "messages": messages,
        "has_more": has_more,
        "context": context,
    }


class SendBody(BaseModel):
    text: str = Field("", max_length=5000)
    attachment_path: Optional[str] = Field(None, max_length=300)
    attachment_name: Optional[str] = Field(None, max_length=200)
    attachment_type: Optional[str] = Field(None, max_length=50)


@router.post("/inbox/{key}/messages")
@limiter.limit("60/minute")
def send_in_conversation(key: str, request: Request, body: SendBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    listing_id, other = parse_key(key)
    text = (body.text or "").strip()
    if not text and not body.attachment_path:
        raise HTTPException(status_code=400, detail="Write a message or attach a file")
    from models import MessageCreate
    from routes_messages import send_message

    msg = MessageCreate(
        sender_id=actor.id,
        receiver_id=other,
        listing_id=listing_id,
        message_text=text or (body.attachment_name or "Attachment"),
        attachment_path=body.attachment_path,
        attachment_name=body.attachment_name,
        attachment_type=body.attachment_type,
    )
    result = send_message(request=request, body=msg, authorization=authorization)
    sb = get_supabase_admin()
    _set_state(sb, actor.id, key, {"archived_at": None})
    m = result["message"]
    return {
        "message": {
            "id": m["id"],
            "from_me": True,
            "text": m.get("message_text") or "",
            "attachment_name": m.get("attachment_name"),
            "attachment_type": m.get("attachment_type"),
            "attachment_url": None,
            "read_at": None,
            "created_at": m.get("created_at"),
        }
    }


class EnquiryBody(BaseModel):
    listing_id: str = Field(..., min_length=36, max_length=36)
    text: str = Field(..., min_length=1, max_length=5000)


@router.post("/enquiries")
@limiter.limit("20/hour")
def start_enquiry(request: Request, body: EnquiryBody, authorization: Optional[str] = Header(None)):
    """Message the owner of a listing. The browser only knows the listing;
    the owner's account id is resolved here."""
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    listing = fetch_listings(sb, [body.listing_id]).get(body.listing_id)
    card = listing_card(listing)
    if not card or card["public_state"] != "published":
        raise HTTPException(status_code=404, detail="That home is no longer available")
    owner = str(listing["owner_id"])
    if owner == actor.id:
        raise HTTPException(status_code=400, detail="This is your own listing")
    key = make_key(body.listing_id, owner)
    previous = sb.table("messages").select("id").eq("listing_id", body.listing_id).eq("sender_id", actor.id).eq("receiver_id", owner).limit(1).execute()
    send_in_conversation(key, request, SendBody(text=body.text), authorization)
    if not previous.data:
        record_listing_event(sb, body.listing_id, "enquiry", actor.id)
    return {"key": key}


class StateBody(BaseModel):
    archived: Optional[bool] = None
    muted: Optional[bool] = None


def _set_state(sb, user_id: str, key: str, patch: dict) -> None:
    try:
        existing = sb.table("conversation_states").select("user_id").eq("user_id", user_id).eq("thread_key", key).execute()
        if existing.data:
            sb.table("conversation_states").update({**patch, "updated_at": now_iso()}).eq("user_id", user_id).eq("thread_key", key).execute()
        elif any(v not in (None, False) for v in patch.values()):
            sb.table("conversation_states").insert({"user_id": user_id, "thread_key": key, "muted": False, "archived_at": None, **patch}).execute()
    except Exception:
        logger.warning("conversation state update failed for %s", key)


@router.post("/inbox/{key}/state")
def set_state(key: str, request: Request, body: StateBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    parse_key(key)
    sb = get_supabase_admin()
    patch: dict = {}
    if body.archived is not None:
        patch["archived_at"] = now_iso() if body.archived else None
    if body.muted is not None:
        patch["muted"] = body.muted
    if not patch:
        raise HTTPException(status_code=400, detail="Nothing to change")
    try:
        existing = sb.table("conversation_states").select("user_id").eq("user_id", actor.id).eq("thread_key", key).execute()
        if existing.data:
            sb.table("conversation_states").update(patch).eq("user_id", actor.id).eq("thread_key", key).execute()
        else:
            sb.table("conversation_states").insert({"user_id": actor.id, "thread_key": key, "muted": False, "archived_at": None, **patch}).execute()
    except Exception as e:
        raise hub_table_error(e)
    return {"key": key, "archived": bool(patch.get("archived_at")) if "archived_at" in patch else None, "muted": patch.get("muted")}


# ---------------------------------------------------------------------------
# Blocking (MIG-032)
# ---------------------------------------------------------------------------


class BlockBody(BaseModel):
    user_id: str = Field(..., min_length=36, max_length=36)
    reason: Optional[str] = Field(None, max_length=500)


@router.get("/blocks")
def list_blocks(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    try:
        rows = sb.table("blocked_users").select("blocked_id, created_at").eq("blocker_id", actor.id).order("created_at", desc=True).execute().data or []
    except Exception as e:
        raise hub_table_error(e)
    people = fetch_people(sb, [r["blocked_id"] for r in rows])
    return {
        "blocked": [
            {"person": people.get(str(r["blocked_id"])) or {"id": str(r["blocked_id"]), "name": "Migrent member", "avatar_url": None}, "created_at": r.get("created_at")}
            for r in rows
        ]
    }


@router.post("/blocks")
@limiter.limit("30/hour")
def block_person(request: Request, body: BlockBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    other = body.user_id.lower()
    if not re.fullmatch(UUID, other):
        raise HTTPException(status_code=400, detail="Unknown person")
    if other == actor.id:
        raise HTTPException(status_code=400, detail="You can't block yourself")
    sb = get_supabase_admin()
    if not sb.table("profiles").select("id").eq("id", other).execute().data:
        raise HTTPException(status_code=404, detail="Unknown person")
    try:
        existing = sb.table("blocked_users").select("id").eq("blocker_id", actor.id).eq("blocked_id", other).execute().data
        if not existing:
            sb.table("blocked_users").insert({"blocker_id": actor.id, "blocked_id": other, "reason": (body.reason or "").strip() or None}).execute()
    except Exception as e:
        raise hub_table_error(e)
    return {"blocked": True, "user_id": other}


@router.delete("/blocks/{user_id}")
def unblock_person(user_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    try:
        sb.table("blocked_users").delete().eq("blocker_id", actor.id).eq("blocked_id", user_id.lower()).execute()
    except Exception as e:
        raise hub_table_error(e)
    return {"blocked": False, "user_id": user_id.lower()}


# ---------------------------------------------------------------------------
# Owner reply templates
# ---------------------------------------------------------------------------


class TemplateBody(BaseModel):
    title: str = Field(..., min_length=1, max_length=80)
    body: str = Field(..., min_length=1, max_length=2000)


@router.get("/templates")
def list_templates(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    custom = []
    try:
        custom = sb.table("message_templates").select("id, title, body, updated_at").eq("owner_id", actor.id).order("created_at").execute().data or []
    except Exception:
        custom = []
    return {"templates": [{**t, "builtin": False} for t in custom] + [{**t, "builtin": True} for t in DEFAULT_TEMPLATES]}


@router.post("/templates")
def create_template(request: Request, body: TemplateBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    require_owner(actor)
    sb = get_supabase_admin()
    try:
        count = sb.table("message_templates").select("id", count="exact").eq("owner_id", actor.id).execute()
        if (count.count or 0) >= 30:
            raise HTTPException(status_code=400, detail="You can keep up to 30 templates")
        row = sb.table("message_templates").insert({"owner_id": actor.id, "title": body.title.strip(), "body": body.body.strip()}).execute().data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise hub_table_error(e)
    return {"template": {**{k: row.get(k) for k in ("id", "title", "body", "updated_at")}, "builtin": False}}


def _own_template(sb, actor: HubActor, template_id: str) -> dict:
    res = sb.table("message_templates").select("*").eq("id", template_id).execute()
    if not res.data or str(res.data[0]["owner_id"]) != actor.id:
        raise HTTPException(status_code=404, detail="Template not found")
    return res.data[0]


@router.patch("/templates/{template_id}")
def update_template(template_id: str, request: Request, body: TemplateBody, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    _own_template(sb, actor, template_id)
    row = sb.table("message_templates").update({"title": body.title.strip(), "body": body.body.strip()}).eq("id", template_id).execute().data[0]
    return {"template": {**{k: row.get(k) for k in ("id", "title", "body", "updated_at")}, "builtin": False}}


@router.delete("/templates/{template_id}")
def delete_template(template_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    sb = get_supabase_admin()
    _own_template(sb, actor, template_id)
    sb.table("message_templates").delete().eq("id", template_id).execute()
    return {"deleted": True}
