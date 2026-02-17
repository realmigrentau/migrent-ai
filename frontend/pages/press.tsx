import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

const stats = [
  { label: "Cities", value: "2", detail: "Sydney & Adelaide" },
  { label: "Platform", value: "AI", detail: "Powered matching" },
  { label: "Fee Model", value: "$99", detail: "One-time per match" },
  { label: "Founded", value: "2025", detail: "Sydney, Australia" },
];

const milestones = [
  { date: "2025", title: "MigRent AI Founded", desc: "Platform conceived and development begins in Sydney." },
  { date: "2025", title: "Beta Launch", desc: "First listings go live in Sydney with AI matching." },
  { date: "2026", title: "Adelaide Expansion", desc: "MigRent extends to Adelaide, serving more Australian cities." },
  { date: "2026", title: "Verification System", desc: "ID and visa verification launched for enhanced trust." },
];

export default function Press() {
  return (
    <>
      <Head>
        <title>Press & Media | MigRent AI</title>
        <meta name="description" content="MigRent AI press kit - company facts, milestones, media assets, and press contact information." />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl animate-pulse" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-xs font-medium text-violet-600 dark:text-violet-400 mb-6">
              Press &amp; Media
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="gradient-text">MigRent AI</span>{" "}
              <span className="text-slate-900 dark:text-white">in the media</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Everything you need to write about MigRent AI. Company facts, media kit, and press contact.
            </p>
          </motion.div>
        </section>

        {/* Key Stats */}
        <section className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-rose-500">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mt-1">{stat.label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{stat.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="max-w-3xl mx-auto">
          <div className="card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">About MigRent AI</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>
                MigRent AI is an Australian proptech startup that uses artificial intelligence to match accommodation seekers &mdash; primarily migrants, international students, and working professionals &mdash; with room owners across Australia.
              </p>
              <p>
                Founded in Sydney in 2025, MigRent addresses a critical pain point: finding safe, affordable accommodation in a new country without local rental history or references. The platform replaces chaotic social media groups and random classifieds with structured, trust-scored, AI-powered matching.
              </p>
              <p>
                MigRent operates on a simple fee model: owners pay a one-time AUD $99 platform fee per successful match, while seekers can optionally verify their identity for AUD $19. There are no subscriptions, no rent commissions, and no ongoing fees.
              </p>
              <div className="card-subtle p-4 rounded-xl space-y-1 mt-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Company Details</p>
                <p>Business Name: MigRent AI</p>
                <p>ABN: 22 669 566 941</p>
                <p>Structure: Sole Trader</p>
                <p>Headquarters: Sydney, Australia</p>
                <p>Markets: Sydney, Adelaide</p>
              </div>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-6 text-center">
            Milestones
          </h2>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-5 rounded-2xl flex gap-4 items-start">
                <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg shrink-0">{m.date}</span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{m.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Media Kit */}
        <section className="max-w-3xl mx-auto">
          <div className="card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Media Kit</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>For logos, brand assets, and high-resolution images, please contact our press team. We&apos;ll provide:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>MigRent AI logo (SVG, PNG) in various formats</li>
                <li>Brand colour palette and usage guidelines</li>
                <li>Product screenshots and mockups</li>
                <li>Founder photos and bios</li>
                <li>Boilerplate company description</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-6 text-center">
            What users say
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-5 rounded-2xl">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-3">
                &quot;MigRent made finding a room so much easier than scrolling through Facebook groups. The AI matching actually pointed me to rooms I could afford near my uni.&quot;
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">International Student, Sydney</p>
            </div>
            <div className="card p-5 rounded-2xl">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-3">
                &quot;As an owner, I was getting dozens of random messages on Gumtree. MigRent brought me serious, verified seekers. The $99 fee paid for itself immediately.&quot;
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Room Owner, Sydney</p>
            </div>
          </div>
        </section>

        {/* Press Contact */}
        <section className="max-w-3xl mx-auto pb-8">
          <div className="card p-8 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-500/10 dark:to-violet-600/5 border-violet-200 dark:border-violet-500/20 text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Press enquiries</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">For interviews, media features, partnerships, or media kit requests:</p>
            <a href="https://mail.google.com/mail/?view=cm&to=migrentau@gmail.com&su=Press%20Enquiry%20-%20MigRent%20AI" target="_blank" rel="noopener noreferrer">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-8 py-3 rounded-xl">
                Contact Press Team
              </motion.span>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
