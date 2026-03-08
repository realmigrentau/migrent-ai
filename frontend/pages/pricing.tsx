import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";
import { ArrowRight, MessageCircle, Calculator } from "lucide-react";
import PricingHero from "../components/pricing/PricingHero";
import PricingTables from "../components/pricing/PricingTables";
import EarningsCalculator from "../components/pricing/EarningsCalculator";
import ComparisonTable from "../components/pricing/ComparisonTable";
import PricingFAQ from "../components/pricing/PricingFAQ";
import TestimonialCarousel from "../components/pricing/TestimonialCarousel";

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing | MigRent AI</title>
        <meta
          name="description"
          content="MigRent AI pricing - AUD $99 one-time owner fee per property match, seekers browse free. No subscriptions, no rent commissions, no hidden fees."
        />
      </Head>

      <div className="pb-12">
        <div className="-mt-6">
          <PricingHero />
        </div>
        <div className="h-20" />
        <div className="space-y-20">
          <PricingTables />
          <EarningsCalculator />
          <ComparisonTable />
          <TestimonialCarousel />
          <PricingFAQ />
        </div>

        {/* Bottom CTA */}
        <section className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden"
          >
            {/* Gradient background matching dashboard hero */}
            <div className="absolute inset-0 gradient-indigo-pink" />
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-36 h-36 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10 text-center py-14 px-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-black text-white mb-4"
              >
                Ready to get started?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-white/80 text-sm sm:text-base max-w-lg mx-auto mb-8"
              >
                Join thousands of hosts and seekers across Australia.
                List your property for free or start your search today.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <Link href="/signup">
                  <motion.span
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-white text-slate-900 hover:shadow-xl transition-shadow"
                  >
                    List Your Room Free
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Link>
                <Link href="#calculator">
                  <motion.span
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-white/15 text-white border border-white/25 hover:bg-white/25 transition-colors"
                  >
                    <Calculator className="w-4 h-4" />
                    Earnings Calculator
                  </motion.span>
                </Link>
                <Link href="/contact">
                  <motion.span
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-white/15 text-white border border-white/25 hover:bg-white/25 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Talk to Sales
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
