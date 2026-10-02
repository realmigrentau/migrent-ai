/**
 * Product events, sent to Vercel Web Analytics with @vercel/analytics's
 * track(). They answer the basic questions (how many people search, open a
 * listing, start an application, sign up, list a room) without identifying
 * anyone: no names, emails, user ids or free text, only fixed values and
 * listing ids, which are public.
 *
 * Nothing is recorded until Web Analytics is switched on for the Vercel
 * project (Project > Analytics). Custom events need a plan that includes
 * them; on other plans track() is a no-op. In development events go to the
 * console instead.
 */
import { track } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean | null>;

export const Events = {
  SEARCH_PERFORMED: "search_performed",
  LISTING_VIEWED: "listing_viewed",
  HUB_ACTION_CLICKED: "listing_action_clicked",
  SIGNUP_STARTED: "signup_started",
  ONBOARDING_COMPLETED: "onboarding_completed",
  LISTING_SUBMITTED: "listing_submitted",
  ENQUIRY_SENT: "enquiry_sent",
  APPLICATION_SUBMITTED: "application_submitted",
  INSPECTION_BOOKED: "inspection_booked",
  REPORT_SUBMITTED: "report_submitted",
  CONTACT_FORM_SENT: "contact_form_sent",
  HELP_QUESTION_ASKED: "help_question_asked",
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

export function trackEvent(name: EventName, props?: EventProps): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${name}`, props ?? {});
    return;
  }
  try {
    track(name, props ?? undefined);
  } catch {
    // Analytics must never break the page.
  }
}
