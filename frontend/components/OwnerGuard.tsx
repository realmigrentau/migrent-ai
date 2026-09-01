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
      <div className="relative rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]/50 dark:bg-[var(--color-surface-muted)] p-8 text-center overflow-hidden">
        {/* Blurred decorative background */}
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">
            {title}
          </h3>
          <p className="text-sm text-[var(--color-ink-3)] mb-6">
            {description}
          </p>
          <Link href="/signup">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)] transition-colors"
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
