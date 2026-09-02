import type { NextApiRequest, NextApiResponse } from "next";
import { timingSafeEqual, createHash } from "node:crypto";
import { sendEmail, renderToHtml, emailTemplates } from "../../../lib/resend-client";

/**
 * POST /api/emails/send
 *
 * Internal email relay. This used to be an open endpoint: anyone on the
 * internet could POST { type: "welcome", to: "victim@example.com" } and
 * MigRent would send branded mail to any address, which is a spam and
 * phishing vector. It now requires the INTERNAL_EMAIL_SECRET header shared
 * with the backend, and refuses when the secret is not configured.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expected = process.env.INTERNAL_EMAIL_SECRET;
  const provided = req.headers["x-internal-secret"];
  if (!expected || typeof provided !== "string") return res.status(401).json({ error: "Unauthorized" });
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(a, b)) return res.status(401).json({ error: "Unauthorized" });

  const { type, to, data } = (req.body ?? {}) as { type?: unknown; to?: unknown; data?: Record<string, unknown> };
  if (typeof type !== "string" || typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: "Missing or invalid fields: type, to" });
  }

  try {
    const result = await sendEmailByType(type, to, data || {});
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Email send error:", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendEmailByType(type: string, to: string, data: any) {
  let subject: string;
  let template: React.ReactElement;

  switch (type) {
    case "welcome":
      subject = data.day === 1 ? "Welcome to MigRent!" : data.day === 3 ? "Complete your MigRent profile" : "How's your search going?";
      template = emailTemplates.welcome({ userName: data.userName, userRole: data.userRole || "seeker", day: data.day || 1 });
      break;
    case "new_booking_request":
      subject = `New booking request for ${data.listingTitle}`;
      template = emailTemplates.newBookingRequest(data);
      break;
    case "booking_approved":
      subject = `Your booking for ${data.listingTitle} was approved!`;
      template = emailTemplates.bookingApproved(data);
      break;
    case "booking_declined":
      subject = `Update on your booking request for ${data.listingTitle}`;
      template = emailTemplates.bookingDeclined(data);
      break;
    case "new_message":
      subject = `New message from ${data.senderName}`;
      template = emailTemplates.newMessage(data);
      break;
    case "booking_confirmed":
      subject = `Booking confirmed - ${data.listingTitle}`;
      template = emailTemplates.bookingConfirmed(data);
      break;
    case "review_reminder":
      subject = `How was your stay at ${data.listingTitle}?`;
      template = emailTemplates.reviewReminder(data);
      break;
    case "password_reset":
      subject = "Reset your MigRent password";
      template = emailTemplates.passwordReset(data);
      break;
    case "account_alert":
      subject = getAlertSubject(data.alertType, data);
      template = emailTemplates.accountAlert(data);
      break;
    case "legal_reminder":
      subject = "Review your MigRent terms and policies";
      template = emailTemplates.legalReminder({ userName: data.userName || "there" });
      break;
    default:
      throw new Error(`Unknown email type: ${type}`);
  }

  const html = await renderToHtml(template);
  return sendEmail({ to, subject, html });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAlertSubject(alertType: string, data: any): string {
  switch (alertType) {
    case "listing_views":
      return `Your listing got ${data.viewCount || 0} new views!`;
    case "new_match":
      return "We found a new match for you!";
    case "verification_approved":
      return "Your identity verification is approved!";
    case "verification_rejected":
      return "Action needed: verification update";
    default:
      return "Account update from MigRent";
  }
}
