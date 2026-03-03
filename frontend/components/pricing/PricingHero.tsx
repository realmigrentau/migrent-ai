import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Shield, CheckCircle, Clock } from "lucide-react";

export default function PricingHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 sm:mx-6 lg:mx-auto max-w-5xl">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-indigo-pink" />
      {/* Decorative white orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

      <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10">
        {/* Top row: headline + badge */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Simple pricing. <span className="text-yellow-300">Start listing free.</span>
            </h1>
            <p className="mt-2 text-sm text-white/70 max-w-md">
              One-time AUD $99 per property &mdash; no subscriptions, no hidden charges.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center border border-white/15">
              <div className="text-2xl font-black text-white">$99</div>
              <div className="text-[10px] text-white/60 font-medium">Owners</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center border border-white/15">
              <div className="text-2xl font-black text-yellow-300">Free</div>
              <div className="text-[10px] text-white/60 font-medium">Seekers</div>
            </div>
          </motion.div>
        </div>

        {/* Bottom row: trust badges + CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Stripe-secured</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>100% verified hosts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>30-day guarantee</span>
            </div>
          </div>

          <Link href="/signup">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-white text-indigo-600 text-sm px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Start Listing Free
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
