import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6 max-w-sm mx-auto',
        className
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-sunk)] text-[var(--color-ink-3)] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--color-ink)] tracking-[-0.012em]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm text-[var(--color-ink-2)] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
