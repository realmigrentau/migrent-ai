import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { getListings, deleteListing } from "../../../lib/api";

interface Listing {
  id: string;
  address: string;
  postcode: string;
  weeklyPrice: number;
  weekly_price?: number;
  description: string;
  status?: string;
  views?: number;
  applicants?: number;
  title?: string;
  suburb?: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  paused: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  draft: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

export default function OwnerListings() {
  const { session, user, loading, refreshing } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);
  const justCreated = router.query.created === "1";

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
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
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (!deleteTarget || !session) return;
    setDeleting(true);
    setDeleteError("");
    const result = await deleteListing(deleteTarget.id, session.access_token);
    setDeleting(false);
    if (result.success) {
      setListings((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      closeDeleteModal();
    } else {
      setDeleteError(result.error || "Failed to delete listing");
    }
  };

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
          className="text-sm p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        >
          Listing created successfully.
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[l.status || "active"] || ""}`}>
                        {l.status || "active"}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-600 dark:text-slate-300">{l.views ?? 0}</td>
                    <td className="py-3 px-5 text-slate-600 dark:text-slate-300">{l.applicants ?? 0}</td>
                    <td className="py-3 px-5">
                      <div className="flex gap-3 justify-end">
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
                  <span className={`px-2 py-0.5 rounded-full font-semibold border capitalize ${STATUS_STYLES[l.status || "active"] || ""}`}>
                    {l.status || "active"}
                  </span>
                  <span>{l.views ?? 0} views</span>
                  <span>{l.applicants ?? 0} applicants</span>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/listing/${l.id}`} className="btn-primary py-2 px-4 rounded-lg text-xs flex-1 text-center">
                    View details
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
              {deleteError && (
                <p className="text-xs text-red-500 text-center">{deleteError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, delete it"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
