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
  { num: "01", title: "Create your profile", desc: "Sign up and tell us what you need — budget, location, lifestyle preferences.", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { num: "02", title: "Get verified (optional)", desc: "Build trust with owners by verifying your identity. Verified seekers are matched faster.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { num: "03", title: "Browse AI-matched rooms", desc: "See listings ranked by how well they match your preferences. Save your favourites.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { num: "04", title: "Arrange directly", desc: "Connect with owners, inspect the room, and arrange rent directly on your terms.", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
];

const benefits = [
  { title: "Faster, safer discovery", desc: "Better than random classifieds and social media groups. Curated, filtered listings.", icon: "S" },
  { title: "Built for new arrivals", desc: "No Australian rental history needed to get started. Perfect for migrants and students.", icon: "N" },
  { title: "Stand out with verification", desc: "Optional verification and match scores help you shine to owners.", icon: "V" },
  { title: "Transparent pricing", desc: "Clear weekly rent upfront. Optional AUD $19 fee always shown before you pay.", icon: "$" },
  { title: "Smart filters", desc: "Filter by suburb, price range, room type, furnishing, pets, and more.", icon: "F" },
  { title: "You stay in control", desc: "Choose who to talk to and arrange everything directly with the owner.", icon: "C" },
];

export default function ForSeekers() {
  return (
    <>
      <Head>
        <title>For Seekers | MigRent AI</title>
        <meta name="description" content="Find your room with MigRent AI. AI-powered matching for migrants, students, and professionals across Australia." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl animate-pulse" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              For Room Seekers
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="gradient-text">Find your room.</span>{" "}
              <span className="text-slate-900 dark:text-white">Feel at home.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              MigRent helps migrants, students, and professionals find rooms from local owners &mdash; faster and safer than random classifieds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/seeker/dashboard">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-base px-8 py-3.5 rounded-xl">
                  Start Searching
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
            How it <span className="gradient-text">works</span>
          </motion.h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="card p-5 rounded-2xl flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-rose-400 dark:text-rose-500/70">{step.num}</span>
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
            Why seekers choose <span className="gradient-text">MigRent</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="card-subtle p-5 rounded-xl group hover:shadow-md dark:hover:bg-white/[0.06] transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400 font-bold text-sm mb-3 group-hover:border-rose-300 dark:group-hover:border-rose-400/40 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Search Filters Showcase */}
        <section className="max-w-3xl mx-auto">
          <div className="card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Powerful Search Filters</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Find exactly what you need with our advanced search:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Location & suburb",
                  "Price range (weekly)",
                  "Room type (private/shared)",
                  "Furnished / unfurnished",
                  "Pet-friendly",
                  "Bills included",
                  "Minimum stay period",
                  "Available from date",
                ].map((filter) => (
                  <div key={filter} className="flex items-center gap-2 card-subtle p-3 rounded-lg">
                    <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{filter}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto pb-8">
          <div className="card p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/10 dark:to-rose-600/5 border-rose-200 dark:border-rose-500/20 text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Ready to find your room?</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">Join MigRent and get AI-matched with rooms from verified local owners.</p>
            <Link href="/seeker/dashboard">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-base px-8 py-3.5 rounded-xl">
                Start Searching
              </motion.span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
