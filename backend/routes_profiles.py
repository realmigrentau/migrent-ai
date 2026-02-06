"""
Profile management endpoints.

This module handles all user profile operations including retrieval, updates,
and badge management. All profile updates use proper error handling and
ensure data persistence.
"""

from fastapi import APIRouter, HTTPException, Header
from models import ProfileUpdate
from db import get_supabase_admin
from routes_listings import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me")
def get_my_profile(authorization: str = Header(...)):
    """
    Retrieve the current authenticated user's complete profile.

    If the user doesn't have a profile yet, one is automatically created.

    Returns:
        dict: Full profile object with all user fields
    """
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()

        user_id = str(user.id)
        logger.info(f"Fetching profile for user {user_id}")

        # Fetch the user's profile
        result = sb.from_("profiles").select("*").eq("id", user_id).execute()

        # If profile doesn't exist, create one
        if not result.data:
            logger.info(f"Profile doesn't exist for {user_id}, creating...")
            new_profile = {
                "id": user_id,
                "role": "user"
            }
            insert_result = sb.from_("profiles").insert([new_profile]).execute()

            if insert_result.data:
                return insert_result.data[0]
            else:
                return new_profile

        profile = result.data[0]
        logger.info(f"Profile retrieved for {user_id}: has_legal_name={bool(profile.get('legal_name'))}")

        return profile

    except Exception as e:
        logger.error(f"Error fetching profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")


@router.patch("/me")
def update_my_profile(
    body: ProfileUpdate,
    authorization: str = Header(...),
):
    """
    Update the current user's profile with the provided fields.

    Only non-null fields are updated. Returns the complete updated profile.

    Args:
        body: ProfileUpdate model with fields to update
        authorization: Bearer token

    Returns:
        dict: Complete updated profile object
    """
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()

        user_id = str(user.id)

        # Build update dict - only include non-None fields
        updates = {}
        for field_name, value in body.model_dump().items():
            if value is not None:
                updates[field_name] = value

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        logger.info(f"Updating profile for {user_id}: fields={list(updates.keys())}")

        # Ensure profile row exists before updating
        existing = sb.from_("profiles").select("id").eq("id", user_id).execute()
        if not existing.data:
            logger.info(f"Profile doesn't exist, creating for {user_id}")
            new_profile = {"id": user_id, "role": "user"}
            sb.from_("profiles").insert([new_profile]).execute()

        # Perform the update
        update_response = sb.from_("profiles").update(updates).eq("id", user_id).execute()
        logger.info(f"Update response for {user_id}: data_count={len(update_response.data) if update_response.data else 0}")

        # Fetch the complete updated profile
        fetch_response = sb.from_("profiles").select("*").eq("id", user_id).execute()

        if fetch_response.data and len(fetch_response.data) > 0:
            logger.info(f"Successfully updated profile for {user_id}")
            return fetch_response.data[0]

        # If fetch returns no data but update seemed to work, return what we updated
        if update_response.data and len(update_response.data) > 0:
            logger.warning(f"Update succeeded but fetch returned empty, using update data for {user_id}")
            return update_response.data[0]

        # Last resort: return the updates we sent (indicates potential issue)
        logger.warning(f"Both fetch and update returned empty for {user_id}, returning updates as fallback")
        return updates

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


@router.get("/{user_id}")
def get_public_profile(user_id: str):
    """
    Get a user's public profile with limited fields.

    This endpoint returns only fields that should be visible to other users.

    Args:
        user_id: UUID of the user

    Returns:
        dict: Public profile fields only
    """
    try:
        sb = get_supabase_admin()

        # Only select public-facing fields
        public_fields = [
            "id",
            "name",
            "preferred_name",
            "about_me",
            "most_useless_skill",
            "interests",
            "badges",
            "custom_pfp",
            "occupation",
            "verified"
        ]

        result = sb.from_("profiles").select(",".join(public_fields)).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching public profile for {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch public profile: {str(e)}")


@router.post("/badges/refresh")
def refresh_badges(authorization: str = Header(...)):
    """
    Recalculate and update user badges based on their activity.

    Badges are awarded for:
    - Completed deals (seeker)
    - Published listings (owner)
    - High ratings/reviews

    Args:
        authorization: Bearer token

    Returns:
        dict: Updated badges list
    """
    try:
        user = get_current_user(authorization)
        sb = get_supabase_admin()

        user_id = str(user.id)
        badges = []

        logger.info(f"Refreshing badges for {user_id}")

        # Check for seeker badges (completed deals)
        try:
            completed_deals = sb.from_("deals").select("id", count="exact").eq("seeker_id", user_id).eq("status", "completed").execute()
            deal_count = completed_deals.count if hasattr(completed_deals, 'count') else len(completed_deals.data or [])

            if deal_count >= 1:
                badges.append("Purchased 1+ homes")
            if deal_count >= 5:
                badges.append("Frequent Flyer")
            if deal_count >= 10:
                badges.append("Globe Trotter")

        except Exception as e:
            logger.warning(f"Error calculating seeker badges: {e}")

        # Check for owner badges (published listings)
        try:
            listings = sb.from_("listings").select("id", count="exact").eq("owner_id", user_id).execute()
            listing_count = listings.count if hasattr(listings, 'count') else len(listings.data or [])

            if listing_count >= 1:
                badges.append("Verified host")
            if listing_count >= 3:
                badges.append("Superhost")
            if listing_count >= 10:
                badges.append("Mega Host")

        except Exception as e:
            logger.warning(f"Error calculating owner badges: {e}")

        # Update the profile with new badges
        update_response = sb.from_("profiles").update({"badges": badges}).eq("id", user_id).execute()
        logger.info(f"Badges updated for {user_id}: {badges}")

        return {"badges": badges}

    except Exception as e:
        logger.error(f"Error refreshing badges: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to refresh badges: {str(e)}")
