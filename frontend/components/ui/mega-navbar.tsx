import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import {
  groupDropdownItems,
  navItems,
  type DropdownItem,
  type NavLinkDropdown,
} from "../../lib/navData";
import { Logo } from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * The site header.
 *
 * Built from three 21st.dev components, each owning one layer. The styles
 * live in styles/navbar.css with every value traced to its source class:
 *
 *   Navbar 1              the floating pill, the logo, the primary action,
 *                         and the full-screen phone menu
 *   Dorpdown Navigation   the triggers, the hover pill that slides between
 *                         them, and the panels of titled icon columns that
 *                         morph from one menu to the next
 *   Tubelight Navbar      the lamp that marks the section you are in
 *
 * Nothing about how a visitor uses it changed underneath:
 *
 *  - The dropdowns are disclosures, not ARIA menus. A `role="menu"` promises
 *    a widget where arrow keys are the only way to move and Tab leaves
 *    entirely; these are lists of links, so each is a button with
 *    aria-expanded controlling a region, per the APG disclosure-navigation
 *    pattern. Arrow keys still move through a panel as a convenience.
 *  - Escape closes a panel and puts focus back on the button that opened it.
 *  - Hover opens at once and closes after a short delay, so the pointer can
 *    travel from a trigger into its panel. The 8px gap between them is
 *    padding inside the hover target, never dead space.
 *  - A click after a hover-open leaves the panel open. Before, the hover
 *    opened it and the click that followed toggled it shut again.
 *  - On the homepage the header waits off-screen until the hero has scrolled
 *    past, and appears the moment anything in it takes focus, so keyboard
 *    users can still reach it from the top of the page.
 */

type OpenReason = "hover" | "click" | "key";

/** The account panel, drawn with the same rows as the site menus. */
const ACCOUNT_ICON = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  heart: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  help: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

const ACCOUNT_MENU: NavLinkDropdown = {
  type: "dropdown",
  id: "account",
  labelKey: "nav.myAccount",
  matchPrefixes: ["/dashboard", "/account", "/messages", "/seeker/wishlist"],
  items: [
    { href: "/dashboard/seeker", iconPath: ACCOUNT_ICON.search, groupKey: "nav.iAmA", titleKey: "nav.seeker", descKey: "nav.findRoom" },
    { href: "/dashboard/owner", iconPath: ACCOUNT_ICON.home, groupKey: "nav.iAmA", titleKey: "nav.owner", descKey: "nav.listRoom" },
    { href: "/messages", iconPath: ACCOUNT_ICON.chat, groupKey: "nav.myAccount", titleKey: "nav.messages" },
    { href: "/seeker/wishlist", iconPath: ACCOUNT_ICON.heart, groupKey: "nav.myAccount", titleKey: "nav.wishlist" },
    { href: "/resources/help", iconPath: ACCOUNT_ICON.help, groupKey: "nav.myAccount", title: "Help Centre" },
    { href: "/account/settings", iconPath: ACCOUNT_ICON.settings, groupKey: "nav.myAccount", titleKey: "nav.settings" },
  ],
};

/** Tubelight's lamp. One instance on the page, so it slides between items. */
function Lamp() {
  return (
    <motion.span
      layoutId="site-nav-lamp"
      className="site-nav__lamp"
      initial={false}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      aria-hidden="true"
    >
      <span className="site-nav__lamp-bar">
        <span />
        <span />
        <span />
      </span>
    </motion.span>
  );
}

/** Dorpdown's hover pill. The radius is set as a style, as in the source, so
 *  framer can hold it round while the pill stretches between items. */
function HoverPill() {
  return (
    <motion.span
      layoutId="site-nav-hover"
      className="site-nav__hover"
      style={{ borderRadius: 99 }}
      aria-hidden="true"
    />
  );
}

function ItemIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default function MegaNavbar({ revealAfterVh = 0 }: { revealAfterVh?: number } = {}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useAuth();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedBy = useRef<OpenReason | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // A literal title wins over a key. The Resources hubs take theirs from
  // data/resources.ts so the header and the pages cannot word them apart.
  const itemTitle = (item: DropdownItem) => item.title ?? (item.titleKey ? t(item.titleKey) : "");
  const itemDesc = (item: DropdownItem) => item.desc ?? (item.descKey ? t(item.descKey) : "");

  const matches = useCallback(
    (prefixes: string[]) =>
      prefixes.some((p) => router.pathname === p || router.pathname.startsWith(`${p}/`)),
    [router.pathname],
  );

  // -- Reveal over the homepage hero -----------------------------------
  const [scrolledPast, setScrolledPast] = useState(revealAfterVh <= 0);
  const [focusWithin, setFocusWithin] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolledPast(revealAfterVh <= 0 || window.scrollY > window.innerHeight * revealAfterVh);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealAfterVh]);

  const revealed = scrolledPast || focusWithin || mobileOpen || openDropdown !== null;

  // -- Opening and closing ---------------------------------------------
  const clearHoverTimer = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = null;
  };

  const closeDropdown = useCallback((refocus?: string) => {
    clearHoverTimer();
    openedBy.current = null;
    setOpenDropdown(null);
    if (refocus) triggerRefs.current.get(refocus)?.focus();
  }, []);

  const openByHover = (id: string) => {
    clearHoverTimer();
    if (openDropdown !== id) openedBy.current = "hover";
    setOpenDropdown(id);
  };

  const scheduleClose = () => {
    clearHoverTimer();
    hoverTimeout.current = setTimeout(() => {
      openedBy.current = null;
      setOpenDropdown(null);
    }, 180);
  };

  /* A pointer that hovered a trigger has already opened its panel, so the
     click that follows is confirmation, not a toggle. The second click
     closes it, which is what touch and a deliberate mouse both expect. */
  const onTriggerClick = (id: string) => {
    if (openDropdown === id) {
      if (openedBy.current === "hover") {
        openedBy.current = "click";
        return;
      }
      closeDropdown();
      return;
    }
    openedBy.current = "click";
    setOpenDropdown(id);
  };

  // Clicking anywhere outside the header closes an open panel.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        clearHoverTimer();
        openedBy.current = null;
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Escape closes whatever is open and returns focus to what opened it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenDropdown((current) => {
        if (current) triggerRefs.current.get(current)?.focus();
        return null;
      });
      openedBy.current = null;
      setMobileOpen((open) => {
        if (open) requestAnimationFrame(() => toggleRef.current?.focus());
        return false;
      });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* Navigating closes every menu, as soon as navigation starts rather than
     after the next page has rendered under an open panel. */
  useEffect(() => {
    const onStart = () => {
      clearHoverTimer();
      openedBy.current = null;
      setOpenDropdown(null);
      setHovered(null);
      setMobileOpen(false);
      setMobileExpanded(null);
    };
    router.events.on("routeChangeStart", onStart);
    return () => router.events.off("routeChangeStart", onStart);
  }, [router.events]);

  useEffect(() => () => clearHoverTimer(), []);

  /* Keep an open panel inside the window. The panels hang from the left of
     their trigger, as in the reference, so the ones nearest the right of
     the header run off a laptop screen. Measured once on mount and nudged
     back with a margin: framer owns this element's transform. */
  const measurePanel = useCallback((el: HTMLDivElement | null) => {
    panelRef.current = el;
    if (!el) return;
    el.style.marginLeft = "0px";
    const rect = el.getBoundingClientRect();
    const pad = 12;
    let delta = 0;
    if (rect.right > window.innerWidth - pad) delta = window.innerWidth - pad - rect.right;
    if (rect.left + delta < pad) delta = pad - rect.left;
    if (delta !== 0) el.style.marginLeft = `${delta}px`;
  }, []);

  // -- Keyboard inside a panel -----------------------------------------
  const focusItem = (panel: HTMLElement | null, index: number) => {
    if (!panel) return;
    const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>("a[href]"));
    if (links.length === 0) return;
    links[((index % links.length) + links.length) % links.length]?.focus();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openedBy.current = "key";
      setOpenDropdown(id);
      // The panel mounts this tick; focus its first link on the next frame.
      requestAnimationFrame(() => focusItem(panelRef.current, 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openedBy.current = "key";
      setOpenDropdown(id);
      requestAnimationFrame(() => focusItem(panelRef.current, -1));
    }
  };

  const onPanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, id: string) => {
    const panel = e.currentTarget;
    const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>("a[href]"));
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(panel, current + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(panel, current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(panel, 0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(panel, -1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown(id);
    }
  };

  // -- The phone sheet ---------------------------------------------------
  /* It is a modal dialog while it is up: the page behind does not scroll,
     focus starts on the close button and cannot wander out behind the
     sheet, and closing it returns focus to the button that opened it. */
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const closeSheet = () => {
    setMobileOpen(false);
    requestAnimationFrame(() => toggleRef.current?.focus());
  };

  const trapFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !sheetRef.current) return;
    const focusable = Array.from(
      sheetRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
    ).filter((el) => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // -- Pieces --------------------------------------------------------------
  const hoverHandlers = (key: string) => ({
    onMouseEnter: () => setHovered(key),
    onMouseLeave: () => setHovered((h) => (h === key ? null : h)),
    onFocus: () => setHovered(key),
    onBlur: () => setHovered((h) => (h === key ? null : h)),
  });

  /** One dropdown: a Dorpdown trigger and its panel of titled columns. */
  const renderDropdown = (item: NavLinkDropdown) => {
    const open = openDropdown === item.id;
    const active = matches(item.matchPrefixes);
    const panelId = `nav-panel-${item.id}`;
    const groups = groupDropdownItems(item.items);

    return (
      <li
        key={item.id}
        onMouseEnter={() => openByHover(item.id)}
        onMouseLeave={scheduleClose}
      >
        <button
          ref={(el) => {
            if (el) triggerRefs.current.set(item.id, el);
            else triggerRefs.current.delete(item.id);
          }}
          type="button"
          className="site-nav__trigger"
          data-active={active ? "true" : undefined}
          aria-current={active ? "true" : undefined}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onTriggerClick(item.id)}
          onKeyDown={(e) => onTriggerKeyDown(e, item.id)}
          {...hoverHandlers(item.id)}
        >
          <span>{t(item.labelKey)}</span>
          <ChevronDown className="site-nav__chevron" strokeWidth={2} aria-hidden="true" />
          {active && <Lamp />}
          {(hovered === item.id || open) && <HoverPill />}
        </button>

        <AnimatePresence>
          {open && (
            <div className="site-nav__drop">
              <motion.div
                layoutId="site-nav-menu"
                ref={measurePanel}
                id={panelId}
                className="site-nav__panel"
                style={{ borderRadius: 16 }}
                onKeyDown={(e) => onPanelKeyDown(e, item.id)}
              >
                <div className="site-nav__cols">
                  {groups.map((group, gi) => {
                    const titleId = `${panelId}-g${gi}`;
                    return (
                      <motion.div layout key={group.titleKey ?? gi} className="site-nav__col">
                        {group.titleKey && (
                          <p id={titleId} className="site-nav__col-title">
                            {t(group.titleKey)}
                          </p>
                        )}
                        <ul
                          className="site-nav__list"
                          aria-labelledby={group.titleKey ? titleId : undefined}
                          aria-label={group.titleKey ? undefined : t(item.labelKey)}
                        >
                          {group.items.map((entry) => (
                            <li key={entry.href}>
                              <Link href={entry.href} className="site-nav__row" onClick={() => closeDropdown()}>
                                <span className="site-nav__box">
                                  <ItemIcon path={entry.iconPath} />
                                </span>
                                <span className="site-nav__text">
                                  <span className="site-nav__label">{itemTitle(entry)}</span>
                                  {itemDesc(entry) && <span className="site-nav__desc">{itemDesc(entry)}</span>}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </li>
    );
  };

  const listRoomHref = session ? "/owner/listings/new" : "/for-owners";
  const signInActive = router.pathname === "/signin";

  /* The sheet's rows, flattened so each can take its place in the
     stagger - Navbar 1 brings its links in one after another. */
  const sheetRows: { key: string; node: React.ReactNode }[] = [
    ...navItems.map((item) => {
      if (item.type === "link") {
        const active = router.pathname === item.href;
        return {
          key: item.href,
          node: (
            <Link
              href={item.href}
              className="site-nav__sheet-link"
              aria-current={active ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {t(item.labelKey)}
            </Link>
          ),
        };
      }
      const expanded = mobileExpanded === item.id;
      const sectionId = `mobile-section-${item.id}`;
      return {
        key: item.id,
        node: (
          <>
            <button
              type="button"
              className="site-nav__sheet-link"
              aria-expanded={expanded}
              aria-controls={sectionId}
              aria-current={matches(item.matchPrefixes) ? "true" : undefined}
              onClick={() => setMobileExpanded(expanded ? null : item.id)}
            >
              {t(item.labelKey)}
              <ChevronDown className="site-nav__chevron" strokeWidth={2} aria-hidden="true" />
            </button>
            {expanded && (
              <ul className="site-nav__sheet-sub" id={sectionId}>
                {item.items.map((entry) => (
                  <li key={entry.href}>
                    <Link href={entry.href} className="site-nav__row" onClick={() => setMobileOpen(false)}>
                      <span className="site-nav__box">
                        <ItemIcon path={entry.iconPath} />
                      </span>
                      <span className="site-nav__label">{itemTitle(entry)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        ),
      };
    }),
    session
      ? {
          key: "account",
          node: (
            <>
              <p className="site-nav__sheet-title">{t("nav.myAccount")}</p>
              <ul className="site-nav__sheet-sub">
                {ACCOUNT_MENU.items.map((entry) => (
                  <li key={entry.href}>
                    <Link href={entry.href} className="site-nav__row" onClick={() => setMobileOpen(false)}>
                      <span className="site-nav__box">
                        <ItemIcon path={entry.iconPath} />
                      </span>
                      <span className="site-nav__label">{itemTitle(entry)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ),
        }
      : {
          key: "signin",
          node: (
            <Link
              href="/signin"
              className="site-nav__sheet-link"
              aria-current={signInActive ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.signIn")}
            </Link>
          ),
        },
    { key: "language", node: <LanguageSwitcher variant="sheet" /> },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <header
        ref={headerRef}
        className="site-nav"
        data-revealed={revealed ? "true" : "false"}
        data-sheet={mobileOpen ? "open" : undefined}
        onFocusCapture={() => setFocusWithin(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
        }}
      >
        <LayoutGroup id="site-nav">
          <nav className="site-nav__bar" aria-label="Primary">
            <Link href={session ? "/dashboard" : "/"} className="site-nav__brand">
              <span className="site-nav__mark" aria-hidden="true">
                <Logo size={32} title="" />
              </span>
              <span className="site-nav__wordmark">MigRent</span>
              <span className="site-nav__au">AU</span>
            </Link>

            <ul className="site-nav__items">
              {navItems.map((item) => {
                if (item.type === "dropdown") return renderDropdown(item);
                const active = router.pathname === item.href;
                const key = item.href;
                return (
                  /* Dorpdown closes an open panel as soon as the pointer
                     reaches a plain link beside it. */
                  <li key={key} onMouseEnter={() => closeDropdown()}>
                    <Link
                      href={item.href}
                      className="site-nav__trigger"
                      data-active={active ? "true" : undefined}
                      aria-current={active ? "page" : undefined}
                      {...hoverHandlers(key)}
                    >
                      {t(item.labelKey)}
                      {active && <Lamp />}
                      {hovered === key && <HoverPill />}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="site-nav__end">
              <ul className="site-nav__items">
                <li onMouseEnter={() => closeDropdown()}>
                  <LanguageSwitcher variant="nav" />
                </li>
                {session ? (
                  renderDropdown(ACCOUNT_MENU)
                ) : (
                  <li onMouseEnter={() => closeDropdown()}>
                    <Link
                      href="/signin"
                      className="site-nav__trigger"
                      data-active={signInActive ? "true" : undefined}
                      aria-current={signInActive ? "page" : undefined}
                      {...hoverHandlers("signin")}
                    >
                      {t("nav.signIn")}
                      {signInActive && <Lamp />}
                      {hovered === "signin" && <HoverPill />}
                    </Link>
                  </li>
                )}
              </ul>
              {/* The header's one filled button - the action a visitor
                  cannot reach any other way. Search is in the hero, the
                  nav and every listing card; signing up is a step inside
                  those flows rather than a destination. */}
              <Link href={listRoomHref} className="site-nav__cta">
                {t("nav.listRoom")}
              </Link>
            </div>

            <button
              ref={toggleRef}
              type="button"
              className="site-nav__toggle"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              onClick={() => setMobileOpen(true)}
            >
              <Menu strokeWidth={2} aria-hidden="true" />
            </button>
          </nav>
        </LayoutGroup>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              ref={sheetRef}
              id="mobile-nav-panel"
              className="site-nav__sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              /* Lenis owns wheel scrolling on the page; this lets the sheet
                 scroll natively when its contents are taller than a phone. */
              data-lenis-prevent=""
              onKeyDown={trapFocus}
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <motion.button
                ref={closeRef}
                type="button"
                className="site-nav__close"
                aria-label="Close menu"
                onClick={closeSheet}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <X strokeWidth={2} aria-hidden="true" />
              </motion.button>

              <ul className="site-nav__sheet-list">
                {sheetRows.map((row, i) => (
                  <motion.li
                    key={row.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                  >
                    {row.node}
                  </motion.li>
                ))}
              </ul>

              <motion.div
                className="site-nav__sheet-foot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.5 }}
              >
                <Link href={listRoomHref} className="site-nav__sheet-cta" onClick={() => setMobileOpen(false)}>
                  {t("nav.listRoom")}
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
}
