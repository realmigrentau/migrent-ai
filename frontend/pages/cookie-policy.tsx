import Link from "next/link";
import SEOHead from "../components/SEOHead";
import LegalLayout from "../components/site/LegalLayout";

export default function CookiePolicy() {
  return (
    <>
      <SEOHead title="Cookie Policy" description="Migrent Cookie Policy - what cookies we use, why, and how to manage them." />

      <LegalLayout title="Cookie Policy" note="Last updated: March 2026">

        <div className="space-y-8">
          {/* Introduction */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">What Are Cookies?</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience. Migrent uses a minimal set of cookies - we do not use advertising or tracking cookies.</p>
            </div>
          </section>

          {/* Cookies We Use */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Cookies We Use</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[540px]">
                  <thead>
                    <tr className="border-b-2 border-[var(--color-line)]">
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Cookie</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Type</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Purpose</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)] dark:divide-[var(--color-line)]">
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-xs">sb-*-auth-token</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/20 text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium">Essential</span></td>
                      <td className="py-2.5 px-3">Supabase authentication session</td>
                      <td className="py-2.5 px-3">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-xs">theme</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/20 text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium">Essential</span></td>
                      <td className="py-2.5 px-3">Dark mode / light mode preference</td>
                      <td className="py-2.5 px-3">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-xs">i18nextLng</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/20 text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium">Essential</span></td>
                      <td className="py-2.5 px-3">Language preference</td>
                      <td className="py-2.5 px-3">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-xs">migrent_session_cache</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/20 text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium">Essential</span></td>
                      <td className="py-2.5 px-3">Cached session for faster page loads</td>
                      <td className="py-2.5 px-3">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-xs">va (Vercel)</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary)]/20 text-[var(--color-primary)] dark:text-[var(--color-primary)] text-xs font-medium">Analytics</span></td>
                      <td className="py-2.5 px-3">Anonymous page view tracking (Vercel Analytics)</td>
                      <td className="py-2.5 px-3">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* What We Don't Use */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">What We Do NOT Use</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Advertising cookies:</strong> We do not serve ads or use advertising tracking</li>
                <li><strong>Third-party tracking:</strong> We do not share data with ad networks (Google Ads, Facebook Pixel, etc.)</li>
                <li><strong>Cross-site tracking:</strong> We do not track your activity on other websites</li>
                <li><strong>User profiling cookies:</strong> We do not build profiles for targeted advertising</li>
              </ul>
              <p>Migrent does not sell your data to advertisers or any third parties.</p>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Managing Cookies</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>You can manage cookies through your browser settings:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Block all cookies:</strong> This will prevent Migrent from remembering your login session and preferences</li>
                <li><strong>Delete cookies:</strong> You can clear cookies at any time, but you will need to log in again</li>
                <li><strong>Block third-party cookies:</strong> This will block analytics cookies but essential cookies will still work</li>
              </ul>
              <p>Note: Blocking essential cookies will prevent you from logging in or using core features of Migrent.</p>
            </div>
          </section>

          {/* Local Storage */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Local Storage</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>In addition to cookies, Migrent uses browser local storage for:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Session cache (faster loading on return visits)</li>
                <li>Theme preference (dark/light mode)</li>
                <li>Language preference</li>
              </ul>
              <p>Local storage data stays on your device and is not sent to our servers with each request. You can clear it through your browser&apos;s developer tools or settings.</p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>For more information about how we handle your data, see our <Link href="/privacy-policy" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Privacy Policy</Link>. Last reviewed: March 2026.</p>
          </div>

        </div>
      </LegalLayout>
    </>
  );
}
