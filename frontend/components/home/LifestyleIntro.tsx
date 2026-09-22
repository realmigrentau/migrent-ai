import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The editorial line under the hero.
 *
 * White on white with the hero's fog running into it, so there is no seam to
 * see. The reveal is a one-shot on enter rather than a scrub - eyebrow first,
 * headline 140ms behind it, both on expo.out. Nothing bounces.
 *
 * It is also the page's type specimen, and the only place both halves of the
 * system land in one breath: the display serif, and the script on the word
 * the whole site is about. Every heading below borrows the serif (see .mg-h2
 * in styles/home.css); almost none of them get the script - see .type-script
 * in styles/globals.css for when a word has earned it.
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
    <section className="mg-intro" ref={rootRef} aria-labelledby="intro-heading">
      <p className="mg-intro__eyebrow" data-intro="eyebrow">
        Verified rooms across Australia
      </p>
      <h2 className="mg-intro__headline" id="intro-heading" data-intro="headline">
        Where arriving
        <br />
        becomes <strong className="type-script">home</strong>
      </h2>
    </section>
  );
}
