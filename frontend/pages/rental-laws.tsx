import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function RentalLaws() {
  return (
    <>
      <Head>
        <title>Australian Rental Laws Guide | MigRent AI</title>
        <meta name="description" content="State-by-state guide to Australian rental laws, bond rules, and short-term rental accommodation regulations." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Australian <span className="gradient-text">Rental Laws</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Introduction */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">About This Guide</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>This guide provides a general overview of rental and short-term rental accommodation (STRA) laws across Australian states. It is for <strong>informational purposes only</strong> and does not constitute legal advice.</p>
              <p>MigRent is an online introduction service. Users are responsible for complying with all applicable laws in their state or territory. We strongly recommend seeking independent legal advice for your specific situation.</p>
            </div>
          </section>

          {/* State-by-State Table */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">State-by-State Overview</h2>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">State</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Bond Rules</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">STRA Days Limit</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Registration</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">NSW</td>
                    <td className="py-3 px-3">Max 4 weeks rent. Must lodge with NSW Fair Trading within 10 business days.</td>
                    <td className="py-3 px-3">180 days/year (Greater Sydney, unless host-present). Unlimited if host is present.</td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-medium">Required - NSW STRA Register</td>
                    <td className="py-3 px-3">
                      <a href="https://www.fairtrading.nsw.gov.au" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">NSW Fair Trading</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">VIC</td>
                    <td className="py-3 px-3">Max 4 weeks rent. Lodged with Residential Tenancies Bond Authority (RTBA).</td>
                    <td className="py-3 px-3">No statewide cap currently. Check local council rules.</td>
                    <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies by council</td>
                    <td className="py-3 px-3">
                      <a href="https://www.consumer.vic.gov.au" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">Consumer Affairs VIC</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">QLD</td>
                    <td className="py-3 px-3">Max 4 weeks rent. Lodged with Residential Tenancies Authority (RTA).</td>
                    <td className="py-3 px-3">No statewide cap. Some local government areas have restrictions.</td>
                    <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies by council</td>
                    <td className="py-3 px-3">
                      <a href="https://www.rta.qld.gov.au" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">RTA QLD</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">WA</td>
                    <td className="py-3 px-3">Max 4 weeks rent. Lodged with the Bond Administrator.</td>
                    <td className="py-3 px-3">No statewide cap. Check local planning scheme.</td>
                    <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies by council</td>
                    <td className="py-3 px-3">
                      <a href="https://www.consumerprotection.wa.gov.au" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">Consumer Protection WA</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">SA</td>
                    <td className="py-3 px-3">Max 4 weeks rent (6 weeks if rent exceeds $250/week). Lodged with Consumer and Business Services.</td>
                    <td className="py-3 px-3">No statewide cap. Check local council.</td>
                    <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies by council</td>
                    <td className="py-3 px-3">
                      <a href="https://www.cbs.sa.gov.au" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">CBS South Australia</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Key Concepts */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Key Concepts for Migrants</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Bond (Security Deposit)</h3>
                <p>A bond is a payment held as security against damage or unpaid rent. In all states, bonds must be lodged with a government authority - not held by the landlord. You are entitled to a full refund at the end of your tenancy if there is no damage or unpaid rent.</p>
              </div>
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Tenancy Agreement vs Licence</h3>
                <p>A formal tenancy agreement gives you stronger legal protections under residential tenancy law. A licence (common in share houses) may offer fewer protections. Understand which arrangement you are entering before committing.</p>
              </div>
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Short-Term Rental Accommodation (STRA)</h3>
                <p>STRA refers to accommodation rented for less than 3 consecutive months. NSW has specific regulations requiring registration and limiting the number of days per year. Other states have varying rules - always check your local council.</p>
              </div>
            </div>
          </section>

          {/* MigRent's Role */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">MigRent&apos;s Role</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent is an introduction service only. We do not:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Create or manage tenancy agreements on your behalf</li>
                <li>Collect, hold, or lodge bonds for any party</li>
                <li>Enforce rental laws or mediate tenancy disputes</li>
                <li>Provide legal advice about your specific rental situation</li>
              </ul>
              <p>Users are solely responsible for ensuring their arrangements comply with applicable state and territory laws.</p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            <p>This guide is for general informational purposes only and does not constitute legal advice. Laws change frequently. Always verify current regulations with your state&apos;s Fair Trading or Consumer Affairs office. MigRent recommends seeking independent legal advice. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-500/10 dark:to-indigo-600/5 border-indigo-200 dark:border-indigo-500/20 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Need more guidance?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Contact your state&apos;s Fair Trading office or reach out to us.</p>
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
