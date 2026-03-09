import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Create a Supabase client for use in Next.js middleware.
 * Reads/writes auth tokens via request/response cookies so the
 * middleware can validate sessions server-side.
 */
export function createMiddlewareSupabaseClient(
  req: NextRequest,
  res: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          }
        },
      },
    }
  );
}
