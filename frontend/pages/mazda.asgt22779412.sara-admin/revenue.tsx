import { useMemo } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import AdminLayout from "../../components/AdminLayout";
import AdminDataTable, { Column } from "../../components/AdminDataTable";
import {
  mockPayments,
  mockMonthlyRevenue,
  mockRevenueByRole,
  exportCSV,
  type AdminPayment,
} from "../../lib/adminApi";

// Dynamically import Recharts to avoid SSR issues
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });

const COLORS = ["#f43f5e", "#3b82f6"];

export default function AdminRevenue() {
  const columns: Column<AdminPayment>[] = [
    { key: "email", label: "Email" },
    {
      key: "amount",
      label: "Amount",
      render: (row) => <span className="font-semibold">${row.amount}</span>,
    },
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.type === "owner_fee"
              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
          }`}
        >
          {row.type.replace("_", " ")}
        </span>
      ),
    },
    { key: "date", label: "Date" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`text-xs font-semibold ${
            row.status === "completed"
              ? "text-emerald-500"
              : row.status === "pending"
              ? "text-amber-500"
              : "text-red-500"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const handleExport = () => {
    exportCSV(
      "migrent-payments.csv",
      ["Email", "Amount", "Type", "Date", "Status"],
      mockPayments.map((p) => [p.email, String(p.amount), p.type, p.date, p.status])
    );
  };

  const totalRevenue = useMemo(
    () => mockPayments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
    []
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Revenue <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track payments, revenue trends, and export financial data.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 rounded-2xl"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Revenue</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-emerald-500 mt-1">AUD</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5 rounded-2xl"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400">Completed Payments</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {mockPayments.filter((p) => p.status === "completed").length}
          </p>
          <p className="text-xs text-emerald-500 mt-1">of {mockPayments.length} total</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 rounded-2xl"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400">Avg. Payment</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            ${Math.round(totalRevenue / mockPayments.filter((p) => p.status === "completed").length)}
          </p>
          <p className="text-xs text-slate-400 mt-1">per transaction</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Line chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5 rounded-2xl lg:col-span-2"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMonthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ fill: "#f43f5e", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 rounded-2xl"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Revenue by Role</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockRevenueByRole}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {mockRevenueByRole.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Payments table */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Payments</h2>
        <AdminDataTable<AdminPayment>
          columns={columns}
          data={mockPayments}
          searchKey="email"
          searchPlaceholder="Search by email..."
          filterKey="status"
          filterOptions={[
            { label: "Completed", value: "completed" },
            { label: "Pending", value: "pending" },
            { label: "Refunded", value: "refunded" },
          ]}
          onExportCSV={handleExport}
        />
      </div>
    </AdminLayout>
  );
}
