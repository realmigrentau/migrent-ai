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
  up: 'text-[var(--color-accent)]',
  down: 'text-[var(--color-danger-500)]',
  flat: 'text-[var(--color-ink-3)]',
} as const;

export function Stat({ label, value, delta, hint, icon, className }: StatProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="eyebrow flex items-center gap-2">
        {icon && <span className="text-[var(--color-ink-4)]">{icon}</span>}
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] tabular-nums">
          {value}
        </div>
        {delta && (
          <span className={cn('text-xs font-medium tabular-nums', trendColor[delta.trend ?? 'flat'])}>
            {delta.value}
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-[var(--color-ink-3)]">{hint}</div>}
    </div>
  );
}
