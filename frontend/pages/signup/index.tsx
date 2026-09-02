import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useHCaptcha } from "@hcaptcha/react-hcaptcha/hooks";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import SignInButton from "../../components/SignInButton";
import ConsentCheckboxes from "../../components/legal/ConsentCheckboxes";
import { Logo } from "../../components/ui/Logo";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function SignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState({
    facilitator: false,
    terms: false,
    rentalLaws: false,
    indemnity: false,
  });
  const [consentError, setConsentError] = useState("");
  const { executeInstance, resetInstance } = useHCaptcha() ?? {};

  const allConsented = consents.facilitator && consents.terms && consents.rentalLaws && consents.indemnity;
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [msgTone, setMsgTone] = useState<"error" | "info">("error");

  useEffect(() => {
    if (session) void router.push("/onboarding");
  }, [session, router]);

  if (session) return null;

  const handleSignUp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setMsg("");
    setMsgTone("error");
    setConsentError("");
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "That email address looks incomplete.";
    if (!password) errors.password = "Choose a password.";
    else if (password.length < 8) errors.password = "Use at least 8 characters.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setMsg(Object.values(errors)[0] as string);
      return;
    }
    if (!allConsented) {
      setConsentError("Tick the box to agree to the Terms and Privacy Policy.");
      return;
    }
    setLoading(true);

    try {
      let captchaToken: string | undefined;

      if (executeInstance) {
        const token = await executeInstance();
        captchaToken = token ?? undefined;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            type: "seeker",
            legal_accepted_at: new Date().toISOString(),
            over_18_confirmed_at: new Date().toISOString(),
          },
          ...(captchaToken ? { captchaToken } : {}),
        },
      });

      if (error) {
        const m = error.message.toLowerCase();
        if (m.includes("already registered") || m.includes("already exists")) setMsg("An account with this email already exists. Sign in instead, or reset your password.");
        else if (m.includes("rate limit") || m.includes("too many")) setMsg("Too many attempts. Wait a few minutes and try again.");
        else setMsg(error.message);
      } else if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        // Supabase returns an "obfuscated" user for a duplicate email when
        // confirmations are on. Say so instead of pretending it worked.
        setMsg("An account with this email already exists. Sign in instead, or reset your password.");
      } else if (!data.session) {
        setMsgTone("info");
        setCheckEmail(email.trim());
        setMsg(`Check your email. We sent a confirmation link to ${email.trim()}.`);
      } else {
        void router.push("/onboarding");
      }
    } catch (err) {
      const offline = typeof navigator !== "undefined" && navigator.onLine === false;
      setMsg(offline ? "You appear to be offline. Reconnect and try again." : t("auth.verificationFailed"));
      void err;
    } finally {
      resetInstance?.();
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] min-h-[calc(100vh-60px)] -mt-[60px] lg:mt-0">
      {/* Form panel (left) */}
      <div className="flex items-center justify-center px-6 sm:px-12 lg:px-20 py-14 order-2 lg:order-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[420px]"
        >
          <div className="eyebrow">Create an account</div>
          <h1 className="font-serif text-[44px] sm:text-[48px] leading-[1.05] tracking-[-0.022em] text-[var(--color-ink)] mt-2">
            {t("auth.signUpTitle")}
            <br />
            <span className="text-[color:var(--color-primary)]">MigRent</span>
          </h1>
          <p className="text-[14px] text-[var(--color-ink-2)] mt-1.5">
            Already have an account?{" "}
            <Link href="/signin" className="text-[var(--color-primary)] font-semibold hover:underline underline-offset-[3px]">
              Sign in →
            </Link>
          </p>

          <form onSubmit={handleSignUp} noValidate className="flex flex-col gap-3 mt-6" aria-describedby={msg ? "signup-status" : undefined}>
            <div>
              <label htmlFor="signup-email" className="block text-[12.5px] font-semibold text-[var(--color-ink-2)] mb-1.5">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={fieldErrors.email ? true : undefined}
                aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
                className="input-field"
              />
              {fieldErrors.email && <p id="signup-email-error" className="mt-1 text-[12.5px] text-[var(--color-danger-500)]">{fieldErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-[12.5px] font-semibold text-[var(--color-ink-2)] mb-1.5">Password</label>
              <input
                id="signup-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={fieldErrors.password ? "signup-password-error" : "signup-password-hint"}
                className="input-field"
              />
              {fieldErrors.password ? (
                <p id="signup-password-error" className="mt-1 text-[12.5px] text-[var(--color-danger-500)]">{fieldErrors.password}</p>
              ) : (
                <p id="signup-password-hint" className="mt-1 text-[12px] text-[var(--color-ink-3)]">At least 8 characters. A password manager works here.</p>
              )}
            </div>

            <ConsentCheckboxes
              consents={consents}
              onChange={(c) => { setConsents(c); setConsentError(""); }}
              error={consentError}
            />

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="btn-primary h-[46px] w-full text-[15px] rounded-[10px] mt-1 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  {t("auth.creatingAccount")}
                </span>
              ) : (
                <>
                  Create account
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-[var(--color-ink-3)]">
            <div className="flex-1 h-px bg-[var(--color-line)]" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em]">Or continue with</span>
            <div className="flex-1 h-px bg-[var(--color-line)]" />
          </div>

          {!allConsented && (
            <p className="text-[11.5px] text-center text-[var(--color-ink-3)] mb-3">
              Tick the box above to continue with Google.
            </p>
          )}

          <SignInButton
            redirectTo={typeof window !== "undefined" ? window.location.origin : undefined}
            disabled={!allConsented}
          />

          <div id="signup-status" role={msgTone === "error" ? "alert" : "status"} aria-live={msgTone === "error" ? "assertive" : "polite"} aria-atomic="true">
            {msg && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 text-sm text-center p-3 rounded-[10px] ${
                  msgTone === "info"
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "bg-[#f1d8d4] dark:bg-[#2b1614] text-[var(--color-danger-500)]"
                }`}
              >
                {msg}
                {checkEmail && (
                  <span className="block mt-1 text-[12px] opacity-80">Did not get it? Check spam, or <Link href="/magic-link-login" className="underline">request a new link</Link>.</span>
                )}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Brand panel (right) */}
      <div className="hidden lg:flex flex-col justify-between p-14 bg-[var(--color-primary)] text-[color:var(--color-primary-fg)] order-1 lg:order-2">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Logo size={28} />
          <span className="font-serif text-[24px] leading-none tracking-[-0.012em]">MigRent</span>
        </Link>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] opacity-60">
            Verified hosts across Australia
          </div>
          <h2 className="font-serif text-[56px] leading-[1.02] tracking-[-0.025em] mt-3 text-balance">
            The lease begins<br />
            <span className="opacity-75">at hello.</span>
          </h2>
          <p className="text-[14.5px] opacity-80 mt-4 max-w-[420px] leading-[1.55]">
            MigRent helps people new to Australia find a place to live - without a rental history, a guarantor, or a stack of paperwork.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] opacity-60">
          <span>ID-verified hosts</span>
          <span>·</span>
          <span>Bond lodged properly</span>
          <span>·</span>
          <span>$0 renter fees</span>
        </div>
      </div>
    </div>
  );
}
