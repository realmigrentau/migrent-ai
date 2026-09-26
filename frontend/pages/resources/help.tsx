import Head from "next/head";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CreditCard,
  FileText,
  Home,
  Rocket,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import SEOHead from "../../components/SEOHead";
import ResourceHero from "../../components/resources/ResourceHero";
import ResourceSearch from "../../components/resources/ResourceSearch";
import FaqAccordion, { type FaqEntry } from "../../components/resources/FaqAccordion";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  getFeaturedArticles,
  type StaticHelpArticle,
} from "../../lib/helpData";

/**
 * The Help Centre - /faq and /help, which were the same promise twice.
 *
 * /faq held forty translated questions and nothing else. /help held twenty
 * articles, eight categories and a search box, and no FAQ worth the name.
 * Someone looking for "how do I get my bond back" had to guess which of
 * the two the answer lived in, and the navbar offered both, one above the
 * other, with near-identical descriptions.
 *
 * One page now: search across everything, the eight article categories,
 * and all forty questions as linkable disclosures. The article detail
 * routes (/help/:slug, /help/category/:slug) are untouched, so nothing
 * indexed moved.
 *
 * No glossary section: there is no glossary on the site yet, and an empty
 * one would be the kind of placeholder this consolidation exists to
 * remove.
 */

const CATEGORY_ICONS: Record<string, typeof Rocket> = {
  Rocket,
  ShieldCheck,
  Search,
  Home,
  CreditCard,
  AlertTriangle,
  FileText,
  Wrench,
};

/**
 * The six FAQ groups, by i18n key rather than by title.
 *
 * Anchors are built from these keys, so #faq-cat4-q2 points at the same
 * answer whatever language the page is being read in and whatever order
 * the groups are shown in later.
 */
const FAQ_GROUPS = [
  { key: "cat1", count: 6 },
  { key: "cat2", count: 8 },
  { key: "cat3", count: 8 },
  { key: "cat4", count: 6 },
  { key: "cat5", count: 6 },
  { key: "cat6", count: 6 },
] as const;

const RESULTS_ID = "help-results";

export default function HelpCentre() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const groups = useMemo(
    () =>
      FAQ_GROUPS.map((g) => ({
        key: g.key,
        title: t(`faq.${g.key}Title`),
        entries: Array.from({ length: g.count }, (_, i): FaqEntry => {
          const n = i + 1;
          return {
            id: `faq-${g.key}-q${n}`,
            question: t(`faq.${g.key}q${n}`),
            answer: t(`faq.${g.key}a${n}`),
          };
        }),
      })),
    [t],
  );

  const allFaqs = useMemo(() => groups.flatMap((g) => g.entries), [groups]);
  const featured = getFeaturedArticles(null);

  /* One pass over both corpora - twenty articles and forty questions -
     so a search never has to be run twice or scoped by hand. */
  const results = useMemo(() => {
    const terms = deferredQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return { articles: [] as StaticHelpArticle[], faqs: [] as FaqEntry[] };

    const matches = (text: string) => terms.every((term) => text.includes(term));

    return {
      articles: HELP_ARTICLES.filter((a) =>
        matches(`${a.title} ${a.summary} ${a.categoryName} ${a.tags.join(" ")}`.toLowerCase()),
      ),
      faqs: allFaqs.filter((f) => matches(`${f.question} ${f.answer}`.toLowerCase())),
    };
  }, [deferredQuery, allFaqs]);

  const searching = query.trim().length > 0;
  const total = results.articles.length + results.faqs.length;

  /* FAQPage structured data built from the same strings the page renders,
     so the markup can never describe questions a visitor cannot see. */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <SEOHead
        title="Help Centre"
        description="Answers to common questions about MigRent - accounts, verification, searching, listing a room, bookings, payments and safety."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Help Centre", path: "/resources/help" },
        ]}
      />
      <Head>
        <script
          key="ld-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </Head>

      <ResourceHero
        eyebrow="Resources"
        title="Help Centre"
        lead="Quick answers to common questions about MigRent. Search everything at once, browse by topic, or read the questions we are asked most."
        crumb="Help Centre"
      >
        <div className="max-w-[520px]">
          <ResourceSearch
            value={query}
            onChange={setQuery}
            label="Search help articles and questions"
            placeholder="Search help - verify identity, cancel booking..."
            resultsId={RESULTS_ID}
          />
        </div>
      </ResourceHero>

      <div id={RESULTS_ID}>
        {searching ? (
          <section className="mg-section--sm" aria-labelledby="results-heading">
            <div className="mg-container mg-container--narrow">
              <h2 id="results-heading" className="font-serif text-[24px] tracking-[-0.014em]" aria-live="polite">
                {total} {total === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
              </h2>

              {total > 0 ? (
                <div className="mt-7 space-y-10">
                  {results.articles.length > 0 && (
                    <div>
                      <h3 className="eyebrow mb-4">Help articles</h3>
                      <ul className="list-none m-0 p-0 grid gap-4 sm:grid-cols-2">
                        {results.articles.map((a) => (
                          <li key={a.slug}>
                            <article className="res-card">
                              <h4 className="res-card__title">
                                <Link href={`/help/${a.slug}`} className="res-card__link">
                                  {a.title}
                                </Link>
                              </h4>
                              <p className="res-card__summary mt-2 flex-1">{a.summary}</p>
                              <p className="res-card__meta mt-4">
                                {a.categoryName} · {a.readingTime} min read
                              </p>
                            </article>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.faqs.length > 0 && (
                    <div>
                      <h3 className="eyebrow mb-4">Questions</h3>
                      <FaqAccordion entries={results.faqs} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="res-empty mt-7">
                  <p className="font-serif text-[20px] text-[var(--color-ink)]">
                    No answer here matches that.
                  </p>
                  <p className="text-sm text-[var(--color-ink-2)] mt-2 max-w-[46ch] mx-auto">
                    Try fewer words, look for it in the guides, or send it to us and we
                    will answer it properly.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    <button
                      type="button"
                      className="btn-secondary h-11 px-5 text-sm"
                      onClick={() => setQuery("")}
                    >
                      Clear search
                    </button>
                    <Link href="/resources/guides" className="btn-outline h-11 px-5 text-sm">
                      Search the guides
                    </Link>
                    <Link href="/contact" className="btn-outline h-11 px-5 text-sm">
                      Ask us
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="mg-section--sm" aria-labelledby="topics-heading">
              <div className="mg-container mg-container--narrow">
                <h2 id="topics-heading" className="font-serif text-[24px] tracking-[-0.014em]">
                  Browse by topic
                </h2>
                <ul className="list-none m-0 p-0 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-6">
                  {HELP_CATEGORIES.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.icon] ?? FileText;
                    return (
                      <li key={cat.slug}>
                        <article className="res-card !p-5">
                          <span className="res-icon res-icon--sm mb-4">
                            <Icon className="w-[17px] h-[17px]" strokeWidth={1.5} aria-hidden="true" />
                          </span>
                          <h3 className="res-card__title !text-[15px]">
                            <Link href={`/help/category/${cat.slug}`} className="res-card__link">
                              {cat.name}
                            </Link>
                          </h3>
                          <p className="res-card__meta mt-2">
                            {cat.articleCount} {cat.articleCount === 1 ? "article" : "articles"}
                          </p>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            <section className="mg-section--sm pt-0" aria-labelledby="popular-heading">
              <div className="mg-container mg-container--narrow">
                <h2 id="popular-heading" className="font-serif text-[24px] tracking-[-0.014em]">
                  Most read
                </h2>
                <ul className="list-none m-0 p-0 grid gap-4 sm:grid-cols-3 mt-6">
                  {featured.map((a) => (
                    <li key={a.slug}>
                      <article className="res-card">
                        <h3 className="res-card__title">
                          <Link href={`/help/${a.slug}`} className="res-card__link">
                            {a.title}
                          </Link>
                        </h3>
                        <p className="res-card__summary mt-2 flex-1">{a.summary}</p>
                        <p className="res-card__meta mt-4">{a.readingTime} min read</p>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mg-section--sm pt-0" aria-labelledby="faq-heading">
              <div className="mg-container mg-container--narrow">
                <h2 id="faq-heading" className="font-serif text-[24px] tracking-[-0.014em]">
                  Frequently asked questions
                </h2>
                <p className="text-[14.5px] text-[var(--color-ink-2)] mt-2 max-w-[54ch]">
                  {allFaqs.length} answers, all of them linkable: open one and the
                  address bar holds a link straight to it.
                </p>

                <div className="mt-8 space-y-10">
                  {groups.map((group) => (
                    <div key={group.key}>
                      <h3 className="eyebrow mb-3">{group.title}</h3>
                      <FaqAccordion entries={group.entries} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* The guides answer the long questions; say so rather than
                letting someone conclude the site has nothing else. */}
            <section className="mg-section--sm pt-0">
              <div className="mg-container mg-container--narrow">
                <div className="res-card sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                  <div>
                    <h2 className="res-card__title">Looking for the longer version?</h2>
                    <p className="res-card__summary mt-2 max-w-[52ch]">
                      Bond rules, visa categories, scams and dispute steps are covered
                      properly in the guides.
                    </p>
                  </div>
                  <Link
                    href="/resources/guides"
                    className="btn-secondary h-11 px-5 text-sm mt-5 sm:mt-0 shrink-0"
                  >
                    Guides & Articles
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <section className="mg-ground-deep mg-section--sm">
        <div className="mg-container mg-container--narrow text-center">
          <h2 className="font-serif text-[26px] sm:text-[32px] leading-[1.12] tracking-[-0.018em]">
            Still need a person?
          </h2>
          <p className="text-[15px] text-[var(--color-ink-2)] mt-3 max-w-[48ch] mx-auto">
            Real people answer by email on weekdays. We aim to reply within one
            business day.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <Link href="/support/tickets" className="btn-primary h-11 px-6 text-sm">
              Submit a request
            </Link>
            <Link href="/contact" className="btn-outline h-11 px-6 text-sm">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
