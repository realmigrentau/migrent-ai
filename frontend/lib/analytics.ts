/**
 * Lightweight analytics helpers for MigRent.
 * Uses Vercel Analytics (auto-injected via next.config) and
 * optional custom event tracking via a simple fetch wrapper.
 */

type EventProps = Record<string, string | number | boolean>;

/**
 * Track a custom event. In production this sends to Vercel Analytics.
 * In development it logs to the console.
 */
export function trackEvent(name: string, props?: EventProps) {
  if (typeof window === "undefined") return;

  // Vercel Analytics
  if (typeof (window as any).va === "function") {
    (window as any).va("event", { name, ...props });
    return;
  }

  // Dev fallback
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] ${name}`, props);
  }
}

// Pre-defined events for consistency
export const Events = {
  LISTING_VIEWED: "listing_viewed",
  LISTING_CREATED: "listing_created",
  SEARCH_PERFORMED: "search_performed",
  DEAL_INITIATED: "deal_initiated",
  REPORT_SUBMITTED: "report_submitted",
  CONTACT_FORM_SENT: "contact_form_sent",
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
} as const;
