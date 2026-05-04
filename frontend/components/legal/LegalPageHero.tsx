import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LegalPageHeroProps {
  icon: ReactNode;
  iconBgClass?: string;
  iconBorderClass?: string;
  title: string;
  titleAccent: string;
  titleSuffix?: string;
  lastUpdated: string;
  subtitle?: string;
}

export default function LegalPageHero({
  icon,
  iconBgClass = "bg-blue-50 dark:bg-blue-500/10",
  iconBorderClass = "border-blue-100 dark:border-blue-500/20",
  title,
  titleAccent,
  titleSuffix,
  lastUpdated,
  subtitle,
}: LegalPageHeroProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl ${iconBgClass} border ${iconBorderClass} flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {title} {titleAccent}
            {titleSuffix ? ` ${titleSuffix}` : ""}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>
      {subtitle && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
