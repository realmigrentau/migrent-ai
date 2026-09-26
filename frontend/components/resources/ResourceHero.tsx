import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The compact hero every Resources page opens with.
 *
 * Deliberately short: an eyebrow, one H1, one line of support, and
 * whatever the page needs next (usually the search field). The old
 * /resources hero was a 20rem block of blurred blobs before you reached a
 * single link; on a 375px screen that was the entire first screen spent on
 * decoration.
 *
 * Breadcrumbs are semantic - a nav with an ordered list and
 * aria-current on the leaf - and the matching BreadcrumbList JSON-LD is
 * emitted by SEOHead from the same array, so the two cannot disagree.
 */
export default function ResourceHero({
  eyebrow,
  title,
  lead,
  crumb,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  /** The page itself. "Resources" is always the parent above it, and Home
   *  above that; pass undefined on the /resources landing page. */
  crumb?: string;
  children?: ReactNode;
}) {
  return (
    <section className="mg-section--sm pt-8 pb-0">
      <div className="mg-container mg-container--narrow">
        <nav aria-label="Breadcrumb" className="mb-7">
          <ol className="flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--color-ink-3)] list-none m-0 p-0">
            <li>
              <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              {crumb ? (
                <Link href="/resources" className="hover:text-[var(--color-ink)] transition-colors">
                  Resources
                </Link>
              ) : (
                <span className="text-[var(--color-ink-2)] font-medium" aria-current="page">
                  Resources
                </span>
              )}
            </li>
            {crumb && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <span className="text-[var(--color-ink-2)] font-medium" aria-current="page">
                    {crumb}
                  </span>
                </li>
              </>
            )}
          </ol>
        </nav>

        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-serif text-[34px] sm:text-[42px] lg:text-[48px] leading-[1.06] tracking-[-0.02em] text-[var(--color-ink)] mt-3 max-w-[18ch]">
          {title}
        </h1>
        <p className="text-[15.5px] leading-[1.6] text-[var(--color-ink-2)] mt-4 max-w-[58ch]">{lead}</p>

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
