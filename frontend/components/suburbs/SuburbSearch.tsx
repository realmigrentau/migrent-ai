import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/router";
import type { SearchApiResponse, SearchApiResult } from "../../pages/api/suburbs/search";

/**
 * National suburb search.
 *
 * A real ARIA 1.2 combobox: the input owns the role, the popup is a listbox,
 * and the highlighted option is pointed at with aria-activedescendant rather
 * than by moving focus. That matters here because the field has to stay
 * focused while the arrow keys walk 15,334 possible suburbs.
 *
 * Matching happens on the server (/api/suburbs/search). The index is a
 * megabyte and this page is meant to open quickly on a phone, so the browser
 * gets a text field and nothing else.
 *
 * Without JavaScript the surrounding form still submits to /suburbs?q=, which
 * renders the same results server-side.
 */

const DEBOUNCE_MS = 160;
const MIN_QUERY = 2;

export default function SuburbSearch({
  initialQuery = "",
  stateFilter = null,
  onQueryChange,
  autoFocus = false,
}: {
  initialQuery?: string;
  stateFilter?: string | null;
  /** Lets the page mirror the query into the URL so a search can be shared. */
  onQueryChange?: (query: string) => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const listboxId = `${id}-listbox`;
  const statusId = `${id}-status`;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchApiResult[]>([]);
  const [regions, setRegions] = useState<SearchApiResponse["regions"]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // A search in the URL (a shared link, the Back button) has to show up in the
  // field - but the page also writes what is typed here back into the URL a
  // beat later, and adopting that echo would yank the caret back to an older
  // value mid-word. So the last value this component emitted is remembered,
  // and an incoming value equal to it is ignored.
  const lastEmitted = useRef(initialQuery);
  useEffect(() => {
    if (initialQuery === lastEmitted.current) return;
    lastEmitted.current = initialQuery;
    setQuery(initialQuery);
  }, [initialQuery]);

  const emit = useCallback(
    (next: string) => {
      lastEmitted.current = next;
      setQuery(next);
      onQueryChange?.(next);
    },
    [onQueryChange],
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY) {
      abortRef.current?.abort();
      setResults([]);
      setRegions([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const params = new URLSearchParams({ q: trimmed });
        if (stateFilter) params.set("state", stateFilter);
        const res = await fetch(`/api/suburbs/search?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data: SearchApiResponse = await res.json();
        setResults(data.results);
        setRegions(data.regions);
        setActive(-1);
        setOpen(true);
        setSearched(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
          setRegions([]);
          setSearched(true);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, stateFilter]);

  // Clicking away closes the popup but keeps whatever was typed.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const options = [
    ...regions.map((r) => ({ kind: "region" as const, key: `r-${r.id}`, href: `/suburbs?region=${r.id}`, region: r })),
    ...results.map((r) => ({ kind: "place" as const, key: r.salCode, href: r.href, place: r })),
  ];

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (open) { setOpen(false); return; }
      if (query) emit("");
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!options.length) return;
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((prev) => {
        const next = prev + step;
        if (next < 0) return options.length - 1;
        if (next >= options.length) return 0;
        return next;
      });
      return;
    }
    if (e.key === "Home" && open && options.length) { e.preventDefault(); setActive(0); return; }
    if (e.key === "End" && open && options.length) { e.preventDefault(); setActive(options.length - 1); return; }
    if (e.key === "Enter") {
      if (open && active >= 0 && options[active]) {
        e.preventDefault();
        go(options[active].href);
      }
      // Otherwise the form submits to /suburbs?q=, which is the server-rendered
      // results page. That is the right answer for "I typed and pressed Enter".
    }
  };

  const showEmpty = searched && !loading && options.length === 0 && query.trim().length >= MIN_QUERY;

  return (
    <div className="sub-search" ref={rootRef}>
      <form
        action="/suburbs"
        method="get"
        role="search"
        onSubmit={(e) => {
          if (active >= 0 && options[active]) { e.preventDefault(); go(options[active].href); }
        }}
      >
        <label htmlFor={id} className="sr-only">
          Search every Australian suburb and locality by name, city, state or postcode
        </label>
        <div className="sub-search__field">
          <span className="sub-search__icon" aria-hidden="true">
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            id={id}
            name="q"
            type="text"
            role="combobox"
            className="sub-search__input"
            placeholder="Try Kellyville, Richmond VIC, Newcastle or 2150"
            value={query}
            autoComplete="off"
            autoFocus={autoFocus}
            aria-expanded={open && options.length > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-describedby={statusId}
            aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
            onChange={(e) => emit(e.target.value)}
            onFocus={() => { if (options.length) setOpen(true); }}
            onKeyDown={onKeyDown}
          />
          {query && (
            <button
              type="button"
              className="sub-search__clear"
              onClick={() => {
                emit("");
                setOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Politely announced, so a screen reader hears the count change. */}
      <p id={statusId} className="sr-only" role="status" aria-live="polite">
        {loading
          ? "Searching"
          : searched
            ? `${options.length} ${options.length === 1 ? "result" : "results"} for ${query}`
            : "Type at least two characters to search"}
      </p>

      {open && options.length > 0 && (
        <ul className="sub-search__list" id={listboxId} role="listbox" aria-label="Suburb search results">
          {options.map((opt, i) => (
            <li
              key={opt.key}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={`sub-search__opt${i === active ? " is-active" : ""}`}
              onPointerDown={(e) => { e.preventDefault(); go(opt.href); }}
              onMouseEnter={() => setActive(i)}
            >
              {opt.kind === "region" ? (
                <>
                  <span className="sub-search__opt-name">
                    <span className="sub-search__opt-kind">City or region</span>
                    {opt.region.name}
                  </span>
                  <span className="sub-search__opt-meta">
                    {opt.region.state} · {opt.region.placeCount.toLocaleString()} suburbs
                  </span>
                </>
              ) : (
                <>
                  <span className="sub-search__opt-name">{opt.place.label}</span>
                  <span className="sub-search__opt-meta">
                    {opt.place.regionName}
                    {opt.place.postcode ? ` · ${opt.place.postcode}` : ""}
                    {opt.place.population > 0 ? ` · pop. ${opt.place.population.toLocaleString()}` : ""}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {showEmpty && (
        <div className="sub-search__empty">
          <p>
            Nothing matched <strong>{query}</strong>.
          </p>
          <p className="sub-search__empty-hint">
            Try the suburb name on its own, add the state (Richmond VIC), or search a postcode.
          </p>
        </div>
      )}
    </div>
  );
}
