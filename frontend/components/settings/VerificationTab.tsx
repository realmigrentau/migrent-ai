import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard, { StatusBadge, ProgressRing } from "../ui/GlassCard";
import {
  Mail,
  Phone,
  Shield,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Award,
  TrendingUp,
} from "lucide-react";
import type { ProfileData } from "../../hooks/useSettingsData";

interface VerificationTabProps {
  profile: ProfileData | null;
  verificationProgress: {
    percentage: number;
    steps: { label: string; done: boolean; icon: string }[];
  };
  saving: boolean;
  startIdVerification: () => Promise<string | null>;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function VerificationTab({
  profile,
  verificationProgress,
  saving,
  startIdVerification,
  showMessage,
}: VerificationTabProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { percentage, steps } = verificationProgress;
  const isSuperhost = (profile?.average_rating || 0) >= 4.8 && (profile?.reviews_count || 0) >= 10;

  // Show confetti when fully verified
  useEffect(() => {
    if (percentage >= 100) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [percentage]);

  const handleVerifyId = async () => {
    const url = await startIdVerification();
    if (url) {
      window.open(url, "_blank");
    }
  };

  const verificationItems = [
    {
      label: "Email Verified",
      description: `Verified with ${profile?.email || "your email"}`,
      icon: Mail,
      done: true,
      date: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-AU", { month: "short", year: "numeric" }) : "Verified",
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      label: "Phone Verified",
      description: profile?.phone ? `${profile.phone}` : profile?.phones?.[0] || "Not yet verified",
      icon: Phone,
      done: !!(profile?.phone || profile?.phones?.length),
      date: profile?.phone ? "Verified" : null,
      gradient: "from-emerald-400 to-teal-500",
      action: !profile?.phone && !profile?.phones?.length ? "Verify" : null,
    },
    {
      label: "Government ID",
      description: profile?.identity_verified ? "Identity confirmed via Stripe" : "Verify your identity with a government ID",
      icon: Shield,
      done: !!profile?.identity_verified,
      date: profile?.identity_verified ? "Verified" : null,
      gradient: "from-amber-400 to-orange-500",
      action: !profile?.identity_verified ? "Verify Now" : null,
      actionFn: handleVerifyId,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="text-6xl animate-bounce">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Progress Card */}
      <GlassCard delay={0.05} gradient="emerald">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ProgressRing
            progress={percentage}
            size={100}
            strokeWidth={8}
            color={percentage >= 80 ? "emerald" : percentage >= 50 ? "indigo" : "rose"}
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Profile {percentage}% Complete
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {percentage >= 100
                ? "Amazing! Your profile is fully verified! 🎉"
                : percentage >= 80
                ? "Almost there! You're Superhost eligible 🌟"
                : `Complete ${steps.filter((s) => !s.done).length} more steps to unlock all features`}
            </p>

            {/* Mini step indicators */}
            <div className="flex flex-wrap gap-1.5">
              {steps.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border
                    ${step.done
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }
                  `}
                  title={step.label}
                >
                  <span>{step.icon}</span>
                  {step.done ? "✓" : "·"}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stat bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="backdrop-blur-xl bg-blue-50/80 dark:bg-blue-500/10 rounded-xl p-3 text-center border border-blue-100 dark:border-blue-500/20">
          <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">3x</p>
          <p className="text-[10px] text-blue-600/70 dark:text-blue-400/60">More bookings</p>
        </div>
        <div className="backdrop-blur-xl bg-emerald-50/80 dark:bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-100 dark:border-emerald-500/20">
          <Star className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {profile?.average_rating?.toFixed(1) || "—"}
          </p>
          <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">Rating</p>
        </div>
        <div className="backdrop-blur-xl bg-purple-50/80 dark:bg-purple-500/10 rounded-xl p-3 text-center border border-purple-100 dark:border-purple-500/20">
          <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
            {profile?.badges?.length || 0}
          </p>
          <p className="text-[10px] text-purple-600/70 dark:text-purple-400/60">Badges</p>
        </div>
      </motion.div>

      {/* Verification Timeline */}
      <GlassCard delay={0.2}>
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Verification Timeline
        </h3>

        <div className="space-y-1">
          {verificationItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="relative"
              >
                {/* Timeline connector */}
                {i < verificationItems.length - 1 && (
                  <div className={`absolute left-5 top-12 w-0.5 h-6 ${item.done ? "bg-emerald-300 dark:bg-emerald-500/30" : "bg-slate-200 dark:bg-slate-700"}`} />
                )}

                <div className={`
                  flex items-center gap-4 p-3 rounded-xl transition-all
                  ${item.done
                    ? "bg-emerald-50/50 dark:bg-emerald-500/5"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }
                `}>
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0
                    ${item.done
                      ? `bg-gradient-to-br ${item.gradient}`
                      : "bg-slate-200 dark:bg-slate-700"
                    }
                  `}>
                    {item.done ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                      {item.done ? (
                        <StatusBadge status="verified" label={item.date || "Done"} />
                      ) : (
                        <StatusBadge status={item.action ? "action" : "pending"} label={item.action ? "Required" : "Pending"} />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                  </div>

                  {item.action && item.actionFn && (
                    <button
                      onClick={item.actionFn}
                      disabled={saving}
                      className="btn-primary py-2 px-4 rounded-xl text-xs flex items-center gap-1 shrink-0 disabled:opacity-50"
                    >
                      {item.action}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Superhost Badge Preview */}
      <GlassCard delay={0.3} gradient={isSuperhost ? "amber" : "none"}>
        <div className="flex items-center gap-4">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center
            ${isSuperhost
              ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg badge-glow"
              : "bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600"
            }
          `}>
            <Star className={`w-8 h-8 ${isSuperhost ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white">
              {isSuperhost ? "You're a Superhost! 🎖️" : "Superhost Badge"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isSuperhost
                ? "Congratulations! You've earned the Superhost badge."
                : "Maintain a 4.85+ rating with 10+ reviews to unlock"}
            </p>
            {!isSuperhost && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((profile?.reviews_count || 0) / 10) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{profile?.reviews_count || 0}/10 reviews</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Verified hosts stat */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-3"
      >
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          Verified hosts get 3x more bookings and appear higher in search results ✨
        </p>
      </motion.div>
    </div>
  );
}
