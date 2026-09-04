import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroNavigation from "./HeroNavigation";
import { HeroFrontPlate, HeroSkyPlate } from "./HeroPropertyScene";
import { SCENE_ZOOM, WORDMARK_LAG } from "./heroComposition";

/**
 * MIGRENT hero.
 *
 * What the reference actually does, measured frame by frame: the whole
 * composition travels with the page at 1:1. There is no pin, no scroll
 * jacking and - because the capture is a single flat plate - no parallax
 * between the type and the building. The gap between the wordmark's cap top
 * and the roof ridge holds at 254px +/- 1 across every frame of the travel.
 *
 * So this does not invent a differential the reference does not have. The
 * depth comes from the three things a layered build can do that a flat plate
 * cannot, all of them small:
 *
 *   1. the wordmark lags the scene by 7%, so it settles a little further
 *      behind the roofline as the hero leaves rather than sliding off it
 *   2. a 4.5% push-in on the scene, anchored on the roof ridge so the
 *      building does not drift while it grows
 *   3. the fog deepens and the navigation lifts away
 *
 * Everything is transform and opacity on a scrubbed timeline. React renders
 * once; GSAP writes to the two elements directly after that.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export default function MigrentHero() {
  const rootRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const scenes = root.querySelectorAll(".mg-hero__scene");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          // One hero-height of travel, the same distance the reference covers
          // before the editorial line settles. No pin: a normal scroll stays
          // a normal scroll.
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        defaults: { ease: "none" },
      });

      const travel = () => root.offsetHeight;

      tl.to(scenes, { scale: 1 + SCENE_ZOOM }, 0)
        .to(wordmarkRef.current, { y: () => travel() * WORDMARK_LAG }, 0)
        .to(".mg-hero__veil", { opacity: 1 }, 0)
        // The reference drops its navigation the moment the page moves; this
        // is the same idea with a short ramp so it does not blink out.
        // autoAlpha, not opacity: it also flips visibility at zero, which
        // takes the pills' backdrop-filter off the compositor's list for the
        // rest of the scroll instead of leaving it re-blurring every frame.
        .to(navRef.current, { autoAlpha: 0, y: -22, duration: 0.32 }, 0);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="mg-hero" ref={rootRef}>
      <HeroSkyPlate />

      <h1 className="mg-hero__wordmark" ref={wordmarkRef}>
        {/* The visible mark is the brand; the sentence is what a screen
            reader and a crawler need from an h1. */}
        <span className="sr-only">MIGRENT - a real home in Australia, found the right way</span>
        <span aria-hidden="true">MIGRENT</span>
      </h1>

      <HeroFrontPlate />

      <div className="mg-hero__fog" aria-hidden="true" />
      <div className="mg-hero__veil" aria-hidden="true" />

      <HeroNavigation navRef={navRef} />
    </section>
  );
}
