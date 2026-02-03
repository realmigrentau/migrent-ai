import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import AdminLayout from "../../components/AdminLayout";
import {
  mockPageViews,
  mockGeoData,
  mockSignupFunnel,
} from "../../lib/adminApi";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const FunnelChart = dynamic(() => import("recharts").then((m) => m.FunnelChart), { ssr: false });
const Funnel = dynamic(() => import("recharts").then((m) => m.Funnel), { ssr: false });
const LabelList = dynamic(() => import("recharts").then((m) => m.LabelList), { ssr: false });

const FUNNEL_COLORS = ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3", "#ffe4e6"];

export default function AdminAnalytics() {
  // Compute max for geo heatmap bars
  const maxGeo = Math.max(...mockGeoData.map((g) => g.users));

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Platform <span className="gradient-text">Analytics</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Page views, geographic distribution, and signup funnel analysis.
        </p>
      </div>

      {/* Page Views */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5 rounded-2xl mb-6"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Page Views (Weekly)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockPageViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Geographic Heatmap (bar representation) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 rounded-2xl"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Users by Suburb</h3>
          <div className="space-y-3">
            {mockGeoData
              .sort((a, b) => b.users - a.users)
              .map((geo, i) => (
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
        </motion.div>

        {/* Signup Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5 rounded-2xl"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Signup Funnel</h3>
          <div className="space-y-3">
            {mockSignupFunnel.map((step, i) => {
              const pct = (step.count / mockSignupFunnel[0].count) * 100;
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
                      style={{ background: FUNNEL_COLORS[i] }}
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
              <span className="text-slate-500 dark:text-slate-400">Conversion rate</span>
              <span className="font-semibold text-rose-500">
                {((mockSignupFunnel[mockSignupFunnel.length - 1].count / mockSignupFunnel[0].count) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Avg. Session Duration", value: "4m 32s", icon: "clock" },
          { label: "Bounce Rate", value: "34.2%", icon: "arrow" },
          { label: "Mobile Users", value: "68%", icon: "device" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className="card p-5 rounded-2xl"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </AdminLayout>
  );
}
