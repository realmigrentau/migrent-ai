import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "./lib/supabase-middleware";

const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "/mazda.asgt22779412.sara-admin";

/**
 * Server-side route protection middleware.
 *
 * - Dashboard routes (/dashboard/*) require an authenticated session.
 *   Unauthenticated visitors are redirected to /signin with a redirect param.
 * - Admin routes are left to client-side AdminGate (credentials checked via API).
 * - Search is public: browsing listings must not require an account (the
 *   pricing page promises free browsing). Signed-out visitors simply don't
 *   get session features (best-match sort, wishlist saves).
 * - All other routes pass through.
 */
const PUBLIC_SEEKER_PATHS = ["/seeker/search", "/seeker/search-extended"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // Skip admin routes - AdminGate handles its own auth via API
  if (pathname.startsWith(ADMIN_PATH)) {
    return res;
  }

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
    "/mazda.asgt22779412.sara-admin/:path*",
  ],
};
