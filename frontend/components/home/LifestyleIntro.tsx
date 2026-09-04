import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The editorial line under the hero.
 *
 * White on white with the hero's fog running into it, so there is no seam to
 * see. The reveal is a one-shot on enter rather than a scrub - eyebrow first,
 * headline 140ms behind it, both on expo.out. Nothing bounces.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export default function LifestyleIntro() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(["[data-intro='eyebrow']", "[data-intro='headline']"], {
        opacity: 0,
        y: 30,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.14,
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="mg-intro" ref={rootRef} aria-labelledby="riviera-heading">
      <p className="mg-intro__eyebrow" data-intro="eyebrow">
        Riviera living style
      </p>
      <h2 className="mg-intro__headline" id="riviera-heading" data-intro="headline">
        Where the shoreline
        <br />
        becomes <strong>calm</strong>
      </h2>
    </section>
  );
}
