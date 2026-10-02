"""
Messaging endpoints for real-time chat between seeker and owner.
Supports direct messages (from profiles) and listing-based messages.
"""

import re
import logging
from fastapi import APIRouter, File, Header, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID, uuid4

from models import MessageCreate, MessageOut
from pydantic import BaseModel, Field
from db import get_supabase_admin
from auth_utils import get_current_user, get_active_user
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/messages", tags=["messages"])

UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)


def _validate_uuid(value: str, field_name: str) -> str:
    """Validate that a string is a proper UUID to prevent query injection."""
    if not UUID_RE.match(value):
        raise HTTPException(status_code=400, detail=f"Invalid {field_name} format")
    return value


def _strip_markup(text: str) -> str:
    """Reduce a string to plain text.

    This replaces _sanitize_html, which was a regex tag-stripper feeding a
    column the frontend rendered with dangerouslySetInnerHTML. Two problems:
    the pattern required a closing ">", so an unterminated tag such as
    "<img src=x onerror=alert(1)" survived intact and the browser closed it on
    parse; and the row could be written straight to PostgREST, skipping this
    function altogether. Messages are now stored and rendered as plain text, so
    this is defence in depth rather than the only line.
    """
    if not text:
        return text
    return re.sub(r"<[^>]*>?", "", text)[:5000]


# ── POST /messages/send ──────────────────────────────────────


@router.post("/send")
@limiter.limit("30/minute")
def send_message(
    request: Request,
    body: MessageCreate,
    authorization: str = Header(...),
):
    """
    Send a message between users.
    Supports both listing-based and direct messages.
    """
    user = get_active_user(authorization)
    sb = get_supabase_admin()

    # Validate sender is the authenticated user (str() both sides to fix UUID vs string mismatch)
    if str(user.id) != str(body.sender_id):
        raise HTTPException(status_code=403, detail="Cannot send messages as another user")

    # Validate UUID formats to prevent query injection
    _validate_uuid(str(body.sender_id), "sender_id")
    _validate_uuid(str(body.receiver_id), "receiver_id")
    if body.listing_id:
        _validate_uuid(str(body.listing_id), "listing_id")
    if body.deal_id:
        _validate_uuid(str(body.deal_id), "deal_id")

    if str(body.receiver_id) == str(body.sender_id):
        raise HTTPException(status_code=400, detail="You cannot message yourself")

    # Verify receiver exists
    receiver = sb.table("profiles").select("id").eq("id", str(body.receiver_id)).execute()
    if not receiver.data:
        raise HTTPException(status_code=404, detail="Receiver not found")

    # Either party may have blocked the other. Fails closed (blocks.py).
    from blocks import require_not_blocked

    require_not_blocked(sb, str(body.sender_id), str(body.receiver_id))

    # If listing_id is provided, the thread context must be real: the
    # listing must exist and one side of the conversation must own it.
    if body.listing_id:
        listing = sb.table("listings").select("id, owner_id, moderation_status").eq("id", str(body.listing_id)).execute()
        if not listing.data:
            raise HTTPException(status_code=404, detail="Listing not found")
        owner = str(listing.data[0].get("owner_id"))
        if owner not in (str(body.sender_id), str(body.receiver_id)):
            raise HTTPException(status_code=403, detail="That listing does not belong to this conversation")
        if listing.data[0].get("moderation_status") == "deleted":
            raise HTTPException(status_code=404, detail="Listing not found")

    # Attachments must have been uploaded by this sender through
    # /messages/attachments; the path is namespaced by sender id.
    attachment_path = None
    if body.attachment_path:
        if not body.attachment_path.startswith(f"{body.sender_id}/") or ".." in body.attachment_path:
            raise HTTPException(status_code=400, detail="Invalid attachment")
        attachment_path = body.attachment_path

    # Create message (sanitize HTML to prevent XSS)
    msg_data = {
        "sender_id": str(body.sender_id),
        "receiver_id": str(body.receiver_id),
        "listing_id": str(body.listing_id) if body.listing_id else None,
        "deal_id": str(body.deal_id) if body.deal_id else None,
        "message_text": _strip_markup(body.message_text),
        # message_html is never persisted. The client no longer sends it and
        # the renderer no longer reads it; accepting it would only reopen the
        # stored-XSS path. body.message_html is ignored on purpose.
        "message_html": None,
        # Public attachment URLs are never stored; readers get a short-lived
        # signed URL generated from attachment_path.
        "attachment_url": None,
        "attachment_path": attachment_path,
        "attachment_name": body.attachment_name if (attachment_path and body.attachment_name) else None,
        "attachment_type": body.attachment_type if (attachment_path and body.attachment_type) else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    result = sb.table("messages").insert(msg_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to send message")

    _notify_new_message(sb, body)
    flag_risky_message(sb, result.data[0])

    return {
        "success": True,
        "message": result.data[0]
    }


def flag_risky_message(sb, message: dict) -> None:
    """A message with scam signs (message_safety.py) is delivered, and the
    recipient sees a warning; Migrent's admins get one report per sender per
    day, so a run of messages does not flood the queue. Never raises."""
    from message_safety import RISK_LABELS, message_risks

    try:
        risks = message_risks(message.get("message_text"))
        if not risks:
            return
        sender = str(message.get("sender_id"))
        marker = f"Sender {sender}"
        since = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        recent = (
            sb.table("reports")
            .select("id")
            .eq("item_type", "message")
            .eq("source", "system")
            .gte("created_at", since)
            .like("details", f"{marker}%")
            .limit(1)
            .execute()
            .data
        )
        if recent:
            return
        excerpt = (message.get("message_text") or "")[:500]
        sb.table("reports").insert(
            {
                "reporter_id": None,
                "source": "system",
                "item_type": "message",
                "item_id": str(message.get("id")),
                "listing_id": str(message.get("id")),
                "reason": "Possible scam message",
                "details": f"{marker} to {message.get('receiver_id')}. Signs: {'; '.join(RISK_LABELS[r] for r in risks)}.\n\n{excerpt}",
                "status": "pending",
                "priority": "high",
            }
        ).execute()
    except Exception:
        logger.exception("could not flag message %s", message.get("id"))


def thread_key(listing_id: Optional[str], other_user_id: str) -> str:
    """The Hub's conversation key: listing + the other person."""
    return f"{listing_id or 'direct'}_{other_user_id}"


def _notify_new_message(sb, body: MessageCreate) -> None:
    """One notification per message: in-app always, plus email and push
    through notify() - which respects the receiver's email preferences - unless
    they muted this conversation. Links straight to the conversation in
    Migrent Hub. Never raises."""
    try:
        from hub_common import notify_user

        receiver = str(body.receiver_id)
        key = thread_key(str(body.listing_id) if body.listing_id else None, str(body.sender_id))
        try:
            state = sb.table("conversation_states").select("muted").eq("user_id", receiver).eq("thread_key", key).execute()
            if state.data and state.data[0].get("muted"):
                return
        except Exception:
            pass  # table missing before 043: nothing is muted

        sender = sb.table("profiles").select("name, preferred_name").eq("id", str(body.sender_id)).execute()
        sender_name = "Someone"
        if sender.data:
            sender_name = (sender.data[0].get("preferred_name") or sender.data[0].get("name") or "Someone").split(" ")[0]
        about = ""
        if body.listing_id:
            listing = sb.table("listings").select("title, suburb").eq("id", str(body.listing_id)).execute()
            if listing.data:
                about = f" about {listing.data[0].get('title') or listing.data[0].get('suburb') or 'a home'}"
        preview = (body.message_text or "").strip()
        preview = preview[:160] + ("..." if len(preview) > 160 else "") if preview else "Sent an attachment"
        notify_user(
            sb,
            receiver,
            "message_received",
            f"New message from {sender_name}{about}",
            preview,
            f"/messages/{key}",
            entity_type="message",
            entity_id=str(body.listing_id) if body.listing_id else None,
        )
    except Exception as e:
        logger.warning("Failed to notify about new message: %s", e)


ATTACHMENT_BUCKET = "message-attachments"
ATTACHMENT_URL_TTL = 600  # seconds


def _sign_attachments(sb, messages: list[dict]) -> list[dict]:
    """Replace attachment_path with a short-lived signed URL for the
    participants reading the thread. The path itself is not returned.

    Every attachment in the thread is signed in one request (each one used to
    be its own round trip); if that fails they are signed one by one."""
    paths = [m.pop("attachment_path", None) for m in messages]
    wanted = sorted({p for p in paths if p})
    batch: dict[str, Optional[str]] = {}
    if len(wanted) > 1:
        try:
            for item in sb.storage.from_(ATTACHMENT_BUCKET).create_signed_urls(wanted, ATTACHMENT_URL_TTL):
                if item.get("path") and not item.get("error"):
                    batch[item["path"]] = item.get("signedURL") or item.get("signedUrl")
        except Exception:
            batch = {}
    for m, path in zip(messages, paths):
        if path:
            if batch.get(path):
                m["attachment_url"] = batch[path]
                continue
            try:
                signed = sb.storage.from_(ATTACHMENT_BUCKET).create_signed_url(path, ATTACHMENT_URL_TTL)
                m["attachment_url"] = signed.get("signedURL") or signed.get("signedUrl") if isinstance(signed, dict) else signed
            except Exception:
                logger.warning("Could not sign attachment for message %s", m.get("id"))
                m["attachment_url"] = None
        elif m.get("attachment_url") and "/object/public/" in str(m.get("attachment_url")):
            # Legacy public attachment: still reachable, but do not advertise.
            pass
    return messages


@router.post("/attachments")
@limiter.limit("20/minute")
async def upload_attachment(
    request: Request,
    file: UploadFile = File(...),
    authorization: str = Header(...),
):
    """Upload a message attachment to the private bucket.

    Validates by magic bytes (JPEG, PNG, WebP, GIF, PDF), caps size at 10MB,
    re-encodes images to strip EXIF, and namespaces the path by the sender so
    a later send cannot reference someone else's file.
    """
    from uploads import ImageValidationError, prepare_public_image, sniff_pdf, validate_private_document

    user = get_active_user(authorization)
    uid = str(user.id)
    data = await file.read()
    try:
        content_type, ext = validate_private_document(data)
        if not sniff_pdf(data):
            prepared = prepare_public_image(data, max_bytes=10 * 1024 * 1024, max_side=2048, min_side=16)
            data, content_type, ext = prepared.data, prepared.content_type, prepared.extension
    except ImageValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

    safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", (file.filename or "attachment"))[:80]
    path = f"{uid}/{int(datetime.now(timezone.utc).timestamp())}_{uuid4().hex[:8]}.{ext}"
    sb = get_supabase_admin()
    try:
        sb.storage.from_(ATTACHMENT_BUCKET).upload(path=path, file=data, file_options={"content-type": content_type})
    except Exception:
        logger.exception("Attachment upload failed")
        raise HTTPException(status_code=500, detail="Upload failed. Please try again.")
    return {"attachment_path": path, "attachment_name": safe_name, "attachment_type": content_type}


# ── GET /messages/threads ────────────────────────────────────


@router.get("/threads")
def get_message_threads(
    authorization: str = Header(...),
):
    """
    Get all message threads for the authenticated user.
    Returns list of unique conversations (listing + other user) or direct conversations.
    """
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    uid = str(user.id)

    # Get messages where user is sender or receiver (uid is from JWT, safe)
    messages = (
        sb.table("messages")
        .select("*")
        .or_(f"sender_id.eq.{uid},receiver_id.eq.{uid}")
        .order("created_at", desc=True)
        .execute()
    )

    if not messages.data:
        return {"threads": []}

    # Group by (listing + other user) OR (direct: other user only)
    threads = {}
    for msg in messages.data:
        sender_id = msg["sender_id"]
        receiver_id = msg["receiver_id"]
        listing_id = msg.get("listing_id") or "direct"

        other_user_id = receiver_id if sender_id == uid else sender_id
        thread_key = f"{listing_id}_{other_user_id}"

        if thread_key not in threads:
            threads[thread_key] = {
                "listing_id": msg.get("listing_id"),
                "other_user_id": other_user_id,
                "last_message": msg["message_text"],
                "last_message_at": msg["created_at"],
                "unread_count": 0,
                "is_direct": not msg.get("listing_id"),
            }

        # Count unread messages
        if msg["receiver_id"] == uid and not msg.get("read_at"):
            threads[thread_key]["unread_count"] += 1

    # Fetch other user names for display
    thread_list = []
    for thread_key, thread_data in threads.items():
        other_user = (
            sb.table("profiles")
            .select("name, preferred_name, custom_pfp")
            .eq("id", thread_data["other_user_id"])
            .execute()
        )
        if other_user.data:
            thread_data["other_user_name"] = other_user.data[0].get("preferred_name") or other_user.data[0].get("name", "Unknown")
            thread_data["other_user_pfp"] = other_user.data[0].get("custom_pfp")
        else:
            thread_data["other_user_name"] = "Unknown"

        thread_list.append(thread_data)

    return {"threads": thread_list}


# ── GET /messages/thread/:other_user_id ──────────────────────
# Direct messages (no listing)


@router.get("/direct/{other_user_id}")
def get_direct_messages(
    other_user_id: str,
    authorization: str = Header(...),
    limit: int = 50,
    offset: int = 0,
):
    """
    Get direct messages with another user (no listing context).
    """
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    uid = str(user.id)

    # Validate other_user_id to prevent query injection
    _validate_uuid(other_user_id, "other_user_id")

    messages = (
        sb.table("messages")
        .select("*")
        .is_("listing_id", "null")
        .or_(
            f"and(sender_id.eq.{uid},receiver_id.eq.{other_user_id}),"
            f"and(sender_id.eq.{other_user_id},receiver_id.eq.{uid})"
        )
        .order("created_at", desc=False)
        .range(offset, offset + limit - 1)
        .execute()
    )

    # Mark unread messages as read
    if messages.data:
        unread_ids = [
            msg["id"]
            for msg in messages.data
            if msg["receiver_id"] == uid and not msg.get("read_at")
        ]
        if unread_ids:
            for msg_id in unread_ids:
                sb.table("messages").update(
                    {"read_at": datetime.now(timezone.utc).isoformat()}
                ).eq("id", msg_id).execute()

    return {"messages": _sign_attachments(sb, messages.data or [])}


# ── GET /messages/thread/:listing_id/:other_user_id ─────────


@router.get("/thread/{listing_id}/{other_user_id}")
def get_thread_messages(
    listing_id: str,
    other_user_id: str,
    authorization: str = Header(...),
    limit: int = 50,
    offset: int = 0,
):
    """
    Get messages in a specific thread (listing + other user).
    Paginates with limit/offset.
    """
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    uid = str(user.id)

    # Validate IDs to prevent query injection
    _validate_uuid(listing_id, "listing_id")
    _validate_uuid(other_user_id, "other_user_id")

    # Get messages in this thread
    messages = (
        sb.table("messages")
        .select("*")
        .eq("listing_id", listing_id)
        .or_(
            f"and(sender_id.eq.{uid},receiver_id.eq.{other_user_id}),"
            f"and(sender_id.eq.{other_user_id},receiver_id.eq.{uid})"
        )
        .order("created_at", desc=False)
        .range(offset, offset + limit - 1)
        .execute()
    )

    # Mark messages as read
    if messages.data:
        unread_ids = [
            msg["id"]
            for msg in messages.data
            if msg["receiver_id"] == uid and not msg.get("read_at")
        ]
        if unread_ids:
            for msg_id in unread_ids:
                sb.table("messages").update(
                    {"read_at": datetime.now(timezone.utc).isoformat()}
                ).eq("id", msg_id).execute()

    return {"messages": _sign_attachments(sb, messages.data or [])}


# ── PATCH /messages/:message_id/read ─────────────────────────


@router.patch("/{message_id}/read")
def mark_message_read(
    message_id: str,
    authorization: str = Header(...),
):
    """
    Mark a single message as read.
    Only receiver can mark as read.
    """
    user = get_current_user(authorization)
    sb = get_supabase_admin()
    uid = str(user.id)

    _validate_uuid(message_id, "message_id")

    msg = sb.table("messages").select("*").eq("id", message_id).execute()
    if not msg.data:
        raise HTTPException(status_code=404, detail="Message not found")

    if msg.data[0]["receiver_id"] != uid:
        raise HTTPException(status_code=403, detail="Only receiver can mark as read")

    result = sb.table("messages").update(
        {"read_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", message_id).execute()

    return {"success": True, "message": result.data[0] if result.data else {}}


# ── POST /messages/read ──────────────────────────────────────


class MarkReadRequest(BaseModel):
    message_ids: list[str] = Field(..., min_length=1, max_length=200)


@router.post("/read")
@limiter.limit("60/minute")
def mark_messages_read(
    request: Request,
    body: MarkReadRequest,
    authorization: str = Header(...),
):
    """Mark a batch of messages as read.

    Replaces the frontend writing read_at straight to Supabase. Only messages
    the caller actually received are touched: the receiver_id filter is applied
    server-side, so a caller cannot mark someone else's mail as read.
    """
    user = get_current_user(authorization)
    uid = str(user.id)
    sb = get_supabase_admin()

    for mid in body.message_ids:
        _validate_uuid(mid, "message_id")

    result = (
        sb.table("messages")
        .update({"read_at": datetime.now(timezone.utc).isoformat()})
        .in_("id", body.message_ids)
        .eq("receiver_id", uid)
        .is_("read_at", "null")
        .execute()
    )

    return {"success": True, "updated": len(result.data or [])}
