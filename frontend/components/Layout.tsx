import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import MegaNavbar from "./ui/mega-navbar";
import SupportWidget from "./support/SupportWidget";

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
    <div className="min-h-screen flex flex-col">
      {/* Only load smooth scroll on marketing pages, skip on dashboard for speed */}
      {!isDashboard && !isAdminRoute && <SmoothScroll />}

      {/* Sticky navbar */}
      <MegaNavbar />

      {/* Spacer for floating navbar */}
      <div className="h-20" />

      {/* Page content */}
      <main className={`flex-1 ${isFullWidth ? "w-full" : "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 group mb-5">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-105">
                  M
                </div>
                <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  Mig<span className="text-rose-600">Rent</span>
                </span>
              </Link>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 max-w-xs">
                {t("footer.tagline")}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                ABN: 22 669 566 941
              </p>
            </div>

            {/* Company */}
            <div>
              <h4 className="eyebrow mb-4">{t("footer.company")}</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.about")}</Link></li>
                <li><Link href="/careers" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.careers")}</Link></li>
                <li><Link href="/press" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.press")}</Link></li>
                <li><Link href="/for-owners" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.forOwners")}</Link></li>
                <li><Link href="/for-seekers" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.forSeekers")}</Link></li>
              </ul>
            </div>

            {/* Trust & Safety */}
            <div>
              <h4 className="eyebrow mb-4">{t("footer.trustSafety")}</h4>
              <ul className="space-y-3">
                <li><Link href="/safety-verification" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.safetyVerification")}</Link></li>
                <li><Link href="/rules-community-guidelines" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.communityGuidelines")}</Link></li>
                <li><Link href="/safety-reporting" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Safety &amp; Reporting</Link></li>
                <li><Link href="/anti-discrimination" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Fair Housing</Link></li>
                <li><Link href="/support-disputes" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Disputes</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="eyebrow mb-4">{t("footer.support")}</h4>
              <ul className="space-y-3">
                <li><Link href="/faq" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.faq")}</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.contact")}</Link></li>
                <li><Link href="/pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.pricing")}</Link></li>
                <li><Link href="/rental-laws" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Rental Laws</Link></li>
                <li><Link href="/code-of-conduct" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">STRA Code</Link></li>
              </ul>
            </div>
          </div>

          {/* Legal links */}
          <div className="mt-12 pt-8 border-t border-slate-200/70 dark:border-slate-800/70 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-500">
              <Link href="/terms-of-service" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.termsOfService")}</Link>
              <Link href="/privacy-policy" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("footer.privacyPolicy")}</Link>
              <Link href="/disclaimer" className="hover:text-slate-900 dark:hover:text-white transition-colors">Disclaimer</Link>
              <Link href="/no-agency" className="hover:text-slate-900 dark:hover:text-white transition-colors">No Agency</Link>
              <Link href="/cookie-policy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookies</Link>
              <Link href="/abn-terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">ABN Details</Link>
              <Link href="/contact-legal" className="hover:text-slate-900 dark:hover:text-white transition-colors">Legal Contact</Link>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {t("footer.copyright", { year: new Date().getFullYear() })} ABN: 22 669 566 941.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600 max-w-lg leading-relaxed">
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
