import type { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "@supabase/ssr";
import { sendEmail, renderToHtml, emailTemplates } from "../../../lib/resend-client";

/**
 * POST /api/emails/welcome-suite
 *
 * Sends the welcome and legal-reminder emails to the SIGNED-IN user's own
 * address. Called from the auth callback on first login.
 *
 * The recipient is taken from the session, never from the request body:
 * the previous version accepted { email } from anyone and would mail any
 * address it was given.
 */

const sent = new Map<string, number>();

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
  if (!user?.email) return res.status(401).json({ error: "Sign in first" });

  // One welcome suite per account per instance lifetime; the callback can
  // fire more than once on a slow network.
  const last = sent.get(user.id);
  if (last && Date.now() - last < 24 * 60 * 60 * 1000) return res.status(200).json({ success: true, skipped: true });
  sent.set(user.id, Date.now());

  const { userName, userRole } = (req.body ?? {}) as { userName?: unknown; userRole?: unknown };
  const name = typeof userName === "string" && userName.trim() ? userName.trim().slice(0, 80) : "there";
  const role = userRole === "owner" ? "owner" : "seeker";

  try {
    const welcomeHtml = await renderToHtml(emailTemplates.welcome({ userName: name, userRole: role, day: 1 }));
    await sendEmail({ to: user.email, subject: "Welcome to MigRent!", html: welcomeHtml });
    const legalHtml = await renderToHtml(emailTemplates.legalReminder({ userName: name }));
    await sendEmail({ to: user.email, subject: "Review your MigRent terms and policies", html: legalHtml });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Welcome suite email error:", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Failed to send welcome emails" });
  }
}
