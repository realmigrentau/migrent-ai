import * as Sentry from "@sentry/nextjs";

// Server-side (SSR / getServerSideProps / route handlers) error tracking.
// Inert unless SENTRY_DSN is set. See sentry.client.config.ts for the rationale.
const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || "development",
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}
