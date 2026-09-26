import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { navItems, type DropdownItem, type NavLinkDropdown } from "../../lib/navData";
import { Logo } from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * `revealAfterVh` keeps the header out of the way of a full-bleed hero: it
 * stays translated off the top until the page has scrolled past that fraction
 * of the viewport height, then slides in. A fraction rather than a pixel
 * count so the threshold follows a window resize on its own.
 *
 * ── The dropdowns ──
 * They are disclosures, not ARIA menus. A `role="menu"` promises a widget
 * where arrow keys are the only way to move and Tab leaves entirely; these
 * are lists of links, so they are a button with aria-expanded controlling a
 * list, which is what the APG disclosure-navigation pattern describes and
 * what screen readers already handle well. Arrow keys still work as a
 * convenience, and Tab still walks the links.
 *
 * Three things that were wrong before and are fixed here:
 *   · the trigger had no aria-expanded, aria-haspopup or aria-controls, so
 *     a screen reader announced "Resources, button" and nothing about the
 *     eight links that appeared;
 *   · Escape closed the panel but left focus nowhere;
 *   · the panel was separated from its trigger by a 8px margin, so moving
 *     the pointer diagonally between them crossed dead space. The gap is
 *     now transparent padding inside the hover target.
 */
export default function MegaNavbar({ revealAfterVh = 0 }: { revealAfterVh?: number } = {}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const accountRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Label text: a literal wins over a translation key. The Resources hubs
  // take theirs from data/resources.ts so the navbar and the pages cannot
  // describe the same destination two different ways.
  const itemTitle = (item: DropdownItem) => item.title ?? (item.titleKey ? t(item.titleKey) : "");
  const itemDesc = (item: DropdownItem) => item.desc ?? (item.descKey ? t(item.descKey) : "");

  // Which dropdown owns the current route.
  const isDropdownActive = useCallback(
    (item: NavLinkDropdown) =>
      item.matchPrefixes.some(
        (p) => router.pathname === p || router.pathname.startsWith(`${p}/`),
      ),
    [router.pathname],
  );

  const closeDropdown = useCallback((refocus?: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setOpenDropdown(null);
    if (refocus) triggerRefs.current.get(refocus)?.focus();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Escape key closes all dropdowns
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown((current) => {
          if (current) triggerRefs.current.get(current)?.focus();
          return null;
        });
        setAccountOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  /* Keep an open panel inside the window.
     A panel is centred under its own trigger, and the trigger nearest the
     end of the nav centres a 520px panel past the right edge on a narrow
     laptop. This measures the card once, as it mounts, and nudges it back
     with a margin.
     A margin rather than a transform on purpose: framer-motion owns the
     `transform` of the wrapper it animates, so writing one there would be
     overwritten and the panel would lose its centring. The wrapper keeps
     its -50% on the separate `translate` property, and the correction lands
     on the card, which nothing else touches. */
  const measurePanel = useCallback((el: HTMLDivElement | null) => {
    panelRef.current = el;
    if (!el) return;
    el.style.marginLeft = "0px";
    const rect = el.getBoundingClientRect();
    const pad = 12;
    let delta = 0;
    if (rect.right > window.innerWidth - pad) delta = window.innerWidth - pad - rect.right;
    else if (rect.left < pad) delta = pad - rect.left;
    if (delta !== 0) el.style.marginLeft = `${delta}px`;
  }, []);

  // Starts hidden on the server too, so it never flashes over the hero.
  const [scrolledPast, setScrolledPast] = useState(revealAfterVh <= 0);

  /* Keyboard users must be able to reach the header before they have
     scrolled anywhere. While it was `inert` over the hero, the theme,
     language and account controls were out of the accessibility tree
     entirely until you scrolled 86% of a viewport - tabbing from the top
     of the homepage skipped straight past them, and a screen reader never
     announced them. Focus now reveals the header the same way scrolling
     does, which is the standard skip-link behaviour and costs the hero
     nothing: nothing is focusable up there until someone presses Tab. */
  const [focusWithin, setFocusWithin] = useState(false);
  const revealed = scrolledPast || focusWithin;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setScrolledPast(revealAfterVh <= 0 || window.scrollY > window.innerHeight * revealAfterVh);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealAfterVh]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
  }, [router.pathname]);

  /* Hover open is immediate; hover close waits. The delay is what lets the
     pointer travel from the trigger into the panel, and the panel's own
     mouseenter cancels it. */
  const handleDropdownEnter = (id: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setOpenDropdown(id);
  };

  const handleDropdownLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setOpenDropdown(null), 180);
  };

  useEffect(() => () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  }, []);

  /** Move focus between the links inside an open panel. */
  const focusItem = (panel: HTMLElement | null, index: number) => {
    if (!panel) return;
    const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>("a[href]"));
    if (links.length === 0) return;
    const wrapped = ((index % links.length) + links.length) % links.length;
    links[wrapped]?.focus();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpenDropdown(id);
      // The panel mounts this tick; focus it on the next frame.
      requestAnimationFrame(() => focusItem(panelRef.current, 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpenDropdown(id);
      requestAnimationFrame(() => focusItem(panelRef.current, -1));
    } else if (e.key === "Escape") {
      closeDropdown();
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

  // Shared nav link classes
  const navLinkClass = (active: boolean) =>
    `relative px-3 py-2 rounded-[6px] text-[13.5px] tracking-[-0.005em] transition-colors duration-150 bg-transparent border-0 outline-none appearance-none ${
      active
        ? "text-[var(--color-ink)] font-semibold"
        : "text-[var(--color-ink-2)] font-medium hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)]"
    }`;

  const navLinkClassMobile = (active: boolean) =>
    `flex items-center min-h-[44px] px-3 py-2.5 rounded-[8px] text-sm transition-colors ${
      active
        ? "text-[var(--color-ink)] font-semibold bg-[var(--color-surface-sunk)]"
        : "text-[var(--color-ink-2)] font-medium hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)]"
    }`;

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: revealed ? 0 : -72 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.3, 1] }}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        revealed ? "" : "pointer-events-none"
      } ${
        scrolled
          ? "bg-[var(--color-surface)]/97 backdrop-blur-xl border-b border-[var(--color-line)]"
          : "bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-line)]/60"
      }`}
    >
      <nav className="max-w-[1280px] mx-auto h-[60px] px-4 sm:px-6 lg:px-10 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* Logo (left) */}
        <Link href={session ? "/dashboard" : "/"} className="inline-flex items-center gap-2.5 group text-[var(--color-ink)] shrink-0">
          <Logo size={26} className="transition-transform group-hover:scale-105" />
          <span className="font-serif text-[22px] leading-none tracking-[-0.012em]">
            MigRent
          </span>
          <span className="eyebrow ml-0.5 mt-0.5">AU</span>
        </Link>

        {/* Desktop nav (centered) */}
        <ul className="hidden lg:flex items-center justify-center gap-0.5" ref={navRef}>
          {navItems.map((item, index) => {
            if (item.type === "link") {
              const active = router.pathname === item.href;
              return (
                <li key={item.href} className="flex items-center gap-1">
                  <Link href={item.href} className={navLinkClass(active)}>
                    {t(item.labelKey)}
                    {active && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute -bottom-[3px] left-3 right-3 h-[2px] bg-[var(--color-ink)] rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                  {/* Dashboard link - after Home */}
                  {index === 0 && session && (
                    <Link
                      href="/dashboard"
                      className={navLinkClass(router.pathname.startsWith("/dashboard"))}
                    >
                      {t("nav.dashboard")}
                      {router.pathname.startsWith("/dashboard") && (
                        <motion.div
                          layoutId="navIndicator"
                          className="absolute -bottom-[3px] left-3 right-3 h-[2px] bg-[var(--color-ink)] rounded-full"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  )}
                </li>
              );
            }

            // Dropdown item
            const active = isDropdownActive(item);
            const open = openDropdown === item.id;
            const panelId = `nav-panel-${item.id}`;
            /* Four items sit in two columns, three in one. The panel is only
               as wide as it needs to be, so the Resources menu is a short
               readable list instead of a 520px grid with two empty cells. */
            const twoUp = item.items.length > 3;

            return (
              <li
                key={item.id}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(item.id)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  ref={(el) => {
                    if (el) triggerRefs.current.set(item.id, el);
                    else triggerRefs.current.delete(item.id);
                  }}
                  type="button"
                  className={`${navLinkClass(active || open)} inline-flex items-center gap-1`}
                  aria-expanded={open}
                  aria-haspopup="true"
                  aria-controls={panelId}
                  onClick={() => (open ? closeDropdown() : setOpenDropdown(item.id))}
                  onKeyDown={(e) => onTriggerKeyDown(e, item.id)}
                >
                  {t(item.labelKey)}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {active && !openDropdown && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -bottom-[3px] left-3 right-3 h-[2px] bg-[var(--color-ink)] rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>

                {/* Dropdown panel.
                    The wrapper carries pt-2 rather than the card carrying
                    mt-2, so the visual gap is inside the hover target and
                    the pointer never crosses dead space on its way in. */}
                <AnimatePresence>
                  {open && (
                    <motion.div
                      key={item.id}
                      /* Opacity and Y only. Scale would change the box while
                         the overflow correction below is measuring it. */
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
                      onMouseEnter={() => handleDropdownEnter(item.id)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div
                        ref={measurePanel}
                        id={panelId}
                        onKeyDown={(e) => onPanelKeyDown(e, item.id)}
                        className={`rounded-[16px] bg-[var(--color-surface-2)] border border-[var(--color-line)] shadow-[var(--shadow-pop)] overflow-hidden max-w-[calc(100vw-24px)] ${
                          twoUp ? "w-[520px]" : "w-[368px]"
                        }`}
                      >
                        <ul
                          className={`list-none m-0 p-2.5 grid gap-0.5 ${twoUp ? "grid-cols-2" : "grid-cols-1"}`}
                          aria-label={t(item.labelKey)}
                        >
                          {item.items.map((dropItem) => (
                            <li key={dropItem.href}>
                              <Link
                                href={dropItem.href}
                                onClick={() => closeDropdown()}
                                className="group/item flex items-start gap-3 p-3 rounded-[11px] hover:bg-[var(--color-surface-sunk)] transition-colors duration-150"
                              >
                                <span className="w-9 h-9 rounded-[9px] bg-[var(--color-surface-sunk)] flex items-center justify-center shrink-0 text-[var(--color-ink-2)] transition-colors duration-150 group-hover/item:bg-[var(--color-primary-50)] group-hover/item:text-[var(--color-primary)]">
                                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={dropItem.iconPath} />
                                  </svg>
                                </span>
                                <span className="flex-1 min-w-0">
                                  <span className="block text-[13.5px] font-semibold text-[var(--color-ink)] leading-tight">
                                    {itemTitle(dropItem)}
                                  </span>
                                  <span className="block text-[12px] text-[var(--color-ink-3)] mt-1 leading-snug">
                                    {itemDesc(dropItem)}
                                  </span>
                                </span>
                                {/* The hover indicator. Transform only. */}
                                <svg
                                  className="w-3.5 h-3.5 shrink-0 mt-1 text-[var(--color-ink-4)] opacity-0 -translate-x-1 transition-[opacity,transform] duration-150 group-hover/item:opacity-100 group-hover/item:translate-x-0 group-focus-visible/item:opacity-100 group-focus-visible/item:translate-x-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  aria-hidden="true"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {/* Right cell - actions on desktop, hamburger on mobile */}
        <div className="flex items-center justify-end gap-2">

        {/* Actions (right) */}
        <ul className="hidden lg:flex items-center gap-2 justify-end">
          {/* Language */}
          <li>
            <LanguageSwitcher />
          </li>
          {/* List a room */}
          <li>
            <Link
              href={session ? "/owner/listings/new" : "/for-owners"}
              className="btn-primary btn-compact"
            >
              List a room
            </Link>
          </li>

          {/* Account / Sign Up */}
          <li>
            {session ? (
              <div ref={accountRef} className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="btn-outline btn-compact"
                  aria-expanded={accountOpen}
                  aria-haspopup="true"
                >
                  {t("nav.myAccount")}
                  <svg className={`w-3.5 h-3.5 transition-transform ${accountOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-line)] shadow-xl overflow-hidden z-50"
                    >
                      <p className="px-4 pt-3 pb-2 eyebrow">
                        {t("nav.iAmA")}
                      </p>
                      <Link
                        href="/dashboard/seeker"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                      >
                        <svg className="w-5 h-5 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {t("nav.seeker")}
                        <span className="text-xs text-[var(--color-ink-3)] ml-auto">{t("nav.findRoom")}</span>
                      </Link>
                      <Link
                        href="/dashboard/owner"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                      >
                        <svg className="w-5 h-5 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {t("nav.owner")}
                        <span className="text-xs text-[var(--color-ink-3)] ml-auto">{t("nav.listRoom")}</span>
                      </Link>
                      <div className="border-t border-[var(--color-line)]">
                        <Link
                          href="/messages"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {t("nav.messages")}
                        </Link>
                        <Link
                          href="/seeker/wishlist"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                        >
                          <svg className="w-4 h-4 text-[var(--color-coral-500)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          {t("nav.wishlist")}
                        </Link>
                        <Link
                          href="/resources/help"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                          </svg>
                          Help Centre
                        </Link>
                        <Link
                          href="/account/settings"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {t("nav.settings")}
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Secondary, not primary. The header carries one filled
                 button and it is "List a room" - the action a visitor
                 cannot reach any other way. Search is reachable from the
                 hero, the nav and every listing card, and signing up is a
                 step inside those flows rather than a destination. */
              <Link
                href="/signin"
                className="btn-outline btn-compact"
              >
                {t("nav.signIn")}
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile: language + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col gap-1.5 p-2"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-[var(--color-ink-2)]"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-[var(--color-ink-2)]"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-[var(--color-ink-2)]"
            />
          </button>
        </div>
        </div>
      </nav>

      {/* Mobile menu.
          It lives inside the fixed header and overlays the page, so opening
          it moves nothing: the document behind keeps its scroll position and
          the page does not reflow. */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`lg:hidden overflow-hidden mt-2 ${session ? "max-w-5xl" : "max-w-4xl"} mx-auto rounded-[14px] bg-[var(--color-surface-2)]/97 backdrop-blur-xl border border-[var(--color-line)] shadow-[var(--shadow-pop)]`}
          >
            <div className="px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
              {navItems.map((item, index) => {
                if (item.type === "link") {
                  const active = router.pathname === item.href;
                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        className={navLinkClassMobile(active)}
                        onClick={() => setMobileOpen(false)}
                      >
                        {t(item.labelKey)}
                      </Link>
                      {/* Dashboard after Home */}
                      {index === 0 && session && (
                        <Link
                          href="/dashboard"
                          className={navLinkClassMobile(router.pathname.startsWith("/dashboard"))}
                          onClick={() => setMobileOpen(false)}
                        >
                          {t("nav.dashboard")}
                        </Link>
                      )}
                    </div>
                  );
                }

                /* Dropdown -> accordion. One level deep, never two: the
                   same three or four destinations as the desktop panel,
                   each row a comfortable 48px tap target. */
                const expanded = mobileExpanded === item.id;
                const sectionId = `mobile-section-${item.id}`;
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => setMobileExpanded(expanded ? null : item.id)}
                      aria-expanded={expanded}
                      aria-controls={sectionId}
                      className="w-full flex items-center justify-between min-h-[44px] px-3 py-2.5 rounded-[8px] text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                    >
                      {t(item.labelKey)}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          id={sectionId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <ul className="list-none m-0 pl-3 pb-2 space-y-0.5">
                            {item.items.map((subItem) => (
                              <li key={subItem.href}>
                                <Link
                                  href={subItem.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center gap-3 min-h-[48px] px-3 py-2.5 rounded-[8px] text-sm text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                                >
                                  <span className="w-8 h-8 rounded-[7px] bg-[var(--color-surface-sunk)] flex items-center justify-center shrink-0 text-[var(--color-ink-3)]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                      <path strokeLinecap="round" strokeLinejoin="round" d={subItem.iconPath} />
                                    </svg>
                                  </span>
                                  <span className="font-medium">{itemTitle(subItem)}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Account section */}
              {session ? (
                <>
                  <div className="border-t border-[var(--color-line)] pt-2 mt-2">
                    <p className="px-3 pt-1 pb-1 eyebrow">
                      {t("nav.myAccount")} - {t("nav.iAmA")}
                    </p>
                    <Link
                      href="/dashboard/seeker"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-[8px] text-sm font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                    >
                      <svg className="w-5 h-5 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {t("nav.seeker")}
                    </Link>
                    <Link
                      href="/dashboard/owner"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-[8px] text-sm font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                    >
                      <svg className="w-5 h-5 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {t("nav.owner")}
                    </Link>
                    <Link
                      href="/account/settings"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-[8px] text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t("nav.settings")}
                    </Link>
                  </div>
                </>
              ) : (
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  style={{ color: "var(--color-primary-fg)" }}
                  className="flex items-center justify-center min-h-[44px] mt-2 px-4 py-2.5 rounded-full text-sm font-semibold text-center bg-[var(--color-primary)] text-[color:var(--color-primary-fg)] hover:bg-[var(--color-primary-500)] transition-colors"
                >
                  {t("nav.signUp")}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
