import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "./lib/supabase-middleware";

/**
 * Server-side routing and route protection (Next.js 16 "proxy", formerly
 * middleware).
 *
 * Migrent Hub
 *  - With NEXT_PUBLIC_HUB_HOST set (e.g. hub.migrent.com.au), requests to
 *    that host are served from pages/hub (hub.../applications renders
 *    /hub/applications), and /hub/* on the main site 308-redirects there.
 *    Unset, the Hub is served at /hub on the main site.
 *  - Every Hub page except sign-in, sign-up, password reset and the auth
 *    callback needs a session; without one the request is redirected to
 *    the Hub sign-in with `next` set, so the person lands back on exactly
 *    what they asked for. Hub responses are never indexed or cached.
 *
 * The rest of the site
 *  - Public browse surfaces under /seeker (search) always pass.
 *  - /admin/* needs a session AND the database-backed admin claim
 *    (current_user_is_admin(), migration 042). Non-admins get a 404 so the
 *    path is not advertised. The client-side AdminGate stays as a second
 *    factor but is not the only gate.
 *  - The older private surfaces (dashboard, owner, account, messages, ...)
 *    redirect into the Hub (next.config.ts). The few site pages that still
 *    need a session send people to Hub sign-in with `return`, and back.
 *
 * If the auth check itself fails (Supabase unreachable), private pages
 * fail closed to sign-in rather than rendering a protected shell.
 */
const HUB_HOST = (process.env.NEXT_PUBLIC_HUB_HOST || "").trim().toLowerCase();
const HUB_PUBLIC = ["/hub/sign-in", "/hub/sign-up", "/hub/forgot-password", "/hub/reset-password", "/hub/auth/callback"];

const PUBLIC_SEEKER_PATHS = ["/seeker/search"];

// The old dashboard, owner, account and messages pages redirect into the
// Hub (next.config.ts) before this runs; these are the site pages that still
// need a session.
const PRIVATE_PREFIXES = [
  "/support/tickets",
  "/reviews",
  "/payment-success",
  "/payment-cancelled",
  "/booking-success",
  "/booking-cancelled",
  "/verification-success",
  "/verification-cancelled",
  "/mentor-session-success",
];

function isStatic(pathname: string) {
  return pathname.startsWith("/_next/") || pathname.startsWith("/api/") || /\.[a-z0-9]{2,5}$/i.test(pathname);
}

function hubSignIn(req: NextRequest, hubPath: string) {
  const base = HUB_HOST ? "/sign-in" : "/hub/sign-in";
  const url = new URL(base, req.url);
  const target = hubPath + (req.nextUrl.search || "");
  if (target && target !== "/" && target.startsWith("/") && !target.startsWith("//")) url.searchParams.set("next", target);
  const res = NextResponse.redirect(url);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

/** Hub sign-in, then back to the site page that asked. */
function toSignIn(req: NextRequest, pathname: string) {
  const signInUrl = new URL(HUB_HOST ? `https://${HUB_HOST}/sign-in` : "/hub/sign-in", req.url);
  const target = pathname + (req.nextUrl.search || "");
  if (target.startsWith("/") && !target.startsWith("//")) signInUrl.searchParams.set("return", target);
  const res = NextResponse.redirect(signInUrl);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

async function sessionUser(req: NextRequest, res: NextResponse) {
  const supabase = createMiddlewareSupabaseClient(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

function privateHeaders(res: NextResponse) {
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") || "").toLowerCase().split(":")[0];

  // ── Migrent Hub on its own host ──
  if (HUB_HOST) {
    const onHubHost = host === HUB_HOST;
    if (onHubHost && !isStatic(pathname)) {
      if (pathname === "/hub" || pathname.startsWith("/hub/")) {
        // One canonical address per page.
        const url = req.nextUrl.clone();
        url.pathname = pathname.slice(4) || "/";
        return NextResponse.redirect(url, 308);
      }
      const hubPage = pathname === "/" ? "/hub" : `/hub${pathname}`;
      const rewritten = new URL(hubPage + req.nextUrl.search, req.url);
      const res = NextResponse.rewrite(rewritten);
      if (HUB_PUBLIC.some((p) => hubPage === p || hubPage.startsWith(`${p}/`))) return privateHeaders(res);
      try {
        const { user } = await sessionUser(req, res);
        if (!user) return hubSignIn(req, pathname);
      } catch {
        return hubSignIn(req, pathname);
      }
      return privateHeaders(res);
    }
    if (!onHubHost && (pathname === "/hub" || pathname.startsWith("/hub/"))) {
      const url = new URL(`https://${HUB_HOST}${pathname.slice(4) || "/"}${req.nextUrl.search}`);
      return NextResponse.redirect(url, 308);
    }
  }

  // ── Migrent Hub under /hub ──
  if (pathname === "/hub" || pathname.startsWith("/hub/")) {
    const res = NextResponse.next();
    if (HUB_PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return privateHeaders(res);
    try {
      const { user } = await sessionUser(req, res);
      if (!user) return hubSignIn(req, pathname.slice(4) || "/");
    } catch {
      return hubSignIn(req, pathname.slice(4) || "/");
    }
    return privateHeaders(res);
  }

  // ── The rest of the site ──
  const res = NextResponse.next();
  if (PUBLIC_SEEKER_PATHS.includes(pathname)) return res;

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPrivate = isAdmin || PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!isPrivate) return res;

  // Never let a shared cache keep a private page.
  res.headers.set("Cache-Control", "private, no-store");

  let user: { id: string } | null = null;
  let supabase: ReturnType<typeof createMiddlewareSupabaseClient> | null = null;
  try {
    const out = await sessionUser(req, res);
    user = out.user;
    supabase = out.supabase;
  } catch {
    // Fail closed: a private page must not render a protected shell when we
    // cannot establish who is asking.
    return toSignIn(req, pathname);
  }

  if (!user) return toSignIn(req, pathname);

  if (isAdmin) {
    try {
      const { data, error } = await supabase!.rpc("current_user_is_admin");
      if (error || data !== true) {
        // A signed-in non-admin sees what everyone else sees: nothing there.
        return NextResponse.rewrite(new URL("/404", req.url), { status: 404 });
      }
    } catch {
      return NextResponse.rewrite(new URL("/404", req.url), { status: 404 });
    }
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

// Static by requirement (Next.js reads it at build). On a Hub host, paths
// outside this list are mapped to pages/hub by the host rewrite in
// next.config.ts; the pages guard themselves client-side and every byte of
// private data comes from the API, which authorises each request.
export const config = {
  matcher: [
    "/hub",
    "/hub/:path*",
    "/admin",
    "/admin/:path*",
    "/support/tickets",
    "/support/tickets/:path*",
    "/reviews/:path*",
    "/payment-success",
    "/payment-cancelled",
    "/booking-success",
    "/booking-cancelled",
    "/verification-success",
    "/verification-cancelled",
    "/mentor-session-success",
  ],
};
