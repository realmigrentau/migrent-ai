"""
Messaging endpoints for real-time chat between seeker and owner.
Ensures communication only happens on active deals/listings.
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
    Send a message between seeker and owner on a listing.
    Validates that both users are involved in the deal/listing.
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

    # Verify listing exists and sender has access (owner or seeker on a deal)
    listing = sb.table("listings").select("id, owner_id").eq("id", body.listing_id).execute()
    if not listing.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing_owner = listing.data[0]["owner_id"]

    # Check if users are related to this listing:
    # 1. Sender is the owner OR
    # 2. There's an active deal between them on this listing
    if user.id != listing_owner:
        deal = (
            sb.table("deals")
            .select("id, status")
            .eq("listing_id", body.listing_id)
            .eq("seeker_id", user.id)
            .eq("owner_id", body.receiver_id)
            .execute()
        )
        if not deal.data:
            raise HTTPException(
                status_code=403,
                detail="No active deal between these users on this listing"
            )

    # Create message
    msg_data = {
        "sender_id": str(body.sender_id),
        "receiver_id": str(body.receiver_id),
        "listing_id": str(body.listing_id),
        "deal_id": str(body.deal_id) if body.deal_id else None,
        "message_text": body.message_text,
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
    Returns list of unique conversations (listing + other user).
    """
    user = get_current_user(authorization)
    sb = get_supabase()

    # Get messages where user is sender or receiver
    messages = (
        sb.table("messages")
        .select("*")
        .or_(f"sender_id.eq.{user.id},receiver_id.eq.{user.id}")
        .order("created_at", descending=True)
        .execute()
    )

    if not messages.data:
        return {"threads": []}

    # Group by listing + other user to create threads
    threads = {}
    for msg in messages.data:
        sender_id = msg["sender_id"]
        receiver_id = msg["receiver_id"]
        listing_id = msg["listing_id"]

        other_user_id = receiver_id if sender_id == user.id else sender_id
        thread_key = f"{listing_id}_{other_user_id}"

        if thread_key not in threads:
            threads[thread_key] = {
                "listing_id": listing_id,
                "other_user_id": other_user_id,
                "last_message": msg["message_text"],
                "last_message_at": msg["created_at"],
                "unread_count": 0,
            }

        # Count unread messages
        if msg["receiver_id"] == user.id and not msg["read_at"]:
            threads[thread_key]["unread_count"] += 1

    # Fetch other user names for display
    thread_list = []
    for thread_key, thread_data in threads.items():
        other_user = (
            sb.table("profiles")
            .select("name, custom_pfp")
            .eq("id", thread_data["other_user_id"])
            .execute()
        )
        if other_user.data:
            thread_data["other_user_name"] = other_user.data[0].get("name", "Unknown")
            thread_data["other_user_pfp"] = other_user.data[0].get("custom_pfp")

        thread_list.append(thread_data)

    return {"threads": thread_list}


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

    # Verify access: user must be one of the two in the thread
    # Get listing owner
    listing = sb.table("listings").select("owner_id").eq("id", listing_id).execute()
    if not listing.data:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing_owner = listing.data[0]["owner_id"]

    # User is either the owner or the seeker
    is_owner = user.id == listing_owner
    is_seeker_on_deal = (
        sb.table("deals")
        .select("id")
        .eq("listing_id", listing_id)
        .eq("seeker_id", user.id)
        .execute()
        .data
    )

    if not is_owner and not is_seeker_on_deal:
        raise HTTPException(status_code=403, detail="No access to this thread")

    # Get messages in this thread
    messages = (
        sb.table("messages")
        .select("*")
        .eq("listing_id", listing_id)
        .or_(
            f"and(sender_id.eq.{user.id},receiver_id.eq.{other_user_id}),"
            f"and(sender_id.eq.{other_user_id},receiver_id.eq.{user.id})"
        )
        .order("created_at", descending=False)
        .range(offset, offset + limit - 1)
        .execute()
    )

    # Mark messages as read
    if messages.data:
        unread_ids = [
            msg["id"]
            for msg in messages.data
            if msg["receiver_id"] == user.id and not msg["read_at"]
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
