import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useHCaptcha } from "@hcaptcha/react-hcaptcha/hooks";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import SignInButton from "../../components/SignInButton";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function SignIn() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending2FA, setPending2FA] = useState(false);
  const { executeInstance, resetInstance } = useHCaptcha() ?? {};

  // Get redirect URL from query params (e.g., /signin?redirect=/dashboard)
  // Default to /dashboard for returning users
  const redirectUrl = typeof router.query.redirect === "string" ? router.query.redirect : "/dashboard";

  useEffect(() => {
    if (session && !pending2FA) {
      router.push(redirectUrl);
    }
  }, [session, redirectUrl, router, pending2FA]);

  if (session && !pending2FA) {
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
      // Check if user has 2FA enabled
      const twoFaRes = await fetch(`${API_BASE}/codes/2fa-status?email=${encodeURIComponent(email)}`);
      const twoFaData = await twoFaRes.json();

      if (twoFaData.two_factor_enabled) {
        // Validate password via backend API (does NOT create a client-side session)
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!loginRes.ok) {
          const loginData = await loginRes.json().catch(() => ({}));
          setMsg(loginData.detail || "Invalid email or password");
          setLoading(false);
          return;
        }

        // Password is valid - send 2FA code (no client session was created)
        setPending2FA(true);

        const codeRes = await fetch(`${API_BASE}/codes/send-2fa-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!codeRes.ok) {
          setMsg("Failed to send 2FA code. Please try again.");
          setPending2FA(false);
          setLoading(false);
          return;
        }

        // Redirect to 2FA verification page
        const params = new URLSearchParams({ email, p: password });
        router.push(`/verify-2fa?${params.toString()}`);
        return;
      }

      // No 2FA - normal sign in
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
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      {/* Floating shapes */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="card p-8 rounded-2xl">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent rounded-t-2xl" />

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
              M
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("auth.signInTitle")} <span className="gradient-text-accent">{t("auth.signInAccent")}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{t("auth.signInSubtitle")}</p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field focus:!border-blue-500 focus:!shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field focus:!border-blue-500 focus:!shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("auth.signingIn")}
                </span>
              ) : (
                t("auth.signIn")
              )}
            </motion.button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {t("auth.noAccount")}{" "}
              <Link href="/signup" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                {t("auth.signUpLink")}
              </Link>
            </p>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-full">{t("auth.or")}</span>
              </div>
            </div>

            <SignInButton redirectTo={typeof window !== "undefined" ? window.location.origin : undefined} />

            <Link
              href="/magic-link-login"
              className="block w-full text-center btn-secondary py-3 rounded-xl text-sm"
            >
              {t("auth.magicLinkSignIn")}
            </Link>

            {msg && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm text-center p-3 rounded-xl ${
                  msg.includes("Check your email")
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                }`}
              >
                {msg}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
