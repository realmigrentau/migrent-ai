import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import ConsentCheckboxes from "../../components/legal/ConsentCheckboxes";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function generatePollingId(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export default function MagicLinkSignup() {
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const pollingIdRef = useRef<string>("");
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [consents, setConsents] = useState({
    facilitator: false,
    terms: false,
    rentalLaws: false,
    indemnity: false,
  });
  const [consentError, setConsentError] = useState("");

  const allConsented = consents.facilitator && consents.terms && consents.rentalLaws && consents.indemnity;

  // Redirect if already logged in
  useEffect(() => {
    if (session) router.push("/onboarding");
  }, [session, router]);

  // Poll for cross-device login when in "sent" state
  useEffect(() => {
    if (!sent || !pollingIdRef.current) return;

    const pollForSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/cross-device/poll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ polling_id: pollingIdRef.current }),
        });
        const data = await res.json();

        if (data.status === "ready" && data.access_token && data.refresh_token) {
          // Set the session on this device using the tokens from the other device
          await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          router.push("/onboarding");
        } else if (data.status === "expired") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch {
        // Silently retry on next interval
      }
    };

    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(pollForSession, 3000);

    // Stop polling after 5 minutes
    const timeout = setTimeout(() => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }, 5 * 60 * 1000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      clearTimeout(timeout);
    };
  }, [sent, router]);

  const handleSendLink = async () => {
    setMsg("");
    setConsentError("");
    if (!email) {
      setMsg("Please enter your email address.");
      return;
    }
    if (!allConsented) {
      setConsentError("You must accept all legal acknowledgements to create an account.");
      return;
    }
    setLoading(true);

    // Generate a polling ID for cross-device login
    const pollingId = generatePollingId();
    pollingIdRef.current = pollingId;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?polling_id=${pollingId}`,
        data: {
          type: "seeker",
          legal_accepted_at: new Date().toISOString(),
        },
      },
    });
    if (error) {
      setMsg(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (session) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-8 rounded-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold text-lg mx-auto mb-4">
              M
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Sign up to MigRent
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              {sent
                ? "Check your inbox for the magic link."
                : "Enter your email and we'll send you a sign-up link."}
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-[var(--color-accent)] dark:text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                  Magic link sent to
                </p>
                <p className="text-sm text-[var(--color-accent)] dark:text-[var(--color-accent)] font-mono mt-1">
                  {email}
                </p>
                <p className="text-xs text-[var(--color-accent)] dark:text-[var(--color-accent)] mt-2">
                  Click the link in the email to create your account and sign in.
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400 dark:text-slate-500">
                  <span className="w-3 h-3 border-2 border-slate-300 dark:border-slate-600 border-t-[var(--color-accent)] rounded-full animate-spin" />
                  Waiting for verification...
                </div>
              </div>

              <button
                onClick={() => { setSent(false); setMsg(""); pollingIdRef.current = ""; }}
                className="w-full btn-secondary py-2.5 rounded-[10px] text-sm"
              >
                Send again with a different email
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  onKeyDown={(e) => e.key === "Enter" && handleSendLink()}
                />
              </div>

              <ConsentCheckboxes
                consents={consents}
                onChange={(c) => { setConsents(c); setConsentError(""); }}
                error={consentError}
              />

              <button
                onClick={handleSendLink}
                disabled={loading}
                className="w-full h-10 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending link...
                  </span>
                ) : (
                  "Send magic link"
                )}
              </button>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link href="/magic-link-login" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] font-semibold transition-colors">
                  Sign in with magic link
                </Link>
              </p>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-full">or</span>
                </div>
              </div>

              <Link
                href="/signup"
                className="block w-full text-center btn-secondary py-3 rounded-xl text-sm"
              >
                Sign up with password instead
              </Link>

              {msg && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-center p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                >
                  {msg}
                </motion.p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
