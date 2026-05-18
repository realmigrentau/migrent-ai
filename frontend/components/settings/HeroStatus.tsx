import { motion } from "framer-motion";
import { Shield, Phone, Rocket, Calculator, Check } from "lucide-react";
import type { SettingsTab, ProfileData } from "../../hooks/useSettingsData";

interface HeroStatusProps {
  displayName: string;
  profile: ProfileData | null;
  verificationProgress: { percentage: number; steps: { label: string; done: boolean; icon: string }[] };
  isOwner: boolean;
  setActiveTab: (tab: SettingsTab) => void;
}

export default function HeroStatus({
  displayName,
  profile,
  verificationProgress,
  isOwner,
  setActiveTab,
}: HeroStatusProps) {
  const percentage = verificationProgress.percentage;

  const quickActions = [
    {
      label: profile?.phone ? "Phone" : "Verify phone",
      sub: profile?.phone ? "Done" : "Required",
      done: !!profile?.phone,
      icon: Phone,
      tab: "verification" as SettingsTab,
    },
    {
      label: profile?.identity_verified ? "ID verified" : "ID check",
      sub: profile?.identity_verified ? "Done" : "Required",
      done: !!profile?.identity_verified,
      icon: Shield,
      tab: "verification" as SettingsTab,
    },
    {
      label: isOwner ? "List a room" : "Find a room",
      sub: "Go",
      done: false,
      icon: Rocket,
      tab: "profile" as SettingsTab,
      href: isOwner ? "/owner/listings/new" : "/seeker/search",
    },
    {
      label: "Calculator",
      sub: "Go",
      done: false,
      icon: Calculator,
      tab: "analytics" as SettingsTab,
      href: "/pricing",
    },
  ];

  // Circle math for verification ring
  const r = 36;
  const c = 2 * Math.PI * r;
  const ringColor = percentage >= 80 ? "var(--color-accent)" : "var(--color-primary)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-7 md:px-8 md:py-9"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-7">
        {/* Greeting */}
        <div className="flex-1">
          <div className="eyebrow mb-1.5">Welcome back</div>
          <h1 className="font-serif text-[34px] md:text-[44px] leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]">
            {displayName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {profile?.email && (
              <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full text-[11.5px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Check className="w-2.5 h-2.5" strokeWidth={2.6} /> Email verified
              </span>
            )}
            {isOwner && (
              <span className="inline-flex items-center h-[22px] px-2 rounded-full text-[11.5px] font-semibold bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                Owner
              </span>
            )}
          </div>
        </div>

        {/* Verification ring */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="relative w-[88px] h-[88px]">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle
                cx="44"
                cy="44"
                r={r}
                fill="none"
                stroke="var(--color-line)"
                strokeWidth="6"
              />
              <circle
                cx="44"
                cy="44"
                r={r}
                fill="none"
                stroke={ringColor}
                strokeWidth="6"
                strokeDasharray={`${(percentage / 100) * c} ${c}`}
                strokeLinecap="round"
                transform="rotate(-90 44 44)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-[22px] text-[var(--color-ink)] tracking-[-0.02em] tabular-nums">
                {percentage}%
              </span>
            </div>
          </div>
          <div className="text-[12px] text-[var(--color-ink-3)] max-w-[120px] leading-[1.4]">
            {percentage >= 80
              ? "Superhost eligible"
              : `${100 - percentage}% to Superhost`}
          </div>
        </div>
      </div>

      {/* Quick action chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-7 pt-7 border-t border-[var(--color-line)]">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => {
                if (action.href) {
                  window.location.href = action.href;
                } else {
                  setActiveTab(action.tab);
                }
              }}
              className="group flex items-center gap-3 bg-[var(--color-surface-2)] border border-[var(--color-line)] hover:border-[var(--color-line-2)] rounded-[10px] px-3.5 py-2.5 transition-colors text-left"
            >
              <div
                className={`w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 ${
                  action.done
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)]"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[var(--color-ink)] text-[13.5px] font-semibold leading-tight truncate">
                  {action.label} {action.done && "✓"}
                </p>
                <p className="text-[var(--color-ink-3)] text-[11px] mt-0.5">{action.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
