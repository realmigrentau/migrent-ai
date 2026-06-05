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
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50/50 dark:bg-amber-500/5",
    Icon: AlertTriangle,
  },
  info: {
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50/50 dark:bg-blue-500/5",
    Icon: Info,
  },
  safety: {
    borderColor: "border-l-emerald-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50/50 dark:bg-emerald-500/5",
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          )}
          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
