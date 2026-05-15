import { ReactNode } from "react";

type CalloutVariant = "info" | "tip" | "warning" | "critical" | "legal";

const styles: Record<CalloutVariant, { wrap: string; icon: string; iconPath: ReactNode; label: string }> = {
  info: {
    wrap: "bg-sky-50/60 dark:bg-sky-500/5 border-sky-200/70 dark:border-sky-500/20",
    icon: "text-sky-600 dark:text-sky-400",
    iconPath: <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    label: "Info",
  },
  tip: {
    wrap: "bg-emerald-50/60 dark:bg-emerald-500/5 border-emerald-200/70 dark:border-emerald-500/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    iconPath: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
    label: "Tip",
  },
  warning: {
    wrap: "bg-amber-50/60 dark:bg-amber-500/5 border-amber-200/70 dark:border-amber-500/20",
    icon: "text-amber-600 dark:text-amber-400",
    iconPath: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    label: "Heads up",
  },
  critical: {
    wrap: "bg-rose-50/60 dark:bg-rose-500/5 border-rose-200/70 dark:border-rose-500/20",
    icon: "text-rose-600 dark:text-rose-400",
    iconPath: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    label: "Important",
  },
  legal: {
    wrap: "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800",
    icon: "text-slate-600 dark:text-slate-400",
    iconPath: <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3" />,
    label: "Legal",
  },
};

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

export default function Callout({ variant = "info", title, children }: CalloutProps) {
  const s = styles[variant];
  return (
    <div className={`rounded-xl border ${s.wrap} p-4 md:p-5`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${s.icon} mt-0.5`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            {s.iconPath}
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          {title && (
            <p className={`text-sm font-semibold ${s.icon} mb-1`}>
              {title}
            </p>
          )}
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
