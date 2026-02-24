import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import MegaNavbar from "./ui/mega-navbar";
import SupportWidget from "./support/SupportWidget";
import SmoothScroll from "./SmoothScroll";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { t } = useTranslation();

  const isAdminRoute = router.pathname.startsWith("/mazda.asgt22779412.sara-admin");
  const isHomePage = router.pathname === "/";
  const isFullWidth = isAdminRoute || isHomePage;

  return (
    <div className="min-h-screen flex flex-col">
      <SmoothScroll />

      {/* Sticky navbar */}
      <MegaNavbar />

      {/* Spacer for floating navbar */}
      <div className="h-20" />

      {/* Page content */}
      <main className={`flex-1 ${isFullWidth ? "w-full" : "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 group mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white font-black text-sm group-hover:scale-110 transition-transform">
                  M
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Mig<span className="text-rose-500">Rent</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {t("footer.tagline")}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                ABN: 22 669 566 941
              </p>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">{t("footer.company")}</h4>
              <ul className="space-y-2.5">
                <li><Link href="/about" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.about")}</Link></li>
                <li><Link href="/careers" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.careers")}</Link></li>
                <li><Link href="/press" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.press")}</Link></li>
                <li><Link href="/for-owners" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.forOwners")}</Link></li>
                <li><Link href="/for-seekers" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.forSeekers")}</Link></li>
              </ul>
            </div>

            {/* Trust & Safety */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">{t("footer.trustSafety")}</h4>
              <ul className="space-y-2.5">
                <li><Link href="/safety-verification" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.safetyVerification")}</Link></li>
                <li><Link href="/rules-community-guidelines" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.communityGuidelines")}</Link></li>
                <li><Link href="/privacy-policy" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.privacyPolicy")}</Link></li>
                <li><Link href="/terms-of-service" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.termsOfService")}</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">{t("footer.support")}</h4>
              <ul className="space-y-2.5">
                <li><Link href="/faq" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.faq")}</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.contact")}</Link></li>
                <li><Link href="/pricing" className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">{t("footer.pricing")}</Link></li>
              </ul>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                migrentau@gmail.com
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-md">
              MigRent is a matching platform only. We are not a real estate agent or a party to any tenancy or licence agreements.
            </p>
          </div>
        </div>
      </footer>

      {/* Global support widget */}
      <SupportWidget />
    </div>
  );
}
