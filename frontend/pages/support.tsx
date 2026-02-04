import { useState, FormEvent } from "react";
import { submitSupportRequest } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface FAQProps {
  q: string;
  a: string;
}

function FAQItem({ q, a }: FAQProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm pr-4">{q}</h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 shrink-0"
        >
          &#x25BE;
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Support() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"seeker" | "owner">("seeker");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus("Please fill in all required fields.");
      return;
    }
    await submitSupportRequest({ name, email, role, message });
    setStatus(
      "Your message has been submitted. We will get back to you by email."
    );
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Support &amp; <span className="gradient-text">Contact</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">We&apos;re here to help</p>
      </motion.div>

      {/* FAQ */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          <FAQItem
            q="I can't log in — what should I do?"
            a="Try resetting your password using the login page. If the problem persists, contact us using the form below."
          />
          <FAQItem
            q="How do I report a suspicious listing or user?"
            a="Use the contact form below and select your role. Describe the issue in detail and our team will investigate."
          />
          <FAQItem
            q="When is the owner fee charged?"
            a="The one-time AUD 99 platform fee is charged to owners when a successful match is confirmed through MigRent."
          />
          <FAQItem
            q="How do fees work?"
            a="Owners pay a one-time AUD $99 platform fee per listing. Seekers may pay an optional AUD $19 fee."
          />
          <FAQItem
            q="Is MigRent AI a real estate agent?"
            a="No. MigRent AI is a matching platform only. We do not hold bond or rent, and are not a party to any tenancy agreement."
          />
          <FAQItem
            q="How do I report a problem?"
            a="Use the Report button on any listing or profile, or contact us at stonegold84@gmail.com"
          />
          <FAQItem
            q="Refunds & disputes"
            a="MigRent AI fees are non-refundable once confirmed. For exceptional cases, contact stonegold84@gmail.com. Stripe receipts are sent to your email on payment."
          />
        </div>
      </section>

      {/* Contact form */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Contact us</h2>
        <form onSubmit={handleSubmit} className="card p-6 rounded-2xl space-y-4 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />
          <input
            type="text"
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "seeker" | "owner")}
            className="input-field"
          >
            <option value="seeker">I am a Seeker</option>
            <option value="owner">I am an Owner</option>
          </select>
          <textarea
            placeholder="Message *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
            className="input-field"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-primary py-3 px-6 rounded-xl text-sm"
          >
            Send Message
          </motion.button>
          {status && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm p-3 rounded-xl ${
                status.includes("submitted")
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
              }`}
            >
              {status}
            </motion.p>
          )}
        </form>
      </section>

      {/* Contact email */}
      <section>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You can also reach us at{" "}
          <a
            href="mailto:stonegold84@gmail.com"
            className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors"
          >
            stonegold84@gmail.com
          </a>
          .
        </p>
      </section>

      {/* Business details */}
      <section className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-6 border-t border-slate-200 dark:border-slate-800">
        <p className="font-medium text-slate-600 dark:text-slate-300">MigRent AI</p>
        <p>ABN: 22 669 566 941 | Sole Trader</p>
        <p>Virtual business operating in Sydney/Adelaide</p>
      </section>

      {/* Future AI assistant */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card p-5 rounded-2xl border-l-2 border-l-rose-500"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          In the future, an AI assistant (for example, &quot;Emily &mdash;
          MigRent Helpbot&quot;) will be available here to answer common
          questions instantly.
        </p>
      </motion.section>
    </div>
  );
}
