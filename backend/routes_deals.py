import os
import stripe
from fastapi import APIRouter, HTTPException, Header, Request
from models import DealCreate, DealOut, DealStatus, SeekerFeeRequest
from db import get_supabase_admin
from auth_utils import get_current_user

router = APIRouter(prefix="/deals", tags=["deals"])

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

stripe.api_key = STRIPE_SECRET_KEY

OWNER_FEE_AUD = 9900  # AUD 99.00 in cents
SEEKER_FEE_AUD = 1900  # AUD 19.00 in cents

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://migrent.vercel.app")
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
    if str(user.id) != str(body.owner_id):
        raise HTTPException(status_code=403, detail="Only the owner can create a deal")
    # user_type lives in user_metadata, which the user can rewrite themselves.
    # It is a UI mode ("am I browsing as a seeker or a host"), not a privilege,
    # so this filters honest mistakes rather than attackers. The checks that
    # actually matter are the owner_id match above and, for listing creation,
    # check_owner_verified in routes_listings.py. Never add a privilege check
    # that reads user_metadata; use auth_utils.is_admin_user instead.
    if user_meta.get("user_type") != "owner":
        raise HTTPException(status_code=403, detail="Only owners can create deals")

    sb = get_supabase_admin()

    # Create the deal row
    deal_row = {
        "owner_id": body.owner_id,
        "seeker_id": body.seeker_id,
        "listing_id": body.listing_id,
        "status": DealStatus.awaiting_owner_payment.value,
        "owner_fee_amount": 99.00,
        "seeker_fee_amount": 19.00,
    }

    # Add deal customization fields if provided
    if body.start_date:
        deal_row["start_date"] = body.start_date
    if body.end_date:
        deal_row["end_date"] = body.end_date
    if body.special_requests:
        deal_row["special_requests"] = body.special_requests
    if body.total_guests is not None:
        deal_row["total_guests"] = body.total_guests
    # Extended deal fields
    if body.move_in_date:
        deal_row["move_in_date"] = body.move_in_date
    if body.move_out_date:
        deal_row["move_out_date"] = body.move_out_date
    if body.number_of_guests is not None:
        deal_row["number_of_guests"] = body.number_of_guests
    if body.guest_names:
        deal_row["guest_names"] = body.guest_names
    if body.deal_notes:
        deal_row["deal_notes"] = body.deal_notes
    try:
        res = sb.table("deals").insert(deal_row).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Operation failed")

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
        raise HTTPException(status_code=500, detail="Payment processing failed")

    # Store the Stripe session ID on the deal
    try:
        sb.table("deals").update(
            {"owner_payment_stripe_session_id": session.id}
        ).eq("id", deal_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Operation failed")

    return {"deal_id": deal_id, "checkout_url": session.url}


# ── POST /deals/seeker-fee-session ───────────────────────────


@router.post("/seeker-fee-session")
def create_seeker_fee_session(
    body: SeekerFeeRequest,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    sb = get_supabase_admin()

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
        raise HTTPException(status_code=500, detail="Payment processing failed")

    # Store the seeker session ID on the deal
    try:
        sb.table("deals").update(
            {"seeker_payment_stripe_session_id": session.id}
        ).eq("id", deal["id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Operation failed")

    return {"deal_id": deal["id"], "checkout_url": session.url}


# ── GET /deals/{deal_id} ─────────────────────────────────────


@router.get("/{deal_id}")
def get_deal(
    deal_id: str,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    sb = get_supabase_admin()

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
    sb = get_supabase_admin()

    res = sb.table("deals").select("*").eq("id", deal_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal = res.data[0]

    if user.id not in (deal["owner_id"], deal["seeker_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this deal")

    if deal["status"] == DealStatus.cancelled.value:
        raise HTTPException(status_code=400, detail="Deal is already cancelled")

    # Bypass detection: flag if cancelling after owner already paid
    flagged = False
    if deal["status"] in (
        DealStatus.owner_paid.value,
        DealStatus.awaiting_seeker_optional.value,
        DealStatus.completed.value,
    ):
        flagged = True
        try:
            sb.table("bypass_flags").insert({
                "deal_id": deal_id,
                "flagged_user_id": user.id,
                "reason": f"Deal cancelled after status={deal['status']}",
                "owner_id": deal["owner_id"],
                "seeker_id": deal["seeker_id"],
            }).execute()
        except Exception:
            pass  # bypass_flags table may not exist yet

    try:
        sb.table("deals").update(
            {"status": DealStatus.cancelled.value}
        ).eq("id", deal_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Operation failed")

    return {"deal_id": deal_id, "status": DealStatus.cancelled.value, "flagged": flagged}


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

        # ── Booking payment branch ─────────────────────────────
        if metadata.get("fee_type") == "booking":
            booking_id = metadata.get("booking_id")
            if not booking_id:
                return {"status": "ignored"}

            sb = get_supabase_admin()
            try:
                sb.table("bookings").update(
                    {"status": "PAID"}
                ).eq("id", booking_id).execute()
            except Exception as e:
                raise HTTPException(status_code=500, detail="Operation failed")

            # Send confirmation emails
            try:
                from email_bookings import send_booking_confirmed_to_both
                booking_res = sb.table("bookings").select("*").eq("id", booking_id).execute()
                if booking_res.data:
                    bk = booking_res.data[0]
                    listing_res = sb.table("listings").select("title, address").eq("id", bk["listing_id"]).execute()
                    listing_title = "Listing"
                    if listing_res.data:
                        listing_title = listing_res.data[0].get("title") or listing_res.data[0].get("address", "Listing")

                    owner_profile = sb.table("profiles").select("name").eq("id", bk["owner_id"]).execute()
                    seeker_profile = sb.table("profiles").select("name").eq("id", bk["seeker_id"]).execute()

                    owner_user = sb.auth.admin.get_user_by_id(bk["owner_id"])
                    seeker_user = sb.auth.admin.get_user_by_id(bk["seeker_id"])

                    send_booking_confirmed_to_both(
                        owner_email=owner_user.user.email if owner_user and owner_user.user else "",
                        owner_name=owner_profile.data[0]["name"] if owner_profile.data else "Owner",
                        seeker_email=seeker_user.user.email if seeker_user and seeker_user.user else "",
                        seeker_name=seeker_profile.data[0]["name"] if seeker_profile.data else "Seeker",
                        listing_title=listing_title,
                        check_in=bk["check_in_date"],
                        check_out=bk["check_out_date"],
                        booking_id=booking_id,
                    )
            except Exception:
                pass

            try:
                sb.table("payment_events").insert({
                    "deal_id": None,
                    "fee_type": "booking",
                    "stripe_session_id": session["id"],
                    "amount": session.get("amount_total", OWNER_FEE_AUD + SEEKER_FEE_AUD),
                    "currency": "aud",
                    "event_type": "checkout.session.completed",
                }).execute()
            except Exception:
                pass

            return {"status": "ok", "booking": True}

        # ── Verification payment branch ────────────────────────
        if metadata.get("purpose") == "verification":
            verification_user_id = metadata.get("user_id")
            if not verification_user_id:
                return {"status": "ignored"}

            sb = get_supabase_admin()

            # Ensure profile row exists, then set verified = true
            existing = sb.table("profiles").select("id").eq("id", verification_user_id).execute()
            if not existing.data:
                try:
                    sb.table("profiles").insert({"id": verification_user_id, "verified": True}).execute()
                except Exception:
                    pass
            else:
                try:
                    sb.table("profiles").update({"verified": True}).eq("id", verification_user_id).execute()
                except Exception as e:
                    raise HTTPException(status_code=500, detail="Operation failed")

            # Optional: log to payment_events
            try:
                sb.table("payment_events").insert({
                    "deal_id": None,
                    "fee_type": "verification",
                    "stripe_session_id": session["id"],
                    "amount": session.get("amount_total", 1900),
                    "currency": "aud",
                    "event_type": "checkout.session.completed",
                }).execute()
            except Exception:
                pass  # payment_events table may not exist yet

            return {"status": "ok", "verification": True}

        # ── Deal payment branches ──────────────────────────────
        deal_id = metadata.get("deal_id")
        fee_type = metadata.get("fee_type")

        if not deal_id or not fee_type:
            # Not a MigRent session; ignore
            return {"status": "ignored"}

        sb = get_supabase_admin()

        if fee_type == "owner":
            # Owner fee paid → mark deal as owner_paid
            try:
                sb.table("deals").update(
                    {"status": DealStatus.owner_paid.value}
                ).eq("id", deal_id).execute()
            except Exception as e:
                raise HTTPException(status_code=500, detail="Operation failed")

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
                raise HTTPException(status_code=500, detail="Operation failed")

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
