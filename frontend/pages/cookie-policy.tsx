import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function CookiePolicy() {
  return (
    <>
      <Head>
        <title>Cookie Policy | MigRent AI</title>
        <meta name="description" content="MigRent AI Cookie Policy - what cookies we use, why, and how to manage them." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Cookie Policy
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Introduction */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">What Are Cookies?</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience. MigRent uses a minimal set of cookies - we do not use advertising or tracking cookies.</p>
            </div>
          </section>

          {/* Cookies We Use */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cookies We Use</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[540px]">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Cookie</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Type</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Purpose</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-xs">sb-*-auth-token</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20 text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium">Essential</span></td>
                      <td className="py-2.5 px-3">Supabase authentication session</td>
                      <td className="py-2.5 px-3">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-xs">theme</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20 text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium">Essential</span></td>
                      <td className="py-2.5 px-3">Dark mode / light mode preference</td>
                      <td className="py-2.5 px-3">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-xs">i18nextLng</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20 text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium">Essential</span></td>
                      <td className="py-2.5 px-3">Language preference</td>
                      <td className="py-2.5 px-3">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-xs">migrent_session_cache</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20 text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium">Essential</span></td>
                      <td className="py-2.5 px-3">Cached session for faster page loads</td>
                      <td className="py-2.5 px-3">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-xs">va (Vercel)</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">Analytics</span></td>
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
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">What We Do NOT Use</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Advertising cookies:</strong> We do not serve ads or use advertising tracking</li>
                <li><strong>Third-party tracking:</strong> We do not share data with ad networks (Google Ads, Facebook Pixel, etc.)</li>
                <li><strong>Cross-site tracking:</strong> We do not track your activity on other websites</li>
                <li><strong>User profiling cookies:</strong> We do not build profiles for targeted advertising</li>
              </ul>
              <p>MigRent does not sell your data to advertisers or any third parties.</p>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Managing Cookies</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>You can manage cookies through your browser settings:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Block all cookies:</strong> This will prevent MigRent from remembering your login session and preferences</li>
                <li><strong>Delete cookies:</strong> You can clear cookies at any time, but you will need to log in again</li>
                <li><strong>Block third-party cookies:</strong> This will block analytics cookies but essential cookies will still work</li>
              </ul>
              <p>Note: Blocking essential cookies will prevent you from logging in or using core features of MigRent.</p>
            </div>
          </section>

          {/* Local Storage */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Local Storage</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>In addition to cookies, MigRent uses browser local storage for:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Session cache (faster loading on return visits)</li>
                <li>Theme preference (dark/light mode)</li>
                <li>Language preference</li>
              </ul>
              <p>Local storage data stays on your device and is not sent to our servers with each request. You can clear it through your browser&apos;s developer tools or settings.</p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            <p>For more information about how we handle your data, see our <Link href="/privacy-policy" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Privacy Policy</Link>. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-500/10 dark:to-orange-600/5 border-orange-200 dark:border-orange-500/20 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Questions about cookies?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">We&apos;re happy to explain our data practices.</p>
            <Link href="/contact">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                Contact Us
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
