import { useCallback, useEffect, useId, useRef, useState } from "react";
import SuburbCard from "./SuburbCard";
import type { RegionCard, RegionApiResponse } from "../../pages/api/suburbs/region";
import type { Region } from "../../lib/suburbs/types";

/**
 * One city or region section.
 *
 * The behaviour the directory needs, and why:
 *
 *  - Collapsed sections render no cards at all. With 116 regions and 15,334
 *    suburbs, rendering even the previews for every collapsed city would put
 *    ~700 cards in the initial HTML for no one's benefit.
 *  - Expanding fetches six. "View all" pages through the rest, 24 at a time.
 *    Sydney is 923 suburbs and Regional and remote NSW is 2,898; neither is
 *    ever rendered in one go.
 *  - The trigger is a real <button> with aria-expanded and aria-controls, and
 *    it lives inside the heading, so the section is reachable and operable
 *    from the keyboard and walkable with a screen reader's heading shortcut.
 *
 * `initialPlaces` lets the page hand Sydney its six previews from the server,
 * so the one section that is open on arrival needs no round trip.
 */

const PREVIEW = 6;
const PAGE = 24;

export default function CityAccordion({
  region,
  open,
  onToggle,
  initialPlaces,
  sort,
}: {
  region: Region;
  open: boolean;
  onToggle: () => void;
  initialPlaces?: RegionCard[];
  sort: "name" | "population" | "overseas";
}) {
  const id = useId();
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

  const [places, setPlaces] = useState<RegionCard[]>(initialPlaces ?? []);
  const [total, setTotal] = useState<number>(region.placeCount);
  const [expandedAll, setExpandedAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  // Which sort the rows we are holding were fetched with, so changing the
  // sort refetches instead of silently showing stale order.
  const loadedSort = useRef<string | null>(initialPlaces?.length ? sort : null);

  const fetchPage = useCallback(
    async (offset: number, limit: number, replace: boolean) => {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({
          id: region.id,
          offset: String(offset),
          limit: String(limit),
          sort,
        });
        const res = await fetch(`/api/suburbs/region?${params}`);
        if (!res.ok) throw new Error(String(res.status));
        const data: RegionApiResponse = await res.json();
        setTotal(data.total);
        setPlaces((prev) => (replace ? data.places : [...prev, ...data.places]));
        loadedSort.current = sort;
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [region.id, sort],
  );

  // Load the previews the first time the section opens, and reload if the
  // sort changed while it was shut.
  useEffect(() => {
    if (!open) return;
    if (loadedSort.current === sort && places.length > 0) return;
    setExpandedAll(false);
    void fetchPage(0, PREVIEW, true);
    // places.length is deliberately not a dependency: this should fire when
    // the section opens or the sort changes, not every time rows arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sort, fetchPage]);

  const viewAll = () => {
    setExpandedAll(true);
    void fetchPage(places.length, PAGE, false);
  };

  const showFewer = () => {
    setExpandedAll(false);
    setPlaces((prev) => prev.slice(0, PREVIEW));
  };

  const remaining = total - places.length;

  return (
    <section className="sub-accordion" data-open={open ? "true" : "false"}>
      <h3 className="sub-accordion__heading">
        <button
          type="button"
          id={buttonId}
          className="sub-accordion__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={`sub-accordion__dot sub-accordion__dot--${region.kind}`} aria-hidden="true" />
          <span className="sub-accordion__title">{region.name}</span>
          <span className="sub-accordion__count">
            {region.placeCount.toLocaleString()} {region.placeCount === 1 ? "suburb" : "suburbs"}
          </span>
          <span className="sub-accordion__chevron" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </h3>

      {/* Removed from the DOM when shut: this is the whole point of the
          accordion on a page with 15,334 possible cards. */}
      {open && (
        <div className="sub-accordion__panel" id={panelId} role="region" aria-labelledby={buttonId}>
          {region.note && <p className="sub-accordion__note">{region.note}</p>}

          {error ? (
            <p className="sub-accordion__error">
              Could not load suburbs for {region.name}.{" "}
              <button type="button" className="sub-link" onClick={() => void fetchPage(0, PREVIEW, true)}>
                Try again
              </button>
            </p>
          ) : places.length === 0 && loading ? (
            <ul className="sub-grid" aria-hidden="true">
              {Array.from({ length: PREVIEW }).map((_, i) => (
                <li key={i} className="sub-card sub-card--skeleton" />
              ))}
            </ul>
          ) : (
            <>
              <ul className="sub-grid">
                {places.map((p) => (
                  <SuburbCard key={p.salCode} place={p} />
                ))}
              </ul>

              <p className="sr-only" role="status" aria-live="polite">
                Showing {places.length} of {total} suburbs in {region.name}
              </p>

              <div className="sub-accordion__actions">
                {remaining > 0 && (
                  <button type="button" className="sub-btn" onClick={viewAll} disabled={loading}>
                    {loading
                      ? "Loading..."
                      : expandedAll
                        ? `Load ${Math.min(remaining, PAGE).toLocaleString()} more`
                        : `View all ${total.toLocaleString()} suburbs`}
                  </button>
                )}
                {places.length > PREVIEW && (
                  <button type="button" className="sub-btn sub-btn--quiet" onClick={showFewer}>
                    Show fewer
                  </button>
                )}
                <span className="sub-accordion__progress">
                  Showing {places.length.toLocaleString()} of {total.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
