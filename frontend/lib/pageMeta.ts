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

  // Auth
  ["/signin", { title: "Sign in", description: "Sign in to MigRent to find verified rooms and manage your account.", noIndex: true }],
  ["/signup", { title: "Create your account", description: "Join MigRent to find verified rooms or list your space across Australia.", noIndex: true }],
  ["/magic-link-login", { title: "Sign in with email", description: "Get a one-time sign-in link sent to your email.", noIndex: true }],
  ["/magic-link-signup", { title: "Sign up with email", description: "Get a one-time sign-up link sent to your email.", noIndex: true }],
  ["/auth/callback", { title: "Signing you in", description: "Completing your sign-in.", noIndex: true }],

  // Seeker
  ["/seeker/search", { title: "Search rooms", description: "Browse verified rooms from trusted owners across Australia.", noIndex: true }],
  ["/seeker/wishlist", { title: "Your wishlist", description: "Compare and revisit the rooms you've saved.", noIndex: true }],
  ["/seeker/profile", { title: "Your profile", description: "Manage your seeker profile, preferences, and verification.", noIndex: true }],

  // Owner
  ["/owner/dashboard", { title: "Host dashboard", description: "Review enquiries, bookings, and listing performance.", noIndex: true }],
  ["/owner/listings", { title: "Your listings", description: "Create and manage your rooms on MigRent.", noIndex: true }],
  ["/owner/profile", { title: "Host profile", description: "Manage your host profile, payouts, and verification.", noIndex: true }],
  ["/owner/setup", { title: "List your room", description: "Add photos, set your price, and publish your listing.", noIndex: true }],

  // Dashboard
  ["/dashboard/seeker-profile", { title: "Seeker profile", description: "Manage your seeker profile.", noIndex: true }],
  ["/dashboard/owner-profile", { title: "Owner profile", description: "Manage your owner profile.", noIndex: true }],
  ["/dashboard/seeker", { title: "Dashboard", description: "Your home for matches, messages, and bookings.", noIndex: true }],
  ["/dashboard", { title: "Dashboard", description: "Your home for matches, messages, and bookings.", noIndex: true }],

  // Bookings / payments
  ["/payment-success", { title: "Payment confirmed", description: "Your payment has been received.", noIndex: true }],
  ["/payment-cancelled", { title: "Payment cancelled", description: "Your payment was not completed.", noIndex: true }],
  ["/booking-success", { title: "Booking confirmed", description: "Your booking has been confirmed.", noIndex: true }],
  ["/booking-cancelled", { title: "Booking cancelled", description: "Your booking was cancelled.", noIndex: true }],
  ["/mentor-session-success", { title: "Session booked", description: "Your mentor session is confirmed.", noIndex: true }],

  // Public marketing
  ["/for-seekers", { title: "For seekers", description: "How MigRent helps migrants and students find verified rooms in Australia." }],
  ["/for-owners", { title: "For hosts", description: "List your room on MigRent and reach pre-verified seekers across Australia." }],
  ["/pricing", { title: "Pricing", description: "Simple pricing for seekers and hosts. No hidden fees." }],
  ["/about", { title: "About MigRent", description: "Our mission to make moving to Australia safer and simpler." }],
  ["/contact", { title: "Contact us", description: "Get in touch with the MigRent team." }],
  ["/careers", { title: "Careers", description: "Open roles at MigRent." }],
  ["/press", { title: "Press", description: "MigRent in the press. Media enquiries and brand assets." }],
  ["/blog", { title: "Blog", description: "Stories, guides, and updates from the MigRent team." }],
  ["/guides", { title: "Guides", description: "Practical guides to finding a room, settling in, and renting safely in Australia." }],
  ["/resources", { title: "Resources", description: "Helpful resources for migrants, students, and hosts." }],
  ["/help", { title: "Help centre", description: "Browse answers to common questions about MigRent." }],
  ["/faq", { title: "FAQ", description: "Common questions about MigRent for seekers and hosts." }],
  ["/features", { title: "Features", description: "Verification, AI matching, secure payments, and more." }],
  ["/mentors", { title: "Local mentors", description: "Book a one-on-one with a local who can help you settle in." }],
  ["/become-mentor", { title: "Become a mentor", description: "Help newcomers find their feet in your city and earn on your terms." }],

  // Legal
  ["/privacy-policy", { title: "Privacy policy", description: "How MigRent collects, uses, and protects your data." }],
  ["/cookie-policy", { title: "Cookie policy", description: "How MigRent uses cookies." }],
  ["/code-of-conduct", { title: "Code of conduct", description: "Our community standards." }],
  ["/anti-discrimination", { title: "Anti-discrimination policy", description: "MigRent's stance against discrimination." }],
  ["/no-agency", { title: "No-agency policy", description: "Why MigRent is not a real-estate agency." }],
  ["/abn-terms", { title: "ABN terms", description: "Terms for ABN-registered hosts." }],
  ["/contact-legal", { title: "Legal contact", description: "Contact the MigRent legal team." }],
  ["/disclaimer", { title: "Disclaimer", description: "Important disclaimers about MigRent." }],
  ["/rules-community-guidelines", { title: "Community guidelines", description: "How we keep MigRent safe and welcoming." }],
  ["/rules", { title: "Community rules", description: "MigRent community rules." }],
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
