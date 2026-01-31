import logging

from fastapi import APIRouter, HTTPException, Request
from models import UserRegister, UserLogin
from db import get_supabase
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
@limiter.limit("5/minute")
def register(request: Request, user: UserRegister):
    sb = get_supabase()
    try:
        res = sb.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {"data": {"user_type": user.type}},
        })
    except Exception as e:
        logger.exception("Registration error")
        raise HTTPException(status_code=400, detail="Registration failed. Check your email and password.")

    if res.user is None:
        raise HTTPException(status_code=400, detail="Registration failed")

    return {
        "user_id": res.user.id,
        "email": res.user.email,
        "access_token": res.session.access_token if res.session else None,
    }


@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, user: UserLogin):
    sb = get_supabase()
    try:
        res = sb.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password,
        })
    except Exception as e:
        logger.exception("Login error")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "user_id": res.user.id,
        "email": res.user.email,
        "access_token": res.session.access_token,
    }
