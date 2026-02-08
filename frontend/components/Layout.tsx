import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rules", label: "Rules" },
  { href: "/about", label: "About" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { theme, toggle, mounted } = useTheme();
  const { session, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const isAdminRoute = router.pathname.startsWith("/mazda.asgt22779412.sara-admin");
  const isSignIn = router.pathname === "/signin";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky navbar */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${isSignIn ? "from-blue-500 to-blue-600" : "from-rose-500 to-rose-600"} flex items-center justify-center text-white font-black text-sm group-hover:scale-110 transition-transform`}>
              M
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Mig<span className={isSignIn ? "text-blue-500" : "text-rose-500"}>Rent</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => {
              const active = router.pathname === link.href;
              return (
                <>
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? "text-rose-500"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                      {active && (
                        <motion.div
                          layoutId="navIndicator"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-500 rounded-full"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                  {/* Dashboard link - after Home (index 0) */}
                  {index === 0 && session && (
                    <li key="dashboard">
                      <Link
                        href="/dashboard"
                        className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          router.pathname.startsWith("/dashboard")
                            ? "text-rose-500"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                        }`}
                      >
                        Dashboard
                        {router.pathname.startsWith("/dashboard") && (
                          <motion.div
                            layoutId="navIndicator"
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-500 rounded-full"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Link>
                    </li>
                  )}
                </>
              );
            })}

            {/* Theme toggle */}
            {mounted && (
              <li>
                <button
                  onClick={toggle}
                  className="ml-2 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
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
              </li>
            )}

            <li>
              {session ? (
                <div ref={accountRef} className="relative ml-2">
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:scale-105 transition-transform inline-flex items-center gap-1.5"
                  >
                    My Account
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
                        <p className="px-4 pt-3 pb-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                          I am a...
                        </p>
                        <Link
                          href="/dashboard/seeker"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Seeker
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">Find a room</span>
                        </Link>
                        <Link
                          href="/dashboard/owner"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        >
                          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Owner
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">List a room</span>
                        </Link>
                        <div className="border-t border-slate-100 dark:border-slate-800">
                          <Link
                            href="/account/messages"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Messages
                          </Link>
                          <Link
                            href="/seeker/wishlist"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            Wishlist
                          </Link>
                          <Link
                            href="/account/settings"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/signup"
                  className={`ml-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${isSignIn ? "from-blue-500 to-blue-600" : "from-rose-500 to-rose-600"} text-white hover:scale-105 transition-transform inline-block`}
                >
                  Sign Up
                </Link>
              )}
            </li>
          </ul>

          {/* Mobile: toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && (
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400"
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
                className="block w-6 h-0.5 bg-slate-600 dark:bg-slate-300"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-6 h-0.5 bg-slate-600 dark:bg-slate-300"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="block w-6 h-0.5 bg-slate-600 dark:bg-slate-300"
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
              className="md:hidden overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link, index) => (
                  <>
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        router.pathname === link.href
                          ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                    {/* Dashboard link - after Home (index 0) */}
                    {index === 0 && session && (
                      <Link
                        key="dashboard"
                        href="/dashboard"
                        className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          router.pathname.startsWith("/dashboard")
                            ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        Dashboard
                      </Link>
                    )}
                  </>
                ))}
                {session ? (
                  <>
                    <p className="px-3 pt-3 pb-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                      My Account — I am a...
                    </p>
                    <Link
                      href="/dashboard/seeker"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                      <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Seeker
                    </Link>
                    <Link
                      href="/dashboard/owner"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Owner
                    </Link>
                    <Link
                      href="/account/settings"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/signup"
                    className={`block mt-2 px-4 py-2.5 rounded-full text-sm font-semibold text-center bg-gradient-to-r ${isSignIn ? "from-blue-500 to-blue-600" : "from-rose-500 to-rose-600"} text-white`}
                  >
                    Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer */}
      <div className="h-16" />

      {/* Page content */}
      <main className={`flex-1 ${isAdminRoute ? "w-full" : "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${isSignIn ? "from-blue-500 to-blue-600" : "from-rose-500 to-rose-600"} flex items-center justify-center text-white text-xs font-black`}>
                M
              </div>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">MigRent</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-lg">
              MigRent is a matching platform only. We are not a real estate agent or
              a party to any tenancy or licence agreements.
            </p>
            <div className="flex gap-4">
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs text-slate-400 dark:text-slate-500 ${isSignIn ? "hover:text-blue-500" : "hover:text-rose-500"} transition-colors`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-400 dark:text-slate-500 text-center space-y-1">
            <div>&copy; 2026 MigRent AI | ABN: 22 669 566 941</div>
            <div>migrentau@gmail.com</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
