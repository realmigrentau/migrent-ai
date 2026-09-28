import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ClipboardCheck, KeyRound, Search, ShieldCheck, type LucideIcon } from "lucide-react";
import { Reveal, SectionHead } from "../site";

/**
 * Four steps, told sideways.
 *
 * On a desktop with motion allowed, the section pins and scrolling down
 * walks the steps across the screen - one story beat per step, which is
 * the one place on the page the sideways move is doing work rather than
 * decorating. Everywhere else (phones, reduced motion, the server render)
 * it is an ordinary stack of cards, so nothing depends on the effect.
 */

type Step = { icon: LucideIcon; title: string; body: string; tags: string[] };

const STEPS: Step[] = [
  {
    icon: Search,
    title: "Search your way",
    body: "Set what matters, from budget and suburb to a bedroom door that locks, and see only the rooms that fit.",
    tags: ["No rental history needed", "Pets OK", "Bills included"],
  },
  {
    icon: ShieldCheck,
    title: "Know who you are dealing with",
    body: "Every host's government ID is reviewed by a person at Migrent, and every listing is read before it goes live.",
    tags: ["Government ID", "Listing review"],
  },
  {
    icon: ClipboardCheck,
    title: "Apply once, not ten times",
    body: "Send your Rental Profile instead of a pile of paperwork, book an inspection and message the host, all in Migrent Hub.",
    tags: ["Rental Profile", "Inspections", "Messages"],
  },
  {
    icon: KeyRound,
    title: "Move in, and stay organised",
    body: "Agree terms in writing, lodge your bond with your state's bond authority, and keep rent and repairs in one place.",
    tags: ["Bond with your state", "Rent record", "Repairs"],
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <article className="site-card site-card--pad flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <span className="site-icon" aria-hidden="true">
          <step.icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <span aria-hidden="true" className="site-numeral text-[clamp(3rem,5vw,4.5rem)] text-[color:var(--color-primary-200)] dark:text-[color:var(--color-primary-200)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="site-h3 site-h3--lg mt-6">
        <span className="sr-only">Step {index + 1}: </span>
        {step.title}
      </h3>
      <p className="site-body mt-2.5">{step.body}</p>
      <ul className="mt-auto flex list-none flex-wrap gap-2 p-0 pt-6">
        {step.tags.map((t) => (
          <li key={t} className="site-chip">
            {t}
          </li>
        ))}
      </ul>
    </article>
  );
}

const Head = () => (
  <SectionHead
    eyebrow="How it works"
    id="how-heading"
    heading={
      <>
        From search to settled, in <strong>four steps.</strong>
      </>
    }
    lead="No paper applications and no rental ledger you do not have yet."
    aside={
      <Link href="/how-renting-works" className="site-link">
        How renting works <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </Link>
    }
  />
);

function Pinned() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!track.current || !viewport.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - viewport.current.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    if (viewport.current) ro.observe(viewport.current);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);

  return (
    <section
      ref={section}
      id="how"
      aria-labelledby="how-heading"
      className="relative"
      style={{ height: `calc(100dvh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden pt-16">
        <div className="site-shell">
          <Head />
        </div>
        <div ref={viewport} className="site-shell mt-10">
          <motion.ol ref={track} style={{ x }} className="m-0 flex w-max list-none gap-5 p-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="w-[min(440px,40vw)]">
                <StepCard step={s} index={i} />
              </li>
            ))}
          </motion.ol>
        </div>
        <div className="site-shell mt-10">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--color-line)]" aria-hidden="true">
            <motion.div className="h-full origin-left rounded-full bg-[var(--color-primary)]" style={{ scaleX: smooth }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stacked() {
  return (
    <section id="how" className="site-section scroll-mt-[96px]" aria-labelledby="how-heading">
      <div className="site-shell">
        <Reveal>
          <Head />
        </Reveal>
        <ol className="m-0 mt-10 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={(i % 2) * 0.06}>
              <StepCard step={s} index={i} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function HowItWorks() {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (min-height: 640px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return wide && !reduced ? <Pinned /> : <Stacked />;
}
