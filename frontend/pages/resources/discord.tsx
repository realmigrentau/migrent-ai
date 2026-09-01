import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Head from "next/head";
import Breadcrumb from "../../components/content/Breadcrumb";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const benefits = [
  {
    title: "City-Specific Channels",
    desc: "Find housing tips and connect with locals in Sydney, Melbourne, Brisbane, Perth, and more.",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
    color: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10",
  },
  {
    title: "Real-Time Housing Alerts",
    desc: "Get notified instantly when new rooms matching your criteria are listed in your area.",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    color: "text-[var(--color-warn-500)]",
    bgColor: "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10",
  },
  {
    title: "Community Events",
    desc: "Join virtual meetups, Q&A sessions with housing experts, and local community gatherings.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    color: "text-[var(--color-accent)]",
    bgColor: "bg-[var(--color-accent-50)] dark:bg-[var(--color-accent)]/10",
  },
  {
    title: "Direct Support",
    desc: "Get help from MigRent staff and experienced community members any time of day.",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    color: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10",
  },
];

const channels = [
  { name: "# general", desc: "General chat and community updates" },
  { name: "# housing-tips", desc: "Share and find housing advice" },
  { name: "# sydney", desc: "Sydney-specific housing discussions" },
  { name: "# melbourne", desc: "Melbourne housing and tips" },
  { name: "# introductions", desc: "Introduce yourself to the community" },
  { name: "# visa-help", desc: "Visa and immigration questions" },
  { name: "# scam-alerts", desc: "Report and discuss rental scams" },
  { name: "# owner-chat", desc: "For property owners and hosts" },
];

const rules = [
  "Be respectful and welcoming to all community members",
  "No spam, self-promotion, or irrelevant links",
  "Keep discussions housing-related and helpful",
  "Report suspicious listings or scam attempts immediately",
  "Protect your personal information - never share sensitive details in public channels",
  "Use city-specific channels for local questions",
];

export default function Discord() {
  return (
    <>
      <Head>
        <title>Join MigRent Discord Community | MigRent AI</title>
        <meta name="description" content="The MigRent community Discord is launching soon - housing tips, scam alerts, and support for migrants across Australia." />
      </Head>

      <div className="max-w-5xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Resources", href: "/resources" },
            { label: "Discord Community" },
          ]}
        />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)] mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            Launching soon
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--color-ink)]">
            Join the <span className="text-[color:var(--color-primary)]">MigRent Community</span>
          </h1>
          <p className="mt-4 text-lg text-[var(--color-ink-3)] max-w-xl mx-auto">
            Connect with migrants and hosts across Australia. Get housing tips, share experiences, and find support.
          </p>
          <div
            aria-disabled="true"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-ink-3)] font-semibold text-base cursor-not-allowed select-none"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 00-5.487 0 12.36 12.36 0 00-.617-1.23A.077.077 0 008.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 00-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 00.031.055 20.03 20.03 0 005.993 2.98.078.078 0 00.084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 01-1.872-.878.075.075 0 01-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 01.078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 01.079.009c.12.098.245.195.372.288a.075.075 0 01-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 00-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 00.084.028 19.963 19.963 0 006.002-2.981.076.076 0 00.032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 00-.031-.028z" />
            </svg>
            Launching Soon
          </div>
          <p className="text-xs text-[var(--color-ink-3)] mt-3">We&apos;re finalising community moderation. The invite link goes live shortly.</p>
        </motion.div>

        {/* Benefits */}
        <section className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  className="card rounded-2xl p-6 h-full hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl ${benefit.bgColor} flex items-center justify-center mb-4`}>
                    <svg className={`w-6 h-6 ${benefit.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-ink)]">{benefit.title}</h3>
                  <p className="text-sm text-[var(--color-ink-3)] mt-2">{benefit.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Channels */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-[var(--color-ink)] mb-6 text-center">Channels you&apos;ll find</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {channels.map((channel, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="card rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <span className="text-[var(--color-primary)] text-xs font-bold">#</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--color-ink)]">{channel.name}</div>
                  <div className="text-xs text-[var(--color-ink-3)] truncate">{channel.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Community Rules */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card rounded-2xl p-8"
          >
            <h2 className="text-xl font-bold text-[var(--color-ink)] mb-4">Community Rules</h2>
            <div className="space-y-3">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[var(--color-ink-2)]">{rule}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-[var(--color-primary)] from-[var(--color-primary)] to-[var(--color-primary)] p-[1px]"
          >
            <div className="rounded-2xl bg-[var(--color-surface-2)] p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: "Soon", label: "Going live" },
                  { value: "8", label: "City channels" },
                  { value: "AU", label: "Wide community" },
                  { value: "Free", label: "To join" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="text-2xl font-black text-[color:var(--color-primary)]">
                      {stat.value}
                    </div>
                    <div className="text-xs text-[var(--color-ink-3)] mt-1 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
