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
 * Uses GET with query params: GET /matches?postcode=XXXX
 * The backend stub is flexible; we chose GET for simplicity.
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
 * Create a new listing as an owner.
 * POST /listings
 */
export async function createListing(
  token: string,
  payload: {
    address: string;
    postcode: string;
    weeklyPrice: number;
    description: string;
  }
) {
  try {
    const res = await fetch(`${BASE_URL}/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
 * Returns an object with a session URL to redirect to.
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
 * TODO: This endpoint must exist in the backend later.
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
