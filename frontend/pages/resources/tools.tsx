import Link from "next/link";
import SEOHead from "../../components/SEOHead";
import ResourceHero from "../../components/resources/ResourceHero";
import ResourceIcon from "../../components/resources/ResourceIcon";
import { Arrow, CategoryChip } from "../../components/resources/ResourceCard";
import { RESOURCE_TOOLS, RESOURCES_IN_PROGRESS } from "../../data/resources";
import { getAllStates } from "../../data/rentalLaws";
import { getAllSuburbs } from "../../data/suburbs";

/**
 * Tools & Checklists - the things you use rather than read.
 *
 * Three cards, and three is the honest number: the rental-law lookup, the
 * suburb comparison and the earnings calculator are built and working. A
 * budget planner, a moving checklist and a document tracker would all
 * belong here, and none of them exist, so none of them are drawn. A card
 * that opens a "coming soon" page costs more trust than an empty row of
 * grid costs polish.
 *
 * The two routes that genuinely are in development are named at the
 * bottom as one line of text, so they stay reachable without being
 * advertised as destinations.
 */

/** Counts read from the same data the tools render, so the page cannot
 *  claim a coverage the tool does not have. */
const TOOL_FACTS: Record<string, string> = {
  "rental-laws": `${getAllStates().length} states and territories`,
  suburbs: `${getAllSuburbs().length} suburbs`,
};

export default function ToolsHub() {
  return (
    <>
      <SEOHead
        title="Tools & Checklists"
        description="Look up rental law in your state, compare suburbs before you commit, and estimate what a spare room could earn."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Tools & Checklists", path: "/resources/tools" },
        ]}
      />

      <ResourceHero
        eyebrow="Resources"
        title="Tools & Checklists"
        lead="Three things that do the work for you: what the law says where you are moving, what a suburb actually costs, and what a spare room could earn."
        crumb="Tools & Checklists"
      />

      <section className="mg-section--sm" aria-labelledby="tools-heading">
        <div className="mg-container mg-container--narrow">
          <h2 id="tools-heading" className="sr-only">
            Available tools
          </h2>

          <ul className="list-none m-0 p-0 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCE_TOOLS.map((tool) => (
              <li key={tool.id}>
                <article className="res-card">
                  <span className="res-icon mb-5">
                    <ResourceIcon name={tool.icon} />
                  </span>

                  <div className="flex items-center gap-2.5 mb-3">
                    <CategoryChip category={tool.category} />
                    {tool.audience && <span className="res-kind">{tool.audience}</span>}
                  </div>

                  <h3 className="res-card__title">
                    <Link href={tool.href} className="res-card__link">
                      {tool.title}
                    </Link>
                  </h3>

                  <p className="res-card__summary mt-2 flex-1">{tool.summary}</p>

                  <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--color-line)]">
                    <span className="res-card__meta">{TOOL_FACTS[tool.id] ?? ""}</span>
                    <Arrow label={tool.action} />
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {/* Named, not advertised. Both routes exist and say plainly that
              they are not ready; linking them as text keeps old bookmarks
              working without promising a tool. */}
          <p className="text-[13px] text-[var(--color-ink-3)] mt-9">
            Also in development:{" "}
            {RESOURCES_IN_PROGRESS.map((item, i) => (
              <span key={item.href}>
                {i > 0 && ", "}
                <Link
                  href={item.href}
                  className="text-[var(--color-ink-2)] underline underline-offset-2 decoration-[var(--color-line-2)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {item.label}
                </Link>
              </span>
            ))}
            .
          </p>
        </div>
      </section>

      <section className="mg-ground-deep mg-section--sm">
        <div className="mg-container mg-container--narrow text-center">
          <h2 className="font-serif text-[26px] sm:text-[32px] leading-[1.12] tracking-[-0.018em]">
            Missing a tool you would use?
          </h2>
          <p className="text-[15px] text-[var(--color-ink-2)] mt-3 max-w-[48ch] mx-auto">
            Tell us what you had to work out by hand. It is the fastest way onto
            this page.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <Link href="/contact" className="btn-primary h-11 px-6 text-sm">
              Suggest a tool
            </Link>
            <Link href="/resources/guides" className="btn-outline h-11 px-6 text-sm">
              Guides & Articles
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
