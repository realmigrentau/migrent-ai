import { useId } from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Migrent's mark: a house with a key for its door (chosen 3 October 2026).
 * Drawn in currentColor with the key cut out, so it sits on any background.
 * The same drawing makes the app icons and favicon (public/icons, favicon.ico).
 */
export function Logo({ size = 28, className, title = 'Migrent' }: LogoProps) {
  const mask = `migrent-key-${useId().replace(/:/g, '')}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="-33 -33 66 66"
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      className={className}
      style={{ display: 'block' }}
    >
      <mask id={mask}>
        <rect x="-33" y="-33" width="66" height="66" fill="#fff" />
        <g fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round">
          <circle cx="-12" cy="12" r="7" />
          <line x1="-5" y1="12" x2="20" y2="12" />
          <line x1="12" y1="12" x2="12" y2="19" />
          <line x1="19" y1="12" x2="19" y2="17" />
        </g>
      </mask>
      <path
        d="M-30 -2 L0 -30 L30 -2 V30 H-30 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
        mask={`url(#${mask})`}
      />
    </svg>
  );
}

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  showAU?: boolean;
  className?: string;
}

export function Wordmark({ size = 'md', showAU = false, className }: WordmarkProps) {
  const fontSize = size === 'sm' ? 18 : size === 'md' ? 22 : 28;
  const logoSize = size === 'sm' ? 22 : size === 'md' ? 26 : 32;
  return (
    <span className={['inline-flex items-center gap-2.5 text-[var(--color-ink)]', className].filter(Boolean).join(' ')}>
      <Logo size={logoSize} />
      <span
        className="font-serif tracking-[-0.012em]"
        style={{ fontSize, lineHeight: 1 }}
      >
        Migrent
      </span>
      {showAU && (
        <span className="eyebrow ml-0.5 mt-0.5">AU</span>
      )}
    </span>
  );
}
