import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import confetti from "canvas-confetti";
import { useAuth } from "../hooks/useAuth";
import { refreshBadges } from "../lib/api";

export default function PaymentSuccess() {
  const router = useRouter();
  const sessionId = router.query.session_id as string | undefined;
  const { session } = useAuth();
  const [badgesRefreshed, setBadgesRefreshed] = useState(false);

  const fireConfetti = useCallback(() => {
    const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

    // Big center burst
    confetti({
      particleCount: 150,
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.4 },
      colors,
      ticks: 300,
    });

    // Left cannon
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        startVelocity: 50,
        origin: { x: 0, y: 0.65 },
        colors,
        ticks: 250,
      });
    }, 200);

    // Right cannon
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        startVelocity: 50,
        origin: { x: 1, y: 0.65 },
        colors,
        ticks: 250,
      });
    }, 400);

    // Star shapes from top
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 360,
        startVelocity: 30,
        origin: { x: 0.5, y: 0 },
        gravity: 0.8,
        shapes: ["star"],
        colors: ["#f59e0b", "#fbbf24", "#fcd34d"],
        scalar: 1.5,
        ticks: 200,
      });
    }, 600);

    // Continuous rain effect
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    setTimeout(frame, 800);

    // Final burst at 3s
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 160,
        startVelocity: 35,
        origin: { x: 0.5, y: 0.6 },
        colors,
        ticks: 200,
      });
    }, 3000);
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
          className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
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
          className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white"
        >
          Deal <span className="gradient-text">Confirmed!</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-lg text-slate-600 dark:text-slate-300 font-medium"
        >
          Welcome to your new home.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto"
        >
          Your payment has been processed and the deal is confirmed.
          Both parties will receive a confirmation email with dates, total, and contact info shortly.
        </motion.p>

        {sessionId && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-xs text-slate-400 dark:text-slate-500 font-mono"
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
          <Link href="/seeker/dashboard">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary py-3 px-6 rounded-xl text-sm inline-block"
            >
              View deal
            </motion.span>
          </Link>
          <Link href="/seeker/search">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary py-3 px-6 rounded-xl text-sm inline-block"
            >
              Browse more rooms
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
