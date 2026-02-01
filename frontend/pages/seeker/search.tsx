import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import SearchFilters, { FilterState } from "../../components/SearchFilters";

const PLACEHOLDER_LISTINGS = [
  {
    id: "1",
    address: "12 Crown St",
    suburb: "Surry Hills",
    postcode: "2010",
    weeklyPrice: 250,
    roomType: "private",
    furnished: true,
    billsIncluded: true,
    verified: true,
    photo: null,
    description: "Bright private room in friendly sharehouse near Central Station. 5 min walk to buses and trains.",
  },
  {
    id: "2",
    address: "45 George St",
    suburb: "Redfern",
    postcode: "2016",
    weeklyPrice: 220,
    roomType: "shared",
    furnished: true,
    billsIncluded: false,
    verified: false,
    photo: null,
    description: "Affordable shared room close to USYD campus. Quiet neighbourhood with parks nearby.",
  },
  {
    id: "3",
    address: "8 Botany Rd",
    suburb: "Waterloo",
    postcode: "2017",
    weeklyPrice: 280,
    roomType: "ensuite",
    furnished: true,
    billsIncluded: true,
    verified: true,
    photo: null,
    description: "Ensuite room with own bathroom in modern apartment. Green Square station 3 min walk.",
  },
  {
    id: "4",
    address: "77 Anzac Pde",
    suburb: "Kensington",
    postcode: "2033",
    weeklyPrice: 200,
    roomType: "private",
    furnished: false,
    billsIncluded: false,
    verified: false,
    photo: null,
    description: "Unfurnished private room near UNSW. Light rail stop at doorstep. Large backyard.",
  },
  {
    id: "5",
    address: "3/15 Glebe Point Rd",
    suburb: "Glebe",
    postcode: "2037",
    weeklyPrice: 310,
    roomType: "studio",
    furnished: true,
    billsIncluded: true,
    verified: true,
    photo: null,
    description: "Self-contained studio with kitchenette. Walking distance to Broadway Shopping Centre.",
  },
  {
    id: "6",
    address: "22 Parramatta Rd",
    suburb: "Homebush",
    postcode: "2140",
    weeklyPrice: 190,
    roomType: "shared",
    furnished: true,
    billsIncluded: true,
    verified: false,
    photo: null,
    description: "Budget-friendly shared room near Olympic Park. Inclusive of all bills and WiFi.",
  },
];

export default function SeekerSearch() {
  const { session } = useAuth();
  const [results, setResults] = useState(PLACEHOLDER_LISTINGS);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const handleSearch = async (filters: FilterState) => {
    setSearching(true);
    setSearched(true);
    // Simulate network delay for placeholder
    await new Promise((r) => setTimeout(r, 600));

    let filtered = [...PLACEHOLDER_LISTINGS];

    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.suburb.toLowerCase().includes(q) ||
          l.postcode.includes(q) ||
          l.address.toLowerCase().includes(q)
      );
    }
    if (filters.roomType) {
      filtered = filtered.filter((l) => l.roomType === filters.roomType);
    }
    if (filters.furnished === "furnished") {
      filtered = filtered.filter((l) => l.furnished);
    } else if (filters.furnished === "unfurnished") {
      filtered = filtered.filter((l) => !l.furnished);
    }
    if (filters.billsIncluded === "included") {
      filtered = filtered.filter((l) => l.billsIncluded);
    } else if (filters.billsIncluded === "excluded") {
      filtered = filtered.filter((l) => !l.billsIncluded);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((l) => l.weeklyPrice <= Number(filters.maxPrice));
    }

    setResults(filtered);
    setSearching(false);
  };

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Find a <span className="gradient-text">Room</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Search by suburb, postcode, or budget. Filter to find exactly what you need.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <SearchFilters onSearch={handleSearch} loading={searching} />
      </motion.div>

      {/* Results + Map layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Listing cards */}
        <div className="lg:col-span-3 space-y-4">
          {searching ? (
            // Skeleton loading
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 rounded-2xl space-y-3">
                  <div className="flex gap-4">
                    <div className="w-28 h-20 rounded-xl shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded shimmer" />
                      <div className="h-3 w-20 rounded shimmer" />
                      <div className="h-3 w-full rounded shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-8 rounded-2xl text-center"
            >
              <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">No rooms found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try adjusting your filters or searching a different area.
              </p>
            </motion.div>
          ) : (
            results.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="card p-5 rounded-2xl group"
              >
                <div className="flex gap-4">
                  {/* Photo placeholder */}
                  <div className="w-28 h-20 sm:w-36 sm:h-24 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                          {listing.address}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          {listing.suburb}, {listing.postcode}
                        </p>
                      </div>
                      <div className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                        <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                          ${listing.weeklyPrice}
                        </span>
                        <span className="text-rose-400 dark:text-rose-500 text-xs">/wk</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                        {listing.roomType}
                      </span>
                      {listing.furnished && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Furnished
                        </span>
                      )}
                      {listing.billsIncluded && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Bills incl.
                        </span>
                      )}
                      {listing.verified && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-1 hidden sm:block">
                      {listing.description}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/seeker/room/${listing.id}`}
                    className="btn-primary py-2 px-4 rounded-lg text-xs flex-1 text-center"
                  >
                    View details
                  </Link>
                  <button
                    onClick={() => toggleSave(listing.id)}
                    className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
                      saved.has(listing.id)
                        ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-200 dark:border-rose-500/20"
                        : "btn-secondary"
                    }`}
                  >
                    {saved.has(listing.id) ? "♥ Saved" : "Save"}
                  </button>
                  {session && (
                    <Link
                      href={`/seeker/room/${listing.id}#interest`}
                      className="btn-secondary py-2 px-4 rounded-lg text-xs text-center hidden sm:block"
                    >
                      Express interest
                    </Link>
                  )}
                </div>
              </motion.div>
            ))
          )}
          {!searched && (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
              Start searching to see available rooms.
            </p>
          )}
        </div>

        {/* Map placeholder */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-24">
            <div className="card rounded-2xl overflow-hidden aspect-[4/5] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
              <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Map view</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Coming soon</p>
              {/* Pin indicators */}
              {results.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1 justify-center px-4">
                  {results.map((l) => (
                    <span
                      key={l.id}
                      className="px-2 py-0.5 rounded-full text-xs bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    >
                      {l.postcode}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
