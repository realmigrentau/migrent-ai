import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const steps = {
  seekers: [
    { num: "01", title: "Create your profile", desc: "Sign up and tell us what you need" },
    { num: "02", title: "Verify (optional)", desc: "Build trust with owners" },
    { num: "03", title: "AI-guided matches", desc: "Get matched to rooms that fit" },
    { num: "04", title: "Arrange directly", desc: "Connect with owners on your terms" },
  ],
  owners: [
    { num: "01", title: "List your room", desc: "Add details, photos, and pricing" },
    { num: "02", title: "Review seekers", desc: "See trust-scored applicants" },
    { num: "03", title: "Confirm a match", desc: "Choose the right tenant" },
    { num: "04", title: "Arrange directly", desc: "Manage rent your way" },
  ],
};

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative text-center py-20 overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-400/5 dark:bg-rose-600/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400 mb-6">
            <span className="pulse-dot" />
            Now live across Australia
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            <span className="gradient-text">Verified rooms</span>{" "}
            <span className="text-slate-900 dark:text-white">for new arrivals</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            MigRent helps migrants, students, and professionals find rooms from
            local owners &mdash; faster and safer than random classifieds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/seeker/dashboard">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block btn-primary text-base px-8 py-4 rounded-xl"
              >
                I&apos;m a Seeker
              </motion.span>
            </Link>
            <Link href="/owner/dashboard">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block btn-secondary text-base px-8 py-4 rounded-xl"
              >
                I&apos;m an Owner
              </motion.span>
            </Link>
          </div>
        </motion.div>

        {/* 3D Card Stack Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 mt-16 max-w-lg mx-auto"
        >
          <div className="relative">
            {/* Back cards */}
            <div className="absolute -top-3 left-4 right-4 h-40 card rounded-2xl opacity-30 -rotate-2" />
            <div className="absolute -top-1.5 left-2 right-2 h-40 card rounded-2xl opacity-50 rotate-1" />
            {/* Front card */}
            <div className="relative card rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=260&fit=crop&crop=center"
                alt="Furnished room in Newtown"
                className="w-full h-32 object-cover"
              />
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-rose-500 dark:text-rose-400 font-semibold">Featured Listing</span>
                    <h3 className="text-slate-900 dark:text-white font-bold text-sm leading-tight">Furnished Room in Newtown</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Sydney, 2042</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 shrink-0">
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">$265</span>
                    <span className="text-rose-400 dark:text-rose-500 text-xs">/wk</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div className="w-[94%] h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">94% match</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <motion.h2
            custom={0}
            variants={fadeUp}
            className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white"
          >
            How it <span className="gradient-text">works</span>
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Seekers */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="card p-6 rounded-2xl"
          >
            <h3 className="text-lg font-bold text-rose-500 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-sm">
                S
              </span>
              For Seekers
            </h3>
            <div className="space-y-4">
              {steps.seekers.map((step, i) => (
                <motion.div
                  key={step.num}
                  custom={i}
                  variants={fadeUp}
                  className="flex gap-4 items-start group"
                >
                  <span className="text-xs font-bold text-rose-300 dark:text-rose-500/50 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors mt-0.5 shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-semibold text-sm">{step.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Owners */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="card p-6 rounded-2xl"
          >
            <h3 className="text-lg font-bold text-blue-500 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-sm">
                O
              </span>
              For Owners
            </h3>
            <div className="space-y-4">
              {steps.owners.map((step, i) => (
                <motion.div
                  key={step.num}
                  custom={i}
                  variants={fadeUp}
                  className="flex gap-4 items-start group"
                >
                  <span className="text-xs font-bold text-blue-300 dark:text-blue-500/50 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mt-0.5 shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-semibold text-sm">{step.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits for Seekers */}
      <section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            custom={0}
            variants={fadeUp}
            className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-8"
          >
            Why seekers use <span className="gradient-text">MigRent</span>
          </motion.h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "S", title: "Faster, safer discovery", desc: "Better than random classifieds and social media groups." },
            { icon: "N", title: "Built for new arrivals", desc: "No Australian rental history needed to get started." },
            { icon: "V", title: "Stand out with verification", desc: "Optional verification and match scores help you shine." },
            { icon: "$", title: "Transparent pricing", desc: "Clear weekly rent upfront; optional AUD 19 success fee shown before you pay." },
            { icon: "C", title: "You stay in control", desc: "Choose who to talk to and arrange rent directly with the owner." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="card-subtle p-5 rounded-xl group hover:shadow-md dark:hover:bg-white/[0.06] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400 font-bold text-sm mb-3 group-hover:border-rose-300 dark:group-hover:border-rose-400/40 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 card p-5 rounded-2xl border-l-2 border-l-rose-500"
        >
          <h4 className="font-bold text-rose-500 dark:text-rose-400 text-sm mb-1">Why MigRent for seekers</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            MigRent is built for new migrants, students, and professionals
            arriving in Australia. It reduces the noise of random classifieds
            and social-media groups by matching you with verified listings.
            Optional profile verification and clear platform rules help owners
            trust you even without Australian rental history.
          </p>
        </motion.div>
      </section>

      {/* Benefits for Owners */}
      <section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            custom={0}
            variants={fadeUp}
            className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-8"
          >
            Why owners use <span className="gradient-text-accent">MigRent</span>
          </motion.h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "R", title: "Reach serious seekers", desc: "Migrants, students, and professionals actively looking for rooms." },
            { icon: "A", title: "AI-assisted matching", desc: "Better-fit enquiries instead of dozens of poor-fit messages." },
            { icon: "$", title: "Simple one-time fee", desc: "AUD 99 per successful match, no ongoing commission." },
            { icon: "K", title: "Keep all rent", desc: "Ongoing payments managed directly with the tenant." },
            { icon: "C", title: "You stay in control", desc: "Choose who to accept. MigRent can suspend abusive accounts." },
            { icon: "T", title: "Build your reputation", desc: "Completed deals build trust and may boost listing visibility." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="card-subtle p-5 rounded-xl group hover:shadow-md dark:hover:bg-white/[0.06] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold text-sm mb-3 group-hover:border-blue-300 dark:group-hover:border-blue-400/40 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 card p-5 rounded-2xl border-l-2 border-l-blue-500"
        >
          <h4 className="font-bold text-blue-500 dark:text-blue-400 text-sm mb-1">Why MigRent for owners</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            MigRent brings more serious, better-fit enquiries through simple
            profiles and optional verification. It uses AI-assisted matching so
            you spend less time filtering. MigRent charges a one-time AUD 99
            fee only on successful matches while you keep all ongoing rent.
          </p>
        </motion.div>
      </section>

      {/* Disclaimer */}
      <section className="pb-8">
        <div className="card-subtle p-6 rounded-2xl space-y-3 text-sm text-slate-500 dark:text-slate-500">
          <p>
            <strong className="text-slate-700 dark:text-slate-400">Disclaimer:</strong> MigRent is an online platform only.
            MigRent is not a real estate agent, landlord, tenant, or legal
            representative of any user.
          </p>
          <p>
            All agreements and ongoing rent payments are arranged directly
            between owners and seekers.
          </p>
          <p>
            MigRent charges a one-time AUD 99 fee to owners on successful
            matches and may offer an optional AUD 19 fee to seekers.
          </p>
        </div>
      </section>
    </div>
  );
}
