import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail, emailTemplates } from "../../../lib/resend-client";

/**
 * POST /api/emails/send
 *
 * General-purpose email sending endpoint.
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
    return res.status(200).json({ success: true, id: result?.id });
  } catch (error: any) {
    console.error("Email send error:", error);
    return res.status(500).json({
      error: error.message || "Failed to send email",
    });
  }
}

async function sendEmailByType(type: string, to: string, data: any) {
  switch (type) {
    case "test":
      return sendEmail({
        to,
        subject: "Test Email from MigRent",
        react: emailTemplates.welcome({
          userName: data.userName || "there",
          userRole: data.userRole || "seeker",
          day: 1,
        }),
      });

    case "welcome":
      return sendEmail({
        to,
        subject: data.day === 1
          ? "Welcome to MigRent!"
          : data.day === 3
          ? "Complete your MigRent profile"
          : "How's your search going?",
        react: emailTemplates.welcome({
          userName: data.userName,
          userRole: data.userRole || "seeker",
          day: data.day || 1,
        }),
      });

    case "new_booking_request":
      return sendEmail({
        to,
        subject: `New booking request for ${data.listingTitle}`,
        react: emailTemplates.newBookingRequest(data),
      });

    case "booking_approved":
      return sendEmail({
        to,
        subject: `Your booking for ${data.listingTitle} was approved!`,
        react: emailTemplates.bookingApproved(data),
      });

    case "booking_declined":
      return sendEmail({
        to,
        subject: `Update on your booking request for ${data.listingTitle}`,
        react: emailTemplates.bookingDeclined(data),
      });

    case "new_message":
      return sendEmail({
        to,
        subject: `New message from ${data.senderName}`,
        react: emailTemplates.newMessage(data),
      });

    case "booking_confirmed":
      return sendEmail({
        to,
        subject: `Booking confirmed - ${data.listingTitle}`,
        react: emailTemplates.bookingConfirmed(data),
      });

    case "review_reminder":
      return sendEmail({
        to,
        subject: `How was your stay at ${data.listingTitle}?`,
        react: emailTemplates.reviewReminder(data),
      });

    case "password_reset":
      return sendEmail({
        to,
        subject: "Reset your MigRent password",
        react: emailTemplates.passwordReset(data),
      });

    case "account_alert":
      return sendEmail({
        to,
        subject: getAlertSubject(data.alertType, data),
        react: emailTemplates.accountAlert(data),
      });

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
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
