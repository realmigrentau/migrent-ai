import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile, ProfileBadges } from "../../hooks/useUserProfile";

interface VerificationCarouselProps {
  profile: UserProfile;
  badges: ProfileBadges;
  onVerifyClick?: () => void;
}

interface VerificationItem {
  icon: string;
  label: string;
  verified: boolean;
  detail: string;
  color: string;
}

export default function VerificationCarousel({ profile, badges, onVerifyClick }: VerificationCarouselProps) {
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);

  const items: VerificationItem[] = [
    {
      icon: "📧",
      label: "Email Verified",
      verified: true, // Users always have verified email (signed up with it)
      detail: "Email address confirmed during registration",
      color: "emerald",
    },
    {
      icon: "🪪",
      label: "Government ID",
      verified: badges.isVerified,
      detail: badges.isVerified
        ? `Identity verified${badges.verifiedLabel ? ` (${badges.verifiedLabel})` : ""}`
        : "Government ID not yet verified",
      color: "rose",
    },
    {
      icon: "📱",
      label: "Phone Verified",
      verified: badges.isVerified,
      detail: badges.isVerified ? "Phone number confirmed" : "Phone not yet verified",
      color: "blue",
    },
  ];

  if (badges.isSuperhost) {
    items.push({
      icon: "⭐",
      label: "Superhost",
      verified: true,
      detail: `Superhost status - ${profile.average_rating.toFixed(1)} rating with ${profile.reviews_count}+ reviews`,
      color: "amber",
    });
  }

  if (profile.rooms_owned > 0 || profile.properties_owned > 0) {
    items.push({
      icon: "🏡",
      label: "Verified Host",
      verified: true,
      detail: `Active host with ${profile.rooms_owned} room${profile.rooms_owned !== 1 ? "s" : ""} listed`,
      color: "indigo",
    });
  }

  // Show all earned badges
  if (profile.badges.length > 0) {
    profile.badges.forEach(badge => {
      if (!items.some(i => i.label === badge)) {
        items.push({
          icon: "🏅",
          label: badge,
          verified: true,
          detail: `Earned the ${badge} badge`,
          color: "amber",
        });
      }
    });
  }

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {items.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!item.verified && onVerifyClick) {
                onVerifyClick();
              } else {
                setSelectedItem(selectedItem?.label === item.label ? null : item);
              }
            }}
            className={`shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all ${
              item.verified
                ? "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-md"
                : "bg-slate-50 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-700 opacity-60"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <div className="text-left">
              <p className={`text-xs font-semibold ${
                item.verified ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
              }`}>
                {item.label}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {item.verified ? (
                  <svg className="w-3 h-3 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className={`text-[10px] ${item.verified ? "text-[var(--color-accent)] dark:text-[var(--color-accent)]" : "text-slate-400"}`}>
                  {item.verified ? "Confirmed" : "Pending"}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Detail popup */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedItem.icon}</span>
                <p className="text-sm text-slate-700 dark:text-slate-200">{selectedItem.detail}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
