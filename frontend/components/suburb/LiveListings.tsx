import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Home, MapPin } from "lucide-react";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  address: string;
  suburb: string;
  weekly_price: number;
  images: string[];
  place_type: string;
  furnished: boolean;
  nearest_transport: string | null;
  station_distance_min: number | null;
}

interface LiveListingsProps {
  suburbName: string;
  listingsCount: number;
}

import { API_BASE_URL as BASE_URL } from "../../lib/apiBase";
export default function LiveListings({ suburbName, listingsCount }: LiveListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch(
          `${BASE_URL}/listings?suburb=${encodeURIComponent(suburbName)}&limit=12`
        );
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings || data || []);
        }
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [suburbName]);

  const filtered = listings.filter((l) => {
    if (l.weekly_price > maxPrice) return false;
    if (furnishedOnly && !l.furnished) return false;
    return true;
  });

  return (
    <section id="listings" className="scroll-mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-ink)]">
            Available Rooms
          </h2>
          <p className="text-[var(--color-ink-3)] mt-1">
            {listingsCount} verified rooms in {suburbName}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-surface)] transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-line)]">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[var(--color-ink-2)]">
              Max price:
            </label>
            <input
              type="range"
              min={100}
              max={600}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-32 accent-teal-600"
            />
            <span className="text-sm font-semibold text-[var(--color-primary)]">${maxPrice}/wk</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--color-ink-2)] cursor-pointer">
            <input
              type="checkbox"
              checked={furnishedOnly}
              onChange={(e) => setFurnishedOnly(e.target.checked)}
              className="rounded border-[var(--color-line-2)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            Furnished only
          </label>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-[var(--color-surface-muted)] dark:bg-[var(--color-surface-muted)] h-72"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-[var(--color-line)]">
          <Home className="w-12 h-12 text-[var(--color-ink-3)] mx-auto mb-4" />
          <p className="text-[var(--color-ink-3)] text-lg">
            No rooms matching your filters right now
          </p>
          <p className="text-[var(--color-ink-3)] text-sm mt-2">
            Try adjusting your filters or check back soon
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[4/3] bg-[var(--color-surface-muted)] relative overflow-hidden">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title || listing.address}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-12 h-12 text-[var(--color-ink-4)]" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-[var(--color-surface)]/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-[var(--color-primary-700)] dark:text-[var(--color-primary)]">
                  ${listing.weekly_price}/wk
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[var(--color-ink)] truncate">
                  {listing.title || listing.address}
                </h3>
                <p className="flex items-center gap-1 text-sm text-[var(--color-ink-3)] mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.address}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {listing.furnished && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:text-[var(--color-primary)]">
                      Furnished
                    </span>
                  )}
                  {listing.nearest_transport && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-surface-muted)] text-[var(--color-primary-700)] dark:text-[var(--color-primary)]">
                      {listing.station_distance_min}min to station
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="text-center mt-8">
          <Link
            href={`/listings?suburb=${encodeURIComponent(suburbName)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:bg-[var(--color-primary-700)] transition-colors"
          >
            <Search className="w-4 h-4" />
            View All Rooms in {suburbName}
          </Link>
        </div>
      )}
    </section>
  );
}
