import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Share2,
  Link2,
  Mail,
  MessageSquare,
  Users,
} from "lucide-react";
import type { WishlistListing } from "../../hooks/useWishlist";

interface ShareModalProps {
  show: boolean;
  onClose: () => void;
  listings: WishlistListing[];
}

export default function ShareModal({ show, onClose, listings }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/wishlist/shared`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "My MigRent Wishlist",
          text: `Check out my ${listings.length} saved rooms on MigRent!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Share Wishlist
                  </h2>
                  <p className="text-xs text-slate-400">
                    {listings.length} listings
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Preview */}
            <div className="px-5 py-4 space-y-4">
              {/* Photo strip */}
              <div className="flex gap-2 overflow-hidden">
                {listings.slice(0, 4).map((l, i) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0"
                  >
                    <img
                      src={l.photos[0]}
                      alt={l.address}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
                {listings.length > 4 && (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-slate-400">
                      +{listings.length - 4}
                    </span>
                  </div>
                )}
              </div>

              {/* Copy link */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400">Share link (view-only)</p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {shareUrl}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                      copied
                        ? "bg-[var(--color-accent-soft)]0 text-white"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Share options */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400">Share via</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleNativeShare}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-[var(--color-primary)]" />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Share</span>
                  </button>
                  <button
                    onClick={() => {
                      window.open(`mailto:?subject=Check out my MigRent Wishlist&body=${encodeURIComponent(shareUrl)}`, "_blank");
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Email</span>
                  </button>
                  <button
                    onClick={() => {
                      window.open(`sms:?body=${encodeURIComponent(`Check out my MigRent Wishlist: ${shareUrl}`)}`, "_blank");
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-[var(--color-accent)]" />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Message</span>
                  </button>
                </div>
              </div>

              {/* Roommate invite */}
              <div className="p-3 rounded-2xl bg-[var(--color-primary)] from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-[var(--color-primary-soft)]/50 dark:border-[var(--color-primary)]/20">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs font-bold text-violet-700 dark:text-[var(--color-primary)]">
                      Invite roommates to vote
                    </p>
                    <p className="text-[10px] text-[var(--color-primary)]/60 dark:text-[var(--color-primary)]/60 mt-0.5">
                      Coming soon - let friends react to your picks!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onClose}
                className="w-full btn-secondary py-2.5 rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
