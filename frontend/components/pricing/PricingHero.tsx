import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Shield, CheckCircle, Clock } from "lucide-react";

export default function PricingHero() {
  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Gradient background - full width */}
      <div className="absolute inset-0 gradient-indigo-pink" />
      {/* Decorative white orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        {/* Centered layout */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight tracking-tight">
              Simple pricing.
              <br />
              <span className="text-yellow-300">Start listing free.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/70 max-w-xl mx-auto">
              One-time AUD $99 per property - no subscriptions, no hidden charges.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-4 mt-10"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/15">
              <div className="text-3xl sm:text-4xl font-bold text-white">$99</div>
              <div className="text-xs text-white/60 font-medium mt-1">Owners</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/15">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-300">Free</div>
              <div className="text-xs text-white/60 font-medium mt-1">Seekers</div>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50"
          >
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
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Link href="/signup">
              <span className="inline-flex items-center gap-2 bg-white text-slate-900 text-sm px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                <Sparkles className="w-4 h-4" />
                Start Listing Free
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
