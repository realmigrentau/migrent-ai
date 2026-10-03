"""
Render every email Migrent sends, with sample details, into one page.

    cd backend && python scripts/email_previews.py ../email-previews

Nothing is sent: the sender is swapped for a recorder. The output folder
gets one .html file per email and index.html, which shows them all.
"""

from __future__ import annotations

import html
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "preview")
os.environ.setdefault("SUPABASE_ANON_KEY", "preview")
os.environ.setdefault("FRONTEND_URL", "https://migrent.vercel.app")

import email_bookings  # noqa: E402

CAPTURED: list[dict] = []
CURRENT = {"group": "", "name": ""}


def record(to, subject, html_body, text="", headers=None):
    CAPTURED.append({"group": CURRENT["group"], "name": CURRENT["name"], "to": to, "subject": subject, "html": html_body})


email_bookings._send_email = record


def capture(group: str, name: str, fn, *args, **kwargs):
    CURRENT.update(group=group, name=name)
    before = len(CAPTURED)
    fn(*args, **kwargs)
    for c in CAPTURED[before:]:
        c["group"], c["name"] = group, name if len(CAPTURED) - before == 1 else f"{name} ({c['to']})"


def custom_emails():
    eb = email_bookings
    capture("Account", "Welcome (renter)", eb.send_welcome, "sam@example.com", "Sam Patel", "renter")
    capture("Account", "Welcome (owner)", eb.send_welcome, "olive@example.com", "Olive Chen", "owner")
    capture("Support", "We have your message", eb.send_support_request_received, "sam@example.com", "Sam Patel", "6b6cd5fe", "Question about bond")

    capture("Stays", "Stay request (to owner)", eb.send_booking_request_to_owner, "olive@example.com", "Olive", "Sam Patel", "Sunny room near Parramatta station", "2026-11-01", "2026-11-15", 1, 640.0, "bk_123")
    capture("Stays", "Stay accepted (to renter)", eb.send_booking_accepted_to_seeker, "sam@example.com", "Sam", "Sunny room near Parramatta station", "bk_123")
    capture("Stays", "Host fee to confirm (to owner)", eb.send_owner_fee_request, "olive@example.com", "Olive", "Sam Patel", "Sunny room near Parramatta station", "https://checkout.stripe.com/pay/cs_test", "bk_123")
    capture("Stays", "Stay declined (to renter)", eb.send_booking_declined_to_seeker, "sam@example.com", "Sam", "Sunny room near Parramatta station")
    capture("Stays", "Stay confirmed (to both)", eb.send_booking_confirmed_to_both, "olive@example.com", "Olive", "sam@example.com", "Sam", "Sunny room near Parramatta station", "2026-11-01", "2026-11-15", "bk_123")

    t = "Sunny room near Parramatta station"
    capture("Listings", "Listing approved", eb.send_listing_approved_to_owner, "olive@example.com", "Olive", t)
    capture("Listings", "Listing not approved", eb.send_listing_rejected_to_owner, "olive@example.com", "Olive", t, "The photos show a different property from the address.")
    capture("Listings", "Changes requested", eb.send_listing_changes_requested_to_owner, "olive@example.com", "Olive", t, "Add a photo of the bathroom and say whether bills are included.")
    capture("Listings", "Listing in review", eb.send_listing_under_review_to_owner, "olive@example.com", "Olive", t)
    capture("Listings", "Listing removed", eb.send_listing_removed_to_owner, "olive@example.com", "Olive", t, "Duplicate listing")
    capture("Listings", "Listing about to expire", eb.send_listing_expiring_to_owner, "olive@example.com", "Olive", t, "2026-11-30", "11111111-1111-4111-8111-111111111111")
    capture("Listings", "Listing paused", eb.send_listing_paused_to_owner, "olive@example.com", "Olive", t, "A renter reported the listing.", ["Check the listing details", "Reply to Migrent support"], "11111111-1111-4111-8111-111111111111")

    import email_verification as ev

    capture("ID checks", "ID approved", ev.send_id_approved_email, "olive@example.com", "Olive", True)
    capture("ID checks", "ID not approved", ev.send_id_rejected_email, "olive@example.com", "Olive", "The photo is too blurry to read the name.")
    capture("ID checks", "ID waiting (to Migrent)", ev.send_founder_id_review_alert, "migrentau@gmail.com", "Olive Chen", "olive@example.com", "passport")


def move_in_receipts():
    import move_in

    sample = {
        "receipt_code": "K7PM2QX9RT",
        "issued_at": "2026-10-20T03:00:00+00:00",
        "payment": {"amount": 611.04, "weeks": 2, "weekly_rent": 300.0, "card_fee": 11.04, "to_owner": 600.0, "currency": "AUD", "paid_at": "2026-10-20T03:00:00+00:00", "reference": "pi_3QabcXYZ", "status": "paid"},
        "tenancy": {"start_date": "2026-11-01", "end_date": None, "rent_amount": 300, "rent_frequency": "weekly"},
        "property": {"title": "Sunny room near Parramatta station", "address": "12 Church Street, Parramatta, 2150", "unit_label": "Room 2"},
        "owner": {"name": "Olive Chen", "email": "olive@example.com", "phone": "0400 000 000", "member_since": "2026-02-14", "id_checked": True},
        "renter": {"name": "Sam Patel", "email": "sam@example.com", "phone": "0411 111 111", "member_since": "2026-05-02"},
        "fee": {"status": "charged", "amount": 99.0, "charged_at": "2026-10-20T03:00:05+00:00", "reference": "pi_fee_1"},
        "bond_note": "The bond is not paid through Migrent. Pay it to your state's bond authority, which holds it until the tenancy ends.",
        "owner_confirmed_at": "2026-10-21T01:00:00+00:00",
        "renter_confirmed_at": "2026-11-01T02:00:00+00:00",
        "complete": True,
        "stripe": {"session": "cs_1", "payment_intent": "pi_3QabcXYZ"},
    }
    move_in.build_receipt = lambda sb, row, role: {**sample, "role": role}
    move_in._contact = lambda sb, uid: {"email": "sam@example.com" if uid == "r" else "olive@example.com"}
    os.environ.setdefault("SUPPORT_EMAIL", "migrentau@gmail.com")
    row = {"tenancy_id": "t1", "renter_id": "r", "owner_id": "o"}
    for role, name in (("renter", "Move-in receipt (renter)"), ("owner", "Move-in receipt (owner)"), ("admin", "Move-in complete (Migrent)")):
        capture("Money", name, move_in.send_receipt_email, None, row, role)


# The ~30 notifications that share one template, with wording like the real ones.
NOTIFICATIONS = [
    ("Applications", "application_submitted", "New application from Sam", "Sam Patel applied for Sunny room near Parramatta station. Open it to see their rental profile and documents.", "/hub/applications/app1"),
    ("Applications", "application_status_changed", "Your application was shortlisted", "Olive shortlisted your application for Sunny room near Parramatta station.", "/hub/applications/app1"),
    ("Applications", "application_changes_requested", "Olive needs a little more information", "Please add a reference from your employer.", "/hub/applications/app1"),
    ("Applications", "application_approved", "Olive approved your application", "Migrent now checks everything is complete before the tenancy is set up.", "/hub/applications/app1"),
    ("Applications", "application_finalised", "Application finalised", "Your application for Sunny room near Parramatta station is finalised. Your new home is set up in Migrent Hub.", "/hub/applications/app1"),
    ("Inspections", "inspection_booked", "Inspection booked", "Sam booked an inspection of Sunny room near Parramatta station on Sat 25 Oct at 10:30am.", "/hub/inspections"),
    ("Inspections", "inspection_changed", "Inspection time changed", "Olive moved your inspection to Sun 26 Oct at 11:00am.", "/hub/inspections"),
    ("Inspections", "inspection_cancelled", "Inspection cancelled", "Olive cancelled the inspection on Sat 25 Oct. Choose another time.", "/hub/inspections"),
    ("Inspections", "inspection_reminder", "Inspection tomorrow at 10:30am", "Sunny room near Parramatta station, 12 Church Street. Bring photo ID.", "/hub/inspections"),
    ("Messages", "message_received", "New message from Olive", "\"Hi Sam, the room is still available. Would Saturday suit for an inspection?\"", "/hub/messages"),
    ("Searches", "saved_search_match", "2 new rooms in Parramatta", "Including a private room near the station for $300 a week.", "/hub/saved?tab=searches"),
    ("Home and repairs", "tenancy_created", "Your tenancy is set up", "Your lease, rent record and repairs are now in Migrent Hub.", "/hub/my-home"),
    ("Home and repairs", "maintenance_created", "Repair request: leaking tap", "Sam reported a leaking kitchen tap at Sunny room near Parramatta station.", "/hub/maintenance/m1"),
    ("Home and repairs", "maintenance_updated", "Repair update: plumber booked", "Olive booked a plumber for Tue 28 Oct.", "/hub/maintenance/m1"),
    ("Reviews", "review_prompt", "How is your new home?", "You've been at Sunny room near Parramatta station for a month. A short review helps the next renter.", "/hub/"),
    ("Reviews", "review_received", "Sam reviewed your home", "Write yours too: reviews from both sides show once you've both written one, or after 14 days.", "/hub/"),
    ("Listings", "listing_published", "Your listing is live", "Sunny room near Parramatta station is now visible to renters.", "/hub/properties"),
    ("Mentors", "mentor_approved", "You're listed as a mentor", "New arrivals can now book sessions with you.", "/become-mentor"),
    ("Money", "move_in_fee_failed", "Migrent's fee didn't go through", "We couldn't charge your saved card the AUD 99 fee for your new renter: Your card was declined. Update your card in Settings and we'll try again.", "/hub/settings#payouts"),
    ("Security", "admin_security_alert", "Potential threat: admin panel locked", "3 wrong admin panel passwords were entered on Ada's account.", "/hub/admin/audit"),
]


def notification_emails():
    import notification_service as ns

    ns._send_email = record
    for group, event, title, body, url in NOTIFICATIONS:
        capture(group, f"{title} ({event})", ns._send_notification_email, "sam@example.com", "Sam", title, body, url, event, "33333333-3333-4333-8333-333333333333")


def write(out: str) -> None:
    os.makedirs(out, exist_ok=True)
    items = []
    for i, c in enumerate(CAPTURED, 1):
        fname = f"{i:02d}.html"
        with open(os.path.join(out, fname), "w") as f:
            f.write(c["html"])
        items.append((c, fname))
    groups: dict[str, list] = {}
    for c, fname in items:
        groups.setdefault(c["group"], []).append((c, fname))
    nav = "".join(
        f'<h3>{html.escape(g)}</h3>' + "".join(f'<a href="#{f}">{html.escape(c["name"])}</a>' for c, f in rows) for g, rows in groups.items()
    )
    cards = "".join(
        f"""<section id="{f}"><p class="meta">{html.escape(c['group'])} · To: {html.escape(str(c['to']))}</p>
<h2>{html.escape(c['name'])}</h2><p class="subject">Subject: <b>{html.escape(c['subject'])}</b></p>
<iframe src="{f}" loading="lazy"></iframe></section>"""
        for c, f in items
    )
    page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Migrent emails</title><style>
body{{margin:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f3f4f8;color:#101828;display:flex}}
nav{{position:sticky;top:0;height:100vh;overflow:auto;width:260px;flex:none;background:#fff;border-right:1px solid #e4e7ec;padding:16px}}
nav h3{{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#667085;margin:18px 0 6px}}
nav a{{display:block;font-size:13px;color:#3153d9;text-decoration:none;padding:3px 0}}
main{{flex:1;padding:24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(640px,1fr));gap:24px}}
section{{background:#fff;border:1px solid #e4e7ec;border-radius:16px;padding:16px}}
h1{{grid-column:1/-1;margin:0}} h2{{font-size:18px;margin:4px 0}} .meta{{font-size:12px;color:#667085;margin:0}} .subject{{font-size:13px;color:#344054;margin:4px 0 10px}}
iframe{{width:100%;height:760px;border:1px solid #e4e7ec;border-radius:10px;background:#fff}}
</style></head><body><nav><b>{len(items)} emails</b>{nav}</nav><main><h1>Every Migrent email ({len(items)})</h1>{cards}</main></body></html>"""
    with open(os.path.join(out, "index.html"), "w") as f:
        f.write(page)
    print(f"{len(items)} emails -> {os.path.join(out, 'index.html')}")


if __name__ == "__main__":
    custom_emails()
    move_in_receipts()
    notification_emails()
    write(sys.argv[1] if len(sys.argv) > 1 else "email-previews")
