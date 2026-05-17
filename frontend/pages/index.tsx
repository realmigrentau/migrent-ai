import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { motion } from "framer-motion";
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
  Phone,
  Lock,
  ArrowRight,
  BadgeCheck,
  MapPin,
} from "lucide-react";

const pressLogos: string[] = [];

export default function Home() {
  const { session } = useAuth();
  const { t } = useTranslation();

  const features = [
    { icon: Globe, title: t("home.feat1Title"), desc: t("home.feat1Desc") },
    { icon: ShieldCheck, title: t("home.feat2Title"), desc: t("home.feat2Desc") },
    { icon: Sparkles, title: t("home.feat3Title"), desc: t("home.feat3Desc") },
    { icon: CreditCard, title: t("home.feat4Title"), desc: t("home.feat4Desc") },
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
        <title>MigRent AI - Find Verified Rooms in Australia</title>
        <meta name="description" content="MigRent helps migrants, students, and professionals find verified rooms from trusted Australian owners - faster and safer than classifieds." />
        <meta property="og:title" content="MigRent AI - Find Verified Rooms in Australia" />
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

      {/* SECTION 1 - HERO */}
      <section className="relative pt-16 md:pt-24 pb-20 md:pb-28 bg-[var(--color-bg)] border-b border-[var(--color-line)]">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="pulse-dot" />
              <span className="eyebrow">{t("home.badge")}</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[0.98] tracking-[-0.025em] text-[var(--color-ink)] text-balance">
              {t("home.headline1")}{" "}
              <span className="italic text-[var(--color-ink-2)]">{t("home.headline2")}</span>
            </h1>

            <p className="mt-6 text-[17px] text-[var(--color-ink-2)] max-w-2xl leading-relaxed">
              {t("home.subtitle")}
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-2.5">
              <Link href={session ? "/dashboard" : "/for-seekers"} className="btn-primary h-12 px-6 text-[15px] rounded-[10px]">
                {t("home.seekerCta")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href={session ? "/owner/dashboard" : "/for-owners"} className="btn-secondary h-12 px-6 text-[15px] rounded-[10px]">
                {t("home.ownerCta")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-5 flex items-center gap-5 text-sm">
              <Link href="/pricing" className="text-[var(--color-ink-3)] hover:text-[var(--color-ink)] underline underline-offset-[3px] decoration-[var(--color-line-2)] hover:decoration-[var(--color-ink-3)] transition-colors">
                {t("home.viewPricing")}
              </Link>
              <span className="w-1 h-1 rounded-full bg-[var(--color-line-2)]" />
              <Link href="/about" className="text-[var(--color-ink-3)] hover:text-[var(--color-ink)] underline underline-offset-[3px] decoration-[var(--color-line-2)] hover:decoration-[var(--color-ink-3)] transition-colors">
                {t("home.learnMore")}
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-2">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 h-[26px] rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <badge.icon className="w-3.5 h-3.5" />
                  <span className="text-[12.5px] font-semibold">{badge.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 - MARQUEE */}
      <section className="py-14 bg-[var(--color-surface)] border-b border-[var(--color-line)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="eyebrow mb-2">{t("home.marqueeAccent")}</div>
            <h2 className="font-serif text-3xl md:text-4xl tracking-[-0.02em] text-[var(--color-ink)]">
              {t("home.marqueeTitle")}
            </h2>
            <p className="mt-2 text-[15px] text-[var(--color-ink-2)] max-w-lg">{t("home.marqueeSubtitle")}</p>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <OwnerMarquee />
        </motion.div>
      </section>

      {/* SECTION 3 - WHY MIGRENT */}
      <section className="py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 max-w-2xl">
            <div className="eyebrow mb-2">{t("home.whyBadge")}</div>
            <h2 className="font-serif text-3xl md:text-5xl tracking-[-0.025em] leading-[1.05] text-[var(--color-ink)]">
              {t("home.whyTitle")} <span className="italic text-[var(--color-ink-2)]">{t("home.whyAccent")}</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="card p-6"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[var(--color-ink)] font-semibold text-[15px] mb-1.5 tracking-[-0.005em]">{feature.title}</h3>
                <p className="text-[13px] text-[var(--color-ink-2)] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 - HOW IT WORKS */}
      <section className="py-20 md:py-24 bg-[var(--color-surface)] border-y border-[var(--color-line)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 max-w-2xl">
            <div className="eyebrow mb-2">{t("home.howBadge")}</div>
            <h2 className="font-serif text-3xl md:text-5xl tracking-[-0.025em] leading-[1.05] text-[var(--color-ink)]">
              {t("home.howTitle")} <span className="italic text-[var(--color-ink-2)]">{t("home.howAccent")}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Seekers panel */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="rounded-[14px] bg-[var(--color-surface-2)] border border-[var(--color-line)] p-7">
              <div className="flex items-center gap-3 mb-7">
                <span className="w-9 h-9 rounded-[8px] bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-fg)] font-bold text-sm">S</span>
                <h3 className="font-serif text-2xl text-[var(--color-ink)] tracking-[-0.012em]">{t("home.forSeekers")}</h3>
              </div>
              <div className="space-y-5">
                {seekerSteps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-[8px] bg-[var(--color-surface-sunk)] border border-[var(--color-line)] flex items-center justify-center shrink-0 text-[var(--color-ink-2)]">
                      <step.icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--color-ink)] text-[14.5px]">{step.title}</h4>
                      <p className="text-[13px] text-[var(--color-ink-2)] mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/for-seekers" className="btn-primary mt-7 h-11 px-5 text-sm rounded-[10px] inline-flex">
                {t("home.startSearching")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Owners panel */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-[14px] bg-[var(--color-surface-2)] border border-[var(--color-line)] p-7">
              <div className="flex items-center gap-3 mb-7">
                <span className="w-9 h-9 rounded-[8px] bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-accent-fg)] font-bold text-sm">O</span>
                <h3 className="font-serif text-2xl text-[var(--color-ink)] tracking-[-0.012em]">{t("home.forOwners")}</h3>
              </div>
              <div className="space-y-5">
                {ownerSteps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-[8px] bg-[var(--color-surface-sunk)] border border-[var(--color-line)] flex items-center justify-center shrink-0 text-[var(--color-ink-2)]">
                      <step.icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--color-ink)] text-[14.5px]">{step.title}</h4>
                      <p className="text-[13px] text-[var(--color-ink-2)] mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/for-owners" className="btn-secondary mt-7 h-11 px-5 text-sm rounded-[10px] inline-flex">
                {t("home.listYourRoom")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - VISUAL STORIES */}
      <section className="py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 flex items-end justify-between gap-6 flex-wrap">
            <div className="max-w-2xl">
              <div className="eyebrow mb-2">{t("home.storiesBadge")}</div>
              <h2 className="font-serif text-3xl md:text-5xl tracking-[-0.025em] leading-[1.05] text-[var(--color-ink)]">
                {t("home.storiesTitle")} <span className="italic text-[var(--color-ink-2)]">{t("home.storiesAccent")}</span> {t("home.storiesEnd")}
              </h2>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-3">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="md:col-span-2 md:row-span-2 relative rounded-[14px] overflow-hidden group min-h-[300px] md:min-h-[480px] border border-[var(--color-line)]">
              <Image src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" alt="Beautiful furnished room" fill className="object-cover group-hover:scale-[1.02] transition-transform duration-700" sizes="(max-width: 768px) 100vw, 66vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="inline-flex items-center h-[22px] px-2 mb-3 rounded-full bg-[var(--color-bg)] text-[var(--color-ink)] text-[11px] font-bold uppercase tracking-[0.04em]">{t("home.featured")}</span>
                <h3 className="text-white font-serif text-2xl md:text-3xl tracking-[-0.012em]">{t("home.featuredTitle")}</h3>
                <p className="text-white/85 text-[13.5px] mt-2 max-w-md leading-relaxed">{t("home.featuredDesc")}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }} className="relative rounded-[14px] overflow-hidden group h-[220px] border border-[var(--color-line)]">
              <Image src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80" alt="Modern bedroom" fill className="object-cover group-hover:scale-[1.02] transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-flex items-center h-[18px] px-1.5 mb-2 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-[10px] font-bold uppercase tracking-[0.04em]">{t("home.successStory")}</span>
                <h4 className="text-white font-semibold text-sm">{t("home.story1")}</h4>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }} className="relative rounded-[14px] overflow-hidden group h-[220px] border border-[var(--color-line)]">
              <Image src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80" alt="Cozy living space" fill className="object-cover group-hover:scale-[1.02] transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-flex items-center h-[18px] px-1.5 mb-2 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-[0.04em]">{t("home.successStory")}</span>
                <h4 className="text-white font-semibold text-sm">{t("home.story2")}</h4>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 6 - TRUST HIGHLIGHTS */}
      <section className="py-20 md:py-24 bg-[var(--color-surface-sunk)] border-y border-[var(--color-line)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 max-w-2xl">
            <div className="eyebrow mb-2">{t("home.testimonialsBadge")}</div>
            <h2 className="font-serif text-3xl md:text-5xl tracking-[-0.025em] leading-[1.05] text-[var(--color-ink)]">
              Built for trust.
            </h2>
            <p className="mt-4 text-[15px] text-[var(--color-ink-2)] max-w-xl leading-relaxed">
              Everything you need to rent with confidence in Australia.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: ShieldCheck, label: "Verified profiles", desc: "Identity checks for hosts and seekers" },
              { icon: Sparkles, label: "AI matching", desc: "Find rooms by visa, budget, and location" },
              { icon: HomeIcon, label: "Real listings only", desc: "Every listing is reviewed before going live" },
              { icon: Handshake, label: "Secure payments", desc: "Stripe-powered with no hidden fees" },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }} className="card bg-[var(--color-surface-2)] p-6">
                <div className="w-10 h-10 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="text-[14.5px] font-semibold text-[var(--color-ink)] mb-1 tracking-[-0.005em]">{item.label}</p>
                <p className="text-[13px] text-[var(--color-ink-2)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {pressLogos.length > 0 && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-14 text-center">
              <div className="eyebrow mb-5">{t("home.asSeenOn")}</div>
              <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
                {pressLogos.map((name) => (
                  <div key={name} className="px-6 py-3 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)] text-sm font-semibold">{name}</div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* SECTION 7 - SAFETY & TRUST */}
      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 max-w-2xl">
            <div className="eyebrow mb-2">{t("home.safetyBadge")}</div>
            <h2 className="font-serif text-3xl md:text-5xl tracking-[-0.025em] leading-[1.05] text-[var(--color-ink)]">
              {t("home.safetyTitle")} <span className="italic text-[var(--color-ink-2)]">{t("home.safetyAccent")}</span>
            </h2>
            <p className="mt-4 text-[15px] text-[var(--color-ink-2)] max-w-xl leading-relaxed">{t("home.safetySubtitle")}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-3">
            {trustItems.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }} className="card p-7">
                <div className="w-11 h-11 rounded-[10px] bg-[var(--color-accent-soft)] flex items-center justify-center mb-5 text-[var(--color-accent)]">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-[var(--color-ink)] text-[15px] mb-2 tracking-[-0.005em]">{item.title}</h3>
                <p className="text-[13px] text-[var(--color-ink-2)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 - BOTTOM CTA */}
      <section className="py-20 md:py-28 bg-[var(--color-primary)]">
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="font-serif text-4xl md:text-6xl tracking-[-0.025em] text-[var(--color-primary-fg)] leading-[1.05]">{t("home.ctaTitle")}</h2>
            <p className="mt-5 text-[16px] text-[var(--color-primary-fg)]/85 max-w-xl mx-auto leading-relaxed">{t("home.ctaSubtitle")}</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link href={session ? "/dashboard" : "/signup"} className="inline-flex items-center gap-2 bg-[var(--color-bg)] text-[var(--color-ink)] font-semibold px-6 h-12 rounded-[10px] hover:bg-[var(--color-surface)] transition-colors text-[15px]">
                {t("home.getStarted")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/faq" className="inline-flex items-center gap-2 bg-transparent border border-[var(--color-primary-fg)]/25 text-[var(--color-primary-fg)] font-semibold px-6 h-12 rounded-[10px] hover:bg-[var(--color-primary-fg)]/10 transition-colors text-[15px]">
                {t("home.helpCentre")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="card-subtle p-6 space-y-2 text-sm text-[var(--color-ink-3)]">
          <p>
            <strong className="text-[var(--color-ink-2)]">{t("home.disclaimer")}</strong>{" "}
            {t("home.disclaimerText1")}
          </p>
          <p>{t("home.disclaimerText2")}</p>
        </div>
      </section>
    </>
  );
}
