import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { updateMyProfile } from "../../lib/api";

const ListingsMap = dynamic(() => import("../../components/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
      <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

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
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    ],
    description:
      "Bright private room in friendly sharehouse near Central Station. 5 min walk to buses and trains.",
    lat: -33.883,
    lng: 151.2115,
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
    photos: [
      "https://images.unsplash.com/photo-1598928506311-c55ez637a745?w=400&h=300&fit=crop",
    ],
    description:
      "Affordable shared room close to USYD campus. Quiet neighbourhood with parks nearby.",
    lat: -33.892,
    lng: 151.204,
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
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    ],
    description:
      "Ensuite room with own bathroom in modern apartment. Green Square station 3 min walk.",
    lat: -33.9005,
    lng: 151.2025,
  },
];

const AUSTRALIAN_DESTINATIONS = [
  { label: "Sydney CBD", region: "Sydney" },
  { label: "Surry Hills", region: "Sydney" },
  { label: "Parramatta", region: "Sydney" },
  { label: "Penrith", region: "Sydney" },
  { label: "Newcastle", region: "Newcastle" },
  { label: "Melbourne CBD", region: "Melbourne" },
  { label: "St Kilda", region: "Melbourne" },
  { label: "Box Hill", region: "Melbourne" },
  { label: "Geelong", region: "Geelong" },
  { label: "Brisbane CBD", region: "Brisbane" },
  { label: "South Bank", region: "Brisbane" },
  { label: "Gold Coast", region: "Gold Coast" },
  { label: "Adelaide CBD", region: "Adelaide" },
  { label: "Rundle Mall", region: "Adelaide" },
  { label: "Canberra CBD", region: "Canberra" },
  { label: "Perth CBD", region: "Perth" },
  { label: "Hobart CBD", region: "Hobart" },
];

export default function SeekerSearchExtended() {
  const { session, user } = useAuth();
  const { theme } = useTheme();
  const [results, setResults] = useState(PLACEHOLDER_LISTINGS);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showUseLocation, setShowUseLocation] = useState(false);

  // Filter states
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const saved_listings = localStorage.getItem("wishlist");
    if (saved_listings) {
      try {
        setSaved(new Set(JSON.parse(saved_listings)));
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      }
    }
  }, []);

  const handleSearch = async () => {
    setSearching(true);
    setSearched(true);
    await new Promise((r) => setTimeout(r, 600));

    let filtered = [...PLACEHOLDER_LISTINGS];

    // Filter by price
    filtered = filtered.filter((l) => l.weeklyPrice <= maxPrice);

    // Filter by adults/children (mock - would check availability)
    const totalGuests = adults + children;
    filtered = filtered.filter((l) => {
      // Mock: filter by room type capacity
      return totalGuests <= 4;
    });

    setResults(filtered);
    setSearching(false);
  };

  const toggleSave = (id: string) => {
    const newSaved = new Set(saved);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSaved(newSaved);
    localStorage.setItem("wishlist", JSON.stringify(Array.from(newSaved)));

    // Sync to backend if logged in
    if (session && user?.id) {
      updateMyProfile(session.access_token, {
        wishlist: Array.from(newSaved),
      });
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Location:", latitude, longitude);
          // Would filter listings by distance
          setShowUseLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to get your location");
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Find a <span className="gradient-text">Room</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Search by destination, dates, and group size.
        </p>
      </motion.div>

      {/* Search filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card rounded-2xl p-6 space-y-4"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Destinations */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Where to?
            </label>
            <select
              multiple
              value={selectedDestinations}
              onChange={(e) =>
                setSelectedDestinations(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
              className="input-field"
            >
              {AUSTRALIAN_DESTINATIONS.map((dest) => (
                <option key={dest.label} value={dest.label}>
                  {dest.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hold Ctrl/Cmd to select multiple
            </p>
          </div>

          {/* Check-in */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Check-in
            </label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Check-out */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Check-out
            </label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Guests */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Guests
            </label>
            <select className="input-field">
              <option>{adults + children + infants} guests</option>
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {adults} adults, {children} children, {infants} infants
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Max price: AUD ${maxPrice}/week
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Adults */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Adults (18+)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdults(Math.max(0, adults - 1))}
                className="btn-secondary px-3 py-2 rounded-lg"
              >
                −
              </button>
              <span className="text-sm font-semibold w-8 text-center">{adults}</span>
              <button
                onClick={() => setAdults(adults + 1)}
                className="btn-secondary px-3 py-2 rounded-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Children (2-17)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChildren(Math.max(0, children - 1))}
                className="btn-secondary px-3 py-2 rounded-lg"
              >
                −
              </button>
              <span className="text-sm font-semibold w-8 text-center">
                {children}
              </span>
              <button
                onClick={() => setChildren(children + 1)}
                className="btn-secondary px-3 py-2 rounded-lg"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={searching}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm"
          >
            {searching ? "Searching..." : "Search"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUseLocation(!showUseLocation)}
            className="btn-secondary px-6 py-2.5 rounded-xl text-sm"
          >
            📍 Near me
          </motion.button>
        </div>
      </motion.div>

      {/* Results */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Listing cards */}
        <div className="lg:col-span-3 space-y-4">
          {searching ? (
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
              <svg
                className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                No rooms found
              </h3>
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
                  <div className="w-28 h-20 sm:w-36 sm:h-24 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={listing.photos[0]}
                      alt={listing.address}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
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
                          AUD ${listing.weeklyPrice}
                        </span>
                        <span className="text-rose-400 dark:text-rose-500 text-xs">
                          /wk
                        </span>
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

        {/* Wishlist sidebar */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-24 space-y-4">
            {/* Map view */}
            <div className="card rounded-2xl overflow-hidden aspect-[4/5]">
              {process.env.NEXT_PUBLIC_MAPTILER_KEY ? (
                <ListingsMap listings={results} isDark={theme === "dark"} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                  <svg
                    className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Map view</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Set NEXT_PUBLIC_MAPTILER_KEY to enable</p>
                </div>
              )}
            </div>

            {/* Wishlist */}
            {saved.size > 0 && (
              <Link href="/seeker/wishlist" className="card p-4 rounded-2xl block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Wishlist
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {saved.size} saved items
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button className="text-xs text-rose-500 hover:text-rose-600 font-semibold">
                    View all →
                  </button>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
