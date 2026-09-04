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
  const isFullWidth = isAdminRoute || isHomePage || isPricing || isMarketing;

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

      {/* Sticky navbar */}
      {/* The homepage opens on a full-bleed hero with its own floating
          navigation, so the site header waits until you have scrolled past
          it - the account, language and theme controls are one screen away
          rather than gone. */}
      <MegaNavbar revealAfterVh={isHomePage ? 0.86 : 0} />

      {/* Spacer for sticky navbar - the hero sits under it on the homepage */}
      {!isHomePage && <div className="h-[60px]" />}

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
