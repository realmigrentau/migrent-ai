"""
Migrent's emails: the sender (Gmail relay, Gmail SMTP or Mailjet) and the
booking, listing, support and welcome emails, drawn with email_theme.py.
Sending never raises, so a failed email never blocks the action behind it.
"""

import os
import logging
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

MAILJET_API_KEY = os.environ.get("MAILJET_API_KEY", "")
MAILJET_SECRET_KEY = os.environ.get("MAILJET_SECRET_KEY", "")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "migrentau@gmail.com")
FROM_NAME = os.environ.get("FROM_NAME", "Migrent")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://migrent.vercel.app")

# Colours and layout live in email_theme.py.


def _hub_url(path: str) -> str:
    """Absolute link to a Migrent Hub page. The old /dashboard, /owner and
    /account pages only redirect into the Hub after a sign-in bounce, and
    /support never existed (MIGRENT_MASTER_AUDIT MIG-030)."""
    base = os.environ.get("HUB_BASE_URL", "").rstrip("/") or f"{FRONTEND_URL}/hub"
    return f"{base}{path}"


def _email_layout(content: str, preview: str = "") -> str:
    """Older hand-written content in the shared design (email_theme.py).
    Every current email uses email_theme.render directly."""
    from email_theme import render_raw

    return render_raw("account", content, preheader=preview)


# Sending through Gmail itself (owner decision, 3 October 2026). Since
# Gmail's 2024 sender rules, a service sending "from" a @gmail.com address
# lands in spam or is refused; Gmail's own SMTP server, signed in with an
# app password, sends genuinely from migrentau@gmail.com (about 500 a day).
# When SMTP_HOST is set it is used; otherwise Mailjet, as before.
SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465") or 465)
SMTP_USER = os.environ.get("SMTP_USER", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").replace(" ", "")  # Google shows app passwords in groups of four
REPLY_TO = os.environ.get("REPLY_TO_EMAIL", "").strip()
# Render's free plan cannot reach mail servers at all (outbound SMTP is
# blocked), so the free way is a Google Apps Script web app running inside
# the Gmail account (backend/gmail_relay/Code.gs): the server posts each
# email to it over HTTPS and Gmail sends it, about 100 a day. Used first
# when set.
GMAIL_RELAY_URL = os.environ.get("GMAIL_RELAY_URL", "").strip()
GMAIL_RELAY_SECRET = os.environ.get("GMAIL_RELAY_SECRET", "").strip()


def _send_relay(to: str, subject: str, html_body: str, text: str = "") -> None:
    r = httpx.post(
        GMAIL_RELAY_URL,
        json={"secret": GMAIL_RELAY_SECRET, "to": to, "subject": subject, "html": html_body, "text": text or " ", "name": FROM_NAME, "replyTo": REPLY_TO or None},
        timeout=30,
        # Apps Script answers on a second address it redirects to.
        follow_redirects=True,
    )
    r.raise_for_status()
    try:
        data = r.json()
    except ValueError:
        raise RuntimeError(f"relay answered with something other than JSON (status {r.status_code})")
    if not data.get("ok"):
        raise RuntimeError(f"relay refused: {data.get('error')}")


def _send_smtp(to: str, subject: str, html_body: str, text: str = "", headers: Optional[dict] = None) -> None:
    import smtplib
    import ssl
    from email.message import EmailMessage
    from email.utils import formataddr, make_msgid

    msg = EmailMessage()
    msg["From"] = formataddr((FROM_NAME, SMTP_USER or FROM_EMAIL))
    msg["To"] = to
    msg["Subject"] = subject
    msg["Message-ID"] = make_msgid(domain=(SMTP_USER or FROM_EMAIL).split("@")[-1])
    if REPLY_TO:
        msg["Reply-To"] = REPLY_TO
    for name, value in (headers or {}).items():
        msg[name] = value
    msg.set_content(text or "This email is best viewed in an email app that shows HTML.")
    msg.add_alternative(html_body, subtype="html")
    context = ssl.create_default_context()
    if SMTP_PORT == 465:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context, timeout=15) as s:
            s.login(SMTP_USER, SMTP_PASSWORD)
            s.send_message(msg)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as s:
            s.starttls(context=context)
            s.login(SMTP_USER, SMTP_PASSWORD)
            s.send_message(msg)


def _send_email(to: str, subject: str, html: str, text: str = "", headers: Optional[dict] = None):
    """Send an HTML email with a plain-text fallback: through the Gmail relay
    when GMAIL_RELAY_URL is set, else Gmail SMTP when SMTP_HOST is set, else
    Mailjet. `headers` adds mail headers
    (List-Unsubscribe, unsubscribe.py). Never raises."""
    if GMAIL_RELAY_URL and GMAIL_RELAY_SECRET:
        try:
            _send_relay(to, subject, html, text)
            logger.info("Email sent to %s via the Gmail relay: %s", to, subject)
        except Exception as e:
            logger.error("Failed to send email to %s via the Gmail relay: %s", to, e)
        return
    if SMTP_HOST and SMTP_USER and SMTP_PASSWORD:
        try:
            _send_smtp(to, subject, html, text, headers)
            logger.info("Email sent to %s: %s", to, subject)
        except Exception as e:
            logger.error("Failed to send email to %s: %s", to, e)
        return
    if not MAILJET_API_KEY or not MAILJET_SECRET_KEY:
        logger.warning("No email sender configured (SMTP_HOST or MAILJET keys) - skipping email to %s", to)
        return

    try:
        payload = {
            "Messages": [
                {
                    "From": {"Email": FROM_EMAIL, "Name": FROM_NAME},
                    "To": [{"Email": to}],
                    "Subject": subject,
                    "HTMLPart": html,
                }
            ]
        }
        if text:
            payload["Messages"][0]["TextPart"] = text
        if headers:
            payload["Messages"][0]["Headers"] = headers

        response = httpx.post(
            "https://api.mailjet.com/v3.1/send",
            json=payload,
            auth=(MAILJET_API_KEY, MAILJET_SECRET_KEY),
            timeout=10,
        )
        response.raise_for_status()
        logger.info("Email sent to %s: %s", to, subject)
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, e)


def _theme():
    import email_theme

    return email_theme


def _first(name: Optional[str]) -> str:
    return ((name or "").strip().split(" ")[0]) or "there"


def send_support_request_received(to: str, name: Optional[str], reference: str, subject: str) -> None:
    """Confirmation to someone who wrote to Migrent support (Contact page or
    the help button)."""
    et = _theme()
    t = et.THEMES["support"]
    first = _first(name)
    body = et.render(
        "support",
        eyebrow="We've got it",
        title="We have your message",
        preheader="A person replies by email, usually within one business day.",
        greeting=first,
        paragraphs=["Thanks for writing to Migrent. A real person reads every message and replies by email, usually within one business day (weekdays, Australian business hours)."],
        blocks=[et.details([("Reference", reference), ("About", subject or "Your message")], t, title="Your message")],
        after=[et.note("If you feel unsafe", "Call 000 first. Then reply to this email and we'll help.", t), et.tip("Add something?", "Just reply to this email. It goes straight to the same conversation.", t)],
    )
    text = (
        f"Hi {first}, thanks for writing to Migrent. A person replies by email, usually within one business day.\n"
        f"Reference: {reference}\nAbout: {subject}\nIf you feel unsafe, call 000 first."
    )
    _send_email(to, f"We have your message ({reference})", body, text)


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
    et = _theme()
    t = et.THEMES["stays"]
    url = _hub_url("/applications")
    body = et.render(
        "stays",
        eyebrow="New stay request",
        title=f"{_first(seeker_name)} wants to stay",
        preheader=f"New stay request from {seeker_name} for {listing_title}.",
        greeting=_first(owner_name),
        paragraphs=[f"{seeker_name} asked to book {listing_title}. Have a look and accept or decline."],
        blocks=[et.details([("Home", listing_title), ("Arrive", check_in), ("Leave", check_out), ("Guests", str(guests)), ("Estimated rent", f"AUD ${total_price:,.2f}"), ("Status", "Waiting for you")], t, title="Stay request")],
        cta=("Review the request", url),
        after=[et.tip("Respond within 48 hours", "Requests expire after 48 hours. Quick replies help your listing rank higher.", t)],
    )
    text = (
        f"Hi {owner_name},\n\n{seeker_name} has requested to book your listing: {listing_title}\n\n"
        f"Dates: {check_in} to {check_out}\nGuests: {guests}\nEstimated rent: AUD ${total_price:,.2f}\n\n"
        f"Review: {url}\n\nYou have 48 hours to respond.\n\n- The Migrent Team"
    )
    _send_email(owner_email, f"New booking request for {listing_title}", body, text)


def send_booking_accepted_to_seeker(
    seeker_email: str,
    seeker_name: str,
    listing_title: str,
    booking_id: str,
):
    """Tell the guest their request was accepted. Renters pay Migrent
    nothing, so there is no payment link here (the host fee is the host's)."""
    et = _theme()
    t = et.THEMES["stays"]
    body = et.render(
        "stays",
        eyebrow="Accepted",
        title="Your stay was accepted",
        preheader=f"The host accepted your request for {listing_title}.",
        greeting=_first(seeker_name),
        paragraphs=[f"Great news: the host accepted your request for {listing_title}. They're confirming it now, and we'll email you the moment it's locked in."],
        blocks=[et.details([("Home", listing_title), ("What you pay Migrent", "AUD $0.00"), ("Next step", "The host confirms")], t)],
        cta=("View your requests", _hub_url("/applications")),
        after=[et.note("How to pay the host", "Rent is arranged directly with your host. Pay by bank transfer to an account in their name, after you've seen the place. Never by gift card, crypto or cash in advance.", t)],
    )
    text = (
        f"Hi {seeker_name},\n\nGreat news. The host has accepted your booking request for: {listing_title}\n\n"
        "What you pay Migrent: $0.00\nThe host is confirming now. We will email you the moment it is locked in.\n\n- The Migrent Team"
    )
    _send_email(seeker_email, f"Your booking for {listing_title} was approved!", body, text)


def send_owner_fee_request(
    owner_email: str,
    owner_name: str,
    seeker_name: str,
    listing_title: str,
    checkout_url: str,
    booking_id: str,
):
    """Invoice the host their one-off listing fee to confirm a booking."""
    et = _theme()
    t = et.THEMES["money"]
    body = et.render(
        "money",
        eyebrow="One step left",
        title="Confirm your booking",
        preheader=f"Pay the one-off $99 fee to confirm {seeker_name}'s stay.",
        greeting=_first(owner_name),
        paragraphs=[f"Your booking with {seeker_name} for {listing_title} is held and ready. Pay your one-off listing fee to confirm it."],
        blocks=[et.details([("Host listing fee", "AUD $99.00"), ("When", "Once per property, only when you match"), ("Commission on rent", "None")], t, title="Fee")],
        cta=("Pay $99 and confirm", checkout_url),
        after=[et.tip("Secure payment", "Payments are handled by Stripe. Migrent never sees your card number.", t)],
    )
    text = (
        f"Hi {owner_name},\n\nYour booking with {seeker_name} for {listing_title} is held and ready.\n"
        f"Pay your one-off $99 host listing fee to confirm it: {checkout_url}\n\n- The Migrent Team"
    )
    _send_email(owner_email, f"Confirm your booking with {seeker_name}", body, text)


def send_booking_declined_to_seeker(
    seeker_email: str,
    seeker_name: str,
    listing_title: str,
):
    et = _theme()
    t = et.THEMES["searches"]
    body = et.render(
        "searches",
        eyebrow="Booking update",
        title="This one didn't work out",
        preheader=f"The host couldn't take your request for {listing_title}. Here are your next steps.",
        greeting=_first(seeker_name),
        paragraphs=[f"The host couldn't accept your request for {listing_title}. Don't be discouraged: new rooms are listed every day."],
        cta=("Find another room", f"{FRONTEND_URL}/seeker/search"),
        after=[et.steps(["Write a friendly hello about who you are", "Mention your work or study plans", "Be clear about when you'd move in", "Finish your rental profile"], t, title="Tips for your next request")],
    )
    text = f"Hi {seeker_name},\n\nThe owner has declined your booking request for: {listing_title}\n\nBrowse more listings: {FRONTEND_URL}/seeker/search\n\n- The Migrent Team"
    _send_email(seeker_email, f"Update on your booking request for {listing_title}", body, text)


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
    et = _theme()
    t = et.THEMES["stays"]
    url = _hub_url("/applications")
    owner_body = et.render(
        "stays",
        eyebrow="Confirmed",
        title="Your room is booked",
        preheader=f"{seeker_name}'s stay at {listing_title} is confirmed.",
        greeting=_first(owner_name),
        paragraphs=[f"The booking for {listing_title} is confirmed."],
        blocks=[et.details([("Guest", seeker_name), ("Arrive", check_in), ("Leave", check_out), ("Status", "Confirmed")], t, title="Booking")],
        cta=("Open the booking", url),
        after=[et.steps([f"Message {_first(seeker_name)} with check-in details", "Get the room ready", "Be around on arrival day for the handover"], t, title="Next steps")],
    )
    _send_email(owner_email, f"Booking confirmed - {listing_title}", owner_body, f"Hi {owner_name},\n\nThe booking for {listing_title} is confirmed.\nGuest: {seeker_name}\nDates: {check_in} to {check_out}\n\n{url}\n\n- The Migrent Team")
    seeker_body = et.render(
        "stays",
        eyebrow="Confirmed",
        title="Your stay is confirmed",
        preheader=f"Your stay at {listing_title} is locked in.",
        greeting=_first(seeker_name),
        paragraphs=[f"Your booking for {listing_title} is confirmed. Welcome!"],
        blocks=[et.details([("Host", owner_name), ("Arrive", check_in), ("Leave", check_out), ("Status", "Confirmed")], t, title="Booking")],
        cta=("Open the booking", url),
        after=[et.steps([f"Message {_first(owner_name)} about check-in", "Have your ID ready", "Arrive on your check-in date"], t, title="Next steps")],
    )
    _send_email(seeker_email, f"Booking confirmed - {listing_title}", seeker_body, f"Hi {seeker_name},\n\nYour booking for {listing_title} is confirmed!\nCheck-in: {check_in}\nCheck-out: {check_out}\n\n{url}\n\n- The Migrent Team")


def send_listing_approved_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
):
    """Notify owner their listing has been approved and is now live."""
    et = _theme()
    t = et.THEMES["listings"]
    url = _hub_url("/properties")
    body = et.render(
        "listings",
        eyebrow="Approved",
        title="Your listing is live",
        preheader=f"{listing_title} is now visible to renters.",
        greeting=_first(owner_name),
        paragraphs=[f"Good news: Migrent checked {listing_title} and it's now visible to renters across Australia."],
        blocks=[et.details([("Listing", listing_title), ("Status", "Live")], t)],
        cta=("View your listings", url),
        after=[et.tip("Get more applications", "Listings with 6 or more photos and a clear move-in cost get the most enquiries.", t)],
    )
    text = f"Hi {owner_name},\n\nYour listing '{listing_title}' has been approved and is now live on Migrent!\n\nView your listings: {url}\n\n- The Migrent Team"
    _send_email(owner_email, f"Your listing '{listing_title}' is now live!", body, text)


def send_listing_rejected_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
    reason: str,
):
    """Notify owner their listing was rejected with a reason."""
    et = _theme()
    t = et.THEMES["listings"]
    url = _hub_url("/properties")
    body = et.render(
        "listings",
        eyebrow="Not approved",
        title="Your listing wasn't approved",
        preheader=f"{listing_title} needs fixing before it can go live.",
        greeting=_first(owner_name),
        paragraphs=[f"Migrent couldn't approve {listing_title} this time."],
        blocks=[et.note("Why", reason, t)],
        cta=("Edit your listing", url),
        after=[et.tip("What now?", "Fix the listing and send it for review again. Need help? Reply to this email.", t)],
    )
    text = f"Hi {owner_name},\n\nYour listing '{listing_title}' was not approved.\n\nReason: {reason}\n\nYou can edit and resubmit: {url}\n\n- The Migrent Team"
    _send_email(owner_email, f"Update on your listing '{listing_title}'", body, text)


def send_listing_changes_requested_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
    changes_needed: str,
):
    """Notify owner that changes are needed before their listing can go live."""
    et = _theme()
    t = et.THEMES["listings"]
    url = _hub_url("/properties")
    body = et.render(
        "listings",
        eyebrow="Almost there",
        title="A few changes and you're live",
        preheader=f"{listing_title} needs a few changes.",
        greeting=_first(owner_name),
        paragraphs=[f"{listing_title} needs a few changes before it can go live."],
        blocks=[et.note("What to update", changes_needed, t)],
        cta=("Edit your listing", url),
        after=[et.tip("Quick re-review", "Once you save the changes, a person on our team checks it again quickly.", t)],
    )
    text = f"Hi {owner_name},\n\nYour listing '{listing_title}' needs some changes before going live.\n\nChanges needed: {changes_needed}\n\nEdit your listing: {url}\n\n- The Migrent Team"
    _send_email(owner_email, f"Changes needed for your listing '{listing_title}'", body, text)


def send_listing_under_review_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
):
    """Notify owner their listing is under additional review (flagged by spam detection)."""
    et = _theme()
    t = et.THEMES["listings"]
    url = _hub_url("/properties")
    body = et.render(
        "listings",
        eyebrow="In review",
        title="We're checking your listing",
        preheader=f"{listing_title} is in review. This is routine.",
        greeting=_first(owner_name),
        paragraphs=[f"{listing_title} is having an extra check by our team. It's a routine part of keeping Migrent safe, and doesn't mean anything is wrong."],
        blocks=[et.steps(["A person on our team reviews it shortly", "You get an email when it's done", "If anything needs changing, we tell you exactly what"], t, title="What happens next")],
        cta=("View your listings", url),
    )
    text = f"Hi {owner_name},\n\nYour listing '{listing_title}' is currently under additional review.\nThis is routine - our team will review it shortly.\n\nView your listings: {url}\n\n- The Migrent Team"
    _send_email(owner_email, f"Your listing '{listing_title}' is under review", body, text)


def send_listing_removed_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
    reason: str,
):
    """Notify owner their listing has been removed after review."""
    et = _theme()
    t = et.THEMES["security"]
    body = et.render(
        "security",
        eyebrow="Listing removed",
        title="Your listing was removed",
        preheader=f"{listing_title} has been removed from Migrent.",
        greeting=_first(owner_name),
        paragraphs=[f"After review, {listing_title} has been removed from Migrent."],
        blocks=[et.note("Why", reason, t)],
        cta=("Contact support", f"{FRONTEND_URL}/contact"),
        after=[et.tip("Think this is a mistake?", "Contact us and a real person on our team will look at it again.", t)],
    )
    text = f"Hi {owner_name},\n\nYour listing '{listing_title}' has been removed.\n\nReason: {reason}\n\nIf you believe this was a mistake, contact support: {FRONTEND_URL}/contact\n\n- The Migrent Team"
    _send_email(owner_email, f"Your listing '{listing_title}' has been removed", body, text)


def send_listing_expiring_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
    available_to: str,
    listing_id: str,
):
    """Seven days before a listing's availability ends, ask the owner to
    extend it or let it lapse."""
    et = _theme()
    t = et.THEMES["listings"]
    renew_url = _hub_url(f"/listings/{listing_id}/edit")
    body = et.render(
        "listings",
        eyebrow="Ending soon",
        title="Is your room still free?",
        preheader=f"{listing_title} comes off Migrent on {available_to}.",
        greeting=_first(owner_name),
        paragraphs=[f"{listing_title} is set as available until {available_to}. After that it stops appearing in search."],
        blocks=[et.details([("Listing", listing_title), ("Comes off search", available_to)], t)],
        cta=("Update availability", renew_url),
        after=[et.tip("Already taken?", "You don't need to do anything. It comes off search by itself.", t)],
    )
    text = f"Hi {owner_name},\n\nYour listing '{listing_title}' is set as available until {available_to}. After that it will come off search.\n\nExtend the dates here if it is still free: {renew_url}\n\n- The Migrent Team"
    _send_email(owner_email, f"Your listing '{listing_title}' comes off Migrent on {available_to}", body, text)


def send_listing_paused_to_owner(
    owner_email: str,
    owner_name: str,
    listing_title: str,
    reason: str,
    required_actions: list[str],
    listing_id: str,
):
    """An admin has taken a listing offline and needs specific things fixed."""
    et = _theme()
    t = et.THEMES["security"]
    edit_url = _hub_url(f"/listings/{listing_id}/edit")
    body = et.render(
        "security",
        eyebrow="Action needed",
        title="Your listing is paused",
        preheader=f"{listing_title} is offline until a few things are fixed.",
        greeting=_first(owner_name),
        paragraphs=[f"We've taken {listing_title} offline while the following is sorted out. Nobody can see or book it in the meantime."],
        blocks=[et.note("Why", reason, t), et.steps(required_actions or ["Update the listing"], t, title="To bring it back")],
        cta=("Update the listing", edit_url),
        after=[et.tip("What happens next", "Once you resubmit, a person on our team reviews it, usually within two business days.", t)],
    )
    text = (
        f"Hi {owner_name},\n\nWe have paused your listing '{listing_title}'.\n\nWhy: {reason}\n\n"
        + "To bring it back:\n" + "\n".join(f"- {a}" for a in required_actions)
        + f"\n\nUpdate it here: {edit_url}\n\n- The Migrent Team"
    )
    _send_email(owner_email, f"Action needed: '{listing_title}' is paused on Migrent", body, text)


def send_welcome(to: str, name: str, role: str) -> None:
    """Sent once, when someone first finishes onboarding in the Hub."""
    et = _theme()
    t = et.THEMES["account"]
    first = _first(name)
    if role == "owner":
        lead = "Your account is ready. Renters see that every host is ID-checked before a room goes live, so the first step is a quick ID check."
        step_list = ["Check your ID (takes about 2 minutes)", "List your property with photos and the move-in cost", "Choose your renter and set up the tenancy in Migrent Hub"]
        cta = ("List a property", _hub_url("/properties/new"))
        tip_text = "Listings with 6 or more photos and a clear move-in cost get the most enquiries."
    else:
        lead = "Your account is ready. Every host on Migrent is ID-checked before a room goes live, and searching and applying are always free."
        step_list = ["Tell us your suburb, budget and move-in date", "Save a search and we'll email you new rooms", "Inspect, then apply in about a minute"]
        cta = ("Find a room", f"{FRONTEND_URL}/seeker/search")
        tip_text = "Fill in your rental profile once and every application takes about a minute."
    body = et.render(
        "account",
        eyebrow="Welcome",
        title=f"Welcome to Migrent, {first}",
        preheader="Your account is ready.",
        paragraphs=[lead],
        blocks=[et.steps(step_list, t, title="Getting started")],
        cta=cta,
        after=[et.tip("Good to know", tip_text, t)],
    )
    _send_email(to, "Welcome to Migrent", body, text=f"Welcome to Migrent, {first}. {lead}")
