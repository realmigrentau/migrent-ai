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

const REPORT_REASONS = [
  "Inaccurate listing information",
  "Suspected scam or fraud",
  "Inappropriate or offensive content",
  "Discriminatory language",
  "Duplicate listing",
  "Listing no longer available",
  "Safety concern",
  "Other",
];

export default function ReportModal({ listingId, itemType, itemId, isOpen, onClose }: ReportModalProps) {
  const resolvedId = listingId || itemId || "";
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";
      const result = await submitReport(token, {
        item_type: (itemType || "listing") as "listing" | "profile",
        item_id: resolvedId,
        category: reason,
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
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Submitted</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Thank you for helping keep MigRent safe. Our team will review this listing.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Report This Listing</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Let us know why you think this listing should be reviewed.
                </p>

                <div className="space-y-2 mb-4">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        reason === r
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{r}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  placeholder="Additional details (optional)"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-4"
                />

                {error && (
                  <p className="text-red-600 text-sm mb-3">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !reason}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
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
