import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const padMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

const variantMap = {
  default: 'bg-white border border-slate-200/70 dark:bg-slate-900 dark:border-slate-800',
  muted: 'bg-slate-50 border border-slate-200/70 dark:bg-slate-800/40 dark:border-slate-800',
  interactive:
    'bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(16,24,40,0.06)] transition-all duration-200 cursor-pointer dark:bg-slate-900 dark:border-slate-800',
} as const;

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div className={cn('rounded-2xl', variantMap[variant], padMap[padding], className)} {...rest}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
