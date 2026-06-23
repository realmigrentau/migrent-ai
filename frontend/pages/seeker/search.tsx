import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { updateMyProfile, searchListings, Station, nearbyStations, NearbyStation } from "../../lib/api";
import StationAutocomplete from "../../components/search/StationAutocomplete";

const ListingsMap = dynamic(() => import("../../components/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface)]">
      <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
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
  propertyType?: string;
  furnished: boolean;
  billsIncluded: boolean;
  verified: boolean;
  instantBook: boolean;
  genderPreference: string;
  photos: string[];
  description: string;
  lat: number;
  lng: number;
  stationName?: string;
  stationWalkMin?: number;
  availableFrom?: string;
  minStay?: string;
  petsAllowed?: boolean;
  parking?: boolean;
  airConditioning?: boolean;
  couplesOk?: boolean;
  matchScore?: number;
  matchReasons?: string[];
}

// Calendar helpers
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
    propertyType: l.property_type || undefined,
    furnished: l.furnished ?? false,
    billsIncluded: l.bills_included ?? l.billsIncluded ?? false,
    verified: l.verified ?? false,
    instantBook: l.instant_book_enabled ?? l.instantBook ?? false,
    genderPreference: l.gender_preference ?? l.genderPreference ?? "",
    photos: l.images || l.photos || [],
    description: l.description || "",
    lat: l.lat || l.latitude || -33.88,
    lng: l.lng || l.longitude || 151.21,
    stationName: l.nearest_transport?.split(" - ")[0] || undefined,
    stationWalkMin: l.station_distance_min ?? undefined,
    availableFrom: l.available_from || undefined,
    minStay: l.min_stay || undefined,
    petsAllowed: l.pets_allowed ?? false,
    parking: l.parking ?? false,
    airConditioning: l.air_conditioning ?? false,
    couplesOk: l.couples_ok ?? false,
    matchScore: l.match_score ?? undefined,
    matchReasons: l.match_reasons ?? [],
  };
}

// Filter chip - shown when a filter is active
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary-soft)]">
      {label}
      <button onClick={onRemove} className="ml-0.5 hover:text-[var(--color-ink)] transition-colors">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

// Collapsible filter section
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--color-line)] pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold text-[var(--color-ink)] mb-2"
      >
        {title}
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Toggle pill
function TogglePill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-[var(--color-ink)] text-[var(--color-bg)] shadow-sm"
          : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)]"
      }`}
    >
      {label}
    </button>
  );
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

  // Location
  const [searchType, setSearchType] = useState<"nearMe" | "suburb" | "postcode" | "address">("suburb");
  const [suburbName, setSuburbName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [nearAddress, setNearAddress] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Calendar
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Guests
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  // Price
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Property filters
  const [placeType, setPlaceType] = useState("");
  const [propertyType, setPropertyType] = useState("");

  // Amenity toggles
  const [furnished, setFurnished] = useState(false);
  const [billsIncluded, setBillsIncluded] = useState(false);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [nearStation, setNearStation] = useState(false);
  const [instantBook, setInstantBook] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [parkingFilter, setParkingFilter] = useState(false);
  const [airConFilter, setAirConFilter] = useState(false);
  const [couplesOk, setCouplesOk] = useState(false);
  const [verifiedOwner, setVerifiedOwner] = useState(false);

  // Min stay
  const [minStay, setMinStay] = useState("");

  // Station
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stationDistanceFilter, setStationDistanceFilter] = useState<"any" | "15" | "30">("any");
  const [mapStations, setMapStations] = useState<{ name: string; lat: number; lng: number; line?: string }[]>([]);

  // Sort
  const [sortBy, setSortBy] = useState("newest");

  // UI toggles
  const [showMap, setShowMap] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load wishlist
  useEffect(() => {
    const saved_listings = localStorage.getItem("wishlist");
    if (!saved_listings) return;
    try {
      const parsed = JSON.parse(saved_listings);
      if (Array.isArray(parsed)) setSaved(new Set(parsed));
    } catch (err) {
      console.warn("Wishlist storage was corrupt; resetting.", err);
    }
  }, []);

  // Whether to use best-match mode (requires auth)
  const isBestMatch = sortBy === "best_match";

  // Build params
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

    // Property type filters
    if (placeType) params.place_type = placeType;
    if (propertyType) params.property_type = propertyType;

    // Boolean filters
    if (furnished) params.furnished = "true";
    if (billsIncluded) params.bills_included = "true";
    if (femaleOnly) params.gender_preference = "female";
    if (instantBook) params.instant_book = "true";
    if (petsAllowed) params.pets_allowed = "true";
    if (parkingFilter) params.parking = "true";
    if (airConFilter) params.air_conditioning = "true";
    if (couplesOk) params.couples_ok = "true";
    if (verifiedOwner) params.verified_owner = "true";

    // Min stay
    if (minStay) params.min_stay = minStay;

    // Sort
    if (sortBy !== "newest") params.sort = sortBy;

    // Station
    if (selectedStation) params.station_name = selectedStation.name;
    if (stationDistanceFilter !== "any") {
      params.max_station_min = stationDistanceFilter;
    } else if (nearStation) {
      params.near_station = "true";
    }

    return params;
  }, [minPrice, maxPrice, adults, children, infants, searchType, userLocation, suburbName, postcode, nearAddress, checkInDate, checkOutDate, placeType, propertyType, furnished, billsIncluded, femaleOnly, nearStation, instantBook, petsAllowed, parkingFilter, airConFilter, couplesOk, verifiedOwner, minStay, sortBy, selectedStation, stationDistanceFilter]);

  // Search
  const doSearch = useCallback(async (resetResults = true) => {
    if (resetResults) {
      setSearching(true);
      setOffset(0);
    }
    setSearched(true);

    try {
      const pageOffset = resetResults ? 0 : offset;
      const params = buildParams(pageOffset);
      const token = isBestMatch && session?.access_token ? session.access_token : undefined;
      const data = await searchListings(params, token);

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
  }, [buildParams, offset, isBestMatch, session]);

  // Initial load
  useEffect(() => { doSearch(true); }, []);

  // Nearby stations for map
  useEffect(() => {
    if (selectedStation) {
      nearbyStations(selectedStation.lat, selectedStation.lng, 10, 20).then((nearby) => {
        setMapStations(nearby.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng, line: s.line })));
      });
    } else {
      setMapStations([]);
    }
  }, [selectedStation]);

  // Auto-search on filter change (debounced)
  useEffect(() => {
    if (!searched) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { doSearch(true); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [furnished, billsIncluded, femaleOnly, nearStation, instantBook, petsAllowed, parkingFilter, airConFilter, couplesOk, verifiedOwner, sortBy, selectedStation, stationDistanceFilter, placeType, propertyType, minStay]);

  // Load more
  const loadMore = async () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    setLoadingMore(true);
    try {
      const params = buildParams(newOffset);
      const token = isBestMatch && session?.access_token ? session.access_token : undefined;
      const data = await searchListings(params, token);
      if (data && Array.isArray(data)) {
        setResults((prev) => [...prev, ...data.map(mapListingData)]);
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch { setHasMore(false); }
    finally { setLoadingMore(false); }
  };

  const toggleSave = (id: string) => {
    const newSaved = new Set(saved);
    if (newSaved.has(id)) newSaved.delete(id);
    else newSaved.add(id);
    setSaved(newSaved);
    localStorage.setItem("wishlist", JSON.stringify(Array.from(newSaved)));
    if (session && user?.id) {
      updateMyProfile(session.access_token, { wishlist: Array.from(newSaved) });
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
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setSearchType("nearMe");
        setLocationLoading(false);
      },
      (error) => {
        setLocationError(error.code === 1 ? "Location access denied. Please enable location permissions." : "Unable to get your location. Please try again.");
        setLocationLoading(false);
      }
    );
  };

  // Active filters for chips
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (furnished) activeFilters.push({ label: "Furnished", clear: () => setFurnished(false) });
  if (billsIncluded) activeFilters.push({ label: "Bills included", clear: () => setBillsIncluded(false) });
  if (femaleOnly) activeFilters.push({ label: "Female only", clear: () => setFemaleOnly(false) });
  if (nearStation) activeFilters.push({ label: "Near station", clear: () => setNearStation(false) });
  if (instantBook) activeFilters.push({ label: "Instant book", clear: () => setInstantBook(false) });
  if (petsAllowed) activeFilters.push({ label: "Pets allowed", clear: () => setPetsAllowed(false) });
  if (parkingFilter) activeFilters.push({ label: "Parking", clear: () => setParkingFilter(false) });
  if (airConFilter) activeFilters.push({ label: "Air conditioning", clear: () => setAirConFilter(false) });
  if (couplesOk) activeFilters.push({ label: "Couples OK", clear: () => setCouplesOk(false) });
  if (verifiedOwner) activeFilters.push({ label: "Verified owner", clear: () => setVerifiedOwner(false) });
  if (minPrice) activeFilters.push({ label: `Min $${minPrice}/wk`, clear: () => setMinPrice("") });
  if (maxPrice) activeFilters.push({ label: `Max $${maxPrice}/wk`, clear: () => setMaxPrice("") });
  if (placeType) activeFilters.push({ label: placeType, clear: () => setPlaceType("") });
  if (propertyType) activeFilters.push({ label: propertyType, clear: () => setPropertyType("") });
  if (minStay) activeFilters.push({ label: `Min stay: ${minStay}`, clear: () => setMinStay("") });
  if (selectedStation) activeFilters.push({ label: `Near ${selectedStation.name}`, clear: () => { setSelectedStation(null); setStationDistanceFilter("any"); } });
  if (stationDistanceFilter !== "any" && !selectedStation) activeFilters.push({ label: `< ${stationDistanceFilter} min walk`, clear: () => setStationDistanceFilter("any") });
  if (suburbName) activeFilters.push({ label: suburbName, clear: () => setSuburbName("") });
  if (postcode) activeFilters.push({ label: `Postcode ${postcode}`, clear: () => setPostcode("") });

  const clearAllFilters = () => {
    setMinPrice(""); setMaxPrice("");
    setFurnished(false); setBillsIncluded(false); setFemaleOnly(false);
    setNearStation(false); setInstantBook(false);
    setPetsAllowed(false); setParkingFilter(false); setAirConFilter(false);
    setCouplesOk(false); setVerifiedOwner(false);
    setSelectedStation(null); setStationDistanceFilter("any");
    setPlaceType(""); setPropertyType(""); setMinStay("");
    setSortBy("newest");
    setSuburbName(""); setPostcode(""); setNearAddress("");
    setCheckInDate(null); setCheckOutDate(null);
    setAdults(1); setChildren(0); setInfants(0); setPets(0);
  };

  // Calendar
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(calendarYear, calendarMonth, day);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (clickedDate < today) return;
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(clickedDate); setCheckOutDate(null);
    } else {
      if (clickedDate > checkInDate) { setCheckOutDate(clickedDate); setShowCalendar(false); }
      else { setCheckInDate(clickedDate); setCheckOutDate(null); }
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
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const s = checkInDate.toLocaleDateString("en-AU", opts);
    if (!checkOutDate) return `${s} - ?`;
    return `${s} - ${checkOutDate.toLocaleDateString("en-AU", opts)}`;
  };

  const goToPrevMonth = () => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else setCalendarMonth(calendarMonth - 1); };
  const goToNextMonth = () => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else setCalendarMonth(calendarMonth + 1); };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      const isPast = date < today;
      const selected = isDateSelected(day);
      const inRange = isDateInRange(day);
      days.push(
        <button key={day} onClick={() => handleDateClick(day)} disabled={isPast}
          className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
            isPast ? "text-[var(--color-ink-4)] cursor-not-allowed"
            : selected ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
            : inRange ? "bg-[var(--color-surface-sunk)] text-[var(--color-ink)]"
            : "text-[var(--color-ink-2)] hover:bg-[var(--color-surface-muted)]"
          }`}
        >{day}</button>
      );
    }
    return days;
  };

  // Guest counter
  const GuestCounter = ({ label, value, onDec, onInc, min = 0 }: { label: string; value: number; onDec: () => void; onInc: () => void; min?: number }) => (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--color-ink-2)]">{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={onDec} disabled={value <= min} className="w-7 h-7 rounded-full border border-[var(--color-line)] flex items-center justify-center text-sm disabled:opacity-30 hover:bg-[var(--color-surface)] transition-colors">-</button>
        <span className="text-xs font-semibold w-5 text-center text-[var(--color-ink)]">{value}</span>
        <button onClick={onInc} className="w-7 h-7 rounded-full border border-[var(--color-line)] flex items-center justify-center text-sm hover:bg-[var(--color-surface)] transition-colors">+</button>
      </div>
    </div>
  );

  // --- FILTER SIDEBAR CONTENT (shared between desktop sidebar and mobile drawer) ---
  const filterContent = (
    <div className="space-y-4">
      {/* Location */}
      <FilterSection title="Location" defaultOpen={true}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={handleUseLocation}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${searchType === "nearMe" ? "bg-[var(--color-ink)] text-[var(--color-bg)]" : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)]"}`}>
              {locationLoading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              Near me
            </button>
            {(["suburb", "postcode", "address"] as const).map((t) => (
              <button key={t} onClick={() => setSearchType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${searchType === t ? "bg-[var(--color-ink)] text-[var(--color-bg)]" : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)]"}`}>
                {t === "address" ? "Address" : t === "suburb" ? "Suburb" : "Postcode"}
              </button>
            ))}
          </div>
          {searchType === "nearMe" && userLocation && (
            <p className="text-xs text-[var(--color-accent)] dark:text-[var(--color-accent)] flex items-center gap-1"><span>&#10003;</span> Using your location</p>
          )}
          {searchType === "nearMe" && locationError && <p className="text-xs text-[var(--color-danger-500)]">{locationError}</p>}
          {searchType === "suburb" && (
            <input type="text" value={suburbName} onChange={(e) => setSuburbName(e.target.value)} placeholder="e.g. Kellyville, Parramatta..." className="input-field text-sm" />
          )}
          {searchType === "postcode" && (
            <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. 2155" className="input-field text-sm" maxLength={4} />
          )}
          {searchType === "address" && (
            <input type="text" value={nearAddress} onChange={(e) => setNearAddress(e.target.value)} placeholder="Enter address" className="input-field text-sm" />
          )}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price range ($/week)" defaultOpen={true}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] text-xs pointer-events-none">$</span>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" min="0" className="input-field text-sm" style={{ paddingLeft: "1.75rem" }} />
          </div>
          <span className="flex items-center text-[var(--color-ink-3)] text-xs">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] text-xs pointer-events-none">$</span>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" min="0" className="input-field text-sm" style={{ paddingLeft: "1.75rem" }} />
          </div>
        </div>
      </FilterSection>

      {/* Room type */}
      <FilterSection title="Room type" defaultOpen={true}>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "", label: "All" },
            { value: "private", label: "Private room" },
            { value: "shared", label: "Shared room" },
            { value: "entire", label: "Entire place" },
          ].map((opt) => (
            <TogglePill key={opt.value} active={placeType === opt.value} onClick={() => setPlaceType(placeType === opt.value ? "" : opt.value)} label={opt.label} />
          ))}
        </div>
      </FilterSection>

      {/* Property type */}
      <FilterSection title="Property type" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "", label: "All" },
            { value: "house", label: "House" },
            { value: "apartment", label: "Apartment" },
            { value: "unit", label: "Unit" },
            { value: "studio", label: "Studio" },
            { value: "granny_flat", label: "Granny flat" },
            { value: "townhouse", label: "Townhouse" },
          ].map((opt) => (
            <TogglePill key={opt.value} active={propertyType === opt.value} onClick={() => setPropertyType(propertyType === opt.value ? "" : opt.value)} label={opt.label} />
          ))}
        </div>
      </FilterSection>

      {/* Dates */}
      <FilterSection title="Available dates" defaultOpen={false}>
        <div className="relative" ref={calendarRef}>
          <button onClick={() => setShowCalendar(!showCalendar)} className="input-field text-sm text-left flex items-center justify-between w-full">
            <span className={checkInDate ? "text-[var(--color-ink)]" : "text-[var(--color-ink-3)]"}>{formatDateRange()}</span>
            <svg className="w-4 h-4 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>
          <AnimatePresence>
            {showCalendar && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 p-4 bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-2xl shadow-xl w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={goToPrevMonth} className="p-1.5 hover:bg-[var(--color-surface-muted)] rounded-lg">
                    <svg className="w-4 h-4 text-[var(--color-ink-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <h3 className="font-bold text-sm text-[var(--color-ink)]">{MONTH_NAMES[calendarMonth]} {calendarYear}</h3>
                  <button onClick={goToNextMonth} className="p-1.5 hover:bg-[var(--color-surface-muted)] rounded-lg">
                    <svg className="w-4 h-4 text-[var(--color-ink-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="w-10 h-8 flex items-center justify-center text-xs font-semibold text-[var(--color-ink-3)]">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                {checkInDate && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-line)]">
                    <p className="text-xs text-[var(--color-ink-2)]">
                      {checkOutDate ? `${Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000)} nights` : "Select check-out"}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FilterSection>

      {/* Guests */}
      <FilterSection title="Guests" defaultOpen={false}>
        <div className="space-y-2.5">
          <GuestCounter label="Adults (18+)" value={adults} onDec={() => setAdults(Math.max(1, adults - 1))} onInc={() => setAdults(adults + 1)} min={1} />
          <GuestCounter label="Children (2-17)" value={children} onDec={() => setChildren(Math.max(0, children - 1))} onInc={() => setChildren(children + 1)} />
          <GuestCounter label="Infants (0-2)" value={infants} onDec={() => setInfants(Math.max(0, infants - 1))} onInc={() => setInfants(infants + 1)} />
          <GuestCounter label="Pets" value={pets} onDec={() => setPets(Math.max(0, pets - 1))} onInc={() => setPets(pets + 1)} />
        </div>
      </FilterSection>

      {/* Station */}
      <FilterSection title="Near a station" defaultOpen={false}>
        <div className="space-y-2">
          <StationAutocomplete
            value={selectedStation?.name || ""}
            onSelect={(station) => { setSelectedStation(station); if (station) setStationDistanceFilter("15"); }}
            onClear={() => { setSelectedStation(null); setStationDistanceFilter("any"); }}
          />
          {(selectedStation || stationDistanceFilter !== "any") && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-[var(--color-ink-3)] self-center mr-0.5">Walk:</span>
              {(["15", "30", "any"] as const).map((val) => (
                <button key={val} onClick={() => setStationDistanceFilter(val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${stationDistanceFilter === val ? "bg-[var(--color-accent)] text-[color:var(--color-primary-fg)] shadow-sm" : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)]"}`}>
                  {val === "15" ? "< 15 min" : val === "30" ? "< 30 min" : "Any"}
                </button>
              ))}
            </div>
          )}
        </div>
      </FilterSection>

      {/* Min stay */}
      <FilterSection title="Minimum stay" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "", label: "Any" },
            { value: "1 week", label: "1 week" },
            { value: "2 weeks", label: "2 weeks" },
            { value: "1 month", label: "1 month" },
            { value: "3 months", label: "3 months" },
            { value: "6 months", label: "6 months" },
          ].map((opt) => (
            <TogglePill key={opt.value} active={minStay === opt.value} onClick={() => setMinStay(minStay === opt.value ? "" : opt.value)} label={opt.label} />
          ))}
        </div>
      </FilterSection>

      {/* Amenities & features */}
      <FilterSection title="Amenities & features" defaultOpen={true}>
        <div className="flex flex-wrap gap-1.5">
          <TogglePill active={furnished} onClick={() => setFurnished(!furnished)} label="Furnished" />
          <TogglePill active={billsIncluded} onClick={() => setBillsIncluded(!billsIncluded)} label="Bills included" />
          <TogglePill active={instantBook} onClick={() => setInstantBook(!instantBook)} label="Instant book" />
          <TogglePill active={petsAllowed} onClick={() => setPetsAllowed(!petsAllowed)} label="Pets allowed" />
          <TogglePill active={parkingFilter} onClick={() => setParkingFilter(!parkingFilter)} label="Parking" />
          <TogglePill active={airConFilter} onClick={() => setAirConFilter(!airConFilter)} label="Air con" />
          <TogglePill active={couplesOk} onClick={() => setCouplesOk(!couplesOk)} label="Couples OK" />
          <TogglePill active={nearStation} onClick={() => setNearStation(!nearStation)} label="Near station" />
        </div>
      </FilterSection>

      {/* Preferences */}
      <FilterSection title="Preferences" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          <TogglePill active={femaleOnly} onClick={() => setFemaleOnly(!femaleOnly)} label="Female only" />
          <TogglePill active={verifiedOwner} onClick={() => setVerifiedOwner(!verifiedOwner)} label="Verified owner" />
        </div>
      </FilterSection>

      {/* Search button in sidebar */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { doSearch(true); setShowMobileFilters(false); }}
        disabled={searching}
        className="btn-primary w-full py-3 rounded-xl text-sm font-bold"
      >
        {searching ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Searching...
          </span>
        ) : "Search rooms"}
      </motion.button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          Find a Room
        </h1>
        <p className="text-[15px] text-[var(--color-ink-2)] mt-1.5">
          Search real listings by location, price, and preferences.
        </p>
      </motion.div>

      {/* Mobile: filter button + sort */}
      <div className="lg:hidden flex gap-2">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="btn-secondary py-2.5 px-4 rounded-xl text-sm flex-1 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
        </button>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field text-sm w-auto">
          {session && <option value="best_match">Best match</option>}
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low-High</option>
          <option value="price_desc">Price: High-Low</option>
        </select>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-[var(--color-surface-2)] z-50 overflow-y-auto shadow-2xl lg:hidden"
            >
              <div className="sticky top-0 bg-[var(--color-surface-2)] border-b border-[var(--color-line)] px-5 py-4 flex items-center justify-between z-10">
                <h2 className="font-bold text-lg text-[var(--color-ink)]">Filters</h2>
                <div className="flex items-center gap-3">
                  {activeFilters.length > 0 && (
                    <button onClick={clearAllFilters} className="text-xs text-[var(--color-ink)] hover:opacity-80 font-medium">Clear all</button>
                  )}
                  <button onClick={() => setShowMobileFilters(false)} className="p-1.5 hover:bg-[var(--color-surface-muted)] rounded-lg">
                    <svg className="w-5 h-5 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-5 py-4">
                {filterContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-1.5 items-center">
          {activeFilters.map((f, i) => (
            <FilterChip key={i} label={f.label} onRemove={f.clear} />
          ))}
          <button onClick={clearAllFilters} className="text-xs text-[var(--color-ink)] hover:opacity-80 font-medium ml-1">
            Clear all
          </button>
        </motion.div>
      )}

      {/* Best match header description */}
      {isBestMatch && session && searched && !searching && results.length > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-xs text-[var(--color-ink-3)] -mt-2">
          Listings ranked by how well they fit your saved preferences. Scores are based on location, budget, and features - not guesswork.
          {" "}<Link href="/seeker/profile" className="text-[var(--color-primary)] hover:underline font-medium">Update your preferences</Link>
        </motion.p>
      )}

      {/* Results header */}
      {searched && !searching && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--color-ink-2)]">
            {results.length === 0 ? "No rooms found" : `${results.length}${hasMore ? "+" : ""} rooms found`}
          </p>
          <div className="flex items-center gap-2">
            {/* Desktop sort */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field text-xs w-auto hidden lg:block">
              {session && <option value="best_match">Best match</option>}
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low-High</option>
              <option value="price_desc">Price: High-Low</option>
            </select>
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {showMap ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                )}
              </svg>
              {showMap ? "Hide map" : "Map"}
            </button>
          </div>
        </div>
      )}

      {/* Main layout: sidebar + results + map */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 card rounded-2xl p-5 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-1">
            {filterContent}
          </div>
        </aside>

        {/* Results area */}
        <div className="flex-1 min-w-0">

          {/* Best match prompts */}
          {isBestMatch && !session && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-primary-soft)] flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary)]">Sign in for personalised matches</p>
                <p className="text-xs text-[var(--color-ink-2)] mt-0.5">Add your budget and suburb to your profile and we will rank listings that suit you first.</p>
              </div>
            </motion.div>
          )}

          <div className={`grid gap-6 ${showMap ? "xl:grid-cols-5" : ""}`}>
            {/* Listing cards */}
            <div className={showMap ? "xl:col-span-3" : ""}>
              {searching ? (
                <div className={`grid gap-4 ${showMap ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="card p-4 rounded-2xl space-y-3">
                      <div className="w-full aspect-[16/10] rounded-xl shimmer" />
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded shimmer" />
                        <div className="h-3 w-1/2 rounded shimmer" />
                        <div className="flex gap-2"><div className="h-6 w-16 rounded-full shimmer" /><div className="h-6 w-20 rounded-full shimmer" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                /* No results state */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-10 rounded-2xl text-center">
                  <svg className="w-16 h-16 mx-auto text-[var(--color-ink-4)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="font-bold text-lg text-[var(--color-ink)] mb-2">No rooms match your search</h3>
                  <p className="text-sm text-[var(--color-ink-3)] mb-6 max-w-md mx-auto">
                    Try removing some filters or searching a different area.
                  </p>

                  {/* Recovery actions */}
                  <div className="space-y-4">
                    {activeFilters.length > 0 && (
                      <button
                        onClick={() => { clearAllFilters(); setTimeout(() => doSearch(true), 100); }}
                        className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold"
                      >
                        Clear all filters and search again
                      </button>
                    )}
                    <div>
                      <p className="text-xs text-[var(--color-ink-3)] mb-2">Popular suburbs:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {["Kellyville", "Parramatta", "Blacktown", "Liverpool", "Chatswood", "Bankstown"].map((s) => (
                          <button key={s}
                            onClick={() => {
                              clearAllFilters();
                              setSearchType("suburb");
                              setSuburbName(s);
                              setTimeout(() => doSearch(true), 100);
                            }}
                            className="px-3 py-1.5 rounded-full text-xs bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:bg-[var(--color-line-2)] transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className={`grid gap-4 ${showMap ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}>
                    {results.map((listing, i) => (
                      <motion.div key={listing.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.3) }}
                        whileHover={{ y: -2 }}
                        className="card rounded-2xl overflow-hidden group">
                        {/* Photo */}
                        <div className="relative w-full aspect-[16/10] bg-[var(--color-surface-muted)] overflow-hidden">
                          {listing.photos?.length > 0 ? (
                            <img src={listing.photos[0]} alt={listing.address}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-[var(--color-ink-4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                              </svg>
                            </div>
                          )}
                          {/* Price badge */}
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[var(--color-surface-2)]/95 dark:bg-[var(--color-ink)]/95 backdrop-blur-sm border border-[var(--color-line)]/70 dark:border-[var(--color-line)]">
                            <span className="text-[var(--color-ink)] font-semibold text-sm tabular-nums">${listing.weeklyPrice || listing.dailyPrice || 0}</span>
                            <span className="text-[var(--color-ink-3)] text-xs">{listing.dailyPrice && !listing.weeklyPrice ? "/day" : "/wk"}</span>
                          </div>
                          {/* Save */}
                          <button onClick={(e) => { e.preventDefault(); toggleSave(listing.id); }}
                            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[var(--color-surface-2)]/90 dark:bg-[var(--color-ink)]/90 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-[var(--color-surface-2)]">
                            <svg className={`w-4 h-4 ${saved.has(listing.id) ? "text-[var(--color-coral-500)] fill-[var(--color-coral-500)]" : "text-[var(--color-ink-2)]"}`}
                              fill={saved.has(listing.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          {/* Instant book badge */}
                          {listing.instantBook && (
                            <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-[var(--color-accent)]/90 backdrop-blur-sm text-[color:var(--color-primary-fg)] text-xs font-semibold flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              Instant
                            </div>
                          )}
                        </div>

                        {/* Card body */}
                        <div className="p-4 space-y-2">
                          <div>
                            <h3 className="font-bold text-[var(--color-ink)] text-sm truncate">{listing.address}</h3>
                            <p className="text-xs text-[var(--color-ink-3)]">{listing.suburb}{listing.postcode ? `, ${listing.postcode}` : ""}</p>
                          </div>
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-surface-muted)] text-[var(--color-ink-2)] capitalize">{listing.roomType}</span>
                            {listing.furnished && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-primary-50)] text-[var(--color-primary)]">Furnished</span>}
                            {listing.billsIncluded && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]">Bills incl.</span>}
                            {listing.verified && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 text-[var(--color-accent)] dark:text-[var(--color-accent)]">&#10003; Verified</span>}
                            {listing.genderPreference === "female" && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]">Female only</span>}
                            {listing.petsAllowed && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-warn-50)] text-[var(--color-warn-600)]">Pets OK</span>}
                            {listing.parking && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)]0/10 text-[var(--color-primary)] dark:text-cyan-400">Parking</span>}
                          </div>

                          {/* Match score + reasons (only shown in Best match sort) */}
                          {isBestMatch && listing.matchScore !== undefined && (
                            <div className="pt-1 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${listing.matchScore >= 80 ? "bg-[var(--color-accent)]" : listing.matchScore >= 60 ? "bg-[var(--color-warn-500)]" : "bg-[var(--color-line-2)]"}`}
                                    style={{ width: `${listing.matchScore}%` }}
                                  />
                                </div>
                                <span className={`text-[11px] font-semibold whitespace-nowrap ${listing.matchScore >= 80 ? "text-[var(--color-accent)]" : listing.matchScore >= 60 ? "text-[var(--color-warn-500)]" : "text-[var(--color-ink-3)]"}`}>
                                  {listing.matchScore >= 80 ? "Strong match" : listing.matchScore >= 60 ? "Good match" : "Possible match"}
                                </span>
                              </div>
                              {listing.matchReasons && listing.matchReasons.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {listing.matchReasons.map((reason, ri) => (
                                    <span key={ri} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                                      <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-[var(--color-ink-2)] line-clamp-2">{listing.description}</p>
                          {listing.stationName && listing.stationWalkMin != null && (
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                              listing.stationWalkMin <= 15
                                ? "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 text-[var(--color-accent)] dark:text-[var(--color-accent)]"
                                : "bg-[var(--color-primary-50)] text-[var(--color-primary)]"
                            }`}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h4m4-8H6a2 2 0 00-2 2v14l4-3h10a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
                              <span className="text-xs font-medium">{listing.stationWalkMin} min to {listing.stationName}</span>
                            </div>
                          )}
                          {!listing.billsIncluded && (
                            <p className="text-[11px] text-[var(--color-accent)] dark:text-[var(--color-accent)] font-medium">~${(listing.weeklyPrice || 0) + 50}/wk total with bills + transport</p>
                          )}
                          <Link href={`/listing/${listing.id}`} className="btn-primary py-2 px-4 rounded-lg text-xs w-full text-center block">
                            View details
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Load more */}
                  {hasMore && (
                    <div className="text-center pt-6">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={loadMore} disabled={loadingMore}
                        className="btn-secondary px-8 py-3 rounded-xl text-sm font-semibold">
                        {loadingMore ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-[var(--color-ink)]/20 border-t-[var(--color-ink)] rounded-full animate-spin" />
                            Loading...
                          </span>
                        ) : "Load more rooms"}
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Map */}
            {showMap && (
              <div className="hidden xl:block xl:col-span-2">
                <div className="sticky top-24 space-y-4">
                  <div className="card rounded-2xl overflow-hidden aspect-[4/5]">
                    <ListingsMap listings={results} isDark={theme === "dark"} stations={mapStations} />
                  </div>
                  {saved.size > 0 && (
                    <Link href="/seeker/wishlist" className="card p-4 rounded-2xl block">
                      <p className="text-sm font-bold text-[var(--color-ink)]">Wishlist</p>
                      <p className="text-xs text-[var(--color-ink-3)]">{saved.size} saved items</p>
                      <div className="mt-3 pt-3 border-t border-[var(--color-line)]">
                        <span className="text-xs text-[var(--color-ink)] hover:opacity-80 font-semibold">View all &rarr;</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
