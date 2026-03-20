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
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Notifications enabled! You will get alerts for messages, bookings, and more.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
            Turn on notifications
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
            Never miss messages or booking updates - get instant alerts on your phone or desktop.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={state === "loading"}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-50"
            >
              {state === "loading" ? "Enabling..." : state === "error" ? "Try again" : "Enable notifications"}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
            >
              No thanks
            </button>
          </div>
          {state === "error" && (
            <p className="text-xs text-red-500 mt-2">
              Could not enable notifications. Make sure you allow them when your browser asks.
            </p>
          )}
        </div>
        <button onClick={handleDismiss} className="text-rose-400 hover:text-rose-600 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
