/**
 * One vocabulary for every status the Hub shows, in plain words, with a
 * tone that is never the only signal (each badge also carries its label
 * and an icon). Status codes never reach the screen.
 */
import type { ApplicationStatus, MaintenanceStatus, Tone } from "./types";

type Copy = { label: string; tone: Tone; renter?: string; owner?: string };

export const APPLICATION_STATUS: Record<ApplicationStatus, Copy> = {
  draft: { label: "Draft", tone: "neutral", renter: "Not sent yet" },
  submitted: { label: "Sent", tone: "info", renter: "Sent to the owner", owner: "New" },
  under_review: { label: "Being reviewed", tone: "info", renter: "The owner is reviewing it", owner: "Reviewing" },
  shortlisted: { label: "Shortlisted", tone: "info", renter: "You're shortlisted", owner: "Shortlisted" },
  changes_requested: { label: "Action needed", tone: "warning", renter: "More information requested", owner: "Waiting on the renter" },
  owner_approved: { label: "Approved", tone: "success" },
  migrent_review: { label: "Final review", tone: "info", renter: "Approved by the owner - Migrent is finalising", owner: "Approved - Migrent is finalising" },
  finalised: { label: "Finalised", tone: "success", renter: "Finalised - welcome home", owner: "Finalised" },
  declined: { label: "Not going ahead", tone: "neutral", renter: "The owner chose another applicant", owner: "Declined" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
  not_proceeding: { label: "Not proceeding", tone: "danger", renter: "Migrent could not finalise this", owner: "Stopped at final review" },
};

export function applicationCopy(status: ApplicationStatus, side: "renter" | "owner" = "renter") {
  const c = APPLICATION_STATUS[status] ?? { label: status, tone: "neutral" as Tone };
  return { label: c.label, tone: c.tone, detail: (side === "owner" ? c.owner : c.renter) ?? c.label };
}

/** The journey, for the progress rail on an application. */
export const APPLICATION_STEPS = [
  { key: "sent", label: "Sent" },
  { key: "review", label: "Owner review" },
  { key: "approved", label: "Owner approved" },
  { key: "final", label: "Migrent review" },
  { key: "done", label: "Finalised" },
] as const;

export function applicationStepIndex(status: ApplicationStatus): number {
  switch (status) {
    case "draft":
      return -1;
    case "submitted":
      return 0;
    case "under_review":
    case "shortlisted":
    case "changes_requested":
      return 1;
    case "owner_approved":
      return 2;
    case "migrent_review":
      return 3;
    case "finalised":
      return 4;
    default:
      return -1;
  }
}

export const isClosed = (s: ApplicationStatus) => s === "declined" || s === "withdrawn" || s === "not_proceeding";

export const MAINTENANCE_STATUS: Record<MaintenanceStatus, Copy> = {
  submitted: { label: "Submitted", tone: "info" },
  acknowledged: { label: "Acknowledged", tone: "info" },
  scheduled: { label: "Scheduled", tone: "info" },
  in_progress: { label: "In progress", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
};

export const URGENCY: Record<string, Copy> = {
  routine: { label: "Routine", tone: "neutral" },
  urgent: { label: "Urgent", tone: "warning" },
  emergency: { label: "Emergency", tone: "danger" },
};

export const MAINTENANCE_CATEGORIES: { value: string; label: string }[] = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "appliance", label: "Appliance" },
  { value: "heating_cooling", label: "Heating or cooling" },
  { value: "pest", label: "Pests" },
  { value: "security", label: "Locks and security" },
  { value: "structural", label: "Doors, windows, walls" },
  { value: "outdoor", label: "Outdoor and garden" },
  { value: "internet", label: "Internet" },
  { value: "other", label: "Something else" },
];

export function listingStatus(moderation: string | undefined, publicState?: string, occupancy?: string): { label: string; tone: Tone } {
  if (occupancy === "occupied") return { label: "Occupied", tone: "neutral" };
  switch (moderation) {
    case "approved":
      return publicState === "expired" ? { label: "Listing ended", tone: "warning" } : { label: "Live", tone: "success" };
    case "draft":
      return { label: "Draft", tone: "neutral" };
    case "pending_approval":
    case "flagged":
      return { label: "In review", tone: "info" };
    case "changes_requested":
      return { label: "Changes requested", tone: "warning" };
    case "paused":
      return { label: "Paused", tone: "neutral" };
    case "expired":
      return { label: "Listing ended", tone: "warning" };
    case "rejected":
      return { label: "Not approved", tone: "danger" };
    case "hidden":
      return { label: "Under review", tone: "warning" };
    default:
      return { label: "Unknown", tone: "neutral" };
  }
}

export const REPORT_REASONS = [
  { value: "scam", label: "Looks like a scam" },
  { value: "misleading", label: "Misleading or inaccurate" },
  { value: "discrimination", label: "Discriminatory" },
  { value: "unsafe", label: "Unsafe property" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
];
