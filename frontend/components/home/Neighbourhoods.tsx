import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal, SectionHead } from "../site";

/**
 * Where you could live, with real numbers.
 *
 * Two rows of suburb cards drift past each other as the page scrolls. Every
 * figure on them comes from the ABS 2021 Census through the suburb
 * directory (data/suburbs, loaded in getStaticProps), and every card links
 * to that suburb's guide. The repeat that keeps a row from running out is
 * decoration: hidden from assistive tech and out of the tab order.
 */

export interface FeaturedSuburb {
  name: string;
  city: string;
  href: string;
  medianRent: number | null;
  overseasBornPct: number | null;
}

function SuburbCard({ s, repeat }: { s: FeaturedSuburb; repeat?: boolean }) {
  const body = (
    <>
      <p className="site-meta">{s.city}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-[25px] font-normal leading-[1.1] tracking-[-0.014em] text-[color:var(--color-ink)]">
        {s.name}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <dt className="site-meta">Median rent</dt>
          <dd className="m-0 text-[16px] font-bold tabular-nums text-[color:var(--color-ink)]">{s.medianRent ? `$${s.medianRent}/wk` : "Not published"}</dd>
        </div>
        <div>
          <dt className="site-meta">Born overseas</dt>
          <dd className="m-0 text-[16px] font-bold tabular-nums text-[color:var(--color-ink)]">
            {s.overseasBornPct != null ? `${Math.round(s.overseasBornPct)}%` : "Not published"}
          </dd>
        </div>
      </dl>
    </>
  );
  if (repeat) {
    return (
      <div className="site-card site-card--pad w-[clamp(240px,24vw,290px)] shrink-0" aria-hidden="true">
        {body}
      </div>
    );
  }
  return (
    <Link href={s.href} className="site-card site-card--pad w-[clamp(240px,24vw,290px)] shrink-0" aria-label={`${s.name}, ${s.city}: suburb guide`}>
      {body}
    </Link>
  );
}

export default function Neighbourhoods({ suburbs = [] }: { suburbs?: FeaturedSuburb[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const xA = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-14%", "2%"]);
  const xB = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["2%", "-14%"]);

  if (suburbs.length === 0) return null;
  const half = Math.ceil(suburbs.length / 2);
  const rowA = suburbs.slice(0, half);
  const rowB = suburbs.slice(half);

  return (
    <section ref={ref} className="site-section overflow-hidden" aria-labelledby="places-heading">
      <div className="site-shell">
        <Reveal>
          <SectionHead
            eyebrow="Where you could live"
            id="places-heading"
            heading={
              <>
                Real suburbs, <strong>real numbers.</strong>
              </>
            }
            lead="Rent and community figures for every suburb in Australia, from the 2021 Census."
            aside={
              <Link href="/suburbs" className="site-link">
                All suburb guides <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            }
          />
        </Reveal>
      </div>

      {reduced ? (
        <ul className="site-shell m-0 mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {suburbs.map((s) => (
            <li key={s.href} className="[&>*]:w-full">
              <SuburbCard s={s} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 space-y-4">
          <motion.div style={{ x: xA }} className="flex w-max gap-4">
            {[...rowA, ...rowA].map((s, i) => (
              <SuburbCard key={`a${i}`} s={s} repeat={i >= rowA.length} />
            ))}
          </motion.div>
          <motion.div style={{ x: xB }} className="flex w-max gap-4">
            {[...rowB, ...rowB].map((s, i) => (
              <SuburbCard key={`b${i}`} s={s} repeat={i >= rowB.length} />
            ))}
          </motion.div>
        </div>
      )}
      <p className="site-shell site-meta mt-6">Source: Australian Bureau of Statistics, Census of Population and Housing 2021.</p>
    </section>
  );
}
