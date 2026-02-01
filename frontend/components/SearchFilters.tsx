import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchFiltersProps {
  onSearch: (filters: FilterState) => void;
  loading?: boolean;
}

export interface FilterState {
  query: string;
  roomType: string;
  furnished: string;
  billsIncluded: string;
  femaleOnly: boolean;
  maxPrice: string;
}

const defaultFilters: FilterState = {
  query: "",
  roomType: "",
  furnished: "",
  billsIncluded: "",
  femaleOnly: false,
  maxPrice: "",
};

export default function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const update = (key: keyof FilterState, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const activeCount = [
    filters.roomType,
    filters.furnished,
    filters.billsIncluded,
    filters.femaleOnly ? "yes" : "",
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Surry Hills, 2010, budget $250/wk..."
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="input-field pl-12 pr-4"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          disabled={loading}
          className="btn-primary py-3 px-6 rounded-xl text-sm shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Searching
            </span>
          ) : (
            "Search"
          )}
        </motion.button>
      </div>

      {/* Desktop filters */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <select
          value={filters.roomType}
          onChange={(e) => update("roomType", e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All room types</option>
          <option value="private">Private room</option>
          <option value="shared">Shared room</option>
          <option value="studio">Studio</option>
          <option value="ensuite">Ensuite</option>
        </select>

        <select
          value={filters.furnished}
          onChange={(e) => update("furnished", e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Furnishing</option>
          <option value="furnished">Furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>

        <select
          value={filters.billsIncluded}
          onChange={(e) => update("billsIncluded", e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Bills</option>
          <option value="included">Bills included</option>
          <option value="excluded">Bills extra</option>
        </select>

        <select
          value={filters.maxPrice}
          onChange={(e) => update("maxPrice", e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Max price</option>
          <option value="200">Up to $200/wk</option>
          <option value="250">Up to $250/wk</option>
          <option value="300">Up to $300/wk</option>
          <option value="350">Up to $350/wk</option>
          <option value="400">Up to $400/wk</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.femaleOnly}
            onChange={(e) => update("femaleOnly", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500"
          />
          Female-only
        </label>

        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-rose-500 hover:text-rose-600 underline underline-offset-2 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Mobile filter drawer toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="btn-secondary py-2.5 px-4 rounded-xl text-sm w-full flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>

        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                <select
                  value={filters.roomType}
                  onChange={(e) => update("roomType", e.target.value)}
                  className="input-field"
                >
                  <option value="">All room types</option>
                  <option value="private">Private room</option>
                  <option value="shared">Shared room</option>
                  <option value="studio">Studio</option>
                  <option value="ensuite">Ensuite</option>
                </select>

                <select
                  value={filters.furnished}
                  onChange={(e) => update("furnished", e.target.value)}
                  className="input-field"
                >
                  <option value="">Furnishing</option>
                  <option value="furnished">Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>

                <select
                  value={filters.billsIncluded}
                  onChange={(e) => update("billsIncluded", e.target.value)}
                  className="input-field"
                >
                  <option value="">Bills</option>
                  <option value="included">Bills included</option>
                  <option value="excluded">Bills extra</option>
                </select>

                <select
                  value={filters.maxPrice}
                  onChange={(e) => update("maxPrice", e.target.value)}
                  className="input-field"
                >
                  <option value="">Max price</option>
                  <option value="200">Up to $200/wk</option>
                  <option value="250">Up to $250/wk</option>
                  <option value="300">Up to $300/wk</option>
                  <option value="350">Up to $350/wk</option>
                  <option value="400">Up to $400/wk</option>
                </select>

                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.femaleOnly}
                    onChange={(e) => update("femaleOnly", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500"
                  />
                  Female-only
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={() => { handleSearch(); setDrawerOpen(false); }}
                    className="btn-primary py-2.5 px-4 rounded-xl text-sm flex-1"
                  >
                    Apply
                  </button>
                  {activeCount > 0 && (
                    <button onClick={handleReset} className="btn-secondary py-2.5 px-4 rounded-xl text-sm">
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
