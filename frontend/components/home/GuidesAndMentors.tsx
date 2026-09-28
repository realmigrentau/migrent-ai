import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { Reveal, SectionHead } from "../site";

/**
 * Reading, and a person to ask. Three real articles (the props come from
 * data/ at build time, so a renamed article cannot leave a dead card) and
 * a small door to the mentors, who are real people rather than a feature.
 */

export interface ArticleCard {
  href: string;
  title: string;
  excerpt: string;
  kind: string;
  readTime: string;
}

export default function GuidesAndMentors({ articles = [] }: { articles?: ArticleCard[] }) {
  return (
    <section className="site-section" aria-labelledby="guides-heading">
      <div className="site-shell">
        <Reveal>
          <SectionHead
            eyebrow="Guides"
            id="guides-heading"
            heading={
              <>
                Land well, with the <strong>basics covered.</strong>
              </>
            }
            aside={
              <Link href="/guides" className="site-link">
                All guides <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-3 lg:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal as="li" key={a.href} delay={i * 0.05}>
                <Link href={a.href} className="site-card site-card--pad flex h-full flex-col">
                  <p className="site-meta">
                    {a.kind} · {a.readTime}
                  </p>
                  <h3 className="site-h3 mt-3">{a.title}</h3>
                  <p className="site-body mt-2 line-clamp-3">{a.excerpt}</p>
                  <span className="site-link mt-auto pt-5 text-[14px]">
                    Read <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.12} className="site-card site-card--muted site-card--pad flex flex-col">
            <span className="site-icon" aria-hidden="true">
              <HeartHandshake className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <h3 className="site-h3 site-h3--lg mt-5">Talk to someone who has made the move</h3>
            <p className="site-body mt-2">
              Mentors are people who arrived in Australia too. Ask them about suburbs, leases and settling in.
            </p>
            <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-6">
              <Link href="/mentors" className="site-link">
                Meet the mentors <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
              <Link href="/become-mentor" className="site-link">
                Become one
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
