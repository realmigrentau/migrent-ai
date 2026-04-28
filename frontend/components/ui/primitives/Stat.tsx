import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  delta?: { value: ReactNode; trend?: 'up' | 'down' | 'flat' };
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const trendColor = {
  up: 'text-emerald-600',
  down: 'text-rose-600',
  flat: 'text-slate-500',
} as const;

export function Stat({ label, value, delta, hint, icon, className }: StatProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {value}
        </div>
        {delta && (
          <span className={cn('text-xs font-medium tabular-nums', trendColor[delta.trend ?? 'flat'])}>
            {delta.value}
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
