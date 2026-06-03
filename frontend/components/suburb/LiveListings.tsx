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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Available Rooms
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {listingsCount} verified rooms in {suburbName}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
            <span className="text-sm font-semibold text-teal-600">${maxPrice}/wk</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={furnishedOnly}
              onChange={(e) => setFurnishedOnly(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
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
              className="animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 h-72"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <Home className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            No rooms matching your filters right now
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            Try adjusting your filters or check back soon
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title || listing.address}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-teal-700 dark:text-teal-400">
                  ${listing.weekly_price}/wk
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                  {listing.title || listing.address}
                </h3>
                <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.address}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {listing.furnished && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                      Furnished
                    </span>
                  )}
                  {listing.nearest_transport && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            View All Rooms in {suburbName}
          </Link>
        </div>
      )}
    </section>
  );
}
