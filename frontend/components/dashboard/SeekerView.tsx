import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Heart,
  Filter,
  Sparkles,
  MapPin,
  ChevronRight,
  Star,
  Clock,
} from "lucide-react";

interface SeekerViewProps {
  loading: boolean;
}

export default function SeekerView({ loading }: SeekerViewProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="shimmer rounded-2xl h-24" />
        ))}
      </div>
    );
  }

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
      </div>

      {/* Recommended for you */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Recommended for You
          </h2>
          <Link
            href="/seeker/search"
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-1">
          {[
            {
              title: "Search by postcode",
              desc: "Enter your preferred area code to find nearby rooms",
              icon: <MapPin className="w-4 h-4" />,
              href: "/seeker/search",
              color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
            },
            {
              title: "Complete your profile",
              desc: "A complete profile increases your chances of being accepted",
              icon: <Star className="w-4 h-4" />,
              href: "/dashboard/seeker-profile",
              color: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
            },
            {
              title: "Set up alerts",
              desc: "Get notified when new rooms match your criteria",
              icon: <Clock className="w-4 h-4" />,
              href: "/seeker/search",
              color: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
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
