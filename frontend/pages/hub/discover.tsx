import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BellPlus, List, Map as MapIcon, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import FilterSheet from "../../components/hub/discover/Filters";
import { HomeCard } from "../../components/hub/cards";
import { Button } from "../../components/hub/ui/Button";
import { CardSkeleton, EmptyState, ErrorState } from "../../components/hub/ui/Feedback";
import { Field, Input, Select } from "../../components/hub/ui/Field";
import { Dialog } from "../../components/hub/ui/Overlay";
import { useToast } from "../../components/ui/Toast";
import { useTheme } from "../../hooks/useTheme";
import { searchListingsPage, type PublicListing } from "../../lib/api";
import { hubApi, HubError } from "../../lib/hub/api";
import { invalidate } from "../../lib/hub/query";
import type { ListingCard } from "../../lib/hub/types";
import { cn } from "../../lib/cn";
import { activeFilterCount, filtersToApiParams, parseSearchQuery, serializeSearchFilters, type SearchFilters, type SortBy } from "../../lib/search/searchQuery";
import type { Bounds, MapHome } from "../../components/hub/discover/HubMap";

const HubMap = dynamic(() => import("../../components/hub/discover/HubMap"), { ssr: false, loading: () => <div className="hub-skeleton h-full w-full" /> });

const PAGE = 24;

/** Public search results in the Hub's card shape (same listing data). */
function toCard(l: PublicListing): ListingCard {
  return {
    id: l.id,
    title: l.title || `${l.property_type || "Home"} in ${l.suburb || l.city || ""}`.trim(),
    suburb: l.suburb ?? null,
    city: l.city ?? null,
    postcode: l.postcode ?? null,
    state: null,
    timezone: "Australia/Sydney",
    display_address: l.display_address,
    weekly_price: l.weekly_price ?? (l.daily_price ? l.daily_price * 7 : null),
    image: l.images?.[0] ?? null,
    images: l.images ?? [],
    property_type: l.property_type ?? null,
    place_type: l.place_type === "private" ? "private_room" : l.place_type === "entire" ? "entire_place" : l.place_type ?? null,
    bedrooms: l.bedrooms ?? null,
    bathrooms: l.bathrooms ?? null,
    parking: l.parking ?? null,
    furnished: l.furnished ?? null,
    bills_included: l.bills_included ?? null,
    pets_allowed: l.pets_allowed ?? null,
    available_from: l.available_from ?? null,
    available_to: l.available_to ?? null,
    public_state: l.public_state,
    unit_label: null,
    listing_purpose: "long_term",
    nearest_transport: l.nearest_transport ?? null,
  };
}

function searchName(f: SearchFilters) {
  const place = f.suburb || f.postcode || (f.searchType === "nearMe" ? "Map area" : "Anywhere");
  const bits = [place];
  if (f.maxPrice) bits.push(`under $${f.maxPrice}`);
  if (f.placeType === "private_room") bits.push("rooms");
  if (f.placeType === "entire_place") bits.push("whole places");
  return bits.join(", ");
}

function savedSearchParams(f: SearchFilters) {
  const p: Record<string, string | number | boolean> = {};
  if (f.suburb) p.suburb = f.suburb;
  if (f.postcode) p.postcode = f.postcode;
  if (f.minPrice) p.min_price = Number(f.minPrice);
  if (f.maxPrice) p.max_price = Number(f.maxPrice);
  if (f.propertyType) p.property_type = f.propertyType;
  if (f.placeType) p.place_type = f.placeType;
  if (f.furnished) p.furnished = true;
  if (f.billsIncluded) p.bills_included = true;
  if (f.petsAllowed) p.pets_allowed = true;
  if (f.parking) p.parking = true;
  if (f.checkIn) p.available_from = f.checkIn;
  if (f.leaseType) p.listing_purpose = f.leaseType;
  if (f.newcomer) p.newcomer_friendly = true;
  return p;
}

export default function Discover() {
  const router = useRouter();
  const toast = useToast();
  const reduce = useReducedMotion();
  const { theme, mounted } = useTheme();
  const filters = useMemo(() => {
    const f = parseSearchQuery(router.query as Record<string, string>);
    // "Search homes for ..." from the command palette arrives as ?q=.
    const q = typeof router.query.q === "string" ? router.query.q.trim() : "";
    if (q && !f.suburb && !f.postcode) return /^\d{4}$/.test(q) ? { ...f, searchType: "postcode" as const, postcode: q } : { ...f, searchType: "suburb" as const, suburb: q.slice(0, 80) };
    return f;
  }, [router.query]);
  const [query, setQuery] = useState("");
  const [homes, setHomes] = useState<ListingCard[]>([]);
  const [locations, setLocations] = useState<Record<string, { lat: number; lng: number }>>({});
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<{ message: string; offline: boolean } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapMoved, setMapMoved] = useState<Bounds | null>(null);
  const [mapOk, setMapOk] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveAlert, setSaveAlert] = useState("daily");
  const [saving, setSaving] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  // "Get an alert" on the public search links here with ?save=1 and that
  // search's filters: open the save dialog straight away, once.
  const offeredSave = useRef(false);
  useEffect(() => {
    if (!router.isReady || offeredSave.current || router.query.save !== "1") return;
    offeredSave.current = true;
    setSaveName(searchName(filters));
    setSaveOpen(true);
  }, [router.isReady, router.query.save, filters]);

  useEffect(() => {
    if (!router.isReady) return;
    setQuery(filters.suburb || filters.postcode || (typeof router.query.q === "string" ? router.query.q : ""));
  }, [router.isReady, filters.suburb, filters.postcode, router.query.q]);

  const apply = useCallback(
    (next: SearchFilters) => {
      const qs = serializeSearchFilters({ ...next, page: 1 }).toString();
      void router.replace({ pathname: router.pathname, query: Object.fromEntries(new URLSearchParams(qs)) }, `${router.asPath.split("?")[0]}${qs ? `?${qs}` : ""}`, { shallow: true, scroll: false });
    },
    [router],
  );

  const load = useCallback(
    async (offset: number) => {
      const id = ++requestId.current;
      const params = filtersToApiParams(filters, offset, PAGE);
      if (router.query.radius && filters.searchType === "nearMe") params.radius = String(router.query.radius);
      const page = await searchListingsPage(params).catch(() => null);
      if (id !== requestId.current) return;
      if (!page || !page.ok) {
        const offline = page?.error === "network";
        setError({ message: page?.error === "bad-request" ? page.errorMessage || "Those filters could not be used. Clear them and try again." : offline ? "We could not reach Migrent just now." : "Search is not responding. Please try again.", offline });
        setStatus("error");
        return;
      }
      const cards = page.listings.map(toCard);
      setLocations((prev) => {
        const next = offset ? { ...prev } : {};
        for (const l of page.listings) if (l.location) next[l.id] = { lat: l.location.approx_lat, lng: l.location.approx_lng };
        return next;
      });
      setHomes((prev) => (offset ? [...prev, ...cards] : cards));
      setTotal(page.total);
      setHasMore(page.hasMore);
      setStatus("ready");
      setError(null);
    },
    [filters, router.query.radius],
  );

  useEffect(() => {
    if (!router.isReady) return;
    setStatus("loading");
    setMapMoved(null);
    void load(0);
  }, [router.isReady, load]);

  const mapHomes: MapHome[] = useMemo(() => homes.filter((h) => locations[h.id]).map((h) => ({ id: h.id, lat: locations[h.id].lat, lng: locations[h.id].lng, price: h.weekly_price })), [homes, locations]);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const v = query.trim();
    const isPostcode = /^\d{4}$/.test(v);
    apply({ ...filters, searchType: isPostcode ? "postcode" : "suburb", suburb: isPostcode ? "" : v, postcode: isPostcode ? v : "", lat: null, lng: null });
  };

  const selectFromMap = (id: string) => {
    setActiveId(id);
    const el = listRef.current?.querySelector(`[data-home="${id}"]`);
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  const count = activeFilterCount(filters);
  const fitKey = `${filters.suburb}|${filters.postcode}|${filters.searchType}|${filters.maxPrice}|${filters.minPrice}|${filters.placeType}`;
  const dark = mounted && theme === "dark";

  const saveSearch = async () => {
    setSaving(true);
    try {
      await hubApi.post("/hub/searches", { name: saveName.trim() || searchName(filters), params: savedSearchParams(filters), alert: saveAlert });
      invalidate("/hub/searches");
      setSaveOpen(false);
      toast.success("Search saved", { description: saveAlert === "off" ? "Find it under Saved." : "We'll tell you when new homes match." });
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "The search did not save.");
    } finally {
      setSaving(false);
    }
  };

  const results = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14.5px] text-[color:var(--color-ink-2)]" aria-live="polite">
          {status === "loading" ? "Searching..." : status === "ready" ? (total === null ? `${homes.length} homes` : `${total} home${total === 1 ? "" : "s"}`) : ""}
          {status === "ready" && (filters.suburb || filters.postcode) ? ` in ${filters.suburb || filters.postcode}` : ""}
        </p>
        <label className="flex items-center gap-2 text-[13.5px] text-[color:var(--color-ink-3)]">
          <span className="sr-only sm:not-sr-only">Sort</span>
          <Select value={filters.sortBy} onChange={(e) => apply({ ...filters, sortBy: e.target.value as SortBy })} className="h-9 w-auto rounded-[10px] pr-9 text-[13.5px]">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </Select>
        </label>
      </div>
      {status === "loading" ? (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2" role="status" aria-busy="true">
          <span className="sr-only">Loading homes</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : status === "error" && error ? (
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void load(0)} />
      ) : homes.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" strokeWidth={1.75} />}
          title="No homes match that yet"
          body="Try a nearby suburb or loosen a filter. Or save this search and we'll tell you when something is listed."
          action={count > 0 ? <Button variant="secondary" onClick={() => apply({ ...filters, minPrice: "", maxPrice: "", placeType: "", propertyType: "", furnished: false, billsIncluded: false, petsAllowed: false, parking: false, airCon: false, couplesOk: false, verifiedOwner: false, nearStation: false, checkIn: "" })}>Clear filters</Button> : undefined}
          secondary={<Button icon={<BellPlus className="h-4 w-4" strokeWidth={1.9} />} onClick={() => { setSaveName(searchName(filters)); setSaveOpen(true); }}>Save this search</Button>}
        />
      ) : (
        <>
          <div ref={listRef} className="grid gap-x-5 gap-y-9 sm:grid-cols-2">
            {homes.map((h, i) => (
              <div key={h.id} data-home={h.id}>
                <HomeCard listing={h} priority={i < 2} onHover={setActiveId} active={activeId === h.id} />
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                loading={loadingMore}
                onClick={async () => {
                  setLoadingMore(true);
                  await load(homes.length);
                  setLoadingMore(false);
                }}
              >
                Show more homes
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const map = mapOk ? (
    <div className="relative h-full w-full overflow-hidden rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface-muted)]">
      <HubMap homes={mapHomes} activeId={activeId} dark={dark} onHover={setActiveId} onSelect={selectFromMap} onMoved={(b) => setMapMoved(b)} onUnavailable={() => setMapOk(false)} fitKey={fitKey} />
      <AnimatePresence>
        {mapMoved && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute left-1/2 top-4 -translate-x-1/2">
            <Button
              size="sm"
              icon={<RefreshCw className="h-4 w-4" strokeWidth={1.9} />}
              className="rounded-full shadow-[var(--shadow-pop)]"
              onClick={() => {
                const b = mapMoved;
                setMapMoved(null);
                const qs = serializeSearchFilters({ ...filters, searchType: "nearMe", lat: b.lat, lng: b.lng, suburb: "", postcode: "", page: 1 });
                qs.set("radius", String(Math.round(b.radiusKm)));
                void router.replace({ pathname: router.pathname, query: Object.fromEntries(qs) }, `${router.asPath.split("?")[0]}?${qs.toString()}`, { shallow: true, scroll: false });
              }}
            >
              Search this area
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="pointer-events-none absolute bottom-2 left-3 rounded-full bg-[var(--color-glass)] px-2.5 py-1 text-[11.5px] font-medium text-[color:var(--color-ink-2)] backdrop-blur">Locations are approximate until you book an inspection</p>
    </div>
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-[var(--color-line-2)] p-6 text-center">
      <MapIcon className="h-6 w-6 text-[color:var(--color-ink-4)]" strokeWidth={1.75} aria-hidden />
      <p className="text-[14px] text-[color:var(--color-ink-2)]">The map isn't available on this device. The list has every home.</p>
    </div>
  );

  return (
    <HubShell title="Discover" fullBleed>
      <div className="flex flex-col">
        {/* Search and filter bar */}
        <div className="sticky top-14 z-20 border-b border-[var(--color-glass-line)] bg-[var(--color-glass)] px-4 py-3 backdrop-blur-xl sm:px-6 lg:top-0 lg:pr-8 lg:pt-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <form onSubmit={onSubmitSearch} className="relative min-w-[220px] flex-1 sm:max-w-[420px]" role="search">
              <label htmlFor="hub-discover-q" className="sr-only">
                Suburb or postcode
              </label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-ink-3)]" strokeWidth={1.9} aria-hidden />
              <input
                id="hub-discover-q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suburb or postcode"
                enterKeyHint="search"
                className="h-11 w-full rounded-full border border-[var(--color-line-2)] bg-[var(--color-surface)] pl-10 pr-10 text-[15px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] focus:border-[var(--color-primary)] focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_22%,transparent)]"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    apply({ ...filters, suburb: "", postcode: "", searchType: "suburb", lat: null, lng: null });
                  }}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--color-ink-3)] hover:bg-[var(--color-surface-hover)]"
                >
                  <X className="h-4 w-4" strokeWidth={1.9} />
                </button>
              )}
            </form>
            <Button variant="secondary" size="md" className="rounded-full" icon={<SlidersHorizontal className="h-4 w-4" strokeWidth={1.9} />} onClick={() => setFiltersOpen(true)}>
              Filters
              {count > 0 && <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[11px] font-bold text-[color:var(--color-primary-fg)]">{count}</span>}
            </Button>
            <Button
              variant="ghost"
              className="rounded-full"
              icon={<BellPlus className="h-4 w-4" strokeWidth={1.9} />}
              onClick={() => {
                setSaveName(searchName(filters));
                setSaveOpen(true);
              }}
            >
              <span className="hidden sm:inline">Save search</span>
              <span className="sm:hidden">Save</span>
            </Button>
          </div>
        </div>

        {/* Desktop: list + sticky map. Phones: one or the other. */}
        <div className="px-4 pt-5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,44%)] lg:gap-6 lg:pr-8">
          <div className={cn(view === "map" && "hidden lg:block")}>{results}</div>
          <div className={cn("lg:sticky lg:top-[92px] lg:block lg:h-[calc(100dvh-116px)]", view === "map" ? "block h-[calc(100dvh-200px)]" : "hidden")}>{map}</div>
        </div>

        {/* Phone list/map switch */}
        <div className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 lg:hidden">
          <Button className="rounded-full px-5 shadow-[var(--shadow-pop)]" icon={view === "list" ? <MapIcon className="h-4 w-4" strokeWidth={1.9} /> : <List className="h-4 w-4" strokeWidth={1.9} />} onClick={() => setView(view === "list" ? "map" : "list")}>
            {view === "list" ? "Map" : "List"}
          </Button>
        </div>
      </div>

      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} value={filters} onApply={apply} />

      <Dialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Save this search"
        description="Come back to it in one tap, and hear about new homes that match."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void saveSearch()}>
              Save search
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 pb-2">
          <Field label="Name">
            {({ id }) => <Input id={id} value={saveName} onChange={(e) => setSaveName(e.target.value)} maxLength={80} data-autofocus />}
          </Field>
          <Field label="Tell me about new homes">
            {({ id }) => (
              <Select id={id} value={saveAlert} onChange={(e) => setSaveAlert(e.target.value)}>
                <option value="instant">As soon as they're listed</option>
                <option value="daily">Once a day</option>
                <option value="weekly">Once a week</option>
                <option value="off">Don't notify me</option>
              </Select>
            )}
          </Field>
        </div>
      </Dialog>
    </HubShell>
  );
}
