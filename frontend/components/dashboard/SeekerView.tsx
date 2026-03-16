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
} from "lucide-react";

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
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    priority: 0,
  });

  if (profile) {
    if (!profile.photo) {
      recommendations.push({
        title: "Add a profile photo",
        desc: "Profiles with photos get 5x more responses from owners",
        icon: <Camera className="w-4 h-4" />,
        href: "/dashboard/seeker-profile",
        color: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
        priority: 1,
      });
    }

    if (!profile.bio) {
      recommendations.push({
        title: "Write your bio",
        desc: "Tell owners about yourself - what brings you here, your lifestyle",
        icon: <User className="w-4 h-4" />,
        href: "/dashboard/seeker-profile",
        color: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
        priority: 2,
      });
    }

    if (!profile.occupation) {
      recommendations.push({
        title: "Add your occupation",
        desc: "Owners want to know you have stable income",
        icon: <Briefcase className="w-4 h-4" />,
        href: "/dashboard/seeker-profile",
        color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
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
        color: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
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
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
            New Search
          </motion.span>
        </Link>
        <Link href="/seeker/saved">
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            Saved Rooms
          </motion.span>
        </Link>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Filter className="w-4 h-4" />
          Saved Filters
        </motion.button>
        <Link href="/suburb/kellyville">
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 text-teal-700 dark:text-teal-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <Map className="w-4 h-4" />
            Suburb Reports
          </motion.span>
        </Link>
      </div>

      {/* Smart recommendations based on profile */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            {profile && profile.completionPercent < 50 ? "Get Started" : "Recommended for You"}
          </h2>
          <Link
            href="/seeker/search"
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Seeker preferences snapshot (if they have budget/suburbs set) */}
      {profile && (profile.budgetMin || profile.preferredSuburbs) && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your Preferences</h2>
            <Link
              href="/dashboard/seeker-profile"
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Edit
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.budgetMin && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                ${profile.budgetMin}–${profile.budgetMax || "?"}/wk
              </span>
            )}
            {profile.preferredSuburbs && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                <MapPin className="w-3 h-3" />
                {profile.preferredSuburbs}
              </span>
            )}
            {profile.moveInDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20">
                <Clock className="w-3 h-3" />
                Move-in: {profile.moveInDate}
              </span>
            )}
            {profile.lifestyle.slice(0, 3).map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick search prompt */}
      <Link href="/seeker/search">
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-6 text-center hover-glow cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">
            Find your perfect room
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Search thousands of verified rooms across Australia with AI-powered matching
          </p>
        </motion.div>
      </Link>
    </div>
  );
}
