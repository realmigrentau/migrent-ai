import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { isWebGLAvailable } from "../lib/webgl";
import { reportMapFailure } from "./MapErrorBoundary";

/**
 * The search-results map.
 *
 * Public listings never carry an exact pin. Each result has an approximate
 * point (see backend/public_dto.py) and is drawn as a soft circle covering
 * roughly the block it is in, so the map is useful for "which part of the
 * suburb" without letting anyone walk up to a stranger's door.
 *
 * Failure modes handled here rather than by crashing the page:
 *  - no WebGL: `onUnavailable("webgl")` before any MapLibre code runs
 *  - MapLibre throws during construction: caught, reported, `onUnavailable`
 *  - style/tile errors after load: reported once, map stays but is inert
 *  - unmount mid-load: listeners removed, instance destroyed
 */

export interface MapListing {
  id: string;
  title?: string;
  displayAddress: string;
  suburb: string;
  weeklyPrice?: number;
  dailyPrice?: number;
  approxLat: number | null;
  approxLng: number | null;
  radiusM?: number;
}

export interface StationPin {
  name: string;
  lat: number;
  lng: number;
  line?: string;
}

interface ListingsMapProps {
  listings: MapListing[];
  isDark: boolean;
  stations?: StationPin[];
  onUnavailable?: (reason: "webgl" | "init" | "style" | "config") => void;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";

function getStyleUrl(dark: boolean) {
  const style = dark ? "streets-v2-dark" : "streets-v2";
  return `https://api.maptiler.com/maps/${style}/style.json?key=${MAPTILER_KEY}`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] as string);
}

const DEFAULT_CENTER: [number, number] = [151.206, -33.892];

export default function ListingsMap({ listings, isDark, stations = [], onUnavailable }: ListingsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const stationMarkersRef = useRef<maplibregl.Marker[]>([]);
  const readyRef = useRef(false);
  const failedRef = useRef(false);
  const [ready, setReady] = useState(false);

  const fail = (reason: "webgl" | "init" | "style" | "config", error?: unknown) => {
    if (failedRef.current) return;
    failedRef.current = true;
    if (error) reportMapFailure(error);
    onUnavailable?.(reason);
  };

  const renderListingAreas = (items: MapListing[]) => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const points: [number, number][] = [];
    items.forEach((listing) => {
      if (listing.approxLat == null || listing.approxLng == null) return;
      const el = document.createElement("div");
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", `Approximate area for ${listing.title || listing.displayAddress}`);
      el.innerHTML =
        '<div style="width:44px;height:44px;border-radius:50%;background:rgba(29,100,117,0.22);border:2px solid rgba(29,100,117,0.8);box-shadow:0 0 0 6px rgba(29,100,117,0.08);cursor:pointer;transition:transform .15s"></div>';
      const inner = el.firstElementChild as HTMLElement;
      el.addEventListener("mouseenter", () => { inner.style.transform = "scale(1.12)"; });
      el.addEventListener("mouseleave", () => { inner.style.transform = "scale(1)"; });

      const price = listing.dailyPrice && !listing.weeklyPrice
        ? `AUD $${listing.dailyPrice}/day`
        : `AUD $${listing.weeklyPrice ?? ""}/wk`;
      const popup = new maplibregl.Popup({ offset: 24, closeButton: true }).setHTML(
        `<div style="padding:4px;min-width:150px;font-family:Inter,system-ui,sans-serif">
          <p style="font-weight:700;font-size:13px;color:#0f172a;margin:0">${escapeHtml(listing.title || listing.displayAddress)}</p>
          <p style="font-size:11px;color:#64748b;margin:2px 0 0">${escapeHtml(listing.suburb)} · approximate area</p>
          <p style="font-weight:700;font-size:13px;color:#1d6475;margin:6px 0 0">${escapeHtml(price)}</p>
          <a href="/listing/${encodeURIComponent(listing.id)}" style="font-size:11px;color:#1d6475;text-decoration:underline;margin-top:4px;display:inline-block">View details</a>
        </div>`
      );
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([listing.approxLng, listing.approxLat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
      points.push([listing.approxLng, listing.approxLat]);
    });

    if (points.length > 0) {
      try {
        const bounds = points.reduce(
          (b, p) => b.extend(p),
          new maplibregl.LngLatBounds(points[0], points[0])
        );
        map.fitBounds(bounds, { padding: 56, maxZoom: 14, duration: 0 });
      } catch {
        /* bounds are cosmetic */
      }
    }
  };

  const renderStations = (items: StationPin[]) => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];
    items.forEach((station) => {
      const el = document.createElement("div");
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", `${station.name} station`);
      el.innerHTML =
        '<div style="width:22px;height:22px;border-radius:6px;background:#3b82f6;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.25)"></div>';
      const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(
        `<div style="padding:4px;font-family:Inter,system-ui,sans-serif"><p style="font-weight:700;font-size:12px;color:#3b82f6;margin:0">${escapeHtml(station.name)} Station</p>${station.line ? `<p style="font-size:10px;color:#64748b;margin:2px 0 0">${escapeHtml(station.line)}</p>` : ""}</div>`
      );
      const marker = new maplibregl.Marker({ element: el }).setLngLat([station.lng, station.lat]).setPopup(popup).addTo(map);
      stationMarkersRef.current.push(marker);
    });
  };

  // Create (and on theme change, recreate) the map.
  useEffect(() => {
    if (!containerRef.current) return;
    if (!MAPTILER_KEY) {
      fail("config");
      return;
    }
    if (!isWebGLAvailable()) {
      fail("webgl");
      return;
    }

    const previous = mapRef.current;
    const center = previous?.getCenter();
    const zoom = previous?.getZoom();

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];
    previous?.remove();
    mapRef.current = null;
    readyRef.current = false;
    setReady(false);

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: getStyleUrl(isDark),
        center: center ? [center.lng, center.lat] : DEFAULT_CENTER,
        zoom: zoom ?? 12,
        attributionControl: { compact: true },
      });
    } catch (error) {
      fail("init", error);
      return;
    }

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const onLoad = () => {
      readyRef.current = true;
      setReady(true);
    };
    const onError = (e: { error?: unknown }) => {
      // A failed style or tile is not fatal, but say so once.
      if (!readyRef.current) fail("style", e?.error);
      else reportMapFailure(e?.error ?? new Error("map error after load"));
    };
    map.on("load", onLoad);
    map.on("error", onError);
    mapRef.current = map;

    return () => {
      map.off("load", onLoad);
      map.off("error", onError);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      stationMarkersRef.current.forEach((m) => m.remove());
      stationMarkersRef.current = [];
      readyRef.current = false;
      try {
        map.remove();
      } catch {
        /* already gone */
      }
      if (mapRef.current === map) mapRef.current = null;
    };
    // `fail` is stable enough for this effect; re-running on theme is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  useEffect(() => {
    if (ready) renderListingAreas(listings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, ready]);

  useEffect(() => {
    if (ready) renderStations(stations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stations, ready]);

  return (
    <div
      ref={containerRef}
      data-testid="listings-map"
      style={{ width: "100%", height: "100%" }}
      role="region"
      aria-label="Map of approximate listing locations"
    />
  );
}
