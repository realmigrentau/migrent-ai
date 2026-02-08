"""
Messaging endpoints for real-time chat between seeker and owner.
Supports direct messages (from profiles) and listing-based messages.
"""

from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Optional
from uuid import UUID

from models import MessageCreate, MessageOut
from db import get_supabase
from routes_listings import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])


# ── POST /messages/send ──────────────────────────────────────


@router.post("/send")
def send_message(
    body: MessageCreate,
    authorization: str = Header(...),
):
    """
    Send a message between users.
    Supports both listing-based and direct messages.
    """
    user = get_current_user(authorization)
    sb = get_supabase()

    # Validate sender is the authenticated user
    if user.id != body.sender_id:
        raise HTTPException(status_code=403, detail="Cannot send messages as another user")

    # Verify receiver exists
    receiver = sb.table("profiles").select("id").eq("id", body.receiver_id).execute()
    if not receiver.data:
        raise HTTPException(status_code=404, detail="Receiver not found")

    # If listing_id is provided, verify listing exists
    if body.listing_id:
        listing = sb.table("listings").select("id, owner_id").eq("id", body.listing_id).execute()
        if not listing.data:
            raise HTTPException(status_code=404, detail="Listing not found")

    # Create message
    msg_data = {
        "sender_id": str(body.sender_id),
        "receiver_id": str(body.receiver_id),
        "listing_id": str(body.listing_id) if body.listing_id else None,
        "deal_id": str(body.deal_id) if body.deal_id else None,
        "message_text": body.message_text,
        "message_html": body.message_html if body.message_html else None,
        "attachment_url": body.attachment_url if body.attachment_url else None,
        "attachment_name": body.attachment_name if body.attachment_name else None,
        "attachment_type": body.attachment_type if body.attachment_type else None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }

    result = sb.table("messages").insert(msg_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to send message")

    return {
        "success": True,
        "message": result.data[0]
    }


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
    sb = get_supabase()

    # Get messages where user is sender or receiver
    messages = (
        sb.table("messages")
        .select("*")
        .or_(f"sender_id.eq.{user.id},receiver_id.eq.{user.id}")
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

        other_user_id = receiver_id if sender_id == user.id else sender_id
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
        if msg["receiver_id"] == user.id and not msg.get("read_at"):
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
    sb = get_supabase()

    messages = (
        sb.table("messages")
        .select("*")
        .is_("listing_id", "null")
        .or_(
            f"and(sender_id.eq.{user.id},receiver_id.eq.{other_user_id}),"
            f"and(sender_id.eq.{other_user_id},receiver_id.eq.{user.id})"
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
            if msg["receiver_id"] == user.id and not msg.get("read_at")
        ]
        if unread_ids:
            for msg_id in unread_ids:
                sb.table("messages").update(
                    {"read_at": datetime.utcnow().isoformat()}
                ).eq("id", msg_id).execute()

    return {"messages": messages.data or []}


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
    sb = get_supabase()

    # Get messages in this thread
    messages = (
        sb.table("messages")
        .select("*")
        .eq("listing_id", listing_id)
        .or_(
            f"and(sender_id.eq.{user.id},receiver_id.eq.{other_user_id}),"
            f"and(sender_id.eq.{other_user_id},receiver_id.eq.{user.id})"
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
            if msg["receiver_id"] == user.id and not msg.get("read_at")
        ]
        if unread_ids:
            for msg_id in unread_ids:
                sb.table("messages").update(
                    {"read_at": datetime.utcnow().isoformat()}
                ).eq("id", msg_id).execute()

    return {"messages": messages.data or []}


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
    sb = get_supabase()

    msg = sb.table("messages").select("*").eq("id", message_id).execute()
    if not msg.data:
        raise HTTPException(status_code=404, detail="Message not found")

    if msg.data[0]["receiver_id"] != user.id:
        raise HTTPException(status_code=403, detail="Only receiver can mark as read")

    result = sb.table("messages").update(
        {"read_at": datetime.utcnow().isoformat()}
    ).eq("id", message_id).execute()

    return {"success": True, "message": result.data[0] if result.data else {}}
