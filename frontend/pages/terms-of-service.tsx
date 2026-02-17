import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service | MigRent AI</title>
        <meta name="description" content="MigRent AI Terms of Service - platform fees, cancellations, liability, and user responsibilities." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Terms of <span className="gradient-text">Service</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last updated: January 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Acceptance */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>By accessing or using MigRent AI (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use the Platform. MigRent AI is operated under ABN 22 669 566 941, based in Sydney, Australia.</p>
            </div>
          </section>

          {/* Platform Role */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Platform Role</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent AI is a matching platform only. We connect room owners with accommodation seekers for short- to medium-term rooms. We are not:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>A real estate agent, property manager, or letting agent</li>
                <li>A landlord or tenant</li>
                <li>A party to any tenancy, licence, or rental agreement</li>
                <li>A legal representative of any user</li>
              </ul>
              <p>All arrangements, agreements, and ongoing rent payments are between owners and seekers directly.</p>
            </div>
          </section>

          {/* Accounts */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. User Accounts</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>To use certain features, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be responsible for all activity under your account</li>
                <li>Notify us immediately of any unauthorised access</li>
                <li>Not create multiple accounts for deceptive purposes</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that violate these Terms or our <Link href="/rules-community-guidelines" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">Community Guidelines</Link>.</p>
            </div>
          </section>

          {/* Fees */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Platform Fees &amp; Payments</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Owner Fees</h3>
                <p>Owners agree to pay a one-time AUD $99 platform fee per successful match made through MigRent. This fee is charged at the time a deal is confirmed through the platform.</p>
              </div>
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Seeker Fees</h3>
                <p>Seekers may be presented with an optional one-time AUD $19 verification fee. This is always clearly disclosed before payment and is optional.</p>
              </div>
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-amber-500">
                <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Fee Circumvention</h3>
                <p>Users must not use MigRent to locate or contact another user and then intentionally complete the arrangement entirely outside the platform to avoid fees. Suspected circumvention may result in account suspension or termination.</p>
              </div>
              <p>All payments are processed securely through Stripe. MigRent does not store your full credit card details.</p>
            </div>
          </section>

          {/* Refunds */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Refund Policy</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Platform fees are generally non-refundable once a deal is confirmed and payment is processed. In exceptional circumstances, refunds may be considered at the sole discretion of MigRent AI.</p>
              <p>Stripe receipts are automatically sent to the email address associated with your account. For refund inquiries, contact <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">migrentau@gmail.com</a>.</p>
            </div>
          </section>

          {/* Listings */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Listings &amp; Content</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Users are solely responsible for the accuracy of all content they post, including listing descriptions, photos, pricing, and profile information. You agree not to post:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>False, misleading, or deceptive information</li>
                <li>Content that infringes third-party intellectual property rights</li>
                <li>Discriminatory, harassing, or offensive content</li>
                <li>Spam, scams, or commercial solicitations unrelated to accommodation</li>
              </ul>
              <p>MigRent reserves the right to remove any content that violates these Terms without prior notice.</p>
            </div>
          </section>

          {/* Liability */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">7. Limitation of Liability</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>To the maximum extent permitted by Australian law:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>MigRent does not verify or guarantee properties, users, or any outcomes</li>
                <li>MigRent is not liable for disputes between owners and seekers</li>
                <li>MigRent is not liable for any direct, indirect, incidental, or consequential damages arising from use of the platform</li>
                <li>Verification badges and match scores are informational tools only and do not constitute guarantees of safety or suitability</li>
              </ul>
              <p>Users are responsible for conducting their own due diligence before entering into any arrangement.</p>
            </div>
          </section>

          {/* Regulatory */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">8. Regulatory Compliance</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Users are responsible for complying with all applicable local, state, and federal laws, including but not limited to:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Short-term rental accommodation (STRA) regulations in NSW</li>
                <li>Anti-discrimination laws</li>
                <li>Residential tenancy laws</li>
                <li>Tax obligations</li>
              </ul>
              <p>MigRent does not provide legal advice and is not responsible for users&apos; regulatory compliance.</p>
            </div>
          </section>

          {/* Suspension */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">9. Suspension &amp; Termination</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent may suspend or terminate your account at any time for:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Breach of these Terms or Community Guidelines</li>
                <li>Suspected fraud or illegal activity</li>
                <li>Attempts to circumvent platform fees</li>
                <li>Behaviour that endangers other users or the platform</li>
              </ul>
              <p>You may delete your account at any time through your account settings. Upon deletion, your data will be handled in accordance with our <Link href="/privacy-policy" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">Privacy Policy</Link>.</p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">10. Governing Law</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>These Terms are governed by the laws of New South Wales, Australia. Any disputes will be subject to the exclusive jurisdiction of the courts of New South Wales.</p>
            </div>
          </section>

          {/* Changes */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">11. Changes to Terms</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>We may update these Terms from time to time. We will notify users of material changes via email or a notice on the platform. Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">12. Contact</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="card-subtle p-4 rounded-xl space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">MigRent AI</p>
                <p>ABN: 22 669 566 941</p>
                <p>Email: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">migrentau@gmail.com</a></p>
                <p>Location: Sydney, Australia</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-600/5 border-blue-200 dark:border-blue-500/20 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Questions about our terms?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Our team is happy to clarify anything.</p>
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
