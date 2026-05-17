import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  align?: 'left' | 'center';
  display?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  align = 'left',
  display = false,
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
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1
          className={cn(
            'text-[var(--color-ink)] tracking-[-0.02em]',
            display
              ? 'font-serif text-4xl md:text-5xl leading-[1.05] font-normal'
              : 'text-2xl md:text-3xl font-semibold'
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-2)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
