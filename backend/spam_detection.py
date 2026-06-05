"""
Spam detection scoring engine for MigRent listings.

Runs a series of rule-based checks against listing content and owner behaviour.
Each rule returns a score (0-100 contribution) and a human-readable reason.
The total spam_score determines whether a listing is auto-allowed, flagged, or hidden.

Thresholds:
  0-29  = clean (auto-allow into normal moderation queue)
  30-59 = flagged for review (founder gets email)
  60+   = temporarily hidden (founder gets urgent email)

No listing is ever auto-deleted. Only the founder can confirm deletion.
"""

import hashlib
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Optional

from db import get_supabase_admin

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------
# SECTION 1: Keyword and pattern lists
# ---------------------------------------------------------------

# Banned keywords - strong spam/scam signals
BANNED_KEYWORDS = [
    # Scam phrases
    "send money", "wire transfer", "western union", "moneygram",
    "pay outside", "pay before viewing", "pay upfront",
    "no inspection needed", "no viewing needed",
    "deposit before", "pay deposit first",
    "overseas owner", "currently overseas",
    "send bank details", "share bank details",
    "gift card", "bitcoin payment", "crypto payment",
    # Prohibited
    "cash only no receipt", "no lease", "no contract needed",
    "off the books", "cash in hand only",
    # Fake urgency
    "act now or lose", "last chance today",
    "only available for next hour",
    # Adult / inappropriate
    "adult services", "escort", "massage parlour",
]

# Suspicious phrases - moderate signals
SUSPICIOUS_PHRASES = [
    "too good to be true", "unbelievable price",
    "must pay today", "urgent payment",
    "contact me on whatsapp only",
    "message me on telegram",
    "call this number only",
    "do not use this platform",
    "deal outside the app",
    "cheap room guaranteed",
    "100% guaranteed",
    "no questions asked",
    "dm me directly",
    "text me directly",
    "add me on",
]

# External contact patterns (phone, WhatsApp, Telegram, etc.)
CONTACT_PATTERNS = [
    r"\b(?:whatsapp|whats\s*app)\b",
    r"\b(?:telegram|tele\s*gram)\b",
    r"\bwechat\b",
    r"\bline\s*id\b",
    r"\bviber\b",
    r"\b(?:signal\s*app)\b",
    # Phone numbers (Australian: 04xx xxx xxx or +614xx xxx xxx)
    r"\b0[45]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b",
    r"\+?61\s*4\d{2}[\s.-]?\d{3}[\s.-]?\d{3}",
    # Generic phone-like patterns (7+ digits)
    r"\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b",
    # Email addresses in description (owners should use platform messaging)
    r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b",
]

# URL patterns
URL_PATTERNS = [
    r"https?://[^\s]+",
    r"www\.[^\s]+",
    r"\b[a-zA-Z0-9.-]+\.(?:com|net|org|io|co|au|uk)/[^\s]*",
]


# ---------------------------------------------------------------
# SECTION 2: Individual detection rules
# ---------------------------------------------------------------

def check_banned_keywords(title: str, description: str) -> tuple[int, list[str]]:
    """Check for banned scam/spam keywords. Score: 25 per match, max 50."""
    text = f"{title} {description}".lower()
    found = []
    for keyword in BANNED_KEYWORDS:
        if keyword in text:
            found.append(f"Banned keyword: '{keyword}'")
    score = min(len(found) * 25, 50)
    return score, found


def check_suspicious_phrases(title: str, description: str) -> tuple[int, list[str]]:
    """Check for suspicious but not outright banned phrases. Score: 10 per match, max 30."""
    text = f"{title} {description}".lower()
    found = []
    for phrase in SUSPICIOUS_PHRASES:
        if phrase in text:
            found.append(f"Suspicious phrase: '{phrase}'")
    score = min(len(found) * 10, 30)
    return score, found


def check_external_contacts(title: str, description: str) -> tuple[int, list[str]]:
    """Check for phone numbers, WhatsApp, Telegram etc in listing text. Score: 15 per match, max 30."""
    text = f"{title} {description}"
    found = []
    for pattern in CONTACT_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            found.append(f"External contact detected: {matches[0]}")
    score = min(len(found) * 15, 30)
    return score, found


def check_external_urls(title: str, description: str) -> tuple[int, list[str]]:
    """Check for URLs in listing text. Score: 10 per match, max 20."""
    text = f"{title} {description}"
    found = []
    for pattern in URL_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            found.append(f"External URL: {match[:60]}")
    score = min(len(found) * 10, 20)
    return score, found


def check_content_quality(
    title: Optional[str],
    description: str,
    images: list[str],
) -> tuple[int, list[str]]:
    """Check for very low quality / incomplete listings. Score varies."""
    reasons = []
    score = 0

    # No title or very short title
    if not title or len(title.strip()) < 5:
        score += 10
        reasons.append("Title is missing or too short (under 5 characters)")

    # Very short description
    desc_len = len(description.strip()) if description else 0
    if desc_len < 30:
        score += 15
        reasons.append(f"Description is very short ({desc_len} characters)")
    elif desc_len < 80:
        score += 5
        reasons.append(f"Description is short ({desc_len} characters)")

    # No images or very few
    img_count = len(images) if images else 0
    if img_count == 0:
        score += 15
        reasons.append("No images uploaded")
    elif img_count < 3:
        score += 5
        reasons.append(f"Only {img_count} image(s) uploaded")

    # ALL CAPS title or description
    if title and title == title.upper() and len(title) > 10:
        score += 10
        reasons.append("Title is ALL CAPS")

    if description and description == description.upper() and len(description) > 30:
        score += 10
        reasons.append("Description is ALL CAPS")

    return score, reasons


def check_pricing(weekly_price: float, suburb: Optional[str] = None) -> tuple[int, list[str]]:
    """Check for unrealistic pricing. Score varies."""
    reasons = []
    score = 0

    # Extremely low price (under $50/week is suspicious in Australia)
    if weekly_price < 50:
        score += 25
        reasons.append(f"Price is suspiciously low: ${weekly_price}/week")
    elif weekly_price < 80:
        score += 10
        reasons.append(f"Price is unusually low: ${weekly_price}/week")

    # Extremely high price (over $2000/week for a room)
    if weekly_price > 2000:
        score += 15
        reasons.append(f"Price is unusually high: ${weekly_price}/week")
    elif weekly_price > 1500:
        score += 5
        reasons.append(f"Price is quite high: ${weekly_price}/week")

    # Round number pricing (e.g. exactly $100, $200) - minor signal
    if weekly_price > 0 and weekly_price % 100 == 0 and weekly_price <= 100:
        score += 3
        reasons.append("Exact round number pricing")

    return score, reasons


def check_duplicate_content(
    description: str,
    owner_id: str,
    listing_id: Optional[str] = None,
) -> tuple[int, list[str]]:
    """Check if this description matches another listing from any owner. Score: 30 for exact match."""
    reasons = []
    score = 0

    content_hash = hashlib.md5(description.strip().lower().encode()).hexdigest()

    try:
        sb = get_supabase_admin()
        query = sb.table("listings").select("id, owner_id, title").eq("content_hash", content_hash)
        if listing_id:
            query = query.neq("id", listing_id)
        res = query.execute()

        if res.data and len(res.data) > 0:
            match = res.data[0]
            if match["owner_id"] == owner_id:
                score += 25
                reasons.append(f"Duplicate description matches your own listing (ID: {match['id'][:8]}...)")
            else:
                score += 35
                reasons.append(f"Description matches another owner's listing (possible copy-paste spam)")
    except Exception as e:
        logger.warning(f"Duplicate content check failed: {e}")

    return score, reasons, content_hash


def check_posting_frequency(owner_id: str) -> tuple[int, list[str]]:
    """Check if owner is posting too many listings in a short time. Score: 15 per excess."""
    reasons = []
    score = 0

    try:
        sb = get_supabase_admin()
        one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        one_day_ago = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()

        # Listings in last hour
        hour_res = sb.table("listings").select("id", count="exact").eq("owner_id", owner_id).gte("created_at", one_hour_ago).execute()
        hour_count = hour_res.count or 0

        # Listings in last 24 hours
        day_res = sb.table("listings").select("id", count="exact").eq("owner_id", owner_id).gte("created_at", one_day_ago).execute()
        day_count = day_res.count or 0

        if hour_count >= 3:
            score += 25
            reasons.append(f"Owner posted {hour_count} listings in the last hour")
        elif hour_count >= 2:
            score += 10
            reasons.append(f"Owner posted {hour_count} listings in the last hour")

        if day_count >= 5:
            score += 20
            reasons.append(f"Owner posted {day_count} listings in the last 24 hours")
        elif day_count >= 3:
            score += 5
            reasons.append(f"Owner posted {day_count} listings in the last 24 hours")

    except Exception as e:
        logger.warning(f"Posting frequency check failed: {e}")

    return score, reasons


def check_repetitive_text(description: str) -> tuple[int, list[str]]:
    """Check for repetitive/copy-paste text patterns. Score varies."""
    reasons = []
    score = 0

    if not description:
        return score, reasons

    # Check for repeated sentences
    sentences = [s.strip() for s in re.split(r'[.!?]+', description) if len(s.strip()) > 10]
    if len(sentences) >= 3:
        unique = set(s.lower() for s in sentences)
        if len(unique) < len(sentences) * 0.5:
            score += 15
            reasons.append("Description contains many repeated sentences")

    # Check for repeated words (spam-like)
    words = description.lower().split()
    if len(words) >= 10:
        word_counts = {}
        for w in words:
            word_counts[w] = word_counts.get(w, 0) + 1
        repeated = [w for w, c in word_counts.items() if c > 5 and len(w) > 3]
        if repeated:
            score += 10
            reasons.append(f"Excessive word repetition: {', '.join(repeated[:3])}")

    return score, reasons


def check_image_reuse(images: list[str], owner_id: str, listing_id: Optional[str] = None) -> tuple[int, list[str]]:
    """Check if images are reused from other listings (same URLs). Score: 20 for match."""
    reasons = []
    score = 0

    if not images:
        return score, reasons

    try:
        sb = get_supabase_admin()
        # Get other listings from different owners that share image URLs
        for img_url in images[:5]:  # Check first 5 images only
            query = sb.table("listings").select("id, owner_id").neq("owner_id", owner_id).contains("images", [img_url])
            if listing_id:
                query = query.neq("id", listing_id)
            res = query.limit(1).execute()
            if res.data:
                score += 20
                reasons.append(f"Image URL matches a listing from a different owner")
                break  # One match is enough
    except Exception as e:
        logger.warning(f"Image reuse check failed: {e}")

    return score, reasons


# ---------------------------------------------------------------
# SECTION 3: Main scoring function
# ---------------------------------------------------------------

def calculate_spam_score(
    title: Optional[str],
    description: str,
    images: list[str],
    weekly_price: float,
    owner_id: str,
    suburb: Optional[str] = None,
    listing_id: Optional[str] = None,
) -> dict:
    """
    Run all spam detection rules and return a combined result.

    Returns:
        {
            "spam_score": int (0-100, capped),
            "reasons": list[str],
            "content_hash": str,
            "action": "allow" | "flag" | "hide",
        }
    """
    all_reasons = []
    total_score = 0

    title_str = title or ""
    desc_str = description or ""

    # Run all checks
    s, r = check_banned_keywords(title_str, desc_str)
    total_score += s
    all_reasons.extend(r)

    s, r = check_suspicious_phrases(title_str, desc_str)
    total_score += s
    all_reasons.extend(r)

    s, r = check_external_contacts(title_str, desc_str)
    total_score += s
    all_reasons.extend(r)

    s, r = check_external_urls(title_str, desc_str)
    total_score += s
    all_reasons.extend(r)

    s, r = check_content_quality(title_str, desc_str, images)
    total_score += s
    all_reasons.extend(r)

    s, r = check_pricing(weekly_price, suburb)
    total_score += s
    all_reasons.extend(r)

    # Duplicate content check returns 3 values
    s, r, content_hash = check_duplicate_content(desc_str, owner_id, listing_id)
    total_score += s
    all_reasons.extend(r)

    s, r = check_posting_frequency(owner_id)
    total_score += s
    all_reasons.extend(r)

    s, r = check_repetitive_text(desc_str)
    total_score += s
    all_reasons.extend(r)

    s, r = check_image_reuse(images, owner_id, listing_id)
    total_score += s
    all_reasons.extend(r)

    # Cap score at 100
    total_score = min(total_score, 100)

    # Determine action
    if total_score >= 60:
        action = "hide"
    elif total_score >= 30:
        action = "flag"
    else:
        action = "allow"

    return {
        "spam_score": total_score,
        "reasons": all_reasons,
        "content_hash": content_hash,
        "action": action,
    }


# ---------------------------------------------------------------
# SECTION 4: Apply spam result to listing
# ---------------------------------------------------------------

def apply_spam_result(listing_id: str, result: dict, owner_id: str):
    """
    Apply the spam detection result to a listing in the database.
    Records a moderation event and updates listing fields.

    Never auto-deletes. Only flags or hides.
    """
    sb = get_supabase_admin()
    now = datetime.now(timezone.utc).isoformat()

    update_data = {
        "spam_score": result["spam_score"],
        "spam_reasons": result["reasons"],
        "content_hash": result["content_hash"],
    }

    if result["action"] == "hide":
        update_data["moderation_status"] = "hidden"
        update_data["hidden_at"] = now
        update_data["flagged_at"] = now
    elif result["action"] == "flag":
        update_data["moderation_status"] = "flagged"
        update_data["flagged_at"] = now
    # If "allow", keep moderation_status as pending_approval (normal flow)

    try:
        sb.table("listings").update(update_data).eq("id", listing_id).execute()
    except Exception as e:
        logger.error(f"Failed to update listing {listing_id} with spam result: {e}")

    # Record moderation event
    event_type = "spam_scan"
    if result["action"] == "flag":
        event_type = "flagged"
    elif result["action"] == "hide":
        event_type = "hidden"

    try:
        sb.table("moderation_events").insert({
            "listing_id": listing_id,
            "actor_type": "system",
            "event_type": event_type,
            "new_status": update_data.get("moderation_status", "pending_approval"),
            "spam_score": result["spam_score"],
            "reasons": result["reasons"],
            "metadata": {"action": result["action"]},
        }).execute()
    except Exception as e:
        logger.error(f"Failed to record moderation event for listing {listing_id}: {e}")


def notify_founder_spam(listing_id: str, result: dict, listing_title: str, owner_name: str):
    """Send email to founder when a listing is flagged or hidden."""
    from email_bookings import _send_email, _email_layout, _button, _details_box, FRONTEND_URL

    import os
    founder_email = os.environ.get("FOUNDER_EMAIL", os.environ.get("SUPPORT_EMAIL", "migrentau@gmail.com"))

    severity = "HIDDEN" if result["action"] == "hide" else "FLAGGED"
    subject = f"[MigRent Moderation] Listing {severity} - {listing_title or 'Untitled'}"

    reasons_html = ""
    for reason in result["reasons"][:10]:
        reasons_html += f'<li style="font-size:14px;color:#374151;line-height:22px;margin:4px 0;">{reason}</li>'

    content = f"""
    <div style="background:{'#fef2f2' if severity == 'HIDDEN' else '#fff7ed'};border-radius:8px;padding:16px;text-align:center;margin:0 0 20px;">
      <p style="color:{'#dc2626' if severity == 'HIDDEN' else '#ea580c'};font-size:18px;font-weight:700;margin:0;">Listing {severity}</p>
    </div>

    <h2 style="font-size:22px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">Spam Detection Alert</h2>
    <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">
      A listing has been automatically {severity.lower()} by the spam detection system.
    </p>

    {_details_box([
        ("Listing", listing_title or "Untitled"),
        ("Owner", owner_name or "Unknown"),
        ("Spam Score", f"{result['spam_score']}/100"),
        ("Action Taken", severity),
    ])}

    <div style="background:#f3f4f6;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #6366f1;">
      <p style="font-size:14px;font-weight:600;color:#1e40af;margin:0 0 8px;">Detection Reasons:</p>
      <ul style="margin:0;padding-left:20px;">
        {reasons_html}
      </ul>
    </div>

    <p style="font-size:15px;line-height:24px;color:#374151;margin:16px 0 12px;">
      Please review this listing and take action. No listing will be deleted without your approval.
    </p>

    {_button("Review in Admin Panel", f"{FRONTEND_URL}/admin/spam-moderation")}

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:8px 0 0;">
      This is an automated alert from the MigRent spam detection system.
    </p>
    """

    text = (
        f"Listing {severity}: {listing_title or 'Untitled'}\n\n"
        f"Owner: {owner_name or 'Unknown'}\n"
        f"Spam Score: {result['spam_score']}/100\n\n"
        f"Reasons:\n" + "\n".join(f"- {r}" for r in result["reasons"][:10]) + "\n\n"
        f"Review: {FRONTEND_URL}/admin/spam-moderation\n\n"
        f"- MigRent System"
    )

    try:
        _send_email(founder_email, subject, _email_layout(content, f"Listing {severity}"), text)
        logger.info(f"Founder notified about {severity} listing {listing_id}")
    except Exception as e:
        logger.error(f"Failed to notify founder about listing {listing_id}: {e}")
