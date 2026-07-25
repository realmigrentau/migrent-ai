import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "./lib/supabase-middleware";

/**
 * Server-side route protection.
 *
 * Next.js 16 renamed the "middleware" file convention to "proxy"; the exported
 * function is now `proxy` rather than `middleware`. Behaviour is unchanged.
 *
 * - Dashboard routes (/dashboard/*) require an authenticated session.
 *   Unauthenticated visitors are redirected to /signin with a redirect param.
 * - Admin routes (/admin/*) never hit this matcher; client-side AdminGate
 *   handles their auth via API.
 * - Search is public: browsing listings must not require an account (the
 *   pricing page promises free browsing). Signed-out visitors simply don't
 *   get session features (best-match sort, wishlist saves).
 * - All other routes pass through.
 */
const PUBLIC_SEEKER_PATHS = ["/seeker/search"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // Public browse surfaces under /seeker
  if (PUBLIC_SEEKER_PATHS.includes(pathname)) {
    return res;
  }

  // Protect dashboard routes with server-side session check
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/seeker") ||
    pathname.startsWith("/account")
  ) {
    try {
      const supabase = createMiddlewareSupabaseClient(req, res);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const signInUrl = new URL("/signin", req.url);
        signInUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(signInUrl);
      }
    } catch {
      // If Supabase call fails, let the request through
      // Client-side DashboardLayout will handle auth as a fallback
      return res;
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/owner/:path*",
    "/seeker/:path*",
    "/account/:path*",
  ],
};
