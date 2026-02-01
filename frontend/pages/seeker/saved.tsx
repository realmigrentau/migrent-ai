import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

const MOCK_SAVED = [
  {
    id: "1",
    address: "12 Crown St",
    suburb: "Surry Hills",
    postcode: "2010",
    weeklyPrice: 250,
    roomType: "Private room",
    savedAt: "2 days ago",
    photo: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    address: "8 Botany Rd",
    suburb: "Waterloo",
    postcode: "2017",
    weeklyPrice: 280,
    roomType: "Ensuite",
    savedAt: "5 days ago",
    photo: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&h=200&fit=crop",
  },
];

const MOCK_APPLICATIONS = [
  {
    id: "app-1",
    listingId: "1",
    address: "12 Crown St, Surry Hills",
    postcode: "2010",
    weeklyPrice: 250,
    status: "Owner reviewing",
    appliedAt: "1 day ago",
  },
  {
    id: "app-2",
    listingId: "5",
    address: "3/15 Glebe Point Rd, Glebe",
    postcode: "2037",
    weeklyPrice: 310,
    status: "Match confirmed",
    appliedAt: "1 week ago",
  },
  {
    id: "app-3",
    listingId: "2",
    address: "45 George St, Redfern",
    postcode: "2016",
    weeklyPrice: 220,
    status: "New",
    appliedAt: "3 hours ago",
  },
];

const STATUS_STYLES: Record<string, string> = {
  New: "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  "Owner reviewing": "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  "Match confirmed": "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
};

export default function SeekerSaved() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<"saved" | "applications">("saved");

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
          Sign in to see your saved rooms and applications.
        </p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">
          Sign in
        </Link>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Saved & <span className="gradient-text">Applications</span>
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {(["saved", "applications"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Saved tab */}
      {tab === "saved" && (
        <div className="space-y-3">
          {MOCK_SAVED.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-8 rounded-2xl text-center"
            >
              <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">No saved rooms yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Save rooms from search results to compare later.
              </p>
              <Link href="/seeker/search" className="btn-primary py-2.5 px-5 rounded-xl text-sm inline-block">
                Search rooms
              </Link>
            </motion.div>
          ) : (
            MOCK_SAVED.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 rounded-2xl flex items-center gap-4"
              >
                <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img src={item.photo} alt={item.address} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.address}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.suburb}, {item.postcode} · {item.roomType}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Saved {item.savedAt}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-rose-600 dark:text-rose-400 font-bold text-sm">${item.weeklyPrice}/wk</div>
                  <Link
                    href={`/seeker/room/${item.id}`}
                    className="text-xs text-rose-500 hover:text-rose-600 underline underline-offset-2 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Applications tab */}
      {tab === "applications" && (
        <div className="space-y-3">
          {MOCK_APPLICATIONS.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-8 rounded-2xl text-center"
            >
              <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">No applications yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Express interest in a room to start an application.
              </p>
              <Link href="/seeker/search" className="btn-primary py-2.5 px-5 rounded-xl text-sm inline-block">
                Search rooms
              </Link>
            </motion.div>
          ) : (
            MOCK_APPLICATIONS.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 rounded-2xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{app.address}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{app.postcode} · Applied {app.appliedAt}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">${app.weeklyPrice}/wk</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[app.status] || ""}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
                {app.status === "Match confirmed" && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      The owner confirmed interest. Check your email for next steps.
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
