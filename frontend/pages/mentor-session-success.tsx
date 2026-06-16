import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";

export default function MentorSessionSuccessPage() {
  return (
    <>
      <Head>
        <title>Session Booked! - MigRent</title>
      </Head>

      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-accent)] to-[var(--color-primary)] flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold text-[var(--color-ink)]">
          Session Booked!
        </h1>

        <p className="text-[var(--color-ink-2)] max-w-sm mx-auto">
          Your mentor session has been confirmed. Your mentor will reach out to you soon with session details.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/messages">
            <motion.span
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Go to Messages
            </motion.span>
          </Link>
          <Link href="/mentors">
            <motion.span
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 bg-[var(--color-surface-muted)] text-[var(--color-ink-2)] font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Browse More Mentors
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </div>
      </div>
    </>
  );
}
