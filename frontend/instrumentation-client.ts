import * as Sentry from "@sentry/nextjs";

// Error tracking is opt-in: with no DSN set, Sentry.init is never called and
// the SDK stays inert. That keeps local and preview runs quiet, and means the
// site behaves identically until a DSN is added in Vercel.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
    // Sample rather than capture everything - the free tier is finite and
    // MigRent only needs the shape of a problem, not every instance.
    tracesSampleRate: 0.1,
    // Never ship user content to a third party. MigRent handles ID documents
    // and bond money, so default to sending nothing personal.
    sendDefaultPii: false,
  });
}
