import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing | MigRent AI</title>
        <meta name="description" content="MigRent AI pricing - AUD $99 one-time owner fee, optional AUD $19 seeker verification. No subscriptions, no rent commissions." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Simple, <span className="gradient-text">transparent</span> pricing
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              No subscriptions. No hidden fees. No commissions on rent. You only pay when a match is made.
            </p>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Owner */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="card p-6 rounded-2xl border-t-4 border-t-blue-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Owners
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Room Owner</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">List your room and find great tenants</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$99</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">AUD / one-time</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Per successful match only</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Free listing creation",
                  "Unlimited enquiries",
                  "AI-matched seeker profiles",
                  "Verification badges visible",
                  "In-platform messaging",
                  "Pay only on successful match",
                  "Keep 100% of ongoing rent",
                  "Superhost status eligibility",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/owner/dashboard">
                <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
                  Start Listing
                </motion.span>
              </Link>
            </motion.div>

            {/* Seeker */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="card p-6 rounded-2xl border-t-4 border-t-rose-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400">
                Seekers
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Room Seeker</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Find your perfect room with AI matching</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$19</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">AUD / optional</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Verification fee &mdash; always disclosed</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Free account creation",
                  "Browse all listings",
                  "AI match scores",
                  "Advanced search filters",
                  "Save to wishlist",
                  "In-platform messaging",
                  "Optional verification boost",
                  "No commission on rent",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/seeker/dashboard">
                <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:shadow-lg transition-shadow">
                  Start Searching
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Comparison */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-6 text-center">
            How we compare
          </h2>
          <div className="card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-4 font-bold text-slate-900 dark:text-white">Feature</th>
                    <th className="text-center p-4 font-bold text-rose-500">MigRent</th>
                    <th className="text-center p-4 font-bold text-slate-400">Classifieds</th>
                    <th className="text-center p-4 font-bold text-slate-400">Agents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { feature: "Listing cost", migrent: "Free", classifieds: "Free", agents: "$200+" },
                    { feature: "Ongoing commission", migrent: "None", classifieds: "None", agents: "5-10%" },
                    { feature: "AI matching", migrent: "Yes", classifieds: "No", agents: "No" },
                    { feature: "User verification", migrent: "Yes", classifieds: "No", agents: "Varies" },
                    { feature: "Built for migrants", migrent: "Yes", classifieds: "No", agents: "No" },
                    { feature: "In-platform messaging", migrent: "Yes", classifieds: "Varies", agents: "No" },
                  ].map((row) => (
                    <tr key={row.feature}>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center font-semibold text-rose-500">{row.migrent}</td>
                      <td className="p-4 text-center text-slate-400">{row.classifieds}</td>
                      <td className="p-4 text-center text-slate-400">{row.agents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-6 text-center">
            Pricing FAQ
          </h2>
          <div className="space-y-3">
            {[
              { q: "When exactly am I charged?", a: "Owners are charged the $99 fee only when a deal is confirmed through MigRent. Seekers may optionally pay $19 for verification — always disclosed before payment." },
              { q: "Are there any hidden fees?", a: "No. The pricing above is all-inclusive. No subscriptions, no rent commissions, no hidden costs." },
              { q: "Can I get a refund?", a: "Fees are generally non-refundable once confirmed. Exceptional cases may be considered — contact migrentau@gmail.com." },
              { q: "Does MigRent take a cut of rent?", a: "Never. All ongoing rent payments go directly to the owner. MigRent only charges a one-time fee on match." },
            ].map((item) => (
              <div key={item.q} className="card p-5 rounded-xl">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.q}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto pb-8">
          <div className="card p-8 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-blue-50 dark:from-rose-500/10 dark:via-slate-900 dark:to-blue-500/10 text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Get started today</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">No credit card required to sign up. Browse and list for free.</p>
            <div className="flex gap-3 justify-center flex-col sm:flex-row">
              <Link href="/signup">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-8 py-3 rounded-xl">
                  Sign Up Free
                </motion.span>
              </Link>
              <Link href="/faq">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-secondary text-sm px-8 py-3 rounded-xl">
                  More Questions?
                </motion.span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
