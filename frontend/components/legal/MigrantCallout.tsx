import { Globe, Phone } from "lucide-react";
import { ReactNode } from "react";

interface MigrantCalloutProps {
  title?: string;
  children: ReactNode;
  showInterpreterLine?: boolean;
}

export default function MigrantCallout({
  title = "Important for Migrants & International Students",
  children,
  showInterpreterLine = true,
}: MigrantCalloutProps) {
  return (
    <div className="card p-5 rounded-2xl border-l-4 border-l-teal-500 bg-teal-50/50 dark:bg-teal-500/5 space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
        {children}
      </div>
      {showInterpreterLine && (
        <div className="flex items-center gap-2 pt-2 border-t border-teal-200/50 dark:border-teal-500/20">
          <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
            Free interpreter service: TIS National - 131 450
          </p>
        </div>
      )}
    </div>
  );
}
