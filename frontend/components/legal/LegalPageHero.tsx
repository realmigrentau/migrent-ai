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
  iconBgClass = "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10",
  iconBorderClass = "border-[var(--color-primary-100)] dark:border-[var(--color-line)]",
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
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
            {title} {titleAccent}
            {titleSuffix ? ` ${titleSuffix}` : ""}
          </h1>
          <p className="text-sm text-[var(--color-ink-3)] mt-1">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>
      {subtitle && (
        <p className="text-sm text-[var(--color-ink-3)] mt-2 max-w-2xl">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
