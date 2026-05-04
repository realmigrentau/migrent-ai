import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import { useAuth } from "../../hooks/useAuth";
import {
  getAdminPendingIDs,
  getAdminIDDocumentUrl,
  reviewOwnerID,
} from "../../lib/api";

interface IDSubmission {
  id: string;
  user_id: string;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  id_document_type: string;
  id_file_path: string;
  id_status: string;
  id_submitted_at: string;
  owner_name: string;
  owner_email: string;
  owner_photo: string | null;
}

const DOC_LABELS: Record<string, string> = {
  passport: "Passport",
  drivers_licence: "Driver's Licence",
  visa: "Visa",
  national_id: "National ID",
};

export default function VerificationAdmin() {
  const { session } = useAuth();
  const [submissions, setSubmissions] = useState<IDSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    const data = await getAdminPendingIDs(session.access_token);
    if (data?.submissions) {
      setSubmissions(data.submissions);
    }
    setLoading(false);
  }, [session?.access_token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewDoc = async (userId: string) => {
    if (!session?.access_token) return;
    setViewingDoc(userId);
    const data = await getAdminIDDocumentUrl(session.access_token, userId);
    if (data?.url) {
      setDocUrl(data.url);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!session?.access_token) return;
    setActionLoading(userId);
    const result = await reviewOwnerID(session.access_token, userId, "approve");
    setActionLoading(null);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({ text: `ID approved${result.fully_verified ? " - owner is now fully verified!" : ""}`, type: "success" });
      setSubmissions((prev) => prev.filter((s) => s.user_id !== userId));
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleReject = async (userId: string) => {
    if (!session?.access_token || !rejectReason.trim()) return;
    setActionLoading(userId);
    const result = await reviewOwnerID(session.access_token, userId, "reject", rejectReason);
    setActionLoading(null);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({ text: "ID rejected. Owner has been notified.", type: "success" });
      setSubmissions((prev) => prev.filter((s) => s.user_id !== userId));
      setRejectingId(null);
      setRejectReason("");
    }
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            Owner ID <span className="text-rose-500">Verification</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Review and approve owner identity documents. Owners need approval to list rooms.
          </p>
        </motion.div>

        {/* Message toast */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-3 rounded-xl text-sm font-medium border ${
              message.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Document viewer modal */}
        {viewingDoc && docUrl && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => { setViewingDoc(null); setDocUrl(null); }}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">ID Document</h3>
                <button onClick={() => { setViewingDoc(null); setDocUrl(null); }} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {docUrl.endsWith(".pdf") ? (
                <iframe src={docUrl} className="w-full h-[60vh] rounded-lg" />
              ) : (
                <img src={docUrl} alt="ID Document" className="w-full rounded-lg object-contain max-h-[60vh]" />
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="card p-12 rounded-2xl text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">All caught up!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">No pending ID submissions to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {submissions.length} pending submission{submissions.length !== 1 ? "s" : ""}
            </p>

            {submissions.map((sub, i) => (
              <motion.div
                key={sub.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Owner info */}
                  <div className="flex items-center gap-3 flex-1">
                    {sub.owner_photo ? (
                      <img src={sub.owner_photo} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-400">{sub.owner_name?.[0] || "?"}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{sub.owner_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sub.owner_email}</p>
                    </div>
                  </div>

                  {/* Document details */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                      {DOC_LABELS[sub.id_document_type] || sub.id_document_type}
                    </span>
                    {sub.phone_verified && (
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                        Phone Verified
                      </span>
                    )}
                    {sub.email_verified && (
                      <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                        Email Verified
                      </span>
                    )}
                    <span className="text-slate-400">
                      Submitted {sub.id_submitted_at ? new Date(sub.id_submitted_at).toLocaleDateString("en-AU") : "recently"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleViewDoc(sub.user_id)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    View Document
                  </button>
                  <button
                    onClick={() => handleApprove(sub.user_id)}
                    disabled={actionLoading === sub.user_id}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === sub.user_id ? "..." : "Approve"}
                  </button>
                  {rejectingId === sub.user_id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => handleReject(sub.user_id)}
                        disabled={!rejectReason.trim() || actionLoading === sub.user_id}
                        className="px-4 py-2 rounded-xl text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectReason(""); }}
                        className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRejectingId(sub.user_id)}
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
