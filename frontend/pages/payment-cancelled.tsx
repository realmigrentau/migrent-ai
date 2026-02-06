import { motion } from "framer-motion";
import Link from "next/link";

export default function PaymentCancelled() {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card p-10 rounded-2xl space-y-6"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Payment <span className="gradient-text">Cancelled</span>
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          Your payment was not completed. No charges have been made.
          You can try again from your dashboard whenever you are ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/seeker/dashboard">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary py-3 px-6 rounded-xl text-sm inline-block"
            >
              Seeker Dashboard
            </motion.span>
          </Link>
          <Link href="/owner/dashboard">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary py-3 px-6 rounded-xl text-sm inline-block"
            >
              Owner Dashboard
            </motion.span>
          </Link>
        </div>
      </motion.div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Having issues?{" "}
        <Link
          href="/about"
          className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors"
        >
          Contact support
        </Link>
        .
      </p>
    </div>
  );
}
