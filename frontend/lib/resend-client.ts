/**
 * Mailjet email client wrapper for MigRent.
 *
 * Usage from Next.js API routes:
 *   import { sendEmail, emailTemplates } from "@/lib/resend-client";
 *   const html = await renderToHtml(emailTemplates.welcome({ ... }));
 *   await sendEmail({ to: "user@example.com", subject: "Hello", html });
 *
 * The backend (FastAPI) sends its own emails via Mailjet REST API.
 * This client is for frontend-triggered emails (test emails, welcome series, etc.)
 */

import { createElement } from "react";
import { render } from "@react-email/render";
import NewBookingRequest from "../emails/NewBookingRequest";
import BookingApproved from "../emails/BookingApproved";
import BookingDeclined from "../emails/BookingDeclined";
import NewMessage from "../emails/NewMessage";
import BookingConfirmed from "../emails/BookingConfirmed";
import ReviewReminder from "../emails/ReviewReminder";
import WelcomeEmail from "../emails/WelcomeEmail";
import PasswordReset from "../emails/PasswordReset";
import AccountAlert from "../emails/AccountAlert";
import LegalReminderEmail from "../emails/LegalReminderEmail";

const MAILJET_API_KEY = process.env.MAILJET_API_KEY || "";
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "migrentau@gmail.com";
const FROM_NAME = process.env.FROM_NAME || "MigRent";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions) {
  if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
    throw new Error("MAILJET_API_KEY or MAILJET_SECRET_KEY not set");
  }

  const recipients = Array.isArray(to) ? to : [to];

  const payload = {
    Messages: [
      {
        From: { Email: FROM_EMAIL, Name: FROM_NAME },
        To: recipients.map((email) => ({ Email: email })),
        Subject: subject,
        HTMLPart: html,
        ...(text ? { TextPart: text } : {}),
      },
    ],
  };

  const credentials = Buffer.from(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`).toString("base64");

  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Mailjet error:", errorBody);
    throw new Error(`Failed to send email: ${response.status} ${errorBody}`);
  }

  return await response.json();
}

/**
 * Render a React Email component to an HTML string.
 */
export async function renderToHtml(element: React.ReactElement): Promise<string> {
  return await render(element);
}

/**
 * Email template factory functions.
 * Each returns a React element that can be rendered to HTML with renderToHtml().
 */
export const emailTemplates = {
  newBookingRequest: (props: {
    ownerName: string;
    seekerName: string;
    listingTitle: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: string;
    seekerMessage?: string;
  }) => createElement(NewBookingRequest, props),

  bookingApproved: (props: {
    seekerName: string;
    listingTitle: string;
    checkIn: string;
    checkOut: string;
    checkoutUrl: string;
    totalFees?: string;
  }) => createElement(BookingApproved, props),

  bookingDeclined: (props: {
    seekerName: string;
    listingTitle: string;
  }) => createElement(BookingDeclined, props),

  newMessage: (props: {
    recipientName: string;
    senderName: string;
    messagePreview: string;
    listingTitle?: string;
    threadUrl: string;
  }) => createElement(NewMessage, props),

  bookingConfirmed: (props: {
    recipientName: string;
    recipientRole: "owner" | "seeker";
    otherPartyName: string;
    listingTitle: string;
    checkIn: string;
    checkOut: string;
  }) => createElement(BookingConfirmed, props),

  reviewReminder: (props: {
    recipientName: string;
    otherPartyName: string;
    listingTitle: string;
    reviewUrl: string;
  }) => createElement(ReviewReminder, props),

  welcome: (props: {
    userName: string;
    userRole: "seeker" | "owner";
    day?: 1 | 3 | 7;
  }) => createElement(WelcomeEmail, props),

  passwordReset: (props: {
    userName: string;
    resetUrl: string;
  }) => createElement(PasswordReset, props),

  accountAlert: (props: {
    userName: string;
    alertType: "listing_views" | "new_match" | "verification_approved" | "verification_rejected";
    listingTitle?: string;
    viewCount?: number;
    message?: string;
  }) => createElement(AccountAlert, props),

  legalReminder: (props: {
    userName: string;
  }) => createElement(LegalReminderEmail, props),
};
