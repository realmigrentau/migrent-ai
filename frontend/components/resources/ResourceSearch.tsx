import { useId } from "react";

/**
 * The search field used on all four Resources pages.
 *
 * Built on .input-field so the focus ring, the dark surface and the
 * disabled state are the site's rather than this section's. It is a plain
 * controlled input: no combobox role, because the results are a region
 * below the field rather than a popup listbox, and claiming the role
 * without the keyboard contract that goes with it is worse than not
 * claiming it.
 *
 * The clear button is a real button with a name, reachable by keyboard,
 * and Escape clears the field from inside it - the shortcut people try
 * first.
 */
export default function ResourceSearch({
  value,
  onChange,
  label,
  placeholder,
  /** Wired to the results region so a screen reader is told what the
   *  field controls, and how many matches came back. */
  resultsId,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  placeholder: string;
  resultsId?: string;
}) {
  const id = useId();

  return (
    <div className="res-search">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="res-search__icon" aria-hidden="true">
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </span>
      <input
        id={id}
        type="search"
        className="input-field"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        aria-controls={resultsId}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
      />
      {value && (
        <button
          type="button"
          className="res-search__clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
