"""
The paid renter ID check (owner decision, 3 October 2026).

    GET  /hub/id-check            renter: where their check is
    POST /hub/id-check/checkout   renter: pay the AUD 19
    POST /hub/id-check/start      renter: open Stripe's ID and selfie check
    GET  /hub/admin/id-checks     admin: every check, with the name on the ID

The flow:

1. The renter pays AUD 19 by card (a Stripe Checkout payment; the webhook,
   or the start call if the webhook is late, marks it paid).
2. They open Stripe Identity: a photo of their passport, driver licence or
   ID card, then a live selfie. Stripe checks the document is genuine and
   the face matches it. It costs Migrent about AUD 2 a check.
3. Stripe's webhook says verified: the renter gets the green "ID verified"
   badge. Owners see it on applications and messages, can show only
   verified applicants, and can make a listing verified-renters-only.
4. A failed check (blurry photo, a face that does not match) uses one of
   three included tries. If all three fail, the fee is not refunded (owner
   decision, 3 October 2026: each try costs Migrent at Stripe); they can pay
   again for three more. The checkout page and the Hub say this before
   anyone pays.

Stripe keeps the document and selfie. Migrent stores only the name on the
ID, the document type and country, and Stripe's reference, so it can help
if something goes wrong after a tenancy (Stripe's report is available to
Migrent's admins in the Stripe dashboard).

This is not a government database check (DVS). That is a later addition
once Migrent is registered with the Attorney-General's Department; the
badge copy says "ID verified", not "government verified".

Off unless SEEKER_VERIFICATION_ENABLED=true and a Stripe key is set.
"""

import logging
import os
from datetime import datetime, timezone
from typing import Iterable, Optional

import stripe
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, Field

from admin_panel import require_admin_panel
from db import get_supabase_admin
from hub_common import fetch_people, hub_actor, notify_user, require_writable
from limiter import limiter
from payments import CURRENCY, SEEKER_VERIFICATION_FEE_CENTS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["hub-id-check"])

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")

FREE_TRIES = 3
# Opening Stripe's check without finishing it does not use a try, but each
# opening is a new Stripe session, so there is a ceiling per payment.
MAX_STARTS = 8
# Codes that mean the person stopped, not that their ID failed.
NOT_A_TRY = {"abandoned", "consent_declined", "device_not_supported"}

FRIENDLY_ERRORS = {
    "document_expired": "The ID has expired. Use one that is still valid.",
    "document_type_not_supported": "That kind of ID can't be used. Use a passport, driver licence or national ID card.",
    "document_unverified_other": "The ID photo couldn't be checked. Take it in good light, flat, with all four corners showing.",
    "selfie_face_mismatch": "The selfie didn't match the photo on the ID. Face the camera in good light, without a hat or glasses.",
    "selfie_document_missing_photo": "The ID needs a photo of your face on it.",
    "selfie_manipulated": "The selfie couldn't be used. Take it live with your phone or webcam.",
    "selfie_unverified_other": "The selfie couldn't be checked. Face the camera in good light.",
    "under_supported_age": "You need to be 18 or over.",
    "country_not_supported": "IDs from that country can't be checked yet. Try your passport.",
}


def free_test_mode() -> bool:
    """Skip the AUD 19 for local testing. Only ever with Stripe TEST keys:
    with live keys this is always False, so it can't give free checks on
    the real site."""
    from billing import payments_mode

    return os.environ.get("ID_CHECK_FREE_TEST", "").strip().lower() == "true" and payments_mode() == "test"


def enabled() -> bool:
    from billing import renter_verification_available

    return renter_verification_available()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hub(path: str) -> str:
    from email_bookings import _hub_url

    return _hub_url(path)


def _row(sb, user_id: str) -> Optional[dict]:
    res = sb.table("renter_verifications").select("*").eq("user_id", str(user_id)).execute()
    return res.data[0] if res.data else None


def _update(sb, user_id: str, patch: dict) -> None:
    sb.table("renter_verifications").update({**patch, "updated_at": _now()}).eq("user_id", str(user_id)).execute()


def id_verified_ids(sb, user_ids: Iterable[str]) -> set[str]:
    """Which of these people have a passed ID check. One query."""
    ids = [str(i) for i in {str(x) for x in user_ids if x}]
    if not ids:
        return set()
    try:
        res = sb.table("renter_verifications").select("user_id, status").in_("user_id", ids).execute()
    except Exception:
        return set()
    return {str(r["user_id"]) for r in (res.data or []) if r.get("status") == "verified"}


def is_id_verified(sb, user_id: str) -> bool:
    return str(user_id) in id_verified_ids(sb, [user_id])


def people_with_id_check(sb, ids: Iterable[str]) -> dict[str, dict]:
    """fetch_people plus each person's `id_verified`, for owner views."""
    ids = list(ids)
    people = fetch_people(sb, ids)
    verified = id_verified_ids(sb, people.keys())
    for pid, p in people.items():
        p["id_verified"] = pid in verified
    return people


def require_verified_if_listing_asks(sb, listing: Optional[dict], renter_id: str) -> None:
    """A listing set to "ID-verified renters only" turns away the rest, but
    only while renters can actually get verified."""
    if not listing or not listing.get("require_verified_renters") or not enabled():
        return
    if not is_id_verified(sb, renter_id):
        raise HTTPException(
            status_code=403,
            detail={"code": "id_check_required", "message": "This owner only accepts applications from renters with a verified ID. Verify your ID in your Rental Profile, then apply."},
        )


def summary(row: Optional[dict]) -> dict:
    """What the renter sees about their own check."""
    row = row or {}
    status = row.get("status") or "not_started"
    paid = row.get("payment_status") == "paid"
    failed = int(row.get("failed_checks") or 0)
    code = row.get("last_error")
    return {
        "available": enabled(),
        "fee": SEEKER_VERIFICATION_FEE_CENTS / 100,
        "status": status,
        "paid": paid,
        "refunded": row.get("payment_status") == "refunded",
        "tries_included": FREE_TRIES,
        "tries_left": max(0, FREE_TRIES - failed) if paid else 0,
        "can_start": paid and status not in ("verified", "rejected", "pending") and failed < FREE_TRIES,
        "last_error": FRIENDLY_ERRORS.get(code, "The check didn't go through. Try again in good light.") if code else None,
        "verified_at": row.get("checked_at") if status == "verified" else None,
    }


# ---------------------------------------------------------------------------
# Renter
# ---------------------------------------------------------------------------


def _require_renter(actor) -> None:
    if actor.is_owner:
        raise HTTPException(status_code=403, detail="The ID check is for renters. Owners are verified through owner verification in Settings.")


@router.get("/id-check")
def get_id_check(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    row = _row(sb, actor.id)
    if row and row.get("provider_ref") and row.get("status") in ("not_started", "retry", "pending") and enabled():
        row = sync_with_stripe(sb, row) or row
    return summary(row)


def sync_with_stripe(sb, row: dict) -> Optional[dict]:
    """Ask Stripe for the current check's result, in case its webhook is
    late or missing. Shares the webhook's once-per-outcome record, so the
    same result is never counted twice."""
    try:
        vs = stripe.identity.VerificationSession.retrieve(row["provider_ref"])
    except stripe.error.StripeError:
        return None
    status = vs.get("status")
    if status == "requires_input" and not (vs.get("last_error") or {}).get("code"):
        return None  # still open, nothing finished yet
    if status not in ("processing", "verified", "requires_input"):
        return None
    handle_identity_event(sb, {"id": f"sync_{vs.get('id')}_{status}", "type": f"identity.verification_session.{status}", "data": {"object": vs}})
    return _row(sb, row["user_id"])


@router.post("/id-check/checkout")
@limiter.limit("10/hour")
def id_check_checkout(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    _require_renter(actor)
    if not enabled():
        raise HTTPException(status_code=503, detail="The ID check isn't available yet.")
    sb = get_supabase_admin()
    row = _row(sb, actor.id)
    if row and row.get("status") == "verified":
        raise HTTPException(status_code=409, detail="Your ID is already verified.")
    if row and row.get("payment_status") == "paid" and row.get("status") != "rejected":
        # A used-up check (3 failed tries) can be bought again; anything else
        # still has tries left.
        raise HTTPException(status_code=409, detail="You've already paid. Start your ID check from your Rental Profile.")
    if free_test_mode():
        fresh_free = {"status": "not_started", "payment_status": "paid", "paid_at": _now(), "checkout_session_id": None, "payment_intent": None, "refunded_at": None, "failed_checks": 0, "checks_started": 0, "last_error": None, "provider_ref": None, "method": "stripe_identity_test", "updated_at": _now()}
        if row:
            sb.table("renter_verifications").update(fresh_free).eq("user_id", actor.id).execute()
        else:
            sb.table("renter_verifications").insert({"user_id": actor.id, **fresh_free}).execute()
        return {"checkout_url": _hub("/profile?id_check=paid#verification")}
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": CURRENCY,
                        "unit_amount": SEEKER_VERIFICATION_FEE_CENTS,
                        "product_data": {"name": "Migrent ID check", "description": f"Photo ID and selfie check. Covers up to {FREE_TRIES} tries. Not refunded if none of the tries pass."},
                    },
                    "quantity": 1,
                }
            ],
            metadata={"user_id": actor.id, "purpose": "verification"},
            payment_intent_data={"statement_descriptor": "MIGRENT ID CHECK", "metadata": {"user_id": actor.id, "purpose": "verification"}},
            client_reference_id=actor.id,
            success_url=_hub("/profile?id_check=paid&session_id={CHECKOUT_SESSION_ID}#verification"),
            cancel_url=_hub("/profile#verification"),
        )
    except stripe.error.StripeError as e:
        logger.warning("ID check checkout failed for %s: %s", actor.id, e)
        raise HTTPException(status_code=502, detail="The payment page couldn't open. Try again in a minute.")
    fresh = {
        "status": "not_started",
        "payment_status": "unpaid",
        "checkout_session_id": session.id,
        "payment_intent": None,
        "paid_at": None,
        "refunded_at": None,
        "failed_checks": 0,
        "checks_started": 0,
        "last_error": None,
        "provider_ref": None,
        "method": "stripe_identity",
        "updated_at": _now(),
    }
    if row:
        sb.table("renter_verifications").update(fresh).eq("user_id", actor.id).execute()
    else:
        sb.table("renter_verifications").insert({"user_id": actor.id, **fresh}).execute()
    return {"checkout_url": session.url}


def _confirm_payment_with_stripe(sb, row: dict) -> Optional[dict]:
    """The webhook can be a few seconds behind the renter's return from
    Stripe. Ask Stripe directly so they can start straight away."""
    sid = row.get("checkout_session_id")
    if not sid:
        return None
    try:
        s = stripe.checkout.Session.retrieve(sid)
    except stripe.error.StripeError:
        return None
    s = dict(s)
    if s.get("payment_status") != "paid" or s.get("amount_total") != SEEKER_VERIFICATION_FEE_CENTS or (s.get("currency") or "").lower() != CURRENCY:
        return None
    if (s.get("metadata") or {}).get("user_id") != str(row["user_id"]):
        return None
    mark_paid(sb, str(row["user_id"]), s)
    return _row(sb, row["user_id"])


class StartBody(BaseModel):
    session_id: Optional[str] = Field(None, max_length=255)


@router.post("/id-check/start")
@limiter.limit("12/hour")
def id_check_start(request: Request, body: Optional[StartBody] = None, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    _require_renter(actor)
    if not enabled():
        raise HTTPException(status_code=503, detail="The ID check isn't available yet.")
    sb = get_supabase_admin()
    row = _row(sb, actor.id)
    if not row:
        raise HTTPException(status_code=402, detail="Pay for the ID check first.")
    if row.get("status") == "rejected":
        raise HTTPException(status_code=409, detail="All your tries have been used.")
    if row.get("payment_status") == "unpaid":
        row = _confirm_payment_with_stripe(sb, row) or row
    if row.get("payment_status") != "paid":
        raise HTTPException(status_code=402, detail="We haven't received your payment yet. If you just paid, wait a few seconds and try again.")
    if row.get("status") == "verified":
        raise HTTPException(status_code=409, detail="Your ID is already verified.")
    if row.get("status") == "pending":
        raise HTTPException(status_code=409, detail="Stripe is checking your ID now. This usually takes a minute or two.")
    if int(row.get("failed_checks") or 0) >= FREE_TRIES or row.get("status") == "rejected":
        raise HTTPException(status_code=409, detail="All your tries have been used.")
    if int(row.get("checks_started") or 0) >= MAX_STARTS:
        raise HTTPException(status_code=429, detail="You've opened the check many times. Contact support and we'll sort it out.")

    # An unfinished earlier session can't be reopened; close it so it can
    # never verify later behind a newer one.
    if row.get("provider_ref"):
        try:
            stripe.identity.VerificationSession.cancel(row["provider_ref"])
        except stripe.error.StripeError:
            pass
    try:
        vs = stripe.identity.VerificationSession.create(
            type="document",
            options={
                "document": {
                    "allowed_types": ["passport", "driving_license", "id_card"],
                    "require_live_capture": True,
                    "require_matching_selfie": True,
                }
            },
            metadata={"user_id": actor.id, "purpose": "renter_id"},
            return_url=_hub("/profile?id_check=done#verification"),
        )
    except stripe.error.StripeError as e:
        logger.warning("Stripe Identity session failed for %s: %s", actor.id, e)
        raise HTTPException(status_code=502, detail="The ID check couldn't open. Try again in a minute.")
    _update(sb, actor.id, {"provider_ref": vs.id, "checks_started": int(row.get("checks_started") or 0) + 1})
    return {"url": vs.url}


# ---------------------------------------------------------------------------
# Webhooks (called from routes_deals.stripe_webhook)
# ---------------------------------------------------------------------------


def mark_paid(sb, user_id: str, session: dict) -> bool:
    """Record the AUD 19. Returns False if this payment is not the one the
    renter's current check is waiting for."""
    row = _row(sb, user_id)
    if not row:
        # Paid on a checkout made before this table was written to.
        sb.table("renter_verifications").insert(
            {"user_id": user_id, "status": "not_started", "payment_status": "unpaid", "method": "stripe_identity", "checkout_session_id": session.get("id"), "updated_at": _now()}
        ).execute()
        row = _row(sb, user_id)
    if row.get("checkout_session_id") and row["checkout_session_id"] != session.get("id"):
        return False
    if row.get("payment_status") != "unpaid":
        # Already paid, or paid and refunded: never mark a refund as paid.
        return row.get("payment_status") == "paid"
    pi = session.get("payment_intent")
    _update(
        sb,
        user_id,
        {"payment_status": "paid", "paid_at": _now(), "payment_intent": pi if isinstance(pi, str) else None, "checkout_session_id": session.get("id")},
    )
    return True


def handle_identity_event(sb, event: dict) -> dict:
    """identity.verification_session.{processing,verified,requires_input}."""
    from routes_deals import _record_event

    vs = event["data"]["object"]
    meta = vs.get("metadata") or {}
    user_id = meta.get("user_id")
    if meta.get("purpose") != "renter_id" or not user_id:
        return {"status": "ignored"}
    row = _row(sb, user_id)
    if not row or row.get("provider_ref") != vs.get("id"):
        # An older session the renter replaced; it was cancelled.
        return {"status": "ignored", "reason": "not the current session"}
    # One record per session and outcome (not per Stripe event), so the
    # webhook and sync_with_stripe never count the same result twice.
    kind = event["type"].rsplit(".", 1)[-1]
    once = {"id": f"idv_{vs.get('id')}_{kind}", "type": event["type"]}
    if not _record_event(sb, once, {"id": vs.get("id"), "metadata": {}}, fee_type="id_check", status=vs.get("status") or "unknown"):
        return {"status": "duplicate"}

    if kind == "processing":
        _update(sb, user_id, {"status": "pending", "last_error": None})
        return {"status": "ok", "id_check": "pending"}

    if kind == "verified":
        patch = {"status": "verified", "checked_at": _now(), "last_error": None}
        try:
            full = stripe.identity.VerificationSession.retrieve(vs["id"], expand=["verified_outputs", "last_verification_report"])
            outputs = full.get("verified_outputs") or {}
            name = " ".join(p for p in (outputs.get("first_name"), outputs.get("last_name")) if p)
            doc = ((full.get("last_verification_report") or {}).get("document")) or {}
            patch.update({"verified_name": name or None, "document_type": doc.get("type"), "document_country": doc.get("issuing_country")})
        except Exception:
            logger.exception("Could not read the verified outputs for %s", vs.get("id"))
        _update(sb, user_id, patch)
        notify_user(
            sb,
            user_id,
            "verification_status_changed",
            "Your ID is verified",
            "You now have the green ID verified badge. Owners see it on your applications and messages.",
            "/profile#verification",
        )
        return {"status": "ok", "id_check": "verified"}

    if kind == "requires_input":
        code = ((vs.get("last_error") or {}).get("code")) or None
        if not code or code in NOT_A_TRY:
            _update(sb, user_id, {"last_error": None})
            return {"status": "ok", "id_check": "not_finished"}
        failed = int(row.get("failed_checks") or 0) + 1
        if failed >= FREE_TRIES:
            _update(sb, user_id, {"status": "rejected", "failed_checks": failed, "last_error": code, "provider_ref": None})
            notify_user(
                sb,
                user_id,
                "verification_status_changed",
                "Your ID check didn't pass",
                f"All {FREE_TRIES} tries were used. You can still apply for homes that don't ask for a verified ID, or try again with a new check from your Rental Profile.",
                "/profile#verification",
            )
            return {"status": "ok", "id_check": "rejected"}
        # Closing the session means a repeat of this result (webhook retry,
        # or sync_with_stripe) is ignored rather than counted again.
        _update(sb, user_id, {"status": "retry", "failed_checks": failed, "last_error": code, "provider_ref": None})
        left = FREE_TRIES - failed
        notify_user(
            sb,
            user_id,
            "verification_status_changed",
            "Your ID check needs another try",
            f"{FRIENDLY_ERRORS.get(code, 'The check did not go through.')} You have {left} {'try' if left == 1 else 'tries'} left.",
            "/profile#verification",
        )
        return {"status": "ok", "id_check": "retry", "tries_left": left}

    return {"status": "ignored"}


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------


@router.get("/admin/id-checks")
def admin_id_checks(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    rows = sb.table("renter_verifications").select("*").order("updated_at", desc=True).limit(500).execute().data or []
    people = fetch_people(sb, [r["user_id"] for r in rows])
    out = []
    for r in rows:
        out.append(
            {
                "user_id": str(r["user_id"]),
                "person": people.get(str(r["user_id"])),
                "status": r.get("status"),
                "payment_status": r.get("payment_status"),
                "failed_checks": r.get("failed_checks") or 0,
                "checks_started": r.get("checks_started") or 0,
                "last_error": r.get("last_error"),
                "verified_name": r.get("verified_name"),
                "document_type": r.get("document_type"),
                "document_country": r.get("document_country"),
                "stripe_session": r.get("provider_ref"),
                "paid_at": r.get("paid_at"),
                "checked_at": r.get("checked_at"),
                "refunded_at": r.get("refunded_at"),
            }
        )
    return {"checks": out}
