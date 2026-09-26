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

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { t } = useTranslation();

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "/admin";
  const isAdminRoute = router.pathname.startsWith(adminPath);
  const isHomePage = router.pathname === "/";
  const isDashboard = router.pathname.startsWith("/dashboard");
  const isPricing = router.pathname === "/pricing";
  const isMarketing = ["/for-seekers", "/for-owners", "/about", "/features"].includes(router.pathname);
  /* The Resources hubs lay out their own bands, including the deep-forest
     close, so they need the full width rather than the centred article
     container. Listed explicitly: /resources/rental-laws and
     /resources/roi-calculator are built for the narrow container and keep
     it. */
  const isResourceHub = [
    "/resources",
    "/resources/guides",
    "/resources/tools",
    "/resources/help",
  ].includes(router.pathname);
  const isFullWidth = isAdminRoute || isHomePage || isPricing || isMarketing || isResourceHub;

  return (
    /* data-home scopes styles/home.css: the homepage's tokens are taken from
       the cinematic hero, so the header, the page and the footer all re-tint
       together and no other route is touched. */
    <div
      data-home={isHomePage ? "" : undefined}
      className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-ink)]"
    >
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

      {/* The homepage opens on a full-bleed hero with its own navigation,
          so the site header waits until you have scrolled past it - the
          account and language controls are one screen away rather than
          gone, and focus brings the header in straight away. */}
      <MegaNavbar revealAfterVh={isHomePage ? 0.86 : 0} />

      {/* Room for the floating header: its 24px gap above the pill, the
          60px pill, and the status banner when there is one. The homepage
          hero sits under the header instead. */}
      {!isHomePage && <div className="site-nav-spacer" aria-hidden="true" />}

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
