import Link from "next/link";
import type { ResourceCategory } from "../../data/resources";

/** Category -> chip modifier. Kept beside the card because the card is the
 *  only place a chip is drawn, and the mapping is the whole reason five
 *  categories read as one family. */
const CHIP_CLASS: Record<ResourceCategory, string> = {
  Housing: "res-chip--housing",
  Hosting: "res-chip--hosting",
  Money: "res-chip--money",
  "Visas & rights": "res-chip--rights",
  Safety: "res-chip--safety",
};

export function CategoryChip({ category }: { category: ResourceCategory }) {
  return <span className={`res-chip ${CHIP_CLASS[category]}`}>{category}</span>;
}

export function Arrow({ label }: { label: string }) {
  return (
    <span className="res-arrow">
      {label}
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </span>
  );
}

/**
 * One article in a grid.
 *
 * The heading carries the link and .res-card__link stretches it over the
 * whole card, so the card is one target and one tab stop: the chips and
 * the meta line underneath are not separately focusable, and a screen
 * reader hears one link named after the article rather than three links
 * called "Housing", the title, and "Read".
 */
export default function ResourceCard({
  href,
  title,
  summary,
  category,
  kind,
  readMinutes,
  date,
}: {
  href: string;
  title: string;
  summary: string;
  category: ResourceCategory;
  kind: string;
  readMinutes: number;
  date?: string;
}) {
  return (
    <article className="res-card">
      <div className="flex items-center gap-2.5 mb-3.5">
        <CategoryChip category={category} />
        <span className="res-kind">{kind}</span>
      </div>

      <h3 className="res-card__title">
        <Link href={href} className="res-card__link">
          {title}
        </Link>
      </h3>

      <p className="res-card__summary mt-2 flex-1">{summary}</p>

      <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--color-line)]">
        <span className="res-card__meta">
          {readMinutes} min read
          {date ? ` · ${date}` : ""}
        </span>
        <Arrow label="Read" />
      </div>
    </article>
  );
}
