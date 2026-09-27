import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Circle, Clock3, Info, RefreshCw, WifiOff, XCircle } from "lucide-react";
import { cn } from "../../../lib/cn";
import type { Tone } from "../../../lib/hub/types";
import { Button } from "./Button";

/* ── Skeletons: shaped like what is loading, never a page spinner ── */

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("hub-skeleton rounded-[10px]", className)} />;
}

export function CardSkeleton({ image = true }: { image?: boolean }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {image && <Skeleton className="aspect-[4/3] w-full rounded-[18px]" />}
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3.5 w-1/2" />
    </div>
  );
}

export function RowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-[14px]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Screen-reader announcement while a region loads. */
export function LoadingRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/* ── Empty and error states ── */

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  secondary?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, body, action, secondary, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "gap-3 px-4 py-8" : "gap-4 rounded-[22px] border border-dashed border-[var(--color-line-2)] bg-[var(--color-surface)] px-6 py-12 sm:py-16",
        className,
      )}
    >
      {icon && (
        <div aria-hidden className="hub-empty-icon flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--color-primary-soft)] text-[color:var(--color-primary-700)] dark:text-[color:var(--color-primary)]">
          {icon}
        </div>
      )}
      <div className="flex max-w-[420px] flex-col gap-1.5">
        <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[color:var(--color-ink)]">{title}</h3>
        {body && <p className="text-[14.5px] leading-relaxed text-[color:var(--color-ink-2)]">{body}</p>}
      </div>
      {(action || secondary) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondary}
        </div>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry, offline, title }: { message: string; onRetry?: () => void; offline?: boolean; title?: string }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-12 text-center">
      <div aria-hidden className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--color-surface-muted)] text-[color:var(--color-ink-2)]">
        {offline ? <WifiOff className="h-5 w-5" strokeWidth={1.75} /> : <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />}
      </div>
      <div className="flex max-w-[420px] flex-col gap-1.5">
        <h3 className="text-[17px] font-semibold text-[color:var(--color-ink)]">{title ?? (offline ? "You're offline" : "This didn't load")}</h3>
        <p className="text-[14.5px] leading-relaxed text-[color:var(--color-ink-2)]">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={<RefreshCw className="h-4 w-4" strokeWidth={1.75} />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

const toneBox: Record<Tone, string> = {
  neutral: "bg-[var(--color-surface-muted)] text-[color:var(--color-ink-2)] border-[var(--color-line)]",
  info: "bg-[var(--color-primary-soft)] text-[color:var(--color-primary-900)] dark:text-[color:var(--color-trust-ink)] border-[color:color-mix(in_oklab,var(--color-primary)_22%,transparent)]",
  success: "bg-[var(--color-success-50)] text-[color:var(--color-success-600)] dark:text-[color:var(--color-success-500)] border-[color:color-mix(in_oklab,var(--color-success-500)_25%,transparent)]",
  warning: "bg-[var(--color-warn-50)] text-[color:var(--color-warn-600)] dark:text-[color:var(--color-warn-500)] border-[color:color-mix(in_oklab,var(--color-warn-500)_28%,transparent)]",
  danger: "bg-[var(--color-danger-50)] text-[color:var(--color-danger-600)] dark:text-[color:var(--color-danger-500)] border-[color:color-mix(in_oklab,var(--color-danger-500)_25%,transparent)]",
};

const toneIcon: Record<Tone, ReactNode> = {
  neutral: <Info className="h-4 w-4" strokeWidth={1.9} />,
  info: <Info className="h-4 w-4" strokeWidth={1.9} />,
  success: <CheckCircle2 className="h-4 w-4" strokeWidth={1.9} />,
  warning: <AlertTriangle className="h-4 w-4" strokeWidth={1.9} />,
  danger: <XCircle className="h-4 w-4" strokeWidth={1.9} />,
};

export function InlineAlert({ tone = "info", title, children, action, className }: { tone?: Tone; title?: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div role={tone === "danger" || tone === "warning" ? "alert" : "status"} className={cn("flex gap-3 rounded-[14px] border px-4 py-3.5", toneBox[tone], className)}>
      <span aria-hidden className="mt-[2px] shrink-0">
        {toneIcon[tone]}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-[14px] leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-[color:inherit] opacity-95">{children}</div>}
        {action && <div className="mt-1.5">{action}</div>}
      </div>
    </div>
  );
}

/* ── Status badge: tone, label and icon together, never colour alone ── */

const badgeTone: Record<Tone, string> = {
  neutral: "bg-[var(--color-surface-muted)] text-[color:var(--color-ink-2)]",
  info: "bg-[var(--color-primary-soft)] text-[color:var(--color-primary-700)] dark:text-[color:var(--color-primary-600)]",
  success: "bg-[var(--color-success-50)] text-[color:var(--color-success-600)] dark:text-[color:var(--color-success-500)]",
  warning: "bg-[var(--color-warn-50)] text-[color:var(--color-warn-600)] dark:text-[color:var(--color-warn-500)]",
  danger: "bg-[var(--color-danger-50)] text-[color:var(--color-danger-600)] dark:text-[color:var(--color-danger-500)]",
};

const badgeIcon: Record<Tone, ReactNode> = {
  neutral: <Circle className="h-2 w-2 fill-current" strokeWidth={0} />,
  info: <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />,
  success: <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />,
  warning: <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />,
  danger: <XCircle className="h-3.5 w-3.5" strokeWidth={2} />,
};

export function StatusBadge({ tone, children, className, icon = true }: { tone: Tone; children: ReactNode; className?: string; icon?: boolean }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12.5px] font-semibold", badgeTone[tone], className)}>
      {icon && <span aria-hidden>{badgeIcon[tone]}</span>}
      {children}
    </span>
  );
}

export function Chip({ children, className, icon }: { children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 text-[12.5px] font-medium text-[color:var(--color-ink-2)]", className)}>
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </span>
  );
}

export function ProgressBar({ value, label, className }: { value: number; label: string; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]", className)} role="progressbar" aria-label={label} aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-500 ease-[var(--ease-out)]" style={{ width: `${v}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 56, label }: { value: number; size?: number; label: string }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${Math.round(v)}%`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-muted)" strokeWidth={5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-[var(--ease-out)]"
        />
      </svg>
      <span aria-hidden className="absolute text-[13px] font-bold tabular-nums text-[color:var(--color-ink)]">
        {Math.round(v)}%
      </span>
    </div>
  );
}
