import os
import stripe
from fastapi import APIRouter, HTTPException, Header, Request
from models import DealCreate, DealOut, DealStatus, SeekerFeeRequest
from db import get_supabase
from routes_listings import get_current_user

router = APIRouter(prefix="/deals", tags=["deals"])

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

stripe.api_key = STRIPE_SECRET_KEY

OWNER_FEE_AUD = 9900  # AUD 99.00 in cents
SEEKER_FEE_AUD = 1900  # AUD 19.00 in cents

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
SUCCESS_URL = f"{FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
CANCEL_URL = f"{FRONTEND_URL}/payment-cancelled"


# ── POST /deals/create ───────────────────────────────────────


@router.post("/create")
def create_deal(
    body: DealCreate,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_meta = user.user_metadata or {}

    # Only the owner (or at minimum, the owner_id must match the caller)
    if user.id != body.owner_id:
        raise HTTPException(status_code=403, detail="Only the owner can create a deal")
    if user_meta.get("user_type") != "owner":
        raise HTTPException(status_code=403, detail="Only owners can create deals")

    sb = get_supabase()

    # Create the deal row
    deal_row = {
        "owner_id": body.owner_id,
        "seeker_id": body.seeker_id,
        "listing_id": body.listing_id,
        "status": DealStatus.awaiting_owner_payment.value,
        "owner_fee_amount": 99.00,
        "seeker_fee_amount": 19.00,
    }
    try:
        res = sb.table("deals").insert(deal_row).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    deal = res.data[0]
    deal_id = deal["id"]

    # Create Stripe Checkout Session for owner fee
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            currency="aud",
            line_items=[
                {
                    "price_data": {
                        "currency": "aud",
                        "unit_amount": OWNER_FEE_AUD,
                        "product_data": {
                            "name": "MigRent Owner Fee",
                        },
                    },
                    "quantity": 1,
                }
            ],
            metadata={
                "deal_id": deal_id,
                "fee_type": "owner",
            },
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {e}")

    # Store the Stripe session ID on the deal
    try:
        sb.table("deals").update(
            {"owner_payment_stripe_session_id": session.id}
        ).eq("id", deal_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"deal_id": deal_id, "checkout_url": session.url}


# ── POST /deals/seeker-fee-session ───────────────────────────


@router.post("/seeker-fee-session")
def create_seeker_fee_session(
    body: SeekerFeeRequest,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    sb = get_supabase()

    # Fetch the deal
    res = sb.table("deals").select("*").eq("id", body.deal_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal = res.data[0]

    # Only the seeker on this deal can request
    if user.id != deal["seeker_id"]:
        raise HTTPException(status_code=403, detail="Only the seeker on this deal can request a seeker fee session")

    # Owner must have already paid
    if deal["status"] not in (DealStatus.owner_paid.value, DealStatus.awaiting_seeker_optional.value):
        raise HTTPException(status_code=400, detail="Owner fee must be paid before seeker fee session can be created")

    # Don't allow if already completed
    if deal["status"] == DealStatus.completed.value:
        raise HTTPException(status_code=400, detail="Deal is already completed")

    # Create Stripe Checkout Session for seeker fee
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            currency="aud",
            line_items=[
                {
                    "price_data": {
                        "currency": "aud",
                        "unit_amount": SEEKER_FEE_AUD,
                        "product_data": {
                            "name": "MigRent Seeker Support Fee",
                        },
                    },
                    "quantity": 1,
                }
            ],
            metadata={
                "deal_id": deal["id"],
                "fee_type": "seeker",
            },
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {e}")

    # Store the seeker session ID on the deal
    try:
        sb.table("deals").update(
            {"seeker_payment_stripe_session_id": session.id}
        ).eq("id", deal["id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"deal_id": deal["id"], "checkout_url": session.url}


# ── GET /deals/{deal_id} ─────────────────────────────────────


@router.get("/{deal_id}")
def get_deal(
    deal_id: str,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    sb = get_supabase()

    res = sb.table("deals").select("*").eq("id", deal_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal = res.data[0]

    # Only owner or seeker on this deal can view
    if user.id not in (deal["owner_id"], deal["seeker_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this deal")

    return deal


# ── PATCH /deals/{deal_id}/cancel ─────────────────────────────


@router.patch("/{deal_id}/cancel")
def cancel_deal(
    deal_id: str,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    sb = get_supabase()

    res = sb.table("deals").select("*").eq("id", deal_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal = res.data[0]

    if user.id not in (deal["owner_id"], deal["seeker_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this deal")

    if deal["status"] == DealStatus.cancelled.value:
        raise HTTPException(status_code=400, detail="Deal is already cancelled")

    try:
        sb.table("deals").update(
            {"status": DealStatus.cancelled.value}
        ).eq("id", deal_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"deal_id": deal_id, "status": DealStatus.cancelled.value}


# ── POST /webhooks/stripe ────────────────────────────────────
# This is a separate router so we can mount it without the /deals prefix.

webhook_router = APIRouter(tags=["webhooks"])


@webhook_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        deal_id = metadata.get("deal_id")
        fee_type = metadata.get("fee_type")

        if not deal_id or not fee_type:
            # Not a MigRent session; ignore
            return {"status": "ignored"}

        sb = get_supabase()

        if fee_type == "owner":
            # Owner fee paid → mark deal as owner_paid
            try:
                sb.table("deals").update(
                    {"status": DealStatus.owner_paid.value}
                ).eq("id", deal_id).execute()
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

            # Optionally log a payment event
            try:
                sb.table("payment_events").insert({
                    "deal_id": deal_id,
                    "fee_type": "owner",
                    "stripe_session_id": session["id"],
                    "amount": session.get("amount_total", OWNER_FEE_AUD),
                    "currency": "aud",
                    "event_type": "checkout.session.completed",
                }).execute()
            except Exception:
                pass  # payment_events table may not exist yet

        elif fee_type == "seeker":
            # Seeker fee paid → mark deal as completed
            try:
                sb.table("deals").update(
                    {"status": DealStatus.completed.value}
                ).eq("id", deal_id).execute()
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

            try:
                sb.table("payment_events").insert({
                    "deal_id": deal_id,
                    "fee_type": "seeker",
                    "stripe_session_id": session["id"],
                    "amount": session.get("amount_total", SEEKER_FEE_AUD),
                    "currency": "aud",
                    "event_type": "checkout.session.completed",
                }).execute()
            except Exception:
                pass

    return {"status": "ok"}
