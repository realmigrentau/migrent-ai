import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import MegaNavbar from "./ui/mega-navbar";
import SupportWidget from "./support/SupportWidget";
import BackendStatusBanner from "./BackendStatusBanner";
import { Logo } from "./ui/Logo";

const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { t } = useTranslation();

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "/mazda.asgt22779412.sara-admin";
  const isAdminRoute = router.pathname.startsWith(adminPath);
  const isHomePage = router.pathname === "/";
  const isDashboard = router.pathname.startsWith("/dashboard");
  const isPricing = router.pathname === "/pricing";
  const isFullWidth = isAdminRoute || isHomePage || isPricing;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-ink)]">
      {/* Only load smooth scroll on marketing pages, skip on dashboard for speed */}
      {!isDashboard && !isAdminRoute && <SmoothScroll />}

      {/* Backend status banner - sits above the nav when API is unreachable */}
      <BackendStatusBanner />

      {/* Sticky navbar */}
      <MegaNavbar />

      {/* Spacer for floating navbar */}
      <div className="h-20" />

      {/* Page content */}
      <main className={`flex-1 ${isFullWidth ? "w-full" : "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface-sunk)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5 group mb-5 text-[var(--color-ink)]">
                <Logo size={28} />
                <span className="font-serif text-[22px] leading-none tracking-[-0.012em]">
                  MigRent
                </span>
                <span className="eyebrow ml-0.5 mt-0.5">AU</span>
              </Link>
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed mb-4 max-w-xs">
                {t("footer.tagline")}
              </p>
              <p className="text-xs text-[var(--color-ink-3)] font-mono">
                ABN 22 669 566 941
              </p>
            </div>

            {/* Company */}
            <div>
              <h4 className="eyebrow mb-4">{t("footer.company")}</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">{t("footer.about")}</Link></li>
                <li><Link href="/careers" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">{t("footer.careers")}</Link></li>
                <li><Link href="/press" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">{t("footer.press")}</Link></li>
                <li><Link href="/for-owners" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">{t("footer.forOwners")}</Link></li>
                <li><Link href="/for-seekers" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">{t("footer.forSeekers")}</Link></li>
              </ul>
            </div>

            {/* Trust & Safety */}
            <div>
              <h4 className="eyebrow mb-4">{t("footer.trustSafety")}</h4>
              <ul className="space-y-3">
                <li><Link href="/safety-verification" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">{t("footer.safetyVerification")}</Link></li>
                <li><Link href="/rules-community-guidelines" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">{t("footer.communityGuidelines")}</Link></li>
                <li><Link href="/safety-reporting" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Safety &amp; Reporting</Link></li>
                <li><Link href="/anti-discrimination" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Fair Housing</Link></li>
                <li><Link href="/support-disputes" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Disputes</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="eyebrow mb-4">{t("footer.support")}</h4>
              <ul className="space-y-3">
                <li><Link href="/faq" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">{t("footer.faq")}</Link></li>
                <li><Link href="/contact" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">{t("footer.contact")}</Link></li>
                <li><Link href="/pricing" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">{t("footer.pricing")}</Link></li>
                <li><Link href="/rental-laws" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Rental Laws</Link></li>
                <li><Link href="/code-of-conduct" className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">STRA Code</Link></li>
              </ul>
            </div>
          </div>

          {/* Legal links */}
          <div className="mt-12 pt-8 border-t border-[var(--color-line)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-xs text-[var(--color-ink-3)]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link href="/terms-of-service" className="hover:text-[var(--color-ink)] transition-colors">{t("footer.termsOfService")}</Link>
                <Link href="/privacy-policy" className="hover:text-[var(--color-ink)] transition-colors">{t("footer.privacyPolicy")}</Link>
                <Link href="/disclaimer" className="hover:text-[var(--color-ink)] transition-colors">Disclaimer</Link>
                <Link href="/no-agency" className="hover:text-[var(--color-ink)] transition-colors">No Agency</Link>
                <Link href="/cookie-policy" className="hover:text-[var(--color-ink)] transition-colors">Cookies</Link>
                <Link href="/abn-terms" className="hover:text-[var(--color-ink)] transition-colors">ABN Details</Link>
                <Link href="/contact-legal" className="hover:text-[var(--color-ink)] transition-colors">Legal Contact</Link>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px]">AUD $</span>
                <span className="font-mono text-[11px]">English</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-xs text-[var(--color-ink-3)] font-mono">
                {t("footer.copyright", { year: new Date().getFullYear() })} ABN 22 669 566 941
              </p>
              <p className="text-xs text-[var(--color-ink-3)] max-w-lg leading-relaxed">
                {t("footer.disclaimer")}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Global support widget */}
      <SupportWidget />
    </div>
  );
}
