import { motion } from "framer-motion";
import Link from "next/link";
import { ProfileData } from "../../hooks/useDashboardData";
import {
  Search,
  Heart,
  Filter,
  Sparkles,
  MapPin,
  ChevronRight,
  Star,
  Clock,
  Camera,
  ShieldCheck,
  User,
  Briefcase,
  Map,
  Users,
} from "lucide-react";
import VisaRecommendations from "./VisaRecommendations";

interface SeekerViewProps {
  loading: boolean;
  profile: ProfileData | null;
}

export default function SeekerView({ loading, profile }: SeekerViewProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="shimmer rounded-2xl h-24" />
        ))}
      </div>
    );
  }

  // Build smart recommendations based on profile state
  const recommendations: { title: string; desc: string; icon: React.ReactNode; href: string; color: string; priority: number }[] = [];

  // Always show search
  recommendations.push({
    title: "Search by postcode",
    desc: "Enter your preferred area code to find nearby rooms",
    icon: <MapPin className="w-4 h-4" />,
    href: "/seeker/search",
    color: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:bg-[var(--color-primary)]/20 dark:text-[var(--color-primary)]",
    priority: 0,
  });

  if (profile) {
    if (!profile.photo) {
      recommendations.push({
        title: "Add a profile photo",
        desc: "Profiles with photos get 5x more responses from owners",
        icon: <Camera className="w-4 h-4" />,
        href: "/dashboard/seeker-profile",
        color: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:bg-[var(--color-primary-soft)]0/20 dark:text-[var(--color-primary)]",
        priority: 1,
      });
    }

    if (!profile.bio) {
      recommendations.push({
        title: "Write your bio",
        desc: "Tell owners about yourself - what brings you here, your lifestyle",
        icon: <User className="w-4 h-4" />,
        href: "/dashboard/seeker-profile",
        color: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:bg-[var(--color-primary-soft)]0/20 dark:text-[var(--color-primary)]",
        priority: 2,
      });
    }

    if (!profile.occupation) {
      recommendations.push({
        title: "Add your occupation",
        desc: "Owners want to know you have stable income",
        icon: <Briefcase className="w-4 h-4" />,
        href: "/dashboard/seeker-profile",
        color: "bg-[var(--color-accent-soft)] text-[var(--color-accent)] dark:bg-[var(--color-accent-soft)]0/20 dark:text-[var(--color-accent)]",
        priority: 3,
      });
    }

    if (!profile.idVerified) {
      recommendations.push({
        title: "Verify your identity",
        desc: "Verified seekers are 3x more likely to be accepted",
        icon: <ShieldCheck className="w-4 h-4" />,
        href: "/dashboard/seeker-profile",
        color: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
        priority: 4,
      });
    }

    if (profile.completionPercent === 100 && profile.idVerified) {
      recommendations.push({
        title: "Set up alerts",
        desc: "Get notified when new rooms match your criteria",
        icon: <Clock className="w-4 h-4" />,
        href: "/seeker/search",
        color: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:bg-[var(--color-primary-soft)]0/20 dark:text-[var(--color-primary)]",
        priority: 5,
      });
    }
  } else {
    recommendations.push({
      title: "Complete your profile",
      desc: "A complete profile increases your chances of being accepted",
      icon: <Star className="w-4 h-4" />,
      href: "/dashboard/seeker-profile",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      priority: 1,
    });
  }

  // Sort by priority and take top 4
  const sortedRecs = recommendations.sort((a, b) => a.priority - b.priority).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/seeker/search">
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
            New Search
          </motion.span>
        </Link>
        <Link href="/seeker/saved">
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-[var(--color-surface-sunk)] hover:bg-[var(--color-line)] text-[var(--color-ink-2)] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            Saved Rooms
          </motion.span>
        </Link>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 bg-[var(--color-surface-sunk)] hover:bg-[var(--color-line)] text-[var(--color-ink-2)] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Filter className="w-4 h-4" />
          Saved Filters
        </motion.button>
        <Link href="/suburb/kellyville">
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <Map className="w-4 h-4" />
            Suburb Reports
          </motion.span>
        </Link>
      </div>

      {/* Visa-based recommendations */}
      <VisaRecommendations />

      {/* Smart recommendations based on profile */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[var(--color-ink)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
            {profile && profile.completionPercent < 50 ? "Get Started" : "Recommended for You"}
          </h2>
          <Link
            href="/seeker/search"
            className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] flex items-center gap-1"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-1">
          {sortedRecs.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--color-ink-3)]">
                    {item.desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Seeker preferences snapshot (if they have budget/suburbs set) */}
      {profile && (profile.budgetMin || profile.preferredSuburbs) && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[var(--color-ink)]">Your Preferences</h2>
            <Link
              href="/dashboard/seeker-profile"
              className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)]"
            >
              Edit
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.budgetMin && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 text-[var(--color-accent)] dark:text-[var(--color-accent)] border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]">
                ${profile.budgetMin}–${profile.budgetMax || "?"}/wk
              </span>
            )}
            {profile.preferredSuburbs && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)]">
                <MapPin className="w-3 h-3" />
                {profile.preferredSuburbs}
              </span>
            )}
            {profile.moveInDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary-soft)] dark:border-[var(--color-primary)]/20">
                <Clock className="w-3 h-3" />
                Move-in: {profile.moveInDate}
              </span>
            )}
            {profile.lifestyle.slice(0, 3).map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-surface-sunk)] text-slate-600 dark:text-slate-300 border border-[var(--color-line)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mentor CTA */}
      <Link href="/mentors">
        <motion.div
          whileHover={{ y: -2 }}
          className="card p-6 text-center cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-[var(--color-ink)] mb-1">
            First week? Get a local mentor
          </h3>
          <p className="text-sm text-[var(--color-ink-3)] max-w-xs mx-auto">
            Connect with verified locals who help you settle in - suburb walks, local tips, and more
          </p>
        </motion.div>
      </Link>

      {/* Quick search prompt */}
      <Link href="/seeker/search">
        <motion.div
          whileHover={{ y: -2 }}
          className="card p-6 text-center cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-[var(--color-ink)] mb-1">
            Find your perfect room
          </h3>
          <p className="text-sm text-[var(--color-ink-3)] max-w-xs mx-auto">
            Search thousands of verified rooms across Australia with AI-powered matching
          </p>
        </motion.div>
      </Link>
    </div>
  );
}
