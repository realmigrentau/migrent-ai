import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  gradient?: "none" | "rose" | "indigo" | "emerald" | "amber" | "pink-indigo";
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const gradientBorders: Record<string, string> = {
  none: "",
  rose: "border-[var(--color-primary-soft)]/50 dark:border-[var(--color-primary-soft)]",
  indigo: "border-[var(--color-primary-soft)]/50 dark:border-[var(--color-primary-soft)]",
  emerald: "border-[var(--color-accent-soft)]/50 dark:border-[var(--color-accent-soft)]",
  amber: "border-amber-200/50 dark:border-amber-500/20",
  "pink-indigo": "border-[var(--color-primary-soft)]/50 dark:border-[var(--color-primary-soft)]",
};

const paddingMap: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function GlassCard({
  children,
  className = "",
  hover = true,
  delay = 0,
  gradient = "none",
  padding = "md",
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className={`
        backdrop-blur-xl bg-white/90 dark:bg-slate-900/90
        border ${gradientBorders[gradient] || "border-white/20 dark:border-slate-700/50"}
        rounded-2xl shadow-lg dark:shadow-2xl
        ${hover ? "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:bg-white dark:hover:bg-slate-900" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${paddingMap[padding]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

/* Status Badge sub-component */
export function StatusBadge({
  status,
  label,
  glow = false,
}: {
  status: "verified" | "pending" | "action" | "info" | "inactive";
  label: string;
  glow?: boolean;
}) {
  const styles: Record<string, string> = {
    verified:
      "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/15 text-[var(--color-accent)] dark:text-[var(--color-accent)] border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]",
    pending:
      "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    action:
      "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/15 text-[var(--color-primary)] dark:text-[var(--color-primary)] border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)]",
    info: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    inactive:
      "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
        ${styles[status]}
        ${glow ? "badge-glow" : ""}
      `}
    >
      {status === "verified" && "✓ "}
      {status === "pending" && "⏳ "}
      {status === "action" && "⚠️ "}
      {label}
    </span>
  );
}

/* Progress Ring sub-component */
export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color = "rose",
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: "rose" | "emerald" | "indigo";
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const colors: Record<string, string> = {
    rose: "stroke-[var(--color-primary)]",
    emerald: "stroke-[var(--color-accent)]",
    indigo: "stroke-[var(--color-primary)]",
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colors[color]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-900 dark:text-white">
        {progress}%
      </span>
    </div>
  );
}

/* Toggle Switch sub-component */
export function ToggleSwitch({
  enabled,
  onChange,
  size = "md",
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "sm" ? "w-9 h-5" : "w-11 h-6";
  const dotSize = size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";
  const translate = size === "sm" ? "translate-x-4" : "translate-x-5";

  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex ${sizeClasses} items-center rounded-full transition-colors duration-200
        ${enabled ? "bg-[var(--color-primary)]" : "bg-slate-300 dark:bg-slate-600"}
      `}
    >
      <span
        className={`
          inline-block ${dotSize} transform rounded-full bg-white shadow-sm transition-transform duration-200
          ${enabled ? translate : "translate-x-0.5"}
        `}
      />
    </button>
  );
}
