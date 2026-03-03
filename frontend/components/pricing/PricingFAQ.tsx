import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How much do I really pay as an owner?",
    answer:
      "Owners pay a one-time AUD $99 listing fee per property, charged only when you successfully match with a tenant. There are no monthly subscriptions, no rent commissions, and no hidden fees. If nobody books, you pay nothing.",
  },
  {
    question: "Is the verification badge worth $19?",
    answer:
      "Absolutely. Verified seekers get a green trust badge on their profile, appear higher in host search results, and receive faster responses. Hosts are 3x more likely to accept verified seekers. It's a one-time payment that stays with your account forever.",
  },
  {
    question: "When do owners get paid out?",
    answer:
      "Payments are processed securely through Stripe. Once a tenant confirms their booking and the move-in is verified, funds are released to your bank account within 2-5 business days. You're always in control.",
  },
  {
    question: "What if a tenant cancels?",
    answer:
      "Our cancellation policy protects both parties. If a tenant cancels before move-in, you won't be charged the listing fee for that match. You can re-list your property immediately at no extra cost.",
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "Zero hidden fees. What you see is what you get. Owners pay $99 per successful match, seekers browse and apply for free (with an optional $19 verification badge). No processing fees, no service charges, no surprises.",
  },
  {
    question: "Do you offer student or migrant discounts?",
    answer:
      "Seekers already use MigRent completely free! For owners, we occasionally run promotions for first-time listers. Follow us on social media or check your dashboard for the latest offers.",
  },
  {
    question: "How does AI matching work?",
    answer:
      "Our AI analyses seeker preferences (budget, location, visa type, proximity to stations) and matches them with compatible listings. Owners get pre-qualified leads, and seekers see only relevant properties. It saves everyone time.",
  },
  {
    question: "What makes MigRent different from Gumtree or Facebook?",
    answer:
      "MigRent is purpose-built for migrants and international students in Australia. Every host is verified, payments are secure via Stripe, and our AI matching means no more scrolling through irrelevant listings. Plus, migrant-specific filters like visa type and station proximity.",
  },
  {
    question: "Can I list multiple properties?",
    answer:
      "Yes! You can list unlimited properties for free. The $99 fee is charged per property only when a tenant is successfully matched. List 1 room or 100 properties &mdash; you only pay for results.",
  },
  {
    question: "How do I become a Superhost?",
    answer:
      "Maintain a 4.8+ rating, respond within 24 hours, and complete 5+ successful bookings. Superhosts get a gold badge, priority placement in search results, and exclusive access to premium seekers. The badge is free once you meet the criteria.",
  },
];

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card hover-glow rounded-xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
      >
        <span className="font-semibold text-sm text-slate-900 dark:text-white pr-4">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-indigo-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-4">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            Got questions?
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Frequently Asked <span className="gradient-text-indigo">Questions</span>
        </h2>
      </motion.div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <FAQAccordionItem
            key={faq.question}
            item={faq}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}
