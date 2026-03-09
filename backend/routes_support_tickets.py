"""
Support system API: tickets, help articles, CSAT.

Routes:
  POST   /support/tickets                  - Create ticket (auth or guest)
  GET    /support/tickets                  - List tickets (user: own, agent: all)
  GET    /support/tickets/{id}             - Ticket detail with messages
  POST   /support/tickets/{id}/reply       - Reply to ticket
  PATCH  /support/tickets/{id}             - Agent: update status/priority/category
  POST   /support/tickets/{id}/csat        - Submit satisfaction rating

  GET    /support/help/categories          - List help categories
  GET    /support/help/articles            - List/search articles
  GET    /support/help/articles/{slug}     - Single article by slug
  POST   /support/help/articles            - Admin: create article
  POST   /support/help/articles/{id}/vote  - Vote helpful/not
"""

import os
import logging
import resend
import httpx
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Query
from db import get_supabase_admin
from auth_utils import get_current_user
from models_support import (
    TicketCreate, TicketReply, TicketUpdate, TicketOut, TicketDetailOut,
    HelpArticleCreate, HelpArticleOut, HelpCategoryOut, HelpVote, CSATSubmit,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/support", tags=["support-system"])

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SUPPORT_EMAIL = os.environ.get("SUPPORT_EMAIL", "migrentau@gmail.com")
N8N_WEBHOOK_BASE = os.environ.get("N8N_WEBHOOK_BASE", "")  # e.g. https://n8n.migrent-ai.com/webhook


# ── Helpers ────────────────────────────────────────────────────

def _get_user_optional(authorization: Optional[str]):
    """Return user if auth header present, else None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return get_current_user(authorization)
    except Exception:
        return None


def _is_agent(user) -> bool:
    """Check if user has support_agent or admin role in profiles."""
    if not user:
        return False
    try:
        sb = get_supabase_admin()
        uid = str(user.id)
        res = sb.table("profiles").select("role").eq("id", uid).execute()
        if res.data and res.data[0].get("role") in ("support_agent", "admin", "superadmin"):
            return True
    except Exception:
        logger.exception("Failed to check agent role")
    return False


def _log_event(ticket_id: str, actor_id: Optional[str], event_type: str,
               old_value: str = None, new_value: str = None, metadata: dict = None):
    """Insert a support_events audit row."""
    sb = get_supabase_admin()
    sb.table("support_events").insert({
        "ticket_id": ticket_id,
        "actor_id": actor_id,
        "event_type": event_type,
        "old_value": old_value,
        "new_value": new_value,
        "metadata": metadata or {},
    }).execute()


async def _fire_webhook(event: str, payload: dict):
    """Send webhook to n8n (fire-and-forget)."""
    if not N8N_WEBHOOK_BASE:
        return
    url = f"{N8N_WEBHOOK_BASE}/{event}"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(url, json=payload)
    except Exception:
        logger.warning(f"Failed to fire n8n webhook: {event}")


# ══════════════════════════════════════════════════════════════
#  TICKETS
# ══════════════════════════════════════════════════════════════

@router.post("/tickets")
async def create_ticket(body: TicketCreate, authorization: Optional[str] = Header(None)):
    """Create a new support ticket. Works for both authenticated and guest users."""
    user = _get_user_optional(authorization)
    sb = get_supabase_admin()

    uid = str(user.id) if user else None
    email = body.email
    name = body.name

    # If authenticated, pull email from user
    if user and not email:
        email = user.email

    ticket_row = {
        "user_id": uid,
        "email": email,
        "name": name,
        "subject": body.subject,
        "status": "open",
        "priority": body.priority,
        "category": body.category,
        "source": body.source,
    }

    res = sb.table("tickets").insert(ticket_row).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create ticket")

    ticket = res.data[0]
    ticket_id = ticket["id"]

    # Insert the initial message
    sb.table("ticket_messages").insert({
        "ticket_id": ticket_id,
        "sender_id": uid,
        "sender_type": "user",
        "body": body.message,
        "is_internal": False,
    }).execute()

    _log_event(ticket_id, uid, "created")

    # Fire n8n webhook for new ticket
    await _fire_webhook("new-ticket", {
        "ticket_id": ticket_id,
        "subject": body.subject,
        "category": body.category,
        "priority": body.priority,
        "email": email,
        "name": name,
        "message": body.message,
    })

    # Send confirmation email to customer
    if RESEND_API_KEY and email:
        try:
            resend.api_key = RESEND_API_KEY
            resend.Emails.send({
                "from": "MigRent Support <onboarding@resend.dev>",
                "to": [email],
                "subject": f"We received your request: {body.subject}",
                "html": f"""
                <h2>Thanks for contacting MigRent Support</h2>
                <p>We've received your request and will get back to you within 24 hours.</p>
                <p><strong>Ticket ID:</strong> {ticket_id[:8]}</p>
                <p><strong>Subject:</strong> {body.subject}</p>
                <p>You can view your ticket status in your <a href="https://migrent-ai.vercel.app/support/tickets">support dashboard</a>.</p>
                <br/>
                <p>- The MigRent Team</p>
                """,
            })
        except Exception:
            logger.exception("Failed to send ticket confirmation email")

    return {"status": "ok", "ticket_id": ticket_id}


@router.get("/tickets")
def list_tickets(
    authorization: str = Header(...),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """
    List tickets.
    - Normal users: only their own tickets.
    - Agents/admins: all tickets with optional filters.
    """
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    uid = str(user.id)
    agent = _is_agent(user)

    query = sb.table("tickets").select("*", count="exact")

    if not agent:
        query = query.eq("user_id", uid)

    if status:
        query = query.eq("status", status)
    if priority:
        query = query.eq("priority", priority)
    if category:
        query = query.eq("category", category)

    # Pagination
    offset = (page - 1) * per_page
    query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)

    res = query.execute()

    return {
        "tickets": res.data or [],
        "total": res.count or 0,
        "page": page,
        "per_page": per_page,
    }


@router.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: str, authorization: str = Header(...)):
    """Get ticket detail with all messages."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    uid = str(user.id)
    agent = _is_agent(user)

    res = sb.table("tickets").select("*").eq("id", ticket_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = res.data[0]

    # Authorization check
    if not agent and ticket.get("user_id") != uid:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Fetch messages
    msg_query = sb.table("ticket_messages").select("*").eq("ticket_id", ticket_id)
    if not agent:
        msg_query = msg_query.eq("is_internal", False)
    msg_res = msg_query.order("created_at", desc=False).execute()

    ticket["messages"] = msg_res.data or []

    return ticket


@router.post("/tickets/{ticket_id}/reply")
async def reply_to_ticket(ticket_id: str, body: TicketReply, authorization: str = Header(...)):
    """Add a reply to a ticket. Users and agents can both reply."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    uid = str(user.id)
    agent = _is_agent(user)

    # Verify ticket exists and user has access
    res = sb.table("tickets").select("*").eq("id", ticket_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = res.data[0]
    if not agent and ticket.get("user_id") != uid:
        raise HTTPException(status_code=403, detail="Not authorized")

    sender_type = "agent" if agent else "user"

    sb.table("ticket_messages").insert({
        "ticket_id": ticket_id,
        "sender_id": uid,
        "sender_type": sender_type,
        "body": body.body,
        "is_internal": False,
    }).execute()

    # Update ticket status based on who replied
    new_status = "pending_customer" if agent else "pending_internal"
    old_status = ticket.get("status")

    update_data = {"status": new_status}

    # Track first response time for agents
    if agent and not ticket.get("first_response_at"):
        update_data["first_response_at"] = "now()"

    sb.table("tickets").update(update_data).eq("id", ticket_id).execute()

    _log_event(ticket_id, uid, "reply", old_value=old_status, new_value=new_status)

    # Fire webhook for agent reply (to notify customer)
    if agent and ticket.get("email"):
        await _fire_webhook("agent-reply", {
            "ticket_id": ticket_id,
            "subject": ticket.get("subject"),
            "email": ticket.get("email"),
            "reply": body.body,
        })

    return {"status": "ok"}


@router.patch("/tickets/{ticket_id}")
def update_ticket(ticket_id: str, body: TicketUpdate, authorization: str = Header(...)):
    """Agent-only: update ticket status, priority, category. Add internal notes."""
    user = get_current_user(authorization)
    if not _is_agent(user):
        raise HTTPException(status_code=403, detail="Agent access required")

    sb = get_supabase_admin()
    uid = str(user.id)

    res = sb.table("tickets").select("*").eq("id", ticket_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = res.data[0]
    update_data = {}

    if body.status:
        _log_event(ticket_id, uid, "status_change",
                    old_value=ticket.get("status"), new_value=body.status)
        update_data["status"] = body.status
        if body.status == "resolved":
            update_data["resolved_at"] = "now()"

    if body.priority:
        _log_event(ticket_id, uid, "priority_change",
                    old_value=ticket.get("priority"), new_value=body.priority)
        update_data["priority"] = body.priority

    if body.category:
        _log_event(ticket_id, uid, "category_change",
                    old_value=ticket.get("category"), new_value=body.category)
        update_data["category"] = body.category

    if update_data:
        sb.table("tickets").update(update_data).eq("id", ticket_id).execute()

    # Add internal note as a message
    if body.internal_note:
        sb.table("ticket_messages").insert({
            "ticket_id": ticket_id,
            "sender_id": uid,
            "sender_type": "agent",
            "body": body.internal_note,
            "is_internal": True,
        }).execute()
        _log_event(ticket_id, uid, "internal_note")

    # Fire resolved webhook for CSAT
    if body.status == "resolved":
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            loop.create_task(_fire_webhook("ticket-resolved", {
                "ticket_id": ticket_id,
                "subject": ticket.get("subject"),
                "email": ticket.get("email"),
            }))
        except Exception:
            pass

    return {"status": "ok"}


@router.post("/tickets/{ticket_id}/csat")
def submit_csat(ticket_id: str, body: CSATSubmit, authorization: str = Header(...)):
    """Submit customer satisfaction rating for a resolved ticket."""
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    uid = str(user.id)

    res = sb.table("tickets").select("*").eq("id", ticket_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = res.data[0]
    # Only the ticket creator can submit CSAT
    if ticket.get("user_id") != uid:
        raise HTTPException(status_code=403, detail="Not authorized")

    sb.table("tickets").update({
        "csat_rating": body.rating,
        "csat_comment": body.comment,
    }).eq("id", ticket_id).execute()

    _log_event(ticket_id, uid, "csat_submitted", new_value=str(body.rating))

    return {"status": "ok"}


# ══════════════════════════════════════════════════════════════
#  HELP CENTER
# ══════════════════════════════════════════════════════════════

@router.get("/help/categories")
def list_help_categories():
    """List all help article categories with article counts."""
    sb = get_supabase_admin()

    cats = sb.table("help_article_categories").select("*").order("sort_order").execute()
    categories = cats.data or []

    # Get article counts per category
    for cat in categories:
        count_res = (
            sb.table("help_articles")
            .select("id", count="exact")
            .eq("category_id", cat["id"])
            .eq("published", True)
            .execute()
        )
        cat["article_count"] = count_res.count or 0

    return {"categories": categories}


@router.get("/help/articles")
def list_help_articles(
    query: Optional[str] = Query(None),
    category: Optional[str] = Query(None),  # category slug
    audience: Optional[str] = Query(None),
):
    """List/search help articles. Public endpoint."""
    sb = get_supabase_admin()

    q = sb.table("help_articles").select("id, slug, title, category_id, audience, view_count, helpful_yes, helpful_no, created_at, updated_at").eq("published", True)

    if category:
        # Resolve category slug to id
        cat_res = sb.table("help_article_categories").select("id").eq("slug", category).execute()
        if cat_res.data:
            q = q.eq("category_id", cat_res.data[0]["id"])

    if audience:
        q = q.in_("audience", [audience, "both"])

    if query:
        # Sanitize query to prevent filter injection (only allow safe characters)
        import re
        safe_query = re.sub(r"[^a-zA-Z0-9\s\-]", "", query)[:100]
        if safe_query:
            q = q.or_(f"title.ilike.%{safe_query}%,body.ilike.%{safe_query}%")

    res = q.order("created_at", desc=True).execute()

    return {"articles": res.data or []}


@router.get("/help/articles/{slug}")
def get_help_article(slug: str):
    """Get a single help article by slug. Increments view count."""
    sb = get_supabase_admin()

    res = sb.table("help_articles").select("*").eq("slug", slug).eq("published", True).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")

    article = res.data[0]

    # Increment view count
    sb.table("help_articles").update({
        "view_count": article["view_count"] + 1
    }).eq("id", article["id"]).execute()

    # Get category name
    if article.get("category_id"):
        cat_res = sb.table("help_article_categories").select("name, slug").eq("id", article["category_id"]).execute()
        if cat_res.data:
            article["category_name"] = cat_res.data[0]["name"]
            article["category_slug"] = cat_res.data[0]["slug"]

    return article


@router.post("/help/articles")
def create_help_article(body: HelpArticleCreate, authorization: str = Header(...)):
    """Admin only: create or update a help article."""
    user = get_current_user(authorization)
    if not _is_agent(user):
        raise HTTPException(status_code=403, detail="Admin access required")

    sb = get_supabase_admin()

    row = {
        "slug": body.slug,
        "title": body.title,
        "body": body.body,
        "audience": body.audience,
        "published": body.published,
    }
    if body.category_id:
        row["category_id"] = body.category_id

    # Upsert by slug
    existing = sb.table("help_articles").select("id").eq("slug", body.slug).execute()
    if existing.data:
        sb.table("help_articles").update(row).eq("id", existing.data[0]["id"]).execute()
        return {"status": "updated", "id": existing.data[0]["id"]}
    else:
        res = sb.table("help_articles").insert(row).execute()
        return {"status": "created", "id": res.data[0]["id"]}


@router.post("/help/articles/{article_id}/vote")
def vote_article(article_id: str, body: HelpVote):
    """Vote an article as helpful or not. Public endpoint."""
    sb = get_supabase_admin()

    res = sb.table("help_articles").select("helpful_yes, helpful_no").eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")

    article = res.data[0]
    if body.helpful:
        sb.table("help_articles").update({"helpful_yes": article["helpful_yes"] + 1}).eq("id", article_id).execute()
    else:
        sb.table("help_articles").update({"helpful_no": article["helpful_no"] + 1}).eq("id", article_id).execute()

    return {"status": "ok"}


# ══════════════════════════════════════════════════════════════
#  AGENT ANALYTICS (basic)
# ══════════════════════════════════════════════════════════════

@router.get("/analytics/summary")
def get_support_analytics(authorization: str = Header(...)):
    """Agent-only: get support metrics summary."""
    user = get_current_user(authorization)
    if not _is_agent(user):
        raise HTTPException(status_code=403, detail="Agent access required")

    sb = get_supabase_admin()

    # Total tickets by status
    all_tickets = sb.table("tickets").select("status, priority, category, csat_rating, created_at", count="exact").execute()
    tickets = all_tickets.data or []

    status_counts = {}
    priority_counts = {}
    category_counts = {}
    csat_ratings = []

    for t in tickets:
        status_counts[t["status"]] = status_counts.get(t["status"], 0) + 1
        priority_counts[t["priority"]] = priority_counts.get(t["priority"], 0) + 1
        if t.get("category"):
            category_counts[t["category"]] = category_counts.get(t["category"], 0) + 1
        if t.get("csat_rating"):
            csat_ratings.append(t["csat_rating"])

    avg_csat = round(sum(csat_ratings) / len(csat_ratings), 2) if csat_ratings else None

    return {
        "total_tickets": len(tickets),
        "by_status": status_counts,
        "by_priority": priority_counts,
        "by_category": category_counts,
        "avg_csat": avg_csat,
        "csat_count": len(csat_ratings),
    }
