import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { createHash } from "node:crypto";
import { THEME_BOOTSTRAP_SCRIPT } from "./lib/themeBootstrap";

// The only inline script the site ships. Its hash goes into script-src so
// 'unsafe-inline' can go. Any edit to lib/themeBootstrap.ts changes the hash
// automatically; nothing has to be kept in sync by hand.
const THEME_BOOTSTRAP_HASH = `sha256-${createHash("sha256").update(THEME_BOOTSTRAP_SCRIPT, "utf8").digest("base64")}`;

// The API origin, so preview deployments pointing at a different backend
// are not blocked by connect-src. In development with no env var set,
// lib/apiBase.ts falls back to http://localhost:8000, so allow that too;
// without it every API call on a local run fails as "Failed to fetch".
const API_ORIGIN = (() => {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_API_BASE_URL || "");
    return u.origin.startsWith("http") ? u.origin : "";
  } catch {
    return process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";
  }
})();

// Migrent Hub's own host, once DNS exists (see lib/hub/routes.ts). Read at
// build time: routing by host has to be static configuration.
const HUB_HOST = (process.env.NEXT_PUBLIC_HUB_HOST || "").trim().toLowerCase();
// Where the Hub is served: its own host once one is set, /hub until then.
const HUB_BASE = HUB_HOST ? `https://${HUB_HOST}` : "/hub";

// Old signed-in pages and their Migrent Hub equivalents (lib/hub/routes.ts
// routes old notification links the same way).
const LEGACY_TO_HUB: [string, string][] = [
  ["/dashboard", "/"],
  ["/dashboard/owner", "/"],
  ["/dashboard/seeker", "/"],
  ["/dashboard/notifications", "/activity"],
  ["/dashboard/owner-profile", "/settings"],
  ["/dashboard/seeker-profile", "/profile"],
  ["/owner/dashboard", "/"],
  ["/owner/profile", "/settings"],
  ["/owner/setup", "/properties/new"],
  ["/owner/listings", "/properties"],
  ["/owner/listings/new", "/properties/new"],
  ["/owner/listings/edit/:id", "/listings/:id/edit"],
  ["/owner/listings/:id", "/listings/:id"],
  ["/seeker/dashboard", "/"],
  ["/seeker/profile", "/profile"],
  ["/seeker/wishlist", "/saved"],
  ["/seeker/saved", "/saved"],
  ["/messages", "/messages"],
  ["/account/messages", "/messages"],
  ["/account/messages/:userId", "/messages/direct_:userId"],
  ["/account/settings", "/settings"],
  ["/onboarding", "/welcome"],
  ["/signin", "/sign-in"],
  ["/signup", "/sign-up"],
  ["/magic-link-login", "/sign-in"],
  ["/magic-link-signup", "/sign-up"],
  ["/forgot-password", "/forgot-password"],
  ["/reset-password", "/reset-password"],
  // The old admin console. Its screens were rebuilt in the Hub's Admin panel,
  // or retired where they showed invented or empty numbers (analytics,
  // revenue).
  ["/admin", "/admin"],
  ["/admin/overview", "/admin"],
  ["/admin/analytics", "/admin"],
  ["/admin/revenue", "/admin"],
  ["/admin/moderation", "/admin/listings"],
  ["/admin/spam-moderation", "/admin/listings?queue=flagged"],
  ["/admin/listings", "/admin/listings?queue=all"],
  ["/admin/verification", "/admin/id-checks"],
  ["/admin/users", "/admin/people"],
  // Anything else under /admin (reports, support, and Hub admin paths typed
  // on the main site) is the same path in the Hub.
  ["/admin/:path*", "/admin/:path*"],
];

const nextConfig: NextConfig = {
  /* Two `next dev` processes cannot share a build directory - the second one
     fails to take .next/dev/lock and exits. Setting NEXT_DIST_DIR gives a
     second server its own, which is what lets a review session run the app
     while someone else is already working in the same checkout. Unset, this
     is exactly the previous behaviour. */
  distDir: process.env.NEXT_DIST_DIR || ".next",

  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Pin the workspace root. A stray lockfile in the home directory otherwise
  // makes Turbopack guess wrong, which caused intermittent ENOENT
  // pages-manifest failures on local rebuilds.
  turbopack: {
    root: __dirname,
  },

  // Strip console.log/info/debug in production builds.
  // Keep error + warn so monitoring (Sentry/Vercel) still sees real issues.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "nsnwwfbidishftlrimer.supabase.co" },
    ],
  },

  // The generated suburb data lives in data/suburbs/ and is read at runtime
  // with fs. Next cannot trace a path it assembles at runtime (the detail
  // bucket is chosen from the SAL code), so the directory is declared here.
  // Without this, every suburb page 500s on Vercel with ENOENT while working
  // perfectly in dev.
  outputFileTracingIncludes: {
    "/suburbs": ["./data/suburbs/**"],
    "/suburb/[state]/[slug]": ["./data/suburbs/**"],
    "/suburb/[name]": ["./data/suburbs/**"],
    "/api/suburbs/search": ["./data/suburbs/**"],
    "/api/suburbs/region": ["./data/suburbs/**"],
    "/sitemap-suburbs.xml": ["./data/suburbs/**"],
    "/sitemap-suburbs-[page].xml": ["./data/suburbs/**"],
  },

  // Tree-shake heavy icon / animation / chart packages
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "@react-email/components",
    ],
  },

  async rewrites() {
    if (!HUB_HOST) return [];
    return {
      // Everything on the Hub host is a Hub page: hub.<domain>/applications
      // renders pages/hub/applications. Framework assets, API routes and
      // paths proxy.ts already rewrote are left alone.
      beforeFiles: [
        { source: "/", has: [{ type: "host", value: HUB_HOST }], destination: "/hub" },
        { source: "/:path((?!_next/|api/|hub(?:/|$)).*)", has: [{ type: "host", value: HUB_HOST }], destination: "/hub/:path" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  async redirects() {
    return [
      // Once the Hub has its own host, its old /hub/* addresses move there.
      ...(HUB_HOST
        ? [{ source: "/hub/:path*", missing: [{ type: "host" as const, value: HUB_HOST }], destination: `https://${HUB_HOST}/:path*`, permanent: true }]
        : []),
      // Supabase sends people to its Site URL (the homepage) whenever the
      // redirect a sign-in asked for is not on its allow-list. Forward those
      // arrivals to the page that can finish the sign-in; the query string
      // (?code=, ?token_hash=, ?error_description=) passes through as is.
      // Temporary, so no browser caches it.
      { source: "/", has: [{ type: "query", key: "code" }], destination: "/auth/callback", permanent: false },
      { source: "/", has: [{ type: "query", key: "token_hash" }], destination: "/auth/callback", permanent: false },
      { source: "/", has: [{ type: "query", key: "error_description" }], destination: "/auth/callback", permanent: false },

      // Deduped pages - permanent redirects preserve old links and bookmarks.
      { source: "/seeker/search-extended", destination: "/seeker/search", permanent: true },
      { source: "/rental-laws", destination: "/guides/rental-laws", permanent: true },
      // An App Router prototype at app/[lang]/resources used to serve eight
      // locale copies of /resources. It was client-only, so every one of them
      // shipped English HTML with no canonical - eight duplicates competing
      // with the real page. The prototype is gone; fold the URLs back in so
      // anything already indexed or linked consolidates instead of 404ing.
      {
        source: "/:locale(en|zh|hi|es|ar|fr|ru|pt)/resources",
        destination: "/guides",
        permanent: true,
      },

      // Four routes existed only to render nothing and then call
      // router.replace in an effect. That is a soft 404 to a crawler and a
      // flash of blank page to a person. Real 301s instead.
      { source: "/seeker/room/:id", destination: "/listing/:id", permanent: true },

      // ── Migrent Hub ──
      // Everything a signed-in person does now lives in Migrent Hub. The
      // older dashboard, owner and account pages send people to the Hub page
      // that does the same job. Temporary (307), because the destination
      // host changes when NEXT_PUBLIC_HUB_HOST is set.
      // Never on the Hub's own host, where /messages and friends are Hub pages.
      ...LEGACY_TO_HUB.map(([source, to]) => ({
        source,
        destination: to === "/" && !HUB_HOST ? HUB_BASE : `${HUB_BASE}${to}`,
        permanent: false,
        ...(HUB_HOST ? { missing: [{ type: "host" as const, value: HUB_HOST }] } : {}),
      })),

      // Two rules pages with overlapping content. The footer, terms of service
      // and code of conduct all point at the community guidelines, so that one
      // is authoritative.
      { source: "/rules", destination: "/rules-community-guidelines", permanent: true },

      // ── The 2026-09-29 consolidation ──
      // About fifty public pages became the set the menu shows. Only whole
      // pages moved; every article, guide, help and suburb URL still resolves
      // to its own page. Hash destinations land on the right section.
      //
      // Renters: three pages about how renting works became one.
      { source: "/for-seekers", destination: "/how-renting-works", permanent: true },
      { source: "/safety-verification", destination: "/how-renting-works#checks", permanent: true },
      { source: "/no-agency", destination: "/how-renting-works#not-an-agent", permanent: true },
      // Owners: Features and the calculator folded into For owners.
      { source: "/features", destination: "/for-owners", permanent: true },
      { source: "/resources/roi-calculator", destination: "/for-owners#earnings", permanent: true },
      // Resources: Guides (reading) and Help (answers). Discord and the
      // unfinished API page are gone until they exist.
      { source: "/resources", destination: "/guides", permanent: true },
      { source: "/resources/guides", destination: "/guides", permanent: true },
      { source: "/resources/tools", destination: "/guides#checklists", permanent: true },
      { source: "/resources/rental-laws", destination: "/guides/rental-laws", permanent: true },
      { source: "/resources/discord", destination: "/guides", permanent: true },
      { source: "/resources/api-docs", destination: "/guides", permanent: true },
      { source: "/resources/help", destination: "/help", permanent: true },
      { source: "/blog", destination: "/guides", permanent: true },
      { source: "/faq", destination: "/help", permanent: true },
      // Content withdrawn until it is rewritten (see HIDDEN_GUIDES and
      // HIDDEN_POSTS in data/resources.ts). Temporary, so the addresses can
      // come back. Each goes to the accurate page on the same subject.
      { source: "/guides/host-first", destination: "/help/create-your-first-listing", permanent: false },
      { source: "/guides/list-property", destination: "/help/create-your-first-listing", permanent: false },
      { source: "/guides/find-fast", destination: "/help/how-to-search-rooms", permanent: false },
      { source: "/guides/verify-profile", destination: "/help/verify-your-identity", permanent: false },
      { source: "/guides/earnings", destination: "/for-owners#earnings", permanent: false },
      { source: "/guides/visas", destination: "/help/visa-and-housing-rights", permanent: false },
      { source: "/guides/disputes", destination: "/support-disputes", permanent: false },
      { source: "/guides/superhost", destination: "/guides", permanent: false },
      { source: "/blog/superhost-program-launch", destination: "/guides", permanent: false },
      { source: "/blog/sydney-rental-market-2026", destination: "/guides", permanent: false },
      // Company: careers and press are sections of About now.
      { source: "/careers", destination: "/about#careers", permanent: true },
      { source: "/press", destination: "/about#press", permanent: true },
    ];
  },

  async headers() {
    // Content-Security-Policy, enforced.
    //
    // script-src: no 'unsafe-inline' and no 'unsafe-eval'. Next.js Pages
    // Router emits external chunks plus a JSON data blob (type=
    // application/json, which CSP does not execute). The one inline script
    // we own, the theme bootstrap in _document.tsx, is allowed by its
    // SHA-256 hash (THEME_BOOTSTRAP_HASH, computed from the exact string).
    // MapLibre GL 5 does not need 'unsafe-eval'. If a browser console ever
    // shows a script-src violation, add the host or hash here rather than
    // reintroducing 'unsafe-inline'.
    //
    // style-src keeps 'unsafe-inline': framer-motion and MapLibre write
    // inline style attributes, which nonces cannot cover.
    //
    // Hosts allowed here, and why:
    //   *.supabase.co                  auth, database, listing + avatar images
    //   *.onrender.com                 the MigRent API
    //   api.maptiler.com               search-page map tiles
    //   *.hcaptcha.com                 signup and sign-in captcha
    //   js/api.stripe.com              checkout
    //   *.vercel-scripts / -insights   Web Analytics and Speed Insights
    //   fcmregistrations /             Firebase Cloud Messaging token
    //   firebaseinstallations            enrolment, via EnableNotificationsCard
    //   *.ingest.sentry.io             error reporting, once SENTRY_DSN is set
    const csp = [
      "default-src 'self'",
      `script-src 'self' '${THEME_BOOTSTRAP_HASH}' https://js.stripe.com https://*.hcaptcha.com https://va.vercel-scripts.com`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https://nsnwwfbidishftlrimer.supabase.co https://images.unsplash.com https://api.maptiler.com https://*.hcaptcha.com",
      [
        "connect-src 'self'",
        "https://nsnwwfbidishftlrimer.supabase.co",
        "wss://nsnwwfbidishftlrimer.supabase.co",
        "https://migrent-ai-backend.onrender.com",
        API_ORIGIN,
        "https://api.maptiler.com",
        "https://*.hcaptcha.com",
        "https://api.stripe.com",
        "https://vitals.vercel-insights.com",
        "https://fcmregistrations.googleapis.com",
        "https://firebaseinstallations.googleapis.com",
        "https://*.ingest.sentry.io",
        "https://*.ingest.de.sentry.io",
      ]
        .filter(Boolean)
        .join(" "),
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "frame-src 'self' https://js.stripe.com https://*.hcaptcha.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self), payment=(self \"https://js.stripe.com\"), interest-cohort=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      // Isolates this window from cross-origin openers while still letting
      // Stripe and OAuth popups talk back.
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Long-cache immutable static assets
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

// Sentry's build plugin only does work when SENTRY_AUTH_TOKEN and an org/project
// are configured. Without them it passes the config through untouched, so the
// build behaves exactly as before until error tracking is switched on.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Keep CI output readable; the plugin is noisy by default.
  silent: !process.env.CI,
  // Source maps are uploaded to Sentry and stripped from the public bundle, so
  // stack traces stay readable for us without publishing our source.
  widenClientFileUpload: true,
});
