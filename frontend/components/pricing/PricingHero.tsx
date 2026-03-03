import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, CheckCircle, Clock } from "lucide-react";

function CountUp({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {target.toLocaleString()}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

export default function PricingHero() {
  return (
    <section className="relative text-center pt-12 pb-20 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/3 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 mb-6"
        >
          <span className="pulse-dot" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            No monthly fees. No commissions.
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
        >
          Simple pricing.{" "}
          <span className="gradient-text">Start listing free.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Pay only when you find a tenant. One-time AUD $99 per property &mdash;
          no subscriptions, no hidden charges, no rent commissions.
        </motion.p>

        {/* Price highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 inline-flex items-center gap-3 glass-card px-8 py-5 rounded-2xl"
        >
          <div className="text-left">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Owner listing fee
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                $99
              </span>
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                AUD / property
              </span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              One-time fee &mdash; only when matched
            </div>
          </div>
          <div className="w-px h-14 bg-slate-200 dark:bg-slate-700 mx-2" />
          <div className="text-left">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Seekers
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl sm:text-5xl font-black gradient-text">
                Free
              </span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
              Search, apply &amp; book
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/signup">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block btn-primary text-sm px-8 py-3.5 rounded-xl font-semibold"
            >
              Start Listing Free
            </motion.span>
          </Link>
          <Link href="#calculator">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block btn-secondary text-sm px-8 py-3.5 rounded-xl font-semibold"
            >
              See Owner Calculator
            </motion.span>
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-500"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Stripe-secured payments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>100% verified hosts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>30-day money-back guarantee</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
