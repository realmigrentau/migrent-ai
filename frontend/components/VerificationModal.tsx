import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string | null;
    custom_pfp: string | null;
    is_verified: boolean;
    verifiedLabel: string | null;
  };
}

export default function VerificationModal({
  isOpen,
  onClose,
  profile,
}: VerificationModalProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-close after 5 seconds
  useEffect(() => {
    if (isOpen) {
      timerRef.current = setTimeout(onClose, 5000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="w-full max-w-sm bg-[var(--color-surface-2)] rounded-2xl shadow-2xl border border-[var(--color-line)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center text-white font-bold text-2xl shrink-0 overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-lg">
                      {profile.custom_pfp ? (
                        <img
                          src={profile.custom_pfp}
                          alt={profile.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (profile.name || "U")[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-ink)]">
                        {profile.name || "User"}
                      </h3>
                      {profile.is_verified && profile.verifiedLabel ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-sm text-[var(--color-ink-2)]">
                            Verified {profile.verifiedLabel}
                          </span>
                          <svg
                            className="w-4 h-4 text-[var(--color-primary)]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--color-ink-3)] mt-1">
                          Not yet verified
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Close button */}
                  <button aria-label="Close"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] dark:hover:text-[var(--color-ink-4)] hover:bg-[var(--color-surface-muted)] transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--color-line)]" />

              {/* Content */}
              <div className="p-6 pt-4 space-y-4">
                {profile.is_verified ? (
                  <>
                    <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                      Our identity verification process checks that a person is
                      who they say they are. It confirms that there&apos;s a
                      real person behind this account and helps keep our
                      community safe.
                    </p>
                    <Link
                      href="/help/verification"
                      className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors"
                    >
                      Learn more about verification
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                      This user hasn&apos;t completed identity verification yet.
                      Verified users have confirmed their identity through
                      government ID or phone verification.
                    </p>
                    <Link
                      href="/dashboard/seeker-profile"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-primary)] from-[var(--color-primary)] to-[var(--color-primary)] hover:shadow-lg hover:shadow-[var(--color-primary)]/20 transition-all"
                    >
                      Get verified now
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </>
                )}
              </div>

              {/* Auto-close progress bar */}
              <div className="h-1 bg-[var(--color-surface-muted)]">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-[var(--color-primary)] from-[var(--color-primary)] to-[var(--color-primary)]"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
