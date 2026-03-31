import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "../../../lib/resend-client";

/**
 * POST /api/emails/send-code
 *
 * Sends a verification code email with backend fallback to frontend Mailjet.
 *
 * Flow:
 *   1. Call backend to generate + store code (and try to send email)
 *   2. If backend sent the email, done
 *   3. If backend stored the code but email failed, send via frontend Mailjet
 *   4. If backend is completely unreachable, return error
 *
 * Body: { email, purpose? }
 *   purpose: "signup" (default) | "2fa"
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const BRAND_COLOR = "#E11D48";
const BRAND_BG = "#f6f9fc";
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://migrent-ai.vercel.app";

function buildCodeEmailHtml(code: string, purpose: "signup" | "2fa"): string {
  const isSignup = purpose === "signup";
  const heading = isSignup ? "Verify your email" : "Sign-in verification";
  const intro = isSignup
    ? "Welcome to MigRent! Enter this code on the website to verify your email address and complete your sign-up:"
    : "Someone is trying to sign in to your MigRent account. Enter this code to confirm it is you:";
  const expiryMinutes = isSignup ? 10 : 5;
  const footer = isSignup
    ? "If you did not create an account on MigRent, you can safely ignore this email."
    : "If you did not try to sign in, someone may have your password. Change it immediately.";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:${BRAND_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    <div style="background-color:${BRAND_COLOR};padding:24px 32px;text-align:center;">
      <a href="${FRONTEND_URL}" style="text-decoration:none;">
        <span style="color:#ffffff;font-size:28px;font-weight:bold;letter-spacing:-0.5px;">MigRent</span>
      </a>
    </div>
    <div style="padding:32px;">
      <h2 style="font-size:24px;font-weight:bold;color:#1a1a1a;margin:0 0 16px;">${heading}</h2>
      <p style="font-size:15px;line-height:24px;color:#374151;margin:0 0 12px;">${intro}</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
        <p style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1a1a1a;margin:0;font-family:monospace;">${code}</p>
      </div>
      <p style="font-size:14px;color:#6b7280;margin:0 0 8px;">
        This code expires in <strong>${expiryMinutes} minutes</strong>.
      </p>
      <p style="font-size:14px;color:#6b7280;margin:0;">${footer}</p>
    </div>
    <div style="border-top:1px solid #e6ebf1;padding:24px 32px;text-align:center;">
      <p style="color:#8898aa;font-size:14px;margin:0 0 8px;">MigRent - Find your home in Australia</p>
      <p style="color:#b0b8c4;font-size:11px;line-height:16px;margin:8px 0 0;">
        If you did not request this code, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, purpose = "signup" } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing required field: email" });
  }

  if (purpose !== "signup" && purpose !== "2fa") {
    return res.status(400).json({ error: "Invalid purpose" });
  }

  const backendEndpoint = purpose === "signup"
    ? `${API_BASE}/codes/send-signup-code`
    : `${API_BASE}/codes/send-2fa-code`;

  // Step 1: Call the backend to generate + store the code
  try {
    const backendRes = await fetch(backendEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      console.error("Backend code generation failed:", data);
      return res.status(500).json({
        error: data.detail || "Backend failed to generate verification code",
      });
    }

    // If backend already sent the email successfully, we're done
    if (data.email_sent) {
      return res.status(200).json({ success: true, sent_by: "backend" });
    }

    // Backend stored the code but email failed - send via frontend Mailjet
    if (data.code) {
      console.log("Backend email failed, sending via frontend Mailjet. Error:", data.email_error);
      try {
        const subject = purpose === "signup"
          ? `Your MigRent verification code: ${data.code}`
          : `MigRent sign-in code: ${data.code}`;
        const html = buildCodeEmailHtml(data.code, purpose);
        await sendEmail({ to: email, subject, html });
        return res.status(200).json({ success: true, sent_by: "frontend_fallback" });
      } catch (emailErr: any) {
        console.error("Frontend Mailjet fallback also failed:", emailErr);
        return res.status(500).json({
          error: "Failed to send verification email through all channels. Please try again.",
        });
      }
    }

    // Backend said OK but no code returned - assume email was sent
    return res.status(200).json({ success: true, sent_by: "backend" });
  } catch (err: any) {
    console.error("Backend unreachable:", err.message);
    return res.status(500).json({
      error: "Could not reach the server. Please try again in a moment.",
    });
  }
}
