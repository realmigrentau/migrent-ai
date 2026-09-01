import { AlertTriangle, Info, Shield } from "lucide-react";

type Severity = "warning" | "info" | "safety";

interface DisclaimerBannerProps {
  severity?: Severity;
  title?: string;
  children: React.ReactNode;
}

const severityConfig: Record<
  Severity,
  { borderColor: string; iconColor: string; bgColor: string; Icon: typeof AlertTriangle }
> = {
  warning: {
    borderColor: "border-l-amber-500",
    iconColor: "text-[var(--color-warn-500)]",
    bgColor: "bg-[var(--color-warn-50)]/50 dark:bg-[var(--color-warn-500)]/5",
    Icon: AlertTriangle,
  },
  info: {
    borderColor: "border-l-blue-500",
    iconColor: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary-50)]/50 dark:bg-[var(--color-primary)]/5",
    Icon: Info,
  },
  safety: {
    borderColor: "border-l-emerald-500",
    iconColor: "text-[var(--color-accent)]",
    bgColor: "bg-[var(--color-accent-50)]/50 dark:bg-[var(--color-accent)]/5",
    Icon: Shield,
  },
};

export default function DisclaimerBanner({
  severity = "warning",
  title,
  children,
}: DisclaimerBannerProps) {
  const config = severityConfig[severity];
  const { Icon } = config;

  return (
    <div
      className={`card p-5 rounded-2xl border-l-4 ${config.borderColor} ${config.bgColor} space-y-2`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="space-y-2">
          {title && (
            <h3 className="text-sm font-bold text-[var(--color-ink)]">{title}</h3>
          )}
          <div className="text-sm text-[var(--color-ink-2)] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
