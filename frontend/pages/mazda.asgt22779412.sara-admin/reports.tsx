import { useEffect, useState, useCallback } from "react";
import AdminGate from "../../components/AdminGate";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Report {
  id: string;
  reporter_id: string;
  listing_id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
  reviewed_by?: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || "";
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/reports?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReports(data.reports || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleAction = async (reportId: string, newStatus: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchReports();
    } catch {
      alert("Failed to update report");
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800",
      actioned: "bg-green-100 text-green-800",
      dismissed: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  return (
    <AdminGate>
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Listing Reports</h1>
            <div className="flex gap-2">
              {["pending", "reviewed", "actioned", "dismissed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    filter === s
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No {filter} reports found.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{report.reason}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Listing: <span className="font-mono text-xs">{report.listing_id}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Reporter: <span className="font-mono text-xs">{report.reporter_id}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge(report.status)}
                      <span className="text-xs text-gray-400">
                        {new Date(report.created_at).toLocaleDateString("en-AU")}
                      </span>
                    </div>
                  </div>

                  {report.details && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
                      {report.details}
                    </p>
                  )}

                  {report.status === "pending" && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleAction(report.id, "reviewed")}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => handleAction(report.id, "actioned")}
                        className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                      >
                        Take Action
                      </button>
                      <button
                        onClick={() => handleAction(report.id, "dismissed")}
                        className="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGate>
  );
}
