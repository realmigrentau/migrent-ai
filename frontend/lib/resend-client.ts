/**
 * Resend email client wrapper for MigRent.
 *
 * Usage from Next.js API routes:
 *   import { sendEmail, emailTemplates } from "@/lib/resend-client";
 *   await sendEmail({ to: "user@example.com", subject: "Hello", react: emailTemplates.welcome({ ... }) });
 *
 * The backend (FastAPI) sends its own emails via the Python resend SDK.
 * This client is for frontend-triggered emails (test emails, welcome series, etc.)
 */

import { Resend } from "resend";
import { createElement } from "react";
import NewBookingRequest from "../emails/NewBookingRequest";
import BookingApproved from "../emails/BookingApproved";
import BookingDeclined from "../emails/BookingDeclined";
import NewMessage from "../emails/NewMessage";
import BookingConfirmed from "../emails/BookingConfirmed";
import ReviewReminder from "../emails/ReviewReminder";
import WelcomeEmail from "../emails/WelcomeEmail";
import PasswordReset from "../emails/PasswordReset";
import AccountAlert from "../emails/AccountAlert";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "MigRent <migrantau@gmail.com>";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendInstance = new Resend(RESEND_API_KEY);
  }
  return resendInstance;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  react,
  from = FROM_EMAIL,
  replyTo,
}: SendEmailOptions) {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
    replyTo,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

/**
 * Email template factory functions.
 * Each returns a React element ready to pass to sendEmail().
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
  }) => createElement(BookingApproved, { totalFees: "$118.00", ...props }),

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
};
