import { API_BASE_URL as BASE_URL } from "./apiBase";
export interface PendingListing {
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
  created_at: string;
  bedrooms: number | null;
  property_type: string | null;
  furnished: boolean | null;
  bills_included: boolean | null;
}

export interface PendingListingsResponse {
  listings: PendingListing[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminStats {
  pending: number;
  approved_today: number;
  rejected_today: number;
  changes_requested_today: number;
  total_listings: number;
  approval_rate: number;
}

export interface AdminActivity {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  reason: string | null;
  notes: string | null;
  listing_title: string;
  listing_suburb: string;
  created_at: string;
}

async function adminFetch(path: string, token: string, options?: RequestInit) {
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

export async function fetchPendingListings(
  token: string,
  params?: { limit?: number; offset?: number; suburb?: string; sort?: string }
): Promise<PendingListingsResponse> {
  const q = new URLSearchParams();
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  if (params?.suburb) q.set("suburb", params.suburb);
  if (params?.sort) q.set("sort", params.sort);
  return adminFetch(`/admin/pending?${q.toString()}`, token);
}

export async function fetchAdminModerationStats(token: string): Promise<AdminStats> {
  return adminFetch("/admin/stats", token);
}

export async function fetchAdminActivity(
  token: string,
  limit = 20
): Promise<{ activities: AdminActivity[] }> {
  return adminFetch(`/admin/activity?limit=${limit}`, token);
}

export async function fetchListingDetailAdmin(token: string, listingId: string) {
  return adminFetch(`/admin/listings/${listingId}`, token);
}

export async function approveListing(
  token: string,
  listingId: string,
  notes?: string
): Promise<{ message: string }> {
  return adminFetch(`/admin/listings/${listingId}/approve`, token, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export async function rejectListing(
  token: string,
  listingId: string,
  reason: string,
  notes?: string
): Promise<{ message: string }> {
  return adminFetch(`/admin/listings/${listingId}/reject`, token, {
    method: "POST",
    body: JSON.stringify({ reason, notes }),
  });
}

export async function requestListingChanges(
  token: string,
  listingId: string,
  notes: string
): Promise<{ message: string }> {
  return adminFetch(`/admin/listings/${listingId}/request-changes`, token, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}
