import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { getListings, deleteListing } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";

interface Listing {
  id: string;
  address: string;
  postcode: string;
  weeklyPrice: number;
  weekly_price?: number;
  description: string;
  status?: string;
  moderation_status?: string;
  views?: number;
  applicants?: number;
  title?: string;
  suburb?: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  approved: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  pending_approval: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  changes_requested: "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
  rejected: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
  paused: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  draft: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "Live",
  pending_approval: "Pending Review",
  changes_requested: "Changes Needed",
  rejected: "Rejected",
  active: "Active",
  paused: "Paused",
  draft: "Draft",
};

export default function OwnerListings() {
  const { session, user, loading, refreshing } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);
  const justCreated = router.query.created === "1";

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "verify">("confirm");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (loading || refreshing) return;
    if (session) {
      setFetching(true);
      getListings(session.access_token, true)
        .then((data) => {
          if (data && Array.isArray(data)) {
            setListings(data.map((l: any) => ({
              id: l.id || l._id || String(Math.random()),
              address: l.address,
              postcode: l.postcode,
              weeklyPrice: l.weeklyPrice ?? l.weekly_price,
              description: l.description,
              status: l.status || "active",
              moderation_status: l.moderation_status || "approved",
              views: l.views ?? 0,
              applicants: l.applicants ?? 0,
              title: l.title || "",
              suburb: l.suburb || "",
            })));
          } else {
            setListings([]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch listings:", err);
          setListings([]);
        })
        .finally(() => {
          setFetching(false);
        });
    } else {
      setFetching(false);
    }
  }, [session, loading, refreshing]);

  const openDeleteModal = (listing: Listing) => {
    setDeleteTarget(listing);
    setDeleteStep("confirm");
    setDeletePassword("");
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteStep("confirm");
    setDeletePassword("");
    setDeleteError("");
  };

  const handlePasswordDelete = async () => {
    if (!deleteTarget || !session) return;
    if (!deletePassword.trim()) {
      setDeleteError("Please enter your password");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    const result = await deleteListing(deleteTarget.id, session.access_token, { password: deletePassword });
    setDeleting(false);
    if (result.success) {
      setListings((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      closeDeleteModal();
    } else {
      setDeleteError(result.error || "Failed to delete listing");
    }
  };

  const handleGoogleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/owner/listings?delete_confirmed=${deleteTarget.id}`,
        },
      });
      if (oauthError) {
        setDeleteError("Failed to start Google sign-in. Please try again.");
        setDeleting(false);
      }
    } catch {
      setDeleteError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  };

  // Handle Google OAuth redirect callback for deletion
  useEffect(() => {
    const deleteId = router.query.delete_confirmed as string;
    if (!deleteId || !session) return;
    router.replace("/owner/listings", undefined, { shallow: true });
    setDeleting(true);
    deleteListing(deleteId, session.access_token, { oauthConfirmed: true })
      .then((result) => {
        if (result.success) {
          setListings((prev) => prev.filter((l) => l.id !== deleteId));
        } else {
          alert(result.error || "Failed to delete listing");
        }
      })
      .finally(() => setDeleting(false));
  }, [router.query.delete_confirmed, session]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  if (!session)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Sign in as an owner to manage your listings.
        </p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">
          Sign in
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              My <span className="gradient-text-accent">Listings</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {listings.length} listing{listings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/owner/listings/new"
            className="btn-primary py-2.5 px-5 rounded-xl text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New listing
          </Link>
        </div>
      </motion.div>

      {justCreated && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
        >
          Listing submitted! Our team will review it shortly (usually within 24 hours). You will receive an email once approved.
        </motion.p>
      )}

      {fetching ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-full space-y-2">
                <div className="h-4 w-48 rounded shimmer" />
                <div className="h-3 w-32 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-8 rounded-2xl text-center"
        >
          <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">No listings yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Create your first listing to start receiving applicants.
          </p>
          <Link href="/owner/listings/new" className="btn-primary py-2.5 px-5 rounded-xl text-sm inline-block">
            Create listing
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-5 font-semibold text-slate-500 dark:text-slate-400">Listing</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500 dark:text-slate-400">Postcode</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500 dark:text-slate-400">Price</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500 dark:text-slate-400">Views</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500 dark:text-slate-400">Applicants</th>
                  <th className="py-3 px-5"></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5">
                      <Link href={`/listing/${l.id}`} className="hover:text-rose-500 transition-colors">
                        <span className="font-semibold text-slate-900 dark:text-white">{l.title || l.address}</span>
                        {l.suburb && <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">{l.suburb}</span>}
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-slate-600 dark:text-slate-300">{l.postcode}</td>
                    <td className="py-3 px-5 text-rose-600 dark:text-rose-400 font-bold">${l.weeklyPrice}/wk</td>
                    <td className="py-3 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[l.moderation_status || l.status || "active"] || ""}`}>
                        {STATUS_LABELS[l.moderation_status || l.status || "active"] || l.status || "active"}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-600 dark:text-slate-300">{l.views ?? 0}</td>
                    <td className="py-3 px-5 text-slate-600 dark:text-slate-300">{l.applicants ?? 0}</td>
                    <td className="py-3 px-5">
                      <div className="flex gap-3 justify-end">
                        <Link href={`/owner/listings/edit/${l.id}`} className="text-xs text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                          Edit
                        </Link>
                        <Link href={`/listing/${l.id}`} className="text-xs text-slate-500 hover:text-rose-500 font-semibold transition-colors">
                          View
                        </Link>
                        <button
                          onClick={() => openDeleteModal(l)}
                          className="text-xs text-slate-400 hover:text-red-500 font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {listings.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 rounded-2xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{l.title || l.address}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l.suburb ? `${l.suburb}, ` : ""}{l.postcode}</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">${l.weeklyPrice}/wk</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className={`px-2 py-0.5 rounded-full font-semibold border ${STATUS_STYLES[l.moderation_status || l.status || "active"] || ""}`}>
                    {STATUS_LABELS[l.moderation_status || l.status || "active"] || l.status || "active"}
                  </span>
                  <span>{l.views ?? 0} views</span>
                  <span>{l.applicants ?? 0} applicants</span>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/owner/listings/edit/${l.id}`} className="py-2 px-4 rounded-lg text-xs flex-1 text-center border border-blue-200 dark:border-blue-500/20 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors font-semibold">
                    Edit
                  </Link>
                  <Link href={`/listing/${l.id}`} className="btn-primary py-2 px-4 rounded-lg text-xs flex-1 text-center">
                    View
                  </Link>
                  <button
                    onClick={() => openDeleteModal(l)}
                    className="py-2 px-4 rounded-lg text-xs border border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-6 rounded-2xl max-w-md w-full space-y-4"
            >
              {deleteStep === "confirm" ? (
                <>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete this listing?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">{deleteTarget.title || deleteTarget.address}</span>?
                      This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeDeleteModal}
                      className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setDeleteStep("verify")}
                      className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      Yes, delete it
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm your identity</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Enter your password or sign in with Google to confirm deletion.
                    </p>
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={deletePassword}
                      onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handlePasswordDelete(); }}
                      className="input-field w-full text-sm"
                      autoFocus
                    />
                  </div>

                  {deleteError && (
                    <p className="text-xs text-red-500 text-center">{deleteError}</p>
                  )}

                  <button
                    onClick={handlePasswordDelete}
                    disabled={deleting || !deletePassword.trim()}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete with password"
                    )}
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <span className="text-xs text-slate-400 dark:text-slate-500">or</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  </div>

                  <button
                    onClick={handleGoogleDelete}
                    disabled={deleting}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google to confirm
                  </button>

                  <button
                    onClick={() => { setDeleteStep("confirm"); setDeletePassword(""); setDeleteError(""); }}
                    className="w-full py-2 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    Back
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
