import { motion } from "framer-motion";
import { Shield, Sparkles, Clock, DollarSign } from "lucide-react";

const highlights = [
  {
    icon: Shield,
    label: "Verified hosts and seekers",
    desc: "Every user goes through identity verification",
    color: "text-[var(--color-accent)]",
    bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20",
  },
  {
    icon: Sparkles,
    label: "AI-powered matching",
    desc: "Find rooms that fit your visa, budget, and location",
    color: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20",
  },
  {
    icon: Clock,
    label: "Fast response times",
    desc: "Most hosts respond within 24 hours",
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-500/20",
  },
  {
    icon: DollarSign,
    label: "Transparent pricing",
    desc: "No hidden fees - one-time listing fee only",
    color: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/20",
  },
];

export default function TestimonialCarousel() {
  return (
    <section className="max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Built for trust
        </h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Everything you need to rent with confidence in Australia.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {highlights.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="card p-6 rounded-xl"
          >
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              {item.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
