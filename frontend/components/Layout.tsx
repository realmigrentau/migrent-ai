import { useRouter } from "next/router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import MegaNavbar from "./ui/mega-navbar";

// The support widget is not needed for first paint on any page; load it
// after the page is interactive.
const SupportWidget = dynamic(() => import("./support/SupportWidget"), { ssr: false });
import BackendStatusBanner from "./BackendStatusBanner";
import SiteFooter from "./SiteFooter";

const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });

/** Routes built from the public-site kit (components/site): full width, and
 *  they draw their own sky under the floating header. */
const SITE_KIT = [
  "/", "/how-renting-works", "/for-owners", "/pricing", "/help", "/guides", "/blog", "/legal", "/about", "/contact",
  "/terms-of-service", "/privacy-policy", "/cookie-policy", "/disclaimer", "/abn-terms", "/anti-discrimination",
  "/rules-community-guidelines", "/code-of-conduct", "/safety-reporting", "/support-disputes", "/contact-legal",
  // One-message pages (components/site/StatusPage)
  "/404", "/500", "/_error", "/booking-success", "/booking-cancelled", "/verification-success", "/verification-cancelled",
  "/mentor-session-success", "/unsubscribe",
  "/mentors", "/become-mentor", "/suburbs",
];
/** Full-width routes that sit below the header rather than drawing a sky. */
const LEGACY_FULL_WIDTH: string[] = ["/listing/[id]", "/mentor/[id]", "/suburb/[state]", "/suburb/[state]/[slug]"];

const matchesAny = (list: string[], path: string) => list.some((p) => path === p || (p !== "/" && path.startsWith(`${p}/`)));

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { t } = useTranslation();

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "/admin";
  const isAdminRoute = router.pathname.startsWith(adminPath);
  const isDashboard = router.pathname.startsWith("/dashboard");
  /* Pages built from components/site lay out their own full-width sections
     (the sky at the top, the closing card at the bottom), so they skip the
     centred container. Everything else still gets it. */
  const drawsOwnSky = matchesAny(SITE_KIT, router.pathname);
  const isFullWidth = isAdminRoute || drawsOwnSky || LEGACY_FULL_WIDTH.includes(router.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-ink)]">
      {/* Keyboard users land here first. Visible on focus only. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-primary)] focus:text-[color:var(--color-primary-fg)] focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Only load smooth scroll on marketing pages, skip on dashboard for speed */}
      {!isDashboard && !isAdminRoute && <SmoothScroll />}

      {/* Backend status banner - sits above the nav when API is unreachable */}
      <BackendStatusBanner />

      {/* The same floating header on every page, the homepage included. */}
      <MegaNavbar />

      {/* Room for the floating header: its 24px gap above the pill, the
          60px pill, and the status banner when there is one. Full-width
          pages draw their own sky under the header instead. */}
      {!drawsOwnSky && <div className="site-nav-spacer" aria-hidden="true" />}

      {/* Page content */}
      <main id="main-content" tabIndex={-1} className={`flex-1 outline-none ${isFullWidth ? "w-full" : "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}>
        {children}
      </main>

      {/* Footer */}
      <SiteFooter />

      {/* Global support widget */}
      <SupportWidget />
    </div>
  );
}
