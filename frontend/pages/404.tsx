import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found | MigRent AI</title>
      </Head>

      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-rose-500">404</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">
            Page not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 btn-primary px-6 py-2.5 rounded-[10px] text-sm"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/seeker/search"
              className="inline-flex items-center gap-2 btn-secondary px-6 py-2.5 rounded-[10px] text-sm"
            >
              <Search className="w-4 h-4" />
              Search Rooms
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
