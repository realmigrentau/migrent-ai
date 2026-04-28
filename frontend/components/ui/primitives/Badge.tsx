import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

const toneMap: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200/70',
  brand: 'bg-teal-50 text-teal-700 border-teal-200/70',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/70',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/70',
  info: 'bg-sky-50 text-sky-700 border-sky-200/70',
  accent: 'bg-amber-50 text-amber-700 border-amber-200/70',
};

const sizeMap = {
  sm: 'text-[11px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
} as const;

export function Badge({
  tone = 'neutral',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border',
        toneMap[tone],
        sizeMap[size],
        className
      )}
      {...rest}
    >
      {icon && <span className="text-current">{icon}</span>}
      {children}
    </span>
  );
}
