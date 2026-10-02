import { useEffect, useId, useRef, useState, type InputHTMLAttributes } from "react";
import type { SearchApiResponse, SearchApiResult } from "../../pages/api/suburbs/search";

/**
 * A suburb field with suggestions from the ABS index (/api/suburbs/search).
 * Typing stays free text, so a field that is submitted without picking a
 * suggestion still works; picking one gives the exact name, state and
 * postcode. Used by the listing wizard, the homepage and room search.
 *
 * ARIA 1.2 combobox: the input keeps focus and points at the highlighted
 * option with aria-activedescendant (same pattern as SuburbSearch).
 */

const DEBOUNCE_MS = 160;
const MIN_QUERY = 2;

export interface SuburbChoice {
  name: string;
  state: string;
  postcode: string | null;
  label: string;
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onSelect" | "role">;

export default function SuburbCombobox({
  value,
  onChange,
  onSelect,
  stateFilter = null,
  inputClassName = "",
  listClassName = "",
  className = "",
  limit = 8,
  ...inputProps
}: Omit<InputProps, "className"> & {
  value: string;
  onChange: (text: string) => void;
  onSelect: (choice: SuburbChoice) => void;
  /** Only suggest places in this state, e.g. once the state is chosen. */
  stateFilter?: string | null;
  inputClassName?: string;
  listClassName?: string;
  /** On the wrapper (the input takes inputClassName). */
  className?: string;
  limit?: number;
}) {
  const uid = useId();
  const id = inputProps.id ?? `${uid}-input`;
  const listboxId = `${uid}-listbox`;
  const [results, setResults] = useState<SearchApiResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // A value set by picking a suggestion is not searched again.
  const picked = useRef<string | null>(null);
  const typed = useRef(false);

  useEffect(() => {
    const q = value.trim();
    if (!typed.current || q.length < MIN_QUERY || q === picked.current) {
      abortRef.current?.abort();
      setResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const params = new URLSearchParams({ q, limit: String(limit) });
        if (stateFilter) params.set("state", stateFilter);
        const res = await fetch(`/api/suburbs/search?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data: SearchApiResponse = await res.json();
        setResults(data.results);
        setActive(-1);
        setOpen(data.results.length > 0);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [value, stateFilter, limit]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const choose = (r: SearchApiResult) => {
    picked.current = r.name;
    setOpen(false);
    setResults([]);
    onSelect({ name: r.name, state: r.state, postcode: r.postcode, label: r.label });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    inputProps.onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && results.length) {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((prev) => (prev + step + results.length) % results.length);
      return;
    }
    if (e.key === "Enter" && open && active >= 0 && results[active]) {
      e.preventDefault();
      choose(results[active]);
    }
  };

  const expanded = open && results.length > 0;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        {...inputProps}
        id={id}
        type="text"
        role="combobox"
        autoComplete={inputProps.autoComplete ?? "off"}
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listboxId}
        aria-activedescendant={expanded && active >= 0 ? `${uid}-opt-${active}` : undefined}
        className={inputClassName}
        value={value}
        onChange={(e) => {
          typed.current = true;
          picked.current = null;
          onChange(e.target.value);
        }}
        onFocus={(e) => {
          inputProps.onFocus?.(e);
          if (results.length) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        // Picking an option happens on pointerdown, before this fires.
        onBlur={(e) => {
          inputProps.onBlur?.(e);
          setOpen(false);
        }}
      />
      <ul
        id={listboxId}
        role="listbox"
        aria-label="Suggestions"
        hidden={!expanded}
        className={
          "absolute inset-x-0 top-[calc(100%+6px)] z-30 m-0 max-h-72 list-none overflow-y-auto overflow-x-hidden rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] " +
          listClassName
        }
      >
        {expanded &&
          results.map((r, i) => (
            <li
              key={r.salCode}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onPointerDown={(e) => {
                e.preventDefault();
                choose(r);
              }}
              onMouseEnter={() => setActive(i)}
              className={
                "flex cursor-pointer flex-col gap-0.5 rounded-[10px] px-3 py-2 text-left " +
                (i === active ? "bg-[var(--color-surface-muted)]" : "")
              }
            >
              <span className="text-[14.5px] font-medium text-[var(--color-ink)]">{r.label}</span>
              <span className="truncate text-[12.5px] text-[var(--color-ink-3)]">
                {r.postcode ?? ""}
                {r.regionName ? ` · ${r.regionName}` : ""}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
