import { motion } from "framer-motion";
import { ProgressRing, StatusBadge } from "../ui/GlassCard";
import { Shield, Phone, Rocket, Calculator, Sparkles, Star } from "lucide-react";
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
  const isSuperhost = (profile?.average_rating || 0) >= 4.8 && (profile?.reviews_count || 0) >= 10;

  const quickActions = [
    {
      label: profile?.phone ? "Phone ✓" : "Verify Phone",
      icon: Phone,
      status: profile?.phone ? ("verified" as const) : ("pending" as const),
      tab: "verification" as SettingsTab,
      gradient: "from-[var(--color-accent)] to-teal-500",
    },
    {
      label: profile?.identity_verified ? "ID ✓" : "ID Check",
      icon: Shield,
      status: profile?.identity_verified ? ("verified" as const) : ("action" as const),
      tab: "verification" as SettingsTab,
      gradient: "from-amber-400 to-orange-500",
    },
    {
      label: isOwner ? "List Room" : "Find Room",
      icon: Rocket,
      status: "info" as const,
      tab: "profile" as SettingsTab,
      gradient: "from-blue-400 to-[var(--color-primary)]",
      href: isOwner ? "/owner/listings/new" : "/search",
    },
    {
      label: "Calculator",
      icon: Calculator,
      status: "info" as const,
      tab: "analytics" as SettingsTab,
      gradient: "from-[var(--color-primary)] to-[var(--color-primary)]",
      href: "/pricing",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[var(--color-primary-soft)] from-[var(--color-primary)] via-[var(--color-primary)] to-[var(--color-primary)] opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Left: greeting + badge */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-2"
              >
                <span className="text-white/80 text-sm">Welcome back</span>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3"
              >
                {displayName} ✨
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2"
              >
                {profile?.email && (
                  <StatusBadge status="verified" label="Email Verified" />
                )}
                {isSuperhost && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 badge-glow">
                    <Star className="w-3 h-3" /> Superhost
                  </span>
                )}
                {isOwner && (
                  <StatusBadge status="info" label={isOwner ? "Owner" : "Seeker"} />
                )}
              </motion.div>
            </div>

            {/* Right: progress ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="flex flex-col items-center gap-2"
            >
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <ProgressRing
                  progress={percentage}
                  size={90}
                  strokeWidth={7}
                  color={percentage >= 80 ? "emerald" : "rose"}
                />
              </div>
              <span className="text-white/90 text-xs font-medium">
                {percentage >= 80
                  ? "Superhost eligible! 🎉"
                  : `${100 - percentage}% to Superhost`}
              </span>
            </motion.div>
          </div>

          {/* Quick actions row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
          >
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  onClick={() => {
                    if (action.href) {
                      window.location.href = action.href;
                    } else {
                      setActiveTab(action.tab);
                    }
                  }}
                  className="group flex items-center gap-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-xl px-3.5 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className={`w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] ${action.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-semibold leading-tight">{action.label}</p>
                    <p className="text-white/60 text-[10px]">
                      {action.status === "verified" ? "Done" : action.status === "pending" ? "Pending" : action.status === "action" ? "Required" : "Go"}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
