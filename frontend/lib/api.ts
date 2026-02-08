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
  // Hosting / availability fields
  availableFrom?: string;
  availableTo?: string;
  instantBook?: boolean;
  internetIncluded?: boolean;
  internetSpeed?: string;
  petsAllowed?: boolean;
  petDetails?: string;
  airConditioning?: boolean;
  laundry?: string;
  dishwasher?: boolean;
  nearestTransport?: string;
  neighbourhoodVibe?: string;
  genderPreference?: string;
  couplesOk?: boolean;
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
    // Hosting / availability fields
    if (payload.availableFrom) body.available_from = payload.availableFrom;
    if (payload.availableTo) body.available_to = payload.availableTo;
    if (payload.instantBook !== undefined) body.instant_book = payload.instantBook;
    if (payload.internetIncluded !== undefined) body.internet_included = payload.internetIncluded;
    if (payload.internetSpeed) body.internet_speed = payload.internetSpeed;
    if (payload.petsAllowed !== undefined) body.pets_allowed = payload.petsAllowed;
    if (payload.petDetails) body.pet_details = payload.petDetails;
    if (payload.airConditioning !== undefined) body.air_conditioning = payload.airConditioning;
    if (payload.laundry) body.laundry = payload.laundry;
    if (payload.dishwasher !== undefined) body.dishwasher = payload.dishwasher;
    if (payload.nearestTransport) body.nearest_transport = payload.nearestTransport;
    if (payload.neighbourhoodVibe) body.neighbourhood_vibe = payload.neighbourhoodVibe;
    if (payload.genderPreference) body.gender_preference = payload.genderPreference;
    if (payload.couplesOk !== undefined) body.couples_ok = payload.couplesOk;

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
 * Search listings with filters (public, no auth required).
 * GET /listings/search
 */
export async function searchListings(params: Record<string, string>) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/listings/search?${queryString}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`searchListings failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("searchListings error:", err);
    return [];
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

// ── Deal endpoints ──────────────────────────────────────────

export interface CreateDealPayload {
  owner_id: string;
  seeker_id: string;
  listing_id: string;
  start_date?: string;
  end_date?: string;
  special_requests?: string;
  total_guests?: number;
  move_in_date?: string;
  move_out_date?: string;
  number_of_guests?: number;
  guest_names?: string;
  deal_notes?: string;
}

/**
 * Create a deal (owner initiates, triggers Stripe checkout).
 * POST /deals/create
 */
export async function createDeal(token: string, payload: CreateDealPayload) {
  try {
    const res = await fetch(`${BASE_URL}/deals/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`createDeal failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("createDeal error:", err);
    return null;
  }
}

/**
 * Get a deal by ID.
 * GET /deals/:deal_id
 */
export async function getDeal(token: string, dealId: string) {
  try {
    const res = await fetch(`${BASE_URL}/deals/${dealId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`getDeal failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getDeal error:", err);
    return null;
  }
}

/**
 * Cancel a deal.
 * PATCH /deals/:deal_id/cancel
 */
export async function cancelDeal(token: string, dealId: string) {
  try {
    const res = await fetch(`${BASE_URL}/deals/${dealId}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`cancelDeal failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("cancelDeal error:", err);
    return null;
  }
}

/**
 * Create seeker fee session (optional AUD 19 after owner pays).
 * POST /deals/seeker-fee-session
 */
export async function createSeekerFeeSession(token: string, dealId: string) {
  try {
    const res = await fetch(`${BASE_URL}/deals/seeker-fee-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ deal_id: dealId }),
    });
    if (!res.ok) throw new Error(`createSeekerFeeSession failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("createSeekerFeeSession error:", err);
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

// ── Block user ──────────────────────────────────────

/**
 * Block a user (inserts into blocked_users table via Supabase).
 */
export async function blockUser(blockedId: string): Promise<boolean> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const { error } = await supabase.from("blocked_users").insert({
      blocker_id: session.user.id,
      blocked_id: blockedId,
    });
    if (error && error.code === "23505") return true; // already blocked
    return !error;
  } catch (err) {
    console.error("blockUser error:", err);
    return false;
  }
}

/**
 * Unblock a user.
 */
export async function unblockUser(blockedId: string): Promise<boolean> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const { error } = await supabase.from("blocked_users").delete()
      .eq("blocker_id", session.user.id)
      .eq("blocked_id", blockedId);
    return !error;
  } catch (err) {
    console.error("unblockUser error:", err);
    return false;
  }
}

/**
 * Check if current user has blocked a specific user.
 */
export async function isUserBlocked(blockedId: string): Promise<boolean> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const { data } = await supabase.from("blocked_users").select("id")
      .eq("blocker_id", session.user.id)
      .eq("blocked_id", blockedId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

// ── Referral endpoints ──────────────────────────────────────

/**
 * Generate a referral code for the current user.
 * POST /referrals/generate
 */
export async function generateReferralCode(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/referrals/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`generateReferralCode failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("generateReferralCode error:", err);
    return null;
  }
}

/**
 * Apply a referral code.
 * POST /referrals/use
 */
export async function useReferralCode(token: string, referralCode: string) {
  try {
    const res = await fetch(`${BASE_URL}/referrals/use`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ referral_code: referralCode }),
    });
    if (!res.ok) throw new Error(`useReferralCode failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("useReferralCode error:", err);
    return null;
  }
}

/**
 * Get referrals created by the current user.
 * GET /referrals/my-referrals
 */
export async function getMyReferrals(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/referrals/my-referrals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`getMyReferrals failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getMyReferrals error:", err);
    return null;
  }
}

// ── Messaging endpoints ──────────────────────────────────────

/**
 * Send a message between seeker and owner.
 * POST /messages/send
 */
export async function sendMessage(
  token: string,
  data: {
    sender_id: string;
    receiver_id: string;
    listing_id: string;
    deal_id?: string;
    message_text: string;
  }
) {
  try {
    const res = await fetch(`${BASE_URL}/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`sendMessage failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("sendMessage error:", err);
    return null;
  }
}

/**
 * Get all message threads for the current user.
 * GET /messages/threads
 */
export async function getMessageThreads(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/messages/threads`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`getMessageThreads failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getMessageThreads error:", err);
    return null;
  }
}

/**
 * Get messages in a specific thread.
 * GET /messages/thread/:listing_id/:other_user_id
 */
export async function getThreadMessages(
  token: string,
  listingId: string,
  otherUserId: string,
  limit: number = 50
) {
  try {
    const res = await fetch(
      `${BASE_URL}/messages/thread/${listingId}/${otherUserId}?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error(`getThreadMessages failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getThreadMessages error:", err);
    return null;
  }
}

/**
 * Mark a message as read.
 * PATCH /messages/:message_id/read
 */
export async function markMessageRead(token: string, messageId: string) {
  try {
    const res = await fetch(`${BASE_URL}/messages/${messageId}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`markMessageRead failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("markMessageRead error:", err);
    return null;
  }
}

/**
 * Check if user completed onboarding.
 * GET /profiles/me/onboarding-status
 */
export async function checkOnboardingStatus(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/profiles/me/onboarding-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`checkOnboardingStatus failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("checkOnboardingStatus error:", err);
    return null;
  }
}

/**
 * Complete onboarding with required fields.
 * POST /profiles/me/onboarding/complete
 */
export async function completeOnboarding(token: string, data: Record<string, any>) {
  try {
    const res = await fetch(`${BASE_URL}/profiles/me/onboarding/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`completeOnboarding failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("completeOnboarding error:", err);
    return null;
  }
}
