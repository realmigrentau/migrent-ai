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

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "/admin";
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

      {/* Spacer for sticky navbar */}
      <div className="h-[60px]" />

      {/* Page content */}
      <main className={`flex-1 ${isFullWidth ? "w-full" : "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface-sunk)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-14 pt-12 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-8">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-3 text-[var(--color-ink)]">
                <Logo size={28} />
                <span className="font-serif text-[24px] leading-none tracking-[-0.012em]">
                  MigRent
                </span>
              </Link>
              <p className="text-[13px] text-[var(--color-ink-2)] leading-[1.5] max-w-[280px]">
                Made in Naarm / Melbourne. For everyone who&apos;s renting in Australia for the first time.
              </p>
            </div>

            {/* Renters */}
            <div>
              <h4 className="eyebrow mb-2.5">Renters</h4>
              <ul className="space-y-1.5">
                <li><Link href="/seeker/search" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Search</Link></li>
                <li><Link href="/for-seekers" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">How it works</Link></li>
                <li><Link href="/guides" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Guides</Link></li>
                <li><Link href="/rental-laws" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Tenant rights</Link></li>
              </ul>
            </div>

            {/* Hosts */}
            <div>
              <h4 className="eyebrow mb-2.5">Hosts</h4>
              <ul className="space-y-1.5">
                <li><Link href="/for-owners" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">List a room</Link></li>
                <li><Link href="/safety-verification" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Verification</Link></li>
                <li><Link href="/pricing" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Pricing</Link></li>
                <li><Link href="/become-mentor" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Become a mentor</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="eyebrow mb-2.5">Company</h4>
              <ul className="space-y-1.5">
                <li><Link href="/about" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">About</Link></li>
                <li><Link href="/press" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Press</Link></li>
                <li><Link href="/careers" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="eyebrow mb-2.5">Legal</h4>
              <ul className="space-y-1.5">
                <li><Link href="/terms-of-service" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Terms</Link></li>
                <li><Link href="/privacy-policy" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Privacy</Link></li>
                <li><Link href="/safety-reporting" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Bond protection</Link></li>
                <li><Link href="/code-of-conduct" className="text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">Code of conduct</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-5 mt-8 border-t border-[var(--color-line)]">
            <div className="font-mono text-[11.5px] text-[var(--color-ink-3)] uppercase tracking-[0.02em]">
              © {new Date().getFullYear()} MIGRENT PTY LTD · ABN 22 669 566 941
            </div>
            <div className="flex items-center gap-4 text-[11.5px] text-[var(--color-ink-3)]">
              <span>Australia (English)</span>
              <span>AUD $</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global support widget */}
      <SupportWidget />
    </div>
  );
}
