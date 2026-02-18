import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";

export default function MagicLinkLogin() {
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (session) {
    router.push("/onboarding");
    return null;
  }

  const handleSendLink = async () => {
    setMsg("");
    if (!email) {
      setMsg("Please enter your email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setMsg(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
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
              Sign in to <span className="gradient-text-accent">MigRent</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              {sent
                ? "Check your inbox for the magic link."
                : "Enter your email and we\u2019ll send you a login link."}
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Login link sent to
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {email}
                </p>
                <p className="text-xs text-emerald-500 dark:text-emerald-500 mt-2">
                  Click the link in the email to sign in. No password needed.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSent(false); setMsg(""); }}
                className="w-full btn-secondary py-3 rounded-xl text-sm"
              >
                Try a different email
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field focus:!border-blue-500 focus:!shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  onKeyDown={(e) => e.key === "Enter" && handleSendLink()}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendLink}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending link...
                  </span>
                ) : (
                  "Send magic link"
                )}
              </motion.button>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link href="/magic-link-signup" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                  Sign up with magic link
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
                href="/signin"
                className="block w-full text-center btn-secondary py-3 rounded-xl text-sm"
              >
                Sign in with password instead
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
