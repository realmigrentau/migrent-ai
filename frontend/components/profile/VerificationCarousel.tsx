import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, IdCard, Mail, Smartphone, Star, type LucideIcon } from "lucide-react";
import { UserProfile, ProfileBadges } from "../../hooks/useUserProfile";

interface VerificationCarouselProps {
  profile: UserProfile;
  badges: ProfileBadges;
  onVerifyClick?: () => void;
}

interface VerificationItem {
  icon: LucideIcon;
  label: string;
  verified: boolean;
  detail: string;
  color: string;
}

export default function VerificationCarousel({ profile, badges, onVerifyClick }: VerificationCarouselProps) {
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);

  // Every line here reflects a check the platform actually performed,
  // read from owner_verification through the public_profiles view. Email is
  // no longer assumed, phone is no longer inferred from the ID check, and
  // "Verified Host" (which used to mean "has a listing") is gone.
  const items: VerificationItem[] = [
    {
      icon: Mail,
      label: "Email confirmed",
      verified: profile.email_verified,
      detail: profile.email_verified ? "Email address confirmed" : "Email not yet confirmed",
      color: "emerald",
    },
    {
      icon: IdCard,
      label: "Government ID",
      verified: profile.government_id_status === "approved",
      detail:
        profile.government_id_status === "approved"
          ? `Government ID checked by Migrent${badges.verifiedLabel ? ` (${badges.verifiedLabel})` : ""}`
          : profile.government_id_status === "pending"
            ? "Submitted, awaiting review"
            : profile.government_id_status === "rejected"
              ? "Last submission was not accepted"
              : "Government ID not submitted",
      color: "rose",
    },
    {
      icon: Smartphone,
      label: "Phone confirmed",
      verified: profile.phone_verified,
      detail: profile.phone_verified ? "Phone number confirmed by SMS code" : "Phone not yet confirmed",
      color: "blue",
    },
  ];

  if (badges.isHighlyRated) {
    items.push({
      icon: Star,
      label: "Highly rated",
      verified: true,
      detail: `${profile.average_rating.toFixed(1)} average from ${profile.reviews_count} reviews`,
      color: "amber",
    });
  }

  // Show all earned badges
  if (profile.badges.length > 0) {
    profile.badges.forEach(badge => {
      if (!items.some(i => i.label === badge)) {
        items.push({
          icon: Award,
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
            type="button"
            className={`shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all ${
              item.verified
                ? "bg-[var(--color-surface)] border-[var(--color-line)] hover:border-[var(--color-line-2)]"
                : "bg-[var(--color-surface)] border-dashed border-[var(--color-line-2)] dark:border-[var(--color-line)] opacity-60"
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0 text-[var(--color-ink-2)]" strokeWidth={1.9} aria-hidden="true" />
            <div className="text-left">
              <p className={`text-xs font-semibold ${
                item.verified ? "text-[var(--color-ink)]" : "text-[var(--color-ink-3)]"
              }`}>
                {item.label}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {item.verified ? (
                  <svg className="w-3 h-3 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className={`text-[10px] ${item.verified ? "text-[var(--color-accent)] dark:text-[var(--color-accent)]" : "text-[var(--color-ink-3)]"}`}>
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
            <div className="mt-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-line)]">
              <div className="flex items-center gap-2">
                <selectedItem.icon className="h-4 w-4 shrink-0 text-[var(--color-ink-3)]" aria-hidden="true" />
                <p className="text-sm text-[var(--color-ink-2)]">{selectedItem.detail}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
