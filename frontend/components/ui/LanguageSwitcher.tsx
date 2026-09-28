import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../../lib/i18n";

/**
 * Globe chip + dropdown exposing the 8 shipped locales. Selection goes
 * through i18next (persisted to localStorage by the language detector) and
 * updates <html lang>. Layout stays LTR for now - full RTL mirroring for
 * Arabic is untested and a project of its own.
 */
/**
 * `variant` places it in the site header:
 *   default  the bordered square chip, for anywhere outside the header
 *   nav      a borderless icon in the header pill, styled as one of its
 *            triggers, opening a list drawn like the header's panels
 *   sheet    a full-width row in the phone menu, opening in place so it
 *            cannot be clipped by the sheet's scroll container
 */
export default function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "nav" | "sheet" } = {}) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = i18n.language?.split("-")[0] || "en";

  const choose = (code: string) => {
    i18n.changeLanguage(code);
    if (typeof document !== "undefined") document.documentElement.lang = code;
    setOpen(false);
  };

  const buttonClass =
    variant === "nav"
      ? "site-nav__trigger site-nav__lang"
      : variant === "sheet"
        ? "site-nav__sheet-link"
        : "w-9 h-9 rounded-[10px] bg-transparent border border-[var(--color-line)] outline-none appearance-none text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:border-[var(--color-line-2)] hover:bg-[var(--color-surface-sunk)] transition-colors inline-flex items-center justify-center";

  const listClass =
    variant === "nav"
      ? "site-nav__lang-list"
      : variant === "sheet"
        ? "site-nav__lang-list site-nav__lang-list--sheet"
        : "absolute right-0 top-11 z-[70] min-w-[180px] py-1.5 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-line)] shadow-[var(--shadow-pop)]";

  const currentLabel = SUPPORTED_LANGUAGES.find((l) => l.code === current)?.label ?? "English";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={buttonClass}
        aria-label={variant === "sheet" ? `Language: ${currentLabel}` : "Change language"}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {variant === "sheet" && <span>{currentLabel}</span>}
        <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className={listClass}
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={current === l.code}>
              <button
                onClick={() => choose(l.code)}
                className={`${variant === "default" ? "" : "site-nav__lang-option "}w-full text-left px-3.5 py-2 text-[13.5px] inline-flex items-center justify-between gap-3 transition-colors hover:bg-[var(--color-surface-sunk)] ${
                  current === l.code
                    ? "font-semibold text-[var(--color-primary)]"
                    : "text-[var(--color-ink-2)]"
                }`}
              >
                <span>{l.label}</span>
                {current === l.code && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
