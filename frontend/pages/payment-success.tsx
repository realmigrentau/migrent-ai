import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";

export default function PaymentSuccess() {
  const router = useRouter();
  const sessionId = router.query.session_id as string | undefined;

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card p-10 rounded-2xl space-y-6"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Payment <span className="gradient-text">Successful</span>
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          Your payment has been processed. You can now continue using MigRent.
          A confirmation email will be sent to you shortly.
        </p>

        {sessionId && (
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            Reference: {sessionId.slice(0, 20)}...
          </p>
        )}

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
    </div>
  );
}
