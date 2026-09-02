import type { NextApiRequest, NextApiResponse } from "next";
import { timingSafeEqual, createHash } from "node:crypto";
import { createServerClient } from "@supabase/ssr";

/**
 * Second-factor gate for the admin UI.
 *
 * This route only ever confirms a shared admin passphrase. It is NOT the
 * authorisation boundary: proxy.ts requires a database admin claim before
 * any /admin page renders, and every admin API call is checked again by
 * the backend. What this adds is a knowledge factor for a shared device.
 *
 * Hardening over the previous version:
 *  - requires a signed-in Supabase session (cookie) before it will even
 *    compare, so it cannot be brute-forced anonymously
 *  - constant-time comparison of SHA-256 digests
 *  - per-instance rate limit (Vercel functions are ephemeral, so the
 *    backend limiter and Supabase auth remain the durable ones)
 */

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function equal(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

function limited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => Object.entries(req.cookies).map(([name, value]) => ({ name, value: value ?? "" })),
      setAll: () => {},
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ valid: false, error: "Sign in first" });

  const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  if (limited(`${user.id}:${ip}`)) return res.status(429).json({ valid: false, error: "Too many attempts. Try again later." });

  const { username, password } = (req.body ?? {}) as { username?: unknown; password?: unknown };
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return res.status(400).json({ valid: false, error: "Missing credentials" });
  }
  if (username.length > 200 || password.length > 500) return res.status(400).json({ valid: false });

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  const lockoutPass = process.env.ADMIN_LOCKOUT_PASSWORD;

  if (!adminUser || !adminPass) {
    console.error("ADMIN_USERNAME or ADMIN_PASSWORD env vars not set");
    return res.status(500).json({ valid: false, error: "Admin auth not configured" });
  }

  if (username === "_lockout_") {
    const valid = lockoutPass ? equal(password, lockoutPass) : false;
    return res.status(valid ? 200 : 401).json({ valid });
  }

  const valid = equal(username, adminUser) && equal(password, adminPass);
  return res.status(valid ? 200 : 401).json({ valid });
}
