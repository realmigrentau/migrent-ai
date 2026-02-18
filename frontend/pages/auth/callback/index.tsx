import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { motion } from "framer-motion";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    // Supabase appends auth tokens as a hash fragment after magic link click.
    // The JS client picks them up automatically via onAuthStateChange,
    // but we call getSession() to ensure the session is established.
    const handleCallback = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (session) {
        router.replace("/onboarding");
        return;
      }

      // If no session yet, wait a moment — the hash might still be processing
      // Listen for auth state change as a fallback
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          subscription.unsubscribe();
          router.replace("/onboarding");
        }
      });

      // Timeout after 5 seconds if nothing happens
      setTimeout(() => {
        subscription.unsubscribe();
        setError("The magic link may have expired or already been used. Please request a new one.");
      }, 5000);
    };

    handleCallback();
  }, [router]);

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
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent rounded-t-2xl" />

          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
              M
            </div>

            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Link expired or invalid
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {error}
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/magic-link-login"
                    className="block w-full text-center py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                  >
                    Request a new login link
                  </Link>
                  <Link
                    href="/magic-link-signup"
                    className="block w-full text-center btn-secondary py-3 rounded-xl text-sm"
                  >
                    Request a new sign-up link
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mx-auto">
                  <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Verifying your email...
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Just a moment while we sign you in.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
