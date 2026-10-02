"""Guards for support messages from people who are not signed in
(MIGRENT_MASTER_AUDIT MIG-041): the Contact page and the help button's
"Write to us" both create tickets without an account."""

from datetime import datetime, timedelta, timezone
from typing import Optional

# Tickets one email address can open without an account in a day.
GUEST_DAILY_LIMIT = 3


def is_bot(honeypot: Optional[str]) -> bool:
    """The forms carry a field people never see; bots fill it in."""
    return bool((honeypot or "").strip())


def guest_limit_reached(sb, email: Optional[str]) -> bool:
    if not email:
        return False
    since = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    try:
        rows = sb.table("tickets").select("id").eq("email", email.strip()).is_("user_id", "null").gte("created_at", since).limit(GUEST_DAILY_LIMIT).execute().data or []
    except Exception:
        return False
    return len(rows) >= GUEST_DAILY_LIMIT
