import Link from "next/link";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import { getAdminStats } from "../../lib/adminApi";

const stats = getAdminStats();

const heroCards = [
  {
    label: "Total Users",
    value: "127",
    change: "+12 this month",
    color: "from-blue-500 to-blue-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: "Active Listings",
    value: String(stats.activeListings),
    change: "5 pending review",
    color: "from-emerald-500 to-emerald-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
      </svg>
    ),
  },
  {
    label: "Revenue",
    value: "$4,872",
    change: "AUD total",
    color: "from-rose-500 to-rose-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Revenue/Mo",
    value: "$1,293",
    change: "AUD this month",
    color: "from-amber-500 to-amber-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
];

const quickLinks = [
  { label: "Manage Users", href: "/mazda.asgt22779412.sara-admin/users", desc: "View, edit, suspend accounts" },
  { label: "Revenue Report", href: "/mazda.asgt22779412.sara-admin/revenue", desc: "Charts, payments, export" },
  { label: "Review Listings", href: "/mazda.asgt22779412.sara-admin/listings", desc: "Approve, reject, manage" },
  { label: "Analytics", href: "/mazda.asgt22779412.sara-admin/analytics", desc: "Page views, funnels, geo" },
  { label: "Owner Dashboard", href: "/owner/dashboard", desc: "View as owner" },
  { label: "Seeker Dashboard", href: "/seeker/dashboard", desc: "View as seeker" },
];

export default function AdminOverview() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Dashboard <span className="gradient-text">Overview</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome back, SuperAdmin. Here&apos;s what&apos;s happening on MigRent.
        </p>
      </div>

      {/* Hero stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {heroCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5 rounded-2xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</p>
            <p className="text-xs text-emerald-500 mt-1">{card.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Link
                href={link.href}
                className="card p-4 rounded-xl flex items-center gap-3 hover:border-rose-300 dark:hover:border-rose-500/30 transition-colors group block"
              >
                <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{link.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{link.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
