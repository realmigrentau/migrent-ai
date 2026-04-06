import os
import math
import stripe
from datetime import datetime, date
from fastapi import APIRouter, HTTPException, Header
from models import BookingCreate, BookingRespond, BookingStatus, BookingType
from db import get_supabase, get_supabase_admin
from auth_utils import get_current_user
from email_bookings import (
    send_booking_request_to_owner,
    send_booking_accepted_to_seeker,
    send_booking_declined_to_seeker,
    send_booking_confirmed_to_both,
)
from notifications import send_push_to_user
from notification_service import notify

router = APIRouter(prefix="/bookings", tags=["bookings"])

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
stripe.api_key = STRIPE_SECRET_KEY

OWNER_FEE_AUD = 9900  # AUD 99.00 in cents
SEEKER_FEE_AUD = 1900  # AUD 19.00 in cents

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
BOOKING_SUCCESS_URL = f"{FRONTEND_URL}/booking-success?session_id={{CHECKOUT_SESSION_ID}}"
BOOKING_CANCEL_URL = f"{FRONTEND_URL}/booking-cancelled"


def calculate_total_price(weekly_price: float, check_in: str, check_out: str) -> float:
    """Calculate total rent based on weekly price and date range."""
    d_in = date.fromisoformat(check_in)
    d_out = date.fromisoformat(check_out)
    days = (d_out - d_in).days
    weeks = max(1, math.ceil(days / 7))
    return round(weekly_price * weeks, 2)


def create_booking_checkout(booking_id: str, booking_type: str) -> stripe.checkout.Session:
    """Create Stripe checkout session for a confirmed booking."""
    line_items = [
        {
            "price_data": {
                "currency": "aud",
                "unit_amount": OWNER_FEE_AUD,
                "product_data": {"name": "MigRent Owner Service Fee"},
            },
            "quantity": 1,
        },
        {
            "price_data": {
                "currency": "aud",
                "unit_amount": SEEKER_FEE_AUD,
                "product_data": {"name": "MigRent Seeker Service Fee"},
            },
            "quantity": 1,
        },
    ]

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        currency="aud",
        line_items=line_items,
        metadata={
            "booking_id": booking_id,
            "fee_type": "booking",
        },
        success_url=BOOKING_SUCCESS_URL,
        cancel_url=BOOKING_CANCEL_URL,
    )
    return session


# -- POST /bookings - Create a booking request --


@router.post("")
def create_booking(
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

    if is_instant:
        # Instant book: create Stripe checkout immediately
        try:
            session = create_booking_checkout(booking_id, booking_type)
            sb.table("bookings").update(
                {"stripe_session_id": session.id}
            ).eq("id", booking_id).execute()
            result["checkout_url"] = session.url
        except Exception as e:
            raise HTTPException(status_code=500, detail="Payment processing failed")
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

    # Enrich with listing and profile data
    for booking in bookings:
        # Get listing info
        listing_res = sb.table("listings").select("title, address, city, weekly_price, images").eq("id", booking["listing_id"]).execute()
        if listing_res.data:
            booking["listing"] = listing_res.data[0]

        # Get other party's profile
        other_id = booking["seeker_id"] if role == "owner" else booking["owner_id"]
        profile_res = sb.table("profiles").select("name, custom_pfp, verified").eq("id", other_id).execute()
        if profile_res.data:
            booking["other_party"] = profile_res.data[0]

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
        # Create Stripe checkout session
        try:
            session = create_booking_checkout(booking_id, booking["booking_type"])
        except Exception:
            raise HTTPException(status_code=500, detail="Payment processing failed")

        sb.table("bookings").update({
            "status": BookingStatus.owner_accepted.value,
            "stripe_session_id": session.id,
        }).eq("id", booking_id).execute()

        # Email seeker with payment link
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
                    checkout_url=session.url,
                    booking_id=booking_id,
                )
        except Exception:
            pass

        # Push notification to seeker
        try:
            send_push_to_user(
                user_id=booking["seeker_id"],
                title="Booking approved!",
                body=f"Your booking for {listing_title} has been accepted. Complete payment to confirm.",
                url=f"{FRONTEND_URL}/dashboard/seeker",
            )
        except Exception:
            pass

        # In-app notification for seeker
        try:
            notify(
                user_id=booking["seeker_id"],
                event="booking_approved",
                title="Booking approved!",
                body=f"Your booking for {listing_title} has been accepted. Complete payment to confirm.",
                cta_url="/dashboard/seeker",
                entity_type="booking",
                entity_id=booking_id,
                recipient_email=seeker_email,
                recipient_name=seeker_name,
            )
        except Exception:
            pass

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
