import type { ReactNode } from "react";

/**
 * A page with one message: 404, 500, and the pages Stripe sends people back
 * to after a checkout. The sky from PageHero, the message centred in it, and
 * at most two actions. Routes using it are in Layout's SITE_KIT list, so
 * they draw their own sky under the floating header.
 */
export default function StatusPage({
  icon,
  tone = "neutral",
  eyebrow,
  title,
  children,
  actions,
  after,
}: {
  icon: ReactNode;
  tone?: "neutral" | "success" | "warn" | "primary";
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  /** Anything that belongs under the message, such as a short list of next steps. */
  after?: ReactNode;
}) {
  return (
    <header className="page-hero page-hero--status">
      <div className="site-shell site-shell--text flex flex-col items-center text-center">
        <span className={`site-status-icon ${tone === "neutral" ? "" : `site-status-icon--${tone}`}`} aria-hidden="true">
          {icon}
        </span>
        {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
        <h1 className="site-display mt-3 max-w-[16ch]">{title}</h1>
        {children && <div className="site-lead mt-5 max-w-[52ch] space-y-3">{children}</div>}
        {actions && <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
        {after && <div className="mt-10 w-full max-w-[520px] text-left">{after}</div>}
      </div>
    </header>
  );
}
