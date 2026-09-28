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
}

const DEFAULT: PageMeta = {
  title: "Find Verified Rooms in Australia",
  description:
    "Find safe, verified rooms and accommodation across Australia. Built for migrants, students and working holiday makers.",
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
  ["/seeker/search", { title: "Search rooms", description: "Browse verified rooms from trusted owners across Australia.", noIndex: true }],

  // Owner

  // Dashboard

  // Bookings / payments
  ["/payment-success", { title: "Payment confirmed", description: "Your payment has been received.", noIndex: true }],
  ["/payment-cancelled", { title: "Payment cancelled", description: "Your payment was not completed.", noIndex: true }],
  ["/booking-success", { title: "Booking confirmed", description: "Your booking has been confirmed.", noIndex: true }],
  ["/booking-cancelled", { title: "Booking cancelled", description: "Your booking was cancelled.", noIndex: true }],
  ["/mentor-session-success", { title: "Session booked", description: "Your mentor session is confirmed.", noIndex: true }],
  ["/verification-success", { title: "Verification", description: "Verification result.", noIndex: true }],
  ["/verification-cancelled", { title: "Verification cancelled", description: "Verification was not completed.", noIndex: true }],

  // Private and utility surfaces
  ["/support/tickets", { title: "Support tickets", description: "Your support requests.", noIndex: true }],
  ["/reviews", { title: "Leave a review", description: "Review your stay.", noIndex: true }],
  ["/users/profile", { title: "Host profile", description: "A Migrent host profile." }],
  ["/listing", { title: "Room", description: "A room on Migrent." }],

  // Thin or placeholder pages: kept reachable, not submitted for indexing
  // until they carry real content. See docs/product/thin-pages.md.
  ["/resources/api-docs", { title: "Developer API", description: "Migrent does not offer a public API yet.", noIndex: true }],
  ["/resources/discord", { title: "Community", description: "The Migrent community chat is not open yet.", noIndex: true }],
  ["/resources/roi-calculator", { title: "Earnings calculator", description: "Estimate what a room could earn.", noIndex: true }],
  ["/press", { title: "Press", description: "Media enquiries for Migrent.", noIndex: true }],
  ["/careers", { title: "Careers", description: "There are no open roles at Migrent right now.", noIndex: true }],

  // Public marketing
  ["/for-seekers", { title: "For seekers", description: "How Migrent helps migrants and students find verified rooms in Australia." }],
  ["/for-owners", { title: "For hosts", description: "List your room on Migrent and reach pre-verified seekers across Australia." }],
  ["/pricing", { title: "Pricing", description: "Simple pricing for seekers and hosts. No hidden fees." }],
  ["/about", { title: "About Migrent", description: "Our mission to make moving to Australia safer and simpler." }],
  ["/contact", { title: "Contact us", description: "Get in touch with the Migrent team." }],
  ["/careers", { title: "Careers", description: "Open roles at Migrent." }],
  ["/press", { title: "Press", description: "Migrent in the press. Media enquiries and brand assets." }],
  // The consolidated Resources hubs. These sit ABOVE the bare "/resources"
  // entry because getPageMeta matches by prefix and takes the first hit.
  ["/resources/guides", { title: "Guides & Articles", description: "Practical advice for moving, living and settling in Australia." }],
  ["/resources/tools", { title: "Tools & Checklists", description: "Planners, calculators and lookups for your move." }],
  ["/resources/help", { title: "Help Centre", description: "Quick answers to common questions about Migrent." }],
  ["/resources", { title: "Resources", description: "Everything you need for your move: guides, tools and answers." }],
  // /blog, /guides and /help no longer have index pages - the three hubs
  // above replaced them - but each is still the prefix that gives its
  // surviving detail routes (/blog/:slug, /guides/:id, /help/:slug) a
  // default title, so the entries stay.
  ["/blog", { title: "Article", description: "Stories, guides, and updates from the Migrent team." }],
  ["/guides", { title: "Guide", description: "Practical guides to finding a room, settling in, and renting safely in Australia." }],
  ["/help", { title: "Help centre", description: "Browse answers to common questions about Migrent." }],
  ["/features", { title: "Features", description: "Verification, AI matching, secure payments, and more." }],
  ["/mentors", { title: "Local mentors", description: "Book a one-on-one with a local who can help you settle in." }],
  ["/become-mentor", { title: "Become a mentor", description: "Help newcomers find their feet in your city and earn on your terms." }],

  // Legal
  ["/privacy-policy", { title: "Privacy policy", description: "How Migrent collects, uses, and protects your data." }],
  ["/cookie-policy", { title: "Cookie policy", description: "How Migrent uses cookies." }],
  ["/code-of-conduct", { title: "Code of conduct", description: "Our community standards." }],
  ["/anti-discrimination", { title: "Anti-discrimination policy", description: "Migrent's stance against discrimination." }],
  ["/no-agency", { title: "No-agency policy", description: "Why Migrent is not a real-estate agency." }],
  ["/abn-terms", { title: "ABN terms", description: "Terms for ABN-registered hosts." }],
  ["/contact-legal", { title: "Legal contact", description: "Contact the Migrent legal team." }],
  ["/disclaimer", { title: "Disclaimer", description: "Important disclaimers about Migrent." }],
  ["/rules-community-guidelines", { title: "Community guidelines", description: "How we keep Migrent safe and welcoming." }],
  ["/rules-community-guidelines", { title: "Community rules", description: "Migrent community rules." }],
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
