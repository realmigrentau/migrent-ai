import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";
import { Home, RefreshCw } from "lucide-react";

export default function ServerError() {
  return (
    <>
      <Head>
        <title key="title">Something Went Wrong | MigRent</title>
      </Head>

      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10 border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-black text-[var(--color-warn-500)]">500</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-[var(--color-ink)] mb-3">
            Something went wrong
          </h1>
          <p className="text-[var(--color-ink-3)] mb-8">
            We are working on fixing this. Please try again in a moment.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </motion.span>
            </Link>
            <button
              onClick={() => window.location.reload()}
            >
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 btn-secondary px-6 py-3 rounded-xl text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.span>
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
