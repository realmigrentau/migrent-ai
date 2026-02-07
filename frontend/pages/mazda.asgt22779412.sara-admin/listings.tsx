import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import AdminDataTable, { Column } from "../../components/AdminDataTable";
import { fetchAdminListings, type AdminListing } from "../../lib/adminApi";

export default function AdminListings() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: string; listing: AdminListing } | null>(null);

  useEffect(() => {
    fetchAdminListings().then((data) => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  const columns: Column<AdminListing>[] = [
    { key: "title", label: "Title" },
    { key: "ownerEmail", label: "Owner" },
    { key: "suburb", label: "Suburb" },
    {
      key: "weeklyPrice",
      label: "$/week",
      render: (row) => <span className="font-semibold">${row.weeklyPrice}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.status === "active"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : row.status === "pending"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
              : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "applicants",
      label: "Applicants",
      render: (row) => (
        <span className="text-sm">
          {row.applicants > 0 ? row.applicants : "-"}
        </span>
      ),
    },
  ];

  const handleApprove = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "active" as const } : l))
    );
    setModal(null);
  };

  const handleReject = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "rejected" as const } : l))
    );
    setModal(null);
  };

  const handleDelete = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setModal(null);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Listing <span className="gradient-text">Management</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review, approve, and manage all property listings.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Active", count: listings.filter((l) => l.status === "active").length, color: "text-emerald-500" },
              { label: "Pending", count: listings.filter((l) => l.status === "pending").length, color: "text-amber-500" },
              { label: "Rejected", count: listings.filter((l) => l.status === "rejected").length, color: "text-red-500" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-4 rounded-xl"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
              </motion.div>
            ))}
          </div>

          {listings.length === 0 ? (
            <div className="card p-8 rounded-2xl text-center">
              <p className="text-slate-500 dark:text-slate-400">No listings found.</p>
            </div>
          ) : (
            <AdminDataTable<AdminListing>
              columns={columns}
              data={listings}
              searchKey="title"
              searchPlaceholder="Search listings..."
              filterKey="status"
              filterOptions={[
                { label: "Active", value: "active" },
                { label: "Pending", value: "pending" },
                { label: "Rejected", value: "rejected" },
              ]}
              actions={(row) => (
                <div className="flex items-center gap-1">
                  {row.status === "pending" && (
                    <button
                      onClick={() => handleApprove(row.id)}
                      className="px-2 py-1 text-xs font-medium rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {row.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(row.id)}
                      className="px-2 py-1 text-xs font-medium rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => setModal({ type: "delete", listing: row })}
                    className="px-2 py-1 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            />
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {modal?.type === "delete" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 rounded-2xl max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-red-600 mb-1">Delete Listing</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Permanently delete <strong>{modal.listing.title}</strong>? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setModal(null)} className="btn-secondary text-sm !py-2 flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(modal.listing.id)}
                  className="text-sm font-semibold py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors flex-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
