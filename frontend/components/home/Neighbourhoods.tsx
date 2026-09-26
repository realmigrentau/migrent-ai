import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal, SectionHead } from "./primitives";

/**
 * Where you can live.
 *
 * The page used to answer this twice - a four-tile city grid, then a
 * separate suburb gallery eight sections later. They are one section now:
 * the cities are capsules under the heading, and the suburbs pass in two
 * rows drifting against each other as you scroll. Every link that existed
 * in either section still exists here.
 */

const CITIES = [
  { city: "Sydney", note: "Surry Hills to Parramatta" },
  { city: "Melbourne", note: "Carlton to Footscray" },
  { city: "Brisbane", note: "West End to South Bank" },
  { city: "More soon", note: "Perth & Adelaide next" },
];

/**
 * Paths are the canonical two-segment form, /suburb/<state>/<slug>, because
 * a bare name is ambiguous nationally - there are two West Ends in Queensland
 * alone, and the single-segment URL now only exists to redirect.
 *
 * Six of these had no `slug` and rendered as dead tiles, because only sixteen
 * suburbs had pages. Every Australian suburb has one now, so they link.
 * South Bank is the exception and stays unlinked on purpose: it is a precinct
 * within South Brisbane, not a suburb the ABS publishes.
 */
const SUBURBS: { s: string; c: string; href?: string }[] = [
  { s: "Marrickville", c: "Sydney", href: "/suburb/nsw/marrickville" },
  { s: "Carlton", c: "Melbourne", href: "/suburb/vic/carlton" },
  { s: "West End", c: "Brisbane", href: "/suburb/qld/west-end-brisbane" },
  { s: "Newtown", c: "Sydney", href: "/suburb/nsw/newtown" },
  { s: "Brunswick", c: "Melbourne", href: "/suburb/vic/brunswick" },
  { s: "South Bank", c: "Brisbane" },
  { s: "Footscray", c: "Melbourne", href: "/suburb/vic/footscray" },
  { s: "Surry Hills", c: "Sydney", href: "/suburb/nsw/surry-hills" },
  { s: "Fitzroy", c: "Melbourne", href: "/suburb/vic/fitzroy" },
  { s: "Glebe", c: "Sydney", href: "/suburb/nsw/glebe" },
  { s: "St Kilda", c: "Melbourne", href: "/suburb/vic/st-kilda" },
  { s: "Paddington", c: "Brisbane", href: "/suburb/qld/paddington" },
];

function Tile({ s, c, href, muted }: { s: string; c: string; href?: string; muted?: boolean }) {
  const face = (
    <div className="mg-tile__body">
      <div className="text-[21px] font-medium tracking-[-0.02em] leading-none">{s}</div>
      <div className="text-[11px] tracking-[0.14em] uppercase mt-2 text-white/85">
        {c}
        {href && !muted && <span className="text-white"> · Guide</span>}
      </div>
    </div>
  );

  // The rows repeat so the drift never runs out of tiles. The repeat is
  // decoration: it is hidden from assistive tech and kept out of the tab
  // order, so no link on this page is announced twice.
  if (muted || !href) {
    return (
      <div className="mg-tile" aria-hidden="true">
        {face}
      </div>
    );
  }

  return (
    <Link href={href} className="mg-tile" aria-label={`${s}, ${c} suburb guide`}>
      {face}
    </Link>
  );
}

export default function Neighbourhoods() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const xA = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-12%", "2%"]);
  const xB = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["2%", "-12%"]);

  const rowA = SUBURBS.slice(0, 6);
  const rowB = SUBURBS.slice(6);

  return (
    <section ref={ref} className="mg-section mg-band--sand overflow-hidden" aria-labelledby="places-heading">
      <div className="mg-shell">
        <Reveal>
          <SectionHead
            eyebrow="Where you can live"
            heading="Real rooms, in real"
            emphasis="neighbourhoods."
            headingId="places-heading"
            aside={
              <Link href="/suburbs" className="mg-link">
                All suburb guides <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            }
          />
        </Reveal>

        <Reveal delay={0.06}>
          <ul className="list-none m-0 p-0 mt-8 flex flex-wrap gap-2.5">
            {CITIES.map((c) => (
              <li key={c.city}>
                <Link href="/suburbs" className="mg-chip h-11 px-5">
                  <span className="text-[14px] font-semibold text-[var(--color-ink)]">{c.city}</span>
                  <span className="text-[12.5px] text-[var(--color-ink-3)] hidden sm:inline">{c.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="mt-11 space-y-4">
        <motion.div style={{ x: xA }} className="mg-drift">
          {[...rowA, ...rowA].map((t, i) => (
            <Tile key={`a${i}`} s={t.s} c={t.c} href={t.href} muted={i >= rowA.length} />
          ))}
        </motion.div>
        <motion.div style={{ x: xB }} className="mg-drift">
          {[...rowB, ...rowB].map((t, i) => (
            <Tile key={`b${i}`} s={t.s} c={t.c} href={t.href} muted={i >= rowB.length} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
