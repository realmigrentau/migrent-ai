import { useState } from "react";
import { ArrowRight, BadgeCheck, Lock, Wallet } from "lucide-react";
import { Reveal } from "./primitives";

/**
 * The first thing the page asks you to do.
 *
 * Still the same GET form it always was - it works before hydration, Enter
 * submits, and the URL it builds is the one /seeker/search parses - but the
 * beige panel is gone. It is now the hero's own capsule at control scale:
 * one pill, hairline cells inside it, a filled pill for the action. On a
 * phone the capsule opens into a stack so nothing is squeezed.
 */

// The eight capitals the backend's derive_city() maps postcodes to, plus the
// suburbs that actually have guide pages, so a suggestion always leads
// somewhere with content behind it.
const PLACES = [
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Hobart", "Darwin",
  "Bondi", "Surry Hills", "Newtown", "Parramatta", "Chatswood", "Hurstville",
  "Strathfield", "Bankstown", "Liverpool", "Blacktown", "Penrith", "Manly",
  "Randwick", "Redfern", "Marrickville", "Burwood", "Homebush", "Ashfield",
];

const CHIPS = [
  { icon: BadgeCheck, label: "ID-verified hosts" },
  { icon: Lock, label: "Bond lodged properly" },
  { icon: Wallet, label: "$0 renter fees" },
];

export default function SearchConsole() {
  const [budget, setBudget] = useState(350);
  const [city, setCity] = useState("Sydney");
  const [moveIn, setMoveIn] = useState("");

  return (
    <section className="mg-section mg-band--air mg-wash-sun" aria-labelledby="search-heading">
      <div className="mg-shell mg-shell--narrow">
        <Reveal className="text-center">
          <p className="mg-eyebrow mb-4">Start here</p>
          <h2 id="search-heading" className="mg-h2 max-w-[20ch] mx-auto">
            Find a room you can <strong>trust</strong>
          </h2>
          <p className="mg-lead mt-5 max-w-[46ch] mx-auto">
            Rooms for migrants, students, and new arrivals. No rental history needed.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 md:mt-12">
          <form action="/seeker/search" method="get" role="search" aria-label="Find a room" className="mg-search">
            <div className="mg-search__row">
              <div className="mg-search__cell">
                <label htmlFor="home-city" className="mg-search__label">
                  City or suburb
                </label>
                <input
                  id="home-city"
                  name="city"
                  type="search"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  list="home-places"
                  autoComplete="off"
                  placeholder="Sydney"
                  maxLength={80}
                />
                <datalist id="home-places">
                  {PLACES.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div className="mg-search__cell">
                <label htmlFor="home-move-in" className="mg-search__label">
                  Move-in from
                </label>
                <input
                  id="home-move-in"
                  name="checkIn"
                  type="date"
                  value={moveIn}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setMoveIn(e.target.value)}
                />
              </div>

              <div className="mg-search__cell">
                <div className="mg-search__budget">
                  <label htmlFor="home-budget" className="mg-search__label">
                    Weekly budget
                  </label>
                  <output htmlFor="home-budget" className="mg-search__value">
                    ${budget}
                  </output>
                </div>
                <input
                  id="home-budget"
                  name="maxPrice"
                  type="range"
                  min={150}
                  max={1000}
                  step={5}
                  value={budget}
                  onChange={(e) => setBudget(+e.target.value)}
                  aria-valuetext={`up to $${budget} per week`}
                  className="premium-range w-full"
                />
              </div>
            </div>

            {/* The budget stays in the label: it is what the button will
                actually do, and tests/e2e/search.spec.ts holds it to that. */}
            <button type="submit" className="mg-btn mg-btn--primary mg-search__submit">
              Search rooms up to ${budget}/wk <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </Reveal>

        <Reveal delay={0.14} className="mt-7 flex flex-wrap justify-center gap-2.5">
          {CHIPS.map((c) => (
            <span key={c.label} className="mg-chip">
              <c.icon className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
              {c.label}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
