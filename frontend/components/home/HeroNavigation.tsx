import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { navItems } from "../../lib/navData";

/**
 * The navigation that sits over the hero sky.
 *
 * Wordmark left, links centred, nothing on the right but the phone toggle.
 * The glass pills went with the photograph: on a drawn night sky they read
 * as six competing buttons above a headline, where the reference keeps the
 * top of the page quiet and lets the one button under the headline be the
 * only thing that looks pressable.
 *
 * There is no call to action up here for the same reason. The reference puts
 * its only action in the hero body, about a hundred pixels below this row,
 * and a second copy of it in the navigation would just be the same link
 * twice on one screen. Restoring it is rendering HERO_NAV_CTA back into
 * .mg-nav__actions.
 *
 * It only exists over the hero; the site's own MegaNavbar takes back over
 * once you scroll past it, so nothing that used to be reachable from the
 * header stops being reachable.
 */

export type HeroNavItem = { labelKey: string; href: string };

/**
 * The hero's links are derived from lib/navData, not written out again here.
 *
 * They used to be a second, hand-maintained list, and it had already drifted
 * once: the header dropped "Broker" when it turned out MigRent's mentors are
 * people who have made the same move rather than licensed agents, and this
 * list kept its own copy of the old idea for a while afterwards. Two lists
 * describing one site is a bug with a delay on it.
 *
 * navData's top level is four audience-first entries. Three of them are
 * dropdowns, which have no href of their own, so each one resolves to the
 * first destination in its first column - the page that dropdown exists to
 * send people to. That is /seeker/search for Find a stay, /for-owners for
 * For owners and /guides for Resources.
 *
 * Labels come through the same i18n keys the header uses, so the hero is
 * translated in all eight locales instead of being the one English-only row
 * on the page.
 */
export function heroNavItems(): HeroNavItem[] {
  return navItems.map((item) =>
    item.type === "link"
      ? { labelKey: item.labelKey, href: item.href }
      : { labelKey: item.labelKey, href: item.columns[0][0].href },
  );
}

export const HERO_NAV_CTA = { labelKey: "nav.findRoom", href: "/seeker/search" };

export default function HeroNavigation({ navRef }: { navRef?: React.Ref<HTMLElement> }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const items = useMemo(() => heroNavItems(), []);

  /* Marks the entry whose destination the reader is already on. Prefix
     rather than equality so /seeker/search/123 still lights up Find a stay. */
  const isCurrent = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

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
          {items.map((item) => (
            <li key={item.labelKey}>
              <Link
                href={item.href}
                className="mg-navlink"
                aria-current={isCurrent(item.href) ? "page" : undefined}
              >
                {t(item.labelKey)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mg-nav__actions">
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
          {items.map((item) => (
            <Link
              key={item.labelKey}
              href={item.href}
              className="mg-navlink mg-navlink--sheet"
              aria-current={isCurrent(item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
