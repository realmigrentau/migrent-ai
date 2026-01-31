import logging
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, HTTPException, Request
from db import get_supabase
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/support", tags=["support"])


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    role: str = Field(..., pattern="^(seeker|owner)$")
    message: str = Field(..., min_length=10, max_length=5000)


@router.post("/contact")
@limiter.limit("3/minute")
def submit_contact(request: Request, body: ContactRequest):
    sb = get_supabase()
    try:
        sb.table("support_requests").insert({
            "name": body.name,
            "email": body.email,
            "role": body.role,
            "message": body.message,
        }).execute()
    except Exception:
        logger.exception("Failed to save support request")
        raise HTTPException(status_code=500, detail="Failed to submit your request. Please try again.")

    return {"status": "ok", "message": "Your message has been received."}
