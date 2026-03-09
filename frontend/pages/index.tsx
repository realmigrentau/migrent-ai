import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { motion, type Variants } from "framer-motion";
import OwnerMarquee from "../components/OwnerMarquee";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import {
  Globe,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Search,
  Home as HomeIcon,
  ListPlus,
  Users,
  Handshake,
  Star,
  Phone,
  Lock,
  ArrowRight,
  BadgeCheck,
  MapPin,
} from "lucide-react";

/* ── Animation variants ── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const colorMap = {
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-100 dark:border-rose-500/20",
    icon: "text-rose-500",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-100 dark:border-emerald-500/20",
    icon: "text-emerald-500",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-100 dark:border-violet-500/20",
    icon: "text-violet-500",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-100 dark:border-blue-500/20",
    icon: "text-blue-500",
  },
} as const;

const pressLogos: string[] = [];

/* ── Page ── */

export default function Home() {
  const { session } = useAuth();
  const { t } = useTranslation();

  const features = [
    { icon: Globe, title: t("home.feat1Title"), desc: t("home.feat1Desc"), color: "rose" as const },
    { icon: ShieldCheck, title: t("home.feat2Title"), desc: t("home.feat2Desc"), color: "emerald" as const },
    { icon: Sparkles, title: t("home.feat3Title"), desc: t("home.feat3Desc"), color: "violet" as const },
    { icon: CreditCard, title: t("home.feat4Title"), desc: t("home.feat4Desc"), color: "blue" as const },
  ];

  const seekerSteps = [
    { icon: Search, title: t("home.seekerStep1"), desc: t("home.seekerStep1Desc") },
    { icon: Sparkles, title: t("home.seekerStep2"), desc: t("home.seekerStep2Desc") },
    { icon: HomeIcon, title: t("home.seekerStep3"), desc: t("home.seekerStep3Desc") },
  ];

  const ownerSteps = [
    { icon: ListPlus, title: t("home.ownerStep1"), desc: t("home.ownerStep1Desc") },
    { icon: Users, title: t("home.ownerStep2"), desc: t("home.ownerStep2Desc") },
    { icon: Handshake, title: t("home.ownerStep3"), desc: t("home.ownerStep3Desc") },
  ];

  const testimonials = [
    { name: t("home.t1Name"), role: t("home.t1Role"), quote: t("home.t1Quote"), rating: 5, avatar: "P" },
    { name: t("home.t2Name"), role: t("home.t2Role"), quote: t("home.t2Quote"), rating: 5, avatar: "D" },
    { name: t("home.t3Name"), role: t("home.t3Role"), quote: t("home.t3Quote"), rating: 5, avatar: "M" },
  ];

  const trustItems = [
    { icon: BadgeCheck, title: t("home.trust1Title"), desc: t("home.trust1Desc") },
    { icon: Lock, title: t("home.trust2Title"), desc: t("home.trust2Desc") },
    { icon: Phone, title: t("home.trust3Title"), desc: t("home.trust3Desc") },
  ];

  const trustBadges = [
    { icon: ShieldCheck, label: t("home.verifiedHosts") },
    { icon: Lock, label: t("home.securePayments") },
    { icon: MapPin, label: t("home.builtInAustralia") },
  ];

  return (
    <>
      <Head>
        <title>MigRent AI – Find Verified Rooms in Australia</title>
        <meta name="description" content="MigRent helps migrants, students, and professionals find verified rooms from trusted Australian owners - faster and safer than classifieds." />
        <meta property="og:title" content="MigRent AI – Find Verified Rooms in Australia" />
        <meta property="og:description" content="Find verified rooms from trusted owners across Australia. Superhost-rated, station-close listings." />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "MigRent AI",
              url: "https://migrent-ai.vercel.app",
              description: "Find verified rooms from trusted owners across Australia.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://migrent-ai.vercel.app/seeker/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </Head>

      {/* SECTION 1 · HERO */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-400/15 dark:bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-400/10 dark:bg-violet-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-400/10 dark:bg-blue-500/8 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400 mb-8">
              <span className="pulse-dot" />
              {t("home.badge")}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              <span className="gradient-text">{t("home.headline1")}</span>{" "}
              <span className="text-slate-900 dark:text-white">{t("home.headline2")}</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("home.subtitle")}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={session ? "/dashboard" : "/for-seekers"}>
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 btn-primary text-base px-8 py-4 rounded-xl">
                  {t("home.seekerCta")}
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <Link href={session ? "/owner/dashboard" : "/for-owners"}>
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 btn-secondary text-base px-8 py-4 rounded-xl">
                  {t("home.ownerCta")}
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <Link href="/pricing" className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                {t("home.viewPricing")}
              </Link>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <Link href="/about" className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                {t("home.learnMore")}
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                  <badge.icon className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{badge.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 · MARQUEE */}
      <section className="py-16 border-y border-slate-100 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("home.marqueeTitle")} <span className="gradient-text">{t("home.marqueeAccent")}</span>
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-lg mx-auto">{t("home.marqueeSubtitle")}</p>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
          <OwnerMarquee />
        </motion.div>
      </section>

      {/* SECTION 3 · WHY MIGRENT */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-3">{t("home.whyBadge")}</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("home.whyTitle")} <span className="gradient-text">{t("home.whyAccent")}</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const c = colorMap[feature.color];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} whileHover={{ y: -6 }} className="card p-6 rounded-2xl group hover:shadow-lg transition-all">
                  <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${c.icon}`} />
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 · HOW IT WORKS */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-3">{t("home.howBadge")}</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("home.howTitle")} <span className="gradient-text">{t("home.howAccent")}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Seekers panel */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/10 dark:to-rose-900/10 border border-rose-100 dark:border-rose-500/20 p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/30 dark:bg-rose-500/5 rounded-full blur-2xl" />
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white font-bold text-sm">S</span>
                {t("home.forSeekers")}
              </h3>
              <div className="space-y-6 relative z-10">
                {seekerSteps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <step.icon className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/for-seekers">
                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 mt-8 btn-primary text-sm px-6 py-3 rounded-xl">
                  {t("home.startSearching")}
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>

            {/* Owners panel */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-900/10 border border-blue-100 dark:border-blue-500/20 p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 dark:bg-blue-500/5 rounded-full blur-2xl" />
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-sm">O</span>
                {t("home.forOwners")}
              </h3>
              <div className="space-y-6 relative z-10">
                {ownerSteps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <step.icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/for-owners">
                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 mt-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-shadow">
                  {t("home.listYourRoom")}
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5 · VISUAL STORIES */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-3">{t("home.storiesBadge")}</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("home.storiesTitle")} <span className="gradient-text">{t("home.storiesAccent")}</span> {t("home.storiesEnd")}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group min-h-[300px] md:min-h-[480px]">
              <Image src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" alt="Beautiful furnished room" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 66vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="inline-block px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold mb-3">{t("home.featured")}</span>
                <h3 className="text-white text-xl md:text-2xl font-bold">{t("home.featuredTitle")}</h3>
                <p className="text-white/80 text-sm mt-2 max-w-md">{t("home.featuredDesc")}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }} className="relative rounded-3xl overflow-hidden group h-[220px]">
              <Image src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80" alt="Modern bedroom" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold mb-2">{t("home.successStory")}</span>
                <h4 className="text-white font-bold text-sm">{t("home.story1")}</h4>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }} className="relative rounded-3xl overflow-hidden group h-[220px]">
              <Image src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80" alt="Cozy living space" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold mb-2">{t("home.successStory")}</span>
                <h4 className="text-white font-bold text-sm">{t("home.story2")}</h4>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 6 · SOCIAL PROOF */}
      <section className="py-20 md:py-28 bg-slate-50/80 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-3">{t("home.testimonialsBadge")}</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("home.testimonialsTitle")} <span className="gradient-text">{t("home.testimonialsAccent")}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="card p-6 rounded-2xl">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: item.rating }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">&ldquo;{item.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">{item.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {pressLogos.length > 0 && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-16 text-center">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">{t("home.asSeenOn")}</p>
              <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
                {pressLogos.map((name) => (
                  <div key={name} className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-sm font-semibold">{name}</div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* SECTION 7 · SAFETY & TRUST */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-3">{t("home.safetyBadge")}</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("home.safetyTitle")} <span className="gradient-text">{t("home.safetyAccent")}</span>
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{t("home.safetySubtitle")}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {trustItems.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="text-center card p-8 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 · BOTTOM CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-rose-600 to-violet-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">{t("home.ctaTitle")}</h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">{t("home.ctaSubtitle")}</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={session ? "/dashboard" : "/signup"}>
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 bg-white text-rose-600 font-bold px-8 py-4 rounded-xl hover:shadow-xl transition-shadow text-base">
                  {t("home.getStarted")}
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <Link href="/faq">
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-base">
                  {t("home.helpCentre")}
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="card-subtle p-6 rounded-2xl space-y-2 text-sm text-slate-500 dark:text-slate-500">
          <p>
            <strong className="text-slate-700 dark:text-slate-400">{t("home.disclaimer")}</strong>{" "}
            {t("home.disclaimerText1")}
          </p>
          <p>{t("home.disclaimerText2")}</p>
        </div>
      </section>
    </>
  );
}
