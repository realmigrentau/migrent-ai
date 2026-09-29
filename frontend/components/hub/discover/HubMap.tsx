import { useEffect, useRef, useState } from "react";
// MapLibre 6 has named exports only.
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { isWebGLAvailable } from "../../../lib/webgl";
import { reportMapFailure } from "../../MapErrorBoundary";

/**
 * The Discover map. Every home is placed at its approximate point (the
 * public data contract never carries an exact pin), clustered when zoomed
 * out, and drawn as a price pill when there is room.
 *
 * The list and the map stay in step: hovering a card lights up its pill,
 * hovering or tapping a pill tells the page, and panning offers "Search
 * this area" instead of reloading results under the person's cursor.
 */

export interface MapHome {
  id: string;
  lat: number;
  lng: number;
  price: number | null;
}

export interface Bounds {
  lat: number;
  lng: number;
  radiusKm: number;
}

interface Props {
  homes: MapHome[];
  activeId: string | null;
  dark: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onMoved: (b: Bounds) => void;
  onUnavailable: () => void;
  fitKey: string;
}

const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";
const style = (dark: boolean) => `https://api.maptiler.com/maps/${dark ? "streets-v2-dark" : "streets-v2"}/style.json?key=${KEY}`;

function priceLabel(p: number | null) {
  if (p === null || p === undefined) return "-";
  return `$${Math.round(p)}`;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export default function HubMap({ homes, activeId, dark, onHover, onSelect, onMoved, onUnavailable, fitKey }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef(new Map<string, { marker: maplibregl.Marker; el: HTMLButtonElement }>());
  const homesRef = useRef(homes);
  const cb = useRef({ onHover, onSelect, onMoved });
  const [ready, setReady] = useState(false);
  const userMoved = useRef(false);
  cb.current = { onHover, onSelect, onMoved };
  homesRef.current = homes;

  // Create the map once (and again if the theme changes the style).
  useEffect(() => {
    if (!container.current) return;
    if (!KEY || !isWebGLAvailable()) {
      onUnavailable();
      return;
    }
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({
        container: container.current,
        style: style(dark),
        center: [151.0, -33.8],
        zoom: 10,
        attributionControl: { compact: true },
        cooperativeGestures: false,
      });
    } catch (e) {
      reportMapFailure(e);
      onUnavailable();
      return;
    }
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.on("error", (e) => reportMapFailure(e.error));
    m.on("load", () => {
      m.addSource("homes", { type: "geojson", data: { type: "FeatureCollection", features: [] }, cluster: true, clusterRadius: 44, clusterMaxZoom: 13 });
      m.addLayer({
        id: "clusters",
        type: "circle",
        source: "homes",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": dark ? "#6b8cff" : "#365df3",
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 22, 30, 28],
          "circle-stroke-width": 3,
          "circle-stroke-color": dark ? "#0f131a" : "#ffffff",
        },
      });
      m.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "homes",
        filter: ["has", "point_count"],
        layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 13, "text-font": ["Noto Sans Bold"] },
        paint: { "text-color": dark ? "#0b1020" : "#ffffff" },
      });
      m.on("click", "clusters", async (e) => {
        const f = m.queryRenderedFeatures(e.point, { layers: ["clusters"] })[0];
        const source = m.getSource("homes") as maplibregl.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(f.properties?.cluster_id);
        m.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
      });
      m.on("mouseenter", "clusters", () => (m.getCanvas().style.cursor = "pointer"));
      m.on("mouseleave", "clusters", () => (m.getCanvas().style.cursor = ""));
      setReady(true);
    });
    const syncMarkers = () => {
      if (!m.getSource("homes")) return;
      const visible = new Set<string>();
      for (const f of m.querySourceFeatures("homes", { filter: ["!", ["has", "point_count"]] })) {
        const id = String(f.properties?.id);
        if (visible.has(id)) continue;
        visible.add(id);
        if (!markers.current.has(id)) {
          const home = homesRef.current.find((h) => h.id === id);
          if (!home) continue;
          const el = document.createElement("button");
          el.type = "button";
          el.className = "hub-price-marker";
          el.textContent = priceLabel(home.price);
          el.setAttribute("aria-label", `Home at ${priceLabel(home.price)} a week`);
          el.addEventListener("mouseenter", () => cb.current.onHover(id));
          el.addEventListener("mouseleave", () => cb.current.onHover(null));
          el.addEventListener("click", (ev) => {
            ev.stopPropagation();
            cb.current.onSelect(id);
          });
          const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([home.lng, home.lat]).addTo(m);
          markers.current.set(id, { marker, el });
        }
      }
      for (const [id, { marker }] of markers.current) {
        if (!visible.has(id)) {
          marker.remove();
          markers.current.delete(id);
        }
      }
    };
    m.on("sourcedata", (e) => e.sourceId === "homes" && e.isSourceLoaded && syncMarkers());
    m.on("moveend", () => {
      syncMarkers();
      if (!userMoved.current) return;
      const c = m.getCenter();
      const b = m.getBounds();
      cb.current.onMoved({ lat: c.lat, lng: c.lng, radiusKm: Math.max(1, Math.min(50, haversineKm({ lat: c.lat, lng: c.lng }, { lat: b.getNorth(), lng: b.getEast() }))) });
    });
    m.on("dragstart", () => (userMoved.current = true));
    m.on("zoomstart", (e) => {
      if ((e as unknown as { originalEvent?: Event }).originalEvent) userMoved.current = true;
    });
    const current = markers.current;
    return () => {
      current.forEach(({ marker }) => marker.remove());
      current.clear();
      m.remove();
      map.current = null;
      setReady(false);
    };
  }, [dark]); // eslint-disable-line react-hooks/exhaustive-deps

  // Data.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    const source = m.getSource("homes") as maplibregl.GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: homes.map((h) => ({ type: "Feature", properties: { id: h.id, price: h.price }, geometry: { type: "Point", coordinates: [h.lng, h.lat] } })),
    });
    // Remove markers whose homes left the result set.
    for (const [id, { marker }] of markers.current) {
      if (!homes.some((h) => h.id === id)) {
        marker.remove();
        markers.current.delete(id);
      }
    }
  }, [homes, ready]);

  // Fit to results when the search itself changes (not when the map moved).
  useEffect(() => {
    const m = map.current;
    if (!m || !ready || !homes.length) return;
    const b = new maplibregl.LngLatBounds();
    homes.forEach((h) => b.extend([h.lng, h.lat]));
    userMoved.current = false;
    m.fitBounds(b, { padding: 64, maxZoom: 14, duration: 500 });
  }, [fitKey, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Highlight.
  useEffect(() => {
    for (const [id, { el }] of markers.current) el.dataset.active = id === activeId ? "true" : "false";
  }, [activeId, homes]);

  return <div ref={container} className="h-full w-full" role="region" aria-label="Map of homes (approximate locations)" />;
}
