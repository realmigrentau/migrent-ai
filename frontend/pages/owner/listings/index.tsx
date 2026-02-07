import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { getListings } from "../../../lib/api";

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
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  paused: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  draft: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

export default function OwnerListings() {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);
  const justCreated = router.query.created === "1";

  useEffect(() => {
    if (!loading && session && user?.user_metadata?.owner_account !== true) {
      router.replace("/owner/setup");
    }
  }, [loading, session, user, router]);

  useEffect(() => {
    if (session) {
      setFetching(true);
      getListings(session.access_token)
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
    } else if (!loading) {
      setFetching(false);
    }
  }, [session, loading]);

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
                      <span className="font-semibold text-slate-900 dark:text-white">{l.address}</span>
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
                      <div className="flex gap-2 justify-end">
                        <Link href={`/owner/listings/${l.id}`} className="text-xs text-rose-500 hover:text-rose-600 font-semibold transition-colors">
                          View
                        </Link>
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
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{l.address}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l.postcode}</p>
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
                  <Link href={`/owner/listings/${l.id}`} className="btn-primary py-2 px-4 rounded-lg text-xs flex-1 text-center">
                    View details
                  </Link>
                  <Link href={`/seeker/room/${l.id}`} className="btn-secondary py-2 px-4 rounded-lg text-xs text-center">
                    Public view
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
