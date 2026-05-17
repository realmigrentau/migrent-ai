interface LogoProps {
  size?: number;
  className?: string;
  title?: string;
}

export function Logo({ size = 28, className, title = 'MigRent' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      aria-label={title}
      role="img"
      className={className}
      style={{ display: 'block' }}
    >
      <path
        d="M3.5 22.5V8.5l4-3.5 4 6 2.5-2.5L18.5 11l4-3.5v15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="14" cy="14.5" r="1.4" fill="currentColor" />
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
        MigRent
      </span>
      {showAU && (
        <span className="eyebrow ml-0.5 mt-0.5">AU</span>
      )}
    </span>
  );
}
