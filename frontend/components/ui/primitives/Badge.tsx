import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'solid';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: 'xs' | 'sm' | 'md';
  icon?: ReactNode;
}

const toneMap: Record<Tone, string> = {
  neutral: 'bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] border border-[var(--color-line)]',
  brand: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-transparent',
  success: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-transparent',
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-transparent',
  warning: 'bg-[#f4e4cf] text-[var(--color-warn-500)] border border-transparent dark:bg-[#2c1e10]',
  danger: 'bg-[#f1d8d4] text-[var(--color-danger-500)] border border-transparent dark:bg-[#2b1614]',
  info: 'bg-[var(--color-primary-soft)] text-[var(--color-info-500)] border border-transparent',
  solid: 'bg-[var(--color-ink)] text-[var(--color-bg)] border border-transparent',
};

const sizeMap = {
  xs: 'h-[18px] text-[10.5px] px-1.5 gap-[3px]',
  sm: 'h-[22px] text-[11.5px] px-2 gap-1',
  md: 'h-[26px] text-[12.5px] px-2.5 gap-1.5',
} as const;

export function Badge({
  tone = 'neutral',
  size = 'sm',
  icon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold tracking-[0.01em] rounded-full whitespace-nowrap',
        toneMap[tone],
        sizeMap[size],
        className
      )}
      {...rest}
    >
      {icon && <span className="text-current flex">{icon}</span>}
      {children}
    </span>
  );
}
