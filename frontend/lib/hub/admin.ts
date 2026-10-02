/**
 * Words for the admin screens in Migrent Hub: listing states, moderation
 * actions, audit log entries, ID documents and support tickets. One place,
 * so the queue, the drawer and the audit log always say the same thing.
 */
import type { Tone } from "./types";

/* ── Listings ─────────────────────────────────────────────── */

export type ListingQueue = "review" | "flagged" | "hidden" | "removal" | "paused" | "all";

export const LISTING_QUEUES: { value: ListingQueue; label: string }[] = [
  { value: "review", label: "To review" },
  { value: "flagged", label: "Flagged" },
  { value: "hidden", label: "Hidden" },
  { value: "removal", label: "Removal pending" },
  { value: "paused", label: "Paused" },
  { value: "all", label: "All listings" },
];

export const LISTING_STATE: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  pending_approval: { label: "Waiting for review", tone: "info" },
  changes_requested: { label: "Changes requested", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  paused: { label: "Paused", tone: "neutral" },
  expired: { label: "Ended", tone: "neutral" },
  rejected: { label: "Rejected", tone: "danger" },
  flagged: { label: "Flagged by spam check", tone: "warning" },
  hidden: { label: "Hidden", tone: "danger" },
  delete_requested: { label: "Removal pending", tone: "danger" },
  deleted: { label: "Removed", tone: "neutral" },
};

export const listingState = (s: string | null | undefined) => LISTING_STATE[s ?? ""] ?? { label: s ? s.replace(/_/g, " ") : "Unknown", tone: "neutral" as Tone };

export type ListingAction =
  | "approve"
  | "request_changes"
  | "reject"
  | "pause"
  | "unpause"
  | "hide"
  | "unflag"
  | "request_removal"
  | "confirm_removal"
  | "rescan";

interface ActionCopy {
  /** Button label. */
  label: string;
  /** Heading of the decision panel. */
  title: string;
  /** What happens, in plain words, before the admin commits. */
  explain: string;
  /** Present when a written reason is required. */
  reason?: { label: string; hint: string };
  /** Optional note for the team (stored with the decision). */
  note?: boolean;
  confirm: string;
  tone: "primary" | "secondary" | "danger";
  done: string;
}

export const LISTING_ACTIONS: Record<ListingAction, ActionCopy> = {
  approve: {
    label: "Approve",
    title: "Approve and publish",
    explain: "The listing goes live on Migrent straight away and the owner is emailed.",
    note: true,
    confirm: "Approve and publish",
    tone: "primary",
    done: "Approved. The listing is live.",
  },
  request_changes: {
    label: "Ask for changes",
    title: "Ask the owner for changes",
    explain: "The owner is emailed exactly what you write. The listing stays offline until they update it.",
    reason: { label: "What needs to change", hint: "Be specific, e.g. Add a photo of the bedroom and say which rooms share the bathroom." },
    confirm: "Send to the owner",
    tone: "secondary",
    done: "Sent. The owner has been asked for changes.",
  },
  reject: {
    label: "Reject",
    title: "Reject this listing",
    explain: "Use this when the listing can't be fixed. The owner is emailed the reason. If it could be fixed, ask for changes instead.",
    reason: { label: "Reason (sent to the owner)", hint: "e.g. This is a duplicate of a listing you already have on Migrent." },
    note: true,
    confirm: "Reject listing",
    tone: "danger",
    done: "Rejected. The owner has been told why.",
  },
  pause: {
    label: "Pause",
    title: "Pause this listing",
    explain: "Takes it offline everywhere until the owner fixes what you list. Nothing is deleted and you can unpause it later. The owner is emailed.",
    reason: { label: "Reason (sent to the owner)", hint: "e.g. The photos show a different property." },
    confirm: "Pause listing",
    tone: "secondary",
    done: "Paused. The owner has been told what to fix.",
  },
  unpause: {
    label: "Unpause",
    title: "Unpause this listing",
    explain: "Send it back to the review queue, or put it straight back live if it is ready.",
    note: true,
    confirm: "Unpause",
    tone: "primary",
    done: "Unpaused.",
  },
  hide: {
    label: "Hide",
    title: "Hide while you look into it",
    explain: "Takes it off search and its listing page. The owner is told it is under review, not why.",
    reason: { label: "Why (for the team)", hint: "e.g. Same photos as a listing reported as a scam." },
    confirm: "Hide listing",
    tone: "secondary",
    done: "Hidden from Migrent.",
  },
  unflag: {
    label: "Not spam",
    title: "Clear the spam flag",
    explain: "The listing joins the To review queue and still needs approving before it goes live.",
    note: true,
    confirm: "Clear flag",
    tone: "secondary",
    done: "Flag cleared. It is back in the review queue.",
  },
  request_removal: {
    label: "Start removal",
    title: "Start removing this listing",
    explain: "Removal takes two steps. This keeps the listing offline and moves it to Removal pending, where it has to be confirmed. The owner is told only when removal is confirmed.",
    reason: { label: "Reason (sent to the owner when removal is confirmed)", hint: "e.g. Confirmed scam: asks renters to pay before viewing." },
    note: true,
    confirm: "Start removal",
    tone: "danger",
    done: "Marked for removal. Confirm it from Removal pending.",
  },
  confirm_removal: {
    label: "Confirm removal",
    title: "Remove this listing",
    explain: "The listing is taken down for good and the owner is emailed the reason recorded when removal was started. The record is kept for the audit log.",
    note: true,
    confirm: "Remove listing",
    tone: "danger",
    done: "Removed. The owner has been told.",
  },
  rescan: {
    label: "Run spam check again",
    title: "Run the spam check again",
    explain: "Recalculates the spam score. It does not change the listing's state.",
    confirm: "Run check",
    tone: "secondary",
    done: "Spam check finished.",
  },
};

/** Fixes an admin can ask for when pausing a listing. */
export const PAUSE_FIXES = [
  "Upload genuine photos of the property",
  "Set current availability dates",
  "State the weekly price per room and how many rooms are free",
  "Provide proof you own or may list the property",
  "Confirm the address so the map lands in the right suburb",
  "Say exactly where any cameras are (never in bedrooms or bathrooms)",
  "Complete government ID verification",
];

export const MODERATION_EVENTS: Record<string, string> = {
  submitted: "Sent for review",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes requested",
  paused: "Paused",
  unpaused: "Unpaused",
  flagged: "Flagged by the spam check",
  hidden: "Hidden",
  unflagged: "Spam flag cleared",
  delete_requested: "Removal started",
  delete_approved: "Removed",
  score_updated: "Spam check run",
  owner_edited: "Edited by the owner",
  expired: "Ended (dates passed)",
  renewed: "Renewed by the owner",
  archived: "Archived",
  published: "Published",
};

export const moderationEvent = (e: string) => MODERATION_EVENTS[e] ?? e.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/* ── Owner ID checks ──────────────────────────────────────── */

export const ID_DOCUMENTS: Record<string, string> = {
  passport: "Passport",
  drivers_licence: "Driver's licence",
  visa: "Visa",
  national_id: "National ID card",
};

export const ID_CHECK: Record<string, { label: string; tone: Tone }> = {
  verified: { label: "ID checked", tone: "success" },
  pending: { label: "ID check waiting", tone: "warning" },
  unverified: { label: "ID not checked", tone: "neutral" },
};

/* ── Support tickets ──────────────────────────────────────── */

export type TicketView = "needs_reply" | "waiting" | "done" | "all";

export const TICKET_VIEWS: { value: TicketView; label: string }[] = [
  { value: "needs_reply", label: "Needs a reply" },
  { value: "waiting", label: "Waiting on them" },
  { value: "done", label: "Done" },
  { value: "all", label: "All" },
];

export const TICKET_STATUS: Record<string, { label: string; tone: Tone }> = {
  open: { label: "New", tone: "info" },
  pending_internal: { label: "They replied", tone: "info" },
  pending_customer: { label: "Waiting on them", tone: "neutral" },
  resolved: { label: "Resolved", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
};

export const TICKET_CATEGORIES: Record<string, string> = {
  billing: "Billing",
  onboarding: "Getting started",
  verification: "Verification",
  listings: "Listings",
  trust_safety: "Trust and safety",
  bug: "Something broken",
  feedback: "Feedback",
};

export const PRIORITIES = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
] as const;

/* ── Audit log ────────────────────────────────────────────── */

/**
 * Every action admin_audit_log accepts (migration 043's CHECK constraint),
 * as a sentence. tests/unit/hubAdmin.test.ts fails if one is missing.
 */
export const AUDIT_ACTIONS: Record<string, string> = {
  approve: "Approved a listing",
  reject: "Rejected a listing",
  request_changes: "Asked an owner for listing changes",
  pause: "Paused a listing",
  unpause: "Unpaused a listing",
  flag: "Flagged a listing",
  hide: "Hid a listing",
  unflag: "Cleared a spam flag",
  request_delete: "Started removing a listing",
  confirm_delete: "Removed a listing",
  approve_id: "Approved an owner's ID",
  reject_id: "Rejected an owner's ID",
  suspend_user: "Suspended an account",
  unsuspend_user: "Reinstated an account",
  change_role: "Changed an account's role",
  finalise_application: "Finalised an application",
  request_application_corrections: "Asked a renter for corrections",
  stop_application: "Stopped an application",
  view_as_start: "Started viewing as a customer",
  view_as_end: "Stopped viewing as a customer",
  assign_report: "Took a report",
  resolve_report: "Resolved a report",
  dismiss_report: "Dismissed a report",
  admin_panel_unlock: "Opened the Admin panel",
  admin_panel_failed: "Entered a wrong Admin panel password",
  admin_panel_lockout: "Was locked out of the Admin panel after 3 wrong passwords",
  admin_panel_password_changed: "Changed the Admin panel password",
  approve_mentor: "Approved a mentor",
  reject_mentor: "Asked a mentor for changes",
  hide_review: "Hid a review",
  restore_review: "Put a review back",
  view_conversation: "Read a reported conversation",
};

export const auditAction = (a: string) => AUDIT_ACTIONS[a] ?? a.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** Every target type admin_audit_log accepts, as a noun. */
export const AUDIT_TARGETS: Record<string, string> = {
  listing: "Listing",
  owner_verification: "ID check",
  user: "Account",
  application: "Application",
  report: "Report",
  tenancy: "Tenancy",
  property: "Property",
  mentor: "Mentor",
  review: "Review",
};

/**
 * Ready-made reasons for admin decisions (MIGRENT_MASTER_AUDIT MIG-024).
 * Picking one fills the reason box, which the admin can still edit; the
 * customer sees the final text.
 */
export const READY_REASONS: Record<string, string[]> = {
  listing_reject: [
    "The photos don't show the room or home being rented.",
    "The address, suburb or postcode doesn't match the photos or description.",
    "It asks for money before an inspection, or for payment outside Migrent.",
    "It duplicates another listing for the same room.",
    "The bond or rent in advance is more than Migrent allows.",
  ],
  listing_request_changes: [
    "Please add clear photos of the bedroom, bathroom and kitchen.",
    "Please describe who else lives in the home and what is shared.",
    "Please remove phone numbers, email addresses or links to other apps from the description.",
    "Please check the suburb, state and postcode.",
    "Please state the bond and rent in advance.",
  ],
  listing_pause: [
    "Paused while we look into a report from a renter.",
    "Paused while we confirm the owner's identity.",
    "Paused because the photos or details may not match the home.",
  ],
  listing_hide: ["Hidden because it matches a known scam pattern.", "Hidden while we investigate a report."],
  listing_request_removal: ["The home is no longer available.", "Removed for breaking the listing rules."],
  id_reject: [
    "The photo is blurry or cut off, so we can't read the details.",
    "The document has expired.",
    "The name on the document doesn't match the name on the account.",
    "We need a government photo ID: a passport, driver licence or photo card.",
    "The photo of the document looks edited.",
  ],
  mentor_reject: [
    "Please say more about your experience helping people settle in Australia.",
    "Your photo ID needs to be checked first: upload it in Settings.",
    "Please remove contact details (phone, email, links) from your profile.",
    "Please set a clear price and say what a session includes.",
  ],
};
