import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import {
  TrendingUp,
  DollarSign,
  Home,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Eye,
  Star,
} from "lucide-react";
import type { ProfileData } from "../../hooks/useSettingsData";

interface AnalyticsTabProps {
  profile: ProfileData | null;
}

// Mock analytics data
const MOCK_LISTINGS = [
  {
    title: "Sydney Loft - Bondi",
    occupancy: 92,
    revenue: 1200,
    views: 340,
    rating: 4.9,
  },
  {
    title: "Bondi Room - Beach View",
    occupancy: 65,
    revenue: 780,
    views: 210,
    rating: 4.7,
  },
  {
    title: "Kellyville Studio",
    occupancy: 45,
    revenue: 520,
    views: 125,
    rating: 4.5,
  },
];

const MOCK_SEARCH_TERMS = [
  { term: "Kellyville station rooms", count: 48 },
  { term: "student rooms Sydney", count: 35 },
  { term: "cheap rooms Bondi", count: 28 },
  { term: "furnished room CBD", count: 22 },
  { term: "pet-friendly rooms", count: 15 },
];

export default function AnalyticsTab({ profile }: AnalyticsTabProps) {
  const totalRevenue = MOCK_LISTINGS.reduce((sum, l) => sum + l.revenue, 0);
  const avgOccupancy = Math.round(
    MOCK_LISTINGS.reduce((sum, l) => sum + l.occupancy, 0) / MOCK_LISTINGS.length
  );
  const totalViews = MOCK_LISTINGS.reduce((sum, l) => sum + l.views, 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Monthly Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            change: "+12%",
            up: true,
            icon: DollarSign,
            gradient: "from-emerald-400 to-teal-500",
            bg: "bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
          },
          {
            label: "Avg Occupancy",
            value: `${avgOccupancy}%`,
            change: "+5%",
            up: true,
            icon: Home,
            gradient: "from-blue-400 to-indigo-500",
            bg: "bg-blue-50/80 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
          },
          {
            label: "Total Views",
            value: totalViews.toString(),
            change: "+18%",
            up: true,
            icon: Eye,
            gradient: "from-purple-400 to-pink-500",
            bg: "bg-purple-50/80 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20",
          },
          {
            label: "Avg Rating",
            value: profile?.average_rating?.toFixed(1) || "4.7",
            change: "+0.2",
            up: true,
            icon: Star,
            gradient: "from-amber-400 to-orange-500",
            bg: "bg-amber-50/80 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              className={`rounded-xl p-4 border ${stat.bg}`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{stat.label}</p>
                <span
                  className={`flex items-center text-[10px] font-medium ${
                    stat.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                  }`}
                >
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart Placeholder */}
      <GlassCard delay={0.15}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Revenue Trend</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Last 6 months</p>
          </div>
        </div>

        {/* Mini sparkline bars */}
        <div className="ml-14 flex items-end gap-2 h-24">
          {[45, 62, 58, 75, 82, 90].map((val, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${val}%` }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: "easeOut" }}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400 opacity-80 hover:opacity-100 transition-opacity relative group"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                ${Math.round(val * 25)}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="ml-14 flex justify-between mt-2 text-[10px] text-slate-400">
          <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span>
        </div>
      </GlassCard>

      {/* Listings Performance */}
      <GlassCard delay={0.2}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shrink-0">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Listings Performance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">How your rooms are doing</p>
          </div>
        </div>

        <div className="ml-14 space-y-3">
          {MOCK_LISTINGS.map((listing, i) => (
            <motion.div
              key={listing.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{listing.title}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{listing.rating}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ${listing.revenue}
                  </p>
                  <p className="text-[10px] text-slate-400">Revenue/mo</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {listing.occupancy}%
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400">Occupancy</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {listing.views}
                  </p>
                  <p className="text-[10px] text-slate-400">Views</p>
                </div>
              </div>
              {/* Occupancy bar */}
              <div className="mt-2 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${listing.occupancy}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                  className={`h-1.5 rounded-full ${
                    listing.occupancy >= 80
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                      : listing.occupancy >= 50
                      ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                      : "bg-gradient-to-r from-amber-400 to-orange-500"
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Top Search Terms */}
      <GlassCard delay={0.3}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shrink-0">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Top Search Terms</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">How seekers find your listings</p>
          </div>
        </div>

        <div className="ml-14 space-y-2">
          {MOCK_SEARCH_TERMS.map((term, i) => (
            <motion.div
              key={term.term}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.04 }}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">"{term.term}"</p>
              </div>
              <span className="text-xs font-medium text-slate-400">{term.count} searches</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Active Seekers */}
      <GlassCard delay={0.35}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Most Active Seekers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Users viewing your listings</p>
          </div>
        </div>
        <div className="ml-14">
          <div className="flex -space-x-2">
            {["bg-rose-400", "bg-blue-400", "bg-emerald-400", "bg-purple-400", "bg-amber-400"].map((bg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className={`w-8 h-8 rounded-full ${bg} border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white`}
              >
                {String.fromCharCode(65 + i)}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 }}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500"
            >
              +12
            </motion.div>
          </div>
          <p className="text-xs text-slate-400 mt-2">17 seekers viewed your listings this month</p>
        </div>
      </GlassCard>
    </div>
  );
}
