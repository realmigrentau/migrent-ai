import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { motion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * Check if the user account was created recently (within 5 minutes).
 * New signups get sent to /onboarding, returning users to /dashboard.
 */
function isNewUser(session: Session): boolean {
  const createdAt = session.user?.created_at;
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return now - created < fiveMinutes;
}

/**
 * Send welcome + legal reminder emails for new signups (best-effort).
 */
async function sendWelcomeEmails(email: string, userName: string, userRole: string) {
  try {
    await fetch("/api/emails/welcome-suite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userName, userRole }),
    });
  } catch {
    // Best-effort - don't block the auth flow
  }
}

/**
 * Store legal_accepted_at in the user's profile (best-effort).
 */
async function storeLegalAcceptance(accessToken: string) {
  try {
    await fetch(`${API_BASE}/auth/store-legal-acceptance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    // Best-effort
  }
}

/**
 * After magic link verification, store session tokens in the backend
 * so the original device (e.g. laptop) can pick them up via polling.
 */
async function storeCrossDeviceTokens(
  pollingId: string,
  accessToken: string,
  refreshToken: string
) {
  try {
    await fetch(`${API_BASE}/auth/cross-device/store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        polling_id: pollingId,
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
    });
  } catch {
    // Best-effort - the phone still logs in regardless
  }
}

/**
 * Handle post-auth tasks (cross-device tokens, legal acceptance, welcome emails)
 * and redirect to the right page.
 */
async function handleSession(
  session: Session,
  pollingId: string | null,
  router: ReturnType<typeof useRouter>
) {
  // Store cross-device tokens if needed
  if (pollingId && session.access_token && session.refresh_token) {
    await storeCrossDeviceTokens(pollingId, session.access_token, session.refresh_token);
  }

  // Store legal acceptance for new users
  const meta = session.user?.user_metadata;
  if (meta?.legal_accepted_at) {
    await storeLegalAcceptance(session.access_token);
  }

  // Send welcome emails only once (first callback ever)
  const welcomeKey = "migrent_welcome_sent";
  if (!localStorage.getItem(welcomeKey)) {
    localStorage.setItem(welcomeKey, "1");
    sendWelcomeEmails(
      session.user?.email || "",
      meta?.full_name || meta?.name || session.user?.email?.split("@")[0] || "there",
      meta?.type || "seeker"
    );
  }

  // New signup -> onboarding, returning user -> dashboard
  if (isNewUser(session)) {
    router.replace("/onboarding");
  } else {
    router.replace("/dashboard");
  }
}

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      // Extract polling_id from the URL query params (added by magic link pages)
      const params = new URLSearchParams(window.location.search);
      const pollingId = params.get("polling_id");

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (session) {
        await handleSession(session, pollingId, router);
        return;
      }

      // Listen for auth state change as a fallback (hash fragment processing)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          subscription.unsubscribe();
          await handleSession(session, pollingId, router);
        }
      });

      // Timeout after 5 seconds if nothing happens
      setTimeout(() => {
        subscription.unsubscribe();
        setError("The magic link may have expired or already been used. Please request a new one.");
      }, 5000);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      {/* Floating shapes */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 hidden " />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/5 hidden " />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="card p-8 rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-[var(--color-primary)] from-transparent via-blue-400/50 to-transparent rounded-t-2xl" />

          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
              M
            </div>

            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Link expired or invalid
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {error}
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/magic-link-login"
                    className="block w-full text-center py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                  >
                    Request a new login link
                  </Link>
                  <Link
                    href="/magic-link-signup"
                    className="block w-full text-center btn-secondary py-3 rounded-xl text-sm"
                  >
                    Request a new sign-up link
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mx-auto">
                  <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Verifying your email...
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Just a moment while we sign you in.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
