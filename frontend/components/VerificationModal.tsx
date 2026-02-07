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
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-2xl shrink-0 overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-lg">
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
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {profile.name || "User"}
                      </h3>
                      {profile.is_verified && profile.verifiedLabel ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            Verified {profile.verifiedLabel}
                          </span>
                          <svg
                            className="w-4 h-4 text-rose-500"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Not yet verified
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Content */}
              <div className="p-6 pt-4 space-y-4">
                {profile.is_verified ? (
                  <>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Our identity verification process checks that a person is
                      who they say they are. It confirms that there&apos;s a
                      real person behind this account and helps keep our
                      community safe.
                    </p>
                    <a
                      href="/help/verification"
                      className="text-sm font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    >
                      Learn more about verification
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      This user hasn&apos;t completed identity verification yet.
                      Verified users have confirmed their identity through
                      government ID or phone verification.
                    </p>
                    <a
                      href="/dashboard/seeker-profile"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-lg hover:shadow-rose-500/25 transition-all"
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
                    </a>
                  </>
                )}
              </div>

              {/* Auto-close progress bar */}
              <div className="h-1 bg-slate-100 dark:bg-slate-800">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-500"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
