import { motion } from "framer-motion";
import Link from "next/link";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Contact <span className="gradient-text">MigRent AI</span>
        </h1>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ABN</span>
            <p className="text-slate-900 dark:text-white font-semibold">22 669 566 941</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Structure</span>
            <p>Sole Trader</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Email</span>
            <p>
              <a
                href="mailto:stonegold84@gmail.com"
                className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors"
              >
                stonegold84@gmail.com
              </a>
            </p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Location</span>
            <p>Virtual business operating in Sydney/Adelaide</p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">About MigRent</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          MigRent AI is an online matching platform that connects room owners and
          accommodation seekers for short- to medium-term rooms in Sydney and
          Adelaide. MigRent is not a real estate agent, landlord, tenant, or legal
          representative of any user.
        </p>
      </motion.section>

      <div className="text-sm text-slate-500 dark:text-slate-400">
        <p>
          Need help?{" "}
          <Link
            href="/support"
            className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors"
          >
            Visit our support page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
