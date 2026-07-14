import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

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
    ];
  },

  async headers() {
    const securityHeaders = [
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

export default nextConfig;
