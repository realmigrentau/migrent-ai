import HouseConfigurator from "./house/HouseConfigurator";

/**
 * The homepage hero: a sunrise, a promise, and a house you can set up.
 *
 * The sky opens at night and walks to dawn once, over eight seconds, then
 * holds. In dark mode it stops just before the sun clears the horizon, so
 * the lit windows of the house carry the scene. The old product still that
 * sat under the headline is gone; in its place is the house, which does
 * the one thing a still could not: it turns what you want into a search,
 * or what you have into a listing.
 */

const STARS: [number, number, number][] = [
  [6, 14, 1.1], [12, 32, 0.8], [19, 9, 1.3], [24, 22, 0.7], [31, 6, 0.9], [37, 28, 1.1],
  [44, 12, 0.8], [52, 4, 1.2], [58, 24, 0.7], [63, 10, 1], [69, 30, 0.8], [74, 16, 1.3],
  [81, 7, 0.9], [86, 26, 1.1], [92, 13, 0.8], [96, 34, 1], [15, 44, 0.7], [47, 38, 0.8],
  [78, 42, 0.7], [3, 36, 0.9],
];

function HeroSky() {
  return (
    <div className="hero__sky" aria-hidden="true">
      <div className="hero__plate hero__plate--night" />
      <svg className="hero__stars" width="100%" height="100%" focusable="false">
        {STARS.map(([x, y, r], i) => (
          <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} />
        ))}
      </svg>
      <div className="hero__plate hero__plate--dusk" />
      <div className="hero__plate hero__plate--dawn" />
      <div className="hero__bloom" />
      <div className="hero__sun" />
      <div className="hero__foot" />
    </div>
  );
}

export default function MigrentHero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <HeroSky />
      <div className="hero__inner">
        <div className="hero__head">
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">Find a home.</span>{" "}
            <span className="hero__line">
              Feel at <strong className="type-script">home</strong>.
            </span>
          </h1>
          <p className="hero__sub">Every host is ID-checked before a room goes live. Searching and applying are free.</p>
        </div>
        <HouseConfigurator />
      </div>
    </section>
  );
}
