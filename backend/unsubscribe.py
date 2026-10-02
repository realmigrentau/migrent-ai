"""One-click unsubscribe from a kind of email (MIGRENT_MASTER_AUDIT MIG-031).

Every email someone can switch off in Hub > Settings > Email notifications
carries:

* a footer link to /unsubscribe on the site, which asks once and then
  switches that kind of email off without signing in, and
* List-Unsubscribe / List-Unsubscribe-Post headers (RFC 8058), so mail apps
  can offer their own unsubscribe button.

The link carries the person's id, the preference group and an HMAC of both,
so it cannot be forged for someone else and does not expire. Account,
security and legal notices have no group and therefore no unsubscribe.
Counsel should confirm which emails count as commercial under the Spam Act
2003; every switchable kind is covered here regardless.
"""

import hashlib
import hmac
import logging
import os
from typing import Optional
from urllib.parse import urlencode

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from db import get_supabase_admin
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/email", tags=["email"])

# The switches in Hub > Settings > Email notifications (routes_hub.PREF_GROUPS).
GROUP_LABELS = {
    "messages": "new messages",
    "applications": "applications, bookings and reviews",
    "inspections": "inspections",
    "saved_searches": "saved search alerts",
    "maintenance": "repairs",
    "listings": "your listings",
    "summaries": "summaries",
}


def _secret() -> bytes:
    raw = os.environ.get("UNSUBSCRIBE_SECRET") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or ""
    # A dedicated key, derived so the service key itself never leaves the server.
    return hashlib.sha256(f"migrent-unsubscribe:{raw}".encode()).digest()


def token(user_id: str, group: str) -> str:
    return hmac.new(_secret(), f"{user_id}:{group}".encode(), hashlib.sha256).hexdigest()[:32]


def valid(user_id: str, group: str, tok: str) -> bool:
    return bool(user_id and group in GROUP_LABELS and tok) and hmac.compare_digest(token(user_id, group), tok)


def _query(user_id: str, group: str) -> str:
    return urlencode({"u": user_id, "g": group, "t": token(user_id, group)})


def page_url(user_id: str, group: str) -> str:
    """The site page that confirms and unsubscribes (frontend/pages/unsubscribe.tsx)."""
    from email_bookings import FRONTEND_URL

    return f"{FRONTEND_URL}/unsubscribe?{_query(user_id, group)}"


def one_click_url(user_id: str, group: str) -> Optional[str]:
    """This API's own address, for RFC 8058 one-click POSTs. Render sets
    RENDER_EXTERNAL_URL on web services; API_PUBLIC_URL overrides it."""
    base = (os.environ.get("API_PUBLIC_URL") or os.environ.get("RENDER_EXTERNAL_URL") or "").rstrip("/")
    return f"{base}/email/unsubscribe?{_query(user_id, group)}" if base else None


def headers(user_id: str, group: str) -> dict:
    one_click = one_click_url(user_id, group)
    if one_click:
        return {"List-Unsubscribe": f"<{one_click}>", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"}
    return {"List-Unsubscribe": f"<{page_url(user_id, group)}>"}


def switch_off(sb, user_id: str, group: str) -> None:
    rows = sb.table("profiles").select("notification_prefs").eq("id", user_id).execute().data or []
    if not rows:
        raise HTTPException(status_code=404, detail="That link is no longer valid.")
    prefs = rows[0].get("notification_prefs") or {}
    email = prefs.get("email") if isinstance(prefs.get("email"), dict) else {}
    email = {g: bool(email.get(g, True)) for g in GROUP_LABELS}
    email[group] = False
    sb.table("profiles").update({"notification_prefs": {**prefs, "email": email}}).eq("id", user_id).execute()


class UnsubscribeBody(BaseModel):
    u: Optional[str] = Field(None, max_length=64)
    g: Optional[str] = Field(None, max_length=40)
    t: Optional[str] = Field(None, max_length=64)


@router.post("/unsubscribe")
@limiter.limit("30/hour")
async def unsubscribe(request: Request, u: Optional[str] = None, g: Optional[str] = None, t: Optional[str] = None):
    """Switch one kind of email off. The site page sends JSON; mail apps send
    an RFC 8058 one-click POST with the values in the query string."""
    if not (u and g and t):
        try:
            body = UnsubscribeBody(**(await request.json()))
            u, g, t = body.u, body.g, body.t
        except Exception:
            pass
    if not valid(u or "", g or "", t or ""):
        raise HTTPException(status_code=400, detail="That unsubscribe link isn't valid. You can change your emails in Migrent Hub > Settings.")
    switch_off(get_supabase_admin(), u, g)
    logger.info("unsubscribed %s from %s", u, g)
    return {"unsubscribed": True, "group": g, "label": GROUP_LABELS[g]}
