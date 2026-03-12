"""
Email notifications for the booking flow.

Uses Resend for transactional emails. All functions are fire-and-forget
- callers should wrap in try/except so email failures never block bookings.
"""

import os
import logging

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "MigRent <noreply@migrent.au>")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


def _send_email(to: str, subject: str, text: str):
    """Send a plain-text email via Resend."""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set - skipping email to %s", to)
        return

    try:
        import resend
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "text": text,
        })
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, e)


def send_booking_request_to_owner(
    owner_email: str,
    owner_name: str,
    seeker_name: str,
    listing_title: str,
    check_in: str,
    check_out: str,
    guests: int,
    total_price: float,
    booking_id: str,
):
    subject = f"New booking request for {listing_title}"
    text = (
        f"Hi {owner_name},\n\n"
        f"{seeker_name} has requested to book your listing: {listing_title}\n\n"
        f"Dates: {check_in} to {check_out}\n"
        f"Guests: {guests}\n"
        f"Estimated rent: AUD ${total_price:,.2f}\n\n"
        f"Please log in to accept or decline this request:\n"
        f"{FRONTEND_URL}/dashboard/owner\n\n"
        f"You have 48 hours to respond before the request expires.\n\n"
        f"- The MigRent Team"
    )
    _send_email(owner_email, subject, text)


def send_booking_accepted_to_seeker(
    seeker_email: str,
    seeker_name: str,
    listing_title: str,
    checkout_url: str,
    booking_id: str,
):
    subject = f"Your booking request for {listing_title} was accepted!"
    text = (
        f"Hi {seeker_name},\n\n"
        f"Great news! The owner has accepted your booking request for: {listing_title}\n\n"
        f"Complete your payment to confirm the booking:\n"
        f"{checkout_url}\n\n"
        f"The total includes:\n"
        f"- Owner service fee: AUD $99.00\n"
        f"- Seeker service fee: AUD $19.00\n\n"
        f"Once payment is complete, your booking is confirmed and you can start planning your move.\n\n"
        f"- The MigRent Team"
    )
    _send_email(seeker_email, subject, text)


def send_booking_declined_to_seeker(
    seeker_email: str,
    seeker_name: str,
    listing_title: str,
):
    subject = f"Update on your booking request for {listing_title}"
    text = (
        f"Hi {seeker_name},\n\n"
        f"Unfortunately, the owner has declined your booking request for: {listing_title}\n\n"
        f"Don't worry - there are plenty of other great listings on MigRent.\n"
        f"Browse more listings: {FRONTEND_URL}/seeker/search\n\n"
        f"- The MigRent Team"
    )
    _send_email(seeker_email, subject, text)


def send_booking_confirmed_to_both(
    owner_email: str,
    owner_name: str,
    seeker_email: str,
    seeker_name: str,
    listing_title: str,
    check_in: str,
    check_out: str,
    booking_id: str,
):
    # Email to owner
    owner_subject = f"Booking confirmed - {listing_title}"
    owner_text = (
        f"Hi {owner_name},\n\n"
        f"Payment is complete! The booking for {listing_title} is now confirmed.\n\n"
        f"Seeker: {seeker_name}\n"
        f"Dates: {check_in} to {check_out}\n\n"
        f"You can message {seeker_name} to coordinate move-in details:\n"
        f"{FRONTEND_URL}/dashboard/owner\n\n"
        f"- The MigRent Team"
    )
    _send_email(owner_email, owner_subject, owner_text)

    # Email to seeker
    seeker_subject = f"Booking confirmed - {listing_title}"
    seeker_text = (
        f"Hi {seeker_name},\n\n"
        f"Your booking for {listing_title} is confirmed!\n\n"
        f"Check-in: {check_in}\n"
        f"Check-out: {check_out}\n\n"
        f"Next steps:\n"
        f"1. Message the owner to coordinate move-in details\n"
        f"2. Prepare your documents (ID, visa if applicable)\n"
        f"3. Arrive on your check-in date\n\n"
        f"View your booking: {FRONTEND_URL}/dashboard/seeker\n\n"
        f"Welcome to your new home!\n\n"
        f"- The MigRent Team"
    )
    _send_email(seeker_email, seeker_subject, seeker_text)
