"""Scam signs in messages (MIGRENT_MASTER_AUDIT MIG-033).

Rental scams aimed at new arrivals follow a script: pay a deposit to hold
the room before you see it, by transfer or gift card, to someone who is
"overseas" and will post the keys, and carry on over WhatsApp. Listings are
already screened for these (spam_detection.py); this does the same for
messages.

A message that matches is still delivered (owner decision, 2026-10-02): the
recipient sees a warning above it, and Migrent's admins get a report. The
patterns are deliberately narrow, so ordinary talk about rent and bond
after an inspection does not trip them.
"""

import re

# (code, pattern). Each code has a plain-English line in RISK_LABELS.
RISK_PATTERNS: tuple[tuple[str, re.Pattern], ...] = (
    (
        "pay_before_inspection",
        re.compile(
            r"\b(deposit|holding fee|bond|rent|payment|pay|transfer)\b[^.?!\n]{0,60}\b(before|without|prior to)\b[^.?!\n]{0,40}"
            r"\b(inspect\w*|view\w*|see(ing)? (it|the (room|place|property|house|unit))|meet\w*|visit\w*)",
            re.IGNORECASE,
        ),
    ),
    (
        "hold_the_room",
        re.compile(
            r"\b(pay|send|transfer|deposit)\b[^.?!\n]{0,40}\bto (hold|secure|reserve|lock in)\b"
            r"|\b(hold|secure|reserve)\b[^.?!\n]{0,30}\b(room|place|property|house|unit)\b[^.?!\n]{0,30}\b(pay|send|transfer|deposit)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "untraceable_payment",
        re.compile(
            r"\b(western union|moneygram|gift ?cards?|itunes cards?|google play cards?|steam cards?|bitcoin|btc|crypto(currency)?|usdt|tether)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "bank_details",
        re.compile(r"\bbsb\b[\s:#-]*\d{3}[\s-]?\d{3}|\b(account|acc|acct)\s*(number|no\.?|#)[\s:#-]*\d{6,}", re.IGNORECASE),
    ),
    (
        "off_platform",
        re.compile(
            r"\b(contact|message|text|chat with|reach|add) me on (whats\s?app|telegram|signal|wechat|viber)\b"
            r"|\b(whats\s?app|telegram|signal|wechat|viber) only\b"
            r"|\bonly (on|via|through) (whats\s?app|telegram|signal|wechat|viber)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "keys_by_post",
        re.compile(
            r"\b(overseas|abroad|out of (the )?country|interstate)\b[^.?!\n]{0,120}\b(keys?)\b[^.?!\n]{0,60}\b(post|posted|courier|mail|delivered|send)\b"
            r"|\b(post|courier|mail|send)\b[^.?!\n]{0,20}\b(the )?keys\b",
            re.IGNORECASE,
        ),
    ),
)

RISK_LABELS = {
    "pay_before_inspection": "asks for money before you have inspected the home",
    "hold_the_room": "asks for a payment to hold the room",
    "untraceable_payment": "mentions a payment method scammers use (gift cards, crypto, money transfer services)",
    "bank_details": "includes bank account details",
    "off_platform": "asks to move the conversation to another app",
    "keys_by_post": "talks about sending keys instead of meeting",
}


def message_risks(text: str | None) -> list[str]:
    """Codes of the scam signs in `text`, in a stable order."""
    if not text:
        return []
    return [code for code, pattern in RISK_PATTERNS if pattern.search(text)]
