import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | MigRent</title>
        <meta name="description" content="MigRent Privacy Policy - how we collect, use, and protect your data. Australian Privacy Principles and GDPR compliant." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                Privacy Policy
              </h1>
              <p className="text-sm text-[var(--color-ink-3)] mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Introduction */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">1. Introduction</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>MigRent (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at migrent.vercel.app.</p>
              <p>MigRent operates under ABN 22 669 566 941 in Australia. We comply with the Australian Privacy Act 1988 (Cth), the Australian Privacy Principles (APPs), and applicable GDPR provisions for users located in the European Economic Area (EEA).</p>
              <p>MigRent is an online introduction service only. We facilitate connections between room owners and accommodation seekers. We do not collect rent, bonds, or manage tenancy agreements.</p>
            </div>
          </section>

          {/* Data We Collect */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">2. Information We Collect</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>Email address (required for account creation)</li>
                  <li>Legal name and preferred name (collected during onboarding)</li>
                  <li>Residential address, suburb, city, and postcode</li>
                  <li>Phone number (validated for Australian numbers)</li>
                  <li>Profile information including bio, preferences, and role (seeker or owner)</li>
                  <li>Profile photo (if uploaded)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] mb-2">Listing &amp; Search Data</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>Property listing details (address, description, photos, pricing)</li>
                  <li>Search preferences and filters</li>
                  <li>Saved listings and wishlist items</li>
                  <li>Messages exchanged between users on the platform</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] mb-2">Verification Data</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>Identity verification status (pass/fail, not raw documents)</li>
                  <li>Visa status verification metadata</li>
                  <li>Verification completion timestamps</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] mb-2">Technical &amp; Usage Data</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>Device type, browser, and operating system</li>
                  <li>IP address and approximate location</li>
                  <li>Pages visited, features used, and session duration</li>
                  <li>Referral source and search terms</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] mb-2">Payment Data</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>Payment metadata (transaction ID, amount, date) via Stripe</li>
                  <li>We do not store full credit card numbers - all payment processing is handled by Stripe</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">3. How We Use Your Information</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li>To operate the MigRent platform and provide our matching services</li>
                <li>To create and manage your account</li>
                <li>To facilitate communication between seekers and owners</li>
                <li>To process platform fees via Stripe</li>
                <li>To send transactional emails via Resend (account confirmations, deal notifications, receipts)</li>
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
            <h2 className="text-lg font-bold text-[var(--color-ink)]">4. Third-Party Services</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>We use the following third-party services that may process your data:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-line)]">
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Service</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Purpose</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Data Shared</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)] dark:divide-[var(--color-line)]">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Supabase</td>
                      <td className="py-2.5 px-3">Database hosting &amp; authentication</td>
                      <td className="py-2.5 px-3">Account data, profile data</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Stripe</td>
                      <td className="py-2.5 px-3">Payment processing</td>
                      <td className="py-2.5 px-3">Payment metadata (no full card numbers)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Resend</td>
                      <td className="py-2.5 px-3">Transactional emails</td>
                      <td className="py-2.5 px-3">Email address, name</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Vercel</td>
                      <td className="py-2.5 px-3">Website hosting &amp; analytics</td>
                      <td className="py-2.5 px-3">Anonymous usage statistics</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">hCaptcha</td>
                      <td className="py-2.5 px-3">Bot prevention during sign-up</td>
                      <td className="py-2.5 px-3">Browser metadata</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>Each provider operates under their own privacy policy and we only share the minimum data necessary for them to provide their services.</p>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">5. Data Sharing with Other Users</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>When you use MigRent, certain profile information is visible to other users to facilitate connections:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Public profile:</strong> Preferred name, profile photo, bio, preferences, and verification status</li>
                <li><strong>Listing details:</strong> Property information, photos, pricing (for owners)</li>
                <li><strong>Messages:</strong> Content you send to other users via our messaging system</li>
              </ul>
              <p>Your legal name, residential address, email address, and phone number are <strong>not</strong> shared with other users unless you choose to share them directly.</p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">6. Data Retention</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>We retain your personal information according to the following schedule:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-line)]">
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Data Type</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)] dark:divide-[var(--color-line)]">
                    <tr>
                      <td className="py-2.5 px-3">Account and profile data</td>
                      <td className="py-2.5 px-3">While account is active + 30 days after deletion request</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Financial and transaction records</td>
                      <td className="py-2.5 px-3 font-medium">7 years (Australian tax law requirement)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Messages between users</td>
                      <td className="py-2.5 px-3">While both accounts are active + 90 days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Verification records</td>
                      <td className="py-2.5 px-3">While account is active + 12 months</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Anonymised analytics data</td>
                      <td className="py-2.5 px-3">Indefinitely (cannot identify you)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>If you delete your account, we will remove your personal data within 30 days, except where retention is required by law (e.g., financial records retained for 7 years for tax purposes under the Taxation Administration Act 1953).</p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">7. Your Rights</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Under the Australian Privacy Act and Australian Privacy Principles (APPs), you have the right to:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Access (APP 12)</strong> - Request a copy of the personal data we hold about you</li>
                <li><strong>Correction (APP 13)</strong> - Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion</strong> - Request deletion of your personal data (subject to legal retention requirements)</li>
                <li><strong>Complaint</strong> - Lodge a complaint with the Office of the Australian Information Commissioner (OAIC) if you believe we have breached the APPs</li>
              </ul>
              <p>To exercise any of these rights, contact us at <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a>. We will respond within 30 days.</p>
            </div>
          </section>

          {/* GDPR */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">8. GDPR Rights (EU/EEA Users)</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR). As MigRent serves migrants who may originate from EU/EEA countries, we extend these protections:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Right to Portability</strong> - Request your data in a machine-readable format (JSON or CSV)</li>
                <li><strong>Right to Erasure</strong> - Request deletion of all personal data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Right to Restrict Processing</strong> - Request that we limit how we use your data</li>
                <li><strong>Right to Object</strong> - Object to processing of your data for specific purposes</li>
                <li><strong>Right to Withdraw Consent</strong> - Withdraw consent at any time where processing is based on consent</li>
              </ul>
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-[var(--color-ink)] mb-2">Legal Basis for Processing (GDPR Article 6)</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li><strong>Contract:</strong> Processing necessary to provide our service (account, matching, messaging)</li>
                  <li><strong>Legitimate Interest:</strong> Fraud prevention, platform security, service improvement</li>
                  <li><strong>Legal Obligation:</strong> Tax record retention, regulatory compliance</li>
                  <li><strong>Consent:</strong> Marketing communications (you may withdraw at any time)</li>
                </ul>
              </div>
              <p>For GDPR requests, contact <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a> with the subject line &quot;GDPR Request.&quot; We will respond within 30 days. You may also lodge a complaint with your local EU data protection authority.</p>
            </div>
          </section>

          {/* Cookies */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">9. Cookies &amp; Tracking</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>We use essential cookies to maintain your session and preferences (such as dark mode and language). We use Vercel Analytics for anonymous usage statistics. We do not use advertising cookies or sell your data to advertisers.</p>
              <p>For more details, see our <Link href="/cookie-policy" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Cookie Policy</Link>.</p>
            </div>
          </section>

          {/* Security */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">10. Security</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>We implement industry-standard security measures including:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Encryption in transit (TLS/HTTPS) for all data transfers</li>
                <li>Secure authentication via Supabase Auth with hCaptcha bot prevention</li>
                <li>Row Level Security (RLS) policies on all database tables</li>
                <li>Stripe PCI-DSS compliant payment processing</li>
                <li>Regular security reviews and access controls</li>
              </ul>
              <p>However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security. If you discover a vulnerability, please report it to <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a>.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">11. Contact Us</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>If you have questions about this Privacy Policy or wish to exercise your rights, contact us:</p>
              <div className="card-subtle p-4 rounded-xl space-y-1">
                <p className="font-semibold text-[var(--color-ink)]">MigRent - Privacy Inquiries</p>
                <p>ABN: 22 669 566 941</p>
                <p>Email: <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a></p>
                <p>Location: Sydney, Australia</p>
              </div>
              <p className="text-xs text-[var(--color-ink-3)]">You may also contact the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">www.oaic.gov.au</a> if you believe your privacy has been breached.</p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>This privacy policy is provided for informational purposes. MigRent recommends consulting a qualified privacy law professional for specific legal advice. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-primary-soft)] to-[var(--color-primary-soft)]/50 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary)]/5 border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] text-center">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Ready to get started?</h3>
            <p className="text-sm text-[var(--color-ink-2)] mb-4">Find safe, verified rooms across Australia.</p>
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
