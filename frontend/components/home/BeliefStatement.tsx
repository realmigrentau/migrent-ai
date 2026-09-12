import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

/**
 * The one moment on the page that goes dark.
 *
 * The ground is the sky at the top of the hero taken down to night, so the
 * band belongs to the same photograph rather than arriving as a generic
 * dark section. Words brighten from muted to white as the section passes,
 * which is the only scroll-linked effect left on the page besides the
 * neighbourhood drift - the page had six, and they were competing.
 */

const TEXT =
  "Your visa is enough. Your story is enough. A credit score you haven't built yet should never decide where you get to call home.";

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  // 0.55 keeps the un-brightened word above 3:1 on this ground (WCAG 1.4.3
  // for large text) before it lifts to full white.
  const opacity = useTransform(progress, range, [0.55, 1]);
  return (
    <motion.span style={{ opacity }} className="transition-none">
      {children}{" "}
    </motion.span>
  );
}

export default function BeliefStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });
  const words = TEXT.split(" ");

  return (
    <section ref={ref} className="mg-section mg-band--deep" aria-labelledby="belief-heading">
      <div className="mg-shell mg-shell--narrow">
        <p className="mg-eyebrow mb-7">What we believe</p>
        <p id="belief-heading" className="mg-statement">
          {reduced
            ? TEXT
            : words.map((w, i) => {
                const start = i / words.length;
                return (
                  <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]}>
                    {w}
                  </Word>
                );
              })}
        </p>
      </div>
    </section>
  );
}
