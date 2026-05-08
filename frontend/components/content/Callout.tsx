import { Lightbulb, Info, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export type CalloutVariant = "tip" | "info" | "warning" | "critical" | "success";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}

const styles: Record<
  CalloutVariant,
  { bar: string; bg: string; iconColor: string; label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  tip: {
    bar: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-500",
    label: "Tip",
    Icon: Lightbulb,
  },
  info: {
    bar: "bg-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    iconColor: "text-sky-500",
    label: "Good to know",
    Icon: Info,
  },
  warning: {
    bar: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-500",
    label: "Heads up",
    Icon: AlertTriangle,
  },
  critical: {
    bar: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    iconColor: "text-red-500",
    label: "Important",
    Icon: ShieldAlert,
  },
  success: {
    bar: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-500",
    label: "Do this",
    Icon: CheckCircle2,
  },
};

export default function Callout({ variant = "tip", title, children }: CalloutProps) {
  const s = styles[variant];
  const Icon = s.Icon;
  return (
    <div className={`relative rounded-xl ${s.bg} pl-4 pr-4 py-4 my-4 overflow-hidden`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${s.iconColor} shrink-0 mt-0.5`} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {title || s.label}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
