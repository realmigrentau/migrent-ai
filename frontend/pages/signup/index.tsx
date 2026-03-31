import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useHCaptcha } from "@hcaptcha/react-hcaptcha/hooks";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import SignInButton from "../../components/SignInButton";
import ConsentCheckboxes from "../../components/legal/ConsentCheckboxes";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

  if (session) {
    router.push("/onboarding");
    return null;
  }

  const handleSignUp = async () => {
    setMsg("");
    setConsentError("");
    if (!email || !password) {
      setMsg(t("auth.enterEmailPassword"));
      return;
    }
    if (password.length < 6) {
      setMsg(t("auth.passwordMinLength"));
      return;
    }
    if (!allConsented) {
      setConsentError("You must accept all legal acknowledgements to create an account.");
      return;
    }
    setLoading(true);

    try {
      let captchaToken: string | undefined;

      if (executeInstance) {
        const token = await executeInstance();
        captchaToken = token ?? undefined;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            type: "seeker",
            legal_accepted_at: new Date().toISOString(),
          },
          ...(captchaToken ? { captchaToken } : {}),
        },
      });

      if (error) {
        setMsg(error.message);
      } else {
        // Send verification code via our backend
        try {
          await fetch(`${API_BASE}/codes/send-signup-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
        } catch {
          // Code sending is best-effort
        }
        // Redirect to code entry page
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
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
      <div className="fixed top-20 left-20 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="card p-8 rounded-2xl">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent rounded-t-2xl" />

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
              M
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("auth.signUpTitle")} <span className="gradient-text">{t("auth.signUpAccent")}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{t("auth.signUpSubtitle")}</p>
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
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
              />
            </div>

            <ConsentCheckboxes
              consents={consents}
              onChange={(c) => { setConsents(c); setConsentError(""); }}
              error={consentError}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignUp}
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("auth.creatingAccount")}
                </span>
              ) : (
                t("auth.signUp")
              )}
            </motion.button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {t("auth.hasAccount")}{" "}
              <Link href="/signin" className="text-rose-500 hover:text-rose-600 font-semibold transition-colors">
                {t("auth.signInLink")}
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

            {!allConsented && (
              <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                Please accept all legal acknowledgements above before using social sign-up.
              </p>
            )}

            <SignInButton
              redirectTo={typeof window !== "undefined" ? window.location.origin : undefined}
              disabled={!allConsented}
            />

            <Link
              href="/magic-link-signup"
              className="block w-full text-center btn-secondary py-3 rounded-xl text-sm"
            >
              {t("auth.magicLinkSignUp")}
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
