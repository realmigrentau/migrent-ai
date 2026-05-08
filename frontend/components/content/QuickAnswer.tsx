import { Sparkles } from "lucide-react";

interface QuickAnswerProps {
  children: React.ReactNode;
  gradient?: string;
}

export default function QuickAnswer({
  children,
  gradient = "from-blue-500 to-indigo-500",
}: QuickAnswerProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden my-6">
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />
      <div className="p-5 flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
        >
          <Sparkles className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Quick answer
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
