import { useEffect, useState } from "react";
import { searchListingsPage } from "../../lib/api";
import {
  EXAMPLE_LISTINGS,
  exampleListingHref,
  exampleListingTitle,
  showExampleListings,
  type ExampleListing,
} from "../../data/exampleListings";
import { Reveal, SectionHead, Strip } from "../site";
import { RoomCard, type RoomListing } from "./RoomCard";

/**
 * The example listings (data/exampleListings.ts) as cards. Every card's
 * title starts "Example listing:", links to /example/[slug] rather than a
 * real listing page, and carries no host badge.
 */

function asRoom(e: ExampleListing): RoomListing {
  return {
    id: `example-${e.slug}`,
    title: exampleListingTitle(e),
    suburb: e.suburb,
    city: e.state,
    weekly_price: e.weeklyRent,
    place_type: e.placeType,
    images: e.images.slice(0, 1),
    bills_included: e.billsIncluded,
  };
}

/** Homepage: a strip of every example, below the real rooms. */
export function ExampleListingsStrip() {
  return (
    <section className="site-section pt-0 pb-8" aria-labelledby="example-rooms-heading" data-testid="example-listings">
      <Reveal>
        <Strip
          label="Example listings"
          head={
            <SectionHead
              id="example-rooms-heading"
              heading={
                <>
                  What a room on Migrent <strong>looks like.</strong>
                </>
              }
            />
          }
        >
          {EXAMPLE_LISTINGS.map((e) => (
            <li key={e.slug}>
              <RoomCard l={asRoom(e)} href={exampleListingHref(e)} />
            </li>
          ))}
        </Strip>
      </Reveal>
    </section>
  );
}

/**
 * Search: examples under an empty result (three) or under the last of the
 * real rooms (all of them), the searched suburb's first. The search page only
 * knows how many rooms match its filters, so this asks once how many real
 * rooms there are in all, and shows nothing until it knows, or when there
 * are enough real ones.
 */
export function ExampleListingsGrid({ suburb, count = 3 }: { suburb?: string; count?: number }) {
  const [realCount, setRealCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    searchListingsPage({ limit: "1" }).then((page) => {
      if (cancelled || !page.ok) return;
      setRealCount(page.total ?? (page.listings.length === 0 ? 0 : null));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!showExampleListings(realCount)) return null;

  const wanted = (suburb || "").trim().toLowerCase();
  const shown = [...EXAMPLE_LISTINGS].sort((a, b) => Number(b.suburb.toLowerCase() === wanted) - Number(a.suburb.toLowerCase() === wanted)).slice(0, count);

  return (
    <section className="mt-10" aria-labelledby="example-grid-heading" data-testid="example-listings">
      <h2 id="example-grid-heading" className="site-h3 site-h3--lg">
        What a room on Migrent looks like
      </h2>
      <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((e) => (
          <li key={e.slug}>
            <RoomCard l={asRoom(e)} href={exampleListingHref(e)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
