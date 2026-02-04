const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * Register a new user account.
 * POST /auth/register
 */
export async function register(
  email: string,
  password: string,
  type: "seeker" | "owner"
) {
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, type }),
    });
    if (!res.ok) throw new Error(`Register failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("register error:", err);
    return null;
  }
}

/**
 * Log in and receive an access token.
 * POST /auth/login
 */
export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("login error:", err);
    return null;
  }
}

/**
 * Get AI-guided matches for a given postcode.
 * GET /matches?postcode=XXXX
 */
export async function getMatches(token: string, postcode: string) {
  try {
    const res = await fetch(
      `${BASE_URL}/matches?postcode=${encodeURIComponent(postcode)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error(`getMatches failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getMatches error:", err);
    return null;
  }
}

/**
 * Listing payload with all extended fields.
 */
export interface CreateListingPayload {
  address: string;
  postcode: string;
  weeklyPrice: number;
  description: string;
  title?: string;
  propertyType?: string;
  placeType?: string;
  maxGuests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  bathroomType?: string;
  whoElseLivesHere?: string;
  totalOtherPeople?: string;
  furnished?: boolean;
  billsIncluded?: boolean;
  parking?: boolean;
  highlights?: string[];
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  bond?: string;
  noSmoking?: boolean;
  quietHours?: string;
  tenantPrefs?: string;
  minStay?: string;
  securityCameras?: boolean;
  securityCamerasLocation?: string;
  weaponsOnProperty?: boolean;
  weaponsExplanation?: string;
  otherSafetyDetails?: string;
}

/**
 * Create a new listing as an owner.
 * POST /listings
 */
export async function createListing(
  token: string,
  payload: CreateListingPayload
) {
  try {
    const body: Record<string, any> = {
      address: payload.address,
      postcode: Number(payload.postcode),
      weekly_price: payload.weeklyPrice,
      description: payload.description,
    };

    // Add optional extended fields (snake_case for backend)
    if (payload.title) body.title = payload.title;
    if (payload.propertyType) body.property_type = payload.propertyType;
    if (payload.placeType) body.place_type = payload.placeType;
    if (payload.maxGuests !== undefined) body.max_guests = payload.maxGuests;
    if (payload.bedrooms !== undefined) body.bedrooms = payload.bedrooms;
    if (payload.beds !== undefined) body.beds = payload.beds;
    if (payload.bathrooms !== undefined) body.bathrooms = payload.bathrooms;
    if (payload.bathroomType) body.bathroom_type = payload.bathroomType;
    if (payload.whoElseLivesHere) body.who_else_lives_here = payload.whoElseLivesHere;
    if (payload.totalOtherPeople) body.total_other_people = payload.totalOtherPeople;
    if (payload.furnished !== undefined) body.furnished = payload.furnished;
    if (payload.billsIncluded !== undefined) body.bills_included = payload.billsIncluded;
    if (payload.parking !== undefined) body.parking = payload.parking;
    if (payload.highlights && payload.highlights.length > 0) body.highlights = payload.highlights;
    if (payload.weeklyDiscount !== undefined) body.weekly_discount = payload.weeklyDiscount;
    if (payload.monthlyDiscount !== undefined) body.monthly_discount = payload.monthlyDiscount;
    if (payload.bond) body.bond = payload.bond;
    if (payload.noSmoking !== undefined) body.no_smoking = payload.noSmoking;
    if (payload.quietHours) body.quiet_hours = payload.quietHours;
    if (payload.tenantPrefs) body.tenant_prefs = payload.tenantPrefs;
    if (payload.minStay) body.min_stay = payload.minStay;
    if (payload.securityCameras !== undefined) body.security_cameras = payload.securityCameras;
    if (payload.securityCamerasLocation) body.security_cameras_location = payload.securityCamerasLocation;
    if (payload.weaponsOnProperty !== undefined) body.weapons_on_property = payload.weaponsOnProperty;
    if (payload.weaponsExplanation) body.weapons_explanation = payload.weaponsExplanation;
    if (payload.otherSafetyDetails) body.other_safety_details = payload.otherSafetyDetails;

    const res = await fetch(`${BASE_URL}/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`createListing failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("createListing error:", err);
    return null;
  }
}

/**
 * Get listings (optionally filtered for the current owner).
 * GET /listings
 */
export async function getListings(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/listings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`getListings failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getListings error:", err);
    return null;
  }
}

/**
 * Create a Stripe Identity verification session.
 * POST /payments/create-verification-session
 */
export async function createVerificationSession(
  token: string,
  tier: "basic" | "full"
) {
  try {
    const res = await fetch(`${BASE_URL}/payments/create-verification-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tier }),
    });
    if (!res.ok)
      throw new Error(`createVerificationSession failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("createVerificationSession error:", err);
    return null;
  }
}

/**
 * Submit a support/contact request.
 * POST /support/contact
 */
export async function submitSupportRequest(data: {
  name: string;
  email: string;
  role: "seeker" | "owner";
  message: string;
}) {
  try {
    const res = await fetch(`${BASE_URL}/support/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok)
      throw new Error(`submitSupportRequest failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("submitSupportRequest error:", err);
    return null;
  }
}

// ── Profile endpoints ────────────────────────────────────────

/**
 * Get the current user's profile.
 * GET /profiles/me
 */
export async function getMyProfile(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/profiles/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`getMyProfile failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getMyProfile error:", err);
    return null;
  }
}

/**
 * Update the current user's profile.
 * PATCH /profiles/me
 */
export async function updateMyProfile(
  token: string,
  data: Record<string, any>
) {
  try {
    const res = await fetch(`${BASE_URL}/profiles/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`updateMyProfile failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return null;
  }
}

/**
 * Get a public profile by user ID.
 * GET /profiles/:user_id
 */
export async function getPublicProfile(userId: string) {
  try {
    const res = await fetch(`${BASE_URL}/profiles/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`getPublicProfile failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getPublicProfile error:", err);
    return null;
  }
}

/**
 * Refresh/recalculate badges for the current user.
 * POST /profiles/badges/refresh
 */
export async function refreshBadges(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/profiles/badges/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`refreshBadges failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("refreshBadges error:", err);
    return null;
  }
}

/**
 * Submit a report for a listing or profile.
 * POST /reports
 */
export async function submitReport(
  token: string,
  data: {
    item_type: "listing" | "profile";
    item_id: string;
    category: string;
    message?: string;
  }
) {
  try {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`submitReport failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("submitReport error:", err);
    return null;
  }
}
