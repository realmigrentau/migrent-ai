"""
Stripe webhook and the legacy "deals" endpoints.

The webhook is the only place a payment becomes a fact in MigRent. A
success-page redirect proves nothing (anyone can type the URL), so the
booking-success and verification-success pages ask the API for the state
this handler wrote, and never set it themselves.

Guarantees enforced here, each with a test in tests/test_webhook.py:

  * signature verified against the raw body (stripe.Webhook.construct_event)
  * idempotent per Stripe event id (payment_events.stripe_event_id is unique)
  * amount and currency must equal what the server expects for the fee type
  * the session must be the one the server created for that booking
    (bookings.stripe_session_id == session.id), so a stale or foreign
    session cannot activate a different booking
  * payment_status must be "paid"
  * refunds move the booking to REFUNDED so the record never claims a
    payment that was reversed

The deal-creation endpoints below are retired. They pre-date the bookings
flow and charged the renter a $19 fee that the pricing page says does not
exist. They return 410 so any old client fails loudly instead of creating
a half-configured deal. Reading and cancelling existing deals still works.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Header, HTTPException, Request

from auth_utils import get_current_user
from db import get_supabase_admin
from models import DealCreate, DealStatus, SeekerFeeRequest
from payments import CURRENCY, expected_amount_for

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/deals", tags=["deals"])

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
stripe.api_key = STRIPE_SECRET_KEY

RETIRED_DETAIL = (
    "This payment flow has been retired. Hosts are invoiced their listing fee "
    "when a booking is confirmed; renters are never charged."
)


@router.post("/create")
def create_deal(body: DealCreate, authorization: str = Header(...)):
    get_current_user(authorization)
    raise HTTPException(status_code=410, detail=RETIRED_DETAIL)


@router.post("/seeker-fee-session")
def create_seeker_fee_session(body: SeekerFeeRequest, authorization: str = Header(...)):
    get_current_user(authorization)
    raise HTTPException(status_code=410, detail=RETIRED_DETAIL)


@router.get("/{deal_id}")
def get_deal(deal_id: str, authorization: str = Header(...)):
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    res = sb.table("deals").select("*").eq("id", deal_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Deal not found")
    deal = res.data[0]
    if str(user.id) not in (str(deal["owner_id"]), str(deal["seeker_id"])):
        raise HTTPException(status_code=403, detail="Not authorized to view this deal")
    return deal


@router.patch("/{deal_id}/cancel")
def cancel_deal(deal_id: str, authorization: str = Header(...)):
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    res = sb.table("deals").select("*").eq("id", deal_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Deal not found")
    deal = res.data[0]
    if str(user.id) not in (str(deal["owner_id"]), str(deal["seeker_id"])):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this deal")
    if deal["status"] == DealStatus.cancelled.value:
        raise HTTPException(status_code=400, detail="Deal is already cancelled")
    try:
        sb.table("deals").update({"status": DealStatus.cancelled.value}).eq("id", deal_id).execute()
    except Exception:
        raise HTTPException(status_code=500, detail="Operation failed")
    return {"deal_id": deal_id, "status": DealStatus.cancelled.value}


# ---------------------------------------------------------------------------
# Webhook
# ---------------------------------------------------------------------------

webhook_router = APIRouter(tags=["webhooks"])


class WebhookRejected(Exception):
    """A signed, well-formed event that fails a business check. Returned as
    200 with status 'rejected' so Stripe stops retrying, and recorded."""


def _record_event(sb, event: dict, session: dict, *, fee_type: str | None, status: str, booking_id: str | None = None, deal_id: str | None = None, note: str | None = None) -> bool:
    """Insert the idempotency record. Returns False if the event id was
    already recorded (a retry), in which case nothing else should run."""
    row = {
        "stripe_event_id": event.get("id"),
        "stripe_session_id": session.get("id"),
        "stripe_payment_intent": session.get("payment_intent") if isinstance(session.get("payment_intent"), str) else None,
        "fee_type": fee_type,
        "event_type": event.get("type"),
        "amount": session.get("amount_total"),
        "currency": session.get("currency") or CURRENCY,
        "booking_id": booking_id,
        "deal_id": deal_id,
        "payer": (session.get("metadata") or {}).get("payer"),
        "raw_status": status,
        "notes": note,
    }
    try:
        sb.table("payment_events").insert(row).execute()
        return True
    except Exception as e:  # unique violation on stripe_event_id => duplicate delivery
        message = str(e).lower()
        if "duplicate" in message or "unique" in message or "23505" in message:
            logger.info("Duplicate Stripe event %s ignored", event.get("id"))
            return False
        logger.exception("payment_events insert failed")
        # Fail closed: without the idempotency record we cannot prove we have
        # not already processed this, so make Stripe retry.
        raise HTTPException(status_code=500, detail="Could not record payment event")


def _verify_amount(session: dict, fee_type: str) -> None:
    expected = expected_amount_for(fee_type)
    if expected is None:
        raise WebhookRejected(f"unknown fee_type {fee_type!r}")
    if session.get("payment_status") != "paid":
        raise WebhookRejected(f"payment_status {session.get('payment_status')!r} is not paid")
    if (session.get("currency") or "").lower() != CURRENCY:
        raise WebhookRejected(f"currency {session.get('currency')!r} is not {CURRENCY}")
    amount = session.get("amount_total")
    if amount != expected:
        raise WebhookRejected(f"amount_total {amount!r} does not match expected {expected}")


def _handle_booking_paid(sb, event: dict, session: dict) -> dict:
    metadata = session.get("metadata") or {}
    booking_id = metadata.get("booking_id")
    if not booking_id:
        raise WebhookRejected("booking session without booking_id")

    _verify_amount(session, "booking")

    booking_res = sb.table("bookings").select("*").eq("id", booking_id).execute()
    if not booking_res.data:
        raise WebhookRejected(f"booking {booking_id} not found")
    booking = booking_res.data[0]

    # The session must be the one this server created for this booking.
    if booking.get("stripe_session_id") != session.get("id"):
        raise WebhookRejected("session does not belong to this booking (stale or forged)")
    if booking.get("status") not in ("OWNER_ACCEPTED", "PAID"):
        raise WebhookRejected(f"booking {booking_id} is {booking.get('status')}, not awaiting payment")

    if not _record_event(sb, event, session, fee_type="booking", status="accepted", booking_id=booking_id):
        return {"status": "duplicate"}

    if booking.get("status") == "PAID":
        return {"status": "ok", "booking": True, "already_paid": True}

    now = datetime.now(timezone.utc).isoformat()
    sb.table("bookings").update(
        {
            "status": "PAID",
            "paid_at": now,
            "stripe_payment_intent": session.get("payment_intent") if isinstance(session.get("payment_intent"), str) else None,
        }
    ).eq("id", booking_id).execute()

    # Per-property model: the first paid booking settles the listing fee.
    try:
        sb.table("listings").update({"listing_fee_paid_at": now}).eq("id", booking["listing_id"]).is_("listing_fee_paid_at", "null").execute()
    except Exception:
        logger.exception("Could not mark listing fee paid for booking %s", booking_id)

    try:
        from email_bookings import send_booking_confirmed_to_both

        listing_res = sb.table("listings").select("title, address").eq("id", booking["listing_id"]).execute()
        listing_title = "Listing"
        if listing_res.data:
            listing_title = listing_res.data[0].get("title") or listing_res.data[0].get("address", "Listing")
        owner_profile = sb.table("profiles").select("name").eq("id", booking["owner_id"]).execute()
        seeker_profile = sb.table("profiles").select("name").eq("id", booking["seeker_id"]).execute()
        owner_user = sb.auth.admin.get_user_by_id(booking["owner_id"])
        seeker_user = sb.auth.admin.get_user_by_id(booking["seeker_id"])
        send_booking_confirmed_to_both(
            owner_email=owner_user.user.email if owner_user and owner_user.user else "",
            owner_name=owner_profile.data[0]["name"] if owner_profile.data else "Owner",
            seeker_email=seeker_user.user.email if seeker_user and seeker_user.user else "",
            seeker_name=seeker_profile.data[0]["name"] if seeker_profile.data else "Seeker",
            listing_title=listing_title,
            check_in=booking["check_in_date"],
            check_out=booking["check_out_date"],
            booking_id=booking_id,
        )
    except Exception:
        logger.exception("Booking confirmation email failed for %s", booking_id)

    return {"status": "ok", "booking": True}


def _handle_verification_paid(sb, event: dict, session: dict) -> dict:
    from payments import SEEKER_VERIFICATION_ENABLED

    metadata = session.get("metadata") or {}
    user_id = metadata.get("user_id")
    if not user_id:
        raise WebhookRejected("verification session without user_id")
    _verify_amount(session, "verification")
    if not _record_event(sb, event, session, fee_type="verification", status="accepted"):
        return {"status": "duplicate"}
    if not SEEKER_VERIFICATION_ENABLED:
        # Money was taken while the feature was off (should not happen: the
        # checkout endpoint refuses). Record it and flag for a refund.
        logger.error("Verification payment received while feature disabled: %s", session.get("id"))
        return {"status": "ok", "verification": False, "action_required": "refund"}
    sb.table("profiles").upsert({"id": user_id, "verified": True}).execute()
    return {"status": "ok", "verification": True}


def _handle_legacy_deal_paid(sb, event: dict, session: dict) -> dict:
    metadata = session.get("metadata") or {}
    deal_id = metadata.get("deal_id")
    fee_type = metadata.get("fee_type")
    if not deal_id or fee_type not in ("owner", "seeker"):
        return {"status": "ignored"}
    _verify_amount(session, fee_type)
    deal_res = sb.table("deals").select("*").eq("id", deal_id).execute()
    if not deal_res.data:
        raise WebhookRejected(f"deal {deal_id} not found")
    deal = deal_res.data[0]
    session_col = "owner_payment_stripe_session_id" if fee_type == "owner" else "seeker_payment_stripe_session_id"
    if deal.get(session_col) != session.get("id"):
        raise WebhookRejected("session does not belong to this deal")
    if not _record_event(sb, event, session, fee_type=fee_type, status="accepted", deal_id=deal_id):
        return {"status": "duplicate"}
    new_status = DealStatus.owner_paid.value if fee_type == "owner" else DealStatus.completed.value
    sb.table("deals").update({"status": new_status}).eq("id", deal_id).execute()
    return {"status": "ok", "deal": True}


def _handle_session_expired(sb, event: dict, session: dict) -> dict:
    metadata = session.get("metadata") or {}
    booking_id = metadata.get("booking_id")
    if not _record_event(sb, event, session, fee_type=metadata.get("fee_type"), status="expired", booking_id=booking_id):
        return {"status": "duplicate"}
    if booking_id:
        # Clear the dead session so a fresh one can be issued; the booking
        # stays OWNER_ACCEPTED and the host is re-invoiced from their dashboard.
        sb.table("bookings").update({"stripe_session_id": None}).eq("id", booking_id).eq("stripe_session_id", session.get("id")).execute()
    return {"status": "ok", "expired": True}


def _handle_refund(sb, event: dict, charge: dict) -> dict:
    payment_intent = charge.get("payment_intent") if isinstance(charge.get("payment_intent"), str) else None
    pseudo_session = {"id": None, "amount_total": charge.get("amount_refunded"), "currency": charge.get("currency"), "payment_intent": payment_intent, "metadata": {}}
    if not _record_event(sb, event, pseudo_session, fee_type="refund", status="refunded", note=f"charge {charge.get('id')}"):
        return {"status": "duplicate"}
    if payment_intent:
        sb.table("bookings").update({"status": "REFUNDED", "refunded_at": datetime.now(timezone.utc).isoformat()}).eq("stripe_payment_intent", payment_intent).execute()
    return {"status": "ok", "refund": True}


@webhook_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if not STRIPE_WEBHOOK_SECRET:
        logger.error("STRIPE_WEBHOOK_SECRET is not configured; refusing webhook")
        raise HTTPException(status_code=503, detail="Webhook not configured")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    obj = event["data"]["object"]
    sb = get_supabase_admin()

    try:
        if event_type == "checkout.session.completed":
            metadata = obj.get("metadata") or {}
            if metadata.get("fee_type") == "booking":
                return _handle_booking_paid(sb, event, obj)
            if metadata.get("purpose") == "verification":
                return _handle_verification_paid(sb, event, obj)
            if metadata.get("fee_type") == "mentor_session":
                # Mentor sessions are settled by routes_mentors' own handler
                # through Stripe Connect; nothing to do here beyond recording.
                if not _record_event(sb, event, obj, fee_type="mentor_session", status="accepted"):
                    return {"status": "duplicate"}
                return {"status": "ok", "mentor_session": True}
            return _handle_legacy_deal_paid(sb, event, obj)
        if event_type == "checkout.session.expired":
            return _handle_session_expired(sb, event, obj)
        if event_type in ("charge.refunded", "refund.created"):
            charge = obj if event_type == "charge.refunded" else {"id": obj.get("charge"), "payment_intent": obj.get("payment_intent"), "amount_refunded": obj.get("amount"), "currency": obj.get("currency")}
            return _handle_refund(sb, event, charge)
    except WebhookRejected as rejected:
        logger.warning("Stripe event %s rejected: %s", event.get("id"), rejected)
        try:
            _record_event(sb, event, obj if isinstance(obj, dict) else {}, fee_type=(obj.get("metadata") or {}).get("fee_type") if isinstance(obj, dict) else None, status="rejected", note=str(rejected))
        except HTTPException:
            pass
        return {"status": "rejected", "reason": str(rejected)}

    return {"status": "ignored"}
