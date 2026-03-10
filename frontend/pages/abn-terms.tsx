import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function AbnTerms() {
  return (
    <>
      <Head>
        <title>ABN &amp; Business Details | MigRent AI</title>
        <meta name="description" content="MigRent AI business details, ABN, fee structure, and payment terms." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                ABN &amp; <span className="gradient-text">Business Details</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Business Details */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Business Information</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 w-1/3">Business Name</td>
                      <td className="py-3 px-3">MigRent AI</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">ABN</td>
                      <td className="py-3 px-3 font-mono">22 669 566 941</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Entity Type</td>
                      <td className="py-3 px-3">Sole Trader</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">GST Registered</td>
                      <td className="py-3 px-3">No (below GST threshold)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Location</td>
                      <td className="py-3 px-3">Sydney, New South Wales, Australia</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Website</td>
                      <td className="py-3 px-3">migrent-ai.vercel.app</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Contact Email</td>
                      <td className="py-3 px-3"><a href="mailto:migrentau@gmail.com" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">migrentau@gmail.com</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Nature of Business */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nature of Business</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent AI operates as an <strong>online introduction service</strong> for accommodation. We are:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>A technology platform that connects room owners with accommodation seekers</li>
                <li>An AI-powered matching service for short- to medium-term rooms</li>
                <li>A facilitator of introductions - not a real estate agent or property manager</li>
              </ul>
              <p>We do not hold a real estate licence, as we do not perform real estate agent activities (see <Link href="/no-agency" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">No Agency Disclosure</Link>). We do not collect rent, bonds, or manage tenancy agreements.</p>
            </div>
          </section>

          {/* Fee Structure */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Fee Structure</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent charges flat platform fees only. We do not take a percentage of rent or any ongoing commissions.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Fee</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Amount</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Who Pays</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Deal Confirmation Fee</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">AUD $99</td>
                      <td className="py-2.5 px-3">Owner</td>
                      <td className="py-2.5 px-3">Per successful match / deal</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Verification Fee (optional)</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">AUD $19</td>
                      <td className="py-2.5 px-3">Seeker</td>
                      <td className="py-2.5 px-3">One-time, optional</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Account creation</td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Free</td>
                      <td className="py-2.5 px-3">All users</td>
                      <td className="py-2.5 px-3">-</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Browsing and searching</td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Free</td>
                      <td className="py-2.5 px-3">All users</td>
                      <td className="py-2.5 px-3">-</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Messaging</td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Free</td>
                      <td className="py-2.5 px-3">All users</td>
                      <td className="py-2.5 px-3">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment Terms</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <ul className="list-disc list-inside space-y-1.5">
                <li>All payments are processed securely via <strong>Stripe</strong></li>
                <li>Accepted payment methods: Visa, Mastercard, American Express (via Stripe)</li>
                <li>All prices are in <strong>Australian Dollars (AUD)</strong> and include GST where applicable</li>
                <li>Stripe receipts are emailed automatically after payment</li>
                <li>Platform fees are generally <strong>non-refundable</strong> once a deal is confirmed (see <Link href="/terms-of-service" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">Terms of Service</Link> section 6)</li>
                <li>MigRent does not store full credit card details - all payment data is handled by Stripe</li>
              </ul>
            </div>
          </section>

          {/* GST Note */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">GST Information</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent AI is currently not registered for GST as annual turnover is below the $75,000 threshold. If and when MigRent becomes GST registered, fees will be updated to include GST and tax invoices will be provided.</p>
            </div>
          </section>

          {/* ABN Lookup */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verify Our ABN</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>You can verify MigRent&apos;s ABN on the Australian Business Register:</p>
              <a href="https://abr.business.gov.au" target="_blank" rel="noopener noreferrer" className="inline-block text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">abr.business.gov.au</a>
              <p>Search for ABN: <span className="font-mono font-semibold">22 669 566 941</span></p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            <p>For full terms governing your use of MigRent, see our <Link href="/terms-of-service" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">Terms of Service</Link>. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-500/10 dark:to-slate-600/5 border-slate-200 dark:border-slate-500/20 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Business enquiries?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Get in touch with our team.</p>
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
