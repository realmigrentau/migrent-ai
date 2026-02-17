import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

const values = [
  { title: "Impact First", desc: "We build for real people solving real problems. Every feature should make someone's move easier.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { title: "Move Fast", desc: "We're a startup. Speed matters. Ship early, learn fast, iterate quickly.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
  { title: "Trust & Safety", desc: "Users trust us with their housing search. We take that responsibility seriously.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { title: "Inclusive by Default", desc: "We're building for migrants, students, and newcomers. Diversity isn't an initiative — it's our DNA.", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
];

export default function Careers() {
  return (
    <>
      <Head>
        <title>Careers | MigRent AI</title>
        <meta name="description" content="Join MigRent AI - help build the future of accommodation for migrants and students in Australia." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl animate-pulse" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              We&apos;re growing
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="text-slate-900 dark:text-white">Build the future of</span>{" "}
              <span className="gradient-text">housing</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              MigRent AI is on a mission to make finding accommodation easier and safer for migrants, students, and professionals across Australia. Join us.
            </p>
          </motion.div>
        </section>

        {/* Values */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-8 text-center">
            Our <span className="gradient-text">values</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About the Team */}
        <section className="max-w-3xl mx-auto">
          <div className="card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">About the Team</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>
                MigRent AI was founded in Sydney by an entrepreneur who experienced firsthand the challenges of finding accommodation as a newcomer to Australia. We&apos;re building the platform we wished existed.
              </p>
              <p>
                We&apos;re a small, fast-moving team that values impact over titles. We use modern technologies including Next.js, React, Supabase, and AI/ML to deliver a product that genuinely helps people.
              </p>
            </div>
          </div>
        </section>

        {/* Current Openings */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-6 text-center">
            Open positions
          </h2>
          <div className="space-y-3">
            <div className="card p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Volunteer / Early Contributor</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Remote &bull; Flexible hours</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  Open
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                We&apos;re looking for passionate people who want to make a difference. Whether you&apos;re a developer, designer, marketer, or community builder &mdash; if you believe in our mission, we want to hear from you.
              </p>
            </div>

            <div className="card-subtle p-5 rounded-2xl">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                More positions coming soon. Express your interest below.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto pb-8">
          <div className="card p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/10 dark:to-rose-600/5 border-rose-200 dark:border-rose-500/20 text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Interested in joining?</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">Send us an email with your background and what excites you about MigRent.</p>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=Careers%20at%20MigRent%20AI" target="_blank" rel="noopener noreferrer">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-8 py-3 rounded-xl">
                Email Us
              </motion.span>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
