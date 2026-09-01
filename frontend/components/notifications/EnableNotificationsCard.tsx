import { useState, useEffect } from "react";
import { Bell, BellOff, Check, X } from "lucide-react";
import { requestNotificationPermission } from "../../lib/messaging";
import { subscribeToNotifications } from "../../lib/api";

interface Props {
  token: string; // Supabase access token
}

export default function EnableNotificationsCard({ token }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error" | "dismissed">("idle");
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // Don't show if user already dismissed or already subscribed
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem("migrent_notif_dismissed");
    const subscribed = localStorage.getItem("migrent_notif_subscribed");
    if (dismissed || subscribed) {
      setHidden(true);
      return;
    }
    // Don't show if notifications are already granted (they already opted in before)
    if ("Notification" in window && Notification.permission === "granted") {
      setHidden(true);
      return;
    }
    // Don't show if browser doesn't support notifications
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setHidden(true);
      return;
    }
    setHidden(false);
  }, []);

  if (hidden || state === "dismissed") return null;

  const handleEnable = async () => {
    setState("loading");
    try {
      const fcmToken = await requestNotificationPermission();
      if (!fcmToken) {
        setState("error");
        return;
      }
      // Send token to backend
      const result = await subscribeToNotifications(token, fcmToken);
      if (result) {
        localStorage.setItem("migrent_notif_subscribed", "true");
        setState("success");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("migrent_notif_dismissed", "true");
    setState("dismissed");
  };

  if (state === "success") {
    return (
      <div className="p-4 rounded-xl bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
          <Check className="w-5 h-5 text-[var(--color-accent)] dark:text-[var(--color-accent)]" />
        </div>
        <p className="text-sm font-medium text-emerald-800 dark:text-[var(--color-accent)]">
          Notifications enabled! You will get alerts for messages, bookings, and more.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-5 h-5 text-[var(--color-primary)] dark:text-[var(--color-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-rose-800 dark:text-[var(--color-primary)]">
            Turn on notifications
          </p>
          <p className="text-xs text-[var(--color-primary)] dark:text-[var(--color-primary)] mt-0.5">
            Never miss messages or booking updates - get instant alerts on your phone or desktop.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={state === "loading"}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white transition-colors disabled:opacity-50"
            >
              {state === "loading" ? "Enabling..." : state === "error" ? "Try again" : "Enable notifications"}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs text-[var(--color-primary)] dark:text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors"
            >
              No thanks
            </button>
          </div>
          {state === "error" && (
            <p className="text-xs text-[var(--color-danger-500)] mt-2">
              Could not enable notifications. Make sure you allow them when your browser asks.
            </p>
          )}
        </div>
        <button aria-label="Dismiss" onClick={handleDismiss} className="text-[var(--color-primary)] hover:text-[var(--color-primary)] shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
