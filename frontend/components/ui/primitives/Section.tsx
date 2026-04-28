import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: 'tight' | 'normal' | 'loose';
  container?: 'reading' | 'app' | 'marketing' | 'form' | 'full';
  children: ReactNode;
}

const spacingMap = {
  tight: 'py-6 md:py-8',
  normal: 'py-8 md:py-12',
  loose: 'py-16 md:py-24',
} as const;

const containerMap = {
  reading: 'max-w-3xl',
  app: 'max-w-7xl',
  marketing: 'max-w-6xl',
  form: 'max-w-xl',
  full: 'max-w-none',
} as const;

export function Section({
  spacing = 'normal',
  container = 'app',
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section className={cn(spacingMap[spacing], className)} {...rest}>
      <div className={cn('mx-auto px-4 md:px-6', containerMap[container])}>{children}</div>
    </section>
  );
}
