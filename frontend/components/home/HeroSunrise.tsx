/**
 * The hero's sunrise, and the product card that sits on it.
 *
 * The reference plays a five-second MP4 of a sun clearing the horizon and
 * then holds on the last frame forever. This is the same performance built
 * out of CSS, for three reasons: there is no video to ship, download or
 * cache, the rest state is a real paint rather than a decoded frame the
 * compositor can lose, and prefers-reduced-motion is a one-line answer
 * instead of a media element to pause.
 *
 * The colour ramp is not invented. Every stop below was sampled off the
 * reference's own frames, three heights per frame, so the walk from night to
 * dawn passes through the same lavender the original does rather than
 * fading blue straight into orange and going muddy in the middle:
 *
 *     t=0.00s   sky #071131   horizon #073669   low #04305f
 *     t=1.50s   sky #15387b   horizon #416db3   low #ffefcc
 *     t=2.90s   sky #4b79ce   horizon #cfb4ca   low #ffdabb
 *     t=4.94s   sky #93bbf8   horizon #ffe2be   low #ffb084
 *
 * Three stacked plates cross-fade forward through those measurements. Only
 * opacity and transform animate, so the whole thing stays on the compositor,
 * and every layer finishes at its final opacity - the rest state is just
 * where the animation stopped, held by animation-fill-mode.
 *
 * The one deliberate departure from the reference: its last frame bottoms
 * out at #fff1e7, ours resolves to the page ground, because the section
 * underneath this one is white (and near-black in dark mode). Landing the
 * dawn on the ground colour is what makes the hero end rather than stop.
 */

/**
 * A still of the search panel, not a live one.
 *
 * The reference puts its app's own primary surface under the headline. Ours
 * is search, so this is the search panel - but inert, and empty. The fields
 * carry placeholders, never values: a placeholder reads as an example, while
 * a filled-in suburb and price would read as inventory we do not have.
 * The real control is the button above it.
 */
function HeroPreviewCard() {
  return (
    <div className="mg-hero__card" aria-hidden="true">
      <div className="mg-hero__cardface">
        <div className="mg-hero__cardhead">
          <span className="mg-hero__cardtitle">Find a room</span>
          <span className="mg-hero__cardmeta">Australia wide</span>
        </div>

        <div className="mg-hero__cardgrid">
          <div className="mg-hero__field">
            <span className="mg-hero__fieldlabel">City or suburb</span>
            <span className="mg-hero__fieldvalue mg-hero__fieldvalue--ghost">Sydney</span>
          </div>
          <div className="mg-hero__field">
            <span className="mg-hero__fieldlabel">Move-in from</span>
            <span className="mg-hero__fieldvalue mg-hero__fieldvalue--ghost">Any date</span>
          </div>
          <div className="mg-hero__field">
            <span className="mg-hero__fieldlabel">Budget</span>
            <span className="mg-hero__fieldvalue mg-hero__fieldvalue--ghost">Per week</span>
          </div>
        </div>

        <div className="mg-hero__cardbar">
          <span className="mg-hero__chip">
            <span className="mg-hero__chipdot" />
            ID-checked hosts only
          </span>
          <span className="mg-hero__cardbtn">Search</span>
        </div>

        {/* The results surface, as shape only.
            The reference's card is a full day of its own timeline, which is
            what gives it the height for the fold to cut. Ours needs that
            height too, but a room card carries a suburb and a price, and
            there is no honest suburb or price to put here. So these rows
            carry no text at all: they are the geometry of a result, not a
            result. Nothing here can be read as inventory because there is
            nothing here to read. */}
        <div className="mg-hero__results">
          <span className="mg-hero__row mg-hero__row--a" />
          <span className="mg-hero__row mg-hero__row--b" />
          <span className="mg-hero__row mg-hero__row--c" />
        </div>
      </div>
    </div>
  );
}

export function HeroSky() {
  return (
    <div className="mg-hero__sky" aria-hidden="true">
      {/* Night is the ground layer and never fades: the two above it come up
          over it in sequence, so there is no frame where the sky is
          transparent and the section background shows through. */}
      <div className="mg-hero__plate mg-hero__plate--night" />
      <div className="mg-hero__plate mg-hero__plate--dusk" />
      <div className="mg-hero__plate mg-hero__plate--dawn" />

      {/* The disc rises out of the horizon; the bloom is a separate, much
          wider layer so the light spreads further than the sun is big. */}
      <div className="mg-hero__bloom" />
      <div className="mg-hero__sun" />

      {/* Closes the last stretch to the page ground so the hero ends on the
          colour the next section starts on. */}
      <div className="mg-hero__foot" />
    </div>
  );
}

export { HeroPreviewCard };
