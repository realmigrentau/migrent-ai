import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { ArrowRight, BadgeCheck, FileCheck2, ShieldCheck } from "lucide-react";

/**
 * The trust beat, right after the belief band.
 *
 * The three lines rise from behind a mask as the section passes, which is
 * the same weighted entrance the hero's editorial line uses, only scrubbed.
 * The proof points sit beside them as a hairline stack rather than three
 * more cards.
 */

const LINES = ["Every owner, checked.", "Government ID, proof of property.", "Verified before a room goes live."];

const POINTS = [
  { icon: BadgeCheck, title: "Identity verified", body: "A government ID matched to the person you are talking to." },
  { icon: FileCheck2, title: "Property confirmed", body: "Proof they control the room they are letting, on file." },
  { icon: ShieldCheck, title: "Ongoing monitoring", body: "Checks continue after a listing is live, not just before it." },
];

function CurtainLine({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const y = useTransform(progress, range, ["115%", "0%"]);
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span style={{ y, opacity }} className="block">
        {children}
      </motion.span>
    </span>
  );
}

export default function VerifiedPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });

  return (
    <section ref={ref} className="mg-section mg-band--air" aria-labelledby="verified-heading">
      <div className="mg-shell grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-start">
        <div>
          <p className="mg-eyebrow mg-eyebrow--ruled mb-6">Verified owners</p>
          <h2 id="verified-heading" className="mg-h2">
            {reduced
              ? LINES.join(" ")
              : LINES.map((l, i) => (
                  <CurtainLine
                    key={l}
                    progress={scrollYProgress}
                    range={[i / LINES.length, (i + 1) / LINES.length]}
                  >
                    {l}
                  </CurtainLine>
                ))}
          </h2>
          <Link href="/safety-verification" className="mg-link mt-8">
            How verification works <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="list-none m-0 p-0 mg-rows lg:pt-3">
          {POINTS.map((p) => (
            <li key={p.title} className="flex gap-5 py-6 first:pt-0 last:pb-0">
              <span className="mg-icon mg-icon--trust" aria-hidden="true">
                <p.icon className="w-[21px] h-[21px]" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h3 className="mg-h3">{p.title}</h3>
                <p className="mg-body mt-1.5">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
