import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { authCallbackUrl } from "../lib/authRedirect";
import { motion } from "framer-motion";

interface SignInButtonProps {
  /** Where to land after Google, e.g. "/onboarding". Defaults to the dashboard. */
  next?: string;
  disabled?: boolean;
}

export default function SignInButton({ next, disabled }: SignInButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  // Coming Back from Google restores this page from the back/forward cache
  // with the button still marked pending. Re-enable it.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setPending(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const handleGoogleSignIn = async () => {
    if (pending) return;
    setPending(true);
    setError("");
    // Built at click time from the page's own origin: Google must return the
    // person to the browser and host that holds this sign-in's PKCE verifier.
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: authCallbackUrl(window.location.origin, next) },
    });
    // On success the browser is already leaving for Google.
    if (oauthError) {
      setPending(false);
      setError("Google sign-in is not available right now. Use your email and password, or try again shortly.");
    }
  };

  return (
    <>
      <motion.button
        type="button"
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
        onClick={handleGoogleSignIn}
        disabled={disabled || pending}
        aria-busy={pending}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-line)] text-sm font-semibold text-[var(--color-ink-2)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-muted)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </motion.button>
      {error && (
        <p role="alert" className="mt-2 text-[12.5px] text-center text-[var(--color-danger-500)]">
          {error}
        </p>
      )}
    </>
  );
}
