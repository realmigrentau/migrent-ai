import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { listTickets, getSupportAnalytics, type Ticket } from "../../../lib/api";
import TicketList from "../../../components/support/TicketList";

const statuses = ["", "open", "pending_customer", "pending_internal", "resolved", "closed"];
const priorities = ["", "low", "normal", "high", "urgent"];
const categories = ["", "billing", "onboarding", "verification", "listings", "trust_safety", "bug", "feedback"];

export default function AgentDashboard() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Analytics
  const [analytics, setAnalytics] = useState<{
    total_tickets: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    by_category: Record<string, number>;
    avg_csat: number | null;
    csat_count: number;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.push("/signin");
      return;
    }
    loadData();
  }, [session, authLoading, statusFilter, priorityFilter, categoryFilter, page]);

  async function loadData() {
    if (!session?.access_token) return;
    setLoading(true);

    const [ticketRes, analyticsRes] = await Promise.all([
      listTickets(session.access_token, {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
        page,
        per_page: 20,
      }),
      getSupportAnalytics(session.access_token),
    ]);

    setTickets(ticketRes?.tickets || []);
    setTotal(ticketRes?.total || 0);
    setAnalytics(analyticsRes);
    setLoading(false);
  }

  if (authLoading) return null;

  const totalPages = Math.ceil(total / 20);

  return (
    <>
      <Head>
        <title>Support Dashboard - MigRent</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Support Dashboard</h1>

        {/* Metrics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Total Tickets" value={analytics.total_tickets} />
            <MetricCard label="Open" value={analytics.by_status?.open || 0} accent="blue" />
            <MetricCard label="Pending" value={(analytics.by_status?.pending_customer || 0) + (analytics.by_status?.pending_internal || 0)} accent="amber" />
            <MetricCard label="Avg CSAT" value={analytics.avg_csat ? `${analytics.avg_csat}/5` : "N/A"} accent="green" />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          >
            <option value="">All Statuses</option>
            {statuses.slice(1).map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          >
            <option value="">All Priorities</option>
            {priorities.slice(1).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          >
            <option value="">All Categories</option>
            {categories.slice(1).map((c) => (
              <option key={c} value={c}>{c.replace("_", " ")}</option>
            ))}
          </select>

          <span className="self-center text-sm text-slate-400">{total} tickets</span>
        </div>

        {/* Tickets Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <TicketList tickets={tickets} basePath="/support/agent" />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
  };
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? colorMap[accent] : "text-slate-900 dark:text-white"}`}>
        {value}
      </p>
    </div>
  );
}
