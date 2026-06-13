import { useRouter } from "next/router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import MegaNavbar from "./ui/mega-navbar";
import SupportWidget from "./support/SupportWidget";
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
      {/* Only load smooth scroll on marketing pages, skip on dashboard for speed */}
      {!isDashboard && !isAdminRoute && <SmoothScroll />}

      {/* Backend status banner - sits above the nav when API is unreachable */}
      <BackendStatusBanner />

      {/* Sticky navbar */}
      <MegaNavbar />

      {/* Spacer for sticky navbar */}
      <div className="h-[60px]" />

      {/* Page content */}
      <main className={`flex-1 ${isFullWidth ? "w-full" : "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}>
        {children}
      </main>

      {/* Footer */}
      <SiteFooter />

      {/* Global support widget */}
      <SupportWidget />
    </div>
  );
}
