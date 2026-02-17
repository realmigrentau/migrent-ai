import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | MigRent AI</title>
        <meta name="description" content="MigRent AI Privacy Policy - how we collect, use, and protect your data. GDPR and Australian Privacy Act compliant." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Privacy <span className="gradient-text">Policy</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last updated: January 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Introduction */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Introduction</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>
                MigRent AI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at migrent.au.
              </p>
              <p>
                MigRent AI operates under ABN 22 669 566 941 and is based in Sydney, Australia. We comply with the Australian Privacy Act 1988 (Cth), the Australian Privacy Principles (APPs), and applicable GDPR provisions for users located in the European Economic Area.
              </p>
            </div>
          </section>

          {/* Data We Collect */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Information We Collect</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>Email address (required for account creation)</li>
                  <li>Full name and preferred name (if provided)</li>
                  <li>Profile information including bio, preferences, and role (seeker or owner)</li>
                  <li>Profile photo (if uploaded)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Listing &amp; Search Data</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>Property listing details (address, description, photos, pricing)</li>
                  <li>Search preferences and filters</li>
                  <li>Saved listings and wishlist items</li>
                  <li>Messages exchanged between users on the platform</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Verification Data</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>Identity verification status (pass/fail, not raw documents)</li>
                  <li>Visa status verification metadata</li>
                  <li>Verification completion timestamps</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Technical &amp; Usage Data</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>Device type, browser, and operating system</li>
                  <li>IP address and approximate location</li>
                  <li>Pages visited, features used, and session duration</li>
                  <li>Referral source and search terms</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Payment Data</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>Payment metadata (transaction ID, amount, date) via Stripe</li>
                  <li>We do not store full credit card numbers &mdash; all payment processing is handled by Stripe</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">How We Use Your Information</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li>To operate the MigRent platform and provide our matching services</li>
                <li>To create and manage your account</li>
                <li>To facilitate communication between seekers and owners</li>
                <li>To process platform fees via Stripe</li>
                <li>To verify user identity and visa status through third-party providers</li>
                <li>To improve our AI matching algorithms and platform experience</li>
                <li>To send important service notifications (account, payment, safety)</li>
                <li>To detect and prevent fraud, abuse, or violations of our Terms</li>
                <li>To comply with legal obligations under Australian law</li>
              </ul>
            </div>
          </section>

          {/* Third Parties */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Third-Party Services</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>We use the following third-party services that may process your data:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Supabase</strong> &mdash; Database hosting and authentication</li>
                <li><strong>Stripe</strong> &mdash; Payment processing</li>
                <li><strong>Vercel</strong> &mdash; Website hosting and analytics</li>
                <li><strong>hCaptcha</strong> &mdash; Bot prevention during sign-up</li>
                <li><strong>Third-party verification providers</strong> &mdash; ID and visa checks</li>
              </ul>
              <p>Each provider operates under their own privacy policy and we only share the minimum data necessary for them to provide their services.</p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data Retention</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>We retain your personal information for as long as your account is active or as needed to provide services. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law (e.g., financial records for tax purposes).</p>
              <p>Anonymised or aggregated data that cannot identify you may be retained for analytics and platform improvement purposes.</p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Rights</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>Under the Australian Privacy Act and GDPR (where applicable), you have the right to:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Access</strong> &mdash; Request a copy of the personal data we hold about you</li>
                <li><strong>Correction</strong> &mdash; Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion</strong> &mdash; Request deletion of your personal data</li>
                <li><strong>Portability</strong> &mdash; Request your data in a machine-readable format</li>
                <li><strong>Objection</strong> &mdash; Object to processing of your data in certain circumstances</li>
                <li><strong>Withdraw consent</strong> &mdash; Withdraw consent at any time where processing is based on consent</li>
              </ul>
              <p>To exercise any of these rights, contact us at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">migrentau@gmail.com</a>.</p>
            </div>
          </section>

          {/* Cookies */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cookies &amp; Tracking</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>We use essential cookies to maintain your session and preferences (such as dark mode). We use Vercel Analytics for anonymous usage statistics. We do not use advertising cookies or sell your data to advertisers.</p>
            </div>
          </section>

          {/* Security */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>We implement industry-standard security measures including encryption in transit (TLS), secure authentication, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact Us</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>If you have questions about this Privacy Policy or wish to exercise your rights, contact us:</p>
              <div className="card-subtle p-4 rounded-xl space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">MigRent AI</p>
                <p>ABN: 22 669 566 941</p>
                <p>Email: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">migrentau@gmail.com</a></p>
                <p>Location: Sydney, Australia</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/10 dark:to-rose-600/5 border-rose-200 dark:border-rose-500/20 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ready to get started?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Join thousands of migrants finding rooms across Australia.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/signup">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                  Sign Up Free
                </motion.span>
              </Link>
              <Link href="/contact">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-secondary text-sm px-6 py-2.5 rounded-xl">
                  Contact Us
                </motion.span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
