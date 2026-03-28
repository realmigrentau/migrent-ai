import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { useOwner } from "../hooks/useOwner";

interface OwnerGuardProps {
  children: ReactNode;
  /** Custom fallback UI - overrides the default teaser */
  fallback?: ReactNode;
  /** Title shown in the default teaser */
  teaserTitle?: string;
  /** Description shown in the default teaser */
  teaserDescription?: string;
}

function DefaultTeaser({
  title = "Owner-Only Feature",
  description = "Sign up as a property owner to access earnings calculators and financial tools.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-lg mx-auto"
    >
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-8 text-center overflow-hidden">
        {/* Blurred decorative background */}
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {description}
          </p>
          <Link href="/signup">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            >
              Sign Up as Owner
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Wraps owner-only UI. Shows children if the user is a signed-in owner,
 * otherwise shows a teaser prompting sign-up.
 */
export default function OwnerGuard({
  children,
  fallback,
  teaserTitle,
  teaserDescription,
}: OwnerGuardProps) {
  const { isOwner, loading } = useOwner();

  // While auth is loading, render nothing to avoid flicker
  if (loading) return null;

  if (!isOwner) {
    return (
      <>
        {fallback ?? (
          <DefaultTeaser title={teaserTitle} description={teaserDescription} />
        )}
      </>
    );
  }

  return <>{children}</>;
}
