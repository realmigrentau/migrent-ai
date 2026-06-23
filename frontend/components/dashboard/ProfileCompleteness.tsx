import { motion } from "framer-motion";
import Link from "next/link";
import { UserRole } from "../../hooks/useDashboard";
import { ProfileData } from "../../hooks/useDashboardData";
import {
  CheckCircle2,
  Circle,
  ShieldCheck,
  Mail,
  CreditCard,
  ChevronRight,
  Trophy,
  Camera,
  User,
  Sparkles,
} from "lucide-react";

interface ProfileCompletenessProps {
  profile: ProfileData | null;
  role: UserRole;
  loading: boolean;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export default function ProfileCompleteness({ profile, role, loading }: ProfileCompletenessProps) {
  if (loading) {
    return (
      <div className="card p-5 space-y-4">
        <Skeleton className="w-40 h-5" />
        <Skeleton className="w-full h-3 rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const profileHref = role === "owner" ? "/dashboard/owner-profile" : "/dashboard/seeker-profile";
  const isComplete = profile.completionPercent === 100;

  return (
    <div className="card p-5 space-y-5">
      {/* Header + progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-[color:var(--color-primary-fg)] dark:text-[var(--color-ink)]"
              />
              <motion.circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - profile.completionPercent / 100) }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--color-ink-2)]">
              {profile.completionPercent}%
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">
              {isComplete ? "Profile complete!" : "Complete your profile"}
            </h3>
            <p className="text-xs text-[var(--color-ink-3)]">
              {isComplete
                ? "You're all set - your profile is fully filled out"
                : `${profile.missingFields.length} field${profile.missingFields.length > 1 ? "s" : ""} remaining`}
            </p>
          </div>
        </div>

        <Link
          href={profileHref}
          className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] flex items-center gap-1"
        >
          Edit <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Missing fields as action items */}
      {!isComplete && profile.missingFields.length > 0 && (
        <div className="space-y-1">
          {profile.missingFields.slice(0, 3).map((field, i) => (
            <Link key={field} href={profileHref}>
              <div
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--color-surface)]/50 transition-colors group cursor-pointer"
              >
                <Circle className="w-4 h-4 text-[var(--color-ink-4)] shrink-0" />
                <span className="text-sm text-[var(--color-ink-2)] group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-primary)] transition-colors">
                  Add {field.toLowerCase()}
                </span>
                <ChevronRight className="w-3 h-3 ml-auto text-[var(--color-ink-4)] group-hover:text-[var(--color-primary)] transition-colors" />
              </div>
            </Link>
          ))}
          {profile.missingFields.length > 3 && (
            <Link href={profileHref}>
              <span className="block text-center text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] py-1.5 font-medium">
                +{profile.missingFields.length - 3} more
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Verification badges */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--color-ink-3)] uppercase tracking-wider mb-2">
          Verification
        </h4>
        <div className="flex flex-wrap gap-2">
          <VerificationBadge
            label="Email"
            verified={profile.emailVerified}
            icon={<Mail className="w-3 h-3" />}
          />
          <VerificationBadge
            label="Identity"
            verified={profile.idVerified}
            icon={<ShieldCheck className="w-3 h-3" />}
          />
          {role === "seeker" && (
            <VerificationBadge
              label="Income"
              verified={false}
              icon={<CreditCard className="w-3 h-3" />}
            />
          )}
          {role === "owner" && (
            <VerificationBadge
              label="Property"
              verified={false}
              icon={<CreditCard className="w-3 h-3" />}
            />
          )}
        </div>
      </div>

      {/* Earned badges */}
      {profile.badges.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-ink-3)] uppercase tracking-wider mb-2">
            Badges
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.badges.map((badge) => (
              <motion.span
                key={badge}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20"
              >
                <Trophy className="w-3 h-3" />
                {badge}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Profile preview snippet */}
      {profile.name && (
        <Link href={profileHref}>
          <motion.div
            whileHover={{ y: -1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-sunk)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 ${
              profile.photo ? "" : "bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)]"
            }`}>
              {profile.photo ? (
                <img src={profile.photo} alt="Your profile photo" className="w-full h-full object-cover" />
              ) : (
                profile.name[0]?.toUpperCase() || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                {profile.name}
              </p>
              <p className="text-xs text-[var(--color-ink-3)] truncate">
                {profile.bio || profile.occupation || "Add a bio to introduce yourself"}
              </p>
            </div>
            {profile.uselessSkill && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary-soft)] dark:border-[var(--color-primary)]/20 shrink-0">
                {profile.uselessSkill}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-[var(--color-ink-4)] group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
          </motion.div>
        </Link>
      )}
    </div>
  );
}

function VerificationBadge({
  label,
  verified,
  icon,
}: {
  label: string;
  verified: boolean;
  icon: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        verified
          ? "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 text-[var(--color-accent)] dark:text-[var(--color-accent)] border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]"
          : "bg-[var(--color-surface)] text-[var(--color-ink-3)] border-[var(--color-line)]"
      }`}
    >
      {verified ? <CheckCircle2 className="w-3 h-3" /> : icon}
      {verified ? `${label}` : `${label}`}
    </span>
  );
}
