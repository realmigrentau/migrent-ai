import { motion } from "framer-motion";
import { Star, Quote, Users, TrendingUp, Heart } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "Listed my Sydney room and got booked in just 48 hours. The AI matching is incredible.",
    name: "Priya M.",
    role: "Property Owner, Sydney",
    rating: 5,
  },
  {
    quote: "Found a safe, verified room near my uni station in 3 days. No scams, no stress.",
    name: "Ahmed K.",
    role: "International Student, Melbourne",
    rating: 5,
  },
  {
    quote: "Transparent fees with no surprises. MigRent is exactly what the rental market needed.",
    name: "Sarah L.",
    role: "Superhost, Brisbane",
    rating: 5,
  },
  {
    quote: "As a new migrant, trust is everything. The verification badge gave hosts confidence in me.",
    name: "Wei C.",
    role: "Verified Seeker, Perth",
    rating: 5,
  },
];

const stats = [
  { label: "Host satisfaction", value: "98%", icon: Heart },
  { label: "Seeker rating", value: "4.9/5", icon: Star },
  { label: "Active users", value: "10K+", icon: Users },
  { label: "Avg. match time", value: "48hrs", icon: TrendingUp },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5 text-amber-400"
          fill="currentColor"
        />
      ))}
    </div>
  );
}

export default function TestimonialCarousel() {
  return (
    <section className="max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Loved by <span className="gradient-text">thousands</span>
        </h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Real stories from real users across Australia.
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card p-4 rounded-xl text-center"
          >
            <stat.icon className="w-5 h-5 text-rose-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Testimonial cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="card p-6 rounded-xl relative group hover:shadow-lg transition-shadow"
          >
            <Quote className="w-8 h-8 text-rose-100 dark:text-rose-500/10 absolute top-4 right-4" />
            <StarRating count={t.rating} />
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-indigo-400 flex items-center justify-center text-white text-xs font-bold">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t.name}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {t.role}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
