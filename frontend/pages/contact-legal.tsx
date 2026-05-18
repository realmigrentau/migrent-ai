import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function ContactLegal() {
  return (
    <>
      <Head>
        <title>Legal Contact &amp; Arbitration | MigRent AI</title>
        <meta name="description" content="Contact MigRent AI for legal inquiries, arbitration details, and governing law information." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Legal Contact &amp; Arbitration
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Contact Details */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Legal Contact Information</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>For legal inquiries, formal notices, or arbitration-related correspondence, contact:</p>
              <div className="card-subtle p-4 rounded-xl space-y-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-base">MigRent AI - Legal</p>
                <p><strong>ABN:</strong> 22 669 566 941</p>
                <p><strong>Email:</strong> <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a></p>
                <p><strong>Subject line for legal matters:</strong> &quot;Legal Notice&quot; or &quot;Arbitration&quot;</p>
                <p><strong>Location:</strong> Sydney, New South Wales, Australia</p>
              </div>
              <p>We aim to acknowledge legal correspondence within 5 business days.</p>
            </div>
          </section>

          {/* Types of Legal Inquiries */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Types of Legal Inquiries</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Use the following subject lines for faster routing:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Type</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Subject Line</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Response Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-2.5 px-3">Privacy / data requests (GDPR, APPs)</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Privacy Request&quot;</td>
                      <td className="py-2.5 px-3">30 days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Formal legal notice</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Legal Notice&quot;</td>
                      <td className="py-2.5 px-3">5 business days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Arbitration commencement</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Arbitration&quot;</td>
                      <td className="py-2.5 px-3">5 business days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Discrimination report</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Discrimination Report&quot;</td>
                      <td className="py-2.5 px-3">48 hours</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Copyright / DMCA takedown</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Copyright Notice&quot;</td>
                      <td className="py-2.5 px-3">5 business days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">General legal question</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Legal Inquiry&quot;</td>
                      <td className="py-2.5 px-3">10 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Governing Law</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>All legal matters relating to MigRent AI are governed by:</p>
              <div className="card-subtle p-4 rounded-xl space-y-2">
                <p><strong className="text-slate-800 dark:text-slate-200">Governing law:</strong> Laws of New South Wales, Australia</p>
                <p><strong className="text-slate-800 dark:text-slate-200">Jurisdiction:</strong> Courts of New South Wales (subject to arbitration clause)</p>
                <p><strong className="text-slate-800 dark:text-slate-200">Applicable legislation:</strong> Australian Consumer Law, Privacy Act 1988 (Cth), Anti-Discrimination Act 1977 (NSW), and applicable state tenancy legislation</p>
              </div>
            </div>
          </section>

          {/* Arbitration */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Arbitration Process</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>As set out in our <Link href="/terms-of-service" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Terms of Service</Link> (section 13) and <Link href="/support-disputes" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Dispute Resolution</Link> page, disputes that cannot be resolved through direct communication or MigRent mediation are subject to binding arbitration.</p>
              <div className="card-subtle p-4 rounded-xl space-y-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Arbitration Details</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li><strong>Administering body:</strong> Australian Centre for International Commercial Arbitration (ACICA)</li>
                  <li><strong>Rules:</strong> ACICA Arbitration Rules</li>
                  <li><strong>Seat:</strong> Sydney, New South Wales, Australia</li>
                  <li><strong>Language:</strong> English</li>
                  <li><strong>Number of arbitrators:</strong> One (1)</li>
                  <li><strong>Decision:</strong> Final and binding on both parties</li>
                  <li><strong>Costs:</strong> Each party bears their own costs unless the arbitrator orders otherwise</li>
                </ul>
              </div>
              <p>Before commencing arbitration, parties must have completed Steps 1 and 2 of the dispute resolution process (direct resolution and MigRent mediation). See <Link href="/support-disputes" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">full dispute resolution process</Link>.</p>
            </div>
          </section>

          {/* About ACICA */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">About ACICA</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>The Australian Centre for International Commercial Arbitration (ACICA) is Australia&apos;s leading international arbitration institution. It provides neutral, efficient, and cost-effective dispute resolution services.</p>
              <p>For more information about ACICA and its rules, visit <a href="https://acica.org.au" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">acica.org.au</a>.</p>
            </div>
          </section>

          {/* Legal Documents */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Our Legal Documents</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>For reference, our complete legal documentation:</p>
              <ul className="space-y-2">
                <li><Link href="/terms-of-service" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/disclaimer" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Platform Disclaimer</Link></li>
                <li><Link href="/no-agency" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">No Agency Disclosure</Link></li>
                <li><Link href="/anti-discrimination" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Fair Housing Policy</Link></li>
                <li><Link href="/cookie-policy" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Cookie Policy</Link></li>
                <li><Link href="/abn-terms" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">ABN &amp; Business Details</Link></li>
              </ul>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            <p>MigRent does not provide legal advice. For legal matters, seek independent advice from a qualified Australian lawyer. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-[var(--color-primary-soft)] from-cyan-50 to-cyan-100/50 dark:from-cyan-500/10 dark:to-cyan-600/5 border-cyan-200 dark:border-cyan-500/20 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Need to reach our legal team?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Email us with the appropriate subject line for faster routing.</p>
            <a href="mailto:migrentau@gmail.com?subject=Legal%20Inquiry">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                Email Legal Team
              </motion.span>
            </a>
          </div>
        </motion.div>
      </div>
    </>
  );
}
