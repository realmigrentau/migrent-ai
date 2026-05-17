import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

interface BannerProps {
  tone?: Tone;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const toneMap: Record<Tone, { bg: string; border: string; fg: string }> = {
  info: {
    bg: 'bg-[#dde4ec] dark:bg-[#182230]',
    border: 'border-l-[var(--color-info-500)]',
    fg: 'text-[var(--color-info-500)]',
  },
  success: {
    bg: 'bg-[var(--color-accent-soft)]',
    border: 'border-l-[var(--color-accent)]',
    fg: 'text-[var(--color-accent)]',
  },
  warning: {
    bg: 'bg-[#f4e4cf] dark:bg-[#2c1e10]',
    border: 'border-l-[var(--color-warn-500)]',
    fg: 'text-[var(--color-warn-500)]',
  },
  danger: {
    bg: 'bg-[#f1d8d4] dark:bg-[#2b1614]',
    border: 'border-l-[var(--color-danger-500)]',
    fg: 'text-[var(--color-danger-500)]',
  },
  neutral: {
    bg: 'bg-[var(--color-surface-sunk)]',
    border: 'border-l-[var(--color-line-2)]',
    fg: 'text-[var(--color-ink)]',
  },
};

export function Banner({
  tone = 'info',
  icon,
  title,
  children,
  action,
  onDismiss,
  className,
}: BannerProps) {
  const t = toneMap[tone];
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[6px] border-l-[3px] px-3.5 py-2.5',
        t.bg,
        t.border,
        className
      )}
    >
      {icon && <span className={cn('flex-shrink-0 mt-0.5', t.fg)}>{icon}</span>}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="text-[13.5px] font-semibold text-[var(--color-ink)]">{title}</div>
        )}
        {children && (
          <div className={cn('text-[13px] leading-relaxed text-[var(--color-ink-2)]', title ? 'mt-0.5' : null)}>
            {children}
          </div>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-md text-[var(--color-ink-3)] hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
