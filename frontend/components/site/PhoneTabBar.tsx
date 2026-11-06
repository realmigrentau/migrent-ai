import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Home, LayoutGrid, LifeBuoy, Search, UserRound, type LucideIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useMounted } from "../../hooks/useMounted";
import { hubFromSite } from "../../lib/hub/routes";
import { useWishlist } from "../../lib/wishlist";
import { HELP_STATE_EVENT, openHelp } from "../../lib/helpPanel";

/**
 * The public site's tab bar on phones and tablets: the same floating glass
 * bar as Migrent Hub (.hub-tabbar in styles/hub.css), so the site and the
 * app it opens feel like one thing in the hand.
 *
 * Five places a thumb goes most: the homepage, search, saved homes, help
 * and the account. Everything else is still in the header's menu. The
 * Help tab opens the help panel, which is why the floating help button
 * steps aside wherever this bar is (styles/mobile.css).
 *
 * It hides while a field has focus, so it never rides on the keyboard,
 * and pages with their own bottom bar (a listing's price and Apply) leave
 * it out (components/Layout.tsx).
 */

type Tab = { key: string; label: string; icon: LucideIcon; href?: string; active: boolean; count?: number };

const isField = (el: EventTarget | null) =>
  el instanceof HTMLElement && el.matches("input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), textarea, select, [contenteditable='true']");

export default function PhoneTabBar() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { session: authSession } = useAuth();
  // Signed-out on the server and the first client pass, like the header.
  const mounted = useMounted();
  const session = mounted ? authSession : null;
  const saved = useWishlist();
  const [helpOpen, setHelpOpen] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onState = (e: Event) => setHelpOpen(Boolean((e as CustomEvent<{ open: boolean }>).detail?.open));
    window.addEventListener(HELP_STATE_EVENT, onState);
    return () => window.removeEventListener(HELP_STATE_EVENT, onState);
  }, []);

  useEffect(() => {
    const onIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onOut = () => setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  const path = router.pathname;
  const onSearch = path.startsWith("/seeker") || path.startsWith("/rooms");

  const tabs: Tab[] = [
    { key: "home", label: "Home", icon: Home, href: "/", active: path === "/" && !helpOpen },
    { key: "search", label: "Search", icon: Search, href: "/seeker/search", active: onSearch && !helpOpen },
    { key: "saved", label: "Saved", icon: Heart, href: hubFromSite.path("/saved"), active: false, count: session ? undefined : saved.size },
    { key: "help", label: "Help", icon: LifeBuoy, active: helpOpen || path.startsWith("/help") },
    session
      ? { key: "hub", label: "Hub", icon: LayoutGrid, href: hubFromSite.home(), active: false }
      : { key: "account", label: "Sign in", icon: UserRound, href: hubFromSite.signIn(router.asPath === "/" ? undefined : router.asPath), active: false },
  ];

  return (
    <nav aria-label="Quick links" className="hub-tabbar site-tabbar lg:hidden" data-hidden={typing ? "true" : undefined}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const inner = (
          <>
            {tab.active && (
              <motion.span
                layoutId="site-tab-active"
                aria-hidden
                className="absolute inset-0 rounded-[16px] bg-[var(--color-surface)] shadow-[0_0_0_1px_var(--color-line)]"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 42 }}
              />
            )}
            <span className="hub-nav-icon relative z-[1]">
              <Icon className="h-[21px] w-[21px]" strokeWidth={1.75} aria-hidden />
              {tab.count ? (
                <span className="hub-badge-dot -right-3 -top-1.5" aria-hidden>
                  {tab.count > 99 ? "99+" : tab.count}
                </span>
              ) : null}
            </span>
            <span className="relative z-[1]">{tab.label}</span>
          </>
        );
        const label = tab.count ? `${tab.label}, ${tab.count} saved` : tab.label;
        if (!tab.href) {
          return (
            <button
              key={tab.key}
              type="button"
              className="hub-tab hub-press"
              aria-label={label}
              aria-expanded={helpOpen}
              onClick={() => openHelp(!helpOpen)}
            >
              {inner}
            </button>
          );
        }
        return (
          <Link key={tab.key} href={tab.href} className="hub-tab hub-press" aria-label={label} aria-current={tab.active ? "page" : undefined}>
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
