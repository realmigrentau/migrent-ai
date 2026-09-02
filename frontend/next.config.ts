import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { createHash } from "node:crypto";
import { THEME_BOOTSTRAP_SCRIPT } from "./lib/themeBootstrap";

// The only inline script the site ships. Its hash goes into script-src so
// 'unsafe-inline' can go. Any edit to lib/themeBootstrap.ts changes the hash
// automatically; nothing has to be kept in sync by hand.
const THEME_BOOTSTRAP_HASH = `sha256-${createHash("sha256").update(THEME_BOOTSTRAP_SCRIPT, "utf8").digest("base64")}`;

// The API origin, so preview deployments pointing at a different backend
// are not blocked by connect-src.
const API_ORIGIN = (() => {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_API_BASE_URL || "");
    return u.origin.startsWith("http") ? u.origin : "";
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
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

  // Tree-shake heavy icon / animation / chart packages
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "@react-email/components",
    ],
  },

  async redirects() {
    return [
      // Deduped pages - permanent redirects preserve old links and bookmarks.
      { source: "/seeker/search-extended", destination: "/seeker/search", permanent: true },
      { source: "/rental-laws", destination: "/resources/rental-laws", permanent: true },
      // An App Router prototype at app/[lang]/resources used to serve eight
      // locale copies of /resources. It was client-only, so every one of them
      // shipped English HTML with no canonical - eight duplicates competing
      // with the real page. The prototype is gone; fold the URLs back in so
      // anything already indexed or linked consolidates instead of 404ing.
      {
        source: "/:locale(en|zh|hi|es|ar|fr|ru|pt)/resources",
        destination: "/resources",
        permanent: true,
      },

      // Four routes existed only to render nothing and then call
      // router.replace in an effect. That is a soft 404 to a crawler and a
      // flash of blank page to a person. Real 301s instead.
      { source: "/seeker/room/:id", destination: "/listing/:id", permanent: true },
      { source: "/account/messages", destination: "/messages", permanent: true },
      { source: "/seeker/dashboard", destination: "/dashboard", permanent: true },
      { source: "/seeker/saved", destination: "/seeker/wishlist", permanent: true },

      // Duplicate pages. Two parallel hierarchies had grown up: /dashboard/*
      // pages compose the shared DashboardLayout, ProfileForm and
      // VerificationSummaryCard, while these older standalone versions
      // reimplemented the same screens by hand. Owners saw a different
      // dashboard depending on whether they arrived from a marketing CTA or
      // from /owner/setup. The /dashboard/* versions win.
      { source: "/owner/dashboard", destination: "/dashboard/owner", permanent: true },
      { source: "/owner/profile", destination: "/dashboard/owner-profile", permanent: true },
      { source: "/seeker/profile", destination: "/dashboard/seeker-profile", permanent: true },

      // Two rules pages with overlapping content. The footer, terms of service
      // and code of conduct all point at the community guidelines, so that one
      // is authoritative.
      { source: "/rules", destination: "/rules-community-guidelines", permanent: true },
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
