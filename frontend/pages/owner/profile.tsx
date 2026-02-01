import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

export default function OwnerProfilePage() {
  const { session, user, loading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    phone: "",
    notifyEmail: true,
    notifySms: false,
  });

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
      }));
    }
  }, [user]);

  const update = (key: string, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
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
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign in to manage your owner profile.</p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Owner <span className="gradient-text-accent">Profile</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Your profile is shown to seekers when they view your listings.
        </p>
      </motion.div>

      {/* Verification status */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-subtle p-4 rounded-xl"
      >
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Verification badges</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            ✓ Email verified
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            ✓ Identity verified
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ○ Property not verified
          </span>
        </div>
      </motion.section>

      {/* Profile photo + name */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile information</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
            {profile.name ? profile.name[0].toUpperCase() : "O"}
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Profile photo (coming soon)</p>
            <button disabled className="text-xs text-rose-500 opacity-50 mt-1 cursor-not-allowed">Upload photo</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Display name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="e.g. Local Surry Hills owner. I keep my properties well-maintained..."
            rows={3}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contact phone (optional)</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="e.g. 0412 345 678"
            className="input-field"
          />
        </div>
      </motion.section>

      {/* Past reviews (future) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-6 rounded-2xl"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tenant reviews</h2>
        <div className="text-center py-6">
          <svg className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet. Reviews will appear after completed deals.</p>
        </div>
      </motion.section>

      {/* Settings */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification settings</h2>
        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
          <span className="text-sm text-slate-700 dark:text-slate-300">Email notifications for new applicants</span>
          <input
            type="checkbox"
            checked={profile.notifyEmail}
            onChange={(e) => update("notifyEmail", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500"
          />
        </label>
        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
          <span className="text-sm text-slate-700 dark:text-slate-300">SMS notifications (coming soon)</span>
          <input
            type="checkbox"
            checked={profile.notifySms}
            onChange={(e) => update("notifySms", e.target.checked)}
            disabled
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500 opacity-50"
          />
        </label>
        <div className="card-subtle p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Payout details</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Payout setup via Stripe will be available for future deals. All rent is arranged directly between you and the tenant.
          </p>
        </div>
      </motion.section>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="btn-primary py-3 px-8 rounded-xl text-sm font-bold disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : saved ? (
            "✓ Saved"
          ) : (
            "Save profile"
          )}
        </motion.button>
        {saved && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-emerald-600 dark:text-emerald-400 mt-3"
          >
            Profile saved successfully.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
