/**
 * Single source of truth for the backend + frontend base URLs.
 *
 * Why this exists
 * ───────────────
 * Before this helper, every fetch call did:
 *
 *     const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
 *
 * In development that's fine. In production, if the env var is missing
 * from Vercel, every request silently goes to localhost:8000 (which doesn't
 * exist) and users see broken pages with no obvious error. That's
 * unacceptable for launch.
 *
 * The helpers below behave differently per environment:
 *
 * - **Development** (NODE_ENV !== "production"):
 *     If the env var is missing, fall back to the conventional localhost
 *     URL and emit a single console.warn so the developer knows.
 *
 * - **Production**:
 *     If the env var is missing, log a loud console.error and return
 *     "" so requests fail with a clear "Failed to fetch / invalid URL"
 *     error instead of silently hitting the wrong host. This is the
 *     safest "fail loud" behaviour for a public site - you'll spot it
 *     immediately in Vercel logs or in your browser console.
 *
 * Usage:
 *     import { API_BASE_URL, FRONTEND_BASE_URL } from "@/lib/apiBase";
 *     fetch(`${API_BASE_URL}/listings`);
 */

const isProd = process.env.NODE_ENV === "production";

// Track whether we've already warned so we don't spam the console.
let warnedApi = false;
let warnedFrontend = false;

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.replace(/\/+$/, "");

  if (isProd) {
    if (!warnedApi && typeof window !== "undefined") {
      // Loud, visible-in-prod error so missing config is impossible to miss.
      console.error(
        "[MigRent] NEXT_PUBLIC_API_BASE_URL is not set in production. " +
          "API requests will fail. Set this env var in your Vercel project settings.",
      );
      warnedApi = true;
    }
    return "";
  }

  if (!warnedApi) {
    console.warn(
      "[MigRent] NEXT_PUBLIC_API_BASE_URL is not set. " +
        "Falling back to http://localhost:8000 for local development.",
    );
    warnedApi = true;
  }
  return "http://localhost:8000";
}

function resolveFrontendBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_FRONTEND_URL;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.replace(/\/+$/, "");

  if (isProd) {
    if (typeof window !== "undefined") {
      // In the browser we can derive it from window.location as a safe default
      // since the frontend is, by definition, the host the user is currently on.
      return `${window.location.protocol}//${window.location.host}`;
    }
    if (!warnedFrontend) {
      console.error(
        "[MigRent] NEXT_PUBLIC_FRONTEND_URL is not set in production. " +
          "Set this env var in your Vercel project settings.",
      );
      warnedFrontend = true;
    }
    return "";
  }

  if (!warnedFrontend) {
    console.warn(
      "[MigRent] NEXT_PUBLIC_FRONTEND_URL is not set. " +
        "Falling back to http://localhost:3000 for local development.",
    );
    warnedFrontend = true;
  }
  return "http://localhost:3000";
}

export const API_BASE_URL: string = resolveApiBaseUrl();
export const FRONTEND_BASE_URL: string = resolveFrontendBaseUrl();
