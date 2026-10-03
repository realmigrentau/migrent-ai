"""Draft emails in the new design (email_theme.py), for review before rollout.

    cd backend && python scripts/email_drafts.py ../email-previews/new
"""

from __future__ import annotations

import html
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
HERE = os.path.dirname(os.path.abspath(__file__))
os.environ.setdefault("EMAIL_ASSET_BASE", "file://" + os.path.abspath(os.path.join(HERE, "../../frontend/public/email")))

from email_theme import THEMES, details, render, room_cards, security_code, stars, tip  # noqa: E402

HUB = "https://migrent.vercel.app/hub"
UNSUB = 'You get these emails about applications, bookings and reviews. <a href="#" style="color:#C7D0E6;">Unsubscribe</a> or choose which emails you get in Migrent Hub settings.'
ROOM = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1040&q=70"
ROOM2 = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1040&q=70"

DRAFTS = [
    (
        "Welcome (renter)",
        "Welcome to Migrent",
        render(
            "account",
            eyebrow="Welcome",
            title="Welcome to Migrent, Sam",
            preheader="Your account is ready. Here's how to find your room.",
            paragraphs=["Your account is ready. Every host on Migrent is ID-checked before a room goes live, and searching and applying are always free."],
            blocks=[details([("1. Tell us what you need", "Suburb, budget, move-in date"), ("2. Save a search", "We email you new rooms"), ("3. Inspect, then apply", "All in Migrent Hub")], THEMES["account"], title="Three steps to your room")],
            cta=("Find a room", "https://migrent.vercel.app/seeker/search"),
            after=[tip("Good to know", "Fill in your rental profile once and every application takes about a minute.", THEMES["account"])],
        ),
    ),
    (
        "New application (to owner)",
        "New application from Sam Patel",
        render(
            "applications",
            title="New application from Sam",
            preheader="Sam Patel applied for Sunny room near Parramatta station.",
            greeting="Olive",
            paragraphs=["Sam Patel applied for your room. Their rental profile, references and documents are ready to read."],
            blocks=[details([("Home", "Sunny room near Parramatta station"), ("Wants to move in", "Sat 1 Nov 2026"), ("People", "1 adult"), ("Income", "Verified payslips"), ("Stay", "12 months")], THEMES["applications"], title="Application")],
            cta=("Review application", f"{HUB}/applications/app1"),
            after=[tip("Tip", "Owners who reply within a day are twice as likely to find a tenant quickly.", THEMES["applications"])],
            footer_note=UNSUB,
        ),
    ),
    (
        "Inspection reminder",
        "Inspection tomorrow at 10:30am",
        render(
            "inspections",
            title="Your inspection is tomorrow",
            preheader="Sat 25 Oct at 10:30am, 12 Church Street, Parramatta.",
            greeting="Sam",
            paragraphs=["Here's everything you need for tomorrow's inspection."],
            blocks=[details([("When", "Sat 25 Oct, 10:30am"), ("Where", "12 Church Street, Parramatta 2150"), ("Host", "Olive (ID-checked)"), ("Bring", "Photo ID")], THEMES["inspections"], title="Inspection")],
            cta=("View inspection", f"{HUB}/inspections"),
            after=[tip("Before you go", "Check the room matches the photos, run the taps, and walk to the station. Never pay anything at an inspection.", THEMES["inspections"])],
            footer_note=UNSUB,
        ),
    ),
    (
        "New message",
        "New message from Olive",
        render(
            "messages",
            title="Olive sent you a message",
            preheader="Hi Sam, the room is still available. Would Saturday suit?",
            greeting="Sam",
            blocks=[
                '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px;"><tr><td style="padding:18px 20px;background:#F1EEFF;border-radius:4px 18px 18px 18px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:16px;line-height:24px;color:#101828;">'
                + html.escape("Hi Sam, the room is still available. Would Saturday at 10:30am suit for an inspection?")
                + '<div style="margin-top:8px;font-size:12px;color:#667085;">Olive, about Sunny room near Parramatta station</div></td></tr></table>'
            ],
            cta=("Reply", f"{HUB}/messages"),
            after=[tip("Stay safe", "Keep your conversation in Migrent Hub. If anyone asks you to pay before an inspection, report the message.", THEMES["messages"])],
            footer_note=UNSUB,
        ),
    ),
    (
        "Saved search: new rooms",
        "2 new rooms in Parramatta",
        render(
            "searches",
            title="2 new rooms in Parramatta",
            preheader="Including a private room near the station for $300 a week.",
            greeting="Sam",
            paragraphs=["New rooms matching your saved search just went live."],
            blocks=[
                room_cards(
                    [
                        {"title": "Sunny room near the station", "suburb": "Parramatta 2150 · 6 min walk to station", "price": "$300", "badge": "Bills included", "image": ROOM, "url": "https://migrent.vercel.app/listing/1"},
                        {"title": "Quiet room in a family home", "suburb": "North Parramatta 2151", "price": "$270", "badge": "New arrivals welcome", "image": ROOM2, "url": "https://migrent.vercel.app/listing/2"},
                    ],
                    THEMES["searches"],
                )
            ],
            cta=("See all matches", f"{HUB}/saved?tab=searches"),
            footer_note="You get these because you saved a search. <a href='#' style='color:#C7D0E6;'>Unsubscribe</a> or change how often in Migrent Hub.",
        ),
    ),
    (
        "Move-in receipt (renter)",
        "Your move-in receipt",
        render(
            "money",
            eyebrow="Payment received",
            title="Payment sent to the owner",
            preheader="Security code K7PM2QX9RT. Your rent in advance reached the owner.",
            greeting="Sam",
            paragraphs=["Your rent in advance for Sunny room near Parramatta station went straight to the owner's account."],
            blocks=[
                details([("Rent (2 weeks)", "$600.00"), ("Card fee", "$11.04"), ("Total paid", "$611.04"), ("Paid", "Mon 20 Oct 2026"), ("Owner", "Olive Chen (ID-checked)"), ("Owner phone", "0400 000 000"), ("Address", "12 Church Street, Parramatta 2150"), ("Move in", "Sat 1 Nov 2026"), ("Reference", "pi_3QabcXYZ")], THEMES["money"], title="Receipt"),
                security_code("K7PM2QX9RT", THEMES["money"]),
            ],
            cta=("Open the receipt", f"{HUB}/tenancies/t1/receipt"),
            after=[tip("The bond", "The bond is not paid through Migrent. Pay it to your state's bond authority, which holds it until you move out.", THEMES["money"])],
        ),
    ),
    (
        "Listing approved",
        "Your listing is live",
        render(
            "listings",
            eyebrow="Approved",
            title="Your room is live",
            preheader="Sunny room near Parramatta station is now visible to renters.",
            greeting="Olive",
            paragraphs=["Good news: Migrent checked your listing and it's now visible to renters across Australia."],
            blocks=[details([("Listing", "Sunny room near Parramatta station"), ("Rent", "$300 a week"), ("Live until", "Sun 30 Nov 2026")], THEMES["listings"])],
            cta=("View your listing", "https://migrent.vercel.app/listing/1"),
            after=[tip("Get more applications", "Listings with 6 or more photos and a clear move-in cost get the most enquiries.", THEMES["listings"])],
            footer_note="You get these emails about your listings. <a href='#' style='color:#C7D0E6;'>Unsubscribe</a> or choose which emails you get in Migrent Hub settings.",
        ),
    ),
    (
        "Review your home",
        "How is your new home?",
        render(
            "reviews",
            title="How's your new home?",
            preheader="A short review helps the next renter.",
            greeting="Sam",
            paragraphs=["You've been at Sunny room near Parramatta station for a month. A short, honest review helps the next renter choose well. Only your first name is shown."],
            blocks=[stars()],
            cta=("Write a review", f"{HUB}/"),
            after=[tip("Fair for everyone", "Reviews from both sides appear together once you've both written one, or after 14 days.", THEMES["reviews"])],
            footer_note=UNSUB,
        ),
    ),
    (
        "Security alert (to admins)",
        "Potential threat: admin panel locked",
        render(
            "security",
            eyebrow="Security alert",
            title="Admin panel locked",
            preheader="3 wrong admin panel passwords on Ada's account.",
            greeting="Ada",
            paragraphs=["Three wrong Admin panel passwords were entered on Ada's account. The panel is locked for 15 minutes and the account was signed out everywhere."],
            blocks=[details([("Account", "ada@example.com"), ("When", "Fri 3 Oct, 11:42am"), ("Action taken", "Locked and signed out")], THEMES["security"])],
            cta=("Open the audit log", f"{HUB}/admin/audit"),
        ),
    ),
]


def main(out: str) -> None:
    os.makedirs(out, exist_ok=True)
    for i, (name, subject, body) in enumerate(DRAFTS, 1):
        with open(os.path.join(out, f"{i:02d}.html"), "w") as f:
            f.write(body)
    cards = "".join(
        f'<section><h2>{html.escape(n)}</h2><p>Subject: <b>{html.escape(s)}</b></p><iframe src="{i:02d}.html" loading="lazy"></iframe></section>'
        for i, (n, s, _) in enumerate(DRAFTS, 1)
    )
    page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Migrent emails: new design</title><style>
body{{margin:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f3f4f8;color:#101828;padding:24px}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(660px,1fr));gap:24px}}
section{{background:#fff;border:1px solid #e4e7ec;border-radius:16px;padding:16px}} h2{{margin:0;font-size:18px}} p{{margin:4px 0 10px;font-size:13px;color:#344054}}
iframe{{width:100%;height:1150px;border:1px solid #e4e7ec;border-radius:10px}}</style></head>
<body><h1>New design: {len(DRAFTS)} drafts</h1><main>{cards}</main></body></html>"""
    with open(os.path.join(out, "index.html"), "w") as f:
        f.write(page)
    print(f"{len(DRAFTS)} drafts -> {out}/index.html")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "email-previews/new")
