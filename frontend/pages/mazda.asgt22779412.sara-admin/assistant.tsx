import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useAuth } from "../../hooks/useAuth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface AssistantLog {
  id: string;
  query: string;
  top_article_id: string | null;
  confidence: "high" | "medium" | "low" | "none";
  helpful: boolean | null;
  safety_flag: boolean;
  legal_flag: boolean;
  emergency_flag: boolean;
  escalated: boolean;
  created_at: string;
}

interface AssistantStats {
  window_days: number;
  total: number;
  by_confidence: { high: number; medium: number; low: number; none: number };
  helpful_yes: number;
  helpful_no: number;
  helpful_rate: number;
  safety: number;
  legal: number;
  emergency: number;
  escalated: number;
  top_failed: { query: string; count: number }[];
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  medium: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  low: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  none: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

export default function AdminAssistant() {
  const { session } = useAuth();
  const token = session?.access_token || "";

  const [stats, setStats] = useState<AssistantStats | null>(null);
  const [logs, setLogs] = useState<AssistantLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unhelpful" | "safety" | "low" | "none">("all");

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filter === "unhelpful") params.set("only_unhelpful", "true");
      if (filter === "safety") params.set("only_safety", "true");
      if (filter === "low") params.set("confidence", "low");
      if (filter === "none") params.set("confidence", "none");

      const [statsRes, logsRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/assistant-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch(`${BASE_URL}/admin/assistant-logs?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);
      setStats(statsRes);
      setLogs(logsRes.logs || []);
    } catch (err) {
      console.error("[AdminAssistant] fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            Assistant <span className="gradient-text">Insights</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Last 7 days of in-app assistant queries. Use this to find content gaps and improve answers.
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total queries (7d)" value={stats?.total ?? "-"} />
        <StatCard label="High confidence" value={stats?.by_confidence.high ?? "-"} tone="emerald" />
        <StatCard label="Low / no match" value={(stats?.by_confidence.low ?? 0) + (stats?.by_confidence.none ?? 0)} tone="amber" />
        <StatCard label="Helpful rate" value={stats ? `${stats.helpful_rate}%` : "-"} tone="sky" />
        <StatCard label="Safety flagged" value={stats?.safety ?? "-"} tone="rose" />
        <StatCard label="Legal flagged" value={stats?.legal ?? "-"} tone="purple" />
        <StatCard label="Emergency flagged" value={stats?.emergency ?? "-"} tone="red" />
        <StatCard label="Escalated to ticket" value={stats?.escalated ?? "-"} />
      </div>

      {/* Top failed queries */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Top queries the assistant couldn't answer well</h2>
        <p className="text-xs text-slate-500 mb-4">These are your content gaps. Each one is a candidate for a new or expanded article in <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1 rounded">frontend/data/supportKB.ts</code>.</p>
        {stats?.top_failed?.length ? (
          <div className="space-y-1.5">
            {stats.top_failed.map((row) => (
              <div key={row.query} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm text-slate-800 dark:text-slate-200 truncate">{row.query}</span>
                <span className="text-xs font-mono text-slate-500 shrink-0">{row.count}x</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No low-confidence queries in the window yet. Either your KB is healthy or nobody's asked.</p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        {([
          { key: "all", label: "All" },
          { key: "low", label: "Low confidence" },
          { key: "none", label: "No match" },
          { key: "unhelpful", label: "Marked unhelpful" },
          { key: "safety", label: "Safety flagged" },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-rose-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Log table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent queries</h2>
          <span className="text-xs text-slate-400">{loading ? "Loading..." : `${logs.length} shown`}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">Query</th>
                <th className="px-4 py-2 font-medium">Match</th>
                <th className="px-4 py-2 font-medium">Confidence</th>
                <th className="px-4 py-2 font-medium">Helpful</th>
                <th className="px-4 py-2 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-slate-800 dark:text-slate-200 max-w-md truncate" title={log.query}>
                    {log.query}
                  </td>
                  <td className="px-4 py-2 text-xs font-mono text-slate-500">
                    {log.top_article_id ?? "-"}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CONFIDENCE_COLORS[log.confidence]}`}>
                      {log.confidence}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {log.helpful === true ? <span className="text-emerald-600">yes</span> :
                     log.helpful === false ? <span className="text-rose-600">no</span> :
                     <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {log.safety_flag && <Pill color="rose">safety</Pill>}
                      {log.legal_flag && <Pill color="purple">legal</Pill>}
                      {log.emergency_flag && <Pill color="red">emergency</Pill>}
                      {log.escalated && <Pill color="slate">escalated</Pill>}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    No queries match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number | string;
  tone?: "slate" | "emerald" | "amber" | "sky" | "rose" | "purple" | "red";
}) {
  const tones: Record<string, string> = {
    slate: "text-slate-900 dark:text-white",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    sky: "text-sky-600",
    rose: "text-rose-600",
    purple: "text-purple-600",
    red: "text-red-600",
  };
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${tones[tone]}`}>{value}</div>
    </div>
  );
}

function Pill({ color, children }: { color: "rose" | "purple" | "red" | "slate"; children: React.ReactNode }) {
  const map = {
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    slate: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  } as const;
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${map[color]}`}>{children}</span>;
}
