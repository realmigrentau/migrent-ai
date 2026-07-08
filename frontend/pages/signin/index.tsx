import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useHCaptcha } from "@hcaptcha/react-hcaptcha/hooks";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import SignInButton from "../../components/SignInButton";
import SEOHead from "../../components/SEOHead";
import { Logo } from "../../components/ui/Logo";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function SignIn() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { executeInstance, resetInstance } = useHCaptcha() ?? {};

  // Get redirect URL from query params (e.g., /signin?redirect=/dashboard)
  // Default to /dashboard for returning users
  const redirectUrl = typeof router.query.redirect === "string" ? router.query.redirect : "/dashboard";

  useEffect(() => {
    if (session) {
      router.push(redirectUrl);
    }
  }, [session, redirectUrl, router]);

  if (session) {
    return null;
  }

  const handleLogin = async () => {
    setMsg("");
    if (!email || !password) {
      setMsg(t("auth.enterEmailPassword"));
      return;
    }
    setLoading(true);

    try {
      let captchaToken: string | undefined;

      if (executeInstance) {
        const token = await executeInstance();
        captchaToken = token ?? undefined;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });

      if (error) {
        setMsg(error.message);
      } else {
        router.push(redirectUrl);
      }
    } catch {
      setMsg(t("auth.verificationFailed"));
    } finally {
      resetInstance?.();
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Sign in"
        description="Sign in to MigRent to find verified rooms, manage listings, and message hosts across Australia."
        noIndex
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] min-h-[calc(100vh-60px)] -mt-[60px] lg:mt-0">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-14 bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]">
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
          <span>Bond held in escrow</span>
          <span>·</span>
          <span>$0 renter fees</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 sm:px-12 lg:px-20 py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[400px]"
        >
          <div className="eyebrow">Sign in</div>
          <h1 className="font-serif text-[44px] sm:text-[48px] leading-[1.05] tracking-[-0.022em] text-[var(--color-ink)] mt-2">
            {t("auth.signInTitle")}
            <br />
            <span className="text-[color:var(--color-primary)]">MigRent</span>
          </h1>
          <p className="text-[14px] text-[var(--color-ink-2)] mt-1.5">
            New here?{" "}
            <Link href="/signup" className="text-[var(--color-primary)] font-semibold hover:underline underline-offset-[3px]">
              Create an account →
            </Link>
          </p>

          <div className="flex flex-col gap-3.5 mt-8">
            <label className="block">
              <div className="text-[12.5px] font-semibold text-[var(--color-ink-2)] mb-1.5">Email</div>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-semibold text-[var(--color-ink-2)] mb-1.5">Password</div>
              <input
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </label>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-[var(--color-ink-2)] cursor-pointer">
                <input type="checkbox" defaultChecked style={{ accentColor: "var(--color-primary)" }} />
                Remember this device
              </label>
              <Link href="/magic-link-login" className="text-[13px] font-semibold text-[var(--color-primary)] hover:underline underline-offset-[3px]">
                Forgot password?
              </Link>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary h-[46px] w-full text-[15px] rounded-[10px] mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("auth.signingIn")}
                </span>
              ) : (
                <>
                  Sign in
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 my-6 text-[var(--color-ink-3)]">
            <div className="flex-1 h-px bg-[var(--color-line)]" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em]">Or continue with</span>
            <div className="flex-1 h-px bg-[var(--color-line)]" />
          </div>

          <SignInButton redirectTo={typeof window !== "undefined" ? window.location.origin : undefined} />

          {msg && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 text-sm text-center p-3 rounded-[10px] ${
                msg.includes("Check your email")
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "bg-[#f1d8d4] dark:bg-[#2b1614] text-[var(--color-danger-500)]"
              }`}
            >
              {msg}
            </motion.p>
          )}

          <p className="mt-8 text-[11.5px] text-[var(--color-ink-3)] leading-[1.5]">
            By continuing you agree to our{" "}
            <Link href="/terms-of-service" className="underline underline-offset-2">Terms</Link> and{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2">Privacy Policy</Link>. MigRent never asks for bond outside the platform.
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
}
