/**
 * Push notification helpers - request permission, get token, listen for messages.
 */

import { getToken, onMessage, type Messaging } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

/**
 * Request notification permission and return the FCM token.
 * Returns null if denied or unsupported.
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  try {
    // Register service worker for push
    const registration = await navigator.serviceWorker.register("/service-worker.js");
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch (err) {
    console.error("Failed to get FCM token:", err);
    return null;
  }
}

/**
 * Listen for foreground messages (when app is open).
 * Shows a browser notification so the user sees it.
 */
export function listenForForegroundMessages(messaging: Messaging) {
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || "MigRent";
    const body = payload.notification?.body || "You have a new update";
    const url = payload.data?.url || "/";

    // Show notification even when tab is focused
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icons/icon-192x192.png",
        data: { url },
      });
    }
  });
}
