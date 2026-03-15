import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail, renderToHtml, emailTemplates } from "../../../lib/resend-client";

/**
 * POST /api/emails/send
 *
 * General-purpose email sending endpoint via Mailjet.
 * Used by the frontend for test emails, welcome series, and other
 * frontend-triggered notifications.
 *
 * Body: { type, to, data }
 *   type: template name (e.g. "welcome", "test", "review_reminder")
 *   to: recipient email
 *   data: template-specific props
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, to, data } = req.body;

  if (!type || !to) {
    return res.status(400).json({ error: "Missing required fields: type, to" });
  }

  try {
    const result = await sendEmailByType(type, to, data || {});
    return res.status(200).json({ success: true, result });
  } catch (error: any) {
    console.error("Email send error:", error);
    return res.status(500).json({
      error: error.message || "Failed to send email",
    });
  }
}

async function sendEmailByType(type: string, to: string, data: any) {
  let subject: string;
  let template: React.ReactElement;

  switch (type) {
    case "test":
      subject = "Test Email from MigRent";
      template = emailTemplates.welcome({
        userName: data.userName || "there",
        userRole: data.userRole || "seeker",
        day: 1,
      });
      break;

    case "welcome":
      subject = data.day === 1
        ? "Welcome to MigRent!"
        : data.day === 3
        ? "Complete your MigRent profile"
        : "How's your search going?";
      template = emailTemplates.welcome({
        userName: data.userName,
        userRole: data.userRole || "seeker",
        day: data.day || 1,
      });
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

    default:
      throw new Error(`Unknown email type: ${type}`);
  }

  const html = await renderToHtml(template);
  return sendEmail({ to, subject, html });
}

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
