import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  // Only protect /admin routes
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Try to get the Supabase access token from cookies
  // Supabase stores the session in cookies via sb-<ref>-auth-token
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Look for Supabase auth cookie
  const cookies = req.cookies;
  let accessToken: string | undefined;

  for (const [name, cookie] of cookies) {
    if (name.includes("auth-token")) {
      try {
        // Supabase stores JSON array [access_token, refresh_token, ...]
        const parsed = JSON.parse(cookie.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          accessToken = parsed[0];
        } else if (typeof parsed === "string") {
          accessToken = parsed;
        }
      } catch {
        // Might be a direct token string
        accessToken = cookie.value;
      }
      break;
    }
  }

  if (!accessToken) {
    // No auth — redirect to sign in
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Verify user role via Supabase
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    // Check for superadmin role in profiles table or user_metadata
    // Client-side will do the definitive check; middleware provides a first gate
    const role =
      user.user_metadata?.role ??
      user.app_metadata?.role;

    if (role !== "superadmin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
