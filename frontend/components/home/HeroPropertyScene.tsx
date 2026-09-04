/**
 * The photographic half of the hero: two plates of the same picture with the
 * live wordmark slotted between them.
 *
 *   sky plate    the full photograph, with the sky repainted where the
 *                reference had a baked wordmark and a navigation bar
 *   front plate  the same photograph with everything above the building
 *                silhouette knocked out to alpha
 *
 * Drawing the front plate over the type is what makes the roofline cut across
 * the letters. Since both plates are the same pixels, the alpha edge cannot
 * produce a halo: whatever the matte gets slightly wrong is backed by an
 * identical pixel underneath.
 *
 * They are two separate transformed wrappers rather than one, because a
 * transformed element makes its own stacking context - the wordmark has to be
 * their sibling to sit between them, and it needs a travel of its own.
 *
 * Plain <img> with a srcset rather than next/image: the geometry is driven by
 * object-position and the widths are already tuned, so the optimiser has
 * nothing to add and the LCP request stays static and cacheable.
 */

/* The plate is not always viewport-wide: on portrait screens it is pulled back
   to a box wider than the screen (see the --scene-w-vw overrides in
   styles/hero.css), so declaring 100vw there would have the browser pick a
   candidate too small for what it actually paints. Keep these in step with
   those breakpoints. */
const SIZES = "(max-width: 767px) 230vw, (max-width: 1023px) 160vw, 100vw";

function srcSet(name: "sky" | "front") {
  return [768, 1152, 1652].map((w) => `/hero/${name}-${w}.webp ${w}w`).join(", ");
}

export function HeroSkyPlate() {
  return (
    <>
      {/* Continues the sky above the plate on portrait screens, where the
          scene does not reach the top of the viewport. */}
      <div className="mg-hero__skytop" aria-hidden="true" />

      <div className="mg-hero__scene mg-hero__scene--back">
        {/* eslint-disable-next-line @next/next/no-img-element -- the widths
            are already tuned and the geometry is object-position driven, so
            the optimiser adds latency and cost without adding anything. */}
        <img
          className="mg-hero__plate"
          src="/hero/sky-1652.webp"
          srcSet={srcSet("sky")}
          sizes={SIZES}
          width={1652}
          height={1114}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </>
  );
}

export function HeroFrontPlate() {
  return (
    <div className="mg-hero__scene mg-hero__scene--front">
      {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
      <img
        className="mg-hero__plate"
        src="/hero/front-1652.webp"
        srcSet={srcSet("front")}
        sizes={SIZES}
        width={1652}
        height={1114}
        alt="A Mediterranean villa in warm terracotta behind palms, under an open blue sky"
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );
}
