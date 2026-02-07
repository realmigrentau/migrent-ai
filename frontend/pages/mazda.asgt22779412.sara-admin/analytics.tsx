import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import AdminLayout from "../../components/AdminLayout";
import { fetchSignupFunnel, fetchGeoData, type SignupFunnel } from "../../lib/adminApi";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });

const FUNNEL_COLORS = ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3", "#ffe4e6"];

export default function AdminAnalytics() {
  const [signupFunnel, setSignupFunnel] = useState<SignupFunnel[]>([]);
  const [geoData, setGeoData] = useState<{ suburb: string; users: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSignupFunnel(), fetchGeoData()]).then(([funnelData, geo]) => {
      setSignupFunnel(funnelData);
      setGeoData(geo);
      setLoading(false);
    });
  }, []);

  const maxGeo = geoData.length > 0 ? Math.max(...geoData.map((g) => g.users)) : 1;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Platform <span className="gradient-text">Analytics</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Geographic distribution and signup funnel analysis.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Geographic Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5 rounded-2xl"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Listings by Suburb</h3>
              {geoData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                  No geographic data yet
                </div>
              ) : (
                <div className="space-y-3">
                  {geoData.map((geo, i) => (
                    <div key={geo.suburb}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{geo.suburb}</span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{geo.users}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(geo.users / maxGeo) * 100}%` }}
                          transition={{ delay: 0.2 + i * 0.04, duration: 0.5 }}
                          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Signup Funnel */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card p-5 rounded-2xl"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Signup Funnel</h3>
              {signupFunnel.length === 0 || signupFunnel[0].count === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                  No funnel data yet
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {signupFunnel.map((step, i) => {
                      const pct = (step.count / signupFunnel[0].count) * 100;
                      return (
                        <div key={step.stage}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{step.stage}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {step.count} ({pct.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                              className="h-full rounded-lg flex items-center px-2"
                              style={{ background: FUNNEL_COLORS[i] || FUNNEL_COLORS[FUNNEL_COLORS.length - 1] }}
                            >
                              {pct > 15 && (
                                <span className="text-[10px] font-bold text-white">{step.count}</span>
                              )}
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Conversion rate (signup to active)</span>
                      <span className="font-semibold text-rose-500">
                        {signupFunnel.length > 1
                          ? ((signupFunnel[signupFunnel.length - 1].count / signupFunnel[0].count) * 100).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-5 rounded-2xl"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Users</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {signupFunnel.find((s) => s.stage === "Signed up")?.count || 0}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="card p-5 rounded-2xl"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">Verified Users</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {signupFunnel.find((s) => s.stage === "Verified")?.count || 0}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-5 rounded-2xl"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">Active Listings</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {signupFunnel.find((s) => s.stage === "Active listing/search")?.count || 0}
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
