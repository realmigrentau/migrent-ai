import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Set a new password after following the reset link.
 *
 * Supabase turns the recovery link into a session automatically, so by the
 * time this page mounts the user is signed in and updateUser can set the new
 * password. If they land here without following a link there is no session,
 * and we say so rather than showing a form that cannot work.
 */
export default function ResetPassword() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // The recovery token arrives in the URL fragment and Supabase exchanges it
    // for a session asynchronously, so check the current session and also
    // listen for PASSWORD_RECOVERY rather than reading it once.
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    const timer = setTimeout(() => {
      if (!cancelled) setReady((prev) => (prev === null ? false : prev));
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Both passwords need to match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || "Could not update the password. Try the link again.");
      return;
    }
    setDone(true);
    setTimeout(() => router.replace("/dashboard"), 2500);
  };

  return (
    <>
      <Head>
        <title>Set a new password | MigRent</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8">
            {done ? (
              <>
                <span className="w-12 h-12 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <h1 className="font-serif text-[28px] leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)]">
                  Password updated
                </h1>
                <p className="mt-3 text-[14.5px] text-[var(--color-ink-2)] leading-[1.6]">
                  You are signed in. Taking you to your dashboard.
                </p>
              </>
            ) : ready === false ? (
              <>
                <h1 className="font-serif text-[28px] leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)]">
                  This link has expired
                </h1>
                <p className="mt-3 text-[14.5px] text-[var(--color-ink-2)] leading-[1.6]">
                  Reset links last one hour and can only be used once. Request a
                  fresh one and it will work.
                </p>
                <Link
                  href="/forgot-password"
                  className="btn-primary h-[46px] w-full text-[15px] rounded-[10px] mt-6 inline-flex items-center justify-center"
                >
                  Send a new link
                </Link>
              </>
            ) : ready === null ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-[var(--color-line-2)] border-t-[var(--color-primary)] rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <span className="w-12 h-12 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mb-5">
                  <KeyRound className="w-5 h-5" />
                </span>
                <h1 className="font-serif text-[28px] leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)]">
                  Set a new password
                </h1>
                <p className="mt-3 text-[14.5px] text-[var(--color-ink-2)] leading-[1.6]">
                  Pick something you have not used on another site.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <label className="block">
                    <span className="eyebrow">New password</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field mt-1.5"
                      placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? "reset-password-error" : undefined}
                      autoFocus
                    />
                  </label>

                  <label className="block">
                    <span className="eyebrow">Confirm new password</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="input-field mt-1.5"
                      aria-invalid={error ? true : undefined}
                    />
                  </label>

                  {error && (
                    <p
                      id="reset-password-error"
                      role="alert"
                      className="text-[13.5px] text-[var(--color-danger-500)]"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary h-[46px] w-full text-[15px] rounded-[10px] disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save new password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
