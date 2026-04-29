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
import OwnerGuard from "../components/OwnerGuard";

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
          <OwnerGuard
            teaserTitle="Owner Earnings Calculator"
            teaserDescription="Sign up as a property owner to estimate your rental earnings with our interactive calculator."
          >
            <EarningsCalculator />
          </OwnerGuard>
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
            className="relative rounded-2xl overflow-hidden bg-slate-900 dark:bg-slate-800"
          >
            <div className="text-center py-14 px-6">
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4 tracking-tight">
                Ready to get started?
              </h2>
              <p className="text-white/70 text-sm sm:text-base max-w-lg mx-auto mb-8">
                Join thousands of hosts and seekers across Australia.
                List your property for free or start your search today.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup">
                  <span className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors">
                    List Your Room Free
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
                <Link href="#calculator">
                  <span className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors">
                    <Calculator className="w-4 h-4" />
                    Earnings Calculator
                  </span>
                </Link>
                <Link href="/contact">
                  <span className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Talk to Sales
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
