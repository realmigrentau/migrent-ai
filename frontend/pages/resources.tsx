import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Head from "next/head";
import { useTranslation } from "react-i18next";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

/* ── Mock UI illustrations for each resource section ─────────────── */

function MockBlog() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-6">
      <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Latest Posts</div>
      {[
        { title: "5 Tips for First-Time Migrants", date: "Feb 2026", tag: "Guide" },
        { title: "Sydney Rental Market Update", date: "Jan 2026", tag: "Market" },
        { title: "How to Spot Rental Scams", date: "Jan 2026", tag: "Safety" },
      ].map((post, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/15 shrink-0 flex items-center justify-center">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white/90 text-xs font-medium truncate">{post.title}</div>
            <div className="text-white/40 text-[10px] mt-0.5">{post.date}</div>
          </div>
          <span className="text-[9px] font-medium text-white/60 bg-white/10 px-2 py-0.5 rounded-full">{post.tag}</span>
        </div>
      ))}
    </div>
  );
}

function MockCalculator() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-6">
      <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">ROI Calculator</div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs">Weekly Rent</span>
          <span className="text-white/90 text-sm font-bold">$380</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs">Property Value</span>
          <span className="text-white/90 text-sm font-bold">$650K</span>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs">Annual ROI</span>
          <span className="text-[var(--color-accent)] text-sm font-bold">5.2%</span>
        </div>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "52%" }}
          transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
          className="h-full bg-[var(--color-primary)] from-[var(--color-accent)] to-[var(--color-accent)] rounded-full"
        />
      </div>
      <div className="text-white/40 text-[10px]">Based on Sydney metro averages</div>
    </div>
  );
}

function MockAPIDocs() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-6 font-mono">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
        <span className="text-white/80 text-xs font-sans font-semibold uppercase tracking-wider">API v2</span>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-[10px] space-y-1">
        <div className="text-[var(--color-primary)]">GET <span className="text-white/60">/api/v2/listings</span></div>
        <div className="text-[var(--color-accent)]">POST <span className="text-white/60">/api/v2/bookings</span></div>
        <div className="text-[var(--color-warn-500)]">PUT <span className="text-white/60">/api/v2/profile</span></div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
        <div className="text-white/40 text-[9px] mb-1">Response</div>
        <div className="text-[10px] text-[var(--color-accent)]">{`{`}</div>
        <div className="text-[10px] text-white/60 pl-3">{`"status": "200 OK",`}</div>
        <div className="text-[10px] text-white/60 pl-3">{`"data": [...],`}</div>
        <div className="text-[10px] text-[var(--color-accent)]">{`}`}</div>
      </div>
    </div>
  );
}

function MockDiscord() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white text-sm font-bold">M</div>
        <div>
          <div className="text-white/90 text-sm font-semibold">MigRent Community</div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            <span className="text-[var(--color-accent)] text-[10px]">2,847 online</span>
          </div>
        </div>
      </div>
      {[
        { channel: "# general", msg: "Welcome to Sydney!", user: "Maria" },
        { channel: "# housing-tips", msg: "Check bond laws first", user: "Ahmed" },
        { channel: "# introductions", msg: "Just arrived from BR!", user: "Lucas" },
      ].map((item, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5">
          <div className="text-white/40 text-[9px] font-medium mb-1">{item.channel}</div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/15 shrink-0" />
            <div>
              <span className="text-[var(--color-primary)] text-[10px] font-medium">{item.user}: </span>
              <span className="text-white/70 text-[10px]">{item.msg}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockCareers() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-6">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-5 h-5 text-[var(--color-warn-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Open Roles</span>
      </div>
      {[
        { role: "Senior Full-Stack Engineer", type: "Full-time" },
        { role: "AI/ML Engineer", type: "Full-time" },
        { role: "Product Designer", type: "Contract" },
      ].map((job, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-white/90 text-xs font-medium">{job.role}</div>
            <div className="text-white/40 text-[10px] mt-0.5">Sydney, AU</div>
          </div>
          <span className="text-[9px] font-medium text-white/60 bg-white/10 px-2 py-0.5 rounded-full">{job.type}</span>
        </div>
      ))}
      <div className="flex gap-2 mt-auto">
        {["Remote OK", "Visa Sponsor", "Equity"].map((perk) => (
          <span key={perk} className="text-[9px] text-white/40 bg-white/5 px-2 py-0.5 rounded">{perk}</span>
        ))}
      </div>
    </div>
  );
}

function MockRentalLaws() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-6">
      <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">AU Rental Checklist</div>
      {[
        { text: "Bond lodged with Fair Trading", done: true },
        { text: "Condition report signed", done: true },
        { text: "Lease agreement reviewed", done: true },
        { text: "Renter rights booklet received", done: false },
        { text: "Emergency repairs contact saved", done: false },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-2.5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            item.done ? "bg-[var(--color-accent)]/20" : "bg-white/10"
          }`}>
            {item.done ? (
              <svg className="w-3 h-3 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className="w-2 h-2 rounded-full bg-white/20" />
            )}
          </div>
          <span className={`text-[10px] ${item.done ? "text-white/70" : "text-white/40"}`}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Resource data ─────────────────────────────────────────────────── */

const resources = [
  {
    id: "blog",
    titleKey: "resources.blog.title",
    descKey: "resources.blog.desc",
    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
    color: "from-[var(--color-primary)] to-[var(--color-primary)]",
    iconColor: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10",
    headline: "MigRent Blog",
    subline: "Tips, news, and migrant community stories",
    MockUI: MockBlog,
    href: "/blog",
    bullets: [
      "Weekly rental market updates",
      "Migrant housing success stories",
      "Expert tips for hosts & seekers",
    ],
  },
  {
    id: "calculator",
    titleKey: "resources.calculator.title",
    descKey: "resources.calculator.desc",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    color: "from-[var(--color-accent)] to-[var(--color-accent)]",
    iconColor: "text-[var(--color-accent)]",
    bgColor: "bg-[var(--color-accent-50)] dark:bg-[var(--color-accent-50)]0/10",
    headline: "Owner ROI Calculator",
    subline: "Estimate returns on your spare room listing",
    MockUI: MockCalculator,
    href: "/resources/roi-calculator",
    bullets: [
      "Suburb-level rent estimates",
      "Annual yield projections",
      "Compare room types & configurations",
    ],
  },
  {
    id: "api",
    titleKey: "resources.apiDocs.title",
    descKey: "resources.apiDocs.desc",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    color: "from-[var(--color-primary)] to-[var(--color-primary)]",
    iconColor: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10",
    headline: "Developer API Docs",
    subline: "Build integrations on the MigRent platform",
    MockUI: MockAPIDocs,
    href: "/resources/api-docs",
    bullets: [
      "RESTful API with JSON responses",
      "OAuth 2.0 authentication",
      "Webhooks for real-time events",
    ],
  },
  {
    id: "discord",
    titleKey: "resources.discord.title",
    descKey: "resources.discord.desc",
    icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
    color: "from-[var(--color-primary)] to-[var(--color-primary)]",
    iconColor: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10",
    headline: "Join MigRent Discord",
    subline: "Connect with thousands of migrants and hosts",
    MockUI: MockDiscord,
    href: "/resources/discord",
    bullets: [
      "City-specific channels",
      "Real-time housing alerts",
      "Community events & meetups",
    ],
  },
  {
    id: "careers",
    titleKey: "resources.careers.title",
    descKey: "resources.careers.desc",
    icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "from-[var(--color-warn-500)] to-[var(--color-warn-500)]",
    iconColor: "text-[var(--color-warn-500)]",
    bgColor: "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10",
    headline: "Join MigRent AI Team",
    subline: "Help migrants find home - based in Sydney",
    MockUI: MockCareers,
    href: "/careers",
    bullets: [
      "Engineering, design & product roles",
      "Visa sponsorship available",
      "Hybrid work from Sydney HQ",
    ],
  },
  {
    id: "rental-laws",
    titleKey: "resources.rentalLaws.title",
    descKey: "resources.rentalLaws.desc",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    color: "from-[var(--color-primary)] to-[var(--color-primary)]",
    iconColor: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)]0/10",
    headline: "Australian Rental Laws for Migrants",
    subline: "Know your rights as a renter in Australia",
    MockUI: MockRentalLaws,
    href: "/resources/rental-laws",
    bullets: [
      "State-by-state tenancy laws",
      "Bond rules & dispute processes",
      "Migrant-specific housing rights",
    ],
  },
];

export default function Resources() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Resources for MigRent Hosts & Seekers | MigRent AI</title>
        <meta name="description" content="MigRent AI resources - blog, ROI calculator, API docs, Discord community, careers, and Australian rental laws for migrants." />
      </Head>

      <div className="space-y-24">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative text-center py-20 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary-soft)]0/15 dark:bg-[var(--color-primary-soft)]0/8 hidden " />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--color-primary-50)]0/12 dark:bg-[var(--color-primary-50)]0/6 hidden " style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-primary)]/5 dark:bg-[var(--color-primary)]/5 hidden " />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10 border border-[var(--color-primary-100)] dark:border-[var(--color-primary)]/20 text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary-soft)]0 animate-pulse" />
              {t("resources.heroBadge")}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              <span className="bg-[var(--color-primary)] from-[var(--color-primary)] via-[var(--color-primary)] to-[var(--color-primary)] bg-clip-text text-transparent">
                Resources for MigRent
              </span>
              <br />
              <span className="text-[var(--color-ink)]">Hosts & Seekers</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[var(--color-ink-3)] max-w-2xl mx-auto leading-relaxed">
              {t("resources.heroSubtitle")}
            </p>

            {/* Quick nav pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {resources.map((r) => (
                <Link key={r.id} href={`#${r.id}`}>
                  <motion.span
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer
                      bg-white dark:bg-white/5 border-[var(--color-line)]
                      hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-line-2)] hover:shadow-md
                      text-[var(--color-ink-2)]`}
                  >
                    <svg className={`w-3.5 h-3.5 ${r.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                    </svg>
                    {t(r.titleKey)}
                  </motion.span>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Resource sections ───────────────────────────────────── */}
        {resources.map((resource, i) => {
          const isEven = i % 2 === 0;
          const MockUI = resource.MockUI;

          return (
            <section key={resource.id} id={resource.id} className="scroll-mt-24">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={0}
                variants={fadeUp}
                className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10 md:gap-16`}
              >
                {/* Visual */}
                <div className="w-full md:w-1/2">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative rounded-2xl overflow-hidden bg-[var(--color-primary-soft)] ${resource.color} aspect-[4/3] shadow-xl`}
                  >
                    <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-white/8 blur-2xl" />
                    <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-white/8 blur-xl" />
                    <div className="relative z-[1] h-full flex items-center justify-center pt-6">
                      <MockUI />
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${resource.bgColor} mb-4`}>
                    <svg className={`w-6 h-6 ${resource.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={resource.icon} />
                    </svg>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-ink)]">
                    {resource.headline}
                  </h2>
                  <p className="text-sm text-[var(--color-ink-3)] mt-1 font-medium">
                    {resource.subline}
                  </p>

                  <p className="mt-4 text-base text-[var(--color-ink-3)] leading-relaxed">
                    {t(resource.descKey)}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {resource.bullets.map((bullet, bi) => (
                      <li key={bi} className="flex items-center gap-3 text-sm text-[var(--color-ink-2)]">
                        <span className={`w-5 h-5 rounded-full ${resource.bgColor} flex items-center justify-center shrink-0`}>
                          <svg className={`w-3 h-3 ${resource.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {resource.href ? (
                    <Link href={resource.href}>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-block mt-6 btn-primary text-sm px-6 py-2.5 rounded-xl"
                      >
                        {t("resources.visitLink")}
                      </motion.span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-6 text-xs font-medium text-[var(--color-ink-3)] bg-[var(--color-surface-muted)] dark:bg-white/5 px-3 py-1.5 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t("resources.comingSoon")}
                    </span>
                  )}
                </div>
              </motion.div>
            </section>
          );
        })}

        {/* ── Stats bar ──────────────────────────────────────────── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-[var(--color-primary)] from-[var(--color-primary)] via-[var(--color-primary)] to-[var(--color-primary)] p-[1px]"
          >
            <div className="rounded-2xl bg-[var(--color-surface-2)] p-8 md:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: "6", label: "Resource categories" },
                  { value: "8", label: "Languages supported" },
                  { value: "2.8K+", label: "Discord members" },
                  { value: "24/7", label: "Community support" },
                ].map((stat, si) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: si * 0.1, duration: 0.5 }}
                  >
                    <div className="text-2xl md:text-3xl font-black bg-[var(--color-primary)] from-[var(--color-primary)] to-[var(--color-primary)] bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs text-[var(--color-ink-3)] mt-1 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-ink)]">
              {t("resources.cta.title")}
            </h2>
            <p className="mt-3 text-[var(--color-ink-3)]">
              {t("resources.cta.subtitle")}
            </p>
            <Link href="/contact">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block mt-6 btn-primary text-base px-8 py-3.5 rounded-xl">
                {t("resources.cta.button")}
              </motion.span>
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  );
}
