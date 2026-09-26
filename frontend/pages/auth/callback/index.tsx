import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase";
import { checkOnboardingStatus } from "../../../lib/api";
import { API_BASE_URL as API_BASE } from "../../../lib/apiBase";
import {
  RESET_PASSWORD_PATH,
  authErrorMessage,
  isRecentlyCreated,
  parseAuthCallback,
  postAuthDestination,
  type AuthCallbackParams,
} from "../../../lib/authRedirect";

/**
 * Where every Google sign-in, sign-up confirmation, magic link and password
 * reset link lands (lib/authRedirect.ts builds those URLs).
 *
 * Supabase hands back one of:
 *  - ?code=         PKCE. The Supabase client redeems it by itself as it
 *                   starts up, using the verifier this browser saved when the
 *                   flow began. We wait for that rather than redeeming twice.
 *  - ?token_hash=   From email templates that use {{ .TokenHash }}. Works in
 *                   any browser, so it is verified here directly.
 *  - #access_token= Implicit flow. auth.resend() links come back this way
 *                   even though the client is PKCE, which the client refuses
 *                   ("Not a valid PKCE flow url"), so the tokens are set here.
 *  - ?error=...     Expired or reused link, cancelled Google consent.
 *
 * Every outcome ends in a redirect or a message saying what to do next;
 * nothing waits on a timer.
 */

type Failure = {
  title: string;
  message: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
};

// The API runs on a host that can take a while to wake. Never hold the
// person on this page for it.
const API_WAIT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

function linkFailure(p: AuthCallbackParams, message: string): Failure {
  const isReset = p.otpType === "recovery" || p.next === RESET_PASSWORD_PATH;
  return {
    title: "That link did not work",
    message,
    primary: isReset
      ? { href: "/forgot-password", label: "Send a new reset link" }
      : { href: "/signin", label: "Sign in" },
    secondary: isReset ? undefined : { href: "/magic-link-login", label: "Email me a sign-in link" },
  };
}

function differentBrowserFailure(p: AuthCallbackParams): Failure {
  if (p.otpType === "recovery" || p.next === RESET_PASSWORD_PATH) {
    return {
      title: "Open the link in the same browser",
      message:
        "Reset links only work in the browser you requested them from. Request a new one here and open it in this browser.",
      primary: { href: "/forgot-password", label: "Send a new reset link" },
    };
  }
  const signIn = p.next ? `/signin?redirect=${encodeURIComponent(p.next)}` : "/signin";
  return {
    title: "Finish signing in here",
    message:
      "This link was opened in a different browser or app from the one you started in, so we could not sign you in automatically. If you were confirming your email address, it is confirmed. Sign in to continue.",
    primary: { href: signIn, label: "Sign in" },
    secondary: { href: "/magic-link-login", label: "Email me a sign-in link" },
  };
}

/** Best-effort follow-ups. None of them may block the redirect. */
function afterSignIn(session: Session, p: AuthCallbackParams, isNewAccount: boolean) {
  const meta = session.user.user_metadata ?? {};

  // Magic link opened on a second device: hand the tokens to the first one,
  // which is polling for them (pages/magic-link-login).
  if (p.pollingId) {
    fetch(`${API_BASE}/auth/cross-device/store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        polling_id: p.pollingId,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      }),
    }).catch(() => {});
  }

  // The sign-up form records consent in user metadata; copy it to the profile.
  if (meta.legal_accepted_at) {
    fetch(`${API_BASE}/auth/store-legal-acceptance`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    }).catch(() => {});
  }

  // Welcome emails once per new account on this browser. The API reads the
  // recipient from the session cookie, not from anything sent here.
  const welcomeKey = `migrent_welcome_sent:${session.user.id}`;
  try {
    if (isNewAccount && !localStorage.getItem(welcomeKey)) {
      localStorage.setItem(welcomeKey, "1");
      fetch("/api/emails/welcome-suite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          userName: meta.full_name || meta.name || session.user.email?.split("@")[0] || "there",
          userRole: meta.type || "seeker",
        }),
      }).catch(() => {});
    }
  } catch {
    // Storage blocked (private window). Skip rather than risk repeats.
  }
}

export default function AuthCallback() {
  const router = useRouter();
  const [failure, setFailure] = useState<Failure | null>(null);
  // Strict Mode runs effects twice in development. A token_hash can only be
  // verified once, so the second run must not start another attempt.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      const p = parseAuthCallback(window.location.href);
      // Tokens must not sit in the address bar, history or a shared screenshot.
      if (window.location.hash) {
        window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      }

      if (p.error) {
        setFailure(linkFailure(p, authErrorMessage(p.error.code, p.error.description)));
        return;
      }

      if (p.tokenHash && p.otpType) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: p.tokenHash, type: p.otpType });
        if (error) {
          setFailure(linkFailure(p, authErrorMessage(error.code, error.message)));
          return;
        }
      } else if (p.tokens) {
        // setSession checks the access token with Supabase before keeping it.
        const { error } = await supabase.auth.setSession({
          access_token: p.tokens.accessToken,
          refresh_token: p.tokens.refreshToken,
        });
        if (error) {
          setFailure(linkFailure(p, authErrorMessage(error.code, error.message)));
          return;
        }
      } else {
        // Returns the result of the client's own ?code= exchange.
        const { error } = await supabase.auth.initialize();
        if (error) {
          setFailure(linkFailure(p, authErrorMessage(error.code, error.message)));
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // A code with no session means this browser never started the flow,
        // so it has no verifier to redeem the code with.
        setFailure(
          p.code
            ? differentBrowserFailure(p)
            : {
                title: "Nothing to sign in with",
                message: "This page finishes a sign-in, but it was opened without a sign-in link.",
                primary: { href: "/signin", label: "Sign in" },
              },
        );
        return;
      }

      const recentlyCreated = isRecentlyCreated(session.user.created_at);
      // A password reset goes straight to the reset form; skip the API wait.
      const isReset = p.otpType === "recovery" || p.next === RESET_PASSWORD_PATH;
      const status = isReset ? null : await withTimeout(checkOnboardingStatus(session.access_token), API_WAIT_MS);
      const onboardingCompleted =
        status && typeof status.onboarding_completed === "boolean" ? status.onboarding_completed : null;

      afterSignIn(session, p, onboardingCompleted === false || recentlyCreated);

      void router.replace(
        postAuthDestination({ next: p.next, otpType: p.otpType, onboardingCompleted, recentlyCreated }),
      );
    };

    run().catch(() => {
      const offline = typeof navigator !== "undefined" && navigator.onLine === false;
      setFailure({
        title: "We could not sign you in",
        message: offline
          ? "You appear to be offline. Reconnect, then open the link again."
          : "Something went wrong finishing your sign-in. Please try again.",
        primary: { href: "/signin", label: "Sign in" },
      });
    });
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8">
          {failure ? (
            <div role="alert">
              <span className="w-12 h-12 rounded-full bg-[var(--color-danger-50)] text-[var(--color-danger-500)] flex items-center justify-center mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <h1 className="font-serif text-[28px] leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)]">
                {failure.title}
              </h1>
              <p className="mt-3 text-[14.5px] text-[var(--color-ink-2)] leading-[1.6]">{failure.message}</p>
              <div className="flex flex-col gap-2 mt-6">
                <Link
                  href={failure.primary.href}
                  className="btn-primary h-[46px] w-full text-[15px] rounded-[10px] inline-flex items-center justify-center"
                >
                  {failure.primary.label}
                </Link>
                {failure.secondary && (
                  <Link
                    href={failure.secondary.href}
                    className="btn-secondary h-[46px] w-full text-[15px] rounded-[10px] inline-flex items-center justify-center"
                  >
                    {failure.secondary.label}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-4" role="status" aria-live="polite">
              <span
                className="w-8 h-8 border-2 border-[var(--color-line-2)] border-t-[var(--color-primary)] rounded-full animate-spin"
                aria-hidden="true"
              />
              <h1 className="font-serif text-[24px] leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)] mt-5">
                Signing you in
              </h1>
              <p className="mt-2 text-[14px] text-[var(--color-ink-3)]">Just a moment.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
