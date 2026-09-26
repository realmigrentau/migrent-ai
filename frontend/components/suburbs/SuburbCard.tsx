import Link from "next/link";
import type { RegionCard } from "../../pages/api/suburbs/region";

/**
 * One suburb in the directory.
 *
 * The hierarchy is deliberate and narrow. A card carries the name, one
 * headline figure, and at most three small facts - not every statistic we
 * hold. The detail page is where the full picture belongs; a card that tries
 * to be the page is unreadable at 375px and slower to scan at any width.
 *
 * The headline figure follows what we can actually stand behind:
 *
 *   1. the median advertised room price on MigRent, when enough listings
 *      exist in this suburb to compute one,
 *   2. otherwise the 2021 Census population, which we always have,
 *   3. and nothing at all where even that is missing.
 *
 * There is no fallback to an invented number, which is why some cards are
 * quieter than others.
 */
export default function SuburbCard({ place }: { place: RegionCard }) {
  const hasPrice = place.medianWeeklyRoomPrice != null;
  const hasRooms = place.activeListings != null && place.activeListings > 0;

  return (
    <li className="sub-card">
      <Link href={place.href} className="sub-card__link">
        <span className="sub-card__accent" aria-hidden="true" />

        <span className="sub-card__head">
          <span className="sub-card__name">{place.name}</span>
          {place.postcode && <span className="sub-card__pc">{place.postcode}</span>}
        </span>

        <span className="sub-card__where">
          {place.label.replace(`${place.name}, `, "").replace(place.name, "").trim() || place.state}
        </span>

        {hasPrice ? (
          <span className="sub-card__figure">
            <span className="sub-card__figure-value">${place.medianWeeklyRoomPrice}</span>
            <span className="sub-card__figure-label">median room, per week, on MigRent</span>
          </span>
        ) : place.population > 0 ? (
          <span className="sub-card__figure">
            <span className="sub-card__figure-value">{place.population.toLocaleString()}</span>
            <span className="sub-card__figure-label">residents at the 2021 Census</span>
          </span>
        ) : (
          <span className="sub-card__figure sub-card__figure--none">
            <span className="sub-card__figure-label">No Census figures published for this locality</span>
          </span>
        )}

        <span className="sub-card__tags">
          {place.overseasBornPct != null && (
            <span className="sub-tag sub-tag--data">{place.overseasBornPct}% born overseas</span>
          )}
          {hasRooms && (
            <span className="sub-tag sub-tag--terracotta">
              {place.activeListings} {place.activeListings === 1 ? "room" : "rooms"} on MigRent
            </span>
          )}
          {place.hasEditorial && <span className="sub-tag sub-tag--sky">Written guide</span>}
        </span>

        <span className="sub-card__cta">
          View suburb guide
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
    </li>
  );
}
