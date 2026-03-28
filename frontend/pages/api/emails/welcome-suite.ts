import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail, renderToHtml, emailTemplates } from "../../../lib/resend-client";

/**
 * POST /api/emails/welcome-suite
 *
 * Sends both welcome email and legal terms reminder to new signups.
 * Called from auth callback on first login.
 *
 * Body: { email, userName, userRole }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, userName, userRole } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing required field: email" });
  }

  const name = userName || "there";
  const role = userRole || "seeker";

  try {
    // Send welcome email
    const welcomeHtml = await renderToHtml(
      emailTemplates.welcome({ userName: name, userRole: role, day: 1 })
    );
    await sendEmail({
      to: email,
      subject: "Welcome to MigRent!",
      html: welcomeHtml,
    });

    // Send legal terms reminder email
    const legalHtml = await renderToHtml(
      emailTemplates.legalReminder({ userName: name })
    );
    await sendEmail({
      to: email,
      subject: "Review your MigRent terms and policies",
      html: legalHtml,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Welcome suite email error:", error);
    return res.status(500).json({
      error: error.message || "Failed to send welcome emails",
    });
  }
}
