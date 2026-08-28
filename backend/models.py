from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime, date
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


# ── Listing models ──────────────────────────────────────────


class ListingCreate(BaseModel):
    address: str = Field(..., min_length=5, max_length=300)
    suburb: Optional[str] = Field(None, max_length=100)
    postcode: int = Field(..., ge=800, le=9999)
    city: Optional[str] = Field(None, max_length=100)
    weekly_price: float = Field(..., gt=0, le=50000)
    description: str = Field(..., min_length=10, max_length=5000)
    images: list[str] = Field(default=[], max_length=20)
    # Extended fields
    title: Optional[str] = Field(None, max_length=80)
    property_type: Optional[str] = None
    place_type: Optional[str] = None
    max_guests: Optional[int] = Field(None, ge=1, le=20)
    bedrooms: Optional[int] = Field(None, ge=1, le=10)
    beds: Optional[int] = Field(None, ge=1, le=20)
    bathrooms: Optional[int] = Field(None, ge=1, le=5)
    bathroom_type: Optional[str] = None
    who_else_lives_here: Optional[str] = None
    total_other_people: Optional[str] = None
    furnished: Optional[bool] = None
    bills_included: Optional[bool] = None
    parking: Optional[bool] = None
    highlights: Optional[list[str]] = None
    weekly_discount: Optional[float] = Field(None, ge=0, le=50)
    monthly_discount: Optional[float] = Field(None, ge=0, le=70)
    bond: Optional[str] = None
    no_smoking: Optional[bool] = None
    quiet_hours: Optional[str] = None
    tenant_prefs: Optional[str] = None
    min_stay: Optional[str] = None
    security_cameras: Optional[bool] = None
    security_cameras_location: Optional[str] = None
    weapons_on_property: Optional[bool] = None
    weapons_explanation: Optional[str] = None
    other_safety_details: Optional[str] = None
    # Hosting / availability fields
    available_from: Optional[str] = None
    available_to: Optional[str] = None
    instant_book: Optional[bool] = None
    internet_included: Optional[bool] = None
    internet_speed: Optional[str] = None
    pets_allowed: Optional[bool] = None
    pet_details: Optional[str] = None
    air_conditioning: Optional[bool] = None
    laundry: Optional[str] = None
    dishwasher: Optional[bool] = None
    nearest_transport: Optional[str] = None
    neighbourhood_vibe: Optional[str] = None
    gender_preference: Optional[str] = None
    couples_ok: Optional[bool] = None
    # Geocoding fields (set by frontend after address autocomplete)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)


class ListingUpdate(BaseModel):
    """All listing fields are optional for partial updates."""
    address: Optional[str] = Field(None, min_length=5, max_length=300)
    suburb: Optional[str] = Field(None, max_length=100)
    postcode: Optional[int] = Field(None, ge=800, le=9999)
    city: Optional[str] = Field(None, max_length=100)
    weekly_price: Optional[float] = Field(None, gt=0, le=50000)
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    images: Optional[list[str]] = Field(None, max_length=20)
    title: Optional[str] = Field(None, max_length=80)
    property_type: Optional[str] = None
    place_type: Optional[str] = None
    max_guests: Optional[int] = Field(None, ge=1, le=20)
    bedrooms: Optional[int] = Field(None, ge=1, le=10)
    beds: Optional[int] = Field(None, ge=1, le=20)
    bathrooms: Optional[int] = Field(None, ge=1, le=5)
    bathroom_type: Optional[str] = None
    who_else_lives_here: Optional[str] = None
    total_other_people: Optional[str] = None
    furnished: Optional[bool] = None
    bills_included: Optional[bool] = None
    parking: Optional[bool] = None
    highlights: Optional[list[str]] = None
    weekly_discount: Optional[float] = Field(None, ge=0, le=50)
    monthly_discount: Optional[float] = Field(None, ge=0, le=70)
    bond: Optional[str] = None
    no_smoking: Optional[bool] = None
    quiet_hours: Optional[str] = None
    tenant_prefs: Optional[str] = None
    min_stay: Optional[str] = None
    security_cameras: Optional[bool] = None
    security_cameras_location: Optional[str] = None
    weapons_on_property: Optional[bool] = None
    weapons_explanation: Optional[str] = None
    other_safety_details: Optional[str] = None
    available_from: Optional[str] = None
    available_to: Optional[str] = None
    instant_book: Optional[bool] = None
    internet_included: Optional[bool] = None
    internet_speed: Optional[str] = None
    pets_allowed: Optional[bool] = None
    pet_details: Optional[str] = None
    air_conditioning: Optional[bool] = None
    laundry: Optional[str] = None
    dishwasher: Optional[bool] = None
    nearest_transport: Optional[str] = None
    neighbourhood_vibe: Optional[str] = None
    gender_preference: Optional[str] = None
    couples_ok: Optional[bool] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    is_active: Optional[bool] = None


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


# ── Profile models ──────────────────────────────────────────


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    about_me: Optional[str] = Field(None, max_length=200)
    most_useless_skill: Optional[str] = Field(None, max_length=200)
    interests: Optional[list[str]] = Field(None, max_length=5)
    custom_pfp: Optional[str] = None
    occupation: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = Field(None, ge=16, le=120)
    visa_type: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    preferred_suburbs: Optional[str] = None
    move_in_date: Optional[str] = None
    lifestyle: Optional[list[str]] = None
    bio: Optional[str] = Field(None, max_length=1000)
    phone: Optional[str] = Field(None, max_length=20)
    rooms_owned: Optional[int] = Field(None, ge=0)
    properties_owned: Optional[int] = Field(None, ge=0)
    notify_email: Optional[bool] = None
    notify_sms: Optional[bool] = None
    # Extended fields
    legal_name: Optional[str] = Field(None, max_length=150)
    preferred_name: Optional[str] = Field(None, max_length=100)
    phones: Optional[list[str]] = None
    residential_address: Optional[str] = Field(None, max_length=300)
    suburb_city: Optional[str] = Field(None, max_length=100)
    nearest_station: Optional[str] = Field(None, max_length=200)
    emergency_contact: Optional[dict] = Field(None, description="Emergency contact info: {name, phone, relationship}")
    preferred_language: Optional[str] = Field(None, max_length=20)
    preferred_currency: Optional[str] = Field(None, max_length=5)
    timezone: Optional[str] = Field(None, max_length=50)
    wishlist: Optional[list[str]] = None
    # identity_verified and identity_verification_url are deliberately NOT
    # accepted here. They were writable through PATCH /profiles/me, which let
    # any user award themselves the "ID verified" badge that the listing page
    # and owner card display as a trust signal. They are set only by the
    # verification flow (routes_owner_verification.py) and the Stripe webhook,
    # both of which run under the service role.
    # Dashboard role. Restricted to the two UI modes: 'superadmin' and 'admin'
    # are not accepted, so this endpoint cannot be used to escalate privilege.
    role: Optional[Literal["seeker", "owner"]] = None


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
    # Deal customization fields
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    special_requests: Optional[str] = Field(None, max_length=500)
    total_guests: Optional[int] = Field(None, ge=1, le=20)
    # Extended deal fields
    move_in_date: Optional[str] = None
    move_out_date: Optional[str] = None
    number_of_guests: Optional[int] = Field(None, ge=1, le=20)
    guest_names: Optional[str] = Field(None, max_length=500)
    deal_notes: Optional[str] = Field(None, max_length=1000)


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
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    special_requests: Optional[str] = None
    total_guests: Optional[int] = None
    move_in_date: Optional[str] = None
    move_out_date: Optional[str] = None
    number_of_guests: Optional[int] = None
    guest_names: Optional[str] = None
    deal_notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class SeekerFeeRequest(BaseModel):
    deal_id: str


# ── Booking models ─────────────────────────────────────────


class BookingType(str, Enum):
    request_to_book = "REQUEST_TO_BOOK"
    instant_book = "INSTANT_BOOK"


class BookingStatus(str, Enum):
    pending_owner = "PENDING_OWNER"
    owner_accepted = "OWNER_ACCEPTED"
    owner_declined = "OWNER_DECLINED"
    seeker_cancelled = "SEEKER_CANCELLED"
    paid = "PAID"
    completed = "COMPLETED"
    expired = "EXPIRED"


class BookingCreate(BaseModel):
    listing_id: str
    check_in: str = Field(..., description="Check-in date (YYYY-MM-DD)")
    check_out: str = Field(..., description="Check-out date (YYYY-MM-DD)")
    guests: int = Field(1, ge=1, le=20)
    message_to_owner: Optional[str] = Field(None, max_length=1000)


class BookingRespond(BaseModel):
    action: Literal["accept", "decline"]


# ── Message models ──────────────────────────────────────────


class MessageCreate(BaseModel):
    sender_id: str
    receiver_id: str
    listing_id: Optional[str] = None
    deal_id: Optional[str] = None
    message_text: str = Field(..., min_length=1, max_length=5000)
    message_html: Optional[str] = Field(None, max_length=5000)
    attachment_url: Optional[str] = Field(None, max_length=500)
    attachment_name: Optional[str] = Field(None, max_length=200)
    attachment_type: Optional[str] = Field(None, max_length=50)


class MessageOut(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    listing_id: Optional[str] = None
    deal_id: Optional[str] = None
    message_text: str
    message_html: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_name: Optional[str] = None
    attachment_type: Optional[str] = None
    read_at: Optional[str] = None
    created_at: str
    updated_at: str
