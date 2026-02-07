import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Listing {
  id: string;
  address: string;
  suburb: string;
  weeklyPrice?: number;
  dailyPrice?: number;
  lat: number;
  lng: number;
}

interface ListingsMapProps {
  listings: Listing[];
  isDark: boolean;
}

const MAPTILER_KEY = "eiixMn3GOYAD8j7Rfnvz";

function getStyleUrl(dark: boolean) {
  const style = dark ? "streets-v2-dark" : "streets-v2";
  return `https://api.maptiler.com/maps/${style}/style.json?key=${MAPTILER_KEY}`;
}

export default function ListingsMap({ listings, isDark }: ListingsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const mapReady = useRef(false);

  const addMarkers = (listingsToAdd: Listing[]) => {
    if (!map.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    listingsToAdd.forEach((listing) => {
      const el = document.createElement("div");
      el.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;background:#f43f5e;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.15s">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
      </div>`;

      el.addEventListener("mouseenter", () => {
        (el.firstElementChild as HTMLElement).style.transform = "scale(1.15)";
      });
      el.addEventListener("mouseleave", () => {
        (el.firstElementChild as HTMLElement).style.transform = "scale(1)";
      });

      const priceDisplay = listing.dailyPrice
        ? `AUD $${listing.dailyPrice}/day`
        : `AUD $${listing.weeklyPrice}/wk`;

      const popup = new maplibregl.Popup({ offset: 25, closeButton: true })
        .setHTML(`
          <div style="padding:4px;min-width:140px;font-family:Inter,system-ui,sans-serif">
            <p style="font-weight:700;font-size:13px;color:#0f172a;margin:0">${listing.address}</p>
            <p style="font-size:11px;color:#64748b;margin:2px 0 0">${listing.suburb}</p>
            <p style="font-weight:700;font-size:13px;color:#f43f5e;margin:6px 0 0">${priceDisplay}</p>
            <a href="/seeker/room/${listing.id}" style="font-size:11px;color:#3b82f6;text-decoration:none;margin-top:4px;display:inline-block">View details &rarr;</a>
          </div>
        `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([listing.lng, listing.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getStyleUrl(isDark),
      center: [151.206, -33.892],
      zoom: 13,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      mapReady.current = true;
      addMarkers(listings);
    });

    return () => {
      mapReady.current = false;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update style on theme change
  useEffect(() => {
    if (!map.current || !mapReady.current) return;
    map.current.setStyle(getStyleUrl(isDark));
    // Re-add markers after new style loads
    map.current.once("style.load", () => {
      addMarkers(listings);
    });
  }, [isDark]);

  // Update markers when listings change
  useEffect(() => {
    if (!map.current || !mapReady.current) return;
    addMarkers(listings);
  }, [listings]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}
