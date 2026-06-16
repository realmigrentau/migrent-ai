import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchStations, Station } from "../../lib/api";

interface StationAutocompleteProps {
  value: string;
  onSelect: (station: Station | null) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export default function StationAutocomplete({
  value,
  onSelect,
  onClear,
  placeholder = "Search station (e.g. Kellyville, Parramatta, Central...)",
  className = "",
}: StationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const results = await searchStations(q);
    setSuggestions(results);
    setLoading(false);
    setShowDropdown(results.length > 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (!val) {
      onClear();
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Debounce API calls
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const handleSelect = (station: Station) => {
    setQuery(station.name);
    setShowDropdown(false);
    setSuggestions([]);
    onSelect(station);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-3)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7h8m-8 4h4m4-8H6a2 2 0 00-2 2v14l4-3h10a2 2 0 002-2V5a2 2 0 00-2-2z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="input-field"
          style={{ paddingLeft: "2.5rem", paddingRight: "2rem" }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              onClear();
              setSuggestions([]);
              setShowDropdown(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] dark:hover:text-[var(--color-ink-4)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {loading && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-ink)] rounded-full animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 mt-1 w-full bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-xl shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((station) => (
              <li key={station.id}>
                <button
                  onClick={() => handleSelect(station)}
                  className="w-full text-left px-4 py-2.5 hover:bg-[var(--color-surface)] transition-colors flex items-center gap-3 first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h4m4-8H6a2 2 0 00-2 2v14l4-3h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {station.name} Station
                    </p>
                    <p className="text-xs text-[var(--color-ink-3)]">
                      {station.line ? `${station.line} - ` : ""}{station.city}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
