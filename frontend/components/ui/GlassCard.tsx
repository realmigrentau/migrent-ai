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

const paddingMap: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-[clamp(20px,2.4vw,28px)]",
  lg: "p-8",
};

/**
 * A plain card on the site's one calm surface (.site-card): a 1px line, no
 * glass, no shadow, no hover lift. The 2026-09-29 redesign flattened it to
 * match Migrent Hub; `gradient`, `hover` and `delay` are kept so callers do
 * not break, but no longer change how it looks.
 */
export default function GlassCard({ children, className = "", padding = "md", onClick }: GlassCardProps) {
  return (
    <div onClick={onClick} className={`site-card ${onClick ? "cursor-pointer" : ""} ${paddingMap[padding]} ${className}`}>
      {children}
    </div>
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
      "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/15 text-[var(--color-accent)] dark:text-[var(--color-accent)] border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]",
    pending:
      "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/15 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] border-[var(--color-line-2)] dark:border-amber-500/30",
    action:
      "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/15 text-[var(--color-primary)] dark:text-[var(--color-primary)] border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)]",
    info: "bg-[var(--color-primary-100)] dark:bg-[var(--color-primary)]/15 text-[var(--color-primary-700)] dark:text-[var(--color-primary)] border-[var(--color-primary-100)] dark:border-blue-500/30",
    inactive:
      "bg-[var(--color-surface-muted)] text-[var(--color-ink-3)] border-[var(--color-line)]",
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
          className="text-[var(--color-ink-4)] dark:text-[var(--color-ink-2)]"
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
      <span className="absolute text-sm font-bold text-[var(--color-ink)]">
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
