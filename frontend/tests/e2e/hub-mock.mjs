/**
 * Migrent Hub for the mock API: a fake Supabase Auth plus the /hub/*
 * endpoints, over in-memory state, so Playwright (and local visual review)
 * can sign in and walk real Hub journeys without Render, Supabase or
 * production data.
 *
 * Test accounts (fixtures only - they exist nowhere else):
 *   renter@example.test  Sarah Chen, renter with an application in review
 *   owner@example.test   Priya Nair, owner with two properties
 *   new@example.test     a new account that has not onboarded
 *   admin@example.test   a Migrent administrator
 *   tenant@example.test  Tom Nguyen, renting Room 2 from Priya (a tenancy)
 *   boss@example.test    Omar Haddad, an owner who is also an admin (the
 *                        Admin panel link in a normal account)
 *   grace@example.test   Grace, a renter who is also an admin (the lockout
 *                        test uses her, so no other test is locked out)
 * Password for all of them: TEST_PASSWORD below. The Admin panel's own
 * password is ADMIN_PANEL_PASSWORD.
 *
 * Shapes mirror backend/routes_hub*.py. Keep them in step.
 */
import crypto from "node:crypto";

export const TEST_PASSWORD = "hub-test-pass-1";
export const ADMIN_PANEL_PASSWORD = "panel-test-pass-1";

const now = () => new Date();
const iso = (d) => d.toISOString();
const dayIso = (d) => d.toISOString().slice(0, 10);
const inDays = (n, h = 10, m = 30) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(h - 10, m, 0, 0); // h in AEST (UTC+10)
  return d;
};
const uuid = () => crypto.randomUUID();

const USERS = {
  "aaaa0000-0000-4000-8000-000000000001": { email: "renter@example.test", name: "Sarah Chen", role: "seeker", onboarded: true, created_at: "2026-05-02T00:00:00Z" },
  "aaaa0000-0000-4000-8000-000000000002": { email: "owner@example.test", name: "Priya Nair", role: "owner", owner_kind: "individual", onboarded: true, created_at: "2026-02-14T00:00:00Z" },
  "aaaa0000-0000-4000-8000-000000000003": { email: "new@example.test", name: "", role: null, onboarded: false, created_at: iso(now()) },
  "aaaa0000-0000-4000-8000-000000000004": { email: "admin@example.test", name: "Ada Admin", role: "superadmin", is_admin: true, onboarded: true, created_at: "2026-01-01T00:00:00Z" },
  "aaaa0000-0000-4000-8000-000000000005": { email: "tenant@example.test", name: "Tom Nguyen", role: "seeker", onboarded: true, created_at: "2026-04-20T00:00:00Z" },
  "aaaa0000-0000-4000-8000-000000000006": { email: "newowner@example.test", name: "Liam Park", role: "owner", owner_kind: "individual", onboarded: true, created_at: "2026-09-18T00:00:00Z" },
  "aaaa0000-0000-4000-8000-000000000007": { email: "boss@example.test", name: "Omar Haddad", role: "owner", owner_kind: "individual", is_admin: true, onboarded: true, created_at: "2026-01-05T00:00:00Z" },
  "aaaa0000-0000-4000-8000-000000000008": { email: "grace@example.test", name: "Grace Admin", role: "seeker", is_admin: true, onboarded: true, created_at: "2026-01-06T00:00:00Z" },
};
const RENTER = "aaaa0000-0000-4000-8000-000000000001";
const OWNER = "aaaa0000-0000-4000-8000-000000000002";

// Short stays: one accepted and waiting for the host's fee, one new request.
const STAY_LISTING = { id: "11111111-1111-4111-8111-000000000099", title: "Short stay room in Ryde", city: "Sydney", images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"] };
const STAYS = [
  { id: "bbbb0000-0000-4000-8000-000000000001", listing_id: STAY_LISTING.id, owner_id: OWNER, seeker_id: RENTER, status: "OWNER_ACCEPTED", check_in_date: "2026-11-02", check_out_date: "2026-11-30", guests: 1, total_price: 1520, message_to_owner: null, listing: STAY_LISTING, created_at: "2026-09-30T00:00:00Z" },
  { id: "bbbb0000-0000-4000-8000-000000000002", listing_id: STAY_LISTING.id, owner_id: OWNER, seeker_id: "aaaa0000-0000-4000-8000-000000000005", status: "PENDING_OWNER", check_in_date: "2026-12-07", check_out_date: "2026-12-21", guests: 1, total_price: 760, message_to_owner: "Hi!", listing: STAY_LISTING, created_at: "2026-09-30T00:00:00Z" },
];
const TENANT = "aaaa0000-0000-4000-8000-000000000005";
const NEW_OWNER = "aaaa0000-0000-4000-8000-000000000006";

/* ── Auth ──────────────────────────────────────────────── */

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
function token(uid) {
  const iat = Math.floor(Date.now() / 1000);
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: uid, email: USERS[uid].email, role: "authenticated", aud: "authenticated", aal: "aal1", amr: [{ method: "password", timestamp: iat }], session_id: uid, iat, exp: iat + 3600 })}.mock`;
}
function uidFromAuth(req) {
  const h = req.headers.authorization || "";
  const t = h.replace(/^Bearer /, "");
  try {
    const p = JSON.parse(Buffer.from(t.split(".")[1], "base64url").toString());
    return USERS[p.sub] ? p.sub : null;
  } catch {
    return null;
  }
}
function authUser(uid) {
  const u = USERS[uid];
  return {
    id: uid,
    aud: "authenticated",
    role: "authenticated",
    email: u.email,
    email_confirmed_at: u.created_at,
    confirmed_at: u.created_at,
    phone: "",
    last_sign_in_at: iso(now()),
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: { full_name: u.name },
    identities: [],
    factors: [],
    created_at: u.created_at,
    updated_at: iso(now()),
  };
}
function session(uid) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: token(uid), token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: `refresh-${uid}`, user: authUser(uid) };
}

/* ── Listings (shared with the public mock) ─────────────── */

let LISTINGS = [];
const OWNED = {
  "11111111-1111-4111-8111-000000000001": { owner: OWNER, property: "prop-smith", unit_label: "Room 1", moderation_status: "approved", occupancy: "vacant", address: "15 Smith Street" },
  "11111111-1111-4111-8111-000000000004": { owner: OWNER, property: "prop-smith", unit_label: "Room 2", moderation_status: "approved", occupancy: "occupied", address: "15 Smith Street" },
  "11111111-1111-4111-8111-000000000002": { owner: OWNER, property: "prop-church", unit_label: null, moderation_status: "approved", occupancy: "vacant", address: "8 Church Street" },
};
const PROPERTIES = [
  { id: "prop-smith", owner_id: OWNER, nickname: "Smith Street share house", relationship: "owner", street_address: "15 Smith Street", suburb: "Kellyville", state: "NSW", postcode: 2155, property_type: "house", bedrooms: 4, bathrooms: 2, parking_spaces: 2, created_at: "2026-03-01T00:00:00Z" },
  { id: "prop-church", owner_id: OWNER, nickname: null, relationship: "owner", street_address: "8 Church Street", suburb: "Parramatta", state: "NSW", postcode: 2150, property_type: "apartment", bedrooms: 1, bathrooms: 1, parking_spaces: 1, created_at: "2026-04-12T00:00:00Z" },
];

function stateOf(postcode) {
  const pc = Number(postcode);
  if (pc >= 3000 && pc < 4000) return "VIC";
  if (pc >= 4000 && pc < 5000) return "QLD";
  return "NSW";
}

function card(l, ownerView = false) {
  if (!l) return null;
  const meta = OWNED[l.id] || {};
  const c = {
    id: l.id,
    title: l.title,
    suburb: l.suburb,
    city: l.city,
    postcode: l.postcode,
    state: stateOf(l.postcode),
    timezone: "Australia/Sydney",
    display_address: l.display_address,
    weekly_price: l.weekly_price,
    image: (l.images || [])[0] || null,
    images: l.images || [],
    property_type: l.property_type,
    place_type: l.place_type === "private" ? "private_room" : l.place_type === "entire" ? "entire_place" : l.place_type,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    parking: l.parking ?? false,
    furnished: l.furnished,
    bills_included: l.bills_included,
    pets_allowed: l.pets_allowed ?? false,
    available_from: l.available_from,
    available_to: l.available_to,
    public_state: meta.moderation_status && meta.moderation_status !== "approved" ? "unavailable" : l.public_state || "published",
    unit_label: meta.unit_label || null,
    listing_purpose: "long_term",
    nearest_transport: l.nearest_transport,
  };
  if (ownerView) Object.assign(c, { moderation_status: meta.moderation_status || "approved", property_id: meta.property || null, occupancy: meta.occupancy || "vacant", occupied_until: null, street_address: meta.address || "12 Example Street" });
  return c;
}
// Listings created through the Hub wizard. Kept apart from LISTINGS, which
// the public search mock also serves: a draft in review is not searchable,
// and the public-site tests count search results.
const CREATED = [];
const listingById = (id) => LISTINGS.find((l) => l.id === id) || CREATED.find((l) => l.id === id);
const allListings = () => [...LISTINGS, ...CREATED];
const ownerOf = (id) => OWNED[id]?.owner || "aaaa0000-0000-4000-8000-00000000000f";

/* ── State ──────────────────────────────────────────────── */

// The paid renter ID check (backend renter_id.py): uid -> state.
const ID_CHECKS = {};
const idVerified = (uid) => ID_CHECKS[uid]?.status === "verified";

function person(uid) {
  const u = USERS[uid];
  if (!u) return { id: uid, name: "Verified Owner", avatar_url: null, public_id: "pubverif02", member_since: "2026-01-10" };
  return { id: uid, name: u.name || "New member", avatar_url: null, public_id: `pub${uid.slice(-4)}`, member_since: u.created_at.slice(0, 10), id_verified: idVerified(uid) };
}

const S = {
  profiles: {
    [RENTER]: {
      intro: "I'm a registered nurse at Westmead Hospital, moving from Melbourne for work. Quiet, tidy, and I cook a lot.",
      preferred_move_date: dayIso(inDays(24)),
      preferred_lease_months: 12,
      preferred_suburbs: ["Kellyville", "Parramatta"],
      budget_weekly: 420,
      bedrooms_min: 1,
      household_adults: 1,
      household_children: 0,
      household_notes: null,
      has_pets: false,
      pet_details: null,
      employment_status: "employed",
      employer: "Westmead Hospital",
      job_title: "Registered nurse",
      employment_since: "2024-03-01",
      income_weekly: 1850,
      rental_history: [{ suburb: "Brunswick VIC", from_month: "2023-02", to_month: "2026-08", weekly_rent: 380, landlord_name: "Ray White Brunswick", reason_for_leaving: "Moving to Sydney for work", country: "Australia" }],
      first_time_renter: false,
      referees: [],
      updated_at: iso(now()),
    },
  },
  documents: { [RENTER]: [] },
  saved: { [RENTER]: [{ id: "11111111-1111-4111-8111-000000000002", at: "2026-09-20T00:00:00Z", price: 430 }, { id: "11111111-1111-4111-8111-000000000005", at: "2026-09-21T00:00:00Z", price: 225 }, { id: "11111111-1111-4111-8111-000000000006", at: "2026-09-22T00:00:00Z", price: 230 }] },
  searches: { [RENTER]: [{ id: uuid(), name: "Kellyville under $450", params: { suburb: "Kellyville", max_price: 450 }, alert: "daily", created_at: "2026-09-10T00:00:00Z", updated_at: "2026-09-10T00:00:00Z", last_checked_at: "2026-09-20T00:00:00Z" }] },
  applications: [
    { id: "app-1", listing_id: "11111111-1111-4111-8111-000000000001", renter_id: RENTER, owner_id: OWNER, status: "under_review", move_in_date: dayIso(inDays(24)), lease_months: 12, occupants: 1, message: "Hi Priya - I loved the room at the inspection. I start at Westmead next month.", share_income: true, submitted_at: iso(inDays(-3)), owner_viewed_at: iso(inDays(-2)), created_at: iso(inDays(-4)), updated_at: iso(inDays(-2)), changes_requested_by: null, events: [] },
    { id: "app-2", listing_id: "11111111-1111-4111-8111-000000000002", renter_id: RENTER, owner_id: OWNER, status: "draft", move_in_date: dayIso(inDays(24)), lease_months: 12, occupants: 1, message: "", share_income: false, submitted_at: null, created_at: iso(inDays(-1)), updated_at: iso(inDays(-1)), changes_requested_by: null, events: [] },
  ],
  slots: [
    { id: "slot-1", listing_id: "11111111-1111-4111-8111-000000000001", owner_id: OWNER, starts_at: iso(inDays(1, 10, 30)), ends_at: iso(inDays(1, 11, 0)), capacity: 6, instructions: "Ring the bell at the side gate. Street parking only.", status: "scheduled" },
    { id: "slot-2", listing_id: "11111111-1111-4111-8111-000000000001", owner_id: OWNER, starts_at: iso(inDays(3, 17, 30)), ends_at: iso(inDays(3, 18, 0)), capacity: 6, instructions: null, status: "scheduled" },
    { id: "slot-3", listing_id: "11111111-1111-4111-8111-000000000002", owner_id: OWNER, starts_at: iso(inDays(2, 12, 0)), ends_at: iso(inDays(2, 12, 30)), capacity: 4, instructions: "Building buzzer 8.", status: "scheduled" },
  ],
  bookings: [{ id: "book-1", slot_id: "slot-1", listing_id: "11111111-1111-4111-8111-000000000001", renter_id: RENTER, status: "booked", note: null, created_at: iso(inDays(-2)) }],
  messages: [
    { id: "m1", sender: RENTER, receiver: OWNER, listing_id: "11111111-1111-4111-8111-000000000001", text: "Hi Priya, is Room 1 still available from next month?", created_at: iso(inDays(-5)), read_at: iso(inDays(-5)) },
    { id: "m2", sender: OWNER, receiver: RENTER, listing_id: "11111111-1111-4111-8111-000000000001", text: "Hi Sarah - yes it is. I have an inspection tomorrow at 10:30 if that suits?", created_at: iso(inDays(-4)), read_at: iso(inDays(-4)) },
    { id: "m3", sender: OWNER, receiver: RENTER, listing_id: "11111111-1111-4111-8111-000000000001", text: "Thanks for applying. I'll let you know by Friday.", created_at: iso(inDays(0, 9, 12)), read_at: null },
  ],
  states: {},
  drafts: [],
  blocks: [],
  reviews: [],
  notifications: {
    [RENTER]: [
      { id: "n1", type: "application_status_changed", title: "The owner opened your application", body: "Priya is reviewing your application for Room 1.", cta_url: "/hub/applications/app-1", entity_type: "application", entity_id: "app-1", is_read: false, created_at: iso(inDays(-2)) },
      { id: "n2", type: "message_received", title: "New message from Priya", body: "Thanks for applying. I'll let you know by Friday.", cta_url: "/hub/messages/11111111-1111-4111-8111-000000000001_" + OWNER, entity_type: "message", entity_id: null, is_read: false, created_at: iso(inDays(0, 9, 12)) },
      { id: "n3", type: "inspection_booked", title: "Inspection booked", body: "You're booked to inspect Room 1 tomorrow at 10:30 am.", cta_url: "/hub/inspections", entity_type: "inspection", entity_id: "book-1", is_read: true, created_at: iso(inDays(-2)) },
    ],
    [OWNER]: [{ id: "n4", type: "application_submitted", title: "New application", body: "Sarah Chen applied for Room 1.", cta_url: "/hub/applications/app-1", entity_type: "application", entity_id: "app-1", is_read: false, created_at: iso(inDays(-3)) }],
  },
  tenancies: [
    { id: "ten-1", listing_id: "11111111-1111-4111-8111-000000000004", property_id: "prop-smith", owner_id: OWNER, renter_id: TENANT, application_id: null, status: "active", start_date: dayIso(inDays(-40)), end_date: dayIso(inDays(325)), rent_amount: 290, rent_frequency: "fortnightly", bond_amount: 1160, notes: "Bond lodged with NSW Fair Trading. Rent by bank transfer to the account in the lease.", created_at: iso(inDays(-45)) },
  ],
  payments: {
    "ten-1": [-40, -26, -12, 2, 16, 30].map((d, i) => ({ id: `pay-${i + 1}`, tenancy_id: "ten-1", due_date: dayIso(inDays(d)), amount_due: 580, amount_paid: d < -20 ? 580 : 0, status: d < -20 ? "paid" : "due", paid_on: d < -20 ? dayIso(inDays(d + 1)) : null, method: d < -20 ? "bank_transfer" : null, reference: null, provider: null })),
  },
  maintenance: [
    { id: "mnt-1", tenancy_id: "ten-1", listing_id: "11111111-1111-4111-8111-000000000004", owner_id: OWNER, renter_id: TENANT, category: "appliance", title: "Oven isn't heating", description: "The oven light comes on but it doesn't get hot. The stovetop works fine.", urgency: "urgent", status: "acknowledged", access_notes: "Weekdays after 4pm, or leave a note.", scheduled_for: null, photos: [], created_at: iso(inDays(-2)), updated_at: iso(inDays(-1)), resolved_at: null, closed_at: null,
      updates: [
        { id: "mu-1", author_role: "renter", body: null, status_from: null, status_to: "submitted", internal: false, created_at: iso(inDays(-2)) },
        { id: "mu-2", author_role: "owner", body: "Thanks Tom - I've called the appliance repairer and will confirm a time tomorrow.", status_from: "submitted", status_to: "acknowledged", internal: false, created_at: iso(inDays(-1)) },
      ] },
  ],
  templates: {},
  reports: [
    { id: "rep-1", reporter_id: RENTER, item_type: "listing", item_id: "11111111-1111-4111-8111-000000000003", reason: "Looks like a scam", details: "Asked me to pay a deposit before inspecting.", status: "pending", priority: "high", created_at: iso(inDays(-1)) },
    // Raised by the message scam check, not a person (backend/routes_messages.flag_risky_message).
    { id: "rep-2", reporter_id: null, source: "system", item_type: "message", item_id: "m2", reason: "Possible scam: asks for money before an inspection", details: "Automatic check on a message.", status: "pending", priority: "high", created_at: iso(inDays(-1)) },
  ],
  audit: [],
  // Hub admin: listings in moderation (kept apart from the public search
  // fixtures), an owner waiting for an ID check, and support tickets.
  moderation: [
    { id: "33333333-3333-4333-8333-000000000001", owner_id: OWNER, title: "Bright room in Castle Hill", suburb: "Castle Hill", postcode: 2154, weekly_price: 330, address: "4 Pennant Street", place_type: "private_room", property_type: "house", description: "A bright upstairs room with a built-in wardrobe, five minutes from the metro.", moderation_status: "pending_approval", spam_score: 4, spam_reasons: [], flagged_at: null, moderation_reason: null, moderation_notes: null, created_at: iso(inDays(-2)), updated_at: iso(inDays(-2)), history: [] },
    { id: "33333333-3333-4333-8333-000000000002", owner_id: OWNER, title: "CHEAP ROOM pay deposit now", suburb: "Blacktown", postcode: 2148, weekly_price: 90, address: "9 Main Street", place_type: "private_room", property_type: "apartment", description: "Transfer the deposit to secure it before viewing. WhatsApp only.", moderation_status: "flagged", spam_score: 78, spam_reasons: ["Asks for payment before a viewing", "Price far below the suburb median", "Contact details in the description"], flagged_at: iso(inDays(-1)), moderation_reason: null, moderation_notes: null, created_at: iso(inDays(-1)), updated_at: iso(inDays(-1)), history: [] },
  ],
  idChecks: [{ user_id: NEW_OWNER, document_type: "passport", submitted_at: iso(inDays(-1)), email_verified: true, phone_verified: false, id_status: "pending" }],
  // Mentor sign-ups waiting for Migrent (backend routes_hub_admin mentors queue).
  // The owner fixture has a checked ID, so they can be approved.
  mentors: [{ id: "mentor-mock-1", user_id: OWNER, suburb: "Kellyville", postcode: 2155, languages: ["English", "Hindi"], specialties: ["Public transport"], bio: "Twelve years in the Hills district.", hourly_rate: 3000, status: "pending", review_reason: null, submitted_at: iso(inDays(-2)), payouts_ready: false }],
  tickets: [
    { id: "tk-1", user_id: OWNER, email: "owner@example.test", name: null, subject: "Photos won't upload on my phone", status: "open", priority: "normal", category: "listings", source: "in_app", created_at: iso(inDays(-1)), updated_at: iso(inDays(-1)), first_response_at: null, resolved_at: null, csat_rating: null, csat_comment: null, messages: [{ id: "tm-1", body: "The upload button spins and nothing happens. I'm on an iPhone.", sender_type: "user", is_internal: false, sender_id: OWNER, created_at: iso(inDays(-1)) }] },
    { id: "tk-2", user_id: null, email: "gina@example.test", name: "Gina Rossi", subject: "An owner asked me for cash", status: "pending_internal", priority: "urgent", category: "trust_safety", source: "contact_form", created_at: iso(inDays(-3)), updated_at: iso(inDays(-2)), first_response_at: iso(inDays(-3)), resolved_at: null, csat_rating: null, csat_comment: null, messages: [{ id: "tm-2", body: "The owner wants a cash deposit before I can see the room.", sender_type: "user", is_internal: false, sender_id: null, created_at: iso(inDays(-3)) }] },
    { id: "tk-3", user_id: RENTER, email: "renter@example.test", name: null, subject: "Thanks for the help", status: "resolved", priority: "low", category: "feedback", source: "in_app", created_at: iso(inDays(-9)), updated_at: iso(inDays(-8)), first_response_at: iso(inDays(-9)), resolved_at: iso(inDays(-8)), csat_rating: 5, csat_comment: "Quick and clear.", messages: [] },
  ],
};

function ev(app, event, actor_role, note = null, to = null) {
  const labels = { created: "Application started", submitted: "Application sent to the owner", viewed: "Owner opened the application", shortlisted: "Shortlisted by the owner", changes_requested: "Owner asked for more information", owner_approved: "Owner approved the application", migrent_review_started: "Migrent is doing its final review", finalised: "Application finalised", declined: "The owner decided not to go ahead", withdrawn: "Application withdrawn", resubmitted: "Updated application sent" };
  app.events.push({ id: uuid(), event, label: labels[event] || event, actor_role, note, to_status: to, created_at: iso(now()) });
}
for (const a of S.applications) {
  ev(a, "created", "renter", null, "draft");
  a.events[0].created_at = a.created_at;
  if (a.status !== "draft") {
    ev(a, "submitted", "renter", null, "submitted");
    a.events[1].created_at = a.submitted_at;
    ev(a, "viewed", "owner", null, "under_review");
    a.events[2].created_at = a.owner_viewed_at;
  }
}

/* ── Derived ────────────────────────────────────────────── */

function appSummary(a, side) {
  const l = listingById(a.listing_id);
  return {
    id: a.id,
    status: a.status,
    listing: card(l, side === "owner"),
    person: person(side === "owner" ? a.renter_id : a.owner_id),
    move_in_date: a.move_in_date,
    lease_months: a.lease_months,
    occupants: a.occupants,
    submitted_at: a.submitted_at,
    updated_at: a.updated_at,
    created_at: a.created_at,
    changes_requested_by: a.changes_requested_by,
    unread_by_owner: side === "owner" && a.status === "submitted" && !a.owner_viewed_at,
    household: side === "owner" ? { adults: 1, children: 0, has_pets: false } : undefined,
    verification: side === "owner" ? (idVerified(a.renter_id) ? "verified" : "not_started") : undefined,
    id_verified: side === "owner" ? idVerified(a.renter_id) : undefined,
  };
}

function completion(uid) {
  const p = S.profiles[uid] || {};
  const docs = S.documents[uid] || [];
  const items = [
    { key: "about", label: "Your name and a short introduction", done: (p.intro || "").length >= 40 },
    { key: "move", label: "When you want to move and for how long", done: Boolean(p.preferred_move_date && p.preferred_lease_months) },
    { key: "household", label: "Who will live with you", done: Boolean(S.profiles[uid]) },
    { key: "work", label: "Work or study", done: Boolean(p.employment_status) },
    { key: "history", label: "Rental history (or that this is your first rental)", done: Boolean((p.rental_history || []).length || p.first_time_renter) },
    { key: "referees", label: "At least one referee", done: Boolean((p.referees || []).length) },
    { key: "documents", label: "A supporting document", done: docs.length > 0 },
  ];
  const done = items.filter((i) => i.done).length;
  return { percent: Math.round((100 * done) / items.length), items, complete: done === items.length };
}

function threads(uid) {
  const map = new Map();
  for (const m of [...S.messages].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))) {
    if (m.sender !== uid && m.receiver !== uid) continue;
    const other = m.sender === uid ? m.receiver : m.sender;
    const key = `${m.listing_id || "direct"}_${other}`;
    let t = map.get(key);
    if (!t) {
      const l = m.listing_id ? listingById(m.listing_id) : null;
      const st = (S.states[uid] || {})[key] || {};
      const app = S.applications.find((a) => a.listing_id === m.listing_id && [a.renter_id, a.owner_id].includes(uid) && [a.renter_id, a.owner_id].includes(other) && a.status !== "draft");
      t = { key, listing_id: m.listing_id, other_user_id: other, last_message: { text: m.text, from_me: m.sender === uid, has_attachment: false, created_at: m.created_at }, unread_count: 0, message_count: 0, listing: card(l, ownerOf(m.listing_id) === uid), other: person(other), my_side: ownerOf(m.listing_id) === uid ? "owner" : "renter", archived: Boolean(st.archived), muted: Boolean(st.muted), application: app ? { id: app.id, status: app.status } : null };
      map.set(key, t);
    }
    t.message_count++;
    if (m.receiver === uid && !m.read_at) t.unread_count++;
  }
  return [...map.values()];
}

function renterBookings(uid, upcomingOnly = true) {
  return S.bookings
    .filter((b) => b.renter_id === uid && (!upcomingOnly || b.status === "booked"))
    .map((b) => {
      const slot = S.slots.find((s) => s.id === b.slot_id);
      const c = card(listingById(b.listing_id));
      if (c) c.street_address = OWNED[b.listing_id]?.address || "12 Example Street";
      return { id: b.id, status: b.status, note: b.note, slot: { id: slot.id, starts_at: slot.starts_at, ends_at: slot.ends_at, instructions: slot.instructions, status: slot.status }, listing: c, created_at: b.created_at, upcoming: true };
    })
    .sort((a, b) => (a.slot.starts_at < b.slot.starts_at ? -1 : 1));
}

function slotOut(s, ownerView) {
  const booked = S.bookings.filter((b) => b.slot_id === s.id && b.status === "booked").length;
  return { id: s.id, listing_id: s.listing_id, starts_at: s.starts_at, ends_at: s.ends_at, capacity: s.capacity, booked, spaces_left: Math.max(0, s.capacity - booked), instructions: s.instructions, status: s.status, listing: card(listingById(s.listing_id), ownerView) };
}

function unitStatus(l) {
  const meta = OWNED[l.id] || {};
  if (meta.occupancy === "occupied") return { label: "Occupied", tone: "neutral" };
  const pending = S.applications.filter((a) => a.listing_id === l.id && ["submitted", "under_review", "shortlisted"].includes(a.status)).length;
  if (meta.moderation_status === "pending_approval") return { label: "In review", tone: "info" };
  if (meta.moderation_status === "draft") return { label: "Draft", tone: "neutral" };
  if (pending) return { label: `${pending} application${pending === 1 ? "" : "s"}`, tone: "info" };
  return { label: "Available", tone: "success" };
}

function portfolio(uid) {
  const units = allListings().filter((l) => ownerOf(l.id) === uid).map((l) => {
    const c = card(l, true);
    c.status = unitStatus(l);
    c.pending_applications = S.applications.filter((a) => a.listing_id === l.id && ["submitted", "under_review", "shortlisted"].includes(a.status)).length;
    c.upcoming_inspections = S.slots.filter((s) => s.listing_id === l.id && s.status === "scheduled").length;
    return c;
  });
  const properties = PROPERTIES.filter((p) => p.owner_id === uid).map((p) => {
    const us = units.filter((u) => u.property_id === p.id);
    return { ...p, cover_image: us.find((u) => u.image)?.image || null, units: us, summary: { units: us.length, available: us.filter((u) => u.status.tone === "success" || u.status.tone === "info").length, occupied: us.filter((u) => u.occupancy === "occupied").length, applications: us.reduce((s, u) => s + u.pending_applications, 0), inspections: us.reduce((s, u) => s + u.upcoming_inspections, 0) } };
  });
  const totals = { properties: properties.length, units: units.length, available: units.filter((u) => u.status.tone !== "neutral").length, occupied: units.filter((u) => u.occupancy === "occupied").length, applications: units.reduce((s, u) => s + u.pending_applications, 0), inspections: units.reduce((s, u) => s + u.upcoming_inspections, 0), drafts: S.drafts.filter((d) => d.owner_id === uid && !d.submitted_at).length };
  return { properties, unassigned: [], totals, drafts: S.drafts.filter((d) => d.owner_id === uid && !d.submitted_at).map(draftSummary) };
}

function draftSummary(d) {
  return { id: d.id, property_id: d.property_id, step: d.step, title: d.data.title || d.data.street_address || "Untitled listing", suburb: d.data.suburb || null, image: (d.data.images || [])[0] || null, updated_at: d.updated_at };
}

function perfTotals(ids) {
  const t = { view: 0, save: 0, enquiry: 0, inspection_booked: 0, application_started: 0, application_submitted: 0, unique_views: 0 };
  if (ids.length) Object.assign(t, { view: 184, unique_views: 131, save: 22, enquiry: 9, inspection_booked: 6, application_started: 4, application_submitted: 2 });
  return t;
}

function me(uid) {
  const u = USERS[uid];
  const role = u.role === "seeker" ? "renter" : u.role === "owner" ? "owner" : u.is_admin ? "admin" : null;
  return {
    id: uid,
    email: u.email,
    name: u.name,
    avatar_url: null,
    bio: u.bio || "",
    public_id: `pub${uid.slice(-4)}`,
    role,
    is_admin: Boolean(u.is_admin),
    owner_kind: u.owner_kind || null,
    agency_name: u.agency_name || null,
    agency_licence: u.agency_licence || null,
    onboarded: u.onboarded,
    notification_prefs: u.prefs || {},
    owner_verification: role === "owner" ? { status: "verified", checks: { email_confirmed: true, phone_confirmed: true, government_id: "approved" }, verified_at: "2026-03-10T00:00:00Z", explainer_url: "/how-renting-works#checks", disclaimer: "Verification confirms documents were checked. It is not a guarantee of safety or suitability." } : null,
    member_since: u.created_at.slice(0, 10),
    features: { ai_listing_assist: false, payments: "test", renter_verification: true, fees: { currency: "AUD", host_fee: 99, host_fee_model: "per_property", renter_verification_fee: 19 }, view_as: Boolean(u.is_admin), move_in_payments: true },
    assurance_level: "aal1",
    viewing_as: null,
  };
}

function renterHome(uid) {
  const apps = S.applications.filter((a) => a.renter_id === uid).map((a) => appSummary(a, "renter"));
  const inspections = renterBookings(uid);
  const saved = (S.saved[uid] || []).map((s) => ({ ...card(listingById(s.id)), saved_at: s.at, price_change: listingById(s.id).weekly_price - s.price || null }));
  const th = threads(uid).filter((t) => !t.archived);
  const comp = completion(uid);
  const actions = [];
  if (inspections[0]) actions.push({ kind: "inspection", tone: "info", title: "Inspection coming up", starts_at: inspections[0].slot.starts_at, timezone: "Australia/Sydney", body: inspections[0].listing.title, href: "/inspections" });
  for (const a of apps) if (a.status === "changes_requested") actions.push({ kind: "application", tone: "warning", title: "The owner asked for more information", body: a.listing.title, href: `/applications/${a.id}` });
  const draft = apps.find((a) => a.status === "draft");
  if (draft) actions.push({ kind: "application", tone: "neutral", title: "Finish your application", body: draft.listing.title, href: `/apply/${draft.listing.id}` });
  const unread = th.reduce((s, t) => s + t.unread_count, 0);
  if (unread) actions.push({ kind: "messages", tone: "info", title: `${unread} unread message${unread === 1 ? "" : "s"}`, body: null, href: "/messages" });
  if (!comp.complete) actions.push({ kind: "profile", tone: "neutral", title: "Complete your Rental Profile", body: `${comp.percent}% done. Owners see this when you apply.`, href: "/profile", percent: comp.percent });
  const savedIds = new Set((S.saved[uid] || []).map((s) => s.id));
  const recommended = LISTINGS.filter((l) => !savedIds.has(l.id) && (l.public_state || "published") === "published" && l.weekly_price <= 450)
    .slice(0, 6)
    .map((l) => ({ ...card(l), reasons: [l.suburb === "Kellyville" || l.suburb === "Parramatta" ? `In ${l.suburb}, one of your suburbs` : "Recently listed", `Within your $420 a week budget`].slice(0, l.weekly_price <= 420 ? 2 : 1) }));
  return { role: "renter", next_actions: actions.slice(0, 4), applications: apps.filter((a) => !["declined", "withdrawn", "not_proceeding"].includes(a.status)), inspections, saved, recommended, messages: th.slice(0, 3), completion: comp, tenancy: tenancySummaries(uid)[0] || null, verification: "not_started", has_activity: Boolean(apps.length || inspections.length || saved.length || th.length) };
}

function tenancySummaries(uid) {
  return S.tenancies
    .filter((t) => t.renter_id === uid || t.owner_id === uid)
    .map((t) => {
      const c = card(listingById(t.listing_id), t.owner_id === uid);
      if (c) c.street_address = OWNED[t.listing_id]?.address;
      const due = (S.payments[t.id] || []).filter((p) => p.status === "due" || p.status === "partial").sort((a, b) => (a.due_date < b.due_date ? -1 : 1));
      return { ...t, listing: c, renter: person(t.renter_id), owner: person(t.owner_id), next_payment: due[0] || null, open_maintenance: S.maintenance.filter((m) => m.tenancy_id === t.id && !["resolved", "closed"].includes(m.status)).length, ending_soon: false };
    });
}

function ownerHome(uid) {
  const folio = portfolio(uid);
  const apps = S.applications.filter((a) => a.owner_id === uid && a.status !== "draft").map((a) => appSummary(a, "owner"));
  const attention = [];
  const unseen = apps.filter((a) => a.unread_by_owner);
  if (unseen.length) attention.push({ kind: "applications", tone: "info", title: `${unseen.length} new application${unseen.length === 1 ? "" : "s"}`, body: "Review them while the home is fresh.", href: "/applications" });
  for (const d of folio.drafts.slice(0, 1)) attention.push({ kind: "draft", tone: "neutral", title: "Finish your listing", body: d.title, href: `/properties/new?draft=${d.id}` });
  attention.push({ kind: "listing", tone: "neutral", title: "Listing ends this week", body: "Studio in Parramatta stops showing on Friday. Extend it to keep it live.", href: "/listings/11111111-1111-4111-8111-000000000002" });
  return {
    role: "owner",
    verified: true,
    portfolio: { totals: folio.totals, properties: folio.properties, unassigned: [] },
    attention,
    applications: apps.filter((a) => ["submitted", "under_review", "shortlisted"].includes(a.status)),
    inspections: S.slots.filter((s) => s.owner_id === uid && s.status === "scheduled").map((s) => slotOut(s, true)),
    messages: threads(uid).slice(0, 3),
    tenancies: tenancySummaries(uid),
    insights: { days: 30, totals: perfTotals(folio.properties.flatMap((p) => p.units)), tracking_since: "2026-09-01T00:00:00Z" },
    drafts: folio.totals.drafts,
  };
}

/* ── Hub admin: listings, ID checks, accounts, support ───── */
// Mirrors backend/routes_hub_admin.py (LISTING_ACTIONS and friends).

const LISTING_ACTIONS = {
  pending_approval: ["approve", "request_changes", "reject", "pause"],
  changes_requested: ["approve", "reject", "pause"],
  approved: ["pause", "request_removal"],
  flagged: ["approve", "unflag", "hide", "request_removal", "rescan"],
  hidden: ["approve", "unflag", "request_removal", "rescan"],
  delete_requested: ["confirm_removal", "approve", "unflag"],
  paused: ["unpause", "request_removal"],
};
const NEEDS_REASON = ["reject", "request_changes", "pause", "hide", "request_removal"];
const LISTING_QUEUES = { review: ["pending_approval"], flagged: ["flagged"], hidden: ["hidden"], removal: ["delete_requested"], paused: ["paused"] };
const idCheckOf = (ownerId) => (ownerId === OWNER ? "verified" : S.idChecks.find((c) => c.user_id === ownerId)?.id_status === "approved" ? "verified" : ownerId === NEW_OWNER ? "pending" : "unverified");
const firstImage = () => (LISTINGS[0]?.images || []).slice(0, 3);

function moderationItem(l) {
  return {
    id: l.id,
    title: l.title,
    suburb: l.suburb,
    city: "Sydney",
    postcode: l.postcode,
    state: "NSW",
    timezone: "Australia/Sydney",
    display_address: `${l.suburb} ${l.postcode}`,
    weekly_price: l.weekly_price,
    image: firstImage()[0] || null,
    images: firstImage(),
    property_type: l.property_type,
    place_type: l.place_type,
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: true,
    bills_included: true,
    pets_allowed: false,
    available_from: dayIso(inDays(7)),
    available_to: null,
    public_state: l.moderation_status === "approved" ? "published" : "unavailable",
    unit_label: null,
    listing_purpose: "long_term",
    street_address: l.address,
    moderation_status: l.moderation_status,
    moderation_reason: l.moderation_reason,
    moderation_notes: l.moderation_notes,
    spam_score: l.spam_score,
    spam_reasons: l.spam_reasons,
    flagged_at: l.flagged_at,
    created_at: l.created_at,
    updated_at: l.updated_at,
    owner: { ...person(l.owner_id), email: USERS[l.owner_id]?.email || null, id_check: idCheckOf(l.owner_id) },
    actions: LISTING_ACTIONS[l.moderation_status] || [],
  };
}
const moderationDetail = (l) => ({ ...moderationItem(l), description: l.description, history: l.history });

function account(id) {
  const x = USERS[id];
  return { id, name: x.name || "(no name)", email: x.email, role: x.role === "seeker" ? "renter" : x.role, member_since: x.created_at.slice(0, 10), suspended: Boolean(x.disabled), is_admin: Boolean(x.is_admin) };
}

function ticketRow(t) {
  const who = t.user_id ? USERS[t.user_id] : null;
  const { messages, user_id, email, name, ...rest } = t;
  void messages;
  return { ...rest, requester: { id: user_id, name: who?.name || name || email || "Guest", email, avatar_url: null, has_account: Boolean(user_id) } };
}
const ticketDetail = (t) => ({ ...ticketRow(t), messages: t.messages.map(({ sender_id, ...m }) => ({ ...m, sender: sender_id ? person(sender_id) : null })) });

function adminExtras(p, url, body, uid, send, req) {
  const audit = (action, target_type, target_id, reason = null, notes = null) => S.audit.unshift({ id: uuid(), action, target_type, target_id, reason, notes, metadata: {}, created_at: iso(now()), admin: person(uid) });
  let mm;

  // Listings
  if (p === "/hub/admin/listings") {
    const queue = url.searchParams.get("queue") || "review";
    const q = (url.searchParams.get("q") || "").toLowerCase();
    let rows = queue === "all" ? S.moderation : S.moderation.filter((l) => (LISTING_QUEUES[queue] || []).includes(l.moderation_status));
    if (q) rows = rows.filter((l) => `${l.title} ${l.suburb} ${USERS[l.owner_id]?.name || ""} ${USERS[l.owner_id]?.email || ""}`.toLowerCase().includes(q));
    const counts = Object.fromEntries(Object.entries(LISTING_QUEUES).map(([k, st]) => [k, S.moderation.filter((l) => st.includes(l.moderation_status)).length]));
    return send(200, { listings: rows.map(moderationItem), counts }), true;
  }
  mm = p.match(/^\/hub\/admin\/listings\/([^/]+)(\/action)?$/);
  if (mm) {
    const l = S.moderation.find((x) => x.id === mm[1]);
    if (!l && mm[2] && body.action === "pause" && listingById(mm[1])) {
      // A live listing reported from the Reports queue (MIG-024).
      if ((body.reason || "").trim().length < 5) return send(400, { detail: "Add a reason. It is recorded in the audit log." }), true;
      audit("pause", "listing", mm[1], body.reason.trim());
      return send(200, { listing: { id: mm[1], moderation_status: "paused" } }), true;
    }
    if (!l) return send(404, { detail: "Listing not found" }), true;
    if (!mm[2]) return send(200, { listing: moderationDetail(l) }), true;
    const action = body.action;
    if (!(LISTING_ACTIONS[l.moderation_status] || []).includes(action)) return send(409, { detail: "That can't be done to this listing in its current state. Refresh to see where it is now." }), true;
    const reason = (body.reason || "").trim();
    if (NEEDS_REASON.includes(action) && reason.length < 5) return send(400, { detail: "Add a reason. It is recorded in the audit log." }), true;
    if (action === "approve" && idCheckOf(l.owner_id) !== "verified") return send(409, { detail: "The owner has not completed identity verification. Approve their ID first." }), true;
    const move = { approve: "approved", request_changes: "changes_requested", reject: "rejected", pause: "paused", unpause: body.mode === "restore" ? "approved" : "pending_approval", hide: "hidden", unflag: "pending_approval", request_removal: "delete_requested", confirm_removal: "deleted" };
    const auditName = { approve: "approve", request_changes: "request_changes", reject: "reject", pause: "pause", unpause: "unpause", hide: "hide", unflag: "unflag", request_removal: "request_delete", confirm_removal: "confirm_delete" };
    const event = { approve: "approved", request_changes: "changes_requested", reject: "rejected", pause: "paused", unpause: "unpaused", hide: "hidden", unflag: "unflagged", request_removal: "delete_requested", confirm_removal: "delete_approved", rescan: "score_updated" };
    if (action !== "rescan") {
      audit(auditName[action], "listing", l.id, reason || null, body.note || null);
      l.moderation_status = move[action];
      if (reason && action !== "request_changes") l.moderation_reason = reason;
      if (action === "request_changes") l.moderation_notes = reason;
      if (action === "unflag") Object.assign(l, { spam_score: 0, spam_reasons: [] });
    }
    l.updated_at = iso(now());
    l.history.unshift({ id: uuid(), event_type: event[action], old_status: null, new_status: l.moderation_status, spam_score: action === "rescan" ? l.spam_score : null, notes: reason || body.note || null, created_at: iso(now()), actor: action === "rescan" ? null : person(uid), actor_type: action === "rescan" ? "system" : "admin" });
    return send(200, { listing: moderationDetail(l) }), true;
  }

  // ID checks
  if (p === "/hub/admin/id-checks")
    return send(200, { checks: S.idChecks.filter((c) => c.id_status === "pending").map((c) => ({ user_id: c.user_id, person: person(c.user_id), email: USERS[c.user_id]?.email || null, document_type: c.document_type, submitted_at: c.submitted_at, email_verified: c.email_verified, phone_verified: c.phone_verified, listings_waiting: 1 })) }), true;
  mm = p.match(/^\/hub\/admin\/id-checks\/([^/]+)(\/document)?$/);
  if (mm) {
    const c = S.idChecks.find((x) => x.user_id === mm[1]);
    if (!c) return send(404, { detail: "Verification record not found" }), true;
    // A 1x1 image stands in for the document.
    if (mm[2]) return send(200, { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", kind: "image", expires_in_seconds: 300 }), true;
    if (c.id_status !== "pending") return send(400, { detail: `ID is not pending review (current: ${c.id_status})` }), true;
    if (body.action === "reject" && (body.reason || "").trim().length < 5) return send(400, { detail: "Tell the owner what was wrong so they can fix it. It is also recorded in the audit log." }), true;
    c.id_status = body.action === "approve" ? "approved" : "rejected";
    audit(body.action === "approve" ? "approve_id" : "reject_id", "owner_verification", c.user_id, body.reason || null, body.action === "approve" ? "Government ID approved" : null);
    return send(200, { message: body.action === "approve" ? "ID approved" : "ID rejected", fully_verified: body.action === "approve" }), true;
  }

  // Mentors
  if (p === "/hub/admin/mentors") {
    const status = url.searchParams.get("status") || "pending";
    const rows = S.mentors.filter((m) => status === "all" || m.status === status);
    return send(200, { mentors: rows.map((m) => ({ ...m, person: person(m.user_id), email: USERS[m.user_id]?.email || null, id_status: idCheckOf(m.user_id) === "verified" ? "approved" : idCheckOf(m.user_id) === "pending" ? "pending" : "not_submitted" })) }), true;
  }
  mm = p.match(/^\/hub\/admin\/mentors\/([^/]+)$/);
  if (mm && req.method === "POST") {
    const m = S.mentors.find((x) => x.id === mm[1]);
    if (!m) return send(404, { detail: "Mentor not found" }), true;
    const reason = (body.reason || "").trim();
    if (body.action === "approve" && idCheckOf(m.user_id) !== "verified") return send(400, { detail: "Their government ID hasn't been checked yet. Approve it in ID checks first." }), true;
    if (body.action === "reject" && reason.length < 5) return send(400, { detail: "Tell them what to change. It is emailed to them and recorded in the audit log." }), true;
    m.status = body.action === "approve" ? "approved" : "rejected";
    m.review_reason = body.action === "approve" ? null : reason;
    audit(body.action === "approve" ? "approve_mentor" : "reject_mentor", "mentor", m.id, reason || null);
    return send(200, { mentor: { ...m, person: person(m.user_id), email: USERS[m.user_id]?.email || null, id_status: "approved" } }), true;
  }

  // Accounts
  mm = p.match(/^\/hub\/admin\/users\/([^/]+)\/(suspend|unsuspend)$/);
  if (mm && req.method === "POST") {
    const target = USERS[mm[1]];
    if (!target) return send(404, { detail: "User not found" }), true;
    if ((body.reason || "").trim().length < 5) return send(400, { detail: "Say why. It is recorded in the audit log." }), true;
    if (mm[1] === uid) return send(400, { detail: "That is your own account" }), true;
    if (target.is_admin) return send(400, { detail: "Admin accounts are changed in the database, not here" }), true;
    const suspend = mm[2] === "suspend";
    if (Boolean(target.disabled) !== suspend) {
      audit(suspend ? "suspend_user" : "unsuspend_user", "user", mm[1], body.reason.trim());
      target.disabled = suspend;
    }
    return send(200, { user: account(mm[1]) }), true;
  }

  // Support
  if (p === "/hub/admin/support/tickets") {
    const views = { needs_reply: ["open", "pending_internal"], waiting: ["pending_customer"], done: ["resolved", "closed"] };
    const view = url.searchParams.get("view") || "needs_reply";
    const prio = { urgent: 0, high: 1, normal: 2, low: 3 };
    const rows = (view === "all" ? S.tickets : S.tickets.filter((t) => (views[view] || []).includes(t.status))).slice().sort((a, b) => (view === "needs_reply" ? prio[a.priority] - prio[b.priority] || a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at)));
    const counts = Object.fromEntries(Object.entries(views).map(([k, st]) => [k, S.tickets.filter((t) => st.includes(t.status)).length]));
    return send(200, { tickets: rows.map(ticketRow), counts }), true;
  }
  mm = p.match(/^\/hub\/admin\/support\/tickets\/([^/]+)(\/reply)?$/);
  if (mm) {
    const t = S.tickets.find((x) => x.id === mm[1]);
    if (!t) return send(404, { detail: "Ticket not found" }), true;
    if (req.method === "GET") return send(200, { ticket: ticketDetail(t) }), true;
    if (mm[2]) {
      if (t.status === "closed") return send(409, { detail: "This ticket is closed. Reopen it to reply." }), true;
      t.messages.push({ id: uuid(), body: body.body, sender_type: "agent", is_internal: false, sender_id: uid, created_at: iso(now()) });
      t.status = "pending_customer";
      t.first_response_at = t.first_response_at || iso(now());
    } else {
      for (const k of ["status", "priority", "category"]) if (body[k]) t[k] = body[k];
      if (body.status === "resolved") t.resolved_at = iso(now());
      if ((body.internal_note || "").trim()) t.messages.push({ id: uuid(), body: body.internal_note.trim(), sender_type: "agent", is_internal: true, sender_id: uid, created_at: iso(now()) });
    }
    t.updated_at = iso(now());
    return send(200, { ticket: ticketDetail(t) }), true;
  }
  return false;
}

/* ── Admin panel ────────────────────────────────────────── */

const PANEL = {
  password: ADMIN_PANEL_PASSWORD,
  tokens: new Map(),
  byUser: {},
  state(uid) {
    return (this.byUser[uid] ||= { failures: 0, lockedUntil: 0 });
  },
};

/* ── Router ─────────────────────────────────────────────── */

export function setListings(list) {
  LISTINGS = list;
}

export function handleHub(req, url, body, send) {
  const p = url.pathname;

  // Supabase Auth
  if (p.startsWith("/auth/v1/")) {
    if (p === "/auth/v1/token") {
      const grant = url.searchParams.get("grant_type");
      if (grant === "password") {
        const uid = Object.keys(USERS).find((id) => USERS[id].email === String(body?.email || "").toLowerCase());
        if (!uid || body?.password !== TEST_PASSWORD) return send(400, { error: "invalid_grant", error_description: "Invalid login credentials", code: "invalid_credentials", msg: "Invalid login credentials" }), true;
        return send(200, session(uid)), true;
      }
      if (grant === "refresh_token") {
        const uid = String(body?.refresh_token || "").replace("refresh-", "");
        if (!USERS[uid]) return send(400, { error: "invalid_grant", error_description: "Invalid Refresh Token" }), true;
        return send(200, session(uid)), true;
      }
    }
    if (p === "/auth/v1/user") {
      const uid = uidFromAuth(req);
      if (!uid) return send(401, { code: 401, msg: "invalid JWT" }), true;
      if (req.method === "PUT") return send(200, authUser(uid)), true;
      return send(200, authUser(uid)), true;
    }
    if (p === "/auth/v1/logout") return send(204, {}), true;
    if (p === "/auth/v1/otp" || p === "/auth/v1/recover" || p === "/auth/v1/resend") return send(200, {}), true;
    if (p === "/auth/v1/signup") return send(200, { id: uuid(), email: body?.email, identities: [{}] }), true;
    return send(404, { msg: "auth route not mocked" }), true;
  }

  if (p === "/hub/features") return send(200, me(RENTER).features), true;
  if (p === "/hub/listing-events") return send(200, { ok: true }), true;

  // Short stays (routes_bookings.py). "Stripe" is the local cancel page.
  if (p === "/bookings/me" && req.method === "GET") {
    const uid = uidFromAuth(req);
    if (!uid) return send(401, { detail: "Not signed in" }), true;
    const side = url.searchParams.get("role") === "owner" ? "owner_id" : "seeker_id";
    const rows = STAYS.filter((b) => b[side] === uid).map((b) => ({ ...b, other_party: { name: USERS[side === "owner_id" ? b.seeker_id : b.owner_id]?.name || null } }));
    return send(200, { bookings: rows }), true;
  }
  if (p === "/bookings" && req.method === "POST") {
    const uid = uidFromAuth(req);
    if (!uid) return send(401, { detail: "Not signed in" }), true;
    const l = body?.listing_id === STAY_LISTING.id ? { ...STAY_LISTING, weekly_price: 380, instant_book_enabled: true } : LISTINGS.find((x) => x.id === body?.listing_id);
    if (!l) return send(404, { detail: "Listing not found" }), true;
    const b = { id: uuid(), listing_id: l.id, owner_id: OWNER, seeker_id: uid, status: l.instant_book_enabled ? "OWNER_ACCEPTED" : "PENDING_OWNER", check_in_date: body.check_in, check_out_date: body.check_out, guests: body.guests || 1, total_price: l.weekly_price * 4, message_to_owner: body.message_to_owner || null, seeker_fee: 0, listing: { id: l.id, title: l.title, city: l.city, images: l.images }, created_at: new Date().toISOString() };
    STAYS.push(b);
    return send(200, { booking: b, checkout_url: null }), true;
  }
  const stay = p.match(/^\/bookings\/([0-9a-f-]+)\/(respond|pay-fee|cancel)$/i);
  if (stay && req.method === "POST") {
    const uid = uidFromAuth(req);
    const b = STAYS.find((x) => x.id === stay[1]);
    if (!b) return send(404, { detail: "Booking not found" }), true;
    const checkout = `${req.headers.origin || ""}/booking-cancelled`;
    if (stay[2] === "cancel") {
      if (uid !== b.seeker_id) return send(403, { detail: "Only the seeker can cancel" }), true;
      b.status = "SEEKER_CANCELLED";
      return send(200, { booking_id: b.id, status: b.status }), true;
    }
    if (uid !== b.owner_id) return send(403, { detail: "Only the listing owner can do that" }), true;
    if (stay[2] === "respond") {
      if (b.status !== "PENDING_OWNER") return send(400, { detail: "This booking is not awaiting a response" }), true;
      if (body?.action === "decline") return (b.status = "OWNER_DECLINED"), send(200, { booking_id: b.id, status: b.status }), true;
      b.status = "OWNER_ACCEPTED";
      return send(200, { booking_id: b.id, status: b.status, checkout_url: checkout }), true;
    }
    if (b.status !== "OWNER_ACCEPTED") return send(400, { detail: "This stay is not waiting for payment" }), true;
    return send(200, { booking_id: b.id, status: b.status, checkout_url: checkout }), true;
  }
  if (p === "/auth/store-legal-acceptance") return send(200, { status: "accepted" }), true;
  if (p === "/email/unsubscribe" && req.method === "POST") {
    // The mock's signed link uses the token "test-token" (backend/unsubscribe.py signs with HMAC).
    const x = USERS[body.u];
    if (!x || body.t !== "test-token" || !["messages", "applications", "inspections", "saved_searches", "maintenance", "listings", "summaries"].includes(body.g)) return send(400, { detail: "That unsubscribe link isn't valid. You can change your emails in Migrent Hub > Settings." }), true;
    x.prefs = { ...(x.prefs || {}), email: { ...((x.prefs || {}).email || {}), [body.g]: false } };
    return send(200, { unsubscribed: true, group: body.g }), true;
  }
  if (p === "/reports" && req.method === "POST") {
    const rid = uidFromAuth(req);
    if (!rid) return send(401, { detail: "Sign in to continue" }), true;
    S.reports.unshift({ id: uuid(), reporter_id: rid, item_type: body.item_type || "listing", item_id: body.item_id, reason: body.category, details: body.message || null, status: "pending", priority: "normal", created_at: iso(now()) });
    return send(200, { status: "ok" }), true;
  }

  // Existing (non-Hub) endpoints the Hub calls.
  {
    const lm = p.match(/^\/listings\/([0-9a-f-]{36})(?:\/(pause|resume|renew|submit))?$/i);
    if (lm && (req.method !== "GET" || lm[2])) {
      const rid = uidFromAuth(req);
      const meta = OWNED[lm[1]];
      const l = listingById(lm[1]);
      if (!rid || !meta || meta.owner !== rid || !l) return send(404, { detail: "Listing not found" }), true;
      const action = lm[2];
      if (action === "pause") meta.moderation_status = "paused";
      else if (action === "resume") meta.moderation_status = "approved";
      else if (action === "submit") meta.moderation_status = "pending_approval";
      else if (action === "renew") {
        l.available_to = body.available_to;
        meta.moderation_status = meta.moderation_status === "approved" ? "approved" : "pending_approval";
      } else if (req.method === "PATCH") {
        const map = { address: "address" };
        for (const [k, v] of Object.entries(body || {})) {
          if (k === "address") meta.address = v;
          else l[map[k] || k] = v;
        }
        if (body.suburb || body.postcode) l.display_address = `${l.suburb} ${l.postcode}`;
      } else if (req.method === "DELETE") {
        if (!body?.password && !body?.oauth_confirmed) return send(400, { detail: "Please confirm with your password" }), true;
        if (body.password && body.password !== TEST_PASSWORD) return send(401, { detail: "Incorrect password" }), true;
        meta.moderation_status = "deleted";
        return send(200, { message: "Listing deleted successfully" }), true;
      }
      return send(200, { id: l.id, moderation_status: meta.moderation_status, available_to: l.available_to }), true;
    }
  }
  if (p === "/profiles/me/export") {
    const rid = uidFromAuth(req);
    if (!rid) return send(401, { detail: "Sign in to continue" }), true;
    return send(200, { exported_at: iso(now()), profile: { id: rid, email: USERS[rid].email, name: USERS[rid].name }, rental_profile: S.profiles[rid] || null }), true;
  }
  if (p === "/profiles/me/photo" && req.method === "POST") return send(200, { url: null }), true;
  if (p === "/account/delete" && req.method === "DELETE") {
    const rid = uidFromAuth(req);
    if (S.tenancies.some((t) => (t.renter_id === rid || t.owner_id === rid) && ["upcoming", "active"].includes(t.status))) return send(409, { detail: "You have a current or upcoming tenancy in Migrent Hub. It needs to end before the account can be deleted." }), true;
    return send(409, { detail: "Account deletion is disabled in the mock." }), true;
  }
  if (p === "/owner-verification/id/upload" && req.method === "POST") return send(200, { message: "Document uploaded" }), true;
  if (p === "/payments/create-verification-session") return send(410, { detail: "Paid seeker verification is not available. Identity verification for seekers is free and coming soon." }), true;
  if (p === "/bookings/me") return send(200, { bookings: [] }), true;
  if (p.startsWith("/notification-center/") && req.method === "DELETE") {
    const rid = uidFromAuth(req);
    const nid = p.split("/").pop();
    S.notifications[rid] = (S.notifications[rid] || []).filter((n) => n.id !== nid);
    return send(200, { ok: true }), true;
  }

  if (p === "/messages/attachments" && req.method === "POST") {
    if (!uidFromAuth(req)) return send(401, { detail: "Sign in to continue" }), true;
    return send(200, { attachment_path: `${uidFromAuth(req)}/${Date.now()}_mock.pdf`, attachment_name: "document.pdf", attachment_type: "application/pdf" }), true;
  }

  if (!p.startsWith("/hub/") && !p.startsWith("/notification-center")) return false;
  let uid = uidFromAuth(req);
  if (!uid) return send(401, { detail: "Sign in to continue" }), true;
  // An admin's audited, read-only view of a customer (GET requests only).
  const viewAs = req.headers["x-migrent-view-as"];
  let viewer = null;
  if (viewAs && USERS[uid]?.is_admin && USERS[viewAs] && !p.startsWith("/hub/admin/")) {
    if (!S.audit.some((e) => e.action === "view_as_start" && e.target_id === viewAs)) return send(403, { detail: "Start viewing from People first" }), true;
    viewer = uid;
    uid = viewAs;
  }
  const u = USERS[uid];
  if (u.disabled) return send(403, { detail: "This account has been suspended. Contact support if you think this is a mistake." }), true;
  const isOwner = u.role === "owner";
  const m = (re) => p.match(re);

  // Account
  if (p === "/hub/me") return send(200, { ...me(uid), viewing_as: viewer ? { admin_id: viewer } : null }), true;
  if (p === "/hub/onboarding" && req.method === "POST") {
    if (!body.over_18 || !body.accept_terms) return send(400, { detail: "Accept the Terms of Service and Privacy Policy to continue" }), true;
    u.name = body.name;
    u.onboarded = true;
    if (!u.is_admin) u.role = body.role === "owner" ? "owner" : "seeker";
    u.owner_kind = body.owner_kind || null;
    return send(200, me(uid)), true;
  }
  if (p === "/hub/role" && req.method === "POST") {
    if (u.role === "owner" && body.role === "renter" && LISTINGS.some((l) => ownerOf(l.id) === uid)) return send(409, { detail: "You have listings that are live or in review. Pause or archive them before switching to renting." }), true;
    u.role = body.role === "owner" ? "owner" : "seeker";
    return send(200, me(uid)), true;
  }
  if (p === "/hub/settings" && req.method === "PATCH") {
    if (body.name) u.name = body.name;
    if (typeof body.bio === "string") u.bio = body.bio;
    if ("agency_name" in body || "agency_licence" in body) {
      if ((body.owner_kind || u.owner_kind) !== "property_manager") return send(400, { detail: "Agency details are for property managers." }), true;
      u.agency_name = (body.agency_name || "").trim() || null;
      u.agency_licence = (body.agency_licence || "").trim() || null;
    }
    if (body.owner_kind) u.owner_kind = body.owner_kind;
    if (body.notification_prefs) u.prefs = body.notification_prefs;
    return send(200, me(uid)), true;
  }
  if (p === "/hub/home") return send(200, isOwner ? ownerHome(uid) : u.role !== "seeker" && u.is_admin ? { role: "admin" } : renterHome(uid)), true;
  if (p === "/hub/counts") {
    const unread = threads(uid).filter((t) => !t.muted && !t.archived).reduce((s, t) => s + t.unread_count, 0);
    const notes = (S.notifications[uid] || []).filter((n) => !n.is_read).length;
    const apps = isOwner ? S.applications.filter((a) => a.owner_id === uid && a.status === "submitted" && !a.owner_viewed_at).length : S.applications.filter((a) => a.renter_id === uid && a.status === "changes_requested").length;
    return send(200, { messages: unread, notifications: notes, applications: apps, maintenance: 0, tenancies: tenancySummaries(uid).filter((t) => t.renter_id === uid).length }), true;
  }

  // Notifications (existing notification-center API)
  if (p === "/notification-center" || p === "/notification-center/") {
    const list = S.notifications[uid] || [];
    return send(200, { notifications: list, unread_count: list.filter((n) => !n.is_read).length, total: list.length }), true;
  }
  if (p === "/notification-center/unread-count") return send(200, { count: (S.notifications[uid] || []).filter((n) => !n.is_read).length }), true;
  if (p === "/notification-center/mark-read") {
    for (const n of S.notifications[uid] || []) if ((body.notification_ids || []).includes(n.id)) n.is_read = true;
    return send(200, { ok: true }), true;
  }
  if (p === "/notification-center/mark-all-read") {
    for (const n of S.notifications[uid] || []) n.is_read = true;
    return send(200, { ok: true }), true;
  }

  // The paid renter ID check. Paying and the check itself complete at once here.
  const idCheck = () => {
    const c = ID_CHECKS[uid] || { status: "not_started", paid: false };
    return { available: true, fee: 19, status: c.status, paid: c.paid, refunded: false, tries_included: 3, tries_left: c.paid ? 3 : 0, can_start: c.paid && c.status !== "verified", last_error: null, verified_at: c.status === "verified" ? c.at : null };
  };
  if (p === "/hub/id-check" && req.method === "GET") return send(200, idCheck()), true;
  if (p === "/hub/id-check/checkout" && req.method === "POST") {
    if (isOwner) return send(403, { detail: "The ID check is for renters." }), true;
    ID_CHECKS[uid] = { status: "not_started", paid: true };
    return send(200, { checkout_url: "/hub/profile?id_check=paid#verification" }), true;
  }
  if (p === "/hub/id-check/start" && req.method === "POST") {
    if (!ID_CHECKS[uid]?.paid) return send(402, { detail: "Pay for the ID check first." }), true;
    ID_CHECKS[uid] = { status: "verified", paid: true, at: iso(now()) };
    return send(200, { url: "/hub/profile?id_check=done#verification" }), true;
  }

  // Rental profile and documents
  if (p === "/hub/rental-profile") {
    if (req.method === "PUT") {
      const { display_name, ...rest } = body;
      S.profiles[uid] = { ...(S.profiles[uid] || { household_adults: 1, household_children: 0, has_pets: false, rental_history: [], referees: [], preferred_suburbs: [], first_time_renter: false }), ...rest, updated_at: iso(now()) };
      if (display_name) u.name = display_name;
    }
    const prof = S.profiles[uid] || { intro: null, preferred_move_date: null, preferred_lease_months: null, preferred_suburbs: [], budget_weekly: null, bedrooms_min: null, household_adults: 1, household_children: 0, household_notes: null, has_pets: false, pet_details: null, employment_status: null, employer: null, job_title: null, employment_since: null, income_weekly: null, rental_history: [], first_time_renter: false, referees: [], updated_at: null };
    return send(200, { profile: prof, exists: Boolean(S.profiles[uid]), display_name: u.name, avatar_url: null, documents: S.documents[uid] || [], completion: completion(uid), verification: idVerified(uid) ? "verified" : "not_started" }), true;
  }
  if (p === "/hub/documents" && req.method === "POST") {
    const doc = { id: uuid(), kind: "income", label: null, file_name: "payslip.pdf", mime_type: "application/pdf", size_bytes: 182_000, created_at: iso(now()) };
    (S.documents[uid] = S.documents[uid] || []).unshift(doc);
    return send(200, doc), true;
  }
  if (p === "/hub/documents") return send(200, { documents: S.documents[uid] || [] }), true;
  let mm = m(/^\/hub\/documents\/([^/]+)\/url$/);
  if (mm) return send(200, { url: "https://example.test/doc.pdf", expires_in: 300 }), true;
  mm = m(/^\/hub\/documents\/([^/]+)$/);
  if (mm && req.method === "DELETE") {
    S.documents[uid] = (S.documents[uid] || []).filter((d) => d.id !== mm[1]);
    return send(200, { deleted: true }), true;
  }

  // Saved
  if (p === "/hub/saved/ids") return send(200, { ids: (S.saved[uid] || []).map((s) => s.id) }), true;
  if (p === "/hub/saved" && req.method === "POST") {
    const list = (S.saved[uid] = S.saved[uid] || []);
    if (!list.some((s) => s.id === body.listing_id)) list.unshift({ id: body.listing_id, at: iso(now()), price: listingById(body.listing_id)?.weekly_price });
    return send(200, { saved: true, listing_id: body.listing_id }), true;
  }
  if (p === "/hub/saved") return send(200, { homes: (S.saved[uid] || []).map((s) => ({ ...card(listingById(s.id)), saved_at: s.at, price_change: listingById(s.id).weekly_price - s.price || null })) }), true;
  mm = m(/^\/hub\/saved\/([^/]+)$/);
  if (mm && req.method === "DELETE") {
    S.saved[uid] = (S.saved[uid] || []).filter((s) => s.id !== mm[1]);
    return send(200, { saved: false }), true;
  }
  const searchOut = (s) => {
    const matches = LISTINGS.filter((l) => (!s.params.suburb || l.suburb === s.params.suburb) && (!s.params.max_price || l.weekly_price <= s.params.max_price));
    return { ...s, match_count: matches.length, new_count: 2, preview: matches.slice(0, 3).map((l) => card(l)) };
  };
  if (p === "/hub/searches" && req.method === "POST") {
    const s = { id: uuid(), name: body.name, params: body.params || {}, alert: body.alert || "daily", created_at: iso(now()), updated_at: iso(now()), last_checked_at: iso(now()) };
    (S.searches[uid] = S.searches[uid] || []).unshift(s);
    return send(200, searchOut(s)), true;
  }
  if (p === "/hub/searches") return send(200, { searches: (S.searches[uid] || []).map(searchOut) }), true;
  mm = m(/^\/hub\/searches\/([^/]+)(\/seen)?$/);
  if (mm) {
    const list = S.searches[uid] || [];
    const s = list.find((x) => x.id === mm[1]);
    if (!s) return send(404, { detail: "Saved search not found" }), true;
    if (req.method === "DELETE") {
      S.searches[uid] = list.filter((x) => x.id !== mm[1]);
      return send(200, { deleted: true }), true;
    }
    Object.assign(s, body || {});
    return send(200, searchOut(s)), true;
  }
  if (p === "/hub/compare") {
    const ids = (url.searchParams.get("ids") || "").split(",").filter(Boolean);
    return send(200, { homes: ids.map((id) => ({ ...card(listingById(id)), min_stay_weeks: 12, internet_included: true, air_conditioning: id.endsWith("2"), laundry: "In the unit", dishwasher: false, station_distance_min: 6, bond: "4 weeks", host_verification: "verified", upcoming_inspections: S.slots.filter((s) => s.listing_id === id).length })) }), true;
  }
  if (p === "/hub/recommendations") return send(200, { homes: renterHome(uid).recommended, method: "Matched on your budget, suburbs, bedrooms, move date and pets from your Rental Profile and saved searches." }), true;

  // Applications
  if (p === "/hub/applications" && req.method === "GET") {
    if (isOwner) return send(200, { role: "owner", applications: S.applications.filter((a) => a.owner_id === uid && a.status !== "draft").map((a) => appSummary(a, "owner")) }), true;
    return send(200, { role: "renter", applications: S.applications.filter((a) => a.renter_id === uid).map((a) => appSummary(a, "renter")) }), true;
  }
  if (p === "/hub/applications" && req.method === "POST") {
    if (isOwner) return send(403, { detail: "Applications are made from a renter account. Switch your account type in Settings to apply for a home." }), true;
    const existing = S.applications.find((a) => a.listing_id === body.listing_id && a.renter_id === uid && !["declined", "withdrawn", "not_proceeding"].includes(a.status));
    if (existing) return send(200, { application: existing, created: false }), true;
    const prof = S.profiles[uid] || {};
    const a = { id: uuid(), listing_id: body.listing_id, renter_id: uid, owner_id: ownerOf(body.listing_id), status: "draft", move_in_date: prof.preferred_move_date || null, lease_months: prof.preferred_lease_months || null, occupants: (prof.household_adults || 1) + (prof.household_children || 0), message: "", share_income: false, submitted_at: null, created_at: iso(now()), updated_at: iso(now()), changes_requested_by: null, events: [] };
    ev(a, "created", "renter", null, "draft");
    S.applications.push(a);
    return send(200, { application: a, created: true }), true;
  }
  mm = m(/^\/hub\/applications\/([^/]+)(?:\/(submit|withdraw|owner-action|notes))?$/);
  if (mm) {
    const a = S.applications.find((x) => x.id === mm[1]);
    if (!a || (a.renter_id !== uid && a.owner_id !== uid) || (a.owner_id === uid && a.status === "draft")) return send(404, { detail: "Application not found" }), true;
    const viewer = a.renter_id === uid ? "renter" : "owner";
    const action = mm[2];
    const touch = (status) => {
      a.status = status;
      a.updated_at = iso(now());
    };
    if (action === "submit") {
      const prof = S.profiles[uid] || {};
      const problems = [];
      if (!a.move_in_date) problems.push("Choose your move-in date");
      if ((prof.intro || "").length < 40) problems.push("Write a short introduction in your Rental Profile (a few sentences)");
      if (!prof.employment_status) problems.push("Add your work or study situation to your Rental Profile");
      if (problems.length) return send(422, { detail: { message: "A few things are needed before you send this", problems } }), true;
      const resubmit = a.status === "changes_requested";
      touch(resubmit && a.changes_requested_by === "migrent" ? "migrent_review" : "submitted");
      if (!resubmit) a.submitted_at = iso(now());
      ev(a, resubmit ? "resubmitted" : "submitted", "renter", null, a.status);
      return send(200, { application: a }), true;
    }
    if (action === "withdraw") {
      touch("withdrawn");
      ev(a, "withdrawn", "renter", body?.note || null, "withdrawn");
      return send(200, { application: a }), true;
    }
    if (action === "owner-action") {
      const map = { shortlist: "shortlisted", request_changes: "changes_requested", approve: "migrent_review", decline: "declined" };
      if (body.action === "request_changes" && !body.note) return send(400, { detail: "Tell the renter what you need" }), true;
      touch(map[body.action]);
      if (body.action === "approve") {
        ev(a, "owner_approved", "owner", body.note || null, "owner_approved");
        ev(a, "migrent_review_started", "system", null, "migrent_review");
      } else ev(a, { shortlist: "shortlisted", request_changes: "changes_requested", decline: "declined" }[body.action], "owner", body.note || null, a.status);
      if (body.action === "request_changes") a.changes_requested_by = "owner";
      return send(200, { application: a }), true;
    }
    if (action === "notes") {
      a.notes = a.notes || [];
      const n = { id: uuid(), body: body.body, created_at: iso(now()) };
      a.notes.push(n);
      return send(200, { note: n }), true;
    }
    if (req.method === "PATCH") {
      Object.assign(a, { ...body, document_ids: undefined });
      if (body.document_ids) a.document_ids = body.document_ids;
      a.updated_at = iso(now());
    }
    if (viewer === "owner" && a.status === "submitted") {
      a.owner_viewed_at = iso(now());
      touch("under_review");
      ev(a, "viewed", "owner", null, "under_review");
    }
    const l = listingById(a.listing_id);
    const docs = (S.documents[a.renter_id] || []).filter((d) => (a.document_ids || []).includes(d.id));
    const out = {
      viewer,
      application: { id: a.id, status: a.status, move_in_date: a.move_in_date, lease_months: a.lease_months, occupants: a.occupants, message: a.message, share_income: a.share_income, submitted_at: a.submitted_at, owner_approved_at: null, decided_at: null, finalised_at: null, created_at: a.created_at, updated_at: a.updated_at, changes_requested_by: a.changes_requested_by },
      listing: card(l, viewer === "owner"),
      events: a.events.filter((e) => viewer === "owner" || !["declined"].includes(e.event) || true),
      renter: person(a.renter_id),
      owner: person(a.owner_id),
      documents: docs,
    };
    if (viewer === "renter") {
      out.completion = completion(uid);
      out.available_documents = S.documents[uid] || [];
      const prof = S.profiles[uid] || {};
      out.problems = ["draft", "changes_requested"].includes(a.status) ? [...(!a.move_in_date ? ["Choose your move-in date"] : []), ...((prof.intro || "").length < 40 ? ["Write a short introduction in your Rental Profile (a few sentences)"] : [])] : [];
    } else {
      const prof = S.profiles[a.renter_id] || {};
      out.snapshot = { name: USERS[a.renter_id].name, avatar_url: null, member_since: USERS[a.renter_id].created_at.slice(0, 10), intro: prof.intro, household: { adults: prof.household_adults || 1, children: prof.household_children || 0, notes: prof.household_notes, has_pets: prof.has_pets, pet_details: prof.pet_details }, employment: { status: prof.employment_status, employer: prof.employer, job_title: prof.job_title, since: prof.employment_since }, income_weekly: a.share_income ? prof.income_weekly : null, rental_history: prof.rental_history || [], first_time_renter: prof.first_time_renter, referees: prof.referees || [], preferred_lease_months: prof.preferred_lease_months, verification: "not_started", captured_at: a.submitted_at };
      out.owner_notes = a.notes || [];
      out.other_applications_with_you = [];
      const allowed = { submitted: ["shortlist", "request_changes", "approve", "decline"], under_review: ["shortlist", "request_changes", "approve", "decline"], shortlisted: ["request_changes", "approve", "decline"], changes_requested: ["decline"] };
      out.allowed_actions = allowed[a.status] || [];
    }
    return send(200, out), true;
  }

  // Inspections
  if (p === "/hub/inspections") {
    if (isOwner) return send(200, { role: "owner", slots: S.slots.filter((s) => s.owner_id === uid).map((s) => slotOut(s, true)) }), true;
    return send(200, { role: "renter", bookings: renterBookings(uid, url.searchParams.get("scope") !== "all") }), true;
  }
  if (p === "/hub/inspections/slots" && req.method === "POST") {
    const created = (body.slots || []).map((s) => {
      const start = new Date(s.starts_at);
      const slot = { id: uuid(), listing_id: body.listing_id, owner_id: uid, starts_at: iso(start), ends_at: iso(new Date(start.getTime() + (s.duration_minutes || 30) * 60000)), capacity: body.capacity || 6, instructions: body.instructions || null, status: "scheduled" };
      S.slots.push(slot);
      return slotOut(slot, true);
    });
    return send(200, { slots: created }), true;
  }
  mm = m(/^\/hub\/inspections\/slots\/([^/]+)$/);
  if (mm && req.method === "PATCH") {
    const sl = S.slots.find((x) => x.id === mm[1] && x.owner_id === uid);
    if (!sl) return send(404, { detail: "Inspection time not found" }), true;
    const dur = new Date(sl.ends_at) - new Date(sl.starts_at);
    if (body.starts_at) Object.assign(sl, { starts_at: body.starts_at, ends_at: iso(new Date(new Date(body.starts_at).getTime() + dur)) });
    if (body.capacity) sl.capacity = body.capacity;
    if ("instructions" in body) sl.instructions = body.instructions;
    return send(200, { slot: slotOut(sl, true) }), true;
  }
  mm = m(/^\/hub\/inspections\/bookings\/([^/]+)\/attendance$/);
  if (mm) {
    const b = S.bookings.find((x) => x.id === mm[1]);
    if (!b) return send(404, { detail: "Booking not found" }), true;
    b.status = body.status;
    return send(200, { booking: { id: b.id, status: b.status } }), true;
  }
    mm = m(/^\/hub\/inspections\/slots\/([^/]+)\/cancel$/);
  if (mm) {
    const s = S.slots.find((x) => x.id === mm[1]);
    s.status = "cancelled";
    for (const b of S.bookings) if (b.slot_id === s.id) b.status = "cancelled";
    return send(200, { slot: s }), true;
  }
  mm = m(/^\/hub\/inspections\/slots\/([^/]+)\/attendees$/);
  if (mm) return send(200, { attendees: S.bookings.filter((b) => b.slot_id === mm[1]).map((b) => ({ booking_id: b.id, status: b.status, note: b.note, person: person(b.renter_id), booked_at: b.created_at })) }), true;
  mm = m(/^\/hub\/listings\/([^/]+)\/inspection-slots$/);
  if (mm) {
    const slots = S.slots.filter((s) => s.listing_id === mm[1] && s.status === "scheduled").map((s) => {
      const mine = S.bookings.find((b) => b.slot_id === s.id && b.renter_id === uid && b.status === "booked");
      const { listing, ...rest } = slotOut(s);
      void listing;
      return { ...rest, my_booking: mine ? { id: mine.id, status: "booked" } : null };
    });
    return send(200, { timezone: "Australia/Sydney", slots }), true;
  }
  if (p === "/hub/inspections/bookings" && req.method === "POST") {
    const s = S.slots.find((x) => x.id === body.slot_id);
    if (!s) return send(404, { detail: "That inspection time is no longer available" }), true;
    if (S.bookings.some((b) => b.slot_id === s.id && b.renter_id === uid && b.status === "booked")) return send(409, { detail: "You are already booked for this time" }), true;
    const b = { id: uuid(), slot_id: s.id, listing_id: s.listing_id, renter_id: uid, status: "booked", note: body.note || null, created_at: iso(now()) };
    S.bookings.push(b);
    return send(200, { booking: renterBookings(uid).find((x) => x.id === b.id) }), true;
  }
  mm = m(/^\/hub\/inspections\/bookings\/([^/]+)\/(cancel|reschedule)$/);
  if (mm) {
    const b = S.bookings.find((x) => x.id === mm[1]);
    b.status = "cancelled";
    if (mm[2] === "reschedule") {
      const nb = { ...b, id: uuid(), slot_id: body.slot_id, status: "booked", created_at: iso(now()) };
      S.bookings.push(nb);
      return send(200, { booking: renterBookings(uid).find((x) => x.id === nb.id) }), true;
    }
    return send(200, { booking: { id: b.id, status: "cancelled" } }), true;
  }

  // Inbox
  if (p === "/hub/inbox") {
    const f = url.searchParams.get("filter") || "all";
    const q = (url.searchParams.get("q") || "").toLowerCase();
    let list = threads(uid).filter((t) => (f === "archived" ? t.archived : !t.archived));
    if (f === "unread") list = list.filter((t) => t.unread_count);
    if (q) list = list.filter((t) => t.other.name.toLowerCase().includes(q) || (t.listing?.title || "").toLowerCase().includes(q) || t.last_message.text.toLowerCase().includes(q));
    return send(200, { threads: list, unread_total: list.reduce((s, t) => s + t.unread_count, 0) }), true;
  }
  // Blocking (backend/blocks.py): either side's block closes the conversation.
  const blockedBetween = (a, b) => S.blocks.some((x) => (x.blocker === a && x.blocked === b) || (x.blocker === b && x.blocked === a));
  if (p === "/hub/blocks" && req.method === "GET") return send(200, { blocked: S.blocks.filter((x) => x.blocker === uid).map((x) => ({ person: person(x.blocked), created_at: x.created_at })) }), true;
  if (p === "/hub/blocks" && req.method === "POST") {
    if (!S.blocks.some((x) => x.blocker === uid && x.blocked === body.user_id)) S.blocks.push({ blocker: uid, blocked: body.user_id, created_at: iso(now()) });
    return send(200, { blocked: true, user_id: body.user_id }), true;
  }
  mm = m(/^\/hub\/blocks\/([^/]+)$/);
  if (mm && req.method === "DELETE") {
    S.blocks = S.blocks.filter((x) => !(x.blocker === uid && x.blocked === mm[1]));
    return send(200, { blocked: false, user_id: mm[1] }), true;
  }
  mm = m(/^\/hub\/inbox\/([^/]+)(?:\/(messages|state))?$/);
  if (mm) {
    const key = mm[1];
    const [lid, other] = key.split("_");
    if (mm[2] === "messages") {
      if (blockedBetween(uid, other)) return send(403, { detail: "You can't contact this person on Migrent." }), true;
      const msg = { id: uuid(), sender: uid, receiver: other, listing_id: lid === "direct" ? null : lid, text: body.text || body.attachment_name || "Attachment", created_at: iso(now()), read_at: null };
      S.messages.push(msg);
      return send(200, { message: { id: msg.id, from_me: true, text: msg.text, attachment_url: null, attachment_name: body.attachment_name || null, attachment_type: body.attachment_type || null, read_at: null, created_at: msg.created_at } }), true;
    }
    if (mm[2] === "state") {
      S.states[uid] = S.states[uid] || {};
      S.states[uid][key] = { ...(S.states[uid][key] || {}), ...(body.archived !== undefined ? { archived: body.archived } : {}), ...(body.muted !== undefined ? { muted: body.muted } : {}) };
      return send(200, { key }), true;
    }
    const msgs = S.messages.filter((x) => (x.listing_id || "direct") === lid && ((x.sender === uid && x.receiver === other) || (x.sender === other && x.receiver === uid))).sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    for (const x of msgs) if (x.receiver === uid && !x.read_at) x.read_at = iso(now());
    const l = lid === "direct" ? null : listingById(lid);
    if (!msgs.length && !l) return send(404, { detail: "Conversation not found" }), true;
    const my_side = l && ownerOf(l.id) === uid ? "owner" : "renter";
    const renterId = my_side === "owner" ? other : uid;
    const app = l ? S.applications.find((a) => a.listing_id === l.id && a.renter_id === renterId && a.status !== "draft") : null;
    const booking = l ? S.bookings.find((b) => b.listing_id === l.id && b.renter_id === renterId && b.status === "booked") : null;
    const slot = booking ? S.slots.find((s) => s.id === booking.slot_id) : null;
    const st = (S.states[uid] || {})[key] || {};
    // A cut-down backend/message_safety.py, for the recipient only.
    const risks = (x) =>
      x.sender === uid
        ? []
        : [
            /\b(deposit|pay|payment|transfer)\b[^.?!]{0,60}\b(before|without)\b[^.?!]{0,40}\b(inspect\w*|view\w*)/i.test(x.text) ? "asks for money before you have inspected the home" : null,
            /\b(western union|moneygram|gift ?cards?|bitcoin|crypto)\b/i.test(x.text) ? "mentions a payment method scammers use (gift cards, crypto, money transfer services)" : null,
          ].filter(Boolean);
    return send(200, { key, listing: card(l, my_side === "owner"), other: person(other), other_user_id: other, my_side, archived: Boolean(st.archived), muted: Boolean(st.muted), blocked: { by_me: S.blocks.some((x) => x.blocker === uid && x.blocked === other), closed: blockedBetween(uid, other) }, messages: msgs.map((x) => ({ id: x.id, from_me: x.sender === uid, text: x.text, attachment_url: null, attachment_name: null, attachment_type: null, read_at: x.read_at, created_at: x.created_at, risks: risks(x) })), has_more: false, context: { application: app ? { id: app.id, status: app.status, updated_at: app.updated_at } : null, inspection: slot ? { booking_id: booking.id, id: slot.id, starts_at: slot.starts_at, ends_at: slot.ends_at, status: slot.status } : null } }), true;
  }
  if (p === "/hub/enquiries" && req.method === "POST") {
    const owner = ownerOf(body.listing_id);
    S.messages.push({ id: uuid(), sender: uid, receiver: owner, listing_id: body.listing_id, text: body.text, created_at: iso(now()), read_at: null });
    return send(200, { key: `${body.listing_id}_${owner}` }), true;
  }
  const myTemplates = (S.templates[uid] = S.templates[uid] || []);
  if (p === "/hub/templates" && req.method === "POST") {
    const t = { id: uuid(), title: body.title, body: body.body, updated_at: iso(now()), builtin: false };
    myTemplates.push(t);
    return send(200, { template: t }), true;
  }
  mm = m(/^\/hub\/templates\/([^/]+)$/);
  if (mm) {
    const t = myTemplates.find((x) => x.id === mm[1]);
    if (!t) return send(404, { detail: "Template not found" }), true;
    if (req.method === "DELETE") {
      S.templates[uid] = myTemplates.filter((x) => x.id !== t.id);
      return send(200, { deleted: true }), true;
    }
    Object.assign(t, { title: body.title, body: body.body, updated_at: iso(now()) });
    return send(200, { template: t }), true;
  }
  if (p === "/hub/templates") {
    return send(200, { templates: [...myTemplates, { id: "builtin-inspection", title: "Invite to inspect", body: "Thanks for your interest. I have inspection times open this week - you can book one straight from the listing in Migrent Hub.", builtin: true }, { id: "builtin-documents", title: "Ask for documents", body: "Thanks for applying. Could you add a recent payslip or proof of income to your application?", builtin: true }, { id: "builtin-received", title: "Application received", body: "Thanks - I have received your application and will be in touch after the inspections have finished.", builtin: true }] }), true;
  }

  // Owner
  if (p === "/hub/properties" && req.method === "GET") {
    if (!isOwner) return send(403, { detail: "This is only available to accounts that list properties" }), true;
    return send(200, portfolio(uid)), true;
  }
  mm = m(/^\/hub\/properties\/([^/]+)\/archive$/);
  if (mm) {
    if (LISTINGS.some((l) => OWNED[l.id]?.property === mm[1])) return send(409, { detail: "Archive or remove this property's listings first" }), true;
    const i = PROPERTIES.findIndex((x) => x.id === mm[1] && x.owner_id === uid);
    if (i < 0) return send(404, { detail: "Property not found" }), true;
    PROPERTIES.splice(i, 1);
    return send(200, { archived: true }), true;
  }
  mm = m(/^\/hub\/properties\/([^/]+)$/);
  if (mm && req.method === "PATCH") {
    const prop = PROPERTIES.find((x) => x.id === mm[1] && x.owner_id === uid);
    if (!prop) return send(404, { detail: "Property not found" }), true;
    Object.assign(prop, body);
    return send(200, { property: prop }), true;
  }
  if (mm && req.method === "GET") {
    const prop = portfolio(uid).properties.find((x) => x.id === mm[1]);
    if (!prop) return send(404, { detail: "Property not found" }), true;
    return send(200, { property: { ...prop, tenancies: S.tenancies.filter((t) => t.property_id === prop.id && ["upcoming", "active"].includes(t.status)).map((t) => ({ id: t.id, listing_id: t.listing_id, status: t.status, start_date: t.start_date, end_date: t.end_date, rent_amount: t.rent_amount, rent_frequency: t.rent_frequency, renter: person(t.renter_id) })), performance: { days: 30, totals: perfTotals(prop.units), by_listing: Object.fromEntries(prop.units.map((un, i) => [un.id, { view: 92 - i * 30, save: 11 - i * 4, enquiry: 5 - i * 2, application_submitted: 1 }])), tracking_since: "2026-09-01T00:00:00Z" } } }), true;
  }
  if (p === "/hub/listing-drafts" && req.method === "POST") {
    const d = { id: uuid(), owner_id: uid, property_id: body.property_id || null, data: body.data || {}, step: body.property_id ? 1 : 0, created_at: iso(now()), updated_at: iso(now()), submitted_at: null };
    if (body.property_id) {
      const prop = PROPERTIES.find((x) => x.id === body.property_id);
      Object.assign(d.data, { street_address: prop.street_address, suburb: prop.suburb, state: prop.state, postcode: prop.postcode, property_type: prop.property_type });
    }
    S.drafts.push(d);
    return send(200, { draft: d }), true;
  }
  if (p === "/hub/listing-drafts") return send(200, { drafts: S.drafts.filter((d) => d.owner_id === uid && !d.submitted_at).map(draftSummary) }), true;
  mm = m(/^\/hub\/listing-drafts\/([^/]+)(\/submit)?$/);
  if (mm) {
    const d = S.drafts.find((x) => x.id === mm[1] && x.owner_id === uid);
    if (!d) return send(404, { detail: "Draft not found" }), true;
    if (mm[2]) {
      const data = d.data;
      const problems = [];
      if (!data.street_address) problems.push({ step: "property", field: "street_address", message: "Add the street address" });
      if (!data.title) problems.push({ step: "details", field: "title", message: "Give the listing a title" });
      if (!(data.images || []).length) problems.push({ step: "photos", field: "images", message: "Add at least one photo" });
      if (!data.weekly_price) problems.push({ step: "pricing", field: "weekly_price", message: "Set the weekly rent" });
      if (!data.available_from) problems.push({ step: "availability", field: "available_from", message: "Choose when it is available from" });
      if (problems.length) return send(422, { detail: { message: "A few things are needed before this can go live", problems } }), true;
      const id = uuid();
      CREATED.push({ id, title: data.title, suburb: data.suburb, city: "Sydney", postcode: Number(data.postcode), weekly_price: Number(data.weekly_price), description: data.description, images: data.images, property_type: data.property_type, place_type: data.place_type, bedrooms: data.bedrooms, bathrooms: data.bathrooms, furnished: data.furnished, bills_included: data.bills_included, available_from: data.available_from, available_to: null, display_address: `${data.suburb} ${data.postcode}`, public_state: "unavailable" });
      OWNED[id] = { owner: uid, property: d.property_id || "prop-smith", unit_label: data.unit_label || null, moderation_status: "pending_approval", occupancy: "vacant", address: data.street_address };
      d.submitted_at = iso(now());
      return send(200, { listing_id: id, property_id: OWNED[id].property, moderation_status: "pending_approval", needs_verification: false }), true;
    }
    if (req.method === "PUT") {
      d.data = body.data;
      d.step = body.step;
      d.updated_at = iso(now());
      return send(200, { draft: { id: d.id, step: d.step, updated_at: d.updated_at } }), true;
    }
    if (req.method === "DELETE") {
      S.drafts = S.drafts.filter((x) => x.id !== d.id);
      return send(200, { deleted: true }), true;
    }
    return send(200, { draft: d }), true;
  }
  // Reviews (backend/routes_hub_reviews.py): a tenancy a month in can be
  // reviewed by both sides, once each.
  if (p === "/hub/reviews/pending") {
    const pending = S.tenancies
      .filter((t) => (t.renter_id === uid || t.owner_id === uid) && t.status === "active" && t.start_date <= dayIso(inDays(-30)))
      .filter((t) => !S.reviews.some((r) => r.tenancy_id === t.id && r.reviewer === uid))
      .map((t) => {
        const asRenter = t.renter_id === uid;
        return { kind: "tenancy", id: t.id, direction: asRenter ? "seeker_to_owner" : "owner_to_seeker", listing: card(listingById(t.listing_id), !asRenter), other: person(asRenter ? t.owner_id : t.renter_id), closes_on: null };
      });
    return send(200, { pending }), true;
  }
  if (p === "/hub/reviews" && req.method === "POST") {
    if (!body.rating) return send(422, { detail: "Choose a rating" }), true;
    if (S.reviews.some((r) => r.tenancy_id === body.id && r.reviewer === uid)) return send(409, { detail: "You have already reviewed this." }), true;
    const r = { id: uuid(), tenancy_id: body.id, reviewer: uid, rating: body.rating, text: body.text || null, created_at: iso(now()) };
    S.reviews.push(r);
    return send(200, { review: { id: r.id, kind: body.kind, context_id: body.id } }), true;
  }
  // A cut-down backend/listing_rules.py: enough for the wizard's live check.
  if (p === "/hub/location-check") {
    const suburb = String(url.searchParams.get("suburb") || "").trim().toLowerCase();
    const state = url.searchParams.get("state");
    if (suburb === "parramatta" && state && state !== "NSW") return send(200, { problem: `There's no Parramatta in ${state}. Parramatta is in NSW. Check the suburb and the state.`, hint: null, match: null }), true;
    return send(200, { problem: null, hint: null, match: null }), true;
  }
  if (p === "/hub/ai/listing-copy") return send(503, { detail: "The writing assistant is not switched on in the mock." }), true;
  if (p === "/hub/listing-photos") return send(200, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200", width: 1200, height: 800 }), true;
  if (p === "/hub/listings/bulk" && req.method === "POST") {
    if (!isOwner) return send(403, { detail: "Only owners can manage listings" }), true;
    if (!["pause", "resume", "renew"].includes(body.action)) return send(422, { detail: "Unknown action" }), true;
    const results = (body.listing_ids || []).map((id) => {
      const meta = OWNED[id];
      const l = listingById(id);
      if (!meta || meta.owner !== uid || !l) return { id, ok: false, error: "Listing not found" };
      if (body.action === "pause") {
        if (meta.moderation_status !== "approved") return { id, ok: false, error: "Only live listings can be paused." };
        meta.moderation_status = "paused";
      } else if (body.action === "resume") {
        if (meta.moderation_status !== "paused") return { id, ok: false, error: "Only paused listings can be brought back." };
        meta.moderation_status = "approved";
      } else {
        if (!body.available_to) return { id, ok: false, error: "Choose the new last day." };
        l.available_to = body.available_to;
      }
      return { id, ok: true, moderation_status: meta.moderation_status };
    });
    return send(200, { results, changed: results.filter((r) => r.ok).length }), true;
  }
  mm = m(/^\/hub\/listings\/([^/]+)(?:\/(occupancy|unit))?$/);
  if (mm) {
    const l = listingById(mm[1]);
    if (!l || ownerOf(l.id) !== uid) return send(404, { detail: "Listing not found" }), true;
    if (mm[2] === "occupancy") {
      OWNED[l.id].occupancy = body.occupancy;
      return send(200, { listing_id: l.id, occupancy: body.occupancy, occupied_until: body.occupied_until || null }), true;
    }
    if (mm[2] === "unit") {
      if ("unit_label" in body) OWNED[l.id].unit_label = body.unit_label;
      if (body.min_stay_weeks) l.min_stay_weeks = body.min_stay_weeks;
      if (body.max_stay_weeks) l.max_stay_weeks = body.max_stay_weeks;
      if (body.listing_purpose) l.listing_purpose = body.listing_purpose;
      if ("require_verified_renters" in body) l.require_verified_renters = Boolean(body.require_verified_renters);
      return send(200, { listing_id: l.id, unit_label: OWNED[l.id].unit_label, require_verified_renters: Boolean(l.require_verified_renters) }), true;
    }
    const meta = OWNED[l.id];
    return send(200, { listing: { ...l, ...card(l, true), street_address: meta.address, moderation_status: meta.moderation_status, moderation_notes: null, status: unitStatus(l), pending_applications: S.applications.filter((a) => a.listing_id === l.id && ["submitted", "under_review", "shortlisted"].includes(a.status)).length, upcoming_inspections: S.slots.filter((s) => s.listing_id === l.id && s.status === "scheduled").length, performance: { days: 30, totals: perfTotals([l]), by_listing: {}, tracking_since: "2026-09-01T00:00:00Z" }, owner_verified: true, exact_location: { lat: -33.7139, lng: 150.9501 } } }), true;
  }
  if (p === "/hub/insights") {
    const units = portfolio(uid).properties.flatMap((x) => x.units);
    return send(200, { days: 30, tracking_since: "2026-09-01T00:00:00Z", funnel: perfTotals(units), listings: units.map((un, i) => ({ listing: un, view: 92 - i * 25, unique_views: 70 - i * 20, save: 11 - i * 3, enquiry: 5 - i, inspection_booked: 3 - i, application_started: 2, application_submitted: 1 })), occupancy: { occupied: 0, units: units.length }, median_days_vacant: 12, median_reply_hours: 3.5, rent_recorded: null }), true;
  }
  if (p === "/hub/tenancies") {
    const all = url.searchParams.get("scope") === "all";
    return send(200, { tenancies: tenancySummaries(uid).filter((t) => all || ["upcoming", "active"].includes(t.status)) }), true;
  }
  const maintOut = (m) => ({ ...Object.fromEntries(["id", "category", "title", "urgency", "status", "scheduled_for", "created_at", "updated_at", "tenancy_id"].map((k) => [k, m[k]])), photo_count: m.photos.length, listing: card(listingById(m.listing_id), m.owner_id === uid), renter: person(m.renter_id) });
  const emergencyFor = () => ({ lines: ["If anyone is in danger, or there is fire, a gas leak or live electrical wiring, call 000 now.", "For a burst pipe, turn off the water at the mains. For a gas smell, leave and call your gas distributor's emergency line.", "Phone the owner or manager as well as sending this request - do not rely on a message alone for an emergency."], authority_name: "NSW Fair Trading", authority_url: "https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/repairs-and-maintenance" });
  const FLOW = { submitted: ["acknowledged", "scheduled", "in_progress", "resolved"], acknowledged: ["scheduled", "in_progress", "resolved"], scheduled: ["in_progress", "resolved", "acknowledged"], in_progress: ["resolved", "scheduled"], resolved: ["closed", "in_progress"], closed: [] };
  const maintDetail = (m) => {
    const viewer = m.owner_id === uid ? "owner" : "renter";
    return { viewer, request: { ...maintOut(m), description: m.description, access_notes: m.access_notes, resolved_at: m.resolved_at, closed_at: m.closed_at }, photos: m.photos, updates: m.updates.filter((x) => viewer === "owner" || !x.internal), listing: card(listingById(m.listing_id), viewer === "owner"), renter: person(m.renter_id), owner: person(m.owner_id), next_statuses: viewer === "owner" ? FLOW[m.status] : m.status === "resolved" ? ["closed"] : [], emergency: m.urgency !== "routine" ? emergencyFor() : null };
  };
  if (p === "/hub/maintenance") {
    const open = url.searchParams.get("status") !== "all";
    const rows = S.maintenance.filter((m) => (isOwner ? m.owner_id : m.renter_id) === uid && (!open || !["resolved", "closed"].includes(m.status)));
    return send(200, { requests: rows.map(maintOut) }), true;
  }
  mm = m(/^\/hub\/maintenance\/([^/]+)(?:\/(updates|photos))?$/);
  if (mm) {
    const r = S.maintenance.find((x) => x.id === mm[1] && (x.owner_id === uid || x.renter_id === uid));
    if (!r) return send(404, { detail: "Request not found" }), true;
    if (mm[2] === "photos") {
      r.photos.push("https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800");
      return send(200, { photos: r.photos.length }), true;
    }
    if (mm[2] === "updates") {
      const viewer = r.owner_id === uid ? "owner" : "renter";
      const to = body.status_to || null;
      if (to && !(viewer === "owner" ? FLOW[r.status] : r.status === "resolved" ? ["closed"] : []).includes(to)) return send(409, { detail: "That status change is not available" }), true;
      if (!to && !(body.body || "").trim()) return send(400, { detail: "Write an update or change the status" }), true;
      r.updates.push({ id: uuid(), author_role: viewer, body: body.body || null, status_from: to ? r.status : null, status_to: to, internal: Boolean(body.internal && viewer === "owner"), created_at: iso(now()) });
      if (to) {
        r.status = to;
        if (to === "resolved") r.resolved_at = iso(now());
        if (to === "closed") r.closed_at = iso(now());
        if (to === "scheduled") r.scheduled_for = body.scheduled_for || null;
      }
      r.updated_at = iso(now());
    }
    return send(200, maintDetail(r)), true;
  }
  // Move-in payments (backend/move_in.py). The mock's "checkout" pays at
  // once, standing in for Stripe and its webhook.
  if (p === "/hub/payouts") return send(200, { enabled: true, payouts_ready: true, payouts_started: true, card_saved: true, card_label: "Visa ending 4242", fee: 99 }), true;
  mm = m(/^\/hub\/tenancies\/([^/]+)\/(move-in|receipt)(?:\/(checkout|confirm|fee))?$/);
  if (mm) {
    const t = S.tenancies.find((x) => x.id === mm[1] && (x.owner_id === uid || x.renter_id === uid));
    if (!t) return send(404, { detail: "Tenancy not found" }), true;
    const viewer = t.owner_id === uid ? "owner" : "renter";
    S.moveIns ||= {};
    const weekly = t.rent_amount;
    const quote = { weeks: 2, weekly, rent: weekly * 2, card_fee: 10.64, amount: weekly * 2 + 10.64 };
    let mi = S.moveIns[t.id];
    const state = () => (mi ? { id: mi.id, status: mi.status, weeks: 2, amount: quote.amount, card_fee: quote.card_fee, to_owner: quote.rent, paid_at: mi.paid_at, green_light: true, owner_confirmed_at: mi.owner_confirmed_at, renter_confirmed_at: mi.renter_confirmed_at, complete: Boolean(mi.owner_confirmed_at && mi.renter_confirmed_at), receipt_code: mi.code, ...(viewer === "owner" ? { fee_status: "charged", fee: 99 } : {}) } : { status: "not_started" });
    if (mm[2] === "receipt") {
      if (!mi) return send(404, { detail: "There is no receipt yet" }), true;
      const base = { role: viewer, receipt_code: mi.code, issued_at: mi.paid_at, payment: { amount: quote.amount, weeks: 2, weekly_rent: weekly, card_fee: quote.card_fee, to_owner: quote.rent, currency: "AUD", paid_at: mi.paid_at, reference: "pi_mock_123", status: "paid" }, tenancy: { start_date: t.start_date, end_date: t.end_date, rent_amount: t.rent_amount, rent_frequency: t.rent_frequency }, property: { title: listingById(t.listing_id)?.title, address: OWNED[t.listing_id]?.address, unit_label: null } };
      return send(200, viewer === "renter" ? { ...base, owner: { name: USERS[t.owner_id].name, email: USERS[t.owner_id].email, phone: "0400 000 000", member_since: "2026-02-14", id_checked: true }, bond_note: "The bond is not paid through Migrent." } : { ...base, renter: { name: USERS[t.renter_id].name, email: USERS[t.renter_id].email, phone: null, member_since: "2026-04-20" }, fee: { status: "charged", amount: 99, charged_at: mi.paid_at } }), true;
    }
    if (mm[3] === "checkout") {
      if (viewer !== "renter") return send(403, { detail: "The renter pays the move-in rent." }), true;
      mi = S.moveIns[t.id] = { id: uuid(), status: "paid", paid_at: iso(now()), code: "K7PM2QX9RT", owner_confirmed_at: null, renter_confirmed_at: null };
      return send(200, { url: `/hub/tenancies/${t.id}?move_in=paid` }), true;
    }
    if (mm[3] === "confirm") {
      if (!mi) return send(409, { detail: "Nothing to confirm yet" }), true;
      mi[viewer === "owner" ? "owner_confirmed_at" : "renter_confirmed_at"] = iso(now());
      return send(200, { payment: state() }), true;
    }
    return send(200, { enabled: true, viewer, owner_ready: true, quote, payment: state(), owner_setup: viewer === "owner" ? { enabled: true, payouts_ready: true, card_saved: true, card_label: "Visa ending 4242", fee: 99 } : null }), true;
  }
  mm = m(/^\/hub\/tenancies\/([^/]+)(?:\/(schedule|maintenance|payments)(?:\/([^/]+))?)?$/);
  if (mm) {
    const t = S.tenancies.find((x) => x.id === mm[1] && (x.owner_id === uid || x.renter_id === uid));
    if (!t) return send(404, { detail: "Tenancy not found" }), true;
    const viewer = t.owner_id === uid ? "owner" : "renter";
    const pays = (S.payments[t.id] = S.payments[t.id] || []);
    if (mm[2] === "schedule") {
      if (viewer !== "owner") return send(403, { detail: "Only the owner can set up the rent schedule" }), true;
      let added = 0;
      const step = t.rent_frequency === "fortnightly" ? 14 : t.rent_frequency === "monthly" ? 30 : 7;
      const amount = t.rent_frequency === "fortnightly" ? t.rent_amount * 2 : t.rent_frequency === "monthly" ? Math.round((t.rent_amount * 52) / 12) : t.rent_amount;
      for (let d = new Date(t.start_date), n = 0; n < 13; n++, d = new Date(d.getTime() + step * 86400000)) {
        const day = dayIso(d);
        if (!pays.some((x) => x.due_date === day)) {
          pays.push({ id: uuid(), tenancy_id: t.id, due_date: day, amount_due: amount, amount_paid: 0, status: "due", paid_on: null, method: null, reference: null, provider: null });
          added++;
        }
      }
      pays.sort((a, b) => (a.due_date < b.due_date ? -1 : 1));
      return send(200, { added }), true;
    }
    if (mm[2] === "payments") {
      const pay = pays.find((x) => x.id === mm[3]);
      if (!pay) return send(404, { detail: "Payment not found" }), true;
      Object.assign(pay, { status: body.status, method: body.method || null, reference: body.reference || null, amount_paid: body.status === "paid" ? body.amount_paid ?? pay.amount_due : body.status === "partial" ? body.amount_paid : 0, paid_on: ["paid", "partial"].includes(body.status) ? body.paid_on || dayIso(now()) : null });
      return send(200, { payment: pay }), true;
    }
    if (mm[2] === "maintenance") {
      if (viewer !== "renter") return send(403, { detail: "Maintenance requests come from the renter" }), true;
      const r = { id: uuid(), tenancy_id: t.id, listing_id: t.listing_id, owner_id: t.owner_id, renter_id: uid, category: body.category, title: body.title, description: body.description, urgency: body.urgency || "routine", status: "submitted", access_notes: body.access_notes || null, scheduled_for: null, photos: [], created_at: iso(now()), updated_at: iso(now()), resolved_at: null, closed_at: null, updates: [{ id: uuid(), author_role: "renter", body: null, status_from: null, status_to: "submitted", internal: false, created_at: iso(now()) }] };
      S.maintenance.unshift(r);
      return send(200, { request: r, emergency: r.urgency !== "routine" ? emergencyFor() : null }), true;
    }
    if (req.method === "PATCH") {
      if (viewer !== "owner") return send(403, { detail: "Only the owner can change tenancy details" }), true;
      Object.assign(t, body);
      if (body.status === "ended" || body.status === "cancelled") OWNED[t.listing_id].occupancy = "vacant";
      return send(200, { tenancy: t }), true;
    }
    const c = card(listingById(t.listing_id), viewer === "owner");
    if (c) c.street_address = OWNED[t.listing_id]?.address;
    const due = pays.filter((x) => x.status === "due" || x.status === "partial").sort((a, b) => (a.due_date < b.due_date ? -1 : 1));
    return send(200, {
      viewer,
      tenancy: Object.fromEntries(["id", "status", "start_date", "end_date", "rent_amount", "rent_frequency", "bond_amount", "notes", "application_id", "created_at"].map((k) => [k, t[k]])),
      listing: c,
      renter: person(t.renter_id),
      owner: person(t.owner_id),
      payments: pays,
      ledger: { recorded_paid: pays.reduce((sum, x) => sum + (x.amount_paid || 0), 0), next_payment: due[0] || null },
      maintenance: S.maintenance.filter((x) => x.tenancy_id === t.id).map(maintOut),
      emergency: emergencyFor(),
      payments_note: "Migrent does not collect rent or bond. This is a record of what was due and what the owner has recorded as received.",
    }), true;
  }

  // Admin
  if (p.startsWith("/hub/admin/")) {
    if (!u.is_admin) return send(404, { detail: "Not found" }), true;
    // The Admin panel's second password. Mirrors backend/admin_panel.py and
    // routes_hub_admin.py (/panel, /unlock, /password).
    const panel = PANEL.state(uid);
    if (p === "/hub/admin/panel") return send(200, { attempts_left: Math.max(0, 3 - panel.failures), locked: panel.lockedUntil > Date.now() }), true;
    if (p === "/hub/admin/unlock" && req.method === "POST") {
      if (panel.lockedUntil > Date.now()) return send(200, { unlocked: false, locked: true, attempts_left: 0 }), true;
      if (body?.password === PANEL.password) {
        panel.failures = 0;
        S.audit.unshift({ id: uuid(), action: "admin_panel_unlock", target_type: "user", target_id: uid, reason: null, metadata: {}, created_at: iso(now()), admin: person(uid) });
        const tok = crypto.randomBytes(18).toString("base64url");
        PANEL.tokens.set(tok, { uid, exp: Date.now() + 20 * 60_000 });
        return send(200, { unlocked: true, token: tok, expires_in_seconds: 1200 }), true;
      }
      panel.failures += 1;
      S.audit.unshift({ id: uuid(), action: "admin_panel_failed", target_type: "user", target_id: uid, reason: null, metadata: {}, created_at: iso(now()), admin: person(uid) });
      if (panel.failures >= 3) {
        panel.lockedUntil = Date.now() + 15 * 60_000;
        S.audit.unshift({ id: uuid(), action: "admin_panel_lockout", target_type: "user", target_id: uid, reason: "3 wrong admin panel passwords", metadata: {}, created_at: iso(now()), admin: person(uid) });
        for (const [id, x] of Object.entries(USERS)) {
          if (x.is_admin) (S.notifications[id] ||= []).unshift({ id: uuid(), type: "admin_security_alert", title: "Potential threat: admin panel locked", body: `3 wrong admin panel passwords were entered on ${u.name}'s account.`, cta_url: "/hub/admin/audit", entity_type: "user", entity_id: uid, is_read: false, created_at: iso(now()) });
        }
        return send(200, { unlocked: false, locked: true, attempts_left: 0 }), true;
      }
      return send(200, { unlocked: false, locked: false, attempts_left: 3 - panel.failures }), true;
    }
    if (p !== "/hub/admin/view-as/end") {
      const unlock = PANEL.tokens.get(String(req.headers["x-migrent-admin-unlock"] || ""));
      if (!unlock || unlock.uid !== uid || unlock.exp < Date.now()) return send(423, { detail: "The admin panel is locked. Enter the admin password to open it." }), true;
    }
    if (p === "/hub/admin/password" && req.method === "POST") {
      if (body.current_password !== PANEL.password) return send(400, { detail: "The current admin password is not right." }), true;
      if ((body.new_password || "").length < 8) return send(400, { detail: "Use at least 8 characters." }), true;
      PANEL.password = body.new_password;
      S.audit.unshift({ id: uuid(), action: "admin_panel_password_changed", target_type: "user", target_id: uid, reason: null, metadata: {}, created_at: iso(now()), admin: person(uid) });
      return send(200, { changed: true }), true;
    }
    if (p === "/hub/admin/overview")
      return send(200, {
        final_reviews: S.applications.filter((a) => a.status === "migrent_review").length,
        open_reports: S.reports.filter((r) => r.status === "pending").length,
        listings_in_review: S.moderation.filter((l) => ["pending_approval", "flagged"].includes(l.moderation_status)).length,
        id_checks_waiting: S.idChecks.filter((c) => c.id_status === "pending").length,
        mentors_waiting: S.mentors.filter((m) => m.status === "pending").length,
        open_emergencies: 0,
        tickets_waiting: S.tickets.filter((t) => ["open", "pending_internal"].includes(t.status)).length,
        accounts: Object.keys(USERS).length,
        approved_listings: LISTINGS.length,
      }), true;
    if (adminExtras(p, url, body, uid, send, req)) return true;
    if (p === "/hub/admin/applications") return send(200, { applications: S.applications.filter((a) => a.status === "migrent_review").map((a) => ({ ...appSummary(a, "owner"), owner: person(a.owner_id), owner_approved_at: a.updated_at })) }), true;
    mm = m(/^\/hub\/admin\/applications\/([^/]+)\/decision$/);
    if (mm) {
      const a = S.applications.find((x) => x.id === mm[1]);
      const map = { finalise: "finalised", request_corrections: "changes_requested", stop: "not_proceeding" };
      a.status = map[body.action];
      S.audit.unshift({ id: uuid(), action: `${body.action}_application`, target_type: "application", target_id: a.id, reason: body.reason || null, metadata: {}, created_at: iso(now()), admin: person(uid) });
      return send(200, { application: a }), true;
    }
    const reportTarget = (r) => {
      if (r.item_type !== "message") return card(listingById(r.item_id), true);
      const msg = S.messages.find((x) => x.id === r.item_id);
      return msg ? { text: msg.text, from: person(msg.sender), to: person(msg.receiver) } : null;
    };
    if (p === "/hub/admin/reports") return send(200, { reports: S.reports.filter((r) => url.searchParams.get("status") === "all" || ["pending", "reviewing"].includes(r.status)).map((r) => ({ ...r, target: reportTarget(r), reporter: r.reporter_id ? person(r.reporter_id) : null, assigned_to: null })) }), true;
    mm = m(/^\/hub\/admin\/reports\/([^/]+)\/conversation$/);
    if (mm) {
      const r = S.reports.find((x) => x.id === mm[1] && x.item_type === "message");
      const msg = r && S.messages.find((x) => x.id === r.item_id);
      if (!msg) return send(404, { detail: "That report isn't about a message" }), true;
      S.audit.unshift({ id: uuid(), action: "view_conversation", target_type: "report", target_id: r.id, reason: null, metadata: {}, created_at: iso(now()), admin: person(uid) });
      const pair = [msg.sender, msg.receiver];
      const thread = S.messages.filter((x) => x.listing_id === msg.listing_id && pair.includes(x.sender) && pair.includes(x.receiver)).sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
      return send(200, { reported_message_id: msg.id, people: Object.fromEntries(pair.map((id) => [id, person(id)])), messages: thread.map((x) => ({ id: x.id, from: x.sender, text: x.text, attachment_name: null, created_at: x.created_at })) }), true;
    }
    mm = m(/^\/hub\/admin\/reports\/([^/]+)$/);
    if (mm) {
      const r = S.reports.find((x) => x.id === mm[1]);
      if (["actioned", "dismissed"].includes(body.status) && !(body.resolution || "").trim()) return send(400, { detail: "Record what was decided and why" }), true;
      Object.assign(r, body.status ? { status: body.status, resolution: body.resolution || null, action_taken: body.action_taken || null } : {}, body.priority ? { priority: body.priority } : {}, body.assign_to_me ? { assigned_to: uid } : {});
      if (body.status === "actioned" || body.status === "dismissed") S.audit.unshift({ id: uuid(), action: body.status === "actioned" ? "resolve_report" : "dismiss_report", target_type: "report", target_id: r.id, reason: body.resolution, metadata: {}, created_at: iso(now()), admin: person(uid) });
      return send(200, { report: r }), true;
    }
    if (p === "/hub/admin/audit") return send(200, { entries: S.audit.filter((e) => !url.searchParams.get("target_type") || e.target_type === url.searchParams.get("target_type")) }), true;
    if (p === "/hub/admin/emergencies") return send(200, { requests: S.maintenance.filter((x) => x.urgency === "emergency" && ["submitted", "acknowledged"].includes(x.status)).map((x) => ({ id: x.id, category: x.category, title: x.title, description: x.description, urgency: x.urgency, status: x.status, created_at: x.created_at, updated_at: x.updated_at, listing: card(listingById(x.listing_id), true), owner: person(x.owner_id), renter: person(x.renter_id) })) }), true;
    const idStatusOf = (id) => ({ verified: "approved", pending: "pending" })[idCheckOf(id)] || (S.idChecks.find((c) => c.user_id === id)?.id_status ?? null);
    if (p === "/hub/admin/users") {
      const sp = url.searchParams;
      const q = (sp.get("q") || "").toLowerCase();
      const rows = Object.entries(USERS)
        .filter(([id, x]) => (!q || x.email.includes(q) || x.name.toLowerCase().includes(q)) && (!sp.get("role") || (sp.get("role") === "admin" ? x.is_admin : account(id).role === sp.get("role"))) && (!sp.get("suspended") || Boolean(x.disabled) === (sp.get("suspended") === "true")) && (!sp.get("id_status") || idStatusOf(id) === sp.get("id_status")) && (!sp.get("joined_after") || x.created_at >= sp.get("joined_after")))
        .sort((a, b) => b[1].created_at.localeCompare(a[1].created_at));
      const offset = Number(sp.get("offset") || 0);
      return send(200, { users: rows.slice(offset, offset + 50).map(([id]) => ({ ...account(id), id_status: idStatusOf(id) })), total: rows.length, has_more: offset + 50 < rows.length }), true;
    }
    mm = m(/^\/hub\/admin\/users\/([^/]+)$/);
    if (mm && req.method === "GET") {
      const id = mm[1];
      const x = USERS[id];
      if (!x) return send(404, { detail: "Person not found" }), true;
      const owned = Object.entries(OWNED).filter(([, meta]) => meta.owner === id).map(([lid, meta]) => ({ lid, meta, l: listingById(lid) })).filter((o) => o.l);
      const listings = [...owned.map(({ lid, meta, l }) => ({ id: lid, title: l.title, suburb: l.suburb, postcode: l.postcode, weekly_price: l.weekly_price, moderation_status: meta.moderation_status, created_at: l.created_at })), ...S.moderation.filter((l) => l.owner_id === id).map((l) => ({ id: l.id, title: l.title, suburb: l.suburb, postcode: l.postcode, weekly_price: l.weekly_price, moderation_status: l.moderation_status, created_at: l.created_at }))];
      const ids = new Set([id, ...listings.map((l) => l.id)]);
      const sentBy = new Set(S.messages.filter((msg) => msg.sender === id).map((msg) => msg.id));
      const check = S.idChecks.find((c) => c.user_id === id);
      return send(200, {
        person: { ...account(id), owner_kind: x.owner_kind || null, agency_name: x.agency_name || null, agency_licence: x.agency_licence || null },
        id_check: { id_status: idStatusOf(id) || "not_submitted", id_document_type: check?.document_type || (id === OWNER ? "passport" : null), id_reviewed_at: id === OWNER ? "2026-03-10T00:00:00Z" : null, id_rejection_reason: null, email_verified: true, phone_verified: id === OWNER },
        mentor: (() => {
          const mt = S.mentors.find((mm2) => mm2.user_id === id);
          return mt ? { id: mt.id, status: mt.status, active: mt.status === "approved" } : null;
        })(),
        listings,
        activity: { applications_sent: S.applications.filter((a) => a.renter_id === id).length, applications_received: S.applications.filter((a) => a.owner_id === id).length, tenancies_as_renter: S.tenancies.filter((t) => t.renter_id === id).length, tenancies_as_owner: S.tenancies.filter((t) => t.owner_id === id).length, blocked_by: S.blocks.filter((b) => b.blocked === id).length },
        reports_about: S.reports.filter((r) => ids.has(r.item_id) || sentBy.has(r.item_id)).map(({ id: rid, item_type, item_id, reason, status, source, created_at }) => ({ id: rid, item_type, item_id, reason, status, source: source || "user", created_at })),
        reports_by: S.reports.filter((r) => r.reporter_id === id).map(({ id: rid, item_type, item_id, reason, status, created_at }) => ({ id: rid, item_type, item_id, reason, status, created_at })),
        history: S.audit.filter((e) => ids.has(e.target_id)),
      }), true;
    }
    if (p === "/hub/admin/id-checks") {
      return send(200, { checks: Object.entries(ID_CHECKS).map(([id, c]) => ({ user_id: id, person: person(id), status: c.status, payment_status: c.paid ? "paid" : "unpaid", failed_checks: 0, checks_started: 1, last_error: null, verified_name: c.status === "verified" ? person(id).name : null, document_type: "passport", document_country: "AU", stripe_session: "vs_mock", paid_at: c.at || null, checked_at: c.at || null, refunded_at: null })) }), true;
    }
    if (p === "/hub/admin/move-ins") {
      const rows = Object.entries(S.moveIns || {}).map(([tid, mi]) => {
        const t = S.tenancies.find((x) => x.id === tid);
        return { id: mi.id, tenancy_id: tid, status: mi.status, amount: 290, paid_at: mi.paid_at, receipt_code: mi.code, complete: Boolean(mi.owner_confirmed_at && mi.renter_confirmed_at), fee_status: "charged", renter: person(t.renter_id), owner: person(t.owner_id), created_at: mi.paid_at };
      });
      return send(200, { enabled: true, move_ins: rows }), true;
    }
    if (p === "/hub/admin/metrics") {
      const users = Object.values(USERS);
      const since = (days) => iso(inDays(-days));
      return send(200, {
        generated_at: iso(now()),
        people: { accounts: users.length, renters: users.filter((x) => x.role === "seeker").length, owners: users.filter((x) => x.role === "owner").length, joined_7_days: users.filter((x) => x.created_at >= since(7)).length, joined_30_days: users.filter((x) => x.created_at >= since(30)).length, id_checked_owners: Object.keys(USERS).filter((id) => idStatusOf(id) === "approved").length },
        homes: { live: Object.values(OWNED).filter((x) => x.moderation_status === "approved").length, in_review: S.moderation.filter((l) => ["pending_approval", "flagged"].includes(l.moderation_status)).length, paused: Object.values(OWNED).filter((x) => x.moderation_status === "paused").length, drafts: S.drafts.filter((d) => !d.submitted_at).length, listed_30_days: 2, median_review_hours: 5 },
        activity: { messages_7_days: S.messages.filter((x) => x.created_at >= since(7)).length, applications_30_days: S.applications.length, inspections_booked_30_days: S.bookings.length, stay_requests_30_days: 0, active_tenancies: S.tenancies.filter((t) => t.status === "active").length },
        safety: { open_reports: S.reports.filter((r) => ["pending", "reviewing"].includes(r.status)).length, reports_30_days: S.reports.length, scam_flags_30_days: S.reports.filter((r) => r.source === "system").length, suspended_accounts: users.filter((x) => x.disabled).length, open_tickets: S.tickets.filter((t) => ["open", "pending_internal"].includes(t.status)).length, median_first_reply_hours: 3 },
      }), true;
    }
    if (p === "/hub/admin/view-as") {
      if ((body.reason || "").trim().length < 5) return send(400, { detail: "Say why you need to view this account (recorded in the audit log)" }), true;
      S.audit.unshift({ id: uuid(), action: "view_as_start", target_type: "user", target_id: body.user_id, reason: body.reason, metadata: {}, created_at: iso(now()), admin: person(uid) });
      return send(200, { user: person(body.user_id), read_only: true, expires_in_minutes: 60 }), true;
    }
    if (p === "/hub/admin/view-as/end") {
      S.audit.unshift({ id: uuid(), action: "view_as_end", target_type: "user", target_id: body.user_id, reason: null, metadata: {}, created_at: iso(now()), admin: person(uid) });
      return send(200, { ended: true }), true;
    }
  }
  return send(404, { detail: `Hub mock does not handle ${req.method} ${p}` }), true;
}
