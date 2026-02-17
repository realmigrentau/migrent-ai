import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Head from "next/head";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const steps = [
  { num: "01", title: "Create your listing", desc: "Add property details, photos, pricing, and house rules. It takes about 5 minutes.", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { num: "02", title: "Review seeker profiles", desc: "Browse applicants with AI match scores and verification badges. See who fits best.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { num: "03", title: "Confirm a match", desc: "Choose the right seeker and confirm the deal. The AUD $99 platform fee is charged here.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { num: "04", title: "Arrange directly", desc: "Handle rent, move-in, and ongoing communication directly with your tenant. You keep all rent.", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
];

const benefits = [
  { title: "Reach serious seekers", desc: "Migrants, students, and professionals actively searching for rooms. No tyre-kickers.", icon: "R" },
  { title: "AI-assisted matching", desc: "Better-fit enquiries instead of dozens of poor-fit messages from random classifieds.", icon: "A" },
  { title: "Simple one-time fee", desc: "AUD $99 per successful match. No subscriptions, no commissions on rent.", icon: "$" },
  { title: "Keep all your rent", desc: "Ongoing payments are between you and the tenant. MigRent never touches your rent.", icon: "K" },
  { title: "You stay in control", desc: "Choose who to accept. Set your own rules, pricing, and conditions.", icon: "C" },
  { title: "Build your reputation", desc: "Earn Superhost status through successful matches and positive interactions.", icon: "T" },
];

export default function ForOwners() {
  return (
    <>
      <Head>
        <title>For Owners | MigRent AI</title>
        <meta name="description" content="List your room on MigRent AI. Reach verified seekers, AI matching, one-time AUD $99 fee. Start earning today." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-xs font-medium text-blue-600 dark:text-blue-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              For Room Owners
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="gradient-text-accent">List your room.</span>{" "}
              <span className="text-slate-900 dark:text-white">Find great tenants.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              MigRent connects you with verified seekers who are serious about finding a room. AI matching brings you better-fit enquiries while you keep all rent.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/owner/dashboard">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-base px-8 py-3.5 rounded-xl">
                  Start Listing
                </motion.span>
              </Link>
              <Link href="/pricing">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-secondary text-base px-8 py-3.5 rounded-xl">
                  View Pricing
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="max-w-3xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-8 text-center">
            How it <span className="gradient-text-accent">works</span>
          </motion.h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="card p-5 rounded-2xl flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-400 dark:text-blue-500/70">{step.num}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-8 text-center">
            Why owners choose <span className="gradient-text-accent">MigRent</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="card-subtle p-5 rounded-xl group hover:shadow-md dark:hover:bg-white/[0.06] transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold text-sm mb-3 group-hover:border-blue-300 dark:group-hover:border-blue-400/40 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Earnings Calculator */}
        <section className="max-w-3xl mx-auto">
          <div className="card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Potential Earnings</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>With MigRent, you keep 100% of ongoing rent. Here&apos;s what typical owners earn:</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="card-subtle p-4 rounded-xl text-center">
                  <p className="text-2xl font-black text-blue-500">$200</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">per week (budget room)</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">~$10,400/year</p>
                </div>
                <div className="card-subtle p-4 rounded-xl text-center border border-blue-200 dark:border-blue-500/30">
                  <p className="text-2xl font-black text-blue-500">$280</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">per week (average)</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">~$14,560/year</p>
                </div>
                <div className="card-subtle p-4 rounded-xl text-center">
                  <p className="text-2xl font-black text-blue-500">$400</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">per week (premium)</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">~$20,800/year</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">MigRent charges a one-time AUD $99 platform fee per match. You keep all ongoing rent.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto pb-8">
          <div className="card p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-600/5 border-blue-200 dark:border-blue-500/20 text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Ready to list your room?</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">Join MigRent and start receiving AI-matched enquiries from verified seekers.</p>
            <Link href="/owner/dashboard">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-base px-8 py-3.5 rounded-xl">
                Start Hosting
              </motion.span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
