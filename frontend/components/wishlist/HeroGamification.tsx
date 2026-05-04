import { motion } from "framer-motion";
import {
  Heart,
  TrendingDown,
  MessageCircle,
  Flame,
  Trophy,
  Sparkles,
  Share2,
  Download,
  Trash2,
} from "lucide-react";

interface HeroGamificationProps {
  level: {
    level: number;
    name: string;
    min: number;
    max: number;
    progress: number;
    count: number;
  };
  stats: {
    total: number;
    priceDrops: number;
    ownerReplies: number;
    totalSaved: number;
    avgPrice: number;
  };
  onShare: () => void;
  onClearAll: () => void;
}

const LEVEL_COLORS = [
  { bg: "from-slate-400 to-slate-500", ring: "ring-slate-300" },
  { bg: "from-blue-400 to-indigo-500", ring: "ring-blue-300" },
  { bg: "from-emerald-400 to-teal-500", ring: "ring-emerald-300" },
  { bg: "from-amber-400 to-orange-500", ring: "ring-amber-300" },
  { bg: "from-rose-400 to-pink-500", ring: "ring-rose-300" },
  { bg: "from-violet-400 to-purple-500", ring: "ring-violet-300" },
];

export default function HeroGamification({
  level,
  stats,
  onShare,
  onClearAll,
}: HeroGamificationProps) {
  const levelColor = LEVEL_COLORS[Math.min(level.level - 1, LEVEL_COLORS.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Title + Level bar */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              My Wishlist
            </h1>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${levelColor.bg} text-white text-xs font-bold shadow-lg`}
            >
              {level.level >= 4 ? (
                <Trophy className="w-3.5 h-3.5" />
              ) : (
                <Flame className="w-3.5 h-3.5" />
              )}
              Lv.{level.level}
            </motion.div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Perfect rooms waiting for you
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-500/30 hover:text-rose-500 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-500/30 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Gamification progress + stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Level progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-4 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${levelColor.bg} flex items-center justify-center shadow-lg`}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Wishlist {level.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  Level {level.level}
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400">
              {level.count}/{level.max}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${level.progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${levelColor.bg}`}
            />
            {/* Shimmer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            {level.max - level.count} more to reach {level.name === "Legend" ? "max level" : `Level ${level.level + 1}`}
          </p>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2"
        >
          <div className="card p-3 rounded-2xl text-center group hover:border-rose-200 dark:hover:border-rose-500/20 transition-colors">
            <div className="w-8 h-8 mx-auto rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              {stats.total}
            </motion.p>
            <p className="text-[10px] text-slate-400">Saved</p>
          </div>

          <div className="card p-3 rounded-2xl text-center group hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-colors">
            <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              {stats.priceDrops}
            </motion.p>
            <p className="text-[10px] text-slate-400">Drops</p>
          </div>

          <div className="card p-3 rounded-2xl text-center group hover:border-blue-200 dark:hover:border-blue-500/20 transition-colors">
            <div className="w-8 h-8 mx-auto rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-4 h-4 text-blue-500" />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              {stats.ownerReplies}
            </motion.p>
            <p className="text-[10px] text-slate-400">Replies</p>
          </div>
        </motion.div>
      </div>

      {/* Savings banner */}
      {stats.totalSaved > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/50 dark:border-emerald-500/20"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg shrink-0">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              You could save ${stats.totalSaved}/wk on price drops!
            </p>
            <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60">
              {stats.priceDrops} {stats.priceDrops === 1 ? "listing has" : "listings have"} reduced prices
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
