import { useState, useEffect, useRef, useCallback, useMemo, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { GetServerSideProps } from "next";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import {
  updateMyProfile,
  searchListingsPage,
  nearbyStations,
  type Station,
  type PublicListing,
  type SearchPage,
} from "../../lib/api";
import { API_BASE_URL } from "../../lib/apiBase";
import StationAutocomplete from "../../components/search/StationAutocomplete";
import MapErrorBoundary from "../../components/MapErrorBoundary";
import VerificationBadge from "../../components/VerificationBadge";
import { isWebGLAvailable } from "../../lib/webgl";
import type { MapListing } from "../../components/ListingsMap";
import {
  DEFAULT_FILTERS,
  PAGE_SIZE,
  activeFilterCount,
  filtersToApiParams,
  isoToday,
  parseSearchQuery,
  serializeSearchFilters,
  validateSearchDates,
  type SearchFilters,
  type SortBy,
} from "../../lib/search/searchQuery";

/**
 * /seeker/search
 *
 * Results render before the map, on the server. The map is a bonus that
 * loads after the first page of results has painted, only when WebGL is
 * available, and inside an error boundary. Nothing the map does can take
 * the list down with it.
 *
 * The URL carries every filter (lib/search/searchQuery.ts), so the homepage
 * hero, the category chips, a shared link and the browser's back button all
 * land on the same search.
 */

const ListingsMap = dynamic(() => import("../../components/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface)]" aria-hidden="true">
      <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type MapState = "idle" | "loading" | "ready" | "unavailable";

interface Props {
  initialFilters: SearchFilters;
  initialPage: SearchPage | null;
  serverToday: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query, res }) => {
  const serverToday = isoToday();
  const filters = parseSearchQuery(query as Record<string, string | string[] | undefined>, serverToday);

  // First page on the server so the HTML already contains results. A slow
  // or failing API must not block the page: cap the wait and fall back to a
  // client fetch, which the page does automatically when initialPage is null.
  let initialPage: SearchPage | null = null;
  if (API_BASE_URL) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      initialPage = await searchListingsPage(filtersToApiParams(filters, 0), undefined, {
        signal: controller.signal,
        baseUrl: API_BASE_URL,
      });
      if (!initialPage.ok) initialPage = null;
    } catch {
      initialPage = null;
    } finally {
      clearTimeout(timer);
    }
  }

  // No cookies are read here, so the response can be shared briefly at the edge.
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
  return { props: { initialFilters: filters, initialPage, serverToday } };
};

// ---------------------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------------------

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-0.5 pl-2.5 pr-1 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary-soft)]">
      {label}
      <button
        type="button"
        aria-label={`Remove filter: ${label}`}
        onClick={onRemove}
        className="w-7 h-7 -my-1 inline-flex items-center justify-center rounded-full hover:bg-[var(--color-line)] hover:text-[var(--color-ink)] transition-colors"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

let sectionSeq = 0;
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [id] = useState(() => `filter-section-${++sectionSeq}`);
  return (
    <div className="border-b border-[var(--color-line)] pb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={id}
        className="flex items-center justify-between w-full min-h-[44px] text-sm font-semibold text-[var(--color-ink)] mb-1"
      >
        {title}
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

function TogglePill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 min-h-[36px] rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-[var(--color-ink)] text-[var(--color-bg)] shadow-sm"
          : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)]"
      }`}
    >
      {label}
    </button>
  );
}

function MapUnavailablePanel({ reason, onRetry }: { reason: string; onRetry?: () => void }) {
  return (
    <div
      role="status"
      className="w-full h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 bg-[var(--color-surface)]"
      data-testid="map-unavailable"
    >
      <svg className="w-10 h-10 text-[var(--color-ink-4)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      <p className="text-sm font-semibold text-[var(--color-ink)]">Map unavailable</p>
      <p className="text-xs text-[var(--color-ink-3)] mt-1 max-w-[28ch]">{reason}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 btn-secondary h-10 px-4 rounded-lg text-xs">
          Try the map again
        </button>
      )}
    </div>
  );
}

function priceLabel(l: PublicListing) {
  if (l.weekly_price) return { amount: l.weekly_price, unit: "/wk" };
  if (l.daily_price) return { amount: l.daily_price, unit: "/day" };
  return { amount: 0, unit: "/wk" };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SeekerSearch({ initialFilters, initialPage, serverToday }: Props) {
  const router = useRouter();
  const { session, user } = useAuth();
  const { theme } = useTheme();

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<PublicListing[]>(initialPage?.listings ?? []);
  const [total, setTotal] = useState<number | null>(initialPage?.total ?? null);
  const [hasMore, setHasMore] = useState<boolean>(initialPage?.hasMore ?? false);
  const [searching, setSearching] = useState(!initialPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<SearchPage["error"]>(null);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | undefined>(undefined);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [offline, setOffline] = useState(false);
  const [dateErrors, setDateErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showMap, setShowMap] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mapState, setMapState] = useState<MapState>("idle");
  const [mapReason, setMapReason] = useState("");
  const [mapKey, setMapKey] = useState(0);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapStations, setMapStations] = useState<{ name: string; lat: number; lng: number; line?: string }[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const requestSeq = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWrittenUrl = useRef<string>(serializeSearchFilters(initialFilters).toString());
  const firstRender = useRef(true);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const isBestMatch = filters.sortBy === "best_match";
  const filterCount = useMemo(() => activeFilterCount(filters), [filters]);

  const update = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => (prev[key] === value ? prev : { ...prev, [key]: value, page: 1 }));
  }, []);

  // ── Online / offline ──
  useEffect(() => {
    const sync = () => setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  // ── Wishlist (local + profile) ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wishlist");
      const parsed = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed)) setSaved(new Set(parsed));
    } catch {
      /* corrupt storage: start empty */
    }
  }, []);

  // ── WebGL: decide once, before any map code is downloaded ──
  useEffect(() => {
    if (!isWebGLAvailable()) {
      setMapState("unavailable");
      setMapReason("Your browser or device cannot draw maps right now. Results are listed below.");
    }
  }, []);

  // ── Fetch ──
  const runSearch = useCallback(
    async (f: SearchFilters, mode: "replace" | "append") => {
      const seq = ++requestSeq.current;
      const offset = mode === "append" ? results.length : 0;
      if (mode === "replace") {
        setSearching(true);
        setSearchError(null);
        setSearchErrorMessage(undefined);
      } else {
        setLoadingMore(true);
        setLoadMoreError(false);
      }
      const token = f.sortBy === "best_match" && session?.access_token ? session.access_token : undefined;
      const page = await searchListingsPage(filtersToApiParams(f, offset, PAGE_SIZE), token);
      if (seq !== requestSeq.current) return; // a newer request superseded this one
      if (mode === "replace") {
        setSearching(false);
        if (page.ok) {
          setResults(page.listings);
          setTotal(page.total);
          setHasMore(page.hasMore);
        } else {
          setSearchError(page.error);
          setSearchErrorMessage(page.errorMessage);
        }
      } else {
        setLoadingMore(false);
        if (page.ok) {
          setResults((prev) => {
            const seen = new Set(prev.map((r) => r.id));
            return [...prev, ...page.listings.filter((r) => !seen.has(r.id))];
          });
          setTotal(page.total);
          setHasMore(page.hasMore);
        } else {
          setLoadMoreError(true);
        }
      }
    },
    [results.length, session?.access_token]
  );

  // Server fetch failed (or ran without an API URL): fetch on the client.
  // Also rewrite the address bar to the canonical form of what was parsed,
  // so a shared link with an impossible date range or hostile input does
  // not stay in the URL (and does not get re-shared).
  useEffect(() => {
    if (!initialPage) void runSearch(initialFilters, "replace");
    const canonical = serializeSearchFilters(initialFilters).toString();
    const current = typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : canonical;
    if (current !== canonical) {
      lastWrittenUrl.current = canonical;
      void router.replace({ pathname: "/seeker/search", query: Object.fromEntries(new URLSearchParams(canonical)) }, undefined, { shallow: true, scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filters -> URL + fetch (debounced) ──
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const dates = validateSearchDates(filters.checkIn, filters.checkOut, serverToday);
    setDateErrors(dates.errors);
    const effective = { ...filters, checkIn: dates.checkIn, checkOut: dates.checkOut };
    const qs = serializeSearchFilters(effective).toString();
    if (qs !== lastWrittenUrl.current) {
      lastWrittenUrl.current = qs;
      void router.replace({ pathname: "/seeker/search", query: Object.fromEntries(new URLSearchParams(qs)) }, undefined, {
        shallow: true,
        scroll: false,
      });
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void runSearch(effective, "replace"), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // runSearch changes identity with results.length; we only want filter changes here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ── Back / forward: URL -> filters ──
  useEffect(() => {
    if (!router.isReady) return;
    const qs = serializeSearchFilters(parseSearchQuery(router.query as Record<string, string | string[] | undefined>, serverToday)).toString();
    if (qs === lastWrittenUrl.current) return;
    lastWrittenUrl.current = qs;
    const next = parseSearchQuery(router.query as Record<string, string | string[] | undefined>, serverToday);
    setFilters(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath, router.isReady]);

  // Re-run once the session arrives for best-match sorting.
  useEffect(() => {
    if (isBestMatch && session?.access_token) void runSearch(filters, "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  // ── Map mounts only after results have painted ──
  useEffect(() => {
    if (mapState === "unavailable") return;
    if (searching || results.length === 0 || !showMap) return;
    if (mapState !== "idle") return;
    const idle = (cb: () => void) =>
      "requestIdleCallback" in window ? (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(cb) : setTimeout(cb, 250);
    idle(() => setMapState("loading"));
  }, [searching, results.length, showMap, mapState]);

  // ── Stations near the selected station ──
  useEffect(() => {
    if (!selectedStation) {
      setMapStations([]);
      return;
    }
    nearbyStations(selectedStation.lat, selectedStation.lng, 10, 20)
      .then((nearby) => setMapStations(nearby.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng, line: s.line }))))
      .catch(() => setMapStations([]));
  }, [selectedStation]);

  // ── Actions ──
  const loadMore = () => void runSearch(filters, "append");
  const retry = () => void runSearch(filters, "replace");

  const onMapUnavailable = useCallback((reason: "webgl" | "init" | "style" | "config") => {
    setMapState("unavailable");
    setMapReason(
      reason === "webgl"
        ? "Your browser or device cannot draw maps right now. Results are listed below."
        : reason === "config"
          ? "The map is not configured on this site yet. Results are listed below."
          : "The map could not load. Results are listed below."
    );
  }, []);

  const retryMap = () => {
    if (!isWebGLAvailable()) return;
    setMapState("idle");
    setMapKey((k) => k + 1);
  };

  const toggleSave = (id: string) => {
    const next = new Set(saved);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSaved(next);
    try {
      localStorage.setItem("wishlist", JSON.stringify(Array.from(next)));
    } catch {
      /* storage unavailable */
    }
    if (session && user?.id) void updateMyProfile(session.access_token, { wishlist: Array.from(next) });
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
        setFilters((prev) => ({ ...prev, searchType: "nearMe", lat: position.coords.latitude, lng: position.coords.longitude, page: 1 }));
        setLocationLoading(false);
      },
      (error) => {
        setLocationError(error.code === 1 ? "Location access denied. Please enable location permissions." : "Unable to get your location. Please try again.");
        setLocationLoading(false);
      }
    );
  };

  const clearAllFilters = () => {
    setSelectedStation(null);
    setFilters({ ...DEFAULT_FILTERS });
  };

  const onSubmitFilters = (e: FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    void runSearch(filters, "replace");
    setShowMobileFilters(false);
    statusRef.current?.focus();
  };

  // ── Active chips ──
  const activeFilters: { label: string; clear: () => void }[] = [];
  const chip = (cond: boolean, label: string, clear: () => void) => cond && activeFilters.push({ label, clear });
  chip(filters.furnished, "Furnished", () => update("furnished", false));
  chip(filters.billsIncluded, "Bills included", () => update("billsIncluded", false));
  chip(filters.femaleOnly, "Female only", () => update("femaleOnly", false));
  chip(filters.nearStation, "Near station", () => update("nearStation", false));
  chip(filters.instantBook, "Instant book", () => update("instantBook", false));
  chip(filters.petsAllowed, "Pets allowed", () => update("petsAllowed", false));
  chip(filters.parking, "Parking", () => update("parking", false));
  chip(filters.airCon, "Air conditioning", () => update("airCon", false));
  chip(filters.couplesOk, "Couples OK", () => update("couplesOk", false));
  chip(filters.verifiedOwner, "ID-verified hosts", () => update("verifiedOwner", false));
  chip(Boolean(filters.minPrice), `Min $${filters.minPrice}/wk`, () => update("minPrice", ""));
  chip(Boolean(filters.maxPrice), `Max $${filters.maxPrice}/wk`, () => update("maxPrice", ""));
  chip(Boolean(filters.placeType), filters.placeType, () => update("placeType", ""));
  chip(Boolean(filters.propertyType), filters.propertyType, () => update("propertyType", ""));
  chip(Boolean(filters.minStay), `Min stay: ${filters.minStay}`, () => update("minStay", ""));
  chip(Boolean(filters.checkIn), `Move in ${filters.checkIn}`, () => update("checkIn", ""));
  chip(Boolean(filters.checkOut), `Move out ${filters.checkOut}`, () => update("checkOut", ""));
  chip(Boolean(filters.stationName), `Near ${filters.stationName}`, () => {
    setSelectedStation(null);
    setFilters((p) => ({ ...p, stationName: "", stationDistance: "any", page: 1 }));
  });
  chip(filters.stationDistance !== "any" && !filters.stationName, `< ${filters.stationDistance} min walk`, () => update("stationDistance", "any"));
  chip(filters.searchType === "suburb" && Boolean(filters.suburb), filters.suburb, () => update("suburb", ""));
  chip(filters.searchType === "postcode" && Boolean(filters.postcode), `Postcode ${filters.postcode}`, () => update("postcode", ""));

  const mapListings: MapListing[] = useMemo(
    () =>
      results.map((l) => ({
        id: l.id,
        title: l.title ?? undefined,
        displayAddress: l.display_address,
        suburb: l.suburb ?? l.city ?? "",
        weeklyPrice: l.weekly_price,
        dailyPrice: l.daily_price ?? undefined,
        approxLat: l.location?.approx_lat ?? null,
        approxLng: l.location?.approx_lng ?? null,
        radiusM: l.location?.radius_m,
      })),
    [results]
  );

  const resultsSummary = searching
    ? "Searching for rooms"
    : searchError
      ? "Search could not be completed"
      : results.length === 0
        ? "No rooms found"
        : total !== null && total > results.length
          ? `Showing ${results.length} of ${total} rooms`
          : `${results.length} ${results.length === 1 ? "room" : "rooms"} found`;

  const GuestCounter = ({ id, label, value, onDec, onInc, min = 0 }: { id: string; label: string; value: number; onDec: () => void; onInc: () => void; min?: number }) => (
    <div className="flex items-center justify-between" role="group" aria-labelledby={id}>
      <span id={id} className="text-xs text-[var(--color-ink-2)]">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Fewer ${label}`} onClick={onDec} disabled={value <= min} className="w-9 h-9 rounded-full border border-[var(--color-line)] flex items-center justify-center text-sm disabled:opacity-30 hover:bg-[var(--color-surface)] transition-colors">-</button>
        <span className="text-xs font-semibold w-5 text-center text-[var(--color-ink)]" aria-live="polite">{value}</span>
        <button type="button" aria-label={`More ${label}`} onClick={onInc} className="w-9 h-9 rounded-full border border-[var(--color-line)] flex items-center justify-center text-sm hover:bg-[var(--color-surface)] transition-colors">+</button>
      </div>
    </div>
  );

  const today = isoToday();

  const filterContent = (
    <form role="search" aria-label="Room filters" onSubmit={onSubmitFilters} className="space-y-4">
      <FilterSection title="Location" defaultOpen>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Search by">
            <button type="button" onClick={handleUseLocation} aria-pressed={filters.searchType === "nearMe"}
              className={`px-3 min-h-[36px] rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${filters.searchType === "nearMe" ? "bg-[var(--color-ink)] text-[var(--color-bg)]" : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)]"}`}>
              {locationLoading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" /> : null}
              Near me
            </button>
            {(["suburb", "postcode", "address"] as const).map((t) => (
              <button key={t} type="button" onClick={() => update("searchType", t)} aria-pressed={filters.searchType === t}
                className={`px-3 min-h-[36px] rounded-lg text-xs font-medium transition-all capitalize ${filters.searchType === t ? "bg-[var(--color-ink)] text-[var(--color-bg)]" : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)]"}`}>
                {t}
              </button>
            ))}
          </div>
          {filters.searchType === "nearMe" && filters.lat !== null && (
            <p className="text-xs text-[var(--color-primary)]">Using your location</p>
          )}
          {filters.searchType === "nearMe" && locationError && <p className="text-xs text-[var(--color-danger-500)]" role="alert">{locationError}</p>}
          {filters.searchType === "suburb" && (
            <label className="block">
              <span className="sr-only">Suburb or city</span>
              <input type="search" name="suburb" value={filters.suburb} onChange={(e) => update("suburb", e.target.value)} placeholder="e.g. Kellyville, Parramatta" autoComplete="off" className="input-field text-sm" />
            </label>
          )}
          {filters.searchType === "postcode" && (
            <label className="block">
              <span className="sr-only">Postcode</span>
              <input type="text" inputMode="numeric" pattern="[0-9]{4}" name="postcode" value={filters.postcode} onChange={(e) => update("postcode", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="e.g. 2155" className="input-field text-sm" maxLength={4} />
            </label>
          )}
          {filters.searchType === "address" && (
            <label className="block">
              <span className="sr-only">Suburb or area</span>
              <input type="search" name="address" value={filters.address} onChange={(e) => update("address", e.target.value)} placeholder="Suburb or area" className="input-field text-sm" />
            </label>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Price range ($/week)" defaultOpen>
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Minimum weekly price</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] text-xs pointer-events-none" aria-hidden="true">$</span>
            <input type="number" name="minPrice" value={filters.minPrice} onChange={(e) => update("minPrice", e.target.value.replace(/[^0-9]/g, ""))} placeholder="Min" min={0} max={50000} className="input-field text-sm" style={{ paddingLeft: "1.75rem" }} />
          </label>
          <span className="flex items-center text-[var(--color-ink-3)] text-xs" aria-hidden="true">-</span>
          <label className="relative flex-1">
            <span className="sr-only">Maximum weekly price</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] text-xs pointer-events-none" aria-hidden="true">$</span>
            <input type="number" name="maxPrice" value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value.replace(/[^0-9]/g, ""))} placeholder="Max" min={0} max={50000} className="input-field text-sm" style={{ paddingLeft: "1.75rem" }} />
          </label>
        </div>
      </FilterSection>

      <FilterSection title="Room type" defaultOpen>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "", label: "All" },
            { value: "private", label: "Private room" },
            { value: "shared", label: "Shared room" },
            { value: "entire", label: "Entire place" },
          ].map((opt) => (
            <TogglePill key={opt.value} active={filters.placeType === opt.value} onClick={() => update("placeType", filters.placeType === opt.value ? "" : opt.value)} label={opt.label} />
          ))}
        </div>
      </FilterSection>

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
            <TogglePill key={opt.value} active={filters.propertyType === opt.value} onClick={() => update("propertyType", filters.propertyType === opt.value ? "" : opt.value)} label={opt.label} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Dates" defaultOpen={Boolean(filters.checkIn || filters.checkOut)}>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[11px] font-semibold text-[var(--color-ink-3)] uppercase tracking-wide">Move in</span>
            <input type="date" name="checkIn" value={filters.checkIn} min={today} onChange={(e) => update("checkIn", e.target.value)} className="input-field text-sm mt-1" aria-describedby={dateErrors.length ? "date-errors" : undefined} aria-invalid={dateErrors.length > 0 || undefined} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold text-[var(--color-ink-3)] uppercase tracking-wide">Move out</span>
            <input type="date" name="checkOut" value={filters.checkOut} min={filters.checkIn || today} onChange={(e) => update("checkOut", e.target.value)} className="input-field text-sm mt-1" aria-describedby={dateErrors.length ? "date-errors" : undefined} aria-invalid={dateErrors.length > 0 || undefined} />
          </label>
        </div>
        {dateErrors.length > 0 && (
          <ul id="date-errors" className="mt-2 text-xs text-[var(--color-danger-500)] space-y-0.5" role="alert">
            {dateErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </FilterSection>

      <FilterSection title="Guests" defaultOpen={false}>
        <div className="space-y-2.5">
          <GuestCounter id="guests-adults" label="Adults (18+)" value={filters.adults} onDec={() => update("adults", Math.max(1, filters.adults - 1))} onInc={() => update("adults", Math.min(20, filters.adults + 1))} min={1} />
          <GuestCounter id="guests-children" label="Children (2-17)" value={filters.children} onDec={() => update("children", Math.max(0, filters.children - 1))} onInc={() => update("children", Math.min(20, filters.children + 1))} />
          <GuestCounter id="guests-infants" label="Infants (0-2)" value={filters.infants} onDec={() => update("infants", Math.max(0, filters.infants - 1))} onInc={() => update("infants", Math.min(20, filters.infants + 1))} />
          <GuestCounter id="guests-pets" label="Pets" value={filters.pets} onDec={() => update("pets", Math.max(0, filters.pets - 1))} onInc={() => update("pets", Math.min(10, filters.pets + 1))} />
        </div>
      </FilterSection>

      <FilterSection title="Near a station" defaultOpen={Boolean(filters.stationName)}>
        <div className="space-y-2">
          <StationAutocomplete
            value={selectedStation?.name || filters.stationName}
            onSelect={(station) => {
              setSelectedStation(station);
              setFilters((p) => ({ ...p, stationName: station ? station.name : "", stationDistance: station ? "15" : p.stationDistance, page: 1 }));
            }}
            onClear={() => {
              setSelectedStation(null);
              setFilters((p) => ({ ...p, stationName: "", stationDistance: "any", page: 1 }));
            }}
          />
          {(filters.stationName || filters.stationDistance !== "any") && (
            <div className="flex flex-wrap gap-1.5 items-center" role="group" aria-label="Walking distance">
              <span className="text-[11px] text-[var(--color-ink-3)] mr-0.5">Walk:</span>
              {(["15", "30", "any"] as const).map((val) => (
                <button key={val} type="button" onClick={() => update("stationDistance", val)} aria-pressed={filters.stationDistance === val}
                  className={`px-2.5 min-h-[36px] rounded-lg text-[11px] font-medium transition-all ${filters.stationDistance === val ? "bg-[var(--color-accent)] text-[color:var(--color-primary-fg)] shadow-sm" : "bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)]"}`}>
                  {val === "15" ? "< 15 min" : val === "30" ? "< 30 min" : "Any"}
                </button>
              ))}
            </div>
          )}
        </div>
      </FilterSection>

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
            <TogglePill key={opt.value} active={filters.minStay === opt.value} onClick={() => update("minStay", filters.minStay === opt.value ? "" : opt.value)} label={opt.label} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Amenities & features" defaultOpen>
        <div className="flex flex-wrap gap-1.5">
          <TogglePill active={filters.furnished} onClick={() => update("furnished", !filters.furnished)} label="Furnished" />
          <TogglePill active={filters.billsIncluded} onClick={() => update("billsIncluded", !filters.billsIncluded)} label="Bills included" />
          <TogglePill active={filters.instantBook} onClick={() => update("instantBook", !filters.instantBook)} label="Instant book" />
          <TogglePill active={filters.petsAllowed} onClick={() => update("petsAllowed", !filters.petsAllowed)} label="Pets allowed" />
          <TogglePill active={filters.parking} onClick={() => update("parking", !filters.parking)} label="Parking" />
          <TogglePill active={filters.airCon} onClick={() => update("airCon", !filters.airCon)} label="Air con" />
          <TogglePill active={filters.couplesOk} onClick={() => update("couplesOk", !filters.couplesOk)} label="Couples OK" />
          <TogglePill active={filters.nearStation} onClick={() => update("nearStation", !filters.nearStation)} label="Near station" />
        </div>
      </FilterSection>

      <FilterSection title="Preferences" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          <TogglePill active={filters.femaleOnly} onClick={() => update("femaleOnly", !filters.femaleOnly)} label="Female only" />
          <TogglePill active={filters.verifiedOwner} onClick={() => update("verifiedOwner", !filters.verifiedOwner)} label="ID-verified hosts" />
        </div>
      </FilterSection>

      <button type="submit" disabled={searching} className="btn-primary w-full min-h-[44px] py-3 rounded-xl text-sm font-bold">
        {searching ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
            Searching
          </span>
        ) : (
          "Search rooms"
        )}
      </button>
    </form>
  );

  const sortSelect = (id: string, className: string) => (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">Sort results</span>
      <select id={id} value={filters.sortBy} onChange={(e) => update("sortBy", e.target.value as SortBy)} className={className}>
        {session && <option value="best_match">Best match</option>}
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low-High</option>
        <option value="price_desc">Price: High-Low</option>
      </select>
    </label>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Find a Room</h1>
        <p className="text-[15px] text-[var(--color-ink-2)] mt-1.5">Search real listings by location, price, and preferences. Exact addresses are shared once a booking is agreed.</p>
      </div>

      {offline && (
        <div role="alert" className="rounded-xl border border-[var(--color-warn-500)]/40 bg-[var(--color-warn-50)] px-4 py-3 text-sm text-[var(--color-warn-600)]">
          You appear to be offline. Results shown are from your last search; we will retry when you reconnect.
        </div>
      )}

      {/* Mobile: filter button + sort */}
      <div className="lg:hidden flex gap-2">
        <button type="button" onClick={() => setShowMobileFilters(true)} aria-expanded={showMobileFilters} aria-controls="mobile-filters"
          className="btn-secondary min-h-[44px] px-4 rounded-xl text-sm flex-1 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters{filterCount > 0 ? ` (${filterCount})` : ""}
        </button>
        {sortSelect("sort-mobile", "input-field text-sm w-auto min-h-[44px]")}
      </div>

      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setShowMobileFilters(false)} aria-hidden="true" />
            <motion.div
              id="mobile-filters"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-[var(--color-surface-2)] z-50 overflow-y-auto shadow-2xl lg:hidden"
            >
              <div className="sticky top-0 bg-[var(--color-surface-2)] border-b border-[var(--color-line)] px-5 py-3 flex items-center justify-between z-10">
                <h2 className="font-bold text-lg text-[var(--color-ink)]">Filters</h2>
                <div className="flex items-center gap-1">
                  {filterCount > 0 && (
                    <button type="button" onClick={clearAllFilters} className="text-xs text-[var(--color-ink)] hover:opacity-80 font-medium min-h-[44px] px-2">Clear all</button>
                  )}
                  <button type="button" onClick={() => setShowMobileFilters(false)} aria-label="Close filters" className="w-11 h-11 inline-flex items-center justify-center hover:bg-[var(--color-surface-muted)] rounded-lg">
                    <svg className="w-5 h-5 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-5 py-4">{filterContent}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center" aria-label="Active filters">
          {activeFilters.map((f) => (
            <FilterChip key={f.label} label={f.label} onRemove={f.clear} />
          ))}
          <button type="button" onClick={clearAllFilters} className="text-xs text-[var(--color-ink)] hover:opacity-80 font-medium ml-1 min-h-[36px] px-2">
            Clear all
          </button>
        </div>
      )}

      {isBestMatch && session && !searching && results.length > 0 && (
        <p className="text-xs text-[var(--color-ink-3)] -mt-2">
          Listings ranked by how well they fit your saved preferences: location, budget and features.{" "}
          <Link href="/dashboard/seeker-profile" className="text-[var(--color-primary)] hover:underline font-medium">Update your preferences</Link>
        </p>
      )}

      {/* Results header + live region */}
      <div className="flex items-center justify-between gap-3">
        <p ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="text-sm font-medium text-[var(--color-ink-2)] outline-none" data-testid="results-status">
          {resultsSummary}
          {mapState === "unavailable" && !searching && results.length > 0 ? ". Map unavailable, showing list only." : ""}
        </p>
        <div className="flex items-center gap-2">
          {sortSelect("sort-desktop", "input-field text-xs w-auto hidden lg:block min-h-[40px]")}
          {mapState !== "unavailable" && (
            <button type="button" onClick={() => setShowMap(!showMap)} aria-pressed={showMap}
              className="hidden xl:flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg text-xs font-medium bg-[var(--color-surface-sunk)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)] transition-colors">
              {showMap ? "Hide map" : "Show map"}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-72 shrink-0" aria-label="Filters">
          <div className="sticky top-24 card rounded-2xl p-5 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-1">{filterContent}</div>
        </aside>

        <div className="flex-1 min-w-0">
          {isBestMatch && !session && (
            <div className="mb-4 p-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-primary-soft)]">
              <p className="text-sm font-semibold text-[var(--color-primary)]">Sign in for personalised matches</p>
              <p className="text-xs text-[var(--color-ink-2)] mt-0.5">Add your budget and suburb to your profile and we will rank listings that suit you first.</p>
            </div>
          )}

          <div className={`grid gap-6 ${showMap && mapState !== "unavailable" ? "xl:grid-cols-5" : ""}`}>
            <section aria-label="Search results" className={showMap && mapState !== "unavailable" ? "xl:col-span-3" : ""} data-testid="results-list">
              {searching ? (
                <div className={`grid gap-4 ${showMap ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`} aria-hidden="true">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="card p-4 rounded-2xl space-y-3">
                      <div className="w-full aspect-[16/10] rounded-xl shimmer" />
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded shimmer" />
                        <div className="h-3 w-1/2 rounded shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchError ? (
                <div className="card p-10 rounded-2xl text-center" role="alert" data-testid="search-error">
                  <h2 className="font-bold text-lg text-[var(--color-ink)] mb-2">
                    {searchError === "bad-request" ? "That search could not be run" : "We could not load rooms right now"}
                  </h2>
                  <p className="text-sm text-[var(--color-ink-3)] mb-6 max-w-md mx-auto">
                    {searchError === "bad-request"
                      ? searchErrorMessage || "One of the filters is not valid. Clear it and try again."
                      : offline
                        ? "You are offline. Reconnect and try again."
                        : "Something went wrong on our side, not yours. Your filters are kept."}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={retry} className="btn-primary px-6 min-h-[44px] rounded-xl text-sm font-semibold">Try again</button>
                    {searchError === "bad-request" && (
                      <button type="button" onClick={clearAllFilters} className="btn-secondary px-6 min-h-[44px] rounded-xl text-sm font-semibold">Clear filters</button>
                    )}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="card p-10 rounded-2xl text-center" data-testid="search-empty">
                  <h2 className="font-bold text-lg text-[var(--color-ink)] mb-2">No rooms match your search</h2>
                  <p className="text-sm text-[var(--color-ink-3)] mb-6 max-w-md mx-auto">Try removing some filters or searching a different area.</p>
                  <div className="space-y-4">
                    {filterCount > 0 && (
                      <button type="button" onClick={clearAllFilters} className="btn-primary px-6 min-h-[44px] rounded-xl text-sm font-semibold">Clear all filters</button>
                    )}
                    <div>
                      <p className="text-xs text-[var(--color-ink-3)] mb-2">Popular suburbs:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {["Kellyville", "Parramatta", "Blacktown", "Liverpool", "Chatswood", "Bankstown"].map((s) => (
                          <button key={s} type="button" onClick={() => setFilters({ ...DEFAULT_FILTERS, searchType: "suburb", suburb: s })}
                            className="px-3 min-h-[36px] rounded-full text-xs bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:bg-[var(--color-line-2)] transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <ul className={`grid gap-4 list-none p-0 m-0 ${showMap && mapState !== "unavailable" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}>
                    {results.map((listing) => {
                      const price = priceLabel(listing);
                      const title = listing.title || listing.display_address;
                      const isSaved = saved.has(listing.id);
                      return (
                        <li key={listing.id}>
                          <article
                            data-testid="listing-card"
                            onClick={(e) => {
                              if ((e.target as HTMLElement).closest("a,button")) return;
                              void router.push(`/listing/${listing.id}`);
                            }}
                            className="card rounded-2xl overflow-hidden group cursor-pointer h-full flex flex-col"
                          >
                            <div className="relative w-full aspect-[16/10] bg-[var(--color-surface-muted)] overflow-hidden">
                              {listing.images && listing.images.length > 0 ? (
                                <Image src={listing.images[0]} alt={`Photo of ${title}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-ink-3)]">No photo yet</div>
                              )}
                              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[var(--color-surface-2)]/95 backdrop-blur-sm border border-[var(--color-line)]/70">
                                <span className="text-[var(--color-ink)] font-semibold text-sm tabular-nums">${price.amount}</span>
                                <span className="text-[var(--color-ink-3)] text-xs">{price.unit}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); toggleSave(listing.id); }}
                                aria-pressed={isSaved}
                                aria-label={isSaved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
                                className="absolute top-2 left-2 w-11 h-11 rounded-full bg-[var(--color-surface-2)]/90 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-[var(--color-surface-2)]"
                              >
                                <svg className={`w-5 h-5 ${isSaved ? "text-[var(--color-coral-500)] fill-[var(--color-coral-500)]" : "text-[var(--color-ink-2)]"}`} fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                              {(listing.instant_book_enabled || listing.instant_book) && (
                                <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-[var(--color-accent)]/90 backdrop-blur-sm text-[color:var(--color-primary-fg)] text-xs font-semibold">Instant book</div>
                              )}
                            </div>

                            <div className="p-4 space-y-2 flex-1 flex flex-col">
                              <div>
                                <h2 className="font-bold text-[var(--color-ink)] text-sm truncate">{title}</h2>
                                <p className="text-xs text-[var(--color-ink-3)]">{listing.display_address}</p>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {listing.place_type && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-surface-muted)] text-[var(--color-ink-2)] capitalize">{listing.place_type}</span>}
                                {listing.furnished && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-primary-50)] text-[var(--color-primary)]">Furnished</span>}
                                {listing.bills_included && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">Bills incl.</span>}
                                <VerificationBadge verification={listing.host_verification} />
                                {listing.gender_preference === "female" && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">Female only</span>}
                                {listing.pets_allowed && <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--color-warn-50)] text-[var(--color-warn-600)]">Pets OK</span>}
                              </div>
                              {isBestMatch && typeof listing.match_score === "number" && (
                                <div className="pt-1 space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden" role="img" aria-label={`Match score ${listing.match_score} out of 100`}>
                                      <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${listing.match_score}%` }} />
                                    </div>
                                    <span className="text-[11px] font-semibold whitespace-nowrap text-[var(--color-ink-3)]">
                                      {listing.match_score >= 80 ? "Strong match" : listing.match_score >= 60 ? "Good match" : "Possible match"}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {listing.description && <p className="text-xs text-[var(--color-ink-2)] line-clamp-2">{listing.description}</p>}
                              {listing.nearest_transport && listing.station_distance_min != null && (
                                <p className="text-xs font-medium text-[var(--color-primary)]">{listing.station_distance_min} min to {listing.nearest_transport.split(" - ")[0]}</p>
                              )}
                              <div className="mt-auto pt-1">
                                <Link href={`/listing/${listing.id}`} className="btn-primary min-h-[40px] px-4 rounded-lg text-xs w-full text-center inline-flex items-center justify-center">
                                  View details<span className="sr-only"> for {title}</span>
                                </Link>
                              </div>
                            </div>
                          </article>
                        </li>
                      );
                    })}
                  </ul>

                  {loadMoreError && (
                    <p role="alert" className="text-center text-sm text-[var(--color-danger-500)] pt-4">We could not load more rooms. Your first results are still here.</p>
                  )}
                  {hasMore && (
                    <div className="text-center pt-6">
                      <button type="button" onClick={loadMore} disabled={loadingMore} className="btn-secondary px-8 min-h-[44px] rounded-xl text-sm font-semibold">
                        {loadingMore ? "Loading" : loadMoreError ? "Try again" : "Load more rooms"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            {showMap && mapState !== "unavailable" && (
              <div className="hidden xl:block xl:col-span-2">
                <div className="sticky top-24 space-y-4">
                  <div className="card rounded-2xl overflow-hidden aspect-[4/5]" data-testid="map-panel">
                    {mapState === "idle" ? (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-ink-3)]" aria-hidden="true">Map loads after results</div>
                    ) : (
                      <MapErrorBoundary key={mapKey} fallback={<MapUnavailablePanel reason="The map could not load. Results are listed to the left." onRetry={retryMap} />} onError={() => onMapUnavailable("init")}>
                        <ListingsMap listings={mapListings} isDark={theme === "dark"} stations={mapStations} onUnavailable={onMapUnavailable} />
                      </MapErrorBoundary>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-ink-3)] px-1">Circles show the approximate area of each room, not the exact address.</p>
                  {saved.size > 0 && (
                    <Link href="/seeker/wishlist" className="card p-4 rounded-2xl block">
                      <p className="text-sm font-bold text-[var(--color-ink)]">Wishlist</p>
                      <p className="text-xs text-[var(--color-ink-3)]">{saved.size} saved</p>
                    </Link>
                  )}
                </div>
              </div>
            )}
            {mapState === "unavailable" && showMap && (
              <div className="hidden xl:block xl:col-span-2">
                <div className="sticky top-24 card rounded-2xl overflow-hidden aspect-[4/5]" data-testid="map-panel">
                  <MapUnavailablePanel reason={mapReason} onRetry={isWebGLAvailable() ? retryMap : undefined} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
