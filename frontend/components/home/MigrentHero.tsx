import Link from "next/link";
import HeroNavigation from "./HeroNavigation";
import { HeroPreviewCard, HeroSky } from "./HeroSunrise";

/**
 * MIGRENT hero.
 *
 * Rebuilt to the shape of the dayflow.so hero, which does one thing very
 * well: it performs a sunrise once, on arrival, and then stays at dawn. The
 * point is not the animation. It is that the page opens at night and the
 * rest of the site lives in the morning, so the hero explains its own colour
 * rather than sitting on top of a palette it does not belong to.
 *
 * Structurally that is: navigation inside the hero over the dark sky, a
 * centred display line, one sentence under it, a single button, a line of
 * small print, then the product's own surface clipped by the fold. The card
 * being cut off is the design - it says there is more below without needing
 * a scroll cue.
 *
 * What went, and why:
 *
 *   the villa plates      the sky is now drawn, not photographed, so the two
 *                         occluding plates and their matte have no job
 *   the GSAP timeline     the reference has no scroll motion in its hero at
 *                         all. The entrance is a CSS stagger that runs once;
 *                         nothing here is scrubbed, so there is no
 *                         ScrollTrigger, no pin and no scrub to keep alive
 *   the giant wordmark    replaced by a sentence, because the reference
 *                         leads with a claim rather than a logo
 *
 * The photographic hero's files are still on disk (HeroPropertyScene.tsx,
 * heroComposition.ts, /public/hero/*.webp). Nothing imports them now.
 */
export default function MigrentHero() {
  return (
    <section className="mg-hero">
      <HeroNavigation />

      <HeroSky />

      {/* Each child of the head rises in turn. The delays are on the
          children in styles/hero.css, not here, so the order is whatever
          the markup says it is. */}
      <div className="mg-hero__head">
        <h1 className="mg-hero__title">Find a home. Feel at home.</h1>

        <p className="mg-hero__sub">
          Every host is ID-checked before a room goes live. Renters pay nothing.
        </p>

        <Link href="/seeker/search" className="mg-hero__cta">
          Find a room
        </Link>

        <p className="mg-hero__micro">
          Hosts are ID-checked. Renters pay no fees. Rooms across Australia.
        </p>
      </div>

      {/* Fixed height with overflow hidden: the card is taller than the box,
          so the fold cuts it. */}
      <div className="mg-hero__cardwrap">
        <HeroPreviewCard />
      </div>

      <div className="mg-hero__trust">
        <span className="mg-hero__trustitem">No rental history needed</span>
        <span className="mg-hero__trustitem">No fees for renters</span>
      </div>
    </section>
  );
}
