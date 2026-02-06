import os
import stripe
from fastapi import APIRouter, HTTPException, Header
from db import get_supabase
from routes_listings import get_current_user

router = APIRouter(prefix="/payments", tags=["verification"])

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
stripe.api_key = STRIPE_SECRET_KEY

VERIFICATION_FEE_AUD = 1900  # AUD 19.00 in cents

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
VERIFICATION_SUCCESS_URL = f"{FRONTEND_URL}/verification-success?session_id={{CHECKOUT_SESSION_ID}}"
VERIFICATION_CANCEL_URL = f"{FRONTEND_URL}/verification-cancelled"


@router.post("/create-verification-session")
def create_verification_session(authorization: str = Header(...)):
    """
    Create a Stripe Checkout Session for seeker profile verification.
    Auth required — uses the authenticated user's ID (not client-supplied).
    """
    user = get_current_user(authorization)
    sb = get_supabase()

    # Check if user is already verified — no need to pay again
    try:
        res = sb.table("profiles").select("verified").eq("id", user.id).execute()
        if res.data and res.data[0].get("verified"):
            raise HTTPException(
                status_code=400,
                detail="User is already verified",
            )
    except HTTPException:
        raise
    except Exception:
        pass  # profiles row may not exist yet; that's fine

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            currency="aud",
            line_items=[
                {
                    "price_data": {
                        "currency": "aud",
                        "unit_amount": VERIFICATION_FEE_AUD,
                        "product_data": {
                            "name": "MigRent Seeker Verification",
                        },
                    },
                    "quantity": 1,
                }
            ],
            metadata={
                "user_id": user.id,
                "purpose": "verification",
            },
            payment_intent_data={
                "statement_descriptor": "MigRent Verify",  # max 22 chars
            },
            success_url=VERIFICATION_SUCCESS_URL,
            cancel_url=VERIFICATION_CANCEL_URL,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {e}")

    return {"checkout_url": session.url}
