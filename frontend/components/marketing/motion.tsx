import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

/* Shared marketing motion primitives (design.md · Sand & Ocean).
 * Same scroll language as the homepage so every marketing page feels
 * like one product: slow weighted reveals, word-fill statements, and
 * the scroll-drift serif marquee. */

export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.2, 0.7, 0.3, 1] as const },
};

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  return (
    <motion.span style={{ opacity }} className="transition-none">
      {children}{" "}
    </motion.span>
  );
}

export function ScrollStatement({ text, eyebrow }: { text: string; eyebrow: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  return (
    <section ref={ref} className="bg-[var(--color-bg)]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 lg:px-14 py-24 md:py-32">
        <div className="eyebrow mb-6">{eyebrow}</div>
        <p className="font-serif text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[1.25] tracking-[-0.02em] text-[var(--color-ink)]">
          {words.map((w, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return <Word key={i} progress={scrollYProgress} range={[start, end]}>{w}</Word>;
          })}
        </p>
      </div>
    </section>
  );
}

export function ScrollMarquee({ words }: { words: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["8%", "-32%"]);
  const row = [...words, ...words];
  return (
    <section ref={ref} className="bg-[var(--color-bg)] border-y border-[var(--color-line)] py-14 md:py-20 overflow-hidden">
      <motion.div style={{ x }} className="flex items-center gap-8 whitespace-nowrap w-max">
        {row.map((w, i) => (
          <span key={i} className="inline-flex items-center gap-8 font-serif text-[clamp(2rem,5vw,4rem)] tracking-[-0.02em] text-[var(--color-ink)]">
            {w}
            <span className="text-[var(--color-accent)] text-[0.6em]" aria-hidden="true">✦</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}
