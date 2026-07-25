// Next.js calls register() once per server runtime at boot.
// The Sentry config it loads is inert unless a DSN is set.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

export { captureRequestError as onRequestError } from "@sentry/nextjs";
