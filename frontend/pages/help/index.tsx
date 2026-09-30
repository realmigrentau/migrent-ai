import { useDeferredValue, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CreditCard, FileText, Home, Mail, Rocket, Search, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import { CloseCard, Faq, PageHero, Reveal, SectionHead } from "../../components/site";
import { HELP_ARTICLES, HELP_CATEGORIES, HELP_FAQ, getFeaturedArticles } from "../../lib/helpData";
import { siteIdentity, supportPromise } from "../../lib/siteIdentity";

/**
 * Help: answers first, then topics, then a person.
 *
 * Replaces /resources/help and /faq. The questions are rewritten to match
 * the product as it is (lib/helpData.ts), and the search runs over both
 * the questions and the articles at once.
 */

const ICONS: Record<string, LucideIcon> = { Rocket, ShieldCheck, Search, Home, CreditCard, AlertTriangle, FileText, Wrench };

export default function HelpCentre() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const featured = getFeaturedArticles().slice(0, 6);
  const allFaqs = useMemo(() => HELP_FAQ.flatMap((g) => g.items), []);

  const results = useMemo(() => {
    const terms = deferred.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return null;
    const hit = (text: string) => terms.every((t) => text.includes(t));
    return {
      articles: HELP_ARTICLES.filter((a) => hit(`${a.title} ${a.summary} ${a.categoryName} ${a.tags.join(" ")}`.toLowerCase())),
      faqs: allFaqs.filter((f) => hit(`${f.q} ${f.a}`.toLowerCase())),
    };
  }, [deferred, allFaqs]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <SEOHead
        title="Help"
        description="Answers about renting and hosting with Migrent: applications, inspections, ID checks, fees, bonds, safety and your account."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Help", path: "/help" },
        ]}
      />
      <Head>
        <script key="ld-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      </Head>

      <PageHero
        eyebrow="Help"
        crumbs={[{ label: "Home", href: "/" }, { label: "Help" }]}
        title={
          <>
            How can we <strong>help?</strong>
          </>
        }
        lead="Search the answers, browse by topic, or write to a person."
      >
        <form role="search" className="mt-8 max-w-[560px]" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="help-search" className="site-search">
            <Search className="site-search__icon" strokeWidth={1.9} aria-hidden="true" />
            <span className="sr-only">Search help</span>
            <input
              id="help-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: bond, inspection, delete account"
              aria-controls="help-results"
            />
          </label>
        </form>
      </PageHero>

      <div id="help-results" aria-live="polite">
        {results ? (
          <section className="site-section site-section--flush" aria-labelledby="results-heading">
            <div className="site-shell site-shell--narrow">
              <h2 id="results-heading" className="site-h3 site-h3--lg">
                {results.articles.length + results.faqs.length} {results.articles.length + results.faqs.length === 1 ? "result" : "results"} for &ldquo;{query.trim()}&rdquo;
              </h2>
              {results.articles.length + results.faqs.length === 0 ? (
                <p className="site-body mt-4">
                  Nothing matched. Try fewer words, or <Link href="/contact" className="underline underline-offset-2">ask us directly</Link>.
                </p>
              ) : (
                <div className="mt-6 flex flex-col gap-8">
                  {results.faqs.length > 0 && <Faq items={results.faqs.map((f) => ({ q: f.q, a: f.a }))} openFirst={false} />}
                  {results.articles.length > 0 && (
                    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
                      {results.articles.map((a) => (
                        <li key={a.slug}>
                          <Link href={`/help/${a.slug}`} className="site-card site-card--pad flex h-full flex-col">
                            <p className="site-meta">{a.categoryName}</p>
                            <h3 className="site-h3 mt-2">{a.title}</h3>
                            <p className="site-body mt-1.5">{a.summary}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="site-section site-section--flush" aria-labelledby="popular-heading">
              <div className="site-shell">
                <h2 id="popular-heading" className="eyebrow mb-5">
                  Most read
                </h2>
                <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((a, i) => (
                    <Reveal as="li" key={a.slug} delay={(i % 3) * 0.04}>
                      <Link href={`/help/${a.slug}`} className="site-card site-card--pad flex h-full flex-col">
                        <p className="site-meta">{a.categoryName}</p>
                        <h3 className="site-h3 mt-2">{a.title}</h3>
                        <p className="site-body mt-1.5 flex-1">{a.summary}</p>
                        <span className="site-link mt-4 text-[14px]">
                          Read <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                        </span>
                      </Link>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </section>

            <section className="site-section" aria-labelledby="questions-heading">
              <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
                <Reveal className="lg:sticky lg:top-28 lg:self-start">
                  <SectionHead
                    eyebrow="Common questions"
                    id="questions-heading"
                    heading={
                      <>
                        Quick <strong>answers.</strong>
                      </>
                    }
                  />
                </Reveal>
                <div className="flex flex-col gap-10">
                  {HELP_FAQ.map((g) => (
                    <div key={g.id} id={`faq-${g.id}`} className="scroll-mt-28">
                      <h3 className="site-h3 mb-2">{g.title}</h3>
                      <Faq items={g.items.map((f) => ({ q: f.q, a: f.a }))} openFirst={false} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="site-section site-section--tight" aria-labelledby="topics-heading">
              <div className="site-shell">
                <Reveal>
                  <SectionHead
                    eyebrow="Topics"
                    id="topics-heading"
                    heading={
                      <>
                        Browse by <strong>topic.</strong>
                      </>
                    }
                  />
                </Reveal>
                <ul className="m-0 mt-8 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
                  {HELP_CATEGORIES.filter((c) => c.articleCount > 0).map((c, i) => {
                    const Icon = ICONS[c.icon] ?? FileText;
                    return (
                      <Reveal as="li" key={c.slug} delay={(i % 4) * 0.04}>
                        <Link href={`/help/category/${c.slug}`} className="site-card site-card--pad flex h-full flex-col">
                          <span className="site-icon" aria-hidden="true">
                            <Icon className="h-5 w-5" strokeWidth={1.9} />
                          </span>
                          <h3 className="site-h3 mt-4">{c.name}</h3>
                          <p className="site-body mt-1.5 flex-1">{c.description}</p>
                          <p className="site-meta mt-4">
                            {c.articleCount} {c.articleCount === 1 ? "article" : "articles"}
                          </p>
                        </Link>
                      </Reveal>
                    );
                  })}
                </ul>
              </div>
            </section>
          </>
        )}
      </div>

      <section className="site-section site-section--tight" aria-labelledby="person-heading">
        <div className="site-shell">
          <Reveal className="site-card site-card--pad grid gap-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
            <span className="site-icon" aria-hidden="true">
              <Mail className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div>
              <h2 id="person-heading" className="site-h3 site-h3--lg">
                Still stuck? Write to a person.
              </h2>
              <p className="site-body mt-1">
                {supportPromise()} Email {siteIdentity.emails.support} or use the form.
              </p>
            </div>
            <Link href="/contact" className="btn-primary">
              Contact us <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <CloseCard
        heading="Looking for your next home?"
        primary={{ label: "Search rooms", href: "/seeker/search" }}
        secondary={{ label: "How renting works", href: "/how-renting-works" }}
      />
    </>
  );
}
