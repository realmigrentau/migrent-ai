const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// -- Types --

export interface FlaggedListing {
  id: string;
  title: string;
  address: string;
  suburb: string;
  postcode: number;
  city: string;
  weekly_price: number;
  images: string[];
  description: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  owner_photo: string | null;
  owner_verified: boolean;
  moderation_status: string;
  moderation_notes: string | null;
  spam_score: number;
  spam_reasons: string[];
  flagged_at: string | null;
  hidden_at: string | null;
  delete_requested_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  bedrooms: number | null;
  property_type: string | null;
}

export interface FlaggedListingsResponse {
  listings: FlaggedListing[];
  counts: {
    flagged: number;
    hidden: number;
    delete_requested: number;
  };
  limit: number;
  offset: number;
}

export interface ModerationEvent {
  id: string;
  listing_id: string;
  actor_id: string | null;
  actor_name: string;
  actor_type: string;
  event_type: string;
  old_status: string | null;
  new_status: string | null;
  spam_score: number | null;
  reasons: string[] | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SpamStats {
  flagged: number;
  hidden: number;
  delete_requested: number;
  deleted: number;
  avg_spam_score: number;
  total_requiring_action: number;
}

// -- Helper --

async function spamFetch(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
}

// -- API functions --

export async function fetchFlaggedListings(
  token: string,
  params?: {
    status?: string;
    min_score?: number;
    limit?: number;
    offset?: number;
    sort?: string;
  }
): Promise<FlaggedListingsResponse> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.min_score) q.set("min_score", String(params.min_score));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  if (params?.sort) q.set("sort", params.sort);
  return spamFetch(`/admin/spam/flagged?${q.toString()}`, token);
}

export async function fetchModerationEvents(
  token: string,
  listingId: string
): Promise<{ events: ModerationEvent[] }> {
  return spamFetch(`/admin/spam/events/${listingId}`, token);
}

export async function fetchSpamStats(token: string): Promise<SpamStats> {
  return spamFetch("/admin/spam/stats", token);
}

export async function approveFlaggedListing(
  token: string,
  listingId: string,
  notes?: string
): Promise<{ message: string }> {
  return spamFetch(`/admin/spam/${listingId}/approve`, token, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export async function hideListing(
  token: string,
  listingId: string,
  reason?: string,
  notes?: string
): Promise<{ message: string }> {
  return spamFetch(`/admin/spam/${listingId}/hide`, token, {
    method: "POST",
    body: JSON.stringify({ reason, notes }),
  });
}

export async function requestDeleteListing(
  token: string,
  listingId: string,
  reason: string,
  notes?: string
): Promise<{ message: string }> {
  return spamFetch(`/admin/spam/${listingId}/request-delete`, token, {
    method: "POST",
    body: JSON.stringify({ reason, notes }),
  });
}

export async function confirmDeleteListing(
  token: string,
  listingId: string,
  notes?: string
): Promise<{ message: string }> {
  return spamFetch(`/admin/spam/${listingId}/confirm-delete`, token, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export async function unflagListing(
  token: string,
  listingId: string,
  notes?: string
): Promise<{ message: string }> {
  return spamFetch(`/admin/spam/${listingId}/unflag`, token, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export async function rescanListing(
  token: string,
  listingId: string
): Promise<{ spam_score: number; reasons: string[]; action: string }> {
  return spamFetch(`/admin/spam/${listingId}/rescan`, token, {
    method: "POST",
  });
}
