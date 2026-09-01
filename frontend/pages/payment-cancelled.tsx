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
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          Payment Cancelled
        </h1>

        <p className="text-sm text-[var(--color-ink-3)] leading-relaxed max-w-md mx-auto">
          Your payment was not completed. No charges have been made.
          You can try again from your dashboard whenever you are ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/dashboard" className="btn-primary py-2.5 px-6 rounded-[10px] text-sm inline-block">
            Seeker Dashboard
          </Link>
          <Link href="/dashboard/owner" className="btn-secondary py-2.5 px-6 rounded-[10px] text-sm inline-block">
            Owner Dashboard
          </Link>
        </div>
      </motion.div>

      <p className="text-sm text-[var(--color-ink-3)]">
        Having issues?{" "}
        <Link
          href="/about"
          className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors"
        >
          Contact support
        </Link>
        .
      </p>
    </div>
  );
}
