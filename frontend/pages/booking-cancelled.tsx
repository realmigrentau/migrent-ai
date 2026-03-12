import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, ArrowRight } from "lucide-react";
import SEOHead from "../components/SEOHead";

export default function BookingCancelledPage() {
  return (
    <>
      <SEOHead title="Payment Cancelled - MigRent" />
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <XCircle className="w-16 h-16 mx-auto text-amber-500" />

          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Payment Not Completed
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Your payment was not completed. Your booking request is still active
              and you can complete payment from your dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/seeker"
              className="flex-1 btn-primary py-3 px-6 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/seeker/search"
              className="flex-1 py-3 px-6 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              Browse Listings
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
