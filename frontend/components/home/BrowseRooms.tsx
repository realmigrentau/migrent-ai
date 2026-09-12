import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bath, Bed, Calendar, Check } from "lucide-react";
import { searchListings } from "../../lib/api";
import { Reveal, SectionHead } from "./primitives";

/**
 * Real rooms, from the real API.
 *
 * This is the one place on the page where a card grid is the right answer:
 * these are products, and a product wants a picture, a price and a place.
 * The shortcuts above them are capsules, so the filters read as the hero's
 * navigation rather than as six more boxes.
 */

type Listing = {
  id: string;
  title?: string;
  address?: string;
  suburb?: string;
  city?: string;
  postcode?: string;
  weekly_price?: number;
  daily_price?: number;
  room_type?: string;
  property_type?: string;
  beds?: number;
  bath?: number;
  bills_included?: boolean;
  verified?: boolean;
  available_from?: string;
};

const SHORTCUTS = [
  { label: "Under $250/wk", href: "/seeker/search?maxPrice=250" },
  { label: "Studio apartments", href: "/seeker/search?propertyType=studio" },
  { label: "Share houses", href: "/seeker/search?roomType=private" },
  { label: "Near universities", href: "/seeker/search?nearUni=true" },
  { label: "Pet-friendly", href: "/seeker/search?pets=true" },
  { label: "Bills included", href: "/seeker/search?billsIncluded=true" },
];

function ListingCard({ listing }: { listing: Listing }) {
  const suburb = listing.suburb || listing.city || "Australia";
  const postcode = listing.postcode ? `, ${listing.postcode}` : "";
  const title = listing.title || listing.address || "Verified room in Australia";
  const price = listing.weekly_price || (listing.daily_price ? listing.daily_price * 7 : 0);

  return (
    <Link href={`/listing/${listing.id}`} className="mg-card group flex flex-col overflow-hidden h-full">
      <div className="relative">
        <div className="photo-placeholder h-[196px] w-full" style={{ borderRadius: 0 }}>
          {suburb} · {listing.property_type || listing.room_type || "Room"}
        </div>
        {listing.verified && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-full bg-[var(--color-surface-2)]/95 backdrop-blur text-[var(--color-trust-ink)] text-[11px] font-semibold shadow-[var(--shadow-soft)]">
            <Check className="w-3 h-3" strokeWidth={2.8} aria-hidden="true" /> Verified host
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1 gap-2">
        <p className="mg-eyebrow truncate">
          {suburb}
          {postcode}
        </p>
        <h3 className="mg-h3 line-clamp-2">{title}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mg-meta mt-auto pt-2">
          {listing.beds != null && (
            <span className="inline-flex items-center gap-1.5">
              <Bed className="w-4 h-4" aria-hidden="true" /> {listing.beds}
            </span>
          )}
          {listing.bath != null && (
            <span className="inline-flex items-center gap-1.5">
              <Bath className="w-4 h-4" aria-hidden="true" /> {listing.bath}
            </span>
          )}
          {listing.available_from && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" aria-hidden="true" />{" "}
              {new Date(listing.available_from).toLocaleDateString("en-AU", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
        <hr className="mg-rule my-2" />
        <div className="flex justify-between items-baseline gap-3">
          <span className="inline-flex items-baseline gap-1.5">
            <span className="text-[21px] font-semibold tracking-[-0.02em] text-[var(--color-ink)] tabular-nums">
              ${price}
            </span>
            <span className="mg-meta font-medium">AUD/wk</span>
          </span>
          <span className="mg-meta">{listing.bills_included ? "Bills inc." : "Long stay"}</span>
        </div>
      </div>
    </Link>
  );
}

export default function BrowseRooms() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    searchListings({ limit: "3" })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) setListings(data.slice(0, 3));
        else if (data && Array.isArray(data.listings)) setListings(data.listings.slice(0, 3));
      })
      .catch((err) => {
        if (!cancelled) console.warn("Failed to load featured listings:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="browse" className="mg-section mg-band--air scroll-mt-[76px]" aria-labelledby="browse-heading">
      <div className="mg-shell">
        <Reveal>
          <SectionHead
            eyebrow="Browse"
            heading="Rooms that fit"
            emphasis="you."
            headingId="browse-heading"
            aside={
              <Link href="/seeker/search" className="mg-link">
                See all listings <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            }
          />
        </Reveal>

        <Reveal delay={0.06}>
          <ul className="list-none m-0 p-0 mt-9 flex flex-wrap gap-2.5">
            {SHORTCUTS.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="mg-chip h-10 px-4 text-[13.5px] font-medium">
                  {c.label}
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--color-primary)]" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="mg-card overflow-hidden">
                <div className="shimmer h-[196px] w-full" />
                <div className="p-5 space-y-3">
                  <div className="shimmer h-3 w-1/3 rounded-full" />
                  <div className="shimmer h-4 w-3/4 rounded-full" />
                  <div className="shimmer h-3 w-1/2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <ul className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {listings.map((l, i) => (
              <Reveal as="li" key={l.id} delay={(i % 3) * 0.06}>
                <ListingCard listing={l} />
              </Reveal>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
