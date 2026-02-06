import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

export default function OwnerSetupPage() {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
  });

  // If already an owner, redirect to dashboard
  useEffect(() => {
    if (!loading && user?.user_metadata?.owner_account === true) {
      router.replace("/dashboard/owner");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
      }));
    }
  }, [user]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await supabase.auth.updateUser({
        data: {
          owner_account: true,
          full_name: form.name,
        },
      });
      router.push("/dashboard/owner");
    } catch {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  if (!session)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign in first to create an owner account.</p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
      </div>
    );

  // Already redirecting
  if (user?.user_metadata?.owner_account === true) return null;

  return (
    <div className="max-w-lg mx-auto py-12">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="card p-8 rounded-2xl text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Become an <span className="gradient-text-accent">Owner</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
              List your rooms, find verified tenants, and manage everything in one place.
              MigRent only charges a one-time AUD 99 fee on successful matches.
            </p>

            <div className="space-y-3 text-left mb-8">
              {[
                "List rooms with photos, pricing, and house rules",
                "Get AI-matched with verified seekers",
                "Review applicant profiles and trust scores",
                "Earn badges as you host",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-blue-500 mt-0.5 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {text}
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(2)}
              className="btn-primary py-3 px-8 rounded-xl text-sm font-bold w-full"
            >
              Get Started
            </motion.button>

            <Link
              href="/dashboard/seeker"
              className="block text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mt-4 transition-colors"
            >
              Not an owner? Go to seeker dashboard
            </Link>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="card p-8 rounded-2xl"
          >
            <button
              onClick={() => setStep(1)}
              className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mb-4 flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              Set up your owner profile
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This info will be shown to seekers on your listings.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Display name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contact phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. 0412 345 678"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Short bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="e.g. Local property owner in Surry Hills. I keep my places well-maintained..."
                  rows={3}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={saving || !form.name.trim()}
              className="btn-primary py-3 px-8 rounded-xl text-sm font-bold w-full mt-6 disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Owner Account"
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
