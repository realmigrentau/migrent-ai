#!/usr/bin/env node
/**
 * A tiny stand-in for the FastAPI backend, serving the PUBLIC data contract
 * with local fixtures. Used by Playwright (see playwright.config.ts) so the
 * end-to-end suite never touches Render, Supabase or production data.
 *
 *   node tests/e2e/mock-api.mjs   # listens on 127.0.0.1:8787
 */
import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.MOCK_API_PORT || 8787);
const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const plus = (days) => iso(new Date(today.getTime() + days * 86400000));

const verifiedOwner = {
  public_id: "pubverif02",
  name: "Verified Owner",
  avatar_url: null,
  bio: "Long-time host in Kellyville.",
  member_since: "2026-01-10",
  listings_count: 2,
  achievement_badges: ["Superhost"],
  verification: {
    status: "verified",
    checks: { email_confirmed: true, phone_confirmed: true, government_id: "approved" },
    verified_at: "2026-06-01T00:00:00+00:00",
    explainer_url: "/safety-verification",
    disclaimer: "Verification confirms documents were checked. It is not a guarantee of safety or suitability.",
  },
};
const unverifiedOwner = {
  ...verifiedOwner,
  public_id: "pubowner01",
  name: "Unverified Owner",
  achievement_badges: [],
  verification: {
    ...verifiedOwner.verification,
    status: "unverified",
    checks: { email_confirmed: true, phone_confirmed: false, government_id: "not_submitted" },
    verified_at: null,
  },
};

function listing(id, over = {}) {
  const owner = over.owner || verifiedOwner;
  return {
    id,
    title: "Sunny room near the station",
    suburb: "Kellyville",
    city: "Sydney",
    postcode: 2155,
    weekly_price: 320,
    description: "A bright private room with a window, five minutes from the station.",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"],
    property_type: "house",
    place_type: "private",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    furnished: true,
    bills_included: false,
    instant_book_enabled: false,
    available_from: plus(-10),
    available_to: plus(120),
    min_stay_weeks: 4,
    max_stay_weeks: 52,
    nearest_transport: "Kellyville - 6 min walk",
    station_distance_min: 6,
    security_cameras: false,
    created_at: "2026-08-01T00:00:00+00:00",
    display_address: "Kellyville 2155",
    location: { approx_lat: -33.711, approx_lng: 150.953, radius_m: 400, precision: "approximate" },
    public_state: "published",
    owner,
    host_verification: owner.verification,
    ...over,
  };
}

const LISTINGS = [
  listing("11111111-1111-4111-8111-000000000001"),
  listing("11111111-1111-4111-8111-000000000002", { title: "Studio in Parramatta", suburb: "Parramatta", postcode: 2150, weekly_price: 410, place_type: "entire", display_address: "Parramatta 2150", location: { approx_lat: -33.815, approx_lng: 151.001, radius_m: 400, precision: "approximate" } }),
  listing("11111111-1111-4111-8111-000000000003", { title: "Room with unverified host", owner: unverifiedOwner, host_verification: unverifiedOwner.verification, weekly_price: 250 }),
  listing("11111111-1111-4111-8111-000000000004", { title: "Available next month", available_from: plus(30), weekly_price: 290 }),
];
for (let i = 5; i <= 26; i++) {
  LISTINGS.push(listing(`11111111-1111-4111-8111-0000000000${String(i).padStart(2, "0")}`, { title: `Room ${i} in Blacktown`, suburb: "Blacktown", postcode: 2148, weekly_price: 200 + i * 5, display_address: "Blacktown 2148" }));
}
const EXPIRED = listing("22222222-2222-4222-8222-000000000001", {
  title: "Beautiful Rooms in Kellyville NSW",
  available_from: "2026-03-20",
  available_to: "2026-04-25",
  public_state: "expired",
  owner: unverifiedOwner,
  host_verification: unverifiedOwner.verification,
});

function matches(l, q) {
  const suburb = (q.get("suburb") || "").toLowerCase();
  if (suburb && !(l.suburb.toLowerCase().includes(suburb) || l.city.toLowerCase().includes(suburb))) return false;
  const max = Number(q.get("max_price"));
  if (max && l.weekly_price > max) return false;
  const min = Number(q.get("min_price"));
  if (min && l.weekly_price < min) return false;
  const checkIn = q.get("check_in");
  if (checkIn && l.available_from && l.available_from > checkIn) return false;
  if (checkIn && l.available_to && l.available_to < checkIn) return false;
  const checkOut = q.get("check_out");
  if (checkOut && l.available_to && l.available_to < checkOut) return false;
  if (q.get("verified_owner") === "true" && l.host_verification.status !== "verified") return false;
  if (q.get("place_type") && l.place_type !== q.get("place_type")) return false;
  return true;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const send = (status, body, headers = {}) => {
    res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-expose-headers": "X-Total-Count, X-Has-More", ...headers });
    res.end(JSON.stringify(body));
  };
  if (req.method === "OPTIONS") return send(204, {}, { "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "GET,POST,PATCH,DELETE" });
  if (url.pathname === "/health" || url.pathname === "/") return send(200, { status: "ok" });

  if (url.pathname === "/listings/search") {
    if (url.searchParams.get("suburb") === "__boom__") return send(500, { detail: "boom" });
    const ci = url.searchParams.get("check_in");
    const co = url.searchParams.get("check_out");
    if (ci && co && co <= ci) return send(400, { detail: "check_out must be after check_in" });
    const rows = LISTINGS.filter((l) => matches(l, url.searchParams));
    const limit = Number(url.searchParams.get("limit") || 20);
    const offset = Number(url.searchParams.get("offset") || 0);
    const page = rows.slice(offset, offset + limit);
    return send(200, page, { "X-Total-Count": String(rows.length), "X-Has-More": offset + page.length < rows.length ? "true" : "false" });
  }
  const detail = url.pathname.match(/^\/listings\/([0-9a-f-]+)$/i);
  if (detail) {
    const id = detail[1];
    if (id === EXPIRED.id) return send(410, { ...EXPIRED, viewer: { is_owner: false, can_moderate: false } });
    const found = LISTINGS.find((l) => l.id === id);
    if (!found) return send(404, { detail: "Listing not found" });
    return send(200, { ...found, viewer: { is_owner: false, can_moderate: false }, review_stats: { review_count: 0, avg_rating: 0, avg_migrant_friendliness: null, positive_count: 0 }, recent_reviews: [], similar_listings: LISTINGS.slice(1, 3) });
  }
  if (url.pathname === "/suburb/") return send(200, { suburbs: [{ slug: "kellyville" }] });
  if (url.pathname.startsWith("/profiles/")) return send(200, unverifiedOwner);
  if (url.pathname === "/stations/nearby") return send(200, []);
  return send(404, { detail: "not mocked" });
});

server.listen(PORT, "127.0.0.1", () => console.log(`mock api listening on http://127.0.0.1:${PORT}`));
