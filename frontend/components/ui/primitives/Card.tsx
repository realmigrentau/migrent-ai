import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'interactive' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const padMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

const variantMap = {
  default:
    'bg-[var(--color-surface)] border border-[var(--color-line)]',
  muted:
    'bg-[var(--color-surface-muted)] border border-[var(--color-line)]',
  elevated:
    'bg-[var(--color-surface-2)] border border-[var(--color-line)] shadow-[var(--shadow-soft)]',
  interactive:
    'bg-[var(--color-surface)] border border-[var(--color-line)] hover:border-[var(--color-line-2)] hover:shadow-[var(--shadow-card)] transition-all duration-200 cursor-pointer',
} as const;

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div className={cn('rounded-[14px]', variantMap[variant], padMap[padding], className)} {...rest}>
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
        <h3 className="text-lg font-semibold text-[var(--color-ink)] tracking-[-0.012em]">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-ink-2)]">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
