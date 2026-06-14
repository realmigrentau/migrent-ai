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
    <div className="card p-5 rounded-2xl border-l-4 border-l-teal-500 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)] space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-[var(--color-primary)] dark:text-[var(--color-primary)]" />
        <h3 className="text-sm font-bold text-[var(--color-ink)]">{title}</h3>
      </div>
      <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-2">
        {children}
      </div>
      {showInterpreterLine && (
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-primary-100)] dark:border-[var(--color-line)]">
          <Phone className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-primary)]" />
          <p className="text-xs text-[var(--color-primary-700)] dark:text-[var(--color-primary)] font-medium">
            Free interpreter service: TIS National - 131 450
          </p>
        </div>
      )}
    </div>
  );
}
