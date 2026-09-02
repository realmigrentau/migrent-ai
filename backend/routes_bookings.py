import os
import math
import logging
import stripe
from datetime import datetime, date, timezone
from fastapi import APIRouter, HTTPException, Header, Request
from models import BookingCreate, BookingRespond, BookingStatus, BookingType
from db import get_supabase, get_supabase_admin
from auth_utils import get_current_user
from email_bookings import (
    send_booking_request_to_owner,
    send_booking_accepted_to_seeker,
    send_booking_declined_to_seeker,
    send_owner_fee_request,
    send_booking_confirmed_to_both,
)
from notifications import send_push_to_user
from notification_service import notify
from limiter import limiter
from payments import FEE_MODEL, HOST_LISTING_FEE_CENTS
from listing_lifecycle import STATUS_APPROVED
from public_dto import listing_public_state

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bookings", tags=["bookings"])

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
stripe.api_key = STRIPE_SECRET_KEY

OWNER_FEE_AUD = HOST_LISTING_FEE_CENTS  # AUD 99.00 in cents
# No seeker fee. Renters pay MigRent nothing, per the pricing page.
# The $19 that used to live here was billed to the seeker alongside the
# host's $99 in a single checkout session. See create_owner_fee_checkout.

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://migrent.vercel.app")
BOOKING_SUCCESS_URL = f"{FRONTEND_URL}/booking-success?session_id={{CHECKOUT_SESSION_ID}}"
BOOKING_CANCEL_URL = f"{FRONTEND_URL}/booking-cancelled"


def calculate_total_price(weekly_price: float, check_in: str, check_out: str) -> float:
    """Calculate total rent based on weekly price and date range."""
    d_in = date.fromisoformat(check_in)
    d_out = date.fromisoformat(check_out)
    days = (d_out - d_in).days
    weeks = max(1, math.ceil(days / 7))
    return round(weekly_price * weeks, 2)


def listing_fee_due(listing: dict) -> bool:
    """Under the published per-property model the host pays once per
    property; later bookings on the same listing confirm without a charge."""
    if FEE_MODEL == "per_booking":
        return True
    return not listing.get("listing_fee_paid_at")


def confirm_booking_without_charge(sb, booking_id: str) -> None:
    """Mark a booking PAID when no fee is owed (fee already settled for the
    property). Emits the same confirmation emails as the webhook path."""
    now = datetime.now(timezone.utc).isoformat()
    sb.table("bookings").update({"status": BookingStatus.paid.value, "paid_at": now, "fee_waived": True}).eq("id", booking_id).execute()
    try:
        booking = sb.table("bookings").select("*").eq("id", booking_id).execute().data[0]
        listing_res = sb.table("listings").select("title, address").eq("id", booking["listing_id"]).execute()
        listing_title = (listing_res.data[0].get("title") or listing_res.data[0].get("address", "Listing")) if listing_res.data else "Listing"
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
        logger.exception("Confirmation email failed for fee-waived booking %s", booking_id)


def create_owner_fee_checkout(booking_id: str) -> stripe.checkout.Session:
    """Create the Stripe checkout session that confirms a booking.

    The host pays this, and only this.

    Until the 2026-08-29 audit, one session carried BOTH the $99 host fee and a
    $19 seeker fee, and that session was handed to the seeker: returned to
    their browser on instant book, emailed to them on request-to-book. The
    renter was therefore charged $118 at a checkout the pricing page describes
    as "$0 forever. Renters never pay MigRent a service fee." The host, meanwhile,
    was never charged at all.

    Code now matches the published pricing: renters pay nothing, hosts pay a
    one-off $99 per property when they match with a tenant. If the intended
    model is ever that renters do pay, the pricing page, /for-seekers, the
    footer and three meta descriptions have to change first.
    """
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        currency="aud",
        line_items=[
            {
                "price_data": {
                    "currency": "aud",
                    "unit_amount": OWNER_FEE_AUD,
                    "product_data": {"name": "MigRent host listing fee"},
                },
                "quantity": 1,
            },
        ],
        metadata={
            "booking_id": booking_id,
            "fee_type": "booking",
            "payer": "owner",
        },
        success_url=BOOKING_SUCCESS_URL,
        cancel_url=BOOKING_CANCEL_URL,
    )
    return session


# -- POST /bookings - Create a booking request --


@router.post("")
@limiter.limit("20/hour")
def create_booking(
    request: Request,
    body: BookingCreate,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    # Fetch listing
    listing_res = sb.table("listings").select("*").eq("id", body.listing_id).execute()
    if not listing_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing = listing_res.data[0]
    owner_id = listing["owner_id"]

    # Only approved listings are bookable. Without this, a listing that
    # moderation had rejected, or had not looked at yet, could still be booked
    # and charged by anyone who had its id - search hid it, nothing blocked it.
    if listing_public_state(listing) != "published":
        raise HTTPException(status_code=404, detail="Listing not found")

    # Cannot book your own listing
    if user_id == owner_id:
        raise HTTPException(status_code=400, detail="You cannot book your own listing")

    # Validate dates
    try:
        check_in = date.fromisoformat(body.check_in)
        check_out = date.fromisoformat(body.check_out)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")

    if check_in < date.today():
        raise HTTPException(status_code=400, detail="Check-in date cannot be in the past")

    # Check min/max stay
    days = (check_out - check_in).days
    weeks = math.ceil(days / 7)

    min_stay = listing.get("min_stay_weeks") or 1
    max_stay = listing.get("max_stay_weeks") or 52
    if weeks < min_stay:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum stay is {min_stay} week{'s' if min_stay != 1 else ''}"
        )
    if weeks > max_stay:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum stay is {max_stay} weeks"
        )

    # Check guest limit
    max_guests = listing.get("max_guests") or 20
    if body.guests > max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {max_guests} guest{'s' if max_guests != 1 else ''} allowed"
        )

    # Respect the owner's stated availability window.
    available_from = listing.get("available_from")
    available_to = listing.get("available_to")
    if available_from and check_in < date.fromisoformat(str(available_from)):
        raise HTTPException(
            status_code=400,
            detail=f"This room is not available until {available_from}",
        )
    if available_to and check_out > date.fromisoformat(str(available_to)):
        raise HTTPException(
            status_code=400,
            detail=f"This room is only available until {available_to}",
        )

    # Reject dates that clash with a booking the owner has already accepted or
    # that has been paid for. Nothing checked this before, so two seekers could
    # both pay for the same room over the same nights.
    #
    # This is a courtesy check that produces a readable error. The actual
    # guarantee is the bookings_no_overlap exclusion constraint from migration
    # 039, which also covers two requests racing each other.
    clashes = (
        sb.table("bookings")
        .select("id, check_in_date, check_out_date")
        .eq("listing_id", body.listing_id)
        .in_("status", [BookingStatus.owner_accepted.value, BookingStatus.paid.value])
        .lt("check_in_date", body.check_out)
        .gt("check_out_date", body.check_in)
        .execute()
    )
    if clashes.data:
        raise HTTPException(
            status_code=409,
            detail="Those dates are already booked. Please choose different dates.",
        )

    weekly_price = float(listing["weekly_price"])
    total_price = calculate_total_price(weekly_price, body.check_in, body.check_out)

    # Determine booking type
    is_instant = bool(listing.get("instant_book_enabled") or listing.get("instant_book"))
    booking_type = BookingType.instant_book.value if is_instant else BookingType.request_to_book.value

    # For instant book, status goes straight to OWNER_ACCEPTED (auto-accept)
    status = BookingStatus.owner_accepted.value if is_instant else BookingStatus.pending_owner.value

    booking_row = {
        "listing_id": body.listing_id,
        "owner_id": owner_id,
        "seeker_id": user_id,
        "booking_type": booking_type,
        "status": status,
        "check_in_date": body.check_in,
        "check_out_date": body.check_out,
        "guests": body.guests,
        "weekly_price_at_time": weekly_price,
        "total_price": total_price,
        "message_to_owner": body.message_to_owner,
        # Persist the fees this booking was created under. These columns
        # were never written, so every row silently carried the table
        # defaults and would misreport if pricing ever changed.
        "owner_fee": OWNER_FEE_AUD / 100,
        "seeker_fee": 0,
    }

    try:
        res = sb.table("bookings").insert(booking_row).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create booking")

    booking = res.data[0]
    booking_id = booking["id"]

    result = {
        "booking": booking,
        "checkout_url": None,
    }

    if is_instant and not listing_fee_due(listing):
        # The host already paid the listing fee for this property, so the
        # booking confirms immediately with no charge to anyone.
        confirm_booking_without_charge(sb, booking_id)
        result["booking"]["status"] = BookingStatus.paid.value
        return result

    if is_instant:
        # Instant book: the room is held for the seeker straight away and the
        # host is invoiced their $99 to confirm. The seeker is never sent to
        # checkout - they owe MigRent nothing - so checkout_url stays None and
        # the frontend shows a confirmation instead of redirecting to Stripe.
        try:
            session = create_owner_fee_checkout(booking_id)
            sb.table("bookings").update(
                {"stripe_session_id": session.id}
            ).eq("id", booking_id).execute()
        except Exception:
            logger.exception("Failed to create host fee checkout for booking %s", booking_id)
            raise HTTPException(status_code=500, detail="Payment processing failed")

        try:
            owner_profile = sb.table("profiles").select("name").eq("id", owner_id).execute()
            seeker_profile = sb.table("profiles").select("name").eq("id", user_id).execute()
            owner_name = owner_profile.data[0]["name"] if owner_profile.data else "Owner"
            seeker_name = seeker_profile.data[0]["name"] if seeker_profile.data else "Seeker"

            owner_user = sb.auth.admin.get_user_by_id(owner_id)
            owner_email = owner_user.user.email if owner_user and owner_user.user else None

            if owner_email:
                send_owner_fee_request(
                    owner_email=owner_email,
                    owner_name=owner_name,
                    seeker_name=seeker_name,
                    listing_title=listing.get("title") or listing.get("address", "Your listing"),
                    checkout_url=session.url,
                    booking_id=booking_id,
                )
        except Exception:
            logger.exception("Failed to email host fee request for booking %s", booking_id)
    else:
        # Request to book: notify owner via email
        try:
            # Fetch owner profile for email
            owner_profile = sb.table("profiles").select("name").eq("id", owner_id).execute()
            seeker_profile = sb.table("profiles").select("name").eq("id", user_id).execute()
            owner_name = owner_profile.data[0]["name"] if owner_profile.data else "Owner"
            seeker_name = seeker_profile.data[0]["name"] if seeker_profile.data else "Seeker"

            owner_user = sb.auth.admin.get_user_by_id(owner_id)
            owner_email = owner_user.user.email if owner_user and owner_user.user else None

            if owner_email:
                send_booking_request_to_owner(
                    owner_email=owner_email,
                    owner_name=owner_name,
                    seeker_name=seeker_name,
                    listing_title=listing.get("title") or listing.get("address", "Your listing"),
                    check_in=body.check_in,
                    check_out=body.check_out,
                    guests=body.guests,
                    total_price=total_price,
                    booking_id=booking_id,
                )
        except Exception:
            pass  # Email failure should not block booking creation

        # Push notification to owner
        try:
            listing_title = listing.get("title") or listing.get("address", "your listing")
            send_push_to_user(
                user_id=owner_id,
                title=f"New booking request for {listing_title}",
                body=f"Someone wants to book your place!",
                url=f"{FRONTEND_URL}/dashboard/owner",
            )
        except Exception:
            pass

        # In-app notification for owner
        try:
            listing_title = listing.get("title") or listing.get("address", "your listing")
            notify(
                user_id=owner_id,
                event="booking_request_created",
                title=f"New booking request",
                body=f"{seeker_name} wants to book {listing_title}",
                cta_url="/dashboard/owner",
                entity_type="booking",
                entity_id=booking_id,
                recipient_email=owner_email,
                recipient_name=owner_name,
            )
        except Exception:
            pass

    return result


# -- GET /bookings/me - Get user's bookings --


@router.get("/me")
def get_my_bookings(
    role: str = "seeker",
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    if role == "owner":
        res = sb.table("bookings").select("*").eq("owner_id", user_id).order("created_at", desc=True).execute()
    else:
        res = sb.table("bookings").select("*").eq("seeker_id", user_id).order("created_at", desc=True).execute()

    bookings = res.data or []

    # Enrich with listing and counterparty data.
    #
    # This used to issue two queries per booking inside the loop, so twenty
    # bookings meant forty-one round trips to Supabase and a page that got
    # slower the more successful a host became. Two batched lookups instead,
    # regardless of how many bookings there are.
    if bookings:
        listing_ids = list({b["listing_id"] for b in bookings if b.get("listing_id")})
        other_key = "seeker_id" if role == "owner" else "owner_id"
        other_ids = list({b[other_key] for b in bookings if b.get(other_key)})

        listings_by_id = {}
        if listing_ids:
            lr = (
                sb.table("listings")
                .select("id, title, address, city, weekly_price, images")
                .in_("id", listing_ids)
                .execute()
            )
            listings_by_id = {row["id"]: row for row in (lr.data or [])}

        profiles_by_id = {}
        if other_ids:
            pr = (
                sb.table("profiles")
                .select("id, name, custom_pfp, verified")
                .in_("id", other_ids)
                .execute()
            )
            profiles_by_id = {row["id"]: row for row in (pr.data or [])}

        for booking in bookings:
            listing = listings_by_id.get(booking.get("listing_id"))
            if listing:
                booking["listing"] = listing
            other = profiles_by_id.get(booking.get(other_key))
            if other:
                booking["other_party"] = other

    return {"bookings": bookings}


# -- POST /bookings/{id}/respond - Owner accept/decline --


@router.post("/{booking_id}/respond")
def respond_to_booking(
    booking_id: str,
    body: BookingRespond,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    # Fetch booking
    res = sb.table("bookings").select("*").eq("id", booking_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = res.data[0]

    # Only the owner can respond
    if user_id != booking["owner_id"]:
        raise HTTPException(status_code=403, detail="Only the listing owner can respond")

    # Must be in PENDING_OWNER status
    if booking["status"] != BookingStatus.pending_owner.value:
        raise HTTPException(status_code=400, detail="This booking is not awaiting a response")

    if body.action == "accept":
        listing_row = sb.table("listings").select("id, listing_fee_paid_at, title, address").eq("id", booking["listing_id"]).execute()
        listing_info = listing_row.data[0] if listing_row.data else {}
        if not listing_fee_due(listing_info):
            sb.table("bookings").update({"status": BookingStatus.owner_accepted.value}).eq("id", booking_id).execute()
            confirm_booking_without_charge(sb, booking_id)
            return {"booking_id": booking_id, "status": BookingStatus.paid.value, "checkout_url": None, "fee_waived": True}

        # The host pays the $99 to confirm, so the checkout URL goes back to
        # the host - who is the caller here - and never to the seeker.
        try:
            session = create_owner_fee_checkout(booking_id)
        except Exception:
            logger.exception("Failed to create host fee checkout for booking %s", booking_id)
            raise HTTPException(status_code=500, detail="Payment processing failed")

        sb.table("bookings").update({
            "status": BookingStatus.owner_accepted.value,
            "stripe_session_id": session.id,
        }).eq("id", booking_id).execute()

        seeker_email = None
        seeker_name = "Seeker"
        listing_title = "Listing"

        # Tell the seeker they were approved. No payment link: renters owe
        # MigRent nothing, and this email used to carry a $118 Stripe checkout.
        try:
            seeker_id = booking["seeker_id"]
            seeker_user = sb.auth.admin.get_user_by_id(seeker_id)
            seeker_email = seeker_user.user.email if seeker_user and seeker_user.user else None
            seeker_profile = sb.table("profiles").select("name").eq("id", seeker_id).execute()
            seeker_name = seeker_profile.data[0]["name"] if seeker_profile.data else "Seeker"

            listing_res = sb.table("listings").select("title, address").eq("id", booking["listing_id"]).execute()
            listing_title = listing_res.data[0].get("title") or listing_res.data[0].get("address", "Listing") if listing_res.data else "Listing"

            if seeker_email:
                send_booking_accepted_to_seeker(
                    seeker_email=seeker_email,
                    seeker_name=seeker_name,
                    listing_title=listing_title,
                    booking_id=booking_id,
                )
        except Exception:
            logger.exception("Failed to email booking approval for booking %s", booking_id)

        # Email the host their own payment link as well, so accepting from a
        # phone and paying later on a laptop still works.
        try:
            owner_user = sb.auth.admin.get_user_by_id(booking["owner_id"])
            owner_email = owner_user.user.email if owner_user and owner_user.user else None
            owner_profile = sb.table("profiles").select("name").eq("id", booking["owner_id"]).execute()
            owner_name = owner_profile.data[0]["name"] if owner_profile.data else "Owner"

            if owner_email:
                send_owner_fee_request(
                    owner_email=owner_email,
                    owner_name=owner_name,
                    seeker_name=seeker_name,
                    listing_title=listing_title,
                    checkout_url=session.url,
                    booking_id=booking_id,
                )
        except Exception:
            logger.exception("Failed to email host fee request for booking %s", booking_id)

        # Push notification to seeker
        try:
            send_push_to_user(
                user_id=booking["seeker_id"],
                title="Booking approved!",
                body=f"Your booking for {listing_title} has been accepted.",
                url=f"{FRONTEND_URL}/dashboard/seeker",
            )
        except Exception:
            logger.exception("Failed to push booking approval for booking %s", booking_id)

        # In-app notification for seeker
        try:
            notify(
                user_id=booking["seeker_id"],
                event="booking_approved",
                title="Booking approved!",
                body=f"Your booking for {listing_title} has been accepted.",
                cta_url="/dashboard/seeker",
                entity_type="booking",
                entity_id=booking_id,
                recipient_email=seeker_email,
                recipient_name=seeker_name,
            )
        except Exception:
            logger.exception("Failed to notify booking approval for booking %s", booking_id)

        return {
            "booking_id": booking_id,
            "status": BookingStatus.owner_accepted.value,
            "checkout_url": session.url,
        }

    elif body.action == "decline":
        sb.table("bookings").update({
            "status": BookingStatus.owner_declined.value,
        }).eq("id", booking_id).execute()

        # Email seeker
        try:
            seeker_id = booking["seeker_id"]
            seeker_user = sb.auth.admin.get_user_by_id(seeker_id)
            seeker_email = seeker_user.user.email if seeker_user and seeker_user.user else None
            seeker_profile = sb.table("profiles").select("name").eq("id", seeker_id).execute()
            seeker_name = seeker_profile.data[0]["name"] if seeker_profile.data else "Seeker"

            listing_res = sb.table("listings").select("title, address").eq("id", booking["listing_id"]).execute()
            listing_title = listing_res.data[0].get("title") or listing_res.data[0].get("address", "Listing") if listing_res.data else "Listing"

            if seeker_email:
                send_booking_declined_to_seeker(
                    seeker_email=seeker_email,
                    seeker_name=seeker_name,
                    listing_title=listing_title,
                )
        except Exception:
            pass

        # In-app notification for seeker
        try:
            notify(
                user_id=booking["seeker_id"],
                event="booking_declined",
                title="Booking not approved",
                body=f"Your booking request for {listing_title} was declined.",
                cta_url="/seeker/search",
                entity_type="booking",
                entity_id=booking_id,
            )
        except Exception:
            pass

        return {
            "booking_id": booking_id,
            "status": BookingStatus.owner_declined.value,
        }


# -- POST /bookings/{id}/cancel - Seeker cancel --


@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: str,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    res = sb.table("bookings").select("*").eq("id", booking_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = res.data[0]

    if user_id != booking["seeker_id"]:
        raise HTTPException(status_code=403, detail="Only the seeker can cancel")

    cancellable = [BookingStatus.pending_owner.value, BookingStatus.owner_accepted.value]
    if booking["status"] not in cancellable:
        raise HTTPException(status_code=400, detail="This booking cannot be cancelled")

    sb.table("bookings").update({
        "status": BookingStatus.seeker_cancelled.value,
    }).eq("id", booking_id).execute()

    return {"booking_id": booking_id, "status": BookingStatus.seeker_cancelled.value}


# -- GET /bookings/checkout-status - What the webhook has confirmed --


@router.get("/checkout-status")
@limiter.limit("60/minute")
def checkout_status(
    request: Request,
    session_id: str,
    authorization: str = Header(...),
):
    """The booking-success page calls this instead of trusting the redirect.

    Only the host who owns the booking (the payer) may look it up, and the
    answer is whatever the Stripe webhook has written: nothing here marks a
    booking paid.
    """
    user = get_current_user(authorization)
    user_id = str(user.id)
    if not session_id or not session_id.startswith("cs_") or len(session_id) > 128:
        raise HTTPException(status_code=400, detail="Invalid session id")
    sb = get_supabase_admin()
    res = sb.table("bookings").select("id, owner_id, seeker_id, status, paid_at, listing_id").eq("stripe_session_id", session_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="No booking for that checkout session")
    booking = res.data[0]
    if user_id not in (str(booking["owner_id"]), str(booking["seeker_id"])):
        raise HTTPException(status_code=403, detail="Not your booking")
    return {
        "booking_id": booking["id"],
        "status": booking["status"],
        "paid": booking["status"] == BookingStatus.paid.value,
        "paid_at": booking.get("paid_at"),
    }


# -- GET /bookings/{id} - Get single booking --


@router.get("/{booking_id}")
def get_booking(
    booking_id: str,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    res = sb.table("bookings").select("*").eq("id", booking_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = res.data[0]

    if user_id not in (booking["owner_id"], booking["seeker_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")

    return booking
