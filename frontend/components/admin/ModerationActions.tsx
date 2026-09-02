import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModerationActionsProps {
  listingId: string;
  listingTitle: string;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string, notes?: string) => Promise<void>;
  onRequestChanges: (id: string, notes: string) => Promise<void>;
  /** Reversible quarantine: offline everywhere, owner told what to fix. */
  onPause?: (id: string, reason: string, requiredActions: string[]) => Promise<void>;
  onPreview: (id: string) => void;
}

const PAUSE_ACTIONS = [
  "Upload genuine photos of the property",
  "Set current availability dates",
  "State the weekly price per room and how many rooms are free",
  "Provide proof you own or may list the property",
  "Confirm the address so the map lands in the right suburb",
  "Say exactly where any cameras are (never in bedrooms or bathrooms)",
  "Complete government ID verification",
];

const REJECTION_REASONS = [
  "No photos or poor quality photos",
  "Incomplete or misleading description",
  "Suspected spam or scam listing",
  "Duplicate listing",
  "Inappropriate content",
  "Price seems unrealistic",
  "Address does not appear valid",
  "Other",
];

export default function ModerationActions({
  listingId,
  listingTitle,
  onApprove,
  onReject,
  onRequestChanges,
  onPause,
  onPreview,
}: ModerationActionsProps) {
  const [modal, setModal] = useState<"reject" | "changes" | "pause" | null>(null);
  const [pauseActions, setPauseActions] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(listingId);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const finalReason = reason === "Other" ? customReason : reason;
    if (!finalReason) return;
    setLoading(true);
    try {
      await onReject(listingId, finalReason, notes || undefined);
      setModal(null);
      setReason("");
      setCustomReason("");
      setNotes("");
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!onPause || !notes.trim()) return;
    setLoading(true);
    try {
      await onPause(listingId, notes.trim(), pauseActions);
      setModal(null);
      setNotes("");
      setPauseActions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!notes) return;
    setLoading(true);
    try {
      await onRequestChanges(listingId, notes);
      setModal(null);
      setNotes("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPreview(listingId)}
          className="px-2 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Preview"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-[var(--color-accent)] dark:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] dark:hover:bg-[var(--color-accent)]/10 transition-colors disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => setModal("reject")}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => setModal("changes")}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
        >
          Changes
        </button>
        {onPause && (
          <button
            type="button"
            onClick={() => setModal("pause")}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Pause
          </button>
        )}
      </div>

      {/* Pause (quarantine) Modal */}
      <AnimatePresence>
        {modal === "pause" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pause-modal-title"
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl"
            >
              <h3 id="pause-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">Pause listing</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Takes &ldquo;{listingTitle}&rdquo; offline everywhere until the owner fixes what you list here. Nothing is deleted; you can unpause later.
              </p>
              <label htmlFor="pause-reason" className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Reason shown to the owner</label>
              <textarea
                id="pause-reason"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm"
              />
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">What must change before it comes back</legend>
                <div className="mt-2 space-y-1.5">
                  {PAUSE_ACTIONS.map((a) => (
                    <label key={a} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={pauseActions.includes(a)}
                        onChange={(e) => setPauseActions((prev) => (e.target.checked ? [...prev, a] : prev.filter((x) => x !== a)))}
                        className="mt-0.5"
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setModal(null)} className="px-3 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-300">Cancel</button>
                <button type="button" onClick={handlePause} disabled={loading || !notes.trim()} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 disabled:opacity-50">
                  {loading ? "Pausing..." : "Pause listing"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {modal === "reject" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 rounded-2xl max-w-md w-full"
            >
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                Reject Listing
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Reject <strong>{listingTitle}</strong>. The owner will be notified.
              </p>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field text-sm mb-3"
              >
                <option value="">Select a reason...</option>
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {reason === "Other" && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Specify reason..."
                  className="input-field text-sm mb-3"
                />
              )}

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Internal notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes for the admin team..."
                className="input-field text-sm resize-none h-20 mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setModal(null)}
                  className="btn-secondary text-sm !py-2 flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading || (!reason || (reason === "Other" && !customReason))}
                  className="text-sm font-semibold py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors flex-1 disabled:opacity-50"
                >
                  {loading ? "Rejecting..." : "Reject Listing"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Changes Modal */}
      <AnimatePresence>
        {modal === "changes" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 rounded-2xl max-w-md w-full"
            >
              <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-1">
                Request Changes
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Ask the owner to update <strong>{listingTitle}</strong> before approval.
              </p>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                What needs to change?
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please add at least 3 photos of the room and update the description with accurate details..."
                className="input-field text-sm resize-none h-28 mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setModal(null)}
                  className="btn-secondary text-sm !py-2 flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestChanges}
                  disabled={loading || !notes}
                  className="text-sm font-semibold py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors flex-1 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Request Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
