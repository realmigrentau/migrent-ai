import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, CheckCircle, Clock, Sparkles } from "lucide-react";

export default function PricingHero() {
  return (
    <section className="relative text-center pt-4 pb-20 overflow-hidden">
      {/* Full-width gradient background like dashboard hero */}
      <div className="absolute inset-0 gradient-indigo-pink rounded-b-3xl" />
      {/* Decorative white orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span className="text-xs font-semibold text-white">
            No monthly fees. No commissions.
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white"
        >
          Simple pricing.{" "}
          <span className="text-yellow-300">Start listing free.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
        >
          Pay only when you find a tenant. One-time AUD $99 per property &mdash;
          no subscriptions, no hidden charges, no rent commissions.
        </motion.p>

        {/* Price highlight pills */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-0"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-5 text-left border border-white/15">
            <div className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Owner listing fee
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-white">
                $99
              </span>
              <span className="text-sm font-medium text-white/50">
                AUD / property
              </span>
            </div>
            <div className="text-xs text-emerald-300 font-medium mt-1">
              One-time fee &mdash; only when matched
            </div>
          </div>
          <div className="hidden sm:block w-px h-14 bg-white/20 mx-4" />
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-5 text-left border border-white/15">
            <div className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Seekers
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-yellow-300">
                Free
              </span>
            </div>
            <div className="text-xs text-white/50 font-medium mt-1">
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
              className="inline-block bg-white text-indigo-600 text-sm px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-shadow"
            >
              Start Listing Free
            </motion.span>
          </Link>
          <Link href="#calculator">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block bg-white/15 border border-white/25 text-white text-sm px-8 py-3.5 rounded-xl font-semibold hover:bg-white/25 transition-colors"
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
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50"
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
