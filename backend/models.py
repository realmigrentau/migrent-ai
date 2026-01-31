from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    type: Literal["seeker", "owner"]

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c.isalpha() for c in v):
            raise ValueError("Password must contain at least one letter")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class ListingCreate(BaseModel):
    address: str = Field(..., min_length=5, max_length=300)
    postcode: int = Field(..., ge=800, le=9999)
    city: Optional[str] = Field(None, max_length=100)
    weekly_price: float = Field(..., gt=0, le=50000)
    description: str = Field(..., min_length=10, max_length=5000)
    images: list[str] = Field(default=[], max_length=20)


class ListingOut(BaseModel):
    id: str
    address: str
    postcode: int
    city: Optional[str]
    weekly_price: float
    description: str
    images: list[str]
    owner_id: str


class MatchOut(BaseModel):
    listing: ListingOut
    match_score: int


# ── Deal models ──────────────────────────────────────────────


class DealStatus(str, Enum):
    initiated = "initiated"
    awaiting_owner_payment = "awaiting_owner_payment"
    owner_paid = "owner_paid"
    awaiting_seeker_optional = "awaiting_seeker_optional"
    completed = "completed"
    cancelled = "cancelled"


class DealCreate(BaseModel):
    owner_id: str
    seeker_id: str
    listing_id: str


class DealOut(BaseModel):
    id: str
    owner_id: str
    seeker_id: str
    listing_id: str
    status: str
    owner_fee_amount: float
    seeker_fee_amount: float
    owner_payment_stripe_session_id: Optional[str] = None
    seeker_payment_stripe_session_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class SeekerFeeRequest(BaseModel):
    deal_id: str
