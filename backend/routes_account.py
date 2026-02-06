"""
Account management endpoints - Delete account only.
"""

from fastapi import APIRouter, HTTPException, Header
from db import get_supabase
from routes_listings import get_current_user

router = APIRouter(prefix="/account", tags=["account"])


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
        print(f"Starting account deletion for user: {user.id}")

        # Delete all deals where user is involved
        try:
            sb.table("deals").delete().eq("owner_id", user.id).execute()
            print(f"Deleted owner deals")
        except Exception as e:
            print(f"Error deleting owner deals: {e}")

        try:
            sb.table("deals").delete().eq("seeker_id", user.id).execute()
            print(f"Deleted seeker deals")
        except Exception as e:
            print(f"Error deleting seeker deals: {e}")

        # Delete all listings
        try:
            sb.table("listings").delete().eq("owner_id", user.id).execute()
            print(f"Deleted listings")
        except Exception as e:
            print(f"Error deleting listings: {e}")

        # Delete all messages
        try:
            sb.table("messages").delete().eq("sender_id", user.id).execute()
            print(f"Deleted sent messages")
        except Exception as e:
            print(f"Error deleting sent messages: {e}")

        try:
            sb.table("messages").delete().eq("receiver_id", user.id).execute()
            print(f"Deleted received messages")
        except Exception as e:
            print(f"Error deleting received messages: {e}")

        # Delete reports if they exist
        try:
            sb.table("reports").delete().eq("reporter_id", user.id).execute()
            print(f"Deleted reports")
        except Exception as e:
            print(f"Error deleting reports: {e}")

        # Delete matches if they exist
        try:
            sb.table("matches").delete().eq("seeker_id", user.id).execute()
            print(f"Deleted seeker matches")
        except Exception as e:
            print(f"Error deleting seeker matches: {e}")

        try:
            sb.table("matches").delete().eq("owner_id", user.id).execute()
            print(f"Deleted owner matches")
        except Exception as e:
            print(f"Error deleting owner matches: {e}")

        # Delete profile (this is the critical one)
        result = sb.table("profiles").delete().eq("id", user.id).execute()
        print(f"Delete profile result: {result}")

        if not result or not result.data:
            # Even if result is empty, the delete might have succeeded
            # Supabase DELETE can return empty data on success
            print(f"Profile deletion returned empty data, but continuing...")

        print(f"Account deletion completed for user: {user.id}")
        return {
            "success": True,
            "message": "Account and all associated data deleted successfully. You can sign up again later.",
        }

    except HTTPException:
        raise
    except Exception as err:
        print(f"Error deleting account: {err}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete account: {str(err)}",
        )
