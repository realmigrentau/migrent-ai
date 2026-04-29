import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useHCaptcha } from "@hcaptcha/react-hcaptcha/hooks";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import SignInButton from "../../components/SignInButton";

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
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-8 rounded-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white font-semibold text-lg mx-auto mb-4">
              M
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {t("auth.signInTitle")} {t("auth.signInAccent")}
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
                className="input-field"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-10 rounded-[10px] text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("auth.signingIn")}
                </span>
              ) : (
                t("auth.signIn")
              )}
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {t("auth.noAccount")}{" "}
              <Link href="/signup" className="text-rose-500 hover:text-rose-600 font-semibold transition-colors">
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
