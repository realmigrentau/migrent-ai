import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for route protection.
 *
 * Currently handles:
 * - Admin routes (protected client-side by AdminLayout)
 * - Dashboard routes (protected client-side by DashboardLayout)
 *
 * Note: Full server-side auth protection will be added when migrating
 * to @supabase/ssr with cookie-based sessions. For now, the client-side
 * protection in DashboardLayout handles auth redirection.
 *
 * This middleware serves as a placeholder and can be extended to:
 * - Check Supabase session cookies (when using @supabase/ssr)
 * - Add rate limiting
 * - Add security headers
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // For now, let all requests through
  // The DashboardLayout component handles auth redirection client-side
  // This avoids SSR hydration issues with Supabase client-side auth

  // Future: When migrating to @supabase/ssr, add server-side session checks here
  // Example:
  // const supabase = createMiddlewareClient({ req, res });
  // const { data: { session } } = await supabase.auth.getSession();
  // if (!session && pathname.startsWith('/dashboard')) {
  //   return NextResponse.redirect(new URL('/signin?redirect=' + pathname, req.url));
  // }

  return NextResponse.next();
}

export const config = {
  // Match admin and dashboard routes
  matcher: ["/mazda.asgt22779412.sara-admin/:path*", "/dashboard/:path*"],
};
