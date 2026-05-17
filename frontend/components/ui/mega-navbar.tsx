import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { navItems, type NavLinkDropdown } from "../../lib/navData";
import { Logo } from "./Logo";

export default function MegaNavbar() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, toggle, mounted } = useTheme();
  const { session } = useAuth();
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSignIn = router.pathname === "/signin";

  // Check if a dropdown's route is active
  const isDropdownActive = useCallback(
    (item: NavLinkDropdown) =>
      router.pathname.startsWith(`/${item.id}`),
    [router.pathname],
  );

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
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
        setOpenDropdown(null);
        setAccountOpen(false);
        setLangOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
    setLangOpen(false);
  }, [router.pathname]);

  // Desktop hover handlers with delay to prevent flicker
  const handleDropdownEnter = (id: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setOpenDropdown(id);
  };

  const handleDropdownLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  // Shared nav link classes
  const navLinkClass = (active: boolean) =>
    `relative px-3 py-2 rounded-[6px] text-[13.5px] tracking-[-0.005em] transition-colors duration-150 bg-transparent border-0 outline-none appearance-none ${
      active
        ? "text-[var(--color-ink)] font-semibold"
        : "text-[var(--color-ink-2)] font-medium hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)]"
    }`;

  const navLinkClassMobile = (active: boolean) =>
    `block px-3 py-2.5 rounded-[8px] text-sm transition-colors ${
      active
        ? "text-[var(--color-ink)] font-semibold bg-[var(--color-surface-sunk)]"
        : "text-[var(--color-ink-2)] font-medium hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)]"
    }`;

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled
          ? "bg-[var(--color-surface)]/97 backdrop-blur-xl border-b border-[var(--color-line)]"
          : "bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-line)]/60"
      }`}
    >
      <nav className="max-w-[1280px] mx-auto h-[60px] px-4 sm:px-6 lg:px-10 flex items-center gap-6">
        {/* Logo */}
        <Link href={session ? "/dashboard" : "/"} className="inline-flex items-center gap-2.5 group text-[var(--color-ink)] shrink-0">
          <Logo size={26} className="transition-transform group-hover:scale-105" />
          <span className="font-serif text-[22px] leading-none tracking-[-0.012em]">
            MigRent
          </span>
          <span className="eyebrow ml-0.5 mt-0.5">AU</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-0.5" ref={navRef}>
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
            return (
              <li
                key={item.id}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(item.id)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className={`${navLinkClass(active || openDropdown === item.id)} inline-flex items-center gap-1`}
                  onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                >
                  {t(item.labelKey)}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === item.id ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
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

                {/* Mega dropdown panel */}
                <AnimatePresence>
                  {openDropdown === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] rounded-[14px] bg-[var(--color-surface-2)] border border-[var(--color-line)] shadow-[var(--shadow-modal)] overflow-hidden z-50"
                      onMouseEnter={() => handleDropdownEnter(item.id)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="grid grid-cols-2 gap-0 p-3">
                        {item.columns.map((col, ci) => (
                          <div key={ci} className="space-y-1">
                            {col.map((dropItem) => (
                              <Link
                                key={dropItem.href}
                                href={dropItem.href}
                                onClick={() => setOpenDropdown(null)}
                                className="flex items-start gap-3 p-3 rounded-[10px] hover:bg-[var(--color-surface-sunk)] transition-colors group"
                              >
                                <div
                                  className={`w-9 h-9 rounded-[8px] bg-[var(--color-surface-sunk)] flex items-center justify-center shrink-0 text-[var(--color-ink-2)] transition-colors group-hover:bg-[var(--color-surface)] group-hover:text-[var(--color-ink)]`}
                                >
                                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={dropItem.iconPath} />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[var(--color-ink)] leading-tight">
                                    {t(dropItem.titleKey)}
                                  </p>
                                  <p className="text-xs text-[var(--color-ink-3)] mt-0.5 leading-snug">
                                    {t(dropItem.descKey)}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}

          {/* Language selector */}
          <li>
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="px-3 py-2 rounded-[6px] text-[13.5px] font-medium bg-transparent border-0 outline-none appearance-none text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors duration-150 inline-flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {currentLanguage.flag} {currentLanguage.label}
                <svg
                  className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-line)] shadow-[var(--shadow-pop)] overflow-hidden z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          lang.code === currentLanguage.code
                            ? "bg-[var(--color-surface-sunk)] text-[var(--color-ink)] font-semibold"
                            : "text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)]"
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        {lang.label}
                        {lang.code === currentLanguage.code && (
                          <svg className="w-4 h-4 ml-auto text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </li>

          {/* Theme toggle */}
          {mounted && (
            <li>
              <button
                onClick={toggle}
                className="w-9 h-9 rounded-[10px] bg-transparent border border-[var(--color-line)] outline-none appearance-none text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:border-[var(--color-line-2)] hover:bg-[var(--color-surface-sunk)] transition-colors inline-flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </li>
          )}

          {/* List a room */}
          <li>
            <Link
              href={session ? "/owner/listings/new" : "/for-owners"}
              className="h-9 px-3.5 inline-flex items-center justify-center rounded-[10px] text-[13.5px] font-semibold bg-transparent border border-[var(--color-line-2)] text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
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
                  className="px-4 h-9 rounded-full text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-500)] transition-colors inline-flex items-center gap-1.5"
                >
                  {t("nav.myAccount")}
                  <svg className={`w-3.5 h-3.5 transition-transform ${accountOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden z-50"
                    >
                      <p className="px-4 pt-3 pb-2 eyebrow">
                        {t("nav.iAmA")}
                      </p>
                      <Link
                        href="/dashboard/seeker"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                      >
                        <svg className="w-5 h-5 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                        <svg className="w-5 h-5 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {t("nav.messages")}
                        </Link>
                        <Link
                          href="/seeker/wishlist"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                        >
                          <svg className="w-4 h-4 text-[var(--color-coral-500)]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          {t("nav.wishlist")}
                        </Link>
                        <Link
                          href="/guides"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                          </svg>
                          Help Centre
                        </Link>
                        <Link
                          href="/account/settings"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
              <Link
                href="/signup"
                className="px-4 h-9 inline-flex items-center justify-center rounded-full text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-500)] transition-colors"
              >
                {t("nav.signUp")}
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile: toggle + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          {mounted && (
            <button
              onClick={toggle}
              className="p-2 rounded-[6px] text-[var(--color-ink-3)]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
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
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`lg:hidden overflow-hidden mt-2 ${session ? "max-w-5xl" : "max-w-4xl"} mx-auto rounded-[14px] bg-[var(--color-surface-2)]/97 backdrop-blur-xl border border-[var(--color-line)] shadow-[var(--shadow-pop)]`}
          >
            <div className="px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
              {navItems.map((item, index) => {
                if (item.type === "link") {
                  const active = router.pathname === item.href;
                  return (
                    <div key={item.href}>
                      <Link href={item.href} className={navLinkClassMobile(active)}>
                        {t(item.labelKey)}
                      </Link>
                      {/* Dashboard after Home */}
                      {index === 0 && session && (
                        <Link
                          href="/dashboard"
                          className={navLinkClassMobile(router.pathname.startsWith("/dashboard"))}
                        >
                          {t("nav.dashboard")}
                        </Link>
                      )}
                    </div>
                  );
                }

                // Dropdown → accordion
                const expanded = mobileExpanded === item.id;
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => setMobileExpanded(expanded ? null : item.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                    >
                      {t(item.labelKey)}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-3 pb-2 space-y-0.5">
                            {item.columns.flat().map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className="flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                              >
                                <div className="w-7 h-7 rounded-[6px] bg-[var(--color-surface-sunk)] flex items-center justify-center shrink-0 text-[var(--color-ink-3)]">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={subItem.iconPath} />
                                  </svg>
                                </div>
                                {t(subItem.titleKey)}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Language selector in mobile */}
              <div className="border-t border-[var(--color-line)] pt-2 mt-2">
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === "language" ? null : "language")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    {currentLanguage.flag} {currentLanguage.label}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === "language" ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {mobileExpanded === "language" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-3 pb-2 space-y-0.5">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              changeLanguage(lang.code);
                              setMobileExpanded(null);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm transition-colors ${
                              lang.code === currentLanguage.code
                                ? "text-[var(--color-ink)] font-semibold bg-[var(--color-surface-sunk)]"
                                : "text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)]"
                            }`}
                          >
                            <span className="text-base">{lang.flag}</span>
                            {lang.label}
                            {lang.code === currentLanguage.code && (
                              <svg className="w-4 h-4 ml-auto text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Account section */}
              {session ? (
                <>
                  <div className="border-t border-[var(--color-line)] pt-2 mt-2">
                    <p className="px-3 pt-1 pb-1 eyebrow">
                      {t("nav.myAccount")} - {t("nav.iAmA")}
                    </p>
                    <Link
                      href="/dashboard/seeker"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                    >
                      <svg className="w-5 h-5 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {t("nav.seeker")}
                    </Link>
                    <Link
                      href="/dashboard/owner"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                    >
                      <svg className="w-5 h-5 text-[var(--color-ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {t("nav.owner")}
                    </Link>
                    <Link
                      href="/account/settings"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-surface-sunk)] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                  className="block mt-2 px-4 py-2.5 rounded-full text-sm font-semibold text-center bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-500)] transition-colors"
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
