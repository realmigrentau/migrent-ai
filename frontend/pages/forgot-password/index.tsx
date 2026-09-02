import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { FRONTEND_BASE_URL } from "../../lib/apiBase";

/**
 * Password reset request.
 *
 * There was no reset flow at all before this page existed. The sign-in page
 * showed a "Forgot password?" link that went to /magic-link-login instead, and
 * the help centre documented a reset email that was never implemented, so
 * anyone who forgot their password was locked out of the account permanently.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter the email address you signed up with.");
      return;
    }
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${FRONTEND_BASE_URL}/reset-password` }
    );

    setLoading(false);

    // Deliberately show the same confirmation whether or not the address is
    // registered. Saying "no account found" would turn this form into a way to
    // test which email addresses have MigRent accounts.
    if (resetError && resetError.status !== 400) {
      setError("We could not send the email just now. Please try again shortly.");
      return;
    }
    setSent(true);
  };

  return (
    <>
      <Head>
        <title key="title">Reset your password | MigRent</title>
        <meta key="robots" name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8">
            {sent ? (
              <>
                <span className="w-12 h-12 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mb-5">
                  <Mail className="w-5 h-5" />
                </span>
                <h1 className="font-serif text-[28px] leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)]">
                  Check your email
                </h1>
                <p className="mt-3 text-[14.5px] text-[var(--color-ink-2)] leading-[1.6]">
                  If an account exists for <strong>{email.trim()}</strong>, we have sent a
                  link to set a new password. It expires in one hour.
                </p>
                <p className="mt-3 text-[13px] text-[var(--color-ink-3)] leading-[1.6]">
                  Nothing arriving? Check your spam folder, or{" "}
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="text-[var(--color-primary)] font-semibold hover:underline underline-offset-[3px]"
                  >
                    try a different address
                  </button>
                  .
                </p>
                <Link
                  href="/signin"
                  className="mt-7 inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-primary)] hover:underline underline-offset-[3px]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </>
            ) : (
              <>
                <div className="eyebrow mb-3">Account recovery</div>
                <h1 className="font-serif text-[28px] leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)]">
                  Reset your password
                </h1>
                <p className="mt-3 text-[14.5px] text-[var(--color-ink-2)] leading-[1.6]">
                  Enter your email address and we will send you a link to set a new one.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <label className="block">
                    <span className="eyebrow">Email</span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field mt-1.5"
                      placeholder="you@example.com"
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? "forgot-password-error" : undefined}
                      autoFocus
                    />
                  </label>

                  {error && (
                    <p
                      id="forgot-password-error"
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
                    {loading ? "Sending..." : "Send reset link"}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-[var(--color-line)] flex flex-col gap-2">
                  <Link
                    href="/signin"
                    className="text-[13.5px] font-semibold text-[var(--color-primary)] hover:underline underline-offset-[3px]"
                  >
                    Back to sign in
                  </Link>
                  <Link
                    href="/magic-link-login"
                    className="text-[13.5px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    Or sign in with a one-time link instead
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
