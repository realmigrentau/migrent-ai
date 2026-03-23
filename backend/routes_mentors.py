import os
import logging
import stripe
from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel, Field
from typing import Optional
from db import get_supabase_admin
from auth_utils import get_current_user
from notifications import send_push_to_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mentors", tags=["mentors"])

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
stripe.api_key = STRIPE_SECRET_KEY

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
PLATFORM_FEE_PERCENT = 30  # MigRent takes 30%


# -- Models --

class MentorCreate(BaseModel):
    suburb: str = Field(..., min_length=2, max_length=100)
    postcode: Optional[int] = Field(None, ge=800, le=9999)
    languages: list[str] = Field(default=["English"])
    bio: Optional[str] = Field(None, max_length=2000)
    specialties: list[str] = Field(default=[])
    hourly_rate: int = Field(2500, ge=1500, le=10000)


class MentorUpdate(BaseModel):
    suburb: Optional[str] = Field(None, max_length=100)
    postcode: Optional[int] = Field(None, ge=800, le=9999)
    languages: Optional[list[str]] = None
    bio: Optional[str] = Field(None, max_length=2000)
    specialties: Optional[list[str]] = None
    hourly_rate: Optional[int] = Field(None, ge=1500, le=10000)
    availability_slots: Optional[list[dict]] = None
    active: Optional[bool] = None


class SessionCreate(BaseModel):
    mentor_id: str
    suburb: str
    preferred_language: Optional[str] = None
    session_type: str = Field("video_call", pattern="^(video_call|in_person|chat)$")
    scheduled_at: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=1000)


class ReviewCreate(BaseModel):
    session_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)


# -- Helper: enrich mentors with profile data --

def enrich_mentors_with_profiles(sb, mentors: list) -> list:
    """Fetch profile data for a list of mentors and attach it."""
    if not mentors:
        return mentors

    user_ids = [m["user_id"] for m in mentors]
    profiles_res = sb.table("profiles").select(
        "id, name, custom_pfp, verified"
    ).in_("id", user_ids).execute()

    profile_map = {}
    for p in (profiles_res.data or []):
        profile_map[p["id"]] = p

    for mentor in mentors:
        profile = profile_map.get(mentor["user_id"], {})
        mentor["profiles"] = {
            "name": profile.get("name", "Mentor"),
            "custom_pfp": profile.get("custom_pfp"),
            "verified": profile.get("verified", False),
        }

    return mentors


# -- GET /mentors - Browse mentors --

@router.get("")
def list_mentors(
    suburb: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
):
    try:
        sb = get_supabase_admin()

        query = sb.table("mentors").select("*").eq("active", True).order("rating", desc=True)

        if suburb:
            query = query.ilike("suburb", f"%{suburb}%")

        if language:
            query = query.contains("languages", [language])

        query = query.range(offset, offset + limit - 1)
        res = query.execute()

        mentors = enrich_mentors_with_profiles(sb, res.data or [])
        return {"mentors": mentors, "count": len(mentors)}
    except Exception as e:
        logger.error(f"Failed to list mentors: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list mentors: {str(e)}")


# -- POST /mentors - Become a mentor --

@router.post("")
def create_mentor(
    body: MentorCreate,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    existing = sb.table("mentors").select("id").eq("user_id", user_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="You are already registered as a mentor")

    mentor_row = {
        "user_id": user_id,
        "suburb": body.suburb,
        "postcode": body.postcode,
        "languages": body.languages,
        "bio": body.bio,
        "specialties": body.specialties,
        "hourly_rate": body.hourly_rate,
    }

    try:
        res = sb.table("mentors").insert(mentor_row).execute()
    except Exception as e:
        logger.error(f"Failed to create mentor: {e}")
        raise HTTPException(status_code=500, detail="Failed to create mentor profile")

    return {"mentor": res.data[0]}


# -- IMPORTANT: Static routes MUST come before /{mentor_id} --


# -- GET /mentors/me/profile - Get own mentor profile --

@router.get("/me/profile")
def get_my_mentor_profile(
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    res = sb.table("mentors").select("*").eq("user_id", user_id).execute()
    if not res.data:
        return {"mentor": None}

    return {"mentor": res.data[0]}


# -- PATCH /mentors/me - Update mentor profile --

@router.patch("/me")
def update_mentor(
    body: MentorUpdate,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    existing = sb.table("mentors").select("id").eq("user_id", user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Mentor profile not found")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    res = sb.table("mentors").update(updates).eq("user_id", user_id).execute()
    return {"mentor": res.data[0]}


# -- POST /mentors/sessions - Book a mentor session --

@router.post("/sessions")
def create_session(
    body: SessionCreate,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    mentor_res = sb.table("mentors").select("*").eq("id", body.mentor_id).execute()
    if not mentor_res.data:
        raise HTTPException(status_code=404, detail="Mentor not found")

    mentor = mentor_res.data[0]

    if mentor["user_id"] == user_id:
        raise HTTPException(status_code=400, detail="You cannot book yourself")

    if not mentor["active"]:
        raise HTTPException(status_code=400, detail="This mentor is not currently available")

    amount = mentor["hourly_rate"]
    platform_fee = int(amount * PLATFORM_FEE_PERCENT / 100)
    mentor_payout = amount - platform_fee

    session_row = {
        "mentor_id": body.mentor_id,
        "seeker_id": user_id,
        "suburb": body.suburb,
        "preferred_language": body.preferred_language,
        "session_type": body.session_type,
        "scheduled_at": body.scheduled_at,
        "notes": body.notes,
        "amount": amount,
        "platform_fee": platform_fee,
        "mentor_payout": mentor_payout,
        "status": "PENDING",
    }

    try:
        res = sb.table("mentor_sessions").insert(session_row).execute()
    except Exception as e:
        logger.error(f"Failed to create session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create session")

    session_data = res.data[0]

    # Create Stripe checkout
    try:
        checkout = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            currency="aud",
            line_items=[{
                "price_data": {
                    "currency": "aud",
                    "unit_amount": amount,
                    "product_data": {
                        "name": f"MigRent Mentor Session - {mentor.get('suburb', 'Local Guide')}",
                    },
                },
                "quantity": 1,
            }],
            metadata={
                "mentor_session_id": session_data["id"],
                "fee_type": "mentor_session",
            },
            success_url=f"{FRONTEND_URL}/mentor-session-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/mentors",
        )

        sb.table("mentor_sessions").update({
            "stripe_session_id": checkout.id,
            "status": "PAID",
        }).eq("id", session_data["id"]).execute()

        session_data["checkout_url"] = checkout.url

    except Exception as e:
        logger.error(f"Stripe checkout failed: {e}")
        raise HTTPException(status_code=500, detail="Payment processing failed")

    # Push notification to mentor
    try:
        seeker_profile = sb.table("profiles").select("name").eq("id", user_id).execute()
        seeker_name = seeker_profile.data[0]["name"] if seeker_profile.data else "Someone"
        send_push_to_user(
            user_id=mentor["user_id"],
            title="New mentor session booked!",
            body=f"{seeker_name} wants a {body.session_type.replace('_', ' ')} in {body.suburb}",
            url=f"{FRONTEND_URL}/dashboard",
        )
    except Exception:
        pass

    return {"session": session_data}


# -- GET /mentors/sessions/me - Get my sessions --

@router.get("/sessions/me")
def get_my_sessions(
    role: str = Query("seeker"),
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    if role == "mentor":
        mentor_res = sb.table("mentors").select("id").eq("user_id", user_id).execute()
        if not mentor_res.data:
            return {"sessions": []}
        mentor_id = mentor_res.data[0]["id"]
        res = sb.table("mentor_sessions").select("*").eq(
            "mentor_id", mentor_id
        ).order("created_at", desc=True).execute()
    else:
        res = sb.table("mentor_sessions").select("*").eq(
            "seeker_id", user_id
        ).order("created_at", desc=True).execute()

    return {"sessions": res.data or []}


# -- POST /mentors/reviews - Leave a review --

@router.post("/reviews")
def create_review(
    body: ReviewCreate,
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    session_res = sb.table("mentor_sessions").select("*").eq("id", body.session_id).execute()
    if not session_res.data:
        raise HTTPException(status_code=404, detail="Session not found")

    session = session_res.data[0]
    if session["seeker_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only the session seeker can leave a review")

    if session["status"] not in ("PAID", "COMPLETED"):
        raise HTTPException(status_code=400, detail="Can only review completed sessions")

    review_row = {
        "mentor_id": session["mentor_id"],
        "seeker_id": user_id,
        "session_id": body.session_id,
        "rating": body.rating,
        "comment": body.comment,
    }

    try:
        res = sb.table("mentor_reviews").insert(review_row).execute()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create review")

    # Update mentor rating
    try:
        reviews = sb.table("mentor_reviews").select("rating").eq("mentor_id", session["mentor_id"]).execute()
        if reviews.data:
            avg = sum(r["rating"] for r in reviews.data) / len(reviews.data)
            sb.table("mentors").update({
                "rating": round(avg, 2),
                "review_count": len(reviews.data),
            }).eq("id", session["mentor_id"]).execute()
    except Exception:
        pass

    return {"review": res.data[0]}


# -- POST /mentors/stripe-onboard - Start Stripe Connect onboarding --

@router.post("/stripe-onboard")
def stripe_onboard(
    authorization: str = Header(...),
):
    user = get_current_user(authorization)
    user_id = str(user.id)
    sb = get_supabase_admin()

    mentor_res = sb.table("mentors").select("*").eq("user_id", user_id).execute()
    if not mentor_res.data:
        raise HTTPException(status_code=404, detail="Mentor profile not found")

    mentor = mentor_res.data[0]

    if mentor.get("stripe_account_id"):
        account_id = mentor["stripe_account_id"]
    else:
        try:
            account = stripe.Account.create(
                type="express",
                country="AU",
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True},
                },
                metadata={"mentor_id": mentor["id"], "user_id": user_id},
            )
            account_id = account.id
            sb.table("mentors").update({
                "stripe_account_id": account_id,
            }).eq("id", mentor["id"]).execute()
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to create Stripe account")

    try:
        link = stripe.AccountLink.create(
            account=account_id,
            refresh_url=f"{FRONTEND_URL}/become-mentor?stripe=refresh",
            return_url=f"{FRONTEND_URL}/become-mentor?stripe=complete",
            type="account_onboarding",
        )
        return {"url": link.url}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create onboarding link")


# -- GET /mentors/{mentor_id} - Mentor profile (MUST be last) --

@router.get("/{mentor_id}")
def get_mentor(mentor_id: str):
    sb = get_supabase_admin()

    res = sb.table("mentors").select("*").eq("id", mentor_id).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Mentor not found")

    mentor = res.data[0]

    # Get profile
    profile_res = sb.table("profiles").select(
        "id, name, custom_pfp, verified, about_me"
    ).eq("id", mentor["user_id"]).execute()
    if profile_res.data:
        mentor["profiles"] = profile_res.data[0]
    else:
        mentor["profiles"] = {"name": "Mentor", "custom_pfp": None, "verified": False, "about_me": None}

    # Get reviews
    reviews_res = sb.table("mentor_reviews").select("*").eq(
        "mentor_id", mentor_id
    ).order("created_at", desc=True).limit(10).execute()

    # Enrich reviews with profile names
    review_list = reviews_res.data or []
    if review_list:
        seeker_ids = [r["seeker_id"] for r in review_list]
        seeker_profiles = sb.table("profiles").select(
            "id, name, custom_pfp"
        ).in_("id", seeker_ids).execute()
        sp_map = {p["id"]: p for p in (seeker_profiles.data or [])}
        for r in review_list:
            r["profiles"] = sp_map.get(r["seeker_id"], {"name": "Anonymous", "custom_pfp": None})

    mentor["reviews"] = review_list

    return mentor
