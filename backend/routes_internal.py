"""
Internal scheduled jobs.

These are called by a scheduler (Render cron job, GitHub Actions schedule,
or Supabase pg_cron via pg_net) with a shared secret. They are idempotent
and safe to run more often than needed.

    POST /internal/cron/expire-listings      approved -> expired once
                                              available_to has passed
    POST /internal/cron/expiry-reminders     email owners 7 days before

Auth: header `X-Cron-Secret` must equal the CRON_SECRET environment
variable. With CRON_SECRET unset, the endpoints refuse every request.
"""

from __future__ import annotations

import hmac
import logging
import os
from datetime import date, datetime, timezone

from fastapi import APIRouter, Header, HTTPException, Request

from db import get_supabase_admin
from limiter import limiter
from listing_lifecycle import expire_listings, listings_expiring_soon

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/internal", tags=["internal"])


def _require_cron_secret(provided: str | None) -> None:
    expected = os.environ.get("CRON_SECRET", "")
    if not expected or not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/cron/expire-listings")
@limiter.limit("10/minute")
def cron_expire_listings(request: Request, x_cron_secret: str | None = Header(None)):
    _require_cron_secret(x_cron_secret)
    sb = get_supabase_admin()
    expired = expire_listings(sb, date.today())
    logger.info("cron expire-listings: %d expired", len(expired))
    return {"expired": expired, "ran_at": datetime.now(timezone.utc).isoformat()}


@router.post("/cron/expiry-reminders")
@limiter.limit("10/minute")
def cron_expiry_reminders(request: Request, x_cron_secret: str | None = Header(None)):
    _require_cron_secret(x_cron_secret)
    sb = get_supabase_admin()
    from email_bookings import send_listing_expiring_to_owner

    sent: list[str] = []
    for row in listings_expiring_soon(sb, date.today()):
        owner_id = row.get("owner_id")
        try:
            owner_user = sb.auth.admin.get_user_by_id(owner_id)
            owner_email = owner_user.user.email if owner_user and owner_user.user else None
            prof = sb.table("profiles").select("name, preferred_name").eq("id", owner_id).execute()
            owner_name = (prof.data[0].get("preferred_name") or prof.data[0].get("name")) if prof.data else "there"
            if owner_email:
                send_listing_expiring_to_owner(
                    owner_email=owner_email,
                    owner_name=owner_name or "there",
                    listing_title=row.get("title") or row.get("suburb") or "Your listing",
                    available_to=str(row.get("available_to")),
                    listing_id=row["id"],
                )
            sb.table("listings").update({"expiry_notified_at": datetime.now(timezone.utc).isoformat()}).eq("id", row["id"]).execute()
            sent.append(row["id"])
        except Exception:
            logger.exception("expiry reminder failed for listing %s", row.get("id"))
    return {"reminded": sent, "ran_at": datetime.now(timezone.utc).isoformat()}
