import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { refreshBadges } from "../../lib/api";
import DashboardLayout from "../../components/DashboardLayout";
import ProfileForm from "../../components/shared/ProfileForm";
import VerificationSummaryCard from "../../components/shared/VerificationSummaryCard";

const OWNER_BADGES = [
  { id: "first_sale", label: "First Keys", desc: "Your first official rent to a person of a room/property", icon: "🔑", key: "Verified host" },
  { id: "property_mogul", label: "Property Mogul", desc: "Own more than 3 properties", icon: "🏘️", key: "property_mogul" },
  { id: "superhost", label: "Superhost", desc: "3+ published listings", icon: "⭐", key: "Superhost" },
  { id: "mega_host", label: "Mega Host", desc: "You have hosted for over a year", icon: "🏆", key: "mega_host" },
  { id: "the_trusted", label: "The Trusted", desc: "You have a 4.9-5 rating in reviews", icon: "🛡️", key: "the_trusted" },
  { id: "the_friendly", label: "The Friendly One", desc: "You offer discounts to users who have completed a requirement", icon: "🤝", key: "the_friendly" },
];

export default function OwnerProfilePage() {
  const { session, loading } = useAuth();
  const { profile, loading: loadingProfile, saving, update, uploadPhoto } = useProfile();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" }>({ text: "", type: "info" });

  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "info" }), 4000);
  };

  const earnedBadgeKeys = profile?.badges || [];

  if (loading || loadingProfile)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--color-line-2)] dark:border-[var(--color-primary-soft)] border-t-[var(--color-ink)] rounded-full animate-spin" />
      </div>
    );

  if (!session)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-[var(--color-ink)] mb-2">Sign in required</h2>
        <p className="text-sm text-[var(--color-ink-3)] mb-4">Sign in to manage your owner profile.</p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
      </div>
    );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
            Owner Profile
          </h1>
          <p className="text-sm text-[var(--color-ink-3)] mt-2">
            Your profile is shown to seekers when they view your listings.
          </p>
        </motion.div>

        {/* Toast message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-xl text-sm border ${
                message.type === "success"
                  ? "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] text-[var(--color-accent)] dark:text-[var(--color-accent)]"
                  : message.type === "error"
                  ? "bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-50)]0/10 border-[var(--color-danger-500)]/30 dark:border-[var(--color-danger-500)]/20 text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]"
                  : "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 border-[var(--color-primary-100)] dark:border-[var(--color-primary)]/20 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <VerificationSummaryCard profile={profile} />
        </motion.div>

        {/* Owner Badges */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card p-6 rounded-2xl space-y-4"
        >
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Badges</h2>
          <p className="text-sm text-[var(--color-ink-3)]">Earn badges as you host on MigRent.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {OWNER_BADGES.map((badge) => {
              const earned = earnedBadgeKeys.includes(badge.key);
              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-xl border text-center transition-all ${
                    earned
                      ? "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 border-[var(--color-primary-100)] dark:border-[var(--color-primary)]/20"
                      : "bg-[var(--color-surface)] border-[var(--color-line)] opacity-50"
                  }`}
                >
                  <div className="text-2xl mb-1.5">{badge.icon}</div>
                  <h4 className={`text-sm font-semibold ${earned ? "text-[var(--color-primary)] dark:text-[var(--color-primary)]" : "text-[var(--color-ink-3)]"}`}>
                    {badge.label}
                  </h4>
                  <p className="text-[11px] text-[var(--color-ink-3)] mt-0.5 leading-tight">{badge.desc}</p>
                  {earned && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[var(--color-accent)] text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Shared Profile Form - same data as settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ProfileForm
            profile={profile}
            saving={saving}
            onSave={update}
            onUploadPhoto={uploadPhoto}
            showMessage={showMessage}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
