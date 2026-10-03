/**
 * Route-aware SEO metadata. Used by SEOHead in _app.tsx to provide
 * sensible defaults for every page so pages without their own <Head>
 * still ship with a proper title and description.
 *
 * Page-specific <Head> tags override these via Next's Head merging.
 */

export interface PageMeta {
  title: string;
  description: string;
  noIndex?: boolean;
  /** With noIndex: still let crawlers follow the page's links. */
  follow?: boolean;
}

const DEFAULT: PageMeta = {
  title: "Rooms for new arrivals in Australia",
  description:
    "Find a room in Australia from hosts who show us their ID first. Built for migrants, students and working holiday makers.",
};

// Map exact pathnames (or pathname prefixes) to PageMeta.
// Order matters: more specific paths should come first.
const ROUTES: Array<[string, PageMeta]> = [
  // Admin - never indexable. noindex meta is the strong signal; deliberately
  // NOT listed in robots.txt, which would only advertise the path.
  ["/admin", { title: "Admin", description: "Administration.", noIndex: true }],

  ["/suburbs", { title: "Suburb Guides - Where to Live in Australia", description: "Census-backed suburb guides for migrants and students across Sydney, Melbourne and Brisbane." }],

  // Auth
  ["/auth/callback", { title: "Signing you in", description: "Completing your sign-in.", noIndex: true }],

  // Seeker
  ["/seeker/search", { title: "Search rooms", description: "Browse rooms from ID-checked hosts across Australia.", noIndex: true, follow: true }],

  // Owner

  // Dashboard

  // Bookings / payments
  ["/booking-success", { title: "Host fee payment", description: "The result of a host fee payment.", noIndex: true }],
  ["/booking-cancelled", { title: "Payment not completed", description: "The host fee payment was not completed.", noIndex: true }],
  ["/unsubscribe", { title: "Unsubscribe", description: "Stop a kind of email from Migrent.", noIndex: true }],
  ["/mentor-session-success", { title: "Session booked", description: "Your mentor session is confirmed.", noIndex: true }],
  ["/verification-success", { title: "Verification", description: "Verification result.", noIndex: true }],
  ["/verification-cancelled", { title: "Verification cancelled", description: "Verification was not completed.", noIndex: true }],

  // Private and utility surfaces
  ["/support/tickets", { title: "Support tickets", description: "Your support requests.", noIndex: true }],
  ["/reviews", { title: "Leave a review", description: "Review your stay.", noIndex: true }],
  ["/users/profile", { title: "Host profile", description: "A Migrent host profile." }],
  ["/listing", { title: "Room", description: "A room on Migrent." }],

  // Public site (2026-09-29 redesign). Pages set their own titles; these are
  // the fallbacks. Merged pages (/for-seekers, /features, /resources/*,
  // /careers, /press and others) redirect in next.config.ts, so they have
  // no entry here.
  ["/how-renting-works", { title: "How renting works", description: "How to find, apply for and rent a room with Migrent, what we check, and where your money goes." }],
  ["/for-owners", { title: "For owners", description: "List a room or a whole home on Migrent. Hosts show us their ID before a listing goes live." }],
  ["/pricing", { title: "Pricing", description: "Free for renters to search and apply. Hosts pay once per property, only for stays." }],
  ["/about", { title: "About Migrent", description: "Migrent helps migrants, students and new arrivals find a room they can trust in Australia." }],
  ["/contact", { title: "Contact us", description: "Get in touch with the Migrent team." }],
  ["/email-help", { title: "Get our emails in your Inbox", description: "How to move Migrent's emails out of Spam, Junk or Promotions." }],
  ["/blog", { title: "Article", description: "Articles from the Migrent team on renting safely in Australia." }],
  ["/guides", { title: "Guides", description: "Practical guides to finding a room, settling in and renting safely in Australia." }],
  ["/help", { title: "Help", description: "Answers to common questions about Migrent." }],
  ["/mentors", { title: "Local mentors", description: "Book a paid one-on-one session with a local who can help you settle in." }],
  ["/become-mentor", { title: "Become a mentor", description: "Help newcomers find their feet in your city." }],
  ["/legal", { title: "Legal centre", description: "Every Migrent policy in one place." }],

  // Legal
  ["/privacy-policy", { title: "Privacy policy", description: "How Migrent collects, uses, and protects your data." }],
  ["/cookie-policy", { title: "Cookie policy", description: "How Migrent uses cookies." }],
  ["/code-of-conduct", { title: "Code of conduct", description: "Our community standards." }],
  ["/anti-discrimination", { title: "Anti-discrimination policy", description: "Migrent's stance against discrimination." }],
  ["/abn-terms", { title: "ABN terms", description: "Terms for ABN-registered hosts." }],
  ["/contact-legal", { title: "Legal contact", description: "Contact the Migrent legal team." }],
  ["/disclaimer", { title: "Disclaimer", description: "Important disclaimers about Migrent." }],
  ["/rules-community-guidelines", { title: "Community guidelines", description: "How we keep Migrent safe and welcoming." }],
];

export function getPageMeta(pathname: string): PageMeta {
  // Don't override homepage (it has its own custom Head)
  if (pathname === "/") return DEFAULT;
  for (const [prefix, meta] of ROUTES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return meta;
    }
  }
  return DEFAULT;
}
