import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Star, Zap, Crown } from "lucide-react";

const ownerFeatures = [
  "Free to list your properties",
  "Unlimited property listings",
  "One-time $99 fee per match",
  "$0 if no bookings",
  "AI-powered tenant matching",
  "Verified tenant profiles",
  "In-app secure messaging",
  "Superhost badge eligible",
  "Smart pricing recommendations",
  "Detailed listing analytics",
  "Priority customer support",
  "Tenant background insights",
  "Automated booking management",
  "Multi-property dashboard",
];

const seekerFreeFeatures = [
  "Unlimited property searches",
  "Apply to unlimited listings",
  "Save favourite searches",
  "Book securely via Stripe",
  "In-app messaging with hosts",
  "Station & visa-based filters",
];

const seekerVerifiedFeatures = [
  "Green verification badge",
  "Hosts trust you more",
  "Priority in matching results",
  "Faster host responses",
  "Early access to new listings",
  "Enhanced profile visibility",
];

function FeatureItem({ text, color }: { text: string; color: "blue" | "rose" | "emerald" }) {
  const colorClasses = {
    blue: "text-blue-500",
    rose: "text-rose-500",
    emerald: "text-emerald-500",
  };
  const bgClasses = {
    blue: "bg-blue-50 dark:bg-blue-500/20",
    rose: "bg-rose-50 dark:bg-rose-500/20",
    emerald: "bg-emerald-100 dark:bg-emerald-500/20",
  };

  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${bgClasses[color]}`}>
        <Check className={`w-3 h-3 ${colorClasses[color]}`} strokeWidth={3} />
      </div>
      {text}
    </li>
  );
}

export default function PricingTables() {
  return (
    <section className="max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Choose your plan
        </h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Transparent pricing for owners and seekers. No subscription traps, ever.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Owner Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="card p-8 rounded-2xl border-t-2 border-t-blue-500 relative"
        >
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-100 dark:border-blue-500/30">
            <Crown className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Property Owners
            </span>
          </div>

          <div className="mb-2">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Pay-Per-Match
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Only pay when you successfully find a tenant
            </p>
          </div>

          <div className="my-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">$99</span>
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">AUD</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">
              One-time per property &bull; Charged only on match
            </p>
          </div>

          <ul className="space-y-3 mb-8">
            {ownerFeatures.map((feature) => (
              <FeatureItem key={feature} text={feature} color="blue" />
            ))}
          </ul>

          <Link
            href="/signup"
            className="block w-full text-center py-2.5 rounded-[10px] text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Start Listing Free
          </Link>
        </motion.div>

        {/* Seeker Cards - Stacked */}
        <div className="space-y-6">
          {/* Seeker Free */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="card p-8 rounded-2xl border-t-2 border-t-rose-500 relative"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/20 border border-rose-100 dark:border-rose-500/30">
              <Zap className="w-3 h-3 text-rose-500" />
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Seekers
              </span>
            </div>

            <div className="mb-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Free Forever</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Search, apply, and book - completely free
              </p>
            </div>

            <div className="my-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-rose-500">$0</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-2">
                No credit card required &bull; No limits
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {seekerFreeFeatures.map((feature) => (
                <FeatureItem key={feature} text={feature} color="rose" />
              ))}
            </ul>

            <Link
              href="/signup"
              className="block w-full text-center py-2.5 rounded-[10px] text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            >
              Start Searching Free
            </Link>
          </motion.div>

          {/* Seeker Verified */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="card p-6 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 relative"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" fill="currentColor" />
              Popular
            </div>

            <div className="flex items-start justify-between mt-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Verified Seeker Badge
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Stand out and get matched faster
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">$19</span>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  One-time
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {seekerVerifiedFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                  {feature}
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="mt-5 block w-full text-center py-2.5 rounded-[10px] text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              Get Verified - $19
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
