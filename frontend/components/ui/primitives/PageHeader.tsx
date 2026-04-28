import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  align?: 'left' | 'center';
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  align = 'left',
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8',
        align === 'center' && 'md:flex-col md:items-center text-center',
        className
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
