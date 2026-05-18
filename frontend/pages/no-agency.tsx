import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function NoAgency() {
  return (
    <>
      <Head>
        <title>We Are Not Your Agent | MigRent AI</title>
        <meta name="description" content="MigRent AI is an online introduction service, not a real estate agent. Understand our facilitator model and your responsibilities." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10 border border-violet-100 dark:border-[var(--color-primary)]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                We Are Not Your Agent
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Key Statement */}
          <section className="card p-6 rounded-2xl space-y-3 border-l-4 border-l-violet-500">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">MigRent is a Facilitator, Not an Agent</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent AI operates as an <strong>online introduction service</strong> (similar to platforms like Flatmates.com.au). We are not a real estate agent, property manager, landlord, or letting agent. We do not hold a real estate licence and are not required to under Australian law.</p>
            </div>
          </section>

          {/* What We Do */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">What MigRent Does</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Provides an online platform where room owners can list available rooms</li>
                <li>Allows accommodation seekers to search and filter listings</li>
                <li>Uses AI matching to suggest compatible owner-seeker pairs</li>
                <li>Facilitates initial communication between users via messaging</li>
                <li>Charges flat platform fees ($99/deal for owners, $19 optional for seekers)</li>
              </ul>
            </div>
          </section>

          {/* What We Don't Do */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">What MigRent Does NOT Do</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Act as your agent, representative, or fiduciary in any capacity</li>
                <li>Negotiate rental terms, prices, or conditions on your behalf</li>
                <li>Inspect, verify, or certify properties</li>
                <li>Draft, execute, or enforce tenancy agreements or licences</li>
                <li>Collect, hold, or manage rent, bonds, or security deposits</li>
                <li>Manage properties or provide property management services</li>
                <li>Provide legal, financial, or tax advice</li>
                <li>Guarantee the suitability, safety, or legality of any arrangement</li>
              </ul>
            </div>
          </section>

          {/* Legal Basis */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Legal Basis</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Under the Property and Stock Agents Act 2002 (NSW) and equivalent legislation in other states, a real estate agent licence is required for persons who:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Negotiate the sale or lease of property on behalf of another person</li>
                <li>Collect rent or manage property on behalf of a landlord</li>
                <li>Act as a buyer&apos;s or tenant&apos;s agent in property transactions</li>
              </ul>
              <p>MigRent does none of the above. We are an online matching and introduction platform. Users make their own direct arrangements after being introduced through our service. No agency relationship is created between MigRent and any user.</p>
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Comparison: Introduction Service vs Agent</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-2 px-2 font-semibold text-slate-800 dark:text-slate-200">Activity</th>
                        <th className="text-center py-2 px-2 font-semibold text-slate-800 dark:text-slate-200">Agent</th>
                        <th className="text-center py-2 px-2 font-semibold text-[var(--color-accent)] dark:text-[var(--color-accent)]">MigRent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="py-2 px-2">Introduces parties</td>
                        <td className="py-2 px-2 text-center">Yes</td>
                        <td className="py-2 px-2 text-center text-[var(--color-accent)] font-medium">Yes</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">Negotiates terms on your behalf</td>
                        <td className="py-2 px-2 text-center">Yes</td>
                        <td className="py-2 px-2 text-center text-[var(--color-primary)] font-medium">No</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">Collects rent or bonds</td>
                        <td className="py-2 px-2 text-center">Yes</td>
                        <td className="py-2 px-2 text-center text-[var(--color-primary)] font-medium">No</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">Creates tenancy agreements</td>
                        <td className="py-2 px-2 text-center">Yes</td>
                        <td className="py-2 px-2 text-center text-[var(--color-primary)] font-medium">No</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">Manages property</td>
                        <td className="py-2 px-2 text-center">Yes</td>
                        <td className="py-2 px-2 text-center text-[var(--color-primary)] font-medium">No</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">Owes fiduciary duty</td>
                        <td className="py-2 px-2 text-center">Yes</td>
                        <td className="py-2 px-2 text-center text-[var(--color-primary)] font-medium">No</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">Requires licence</td>
                        <td className="py-2 px-2 text-center">Yes</td>
                        <td className="py-2 px-2 text-center text-[var(--color-primary)] font-medium">No</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Your Responsibility */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Responsibility</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Because MigRent is not your agent, you are fully responsible for:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Negotiating your own rental terms directly with the other party</li>
                <li>Drafting or obtaining your own tenancy agreement or licence</li>
                <li>Conducting your own property inspections and due diligence</li>
                <li>Arranging bond payments through the appropriate state authority</li>
                <li>Ensuring compliance with all applicable rental and tenancy laws</li>
              </ul>
              <p>See our <Link href="/rental-laws" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Australian Rental Laws Guide</Link> for an overview of state-by-state requirements.</p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            <p>This page is for informational purposes only and does not constitute legal advice. MigRent recommends consulting a qualified Australian lawyer regarding your obligations. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-[var(--color-primary-soft)] from-violet-50 to-violet-100/50 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary)]/5 border-[var(--color-primary-soft)] dark:border-[var(--color-primary)]/20 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Questions about our model?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">We&apos;re happy to explain how MigRent works.</p>
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
