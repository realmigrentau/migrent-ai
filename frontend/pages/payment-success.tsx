import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { refreshBadges } from "../lib/api";

export default function PaymentSuccess() {
  const router = useRouter();
  const sessionId = router.query.session_id as string | undefined;
  const { session } = useAuth();
  const [badgesRefreshed, setBadgesRefreshed] = useState(false);

  const fireConfetti = useCallback(() => {
    // One burst, not seven.
    //
    // This fired six staged bursts plus a four-second requestAnimationFrame
    // rain, on a page whose only job is to confirm a payment went through. It
    // was a lot of main-thread work and a lot of motion, in seven off-palette
    // colours, with no reduced-motion check at all. Excessive animation is a
    // vestibular trigger, and design.md asks for "silent success over
    // celebratory toasts".
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Loaded on demand so canvas-confetti stays out of the shared bundle.
    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({
        particleCount: 90,
        spread: 110,
        startVelocity: 40,
        origin: { x: 0.5, y: 0.45 },
        // Sand & Ocean: ocean teal, light ocean blue, sea green, dune amber.
        colors: ["#1d6475", "#2e9bd0", "#208073", "#b86b21"],
        ticks: 200,
      });
    });
  }, []);

  // Fire confetti on mount
  useEffect(() => {
    fireConfetti();
  }, [fireConfetti]);

  // Auto-refresh badges after payment success
  useEffect(() => {
    if (session?.access_token && !badgesRefreshed) {
      refreshBadges(session.access_token).then(() => {
        setBadgesRefreshed(true);
      });
    }
  }, [session, badgesRefreshed]);

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="card p-10 rounded-2xl space-y-6"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 10 }}
          className="w-20 h-20 mx-auto rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/20 flex items-center justify-center"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-10 h-10 text-[var(--color-accent)] dark:text-[var(--color-accent)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]"
        >
          Deal Confirmed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-lg text-[var(--color-ink-2)] font-medium"
        >
          Welcome to your new home.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-sm text-[var(--color-ink-3)] leading-relaxed max-w-md mx-auto"
        >
          Your payment has been processed and the deal is confirmed.
          Both parties will receive a confirmation email with dates, total, and contact info shortly.
        </motion.p>

        {sessionId && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-xs text-[var(--color-ink-3)] font-mono"
          >
            Reference: {sessionId.slice(0, 20)}...
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
        >
          <Link href="/dashboard" className="btn-primary py-2.5 px-6 rounded-[10px] text-sm inline-block">
            View deal
          </Link>
          <Link href="/seeker/search" className="btn-secondary py-2.5 px-6 rounded-[10px] text-sm inline-block">
            Browse more rooms
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
