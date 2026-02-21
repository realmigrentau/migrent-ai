"""
Pydantic models for the support system: tickets, help articles, events.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime


# ── Ticket Models ──────────────────────────────────────────────

TicketStatus = Literal["open", "pending_customer", "pending_internal", "resolved", "closed"]
TicketPriority = Literal["low", "normal", "high", "urgent"]
TicketCategory = Literal["billing", "onboarding", "verification", "listings", "trust_safety", "bug", "feedback"]
TicketSource = Literal["in_app", "email", "contact_form"]


class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=300)
    message: str = Field(..., min_length=10, max_length=10000)
    category: TicketCategory = "feedback"
    priority: TicketPriority = "normal"
    source: TicketSource = "in_app"
    # For guest submissions (no auth)
    email: Optional[EmailStr] = None
    name: Optional[str] = Field(None, max_length=200)


class TicketReply(BaseModel):
    body: str = Field(..., min_length=1, max_length=10000)


class TicketUpdate(BaseModel):
    """Agent-only fields."""
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    category: Optional[TicketCategory] = None
    internal_note: Optional[str] = Field(None, max_length=10000)


class TicketOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    status: str
    priority: str
    category: Optional[str] = None
    source: str
    subject: str
    assigned_to: Optional[str] = None
    first_response_at: Optional[str] = None
    resolved_at: Optional[str] = None
    csat_rating: Optional[int] = None
    created_at: str
    updated_at: str


class TicketMessageOut(BaseModel):
    id: str
    ticket_id: str
    sender_id: Optional[str] = None
    sender_type: str
    body: str
    is_internal: bool = False
    created_at: str


class TicketDetailOut(TicketOut):
    messages: list[TicketMessageOut] = []


# ── Help Article Models ────────────────────────────────────────

class HelpArticleCreate(BaseModel):
    slug: str = Field(..., min_length=3, max_length=200)
    title: str = Field(..., min_length=3, max_length=300)
    category_id: Optional[str] = None
    body: str = Field(..., min_length=10)
    audience: Literal["seeker", "owner", "both"] = "both"
    published: bool = True


class HelpArticleOut(BaseModel):
    id: str
    slug: str
    title: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    body: str
    audience: str
    published: bool
    view_count: int = 0
    helpful_yes: int = 0
    helpful_no: int = 0
    created_at: str
    updated_at: str


class HelpCategoryOut(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int = 0
    article_count: int = 0


class HelpVote(BaseModel):
    helpful: bool


# ── CSAT Model ─────────────────────────────────────────────────

class CSATSubmit(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)
