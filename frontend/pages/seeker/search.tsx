import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { updateMyProfile, searchListings } from "../../lib/api";

const ListingsMap = dynamic(() => import("../../components/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
      <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface Listing {
  id: string;
  address: string;
  suburb: string;
  postcode: string;
  dailyPrice?: number;
  weeklyPrice?: number;
  roomType: string;
  furnished: boolean;
  billsIncluded: boolean;
  verified: boolean;
  photos: string[];
  description: string;
  lat: number;
  lng: number;
}

// Calendar helper functions
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function SeekerSearchExtended() {
  const { session, user } = useAuth();
  const { theme } = useTheme();
  const [results, setResults] = useState<Listing[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  // Location states
  const [searchType, setSearchType] = useState<"nearMe" | "suburb" | "postcode" | "address">("suburb");
  const [suburbName, setSuburbName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [nearAddress, setNearAddress] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Calendar states
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Guest states
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    try {
      // Build search params
      const params: Record<string, string> = {
        max_price: String(maxPrice),
        guests: String(adults + children + infants),
      };

      if (searchType === "nearMe" && userLocation) {
        params.lat = String(userLocation.lat);
        params.lng = String(userLocation.lng);
        params.radius = "5"; // 5km radius
      } else if (searchType === "suburb" && suburbName) {
        params.suburb = suburbName;
      } else if (searchType === "postcode" && postcode) {
        params.postcode = postcode;
      } else if (searchType === "address" && nearAddress) {
        params.address = nearAddress;
      }

      if (checkInDate) {
        params.check_in = checkInDate.toISOString().split("T")[0];
      }
      if (checkOutDate) {
        params.check_out = checkOutDate.toISOString().split("T")[0];
      }

      // Fetch from API
      const data = await searchListings(params);

      if (data && Array.isArray(data)) {
        setResults(data.map((l: any) => ({
          id: l.id || l._id,
          address: l.address || "",
          suburb: l.suburb || "",
          postcode: l.postcode || "",
          dailyPrice: l.daily_price ?? l.dailyPrice,
          weeklyPrice: l.weekly_price ?? l.weeklyPrice,
          roomType: l.room_type || l.roomType || "private",
          furnished: l.furnished ?? false,
          billsIncluded: l.bills_included ?? l.billsIncluded ?? false,
          verified: l.verified ?? false,
          photos: l.photos || [],
          description: l.description || "",
          lat: l.lat || l.latitude || -33.88,
          lng: l.lng || l.longitude || 151.21,
        })));
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setSearching(false);
    }
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

    if (session && user?.id) {
      updateMyProfile(session.access_token, {
        wishlist: Array.from(newSaved),
      });
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setSearchType("nearMe");
        setLocationLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(
          error.code === 1
            ? "Location access denied. Please enable location permissions."
            : "Unable to get your location. Please try again."
        );
        setLocationLoading(false);
      }
    );
  };

  // Calendar date selection
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(calendarYear, calendarMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate < today) return; // Can't select past dates

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Start fresh selection
      setCheckInDate(clickedDate);
      setCheckOutDate(null);
    } else {
      // Set check-out date
      if (clickedDate > checkInDate) {
        setCheckOutDate(clickedDate);
        setShowCalendar(false);
      } else {
        // Clicked before check-in, reset
        setCheckInDate(clickedDate);
        setCheckOutDate(null);
      }
    }
  };

  const isDateInRange = (day: number) => {
    if (!checkInDate || !checkOutDate) return false;
    const date = new Date(calendarYear, calendarMonth, day);
    return date > checkInDate && date < checkOutDate;
  };

  const isDateSelected = (day: number) => {
    const date = new Date(calendarYear, calendarMonth, day);
    if (checkInDate && date.toDateString() === checkInDate.toDateString()) return "start";
    if (checkOutDate && date.toDateString() === checkOutDate.toDateString()) return "end";
    return null;
  };

  const formatDateRange = () => {
    if (!checkInDate) return "Select dates";
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const checkInStr = checkInDate.toLocaleDateString("en-AU", options);
    if (!checkOutDate) return `${checkInStr} - ?`;
    const checkOutStr = checkOutDate.toLocaleDateString("en-AU", options);
    return `${checkInStr} - ${checkOutStr}`;
  };

  const goToPrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    // Empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      const isPast = date < today;
      const selected = isDateSelected(day);
      const inRange = isDateInRange(day);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={isPast}
          className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
            isPast
              ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : selected === "start" || selected === "end"
              ? "bg-rose-500 text-white"
              : inRange
              ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Find a <span className="gradient-text">Room</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Search by location, dates, and group size.
        </p>
      </motion.div>

      {/* Search filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card rounded-2xl p-6 space-y-5"
      >
        {/* Location search type tabs */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Search by location
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={handleUseLocation}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                searchType === "nearMe"
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {locationLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "📍"
              )}
              Near me
            </button>
            <button
              onClick={() => setSearchType("suburb")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                searchType === "suburb"
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Suburb
            </button>
            <button
              onClick={() => setSearchType("postcode")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                searchType === "postcode"
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Postcode
            </button>
            <button
              onClick={() => setSearchType("address")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                searchType === "address"
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Near address
            </button>
          </div>

          {/* Location input based on type */}
          {searchType === "nearMe" && userLocation && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span>✓</span> Using your current location
            </p>
          )}
          {searchType === "nearMe" && locationError && (
            <p className="text-sm text-red-500">{locationError}</p>
          )}
          {searchType === "suburb" && (
            <input
              type="text"
              value={suburbName}
              onChange={(e) => setSuburbName(e.target.value)}
              placeholder="Enter suburb name (e.g. Surry Hills)"
              className="input-field"
            />
          )}
          {searchType === "postcode" && (
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Enter postcode (e.g. 2010)"
              className="input-field"
              maxLength={4}
            />
          )}
          {searchType === "address" && (
            <input
              type="text"
              value={nearAddress}
              onChange={(e) => setNearAddress(e.target.value)}
              placeholder="Enter address to search nearby"
              className="input-field"
            />
          )}
        </div>

        {/* When are you staying - Calendar picker */}
        <div className="relative" ref={calendarRef}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            When are you staying?
          </label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="input-field text-left flex items-center justify-between"
          >
            <span className={checkInDate ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}>
              {formatDateRange()}
            </span>
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl w-full max-w-sm"
              >
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={goToPrevMonth}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {MONTH_NAMES[calendarMonth]} {calendarYear}
                  </h3>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>

                {/* Selection info */}
                {checkInDate && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {checkOutDate
                        ? `${Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} nights selected`
                        : "Select check-out date"}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price slider */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Max price: <span className="text-rose-500 font-bold">AUD ${maxPrice}/day</span>
          </label>
          <input
            type="range"
            min="200"
            max="1000"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>$200</span>
            <span>$1000</span>
          </div>
        </div>

        {/* Guests */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Adults */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Adults (18+)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdults(Math.max(1, adults - 1))}
                className="btn-secondary px-3 py-2 rounded-lg text-lg"
              >
                −
              </button>
              <span className="text-sm font-semibold w-8 text-center text-slate-900 dark:text-white">{adults}</span>
              <button
                onClick={() => setAdults(adults + 1)}
                className="btn-secondary px-3 py-2 rounded-lg text-lg"
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
                className="btn-secondary px-3 py-2 rounded-lg text-lg"
              >
                −
              </button>
              <span className="text-sm font-semibold w-8 text-center text-slate-900 dark:text-white">{children}</span>
              <button
                onClick={() => setChildren(children + 1)}
                className="btn-secondary px-3 py-2 rounded-lg text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Infants */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Infants (0-2)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInfants(Math.max(0, infants - 1))}
                className="btn-secondary px-3 py-2 rounded-lg text-lg"
              >
                −
              </button>
              <span className="text-sm font-semibold w-8 text-center text-slate-900 dark:text-white">{infants}</span>
              <button
                onClick={() => setInfants(infants + 1)}
                className="btn-secondary px-3 py-2 rounded-lg text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Pets */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Pets
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPets(Math.max(0, pets - 1))}
                className="btn-secondary px-3 py-2 rounded-lg text-lg"
              >
                −
              </button>
              <span className="text-sm font-semibold w-8 text-center text-slate-900 dark:text-white">{pets}</span>
              <button
                onClick={() => setPets(pets + 1)}
                className="btn-secondary px-3 py-2 rounded-lg text-lg"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Search button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          disabled={searching}
          className="btn-primary px-8 py-3 rounded-xl text-sm font-bold w-full sm:w-auto"
        >
          {searching ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Searching...
            </span>
          ) : (
            "Search rooms"
          )}
        </motion.button>
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
                  <div className="w-28 h-20 sm:w-36 sm:h-24 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                    {listing.photos && listing.photos.length > 0 ? (
                      <img
                        src={listing.photos[0]}
                        alt={listing.address}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    )}
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
                          AUD ${listing.dailyPrice || listing.weeklyPrice || 0}
                        </span>
                        <span className="text-rose-400 dark:text-rose-500 text-xs">
                          {listing.dailyPrice ? "/day" : "/wk"}
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

        {/* Map sidebar */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-24 space-y-4">
            {/* Map view */}
            <div className="card rounded-2xl overflow-hidden aspect-[4/5]">
              <ListingsMap listings={results} isDark={theme === "dark"} />
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
