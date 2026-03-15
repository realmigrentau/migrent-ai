import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";

interface SendEmailParams {
  type: string;
  to: string;
  data?: Record<string, any>;
}

/**
 * Hook for sending email notifications from the frontend.
 *
 * Booking emails (request, accepted, declined, confirmed) are sent by the
 * FastAPI backend automatically. This hook is for frontend-triggered emails
 * like test emails, welcome series, and account alerts.
 */
export function useNotifications() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = useCallback(async ({ type, to, data }: SendEmailParams) => {
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, to, data }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to send email (${res.status})`);
      }

      return await res.json();
    } catch (err: any) {
      const message = err.message || "Failed to send email";
      setError(message);
      throw err;
    } finally {
      setSending(false);
    }
  }, []);

  const sendTestEmail = useCallback(async () => {
    if (!user?.email) {
      throw new Error("No email address found for current user");
    }

    return sendEmail({
      type: "test",
      to: user.email,
      data: {
        userName: user.user_metadata?.name || user.email.split("@")[0],
        userRole: user.user_metadata?.type || "seeker",
      },
    });
  }, [user, sendEmail]);

  const sendWelcomeEmail = useCallback(
    async (day: 1 | 3 | 7 = 1) => {
      if (!user?.email) return;

      return sendEmail({
        type: "welcome",
        to: user.email,
        data: {
          userName: user.user_metadata?.name || user.email.split("@")[0],
          userRole: user.user_metadata?.type || "seeker",
          day,
        },
      });
    },
    [user, sendEmail]
  );

  return {
    sendEmail,
    sendTestEmail,
    sendWelcomeEmail,
    sending,
    error,
  };
}
