import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * The floating navigation that sits over the hero photograph.
 *
 * Translucent pills with a backdrop blur, one solid pill for the current
 * section and one for the primary action - the treatment in the reference,
 * not a glass effect applied to everything. It only exists over the hero; the
 * site's own MegaNavbar takes back over once you scroll past it, so nothing
 * that used to be reachable from the header stops being reachable.
 */

export type HeroNavItem = { label: string; href: string; current?: boolean };

export const HERO_NAV_ITEMS: HeroNavItem[] = [
  { label: "Stay", href: "/seeker/search", current: true },
  { label: "Broker", href: "/mentors" },
  { label: "Own/Rent", href: "/for-owners" },
  { label: "List", href: "/owner/listings/new" },
  { label: "Ask Broker", href: "/become-mentor" },
];

export const HERO_NAV_CTA = { label: "Reserve Now", href: "/seeker/search" };

export default function HeroNavigation({ navRef }: { navRef?: React.Ref<HTMLElement> }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape closes the sheet, and the page behind it should not scroll while
  // it is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus goes back to the button that opened the sheet.
  useEffect(() => {
    if (!open) toggleRef.current?.blur();
  }, [open]);

  return (
    <>
      <nav ref={navRef} className={`mg-nav${open ? " mg-nav--hidden" : ""}`} aria-label="Primary">
        <Link href="/" className="mg-nav__brand">
          MIGRENT
        </Link>

        <ul className="mg-nav__links">
          {HERO_NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="mg-pill"
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mg-nav__actions">
          <Link href={HERO_NAV_CTA.href} className="mg-pill mg-pill--solid">
            {HERO_NAV_CTA.label}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="mg-nav__toggle"
            aria-expanded={open}
            aria-controls="mg-nav-sheet"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
          </button>
        </div>
      </nav>

      {open && (
        <div className="mg-nav__sheet" id="mg-nav-sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mg-nav__sheet-head">
            <span className="mg-nav__brand">MIGRENT</span>
            <button
              ref={closeRef}
              type="button"
              className="mg-nav__toggle"
              style={{ display: "inline-flex" }}
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
            </button>
          </div>
          {HERO_NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="mg-pill" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link
            href={HERO_NAV_CTA.href}
            className="mg-pill mg-pill--solid"
            onClick={() => setOpen(false)}
          >
            {HERO_NAV_CTA.label}
          </Link>
        </div>
      )}
    </>
  );
}
