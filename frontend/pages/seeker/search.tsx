import { useState, useEffect, useRef, useCallback } from "react";
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
  instantBook: boolean;
  genderPreference: string;
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

function mapListingData(l: any): Listing {
  return {
    id: l.id || l._id,
    address: l.address || "",
    suburb: l.suburb || l.city || "",
    postcode: l.postcode ? String(l.postcode) : "",
    dailyPrice: l.daily_price ?? l.dailyPrice,
    weeklyPrice: l.weekly_price ?? l.weeklyPrice,
    roomType: l.place_type || l.room_type || l.roomType || "private",
    furnished: l.furnished ?? false,
    billsIncluded: l.bills_included ?? l.billsIncluded ?? false,
    verified: l.verified ?? false,
    instantBook: l.instant_book_enabled ?? l.instantBook ?? false,
    genderPreference: l.gender_preference ?? l.genderPreference ?? "",
    photos: l.images || l.photos || [],
    description: l.description || "",
    lat: l.lat || l.latitude || -33.88,
    lng: l.lng || l.longitude || 151.21,
  };
}

export default function SeekerSearch() {
  const { session, user } = useAuth();
  const { theme } = useTheme();
  const [results, setResults] = useState<Listing[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 20;

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

  // Price inputs (user-typed, no upper limit)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Filter toggles
  const [furnished, setFurnished] = useState(false);
  const [billsIncluded, setBillsIncluded] = useState(false);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [instantBook, setInstantBook] = useState(false);

  // Sort
  const [sortBy, setSortBy] = useState("newest");

  // Map toggle
  const [showMap, setShowMap] = useState(true);

  // Mobile filters
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounce timer
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // Build search params from current state
  const buildParams = useCallback((pageOffset = 0): Record<string, string> => {
    const params: Record<string, string> = {
      limit: String(PAGE_SIZE),
      offset: String(pageOffset),
    };

    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (adults + children + infants > 0) params.guests = String(adults + children + infants);

    if (searchType === "nearMe" && userLocation) {
      params.lat = String(userLocation.lat);
      params.lng = String(userLocation.lng);
      params.radius = "5";
    } else if (searchType === "suburb" && suburbName) {
      params.suburb = suburbName;
    } else if (searchType === "postcode" && postcode) {
      params.postcode = postcode;
    } else if (searchType === "address" && nearAddress) {
      params.address = nearAddress;
    }

    if (checkInDate) params.check_in = checkInDate.toISOString().split("T")[0];
    if (checkOutDate) params.check_out = checkOutDate.toISOString().split("T")[0];

    if (furnished) params.furnished = "true";
    if (billsIncluded) params.bills_included = "true";
    if (femaleOnly) params.gender_preference = "female";
    if (instantBook) params.instant_book = "true";
    if (sortBy !== "newest") params.sort = sortBy;

    return params;
  }, [minPrice, maxPrice, adults, children, infants, searchType, userLocation, suburbName, postcode, nearAddress, checkInDate, checkOutDate, furnished, billsIncluded, femaleOnly, instantBook, sortBy]);

  // Main search function
  const doSearch = useCallback(async (resetResults = true) => {
    if (resetResults) {
      setSearching(true);
      setOffset(0);
    }
    setSearched(true);

    try {
      const pageOffset = resetResults ? 0 : offset;
      const params = buildParams(pageOffset);
      const data = await searchListings(params);

      if (data && Array.isArray(data)) {
        const mapped = data.map(mapListingData);
        if (resetResults) {
          setResults(mapped);
        } else {
          setResults((prev) => [...prev, ...mapped]);
        }
        setHasMore(data.length === PAGE_SIZE);
      } else {
        if (resetResults) setResults([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Search failed:", err);
      if (resetResults) setResults([]);
      setHasMore(false);
    } finally {
      setSearching(false);
      setLoadingMore(false);
    }
  }, [buildParams, offset]);

  // Load all listings on page load
  useEffect(() => {
    doSearch(true);
  }, []);

  // Debounced auto-search when filters change
  useEffect(() => {
    if (!searched) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [furnished, billsIncluded, femaleOnly, instantBook, sortBy]);

  // Load more
  const loadMore = async () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    setLoadingMore(true);
    try {
      const params = buildParams(newOffset);
      const data = await searchListings(params);
      if (data && Array.isArray(data)) {
        const mapped = data.map(mapListingData);
        setResults((prev) => [...prev, ...mapped]);
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setLoadingMore(false);
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

  const activeFilterCount = [furnished, billsIncluded, femaleOnly, instantBook, minPrice, maxPrice].filter(Boolean).length;

  const clearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setFurnished(false);
    setBillsIncluded(false);
    setFemaleOnly(false);
    setInstantBook(false);
    setSortBy("newest");
    setSuburbName("");
    setPostcode("");
    setNearAddress("");
    setCheckInDate(null);
    setCheckOutDate(null);
    setAdults(1);
    setChildren(0);
    setInfants(0);
    setPets(0);
  };

  // Calendar date selection
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(calendarYear, calendarMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (clickedDate < today) return;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(clickedDate);
      setCheckOutDate(null);
    } else {
      if (clickedDate > checkInDate) {
        setCheckOutDate(clickedDate);
        setShowCalendar(false);
      } else {
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
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }
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

  // Filter toggle button component
  const FilterToggle = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-rose-500 text-white shadow-sm"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      {label}
    </button>
  );

  // Guest counter component
  const GuestCounter = ({ label, value, onDec, onInc, min = 0 }: { label: string; value: number; onDec: () => void; onInc: () => void; min?: number }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button onClick={onDec} disabled={value <= min} className="btn-secondary px-3 py-2 rounded-lg text-lg disabled:opacity-30">-</button>
        <span className="text-sm font-semibold w-8 text-center text-slate-900 dark:text-white">{value}</span>
        <button onClick={onInc} className="btn-secondary px-3 py-2 rounded-lg text-lg">+</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Find a <span className="gradient-text">Room</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Search real listings by location, price, and preferences.
        </p>
      </motion.div>

      {/* Search bar + filters card */}
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
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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

          {searchType === "nearMe" && userLocation && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span>&#10003;</span> Using your current location
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
              placeholder="e.g. Kellyville, Parramatta, Blacktown..."
              className="input-field"
            />
          )}
          {searchType === "postcode" && (
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. 2155, 2150, 2148..."
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

        {/* Dates */}
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
                <div className="flex items-center justify-between mb-4">
                  <button onClick={goToPrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {MONTH_NAMES[calendarMonth]} {calendarYear}
                  </h3>
                  <button onClick={goToNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
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

        {/* Price inputs - user typed, no upper limit */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Price range ($/week)
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">$</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                min="0"
                className="input-field"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
            <span className="flex items-center text-slate-400">-</span>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">$</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max (no limit)"
                min="0"
                className="input-field"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GuestCounter label="Adults (18+)" value={adults} onDec={() => setAdults(Math.max(1, adults - 1))} onInc={() => setAdults(adults + 1)} min={1} />
          <GuestCounter label="Children (2-17)" value={children} onDec={() => setChildren(Math.max(0, children - 1))} onInc={() => setChildren(children + 1)} />
          <GuestCounter label="Infants (0-2)" value={infants} onDec={() => setInfants(Math.max(0, infants - 1))} onInc={() => setInfants(infants + 1)} />
          <GuestCounter label="Pets" value={pets} onDec={() => setPets(Math.max(0, pets - 1))} onInc={() => setPets(pets + 1)} />
        </div>

        {/* Filter toggles - desktop */}
        <div className="hidden md:block">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Filters
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterToggle active={furnished} onClick={() => setFurnished(!furnished)} label="Furnished" />
            <FilterToggle active={billsIncluded} onClick={() => setBillsIncluded(!billsIncluded)} label="Bills included" />
            <FilterToggle active={femaleOnly} onClick={() => setFemaleOnly(!femaleOnly)} label="Female only" />
            <FilterToggle active={instantBook} onClick={() => setInstantBook(!instantBook)} label="Instant book" />
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3.5 py-2 text-sm text-rose-500 hover:text-rose-600 underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Mobile filters toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="btn-secondary py-2.5 px-4 rounded-xl text-sm w-full flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>

          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <FilterToggle active={furnished} onClick={() => setFurnished(!furnished)} label="Furnished" />
                    <FilterToggle active={billsIncluded} onClick={() => setBillsIncluded(!billsIncluded)} label="Bills included" />
                    <FilterToggle active={femaleOnly} onClick={() => setFemaleOnly(!femaleOnly)} label="Female only" />
                    <FilterToggle active={instantBook} onClick={() => setInstantBook(!instantBook)} label="Instant book" />
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-rose-500 hover:text-rose-600 underline underline-offset-2"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort + Search button row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="newest">Sort: Newest first</option>
            <option value="price_asc">Sort: Price low to high</option>
            <option value="price_desc">Sort: Price high to low</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => doSearch(true)}
            disabled={searching}
            className="btn-primary px-8 py-3 rounded-xl text-sm font-bold flex-1 sm:flex-none"
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
        </div>
      </motion.div>

      {/* Results header */}
      {searched && !searching && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {results.length === 0 ? "No rooms found" : `${results.length}${hasMore ? "+" : ""} rooms found`}
          </p>
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {showMap ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              )}
            </svg>
            {showMap ? "Hide map" : "Show map"}
          </button>
        </div>
      )}

      {/* Results grid + map */}
      <div className={`grid gap-6 ${showMap ? "lg:grid-cols-5" : "lg:grid-cols-1"}`}>
        {/* Listing cards */}
        <div className={`space-y-4 ${showMap ? "lg:col-span-3" : ""}`}>
          {searching ? (
            <div className={`grid gap-4 ${showMap ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card p-4 rounded-2xl space-y-3">
                  <div className="w-full aspect-[16/10] rounded-xl shimmer" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded shimmer" />
                    <div className="h-3 w-1/2 rounded shimmer" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full shimmer" />
                      <div className="h-6 w-20 rounded-full shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-10 rounded-2xl text-center"
            >
              <svg
                className="w-16 h-16 mx-auto text-slate-200 dark:text-slate-700 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                No rooms match your search
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
                Try adjusting your filters or searching a different area. Popular suburbs include Kellyville, Parramatta, and Blacktown.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Kellyville", "Parramatta", "Blacktown", "Liverpool"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSearchType("suburb");
                      setSuburbName(s);
                      clearAllFilters();
                      setSuburbName(s);
                      setSearchType("suburb");
                      setTimeout(() => doSearch(true), 100);
                    }}
                    className="px-3 py-1.5 rounded-full text-sm bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              <div className={`grid gap-4 ${showMap ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}>
                {results.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    whileHover={{ y: -2 }}
                    className="card rounded-2xl overflow-hidden group"
                  >
                    {/* Photo */}
                    <div className="relative w-full aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {listing.photos && listing.photos.length > 0 ? (
                        <img
                          src={listing.photos[0]}
                          alt={listing.address}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}

                      {/* Price badge on photo */}
                      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm">
                        <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                          ${listing.weeklyPrice || listing.dailyPrice || 0}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                          {listing.dailyPrice && !listing.weeklyPrice ? "/day" : "/wk"}
                        </span>
                      </div>

                      {/* Save button on photo */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSave(listing.id);
                        }}
                        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
                      >
                        <svg
                          className={`w-4 h-4 ${saved.has(listing.id) ? "text-rose-500 fill-rose-500" : "text-slate-600 dark:text-slate-300"}`}
                          fill={saved.has(listing.id) ? "currentColor" : "none"}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      {/* Instant book badge */}
                      {listing.instantBook && (
                        <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Instant
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {listing.address}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {listing.suburb}{listing.postcode ? `, ${listing.postcode}` : ""}
                        </p>
                      </div>

                      {/* Filter pills */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                          {listing.roomType}
                        </span>
                        {listing.furnished && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            Furnished
                          </span>
                        )}
                        {listing.billsIncluded && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            Bills incl.
                          </span>
                        )}
                        {listing.verified && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            &#10003; Verified
                          </span>
                        )}
                        {listing.genderPreference === "female" && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400">
                            Female only
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {listing.description}
                      </p>

                      <Link
                        href={`/listing/${listing.id}`}
                        className="btn-primary py-2 px-4 rounded-lg text-xs w-full text-center block"
                      >
                        View details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="text-center pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-secondary px-8 py-3 rounded-xl text-sm font-semibold"
                  >
                    {loadingMore ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      "Load more rooms"
                    )}
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Map sidebar */}
        {showMap && (
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="card rounded-2xl overflow-hidden aspect-[4/5]">
                <ListingsMap listings={results} isDark={theme === "dark"} />
              </div>

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
                      View all &rarr;
                    </button>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
