import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'info' | 'success' | 'warning' | 'danger';

interface BannerProps {
  tone?: Tone;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const toneMap: Record<Tone, string> = {
  info: 'bg-sky-50 border-sky-200/70 text-sky-900',
  success: 'bg-emerald-50 border-emerald-200/70 text-emerald-900',
  warning: 'bg-amber-50 border-amber-200/70 text-amber-900',
  danger: 'bg-rose-50 border-rose-200/70 text-rose-900',
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
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3',
        toneMap[tone],
        className
      )}
    >
      {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
      <div className="flex-1 min-w-0">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {children && <div className="text-sm leading-relaxed">{children}</div>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-md hover:bg-black/5 transition-colors"
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
