import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin route protection is handled client-side by AdminLayout.
// This middleware is a placeholder for future server-side auth
// (e.g. when migrating to @supabase/ssr with cookie-based sessions).
export async function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
