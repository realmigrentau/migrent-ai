/**
 * Firebase initialization for push notifications.
 *
 * ENV VARS NEEDED in frontend/.env.local:
 *   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 *   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
 *   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
 *   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-public-key
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get messaging instance (only in browser, only if supported)
export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
}

export default app;
