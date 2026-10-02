"""
Move-in payments through Migrent (owner decision, 2 October 2026).

    GET  /hub/payouts                         owner: payouts and fee card set up?
    POST /hub/payouts/onboard                 owner: Stripe's payout setup link
    POST /hub/payouts/card                    owner: save the card Migrent's fee goes on
    GET  /hub/tenancies/{id}/move-in          renter or owner: where the payment is
    POST /hub/tenancies/{id}/move-in/checkout renter: pay the rent in advance
    POST /hub/tenancies/{id}/move-in/confirm  owner "money arrived", renter "moved in"
    POST /hub/tenancies/{id}/move-in/fee      owner: try the AUD 99 fee again
    GET  /hub/tenancies/{id}/receipt          the receipt for whoever asks
    GET  /hub/admin/move-ins                  admin: every move-in payment
    GET  /hub/admin/move-ins/{id}             admin: Migrent's receipt

The flow:

1. Migrent finalises an application and a tenancy exists.
2. The owner has set up payouts (a Stripe Express account) and saved a card.
3. The renter pays the rent in advance (the listing's weeks, or one week)
   by card. It is a destination charge on behalf of the owner: Stripe sends
   it straight to the owner's account and Migrent never holds it. The
   renter also pays the card processing fee (owner decision, 2 October
   2026), so the owner receives the full rent; Migrent keeps that fee as
   the application fee, which covers what Stripe charges for the card.
4. Stripe's webhook marks it paid: the green light. Both sides get their
   receipt, with a 10-character code also on Migrent's receipt, so renter
   and owner can check each other when they meet.
5. If this owner has not had this renter through Migrent before, the
   owner's saved card is charged AUD 99 off-session. A failure is shown to
   the owner, who can update the card and try again, and to admins.
6. The owner confirms the money arrived and the renter confirms they moved
   in. Then Migrent's receipt is complete.

The bond is never paid here: the Hub sends the renter to their state's
bond authority (lib/listingCosts RENTING_AUTHORITIES on the site).

Off unless MOVE_IN_PAYMENTS_ENABLED=true and a Stripe key is set, because
Stripe Connect has to be switched on for the platform account first.
"""

from __future__ import annotations

import logging
import math
import os
import secrets
from datetime import datetime, timezone
from typing import Optional

import stripe
from fastapi import APIRouter, Header, HTTPException, Request

from admin_panel import require_admin_panel
from billing import payments_mode
from db import get_supabase_admin
from hub_common import HubActor, fetch_listings, hub_actor, notify_user, require_owner, require_writable
from limiter import limiter
from payments import CURRENCY, HOST_LISTING_FEE_CENTS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["hub-move-in"])

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")

TENANT_FEE_CENTS = HOST_LISTING_FEE_CENTS  # AUD 99, once per new renter for an owner
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O, 1/I: read aloud at a front door
CODE_LENGTH = 10
# Stripe's domestic card price in Australia. The renter pays it on top of the
# rent. Australian law allows a card surcharge only up to the cost of taking
# the card, so this must track what Stripe actually charges Migrent.
CARD_FEE_PERCENT = float(os.environ.get("MOVE_IN_CARD_FEE_PERCENT", "1.75"))
CARD_FEE_FIXED_CENTS = int(os.environ.get("MOVE_IN_CARD_FEE_FIXED_CENTS", "30"))

PROFILE_STRIPE_COLUMNS = "id, email, name, preferred_name, phone, stripe_account_id, stripe_payouts_ready, stripe_customer_id, fee_payment_method_id, fee_card_label"


def enabled() -> bool:
    return os.environ.get("MOVE_IN_PAYMENTS_ENABLED", "").strip().lower() == "true" and payments_mode() != "off"


def _require_enabled() -> None:
    if not enabled():
        raise HTTPException(status_code=503, detail="Paying rent through Migrent is not switched on yet.")


def _hub(path: str) -> str:
    from email_bookings import _hub_url

    return _hub_url(path)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_code() -> str:
    return "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))


def card_fee_cents(rent_cents: int) -> int:
    """The card fee the renter adds, so that after Stripe takes its cut of
    the whole payment the owner still receives the full rent:
    total = (rent + fixed) / (1 - percent), rounded up."""
    total = math.ceil((rent_cents + CARD_FEE_FIXED_CENTS) / (1 - CARD_FEE_PERCENT / 100))
    return int(total - rent_cents)


def weekly_cents(tenancy: dict) -> int:
    amount = float(tenancy.get("rent_amount") or 0)
    freq = tenancy.get("rent_frequency") or "weekly"
    weekly = amount / 2 if freq == "fortnightly" else amount * 12 / 52 if freq == "monthly" else amount
    return int(round(weekly * 100))


def _profile(sb, user_id: str) -> dict:
    try:
        rows = sb.table("profiles").select(PROFILE_STRIPE_COLUMNS).eq("id", user_id).execute().data or []
    except Exception:
        # Before migration 050 the payout columns do not exist.
        raise HTTPException(status_code=503, detail="Paying rent through Migrent is not set up yet.")
    if not rows:
        raise HTTPException(status_code=404, detail="Account not found")
    return rows[0]


def _name(p: Optional[dict]) -> str:
    p = p or {}
    return (p.get("preferred_name") or p.get("name") or "Migrent member").strip()


def payouts_ready(sb, profile: dict, *, refresh: bool = False) -> bool:
    """Can Stripe pay this owner? Asked of Stripe until it says yes, then
    remembered on the profile (as for mentors, routes_mentors.payouts_ready)."""
    account_id = profile.get("stripe_account_id")
    if not account_id:
        return False
    if profile.get("stripe_payouts_ready") and not refresh:
        return True
    try:
        account = stripe.Account.retrieve(account_id)
    except Exception:
        logger.warning("Could not read Stripe account for owner %s", profile.get("id"))
        return bool(profile.get("stripe_payouts_ready"))
    caps = account.get("capabilities") or {}
    ready = bool(account.get("payouts_enabled")) and caps.get("transfers") == "active" and caps.get("card_payments") == "active"
    if ready != bool(profile.get("stripe_payouts_ready")):
        sb.table("profiles").update({"stripe_payouts_ready": ready}).eq("id", profile["id"]).execute()
        profile["stripe_payouts_ready"] = ready
    return ready


def owner_setup(sb, profile: dict, *, refresh: bool = False) -> dict:
    return {
        "enabled": enabled(),
        "payouts_ready": payouts_ready(sb, profile, refresh=refresh),
        "payouts_started": bool(profile.get("stripe_account_id")),
        "card_saved": bool(profile.get("fee_payment_method_id")),
        "card_label": profile.get("fee_card_label"),
        "fee": TENANT_FEE_CENTS / 100,
    }


# ---------------------------------------------------------------------------
# Owner setup: payouts and the fee card
# ---------------------------------------------------------------------------


@router.get("/payouts")
def get_payouts(request: Request, refresh: bool = False, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_owner(actor)
    if not enabled():
        return {"enabled": False}
    sb = get_supabase_admin()
    return owner_setup(sb, _profile(sb, actor.id), refresh=refresh)


@router.post("/payouts/onboard")
@limiter.limit("10/hour")
def payouts_onboard(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_owner(actor)
    require_writable(actor)
    _require_enabled()
    sb = get_supabase_admin()
    profile = _profile(sb, actor.id)
    account_id = profile.get("stripe_account_id")
    if not account_id:
        try:
            account = stripe.Account.create(
                type="express",
                country="AU",
                email=profile.get("email") or None,
                capabilities={"card_payments": {"requested": True}, "transfers": {"requested": True}},
                business_profile={"product_description": "Residential rent received through Migrent"},
                metadata={"user_id": actor.id, "purpose": "owner_payouts"},
            )
        except Exception:
            # Most often Stripe Connect is not switched on for the platform yet.
            logger.exception("Stripe Connect account creation failed for owner %s", actor.id)
            raise HTTPException(status_code=502, detail="Stripe could not start payout setup. Try again later, or contact Migrent.")
        account_id = account.id
        sb.table("profiles").update({"stripe_account_id": account_id}).eq("id", actor.id).execute()
    try:
        link = stripe.AccountLink.create(
            account=account_id,
            refresh_url=_hub("/settings?payouts=refresh#payouts"),
            return_url=_hub("/settings?payouts=done#payouts"),
            type="account_onboarding",
        )
    except Exception:
        logger.exception("Stripe onboarding link failed for owner %s", actor.id)
        raise HTTPException(status_code=502, detail="Stripe could not open payout setup. Try again in a moment.")
    return {"url": link.url}


@router.post("/payouts/card")
@limiter.limit("10/hour")
def save_fee_card(request: Request, authorization: Optional[str] = Header(None)):
    """A Stripe Checkout page in setup mode: the owner saves a card and
    nothing is charged now. Migrent's fee is charged to it later, off-session."""
    actor = hub_actor(request, authorization)
    require_owner(actor)
    require_writable(actor)
    _require_enabled()
    sb = get_supabase_admin()
    profile = _profile(sb, actor.id)
    customer_id = profile.get("stripe_customer_id")
    try:
        if not customer_id:
            customer = stripe.Customer.create(email=profile.get("email") or None, name=_name(profile), metadata={"user_id": actor.id})
            customer_id = customer.id
            sb.table("profiles").update({"stripe_customer_id": customer_id}).eq("id", actor.id).execute()
        session = stripe.checkout.Session.create(
            mode="setup",
            currency=CURRENCY,
            customer=customer_id,
            payment_method_types=["card"],
            metadata={"purpose": "owner_fee_card", "user_id": actor.id},
            setup_intent_data={
                "description": "Migrent's AUD 99 fee for each new renter",
                "metadata": {"purpose": "owner_fee_card", "user_id": actor.id},
            },
            success_url=_hub("/settings?card=saved#payouts"),
            cancel_url=_hub("/settings#payouts"),
        )
    except Exception:
        logger.exception("Could not start card setup for owner %s", actor.id)
        raise HTTPException(status_code=502, detail="Stripe could not open the card page. Try again in a moment.")
    return {"url": session.url}


def handle_card_saved(sb, session: dict) -> dict:
    """checkout.session.completed in setup mode: remember the card."""
    user_id = (session.get("metadata") or {}).get("user_id")
    setup_intent_id = session.get("setup_intent")
    if not user_id or not setup_intent_id:
        return {"status": "ignored"}
    intent = stripe.SetupIntent.retrieve(setup_intent_id, expand=["payment_method"])
    pm = intent.get("payment_method") or {}
    pm_id = pm.get("id") if isinstance(pm, dict) else pm
    card = (pm.get("card") or {}) if isinstance(pm, dict) else {}
    label = f"{(card.get('brand') or 'card').title()} ending {card.get('last4')}" if card.get("last4") else "Saved card"
    sb.table("profiles").update({"fee_payment_method_id": pm_id, "fee_card_label": label}).eq("id", user_id).execute()
    # A fee that failed on the old card is tried again on the new one.
    for row in sb.table("move_in_payments").select("*").eq("owner_id", user_id).eq("fee_status", "failed").execute().data or []:
        charge_fee(sb, row)
    return {"status": "ok", "card_saved": True}


# ---------------------------------------------------------------------------
# The move-in payment
# ---------------------------------------------------------------------------


def _tenancy(sb, tenancy_id: str, actor: HubActor) -> tuple[dict, str]:
    rows = sb.table("tenancies").select("*").eq("id", tenancy_id).execute().data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Tenancy not found")
    t = rows[0]
    if str(t["owner_id"]) == actor.id:
        return t, "owner"
    if str(t["renter_id"]) == actor.id:
        return t, "renter"
    raise HTTPException(status_code=404, detail="Tenancy not found")


def _current(sb, tenancy_id: str) -> Optional[dict]:
    rows = (
        sb.table("move_in_payments").select("*").eq("tenancy_id", tenancy_id).in_("status", ["pending", "paid", "refunded"]).order("created_at", desc=True).limit(1).execute().data
        or []
    )
    return rows[0] if rows else None


def _weeks_for(sb, listing: Optional[dict]) -> int:
    """The listing's rent in advance in weeks (migration 047), or one week."""
    weeks = None
    if listing and listing.get("id"):
        try:
            rows = sb.table("listings").select("rent_in_advance_weeks").eq("id", str(listing["id"])).execute().data or []
            weeks = rows[0].get("rent_in_advance_weeks") if rows else None
        except Exception:
            weeks = None
    try:
        weeks = int(weeks)
    except (TypeError, ValueError):
        weeks = 0
    return weeks if weeks >= 1 else 1


def _state(row: Optional[dict], viewer: str) -> dict:
    """What the Hub shows. The code is shown only once the money has gone."""
    if not row:
        return {"status": "not_started"}
    paid = row["status"] == "paid"
    out = {
        "id": row["id"],
        "status": row["status"],
        "weeks": row["weeks"],
        "amount": row["amount_cents"] / 100,
        "card_fee": row.get("card_fee_cents", 0) / 100,
        "to_owner": (row["amount_cents"] - (row.get("card_fee_cents") or 0)) / 100,
        "paid_at": row.get("paid_at"),
        "green_light": paid,
        "owner_confirmed_at": row.get("owner_confirmed_at"),
        "renter_confirmed_at": row.get("renter_confirmed_at"),
        "complete": bool(paid and row.get("owner_confirmed_at") and row.get("renter_confirmed_at")),
        "receipt_code": row.get("receipt_code") if paid or row["status"] == "refunded" else None,
    }
    if viewer in ("owner", "admin"):
        out.update({"fee_status": row.get("fee_status"), "fee": (row.get("fee_cents") or 0) / 100 or None, "fee_error": row.get("fee_error")})
    return out


@router.get("/tenancies/{tenancy_id}/move-in")
def get_move_in(tenancy_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    if not enabled():
        return {"enabled": False}
    sb = get_supabase_admin()
    t, viewer = _tenancy(sb, tenancy_id, actor)
    listing = fetch_listings(sb, [t["listing_id"]]).get(str(t["listing_id"]))
    owner = _profile(sb, str(t["owner_id"]))
    weeks = _weeks_for(sb, listing)
    rent = weekly_cents(t) * weeks
    card_fee = card_fee_cents(rent) if rent > 0 else 0
    owner_ready = payouts_ready(sb, owner) and bool(owner.get("fee_payment_method_id"))
    return {
        "enabled": True,
        "viewer": viewer,
        "owner_ready": owner_ready,
        "quote": {"weeks": weeks, "weekly": weekly_cents(t) / 100, "rent": rent / 100, "card_fee": card_fee / 100, "amount": (rent + card_fee) / 100},
        "payment": _state(_current(sb, tenancy_id), viewer),
        "owner_setup": owner_setup(sb, owner) if viewer == "owner" else None,
    }


@router.post("/tenancies/{tenancy_id}/move-in/checkout")
@limiter.limit("10/hour")
def move_in_checkout(tenancy_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    _require_enabled()
    sb = get_supabase_admin()
    t, viewer = _tenancy(sb, tenancy_id, actor)
    if viewer != "renter":
        raise HTTPException(status_code=403, detail="The renter pays the move-in rent.")
    if t.get("status") not in ("upcoming", "active"):
        raise HTTPException(status_code=409, detail="This tenancy has ended.")
    existing = _current(sb, tenancy_id)
    if existing and existing["status"] == "paid":
        raise HTTPException(status_code=409, detail="The move-in rent is already paid.")

    owner = _profile(sb, str(t["owner_id"]))
    if not (payouts_ready(sb, owner) and owner.get("fee_payment_method_id")):
        raise HTTPException(status_code=409, detail="The owner hasn't finished setting up payments yet. We've told them; try again soon.")
    listing = fetch_listings(sb, [t["listing_id"]]).get(str(t["listing_id"])) or {}
    weeks = _weeks_for(sb, listing)
    weekly = weekly_cents(t)
    if weekly <= 0:
        raise HTTPException(status_code=409, detail="The rent for this tenancy isn't set yet. Ask the owner to add it.")
    rent = weekly * weeks
    card_fee = card_fee_cents(rent)
    amount = rent + card_fee  # what the renter pays
    title = listing.get("title") or "your new home"

    if existing and existing["status"] == "pending":
        row = sb.table("move_in_payments").update({"weeks": weeks, "weekly_rent_cents": weekly, "amount_cents": amount, "card_fee_cents": card_fee, "updated_at": _now()}).eq("id", existing["id"]).execute().data[0]
    else:
        row = sb.table("move_in_payments").insert(
            {"tenancy_id": tenancy_id, "owner_id": str(t["owner_id"]), "renter_id": str(t["renter_id"]), "weeks": weeks, "weekly_rent_cents": weekly, "amount_cents": amount, "card_fee_cents": card_fee, "currency": CURRENCY, "status": "pending", "fee_status": "not_yet"}
        ).execute().data[0]

    payment_intent_data = {
        "on_behalf_of": owner["stripe_account_id"],
        "transfer_data": {"destination": owner["stripe_account_id"]},
        "description": f"Rent in advance ({weeks} week{'s' if weeks != 1 else ''}) for {title}",
        "metadata": {"fee_type": "move_in", "move_in_id": row["id"], "tenancy_id": tenancy_id},
    }
    # Migrent keeps the card fee and pays Stripe for the card out of it; the
    # owner receives exactly the rent.
    payment_intent_data["application_fee_amount"] = card_fee
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            currency=CURRENCY,
            customer_email=actor.email or None,
            line_items=[
                {
                    "price_data": {
                        "currency": CURRENCY,
                        "unit_amount": rent,
                        "product_data": {"name": f"Rent in advance: {weeks} week{'s' if weeks != 1 else ''}", "description": f"{title}. Paid to the owner through Migrent. The bond is paid separately to your state's bond authority."},
                    },
                    "quantity": 1,
                },
                {
                    "price_data": {
                        "currency": CURRENCY,
                        "unit_amount": card_fee,
                        "product_data": {"name": "Card processing fee", "description": "What the card payment costs. The owner receives the full rent."},
                    },
                    "quantity": 1,
                },
            ],
            metadata={"fee_type": "move_in", "move_in_id": row["id"], "tenancy_id": tenancy_id},
            payment_intent_data=payment_intent_data,
            success_url=_hub(f"/tenancies/{tenancy_id}?move_in=paid"),
            cancel_url=_hub(f"/tenancies/{tenancy_id}"),
        )
    except Exception:
        logger.exception("Move-in checkout failed for tenancy %s", tenancy_id)
        raise HTTPException(status_code=502, detail="Stripe could not open the payment page. Try again in a moment.")
    sb.table("move_in_payments").update({"stripe_session_id": session.id, "updated_at": _now()}).eq("id", row["id"]).execute()
    return {"url": session.url}


def is_new_renter_for_owner(sb, row: dict) -> bool:
    """AUD 99 is due the first time an owner gets this renter through
    Migrent. A renewal, or the same renter in another of the owner's homes,
    is free."""
    earlier = (
        sb.table("move_in_payments")
        .select("id")
        .eq("owner_id", row["owner_id"])
        .eq("renter_id", row["renter_id"])
        .in_("status", ["paid", "refunded"])
        .neq("id", row["id"])
        .execute()
        .data
        or []
    )
    return not earlier


def charge_fee(sb, row: dict) -> dict:
    """Charge the owner's saved card AUD 99, off-session. Never raises."""
    if row.get("fee_status") in ("charged", "not_due"):
        return row
    patch: dict = {"updated_at": _now()}
    try:
        owner = _profile(sb, str(row["owner_id"]))
        if not (owner.get("stripe_customer_id") and owner.get("fee_payment_method_id")):
            raise ValueError("No saved card")
        intent = stripe.PaymentIntent.create(
            amount=TENANT_FEE_CENTS,
            currency=CURRENCY,
            customer=owner["stripe_customer_id"],
            payment_method=owner["fee_payment_method_id"],
            off_session=True,
            confirm=True,
            description="Migrent fee for a new renter",
            metadata={"fee_type": "tenant_fee", "move_in_id": row["id"], "tenancy_id": str(row["tenancy_id"])},
            idempotency_key=f"tenant-fee-{row['id']}-{row.get('fee_payment_intent') or 'first'}",
        )
        if intent.get("status") != "succeeded":
            raise ValueError(f"Payment {intent.get('status')}")
        patch.update({"fee_status": "charged", "fee_cents": TENANT_FEE_CENTS, "fee_payment_intent": intent.id, "fee_charged_at": _now(), "fee_error": None})
    except Exception as e:
        message = getattr(e, "user_message", None) or str(e) or "The card was declined"
        logger.warning("Tenant fee failed for move-in %s: %s", row["id"], message)
        patch.update({"fee_status": "failed", "fee_cents": TENANT_FEE_CENTS, "fee_error": message[:300]})
        notify_user(
            sb, str(row["owner_id"]), "move_in_fee_failed", "Migrent's fee didn't go through",
            f"We couldn't charge your saved card the AUD {TENANT_FEE_CENTS // 100} fee for your new renter: {message}. Update your card in Settings and we'll try again.",
            "/settings#payouts",
        )
    updated = sb.table("move_in_payments").update(patch).eq("id", row["id"]).execute().data
    return updated[0] if updated else {**row, **patch}


def handle_move_in_paid(sb, event: dict, session: dict) -> dict:
    """checkout.session.completed for a move-in payment: the green light."""
    from routes_deals import WebhookRejected, _record_event

    move_in_id = (session.get("metadata") or {}).get("move_in_id")
    if not move_in_id:
        raise WebhookRejected("move-in checkout without move_in_id")
    if session.get("payment_status") != "paid":
        raise WebhookRejected(f"payment_status {session.get('payment_status')!r} is not paid")
    if (session.get("currency") or "").lower() != CURRENCY:
        raise WebhookRejected(f"currency {session.get('currency')!r} is not {CURRENCY}")
    rows = sb.table("move_in_payments").select("*").eq("id", move_in_id).execute().data or []
    if not rows:
        raise WebhookRejected(f"move-in payment {move_in_id} not found")
    row = rows[0]
    if row.get("stripe_session_id") != session.get("id"):
        raise WebhookRejected("session does not belong to this move-in payment (stale or forged)")
    if session.get("amount_total") != row["amount_cents"]:
        raise WebhookRejected(f"amount_total {session.get('amount_total')!r} does not match expected {row['amount_cents']}")
    if not _record_event(sb, event, session, fee_type="move_in", status="accepted"):
        return {"status": "duplicate"}
    if row["status"] == "paid":
        return {"status": "ok", "move_in": True, "already_paid": True}

    code = new_code()
    payment_intent = session.get("payment_intent") if isinstance(session.get("payment_intent"), str) else None
    row = (
        sb.table("move_in_payments")
        .update({"status": "paid", "paid_at": _now(), "receipt_code": code, "stripe_payment_intent": payment_intent, "updated_at": _now()})
        .eq("id", row["id"])
        .execute()
        .data[0]
    )
    _record_in_ledger(sb, row)

    # The fee: only for a renter new to this owner.
    if is_new_renter_for_owner(sb, row):
        row = charge_fee(sb, row)
    else:
        row = sb.table("move_in_payments").update({"fee_status": "not_due", "updated_at": _now()}).eq("id", row["id"]).execute().data[0]

    _green_light(sb, row)
    return {"status": "ok", "move_in": True, "fee_status": row.get("fee_status")}


def _rent_cents(row: dict) -> int:
    """The rent part of a payment (what the owner receives)."""
    return row["amount_cents"] - (row.get("card_fee_cents") or 0)


def _record_in_ledger(sb, row: dict) -> None:
    """The rent ledger shows the payment like any other (method 'provider')."""
    try:
        sb.table("rent_payments").insert(
            {
                "tenancy_id": str(row["tenancy_id"]),
                "due_date": (row.get("paid_at") or _now())[:10],
                "amount_due": _rent_cents(row) / 100,
                "amount_paid": _rent_cents(row) / 100,
                "status": "paid",
                "paid_on": (row.get("paid_at") or _now())[:10],
                "method": "provider",
                "reference": f"Migrent move-in {row.get('receipt_code') or ''}".strip(),
            }
        ).execute()
    except Exception:
        logger.exception("Could not add move-in payment %s to the ledger", row["id"])


def _green_light(sb, row: dict) -> None:
    tid = str(row["tenancy_id"])
    amount = f"AUD {_rent_cents(row) / 100:,.2f}"
    notify_user(sb, str(row["renter_id"]), "move_in_paid", "Payment sent to the owner", f"Your {amount} rent in advance has gone to the owner. Your receipt has your security code.", f"/tenancies/{tid}/receipt", entity_type="tenancy", entity_id=tid)
    notify_user(sb, str(row["owner_id"]), "move_in_paid", "Your renter's payment is on its way", f"{amount} rent in advance was paid to your Stripe account. Your receipt has the renter's details and the security code.", f"/tenancies/{tid}/receipt", entity_type="tenancy", entity_id=tid)
    for role in ("renter", "owner"):
        try:
            send_receipt_email(sb, row, role)
        except Exception:
            logger.exception("Could not email the %s receipt for move-in %s", role, row["id"])


@router.post("/tenancies/{tenancy_id}/move-in/confirm")
@limiter.limit("20/hour")
def confirm_move_in(tenancy_id: str, request: Request, authorization: Optional[str] = Header(None)):
    """Owner: "the money arrived". Renter: "I've moved in and have the keys"."""
    actor = hub_actor(request, authorization)
    require_writable(actor)
    _require_enabled()
    sb = get_supabase_admin()
    _t, viewer = _tenancy(sb, tenancy_id, actor)
    row = _current(sb, tenancy_id)
    if not row or row["status"] != "paid":
        raise HTTPException(status_code=409, detail="There is no completed move-in payment to confirm yet.")
    column = "owner_confirmed_at" if viewer == "owner" else "renter_confirmed_at"
    if not row.get(column):
        row = sb.table("move_in_payments").update({column: _now(), "updated_at": _now()}).eq("id", row["id"]).execute().data[0]
        if row.get("owner_confirmed_at") and row.get("renter_confirmed_at"):
            _both_confirmed(sb, row)
    return {"payment": _state(row, viewer)}


def _both_confirmed(sb, row: dict) -> None:
    """Migrent's receipt is complete: tell the admins, by Hub and email."""
    from hub_common import ADMIN_ROLES

    admins = sb.table("profiles").select("id, is_admin, role").or_("is_admin.eq.true,role.in.(" + ",".join(ADMIN_ROLES) + ")").execute().data or []
    for a in admins:
        if a.get("is_admin") or a.get("role") in ADMIN_ROLES:
            notify_user(sb, str(a["id"]), "move_in_complete", "Move-in complete", f"Both sides confirmed move-in {row.get('receipt_code')}. Migrent's receipt is ready.", "/admin/move-ins", entity_type="tenancy", entity_id=str(row["tenancy_id"]))
    try:
        send_receipt_email(sb, row, "admin")
    except Exception:
        logger.exception("Could not email Migrent's receipt for move-in %s", row["id"])


@router.post("/tenancies/{tenancy_id}/move-in/fee")
@limiter.limit("10/hour")
def retry_fee(tenancy_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_writable(actor)
    _require_enabled()
    sb = get_supabase_admin()
    _t, viewer = _tenancy(sb, tenancy_id, actor)
    if viewer != "owner":
        raise HTTPException(status_code=403, detail="Only the owner pays Migrent's fee.")
    row = _current(sb, tenancy_id)
    if not row or row.get("fee_status") != "failed":
        raise HTTPException(status_code=409, detail="There is no fee waiting to be paid.")
    row = charge_fee(sb, row)
    return {"payment": _state(row, "owner")}


def handle_move_in_refund(sb, charge: dict, move_in_id: str) -> dict:
    """A refunded move-in payment takes the owner's share back too (see
    routes_deals._handle_mentor_refund for why)."""
    sb.table("move_in_payments").update({"status": "refunded", "updated_at": _now()}).eq("id", move_in_id).execute()
    transfer_id = charge.get("transfer") if isinstance(charge.get("transfer"), str) else None
    amount = charge.get("amount") or 0
    refunded = charge.get("amount_refunded") or 0
    if transfer_id and amount > 0:
        try:
            transfer = stripe.Transfer.retrieve(transfer_id)
            owed_back = round(transfer["amount"] * min(refunded, amount) / amount)
            to_reverse = owed_back - (transfer.get("amount_reversed") or 0)
            if to_reverse > 0:
                stripe.Transfer.create_reversal(transfer_id, amount=to_reverse, metadata={"move_in_id": move_in_id})
        except Exception:
            logger.exception("Could not reverse move-in transfer %s for %s", transfer_id, move_in_id)
            return {"status": "ok", "refund": True, "move_in": True, "transfer_reversed": False}
    return {"status": "ok", "refund": True, "move_in": True}


# ---------------------------------------------------------------------------
# Receipts
# ---------------------------------------------------------------------------


def _contact(sb, user_id: str) -> dict:
    rows = sb.table("profiles").select("id, email, name, preferred_name, phone, created_at").eq("id", user_id).execute().data or []
    p = rows[0] if rows else {}
    return {"name": _name(p), "email": p.get("email"), "phone": p.get("phone"), "member_since": (p.get("created_at") or "")[:10] or None}


def build_receipt(sb, row: dict, role: str) -> dict:
    """role: 'renter' (owner and property), 'owner' (renter), 'admin' (both
    sides and both confirmations). The same code is on all three."""
    t = sb.table("tenancies").select("*").eq("id", row["tenancy_id"]).execute().data[0]
    listing = fetch_listings(sb, [t["listing_id"]]).get(str(t["listing_id"])) or {}
    renter = _contact(sb, str(row["renter_id"]))
    owner = _contact(sb, str(row["owner_id"]))
    id_status = None
    try:
        v = sb.table("owner_verification").select("id_status").eq("user_id", str(row["owner_id"])).execute().data or []
        id_status = v[0].get("id_status") if v else None
    except Exception:
        pass
    property_ = {
        "title": listing.get("title"),
        "address": ", ".join(x for x in [listing.get("address"), listing.get("suburb"), str(listing.get("postcode") or "")] if x),
        "suburb": listing.get("suburb"),
        "postcode": listing.get("postcode"),
        "unit_label": listing.get("unit_label"),
    }
    payment = {
        "amount": row["amount_cents"] / 100,
        "weeks": row["weeks"],
        "weekly_rent": row["weekly_rent_cents"] / 100,
        "card_fee": (row.get("card_fee_cents") or 0) / 100,
        "to_owner": (row["amount_cents"] - (row.get("card_fee_cents") or 0)) / 100,
        "currency": "AUD",
        "paid_at": row.get("paid_at"),
        "reference": row.get("stripe_payment_intent"),
        "status": row["status"],
    }
    tenancy = {"start_date": t.get("start_date"), "end_date": t.get("end_date"), "rent_amount": t.get("rent_amount"), "rent_frequency": t.get("rent_frequency")}
    base = {"role": role, "receipt_code": row.get("receipt_code"), "issued_at": row.get("paid_at"), "payment": payment, "tenancy": tenancy, "property": property_}
    bond_note = "The bond is not paid through Migrent. Pay it to your state's bond authority, which holds it until the tenancy ends."
    if role == "renter":
        return {**base, "owner": {**owner, "id_checked": id_status == "approved"}, "bond_note": bond_note}
    if role == "owner":
        fee = {"status": row.get("fee_status"), "amount": (row.get("fee_cents") or 0) / 100 or None, "charged_at": row.get("fee_charged_at")}
        return {**base, "renter": renter, "fee": fee, "bond_note": "The bond is not paid through Migrent. Your renter pays it to the state's bond authority."}
    return {
        **base,
        "renter": renter,
        "owner": owner,
        "fee": {"status": row.get("fee_status"), "amount": (row.get("fee_cents") or 0) / 100 or None, "charged_at": row.get("fee_charged_at"), "reference": row.get("fee_payment_intent"), "error": row.get("fee_error")},
        "owner_confirmed_at": row.get("owner_confirmed_at"),
        "renter_confirmed_at": row.get("renter_confirmed_at"),
        "complete": bool(row["status"] == "paid" and row.get("owner_confirmed_at") and row.get("renter_confirmed_at")),
        "stripe": {"session": row.get("stripe_session_id"), "payment_intent": row.get("stripe_payment_intent")},
    }


@router.get("/tenancies/{tenancy_id}/receipt")
def get_receipt(tenancy_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    sb = get_supabase_admin()
    _t, viewer = _tenancy(sb, tenancy_id, actor)
    row = _current(sb, tenancy_id)
    if not row or row["status"] not in ("paid", "refunded"):
        raise HTTPException(status_code=404, detail="There is no receipt yet: the move-in payment hasn't been made.")
    return build_receipt(sb, row, viewer)


@router.get("/admin/move-ins")
def admin_move_ins(request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    try:
        rows = sb.table("move_in_payments").select("*").neq("status", "cancelled").order("created_at", desc=True).limit(200).execute().data or []
    except Exception:
        return {"move_ins": [], "enabled": enabled()}
    from hub_common import fetch_people

    people = fetch_people(sb, [r["renter_id"] for r in rows] + [r["owner_id"] for r in rows])
    return {
        "enabled": enabled(),
        "move_ins": [
            {**_state(r, "admin"), "tenancy_id": str(r["tenancy_id"]), "renter": people.get(str(r["renter_id"])), "owner": people.get(str(r["owner_id"])), "created_at": r.get("created_at")}
            for r in rows
        ],
    }


@router.get("/admin/move-ins/{move_in_id}")
def admin_move_in_receipt(move_in_id: str, request: Request, authorization: Optional[str] = Header(None)):
    actor = hub_actor(request, authorization)
    require_admin_panel(actor, request, authorization)
    sb = get_supabase_admin()
    rows = sb.table("move_in_payments").select("*").eq("id", move_in_id).execute().data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Move-in payment not found")
    return build_receipt(sb, rows[0], "admin")


def send_receipt_email(sb, row: dict, role: str) -> None:
    import html as _html

    from email_bookings import _button, _details_box, _email_layout, _send_email

    r = build_receipt(sb, row, role)
    esc = lambda v: _html.escape(str(v)) if v not in (None, "") else "-"  # noqa: E731
    pay = r["payment"]
    code_html = f"""<div style="margin:20px 0;padding:16px;border:2px dashed #3153D9;border-radius:12px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:#475467;text-transform:uppercase;letter-spacing:0.5px;">Security code</p>
      <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:4px;font-family:monospace;">{esc(r['receipt_code'])}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#475467;">The renter, the owner and Migrent have the same code. Check it matches when you meet.</p>
    </div>"""
    rows = [("Rent", f"AUD {pay['to_owner']:,.2f}"), ("Card fee (paid by the renter)", f"AUD {pay['card_fee']:,.2f}"), ("Total paid", f"AUD {pay['amount']:,.2f}"), ("For", f"{pay['weeks']} week{'s' if pay['weeks'] != 1 else ''} rent in advance"), ("Paid", esc((pay["paid_at"] or "")[:10])), ("Reference", esc(pay["reference"]))]
    if role == "renter":
        o = r["owner"]
        to = None
        subject = "Your move-in receipt"
        intro = f"Your rent in advance for {esc(r['property']['title'])} has gone to the owner."
        rows += [("Owner", esc(o["name"])), ("Owner email", esc(o["email"])), ("Owner phone", esc(o["phone"])), ("Address", esc(r["property"]["address"])), ("Move in", esc(r["tenancy"]["start_date"]))]
        to = _contact(sb, str(row["renter_id"]))["email"]
        extra = f"<p style=\"font-size:14px;color:#475467;\">{esc(r['bond_note'])}</p>"
    elif role == "owner":
        rn = r["renter"]
        subject = "Your renter's payment receipt"
        intro = f"Your renter's rent in advance for {esc(r['property']['title'])} was paid to your Stripe account."
        rows += [("Renter", esc(rn["name"])), ("Renter email", esc(rn["email"])), ("Renter phone", esc(rn["phone"])), ("You receive", f"AUD {pay['to_owner']:,.2f}"), ("Move in", esc(r["tenancy"]["start_date"]))]
        fee = r["fee"]
        if fee["status"] == "charged":
            rows.append(("Migrent fee", f"AUD {fee['amount']:,.2f} charged to your card"))
        elif fee["status"] == "failed":
            rows.append(("Migrent fee", "Not paid yet: update your card in Settings"))
        to = _contact(sb, str(row["owner_id"]))["email"]
        extra = ""
    else:
        subject = f"Move-in complete: {r['receipt_code']}"
        intro = "Both sides have confirmed: the owner received the payment and the renter has moved in."
        rows += [("Renter", f"{esc(r['renter']['name'])} ({esc(r['renter']['email'])})"), ("Owner", f"{esc(r['owner']['name'])} ({esc(r['owner']['email'])})"), ("Owner confirmed", esc((r["owner_confirmed_at"] or "")[:16])), ("Renter confirmed", esc((r["renter_confirmed_at"] or "")[:16])), ("Fee", esc(r["fee"]["status"]))]
        to = os.environ.get("SUPPORT_EMAIL") or os.environ.get("FOUNDER_EMAIL")
        extra = ""
    if not to:
        return
    content = f"""<h1 style="font-size:22px;line-height:30px;margin:0 0 12px;">{esc(subject)}</h1>
      <p style="font-size:16px;line-height:24px;margin:0;">{intro}</p>
      {code_html}{_details_box(rows)}{extra}
      {_button("Open the receipt", _hub(f"/tenancies/{row['tenancy_id']}/receipt" if role != "admin" else "/admin/move-ins"))}"""
    _send_email(to, subject, _email_layout(content, preview=f"Security code {r['receipt_code']}"), text=f"{subject}. Security code: {r['receipt_code']}.")
