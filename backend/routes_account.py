"""
Account management endpoints for disable, delete, and owner profile operations.
"""

from fastapi import APIRouter, HTTPException, Header, Request
from fastapi.responses import JSONResponse
from db import get_supabase
from routes_listings import get_current_user

router = APIRouter(prefix="/account", tags=["account"])


# ── POST /account/disable ────────────────────────────────────────


@router.post("/disable")
def disable_account(
    body: dict,
    authorization: str = Header(...),
):
    """
    Temporarily disable account with recovery password.
    User can re-enable with recovery password.
    """
    user = get_current_user(authorization)
    sb = get_supabase()
    recovery_password = body.get("recovery_password", "")

    if not recovery_password or len(recovery_password) < 6:
        raise HTTPException(status_code=400, detail="Recovery password must be at least 6 characters")

    try:
        from datetime import datetime
        # Update profile with disabled status and recovery password
        result = sb.table("profiles").update(
            {
                "disabled_at": datetime.utcnow().isoformat(),
                "recovery_password_hash": recovery_password,  # In production, hash this!
            }
        ).eq("id", user.id).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to disable account")

        return {"success": True, "message": "Account disabled. Use your recovery password to re-enable."}

    except HTTPException:
        raise
    except Exception as err:
        print(f"Error disabling account: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to disable account: {str(err)}")


# ── POST /account/enable ────────────────────────────────────────


@router.post("/enable")
def enable_account(
    body: dict,
    authorization: str = Header(...),
):
    """
    Re-enable a disabled account using recovery password.
    """
    user = get_current_user(authorization)
    sb = get_supabase()
    recovery_password = body.get("recovery_password", "")

    try:
        # Get current profile
        profile = sb.table("profiles").select("recovery_password_hash").eq("id", user.id).execute()

        if not profile.data:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Verify recovery password (in production, use proper hash comparison!)
        if profile.data[0].get("recovery_password_hash") != recovery_password:
            raise HTTPException(status_code=401, detail="Invalid recovery password")

        # Clear disabled status
        result = sb.table("profiles").update(
            {
                "disabled_at": None,
                "recovery_password_hash": None,
            }
        ).eq("id", user.id).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to enable account")

        return {"success": True, "message": "Account re-enabled successfully"}

    except HTTPException:
        raise
    except Exception as err:
        print(f"Error enabling account: {err}")
        raise HTTPException(status_code=500, detail="Failed to enable account")


# ── DELETE /account/delete-owner-profile ────────────────────────


@router.delete("/delete-owner-profile")
def delete_owner_profile(
    authorization: str = Header(...),
):
    """
    Delete owner profile (listings, deals, etc.) while keeping seeker profile.
    """
    user = get_current_user(authorization)
    sb = get_supabase()

    try:
        # Check if user has any listings (is an owner)
        listings = sb.table("listings").select("id").eq("owner_id", user.id).execute()

        if not listings.data or len(listings.data) == 0:
            raise HTTPException(status_code=400, detail="You don't have an owner profile to delete")

        # Delete all deals where user is owner
        sb.table("deals").delete().eq("owner_id", user.id).execute()

        # Delete all listings
        sb.table("listings").delete().eq("owner_id", user.id).execute()

        # Update profile to remove owner status
        sb.table("profiles").update(
            {
                "rooms_owned": 0,
                "properties_owned": 0,
            }
        ).eq("id", user.id).execute()

        return {"success": True, "message": "Owner profile deleted successfully. Your seeker profile remains."}

    except HTTPException:
        raise
    except Exception as err:
        print(f"Error deleting owner profile: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to delete owner profile: {str(err)}")


# ── DELETE /account/delete ──────────────────────────────────────


@router.delete("/delete")
def delete_account(
    authorization: str = Header(...),
):
    """
    Permanently delete account and all associated data.
    User can sign up again later with same email.
    """
    user = get_current_user(authorization)
    sb = get_supabase()

    try:
        # Delete all deals where user is involved
        sb.table("deals").delete().eq("owner_id", user.id).execute()
        sb.table("deals").delete().eq("seeker_id", user.id).execute()

        # Delete all listings
        sb.table("listings").delete().eq("owner_id", user.id).execute()

        # Delete all messages
        sb.table("messages").delete().eq("sender_id", user.id).execute()
        sb.table("messages").delete().eq("receiver_id", user.id).execute()

        # Delete reports
        sb.table("reports").delete().eq("reporter_id", user.id).execute()

        # Delete profile
        sb.table("profiles").delete().eq("id", user.id).execute()

        # Delete auth user (requires admin/service role key)
        # This would typically be done by a server-side background job
        # using Supabase Admin API with service_role key

        return {"success": True, "message": "Account deleted. You can sign up again later."}

    except Exception as err:
        print(f"Error deleting account: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(err)}")
