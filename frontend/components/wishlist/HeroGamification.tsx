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
  { bg: "from-slate-400 to-[var(--color-ink-3)]", ring: "ring-slate-300" },
  { bg: "from-blue-400 to-[var(--color-primary)]", ring: "ring-blue-300" },
  { bg: "from-[var(--color-accent)] to-[var(--color-primary)]", ring: "ring-emerald-300" },
  { bg: "from-[var(--color-warn-500)] to-[var(--color-warn-500)]", ring: "ring-amber-300" },
  { bg: "from-[var(--color-primary)] to-[var(--color-primary)]", ring: "ring-[var(--color-line-2)]" },
  { bg: "from-violet-400 to-[var(--color-primary)]", ring: "ring-[var(--color-primary-soft)]" },
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
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
              My Wishlist
            </h1>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-primary)] ${levelColor.bg} text-white text-xs font-bold shadow-lg`}
            >
              {level.level >= 4 ? (
                <Trophy className="w-3.5 h-3.5" />
              ) : (
                <Flame className="w-3.5 h-3.5" />
              )}
              Lv.{level.level}
            </motion.div>
          </div>
          <p className="text-sm text-[var(--color-ink-3)]">
            Perfect rooms waiting for you
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-2)] hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)] transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button aria-label="Clear saved listings"
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)] hover:text-[var(--color-danger-500)] hover:border-[var(--color-danger-500)]/30 dark:hover:border-red-500/30 transition-all"
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
              <div className={`w-8 h-8 rounded-xl bg-[var(--color-primary)] ${levelColor.bg} flex items-center justify-center shadow-lg`}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-ink)]">
                  Wishlist {level.name}
                </p>
                <p className="text-[10px] text-[var(--color-ink-3)]">
                  Level {level.level}
                </p>
              </div>
            </div>
            <span className="text-xs text-[var(--color-ink-3)]">
              {level.count}/{level.max}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${level.progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className={`absolute inset-y-0 left-0 rounded-full bg-[var(--color-primary)] ${levelColor.bg}`}
            />
            {/* Shimmer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 bg-[var(--color-primary)] from-transparent via-white/30 to-transparent"
            />
          </div>

          <p className="text-[10px] text-[var(--color-ink-3)] text-center">
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
          <div className="card p-3 rounded-2xl text-center group hover:border-[var(--color-primary-soft)] dark:hover:border-[var(--color-primary)]/20 transition-colors">
            <div className="w-8 h-8 mx-auto rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-[var(--color-ink)]"
            >
              {stats.total}
            </motion.p>
            <p className="text-[10px] text-[var(--color-ink-3)]">Saved</p>
          </div>

          <div className="card p-3 rounded-2xl text-center group hover:border-[var(--color-accent-soft)] dark:hover:border-[var(--color-accent-soft)] transition-colors">
            <div className="w-8 h-8 mx-auto rounded-xl bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-4 h-4 text-[var(--color-accent)]" />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-[var(--color-ink)]"
            >
              {stats.priceDrops}
            </motion.p>
            <p className="text-[10px] text-[var(--color-ink-3)]">Drops</p>
          </div>

          <div className="card p-3 rounded-2xl text-center group hover:border-[var(--color-primary-100)] dark:hover:border-[var(--color-primary)]/20 transition-colors">
            <div className="w-8 h-8 mx-auto rounded-xl bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-[var(--color-ink)]"
            >
              {stats.ownerReplies}
            </motion.p>
            <p className="text-[10px] text-[var(--color-ink-3)]">Replies</p>
          </div>
        </motion.div>
      </div>

      {/* Savings banner */}
      {stats.totalSaved > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-primary)] from-[var(--color-accent-50)] to-[var(--color-primary-50)] dark:from-emerald-950/30 dark:to-[var(--color-surface-muted)] border border-[var(--color-accent-soft)]/50 dark:border-[var(--color-accent-soft)]"
        >
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] from-[var(--color-accent)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--color-accent)] dark:text-[var(--color-accent)]">
              You could save ${stats.totalSaved}/wk on price drops!
            </p>
            <p className="text-xs text-[var(--color-accent)]/60 dark:text-[var(--color-accent)]/60">
              {stats.priceDrops} {stats.priceDrops === 1 ? "listing has" : "listings have"} reduced prices
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
