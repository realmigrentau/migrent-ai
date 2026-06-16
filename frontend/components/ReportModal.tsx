import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitReport } from "../lib/api";
import { supabase } from "../lib/supabase";

interface ReportModalProps {
  listingId?: string;
  itemType?: string;
  itemId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const LISTING_REASONS = [
  "Inaccurate listing information",
  "Suspected scam or fraud",
  "Inappropriate or offensive content",
  "Discriminatory language",
  "Duplicate listing",
  "Listing no longer available",
  "Safety concern",
  "Other",
];

const PROFILE_REASONS = [
  "Fake or misleading profile",
  "Suspected scam or fraud",
  "Inappropriate or offensive content",
  "Harassment or threatening behavior",
  "Discriminatory language",
  "Impersonation",
  "Safety concern",
  "Other",
];

export default function ReportModal({ listingId, itemType, itemId, isOpen, onClose }: ReportModalProps) {
  const resolvedId = listingId || itemId || "";
  const isProfile = itemType === "profile";
  const REPORT_REASONS = isProfile ? PROFILE_REASONS : LISTING_REASONS;

  const [reason, setReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    if (reason === "Other" && !otherText.trim()) {
      setError("Please describe the issue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const finalReason = reason === "Other" ? `Other: ${otherText.trim()}` : reason;
      const result = await submitReport(token, {
        item_type: (itemType || "listing") as "listing" | "profile",
        item_id: resolvedId,
        category: finalReason,
        message: details || undefined,
      });
      if (!result) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.message || "Failed to submit report. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setOtherText("");
    setDetails("");
    setSubmitted(false);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-[var(--color-surface-2)] rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2">Report Submitted</h3>
                <p className="text-[var(--color-ink-2)] text-sm mb-4">
                  Thank you for helping keep MigRent safe. Our team will review this {isProfile ? "profile" : "listing"}.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)] transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-1">
                  Report This {isProfile ? "Profile" : "Listing"}
                </h3>
                <p className="text-[var(--color-ink-3)] text-sm mb-4">
                  Let us know why you think this {isProfile ? "profile" : "listing"} should be reviewed.
                </p>

                <div className="space-y-2 mb-4">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        reason === r
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 dark:border-[var(--color-primary)]"
                          : "border-[var(--color-line)] hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-line-2)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => {
                          setReason(r);
                          if (r !== "Other") setOtherText("");
                        }}
                        className="text-[var(--color-primary)] focus:ring-[var(--color-ink)]/30 accent-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-ink-2)]">{r}</span>
                    </label>
                  ))}
                </div>

                {/* Other text box - only shows when Other is selected */}
                <AnimatePresence>
                  {reason === "Other" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <textarea
                        placeholder="Please describe the issue..."
                        value={otherText}
                        onChange={(e) => setOtherText(e.target.value)}
                        rows={3}
                        maxLength={500}
                        className="w-full border-2 border-slate-900 dark:border-slate-400 rounded-lg p-3 text-sm text-[var(--color-ink)] bg-[var(--color-surface-2)] focus:ring-2 focus:ring-[var(--color-ink)]/30 focus:border-transparent resize-none mb-4 placeholder:text-[var(--color-ink-3)] dark:placeholder:text-[var(--color-ink-3)]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Additional details - always visible */}
                {reason && reason !== "Other" && (
                  <textarea
                    placeholder="Additional details (optional)"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="w-full border border-[var(--color-line)] rounded-lg p-3 text-sm text-[var(--color-ink)] bg-[var(--color-surface-2)] focus:ring-2 focus:ring-[var(--color-ink)]/30 focus:border-transparent resize-none mb-4 placeholder:text-[var(--color-ink-3)] dark:placeholder:text-[var(--color-ink-3)]"
                  />
                )}

                {error && (
                  <p className="text-[var(--color-danger-500)] text-sm mb-3">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 border border-[var(--color-line-2)] text-[var(--color-ink-2)] rounded-lg hover:bg-[var(--color-surface)] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !reason}
                    className="flex-1 px-4 py-2.5 bg-[var(--color-danger-500)] text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
