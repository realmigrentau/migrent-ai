import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "./lib/supabase-middleware";

/**
 * Server-side route protection (Next.js 16 "proxy", formerly middleware).
 *
 * Rules, in order:
 *  - Public browse surfaces under /seeker (search) always pass.
 *  - /admin/* needs a session AND the database-backed admin claim
 *    (current_user_is_admin(), migration 042). Non-admins get a 404 so the
 *    path is not advertised. The client-side AdminGate stays as a second
 *    factor but is no longer the only gate.
 *  - Every other private surface needs a session: dashboard, owner, seeker,
 *    account, messages, support tickets, onboarding, reviews, payment and
 *    booking result pages.
 *  - Redirect targets are same-origin paths only (lib/safeRedirect.ts
 *    validates the value when the sign-in page reads it back).
 *
 * If the auth check itself fails (Supabase unreachable), private pages
 * fail closed to the sign-in page rather than rendering a protected shell.
 */
const PUBLIC_SEEKER_PATHS = ["/seeker/search"];

const PRIVATE_PREFIXES = [
  "/dashboard",
  "/owner",
  "/seeker",
  "/account",
  "/messages",
  "/support/tickets",
  "/onboarding",
  "/reviews",
  "/payment-success",
  "/payment-cancelled",
  "/booking-success",
  "/booking-cancelled",
  "/verification-success",
  "/verification-cancelled",
  "/mentor-session-success",
];

function toSignIn(req: NextRequest, pathname: string) {
  const signInUrl = new URL("/signin", req.url);
  const target = pathname + (req.nextUrl.search || "");
  if (target.startsWith("/") && !target.startsWith("//")) signInUrl.searchParams.set("redirect", target);
  const res = NextResponse.redirect(signInUrl);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
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
    supabase = createMiddlewareSupabaseClient(req, res);
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
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

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/owner/:path*",
    "/seeker/:path*",
    "/account/:path*",
    "/messages",
    "/messages/:path*",
    "/support/tickets",
    "/support/tickets/:path*",
    "/onboarding",
    "/onboarding/:path*",
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
