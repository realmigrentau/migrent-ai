import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Home, MessageSquare } from "lucide-react";
import SEOHead from "../components/SEOHead";

export default function BookingSuccessPage() {
  return (
    <>
      <SEOHead title="Booking Confirmed - MigRent" />
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle className="w-16 h-16 mx-auto text-emerald-500" />
          </motion.div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Booking Confirmed!
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Your payment was successful and your booking is now confirmed.
              Both you and the owner will receive a confirmation email.
            </p>
          </div>

          <div className="card p-5 rounded-xl text-left space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Next steps
            </h3>
            <div className="space-y-2">
              {[
                { icon: MessageSquare, text: "Message the owner to coordinate move-in details" },
                { icon: Home, text: "Prepare your documents (ID, visa if applicable)" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <step.icon className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {step.text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/seeker"
              className="flex-1 btn-primary py-3 px-6 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2"
            >
              View My Bookings
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/seeker/search"
              className="flex-1 py-3 px-6 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              Browse More Listings
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
