import { useState, useRef, useEffect, useCallback } from "react";

import { API_BASE_URL as BASE_URL } from "../../lib/apiBase";
const MAPTILER_KEY = "eiixMn3GOYAD8j7Rfnvz";

interface GeocodeResult {
  address: string;
  suburb: string;
  postcode: string;
  lat: number;
  lng: number;
  nearestStation: string | null;
  walkMinutes: number | null;
}

interface AddressGeocoderProps {
  onSelect: (result: GeocodeResult) => void;
  initialValue?: string;
}

interface MapTilerFeature {
  place_name: string;
  text: string;
  geometry: { coordinates: [number, number] };
  context?: Array<{ id: string; text: string; short_code?: string }>;
  properties?: Record<string, string>;
}

export default function AddressGeocoder({ onSelect, initialValue = "" }: AddressGeocoderProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<MapTilerFeature[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stationLoading, setStationLoading] = useState(false);
  const [stationInfo, setStationInfo] = useState<{ name: string; minutes: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(text)}.json?key=${MAPTILER_KEY}&country=au&limit=5&types=address,place,locality`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
      setShowDropdown(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setStationInfo(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const extractSuburbPostcode = (feature: MapTilerFeature) => {
    let suburb = feature.text || "";
    let postcode = "";

    if (feature.context) {
      for (const ctx of feature.context) {
        if (ctx.id?.startsWith("postal_code")) postcode = ctx.text;
        if (ctx.id?.startsWith("place") || ctx.id?.startsWith("locality")) suburb = ctx.text;
      }
    }

    // Try to extract postcode from place_name if not in context
    if (!postcode) {
      const match = feature.place_name.match(/\b(\d{4})\b/);
      if (match) postcode = match[1];
    }

    return { suburb, postcode };
  };

  const handleSelect = async (feature: MapTilerFeature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const { suburb, postcode } = extractSuburbPostcode(feature);

    setQuery(feature.place_name);
    setShowDropdown(false);
    setSuggestions([]);

    // Call backend to get station info
    setStationLoading(true);
    let nearestStation: string | null = null;
    let walkMinutes: number | null = null;

    try {
      const geoRes = await fetch(`${BASE_URL}/geocode/address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: feature.place_name }),
      });
      const geoData = await geoRes.json();
      nearestStation = geoData.nearest_station || null;
      walkMinutes = geoData.walk_time_minutes ?? null;

      if (nearestStation && walkMinutes !== null) {
        setStationInfo({ name: nearestStation, minutes: walkMinutes });
      }
    } catch {
      // Station lookup failed - not critical
    } finally {
      setStationLoading(false);
    }

    onSelect({
      address: feature.place_name,
      suburb,
      postcode,
      lat,
      lng,
      nearestStation,
      walkMinutes,
    });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
        Address
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Start typing an Australian address..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/30/20 focus:border-[var(--color-line-2)] transition-all text-sm"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[var(--color-line-2)] border-t-[var(--color-ink)] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((feature, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(feature)}
              className="w-full text-left px-4 py-3 hover:bg-[var(--color-primary-soft)] dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-[var(--color-primary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-slate-700 dark:text-slate-200">{feature.place_name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Station info pill */}
      {stationLoading && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
          Finding nearest station...
        </div>
      )}
      {stationInfo && !stationLoading && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h4m4-8H6a2 2 0 00-2 2v14l4-3h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
          </svg>
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            {stationInfo.minutes} min walk to {stationInfo.name}
          </span>
        </div>
      )}
    </div>
  );
}
