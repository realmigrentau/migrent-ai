import { useId } from "react";

export type KindFilter = "all" | "capital" | "regional";
export type SortOption = "population" | "name" | "overseas";

export interface DirectoryFilterState {
  state: string;
  kind: KindFilter;
  sort: SortOption;
}

const STATES = [
  { value: "", label: "All of Australia" },
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
  { value: "OT", label: "Other Territories" },
];

const KINDS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "capital", label: "Capital cities" },
  { value: "regional", label: "Regional" },
];

const SORTS: { value: SortOption; label: string }[] = [
  { value: "population", label: "Largest first" },
  { value: "name", label: "A to Z" },
  { value: "overseas", label: "Most born overseas" },
];

/**
 * The directory's filters.
 *
 * Three controls, not ten. The state and the capital/regional split change
 * which sections are on the page; the sort changes the order of suburbs
 * inside them. Anything more would crowd the one thing people come here to
 * do, which is search.
 *
 * The row scrolls horizontally on a phone rather than wrapping into a block
 * that pushes the city list below the fold, and every control is a native
 * select or button so it works with a keyboard and a screen reader without
 * any help from us.
 *
 * There is no "weekly room price" filter. It would need enough MigRent
 * listings per suburb to compute a median, and with the platform's current
 * listing count it would filter 15,334 suburbs down to none. It belongs here
 * once the data supports it.
 */
export default function DirectoryFilters({
  value,
  onChange,
  resultCount,
}: {
  value: DirectoryFilterState;
  onChange: (next: DirectoryFilterState) => void;
  resultCount: number;
}) {
  const stateId = useId();
  const sortId = useId();

  return (
    <div className="sub-filters">
      <div className="sub-filters__row">
        <div className="sub-filters__group">
          <label className="sub-filters__label" htmlFor={stateId}>
            State or territory
          </label>
          <select
            id={stateId}
            className="sub-filters__select"
            value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
          >
            {STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sub-filters__group">
          <span className="sub-filters__label" id="sub-kind-label">
            Area type
          </span>
          <div className="sub-segmented" role="group" aria-labelledby="sub-kind-label">
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                className="sub-segmented__btn"
                aria-pressed={value.kind === k.value}
                onClick={() => onChange({ ...value, kind: k.value })}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sub-filters__group">
          <label className="sub-filters__label" htmlFor={sortId}>
            Sort suburbs
          </label>
          <select
            id={sortId}
            className="sub-filters__select"
            value={value.sort}
            onChange={(e) => onChange({ ...value, sort: e.target.value as SortOption })}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="sub-filters__count" role="status" aria-live="polite">
        {resultCount.toLocaleString()} {resultCount === 1 ? "city or region" : "cities and regions"} shown
      </p>
    </div>
  );
}
