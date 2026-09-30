// Error tracking is opt-in: with no DSN set, nothing is loaded at all. The
// Sentry SDK is one of the largest things a page could download, so it is
// imported only when a DSN exists, and after the page has started, rather
// than being bundled into every page and left inert.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  import("@sentry/nextjs").then((Sentry) => {
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
  });
}
