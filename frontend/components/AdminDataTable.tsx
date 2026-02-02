import { useState, useMemo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  filterKey?: keyof T;
  filterOptions?: { label: string; value: string }[];
  actions?: (row: T) => ReactNode;
  onExportCSV?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AdminDataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  filterKey,
  filterOptions,
  actions,
  onExportCSV,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filterVal, setFilterVal] = useState("all");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...data];
    if (search && searchKey) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        String(row[searchKey]).toLowerCase().includes(q)
      );
    }
    if (filterVal !== "all" && filterKey) {
      result = result.filter((row) => String(row[filterKey]) === filterVal);
    }
    if (sortCol) {
      result.sort((a, b) => {
        const aVal = String(a[sortCol as keyof T] ?? "");
        const bVal = String(b[sortCol as keyof T] ?? "");
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [data, search, searchKey, filterVal, filterKey, sortCol, sortDir]);

  const handleSort = (key: string) => {
    if (sortCol === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {searchKey && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-field max-w-xs text-sm"
          />
        )}
        {filterOptions && (
          <select
            value={filterVal}
            onChange={(e) => setFilterVal(e.target.value)}
            className="input-field max-w-[180px] text-sm"
          >
            <option value="all">All</option>
            {filterOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
        <div className="sm:ml-auto flex gap-2">
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="btn-secondary text-sm !py-2 !px-4 inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap ${
                    col.sortable !== false
                      ? "cursor-pointer hover:text-rose-500 select-none"
                      : ""
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortCol === col.key && (
                      <svg
                        className={`w-3 h-3 transition-transform ${sortDir === "desc" ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((row, i) => (
                <motion.tr
                  key={String(row.id ?? i)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {col.render
                        ? col.render(row)
                        : String(row[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">{actions(row)}</td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-slate-400 dark:text-slate-500"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Showing {filtered.length} of {data.length} results
      </p>
    </div>
  );
}
