import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
    ];
  },

  async headers() {
    // Content-Security-Policy, shipped in REPORT-ONLY mode.
    // It logs violations to the browser console without blocking anything, so
    // we can confirm nothing legitimate trips it. Once the console is clean for
    // a week, rename the header to "Content-Security-Policy" to enforce it.
    //
    // Hosts allowed here, and why:
    //   fonts.googleapis / gstatic     Fraunces, Hanken Grotesk, Space Mono
    //   *.supabase.co                  auth, database, listing + avatar images
    //   *.onrender.com                 the MigRent API
    //   api.maptiler.com               search-page map tiles
    //   *.hcaptcha.com                 signup and contact-form captcha
    //   js/api.stripe.com              checkout
    //   *.vercel-scripts / -insights   Web Analytics and Speed Insights
    // 'unsafe-inline' is required for Next.js hydration payloads and the
    // inline theme bootstrap in _document.tsx that prevents a flash of the
    // wrong theme on first paint.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.hcaptcha.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://nsnwwfbidishftlrimer.supabase.co https://images.unsplash.com https://api.maptiler.com https://*.hcaptcha.com",
      "connect-src 'self' https://nsnwwfbidishftlrimer.supabase.co wss://nsnwwfbidishftlrimer.supabase.co https://migrent-ai-backend.onrender.com https://api.maptiler.com https://*.hcaptcha.com https://api.stripe.com https://vitals.vercel-insights.com",
      "worker-src 'self' blob:",
      "frame-src 'self' https://js.stripe.com https://*.hcaptcha.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy-Report-Only", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
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
