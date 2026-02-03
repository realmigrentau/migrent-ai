import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import AdminDataTable, { Column } from "../../components/AdminDataTable";
import { mockUsers, exportCSV, type AdminUser } from "../../lib/adminApi";

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [modal, setModal] = useState<{ type: string; user: AdminUser } | null>(null);
  const [selectedRole, setSelectedRole] = useState("seeker");

  const columns: Column<AdminUser>[] = [
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.role === "superadmin"
              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
              : row.role === "owner"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          {row.role}
        </span>
      ),
    },
    { key: "signupDate", label: "Signed Up" },
    { key: "lastActive", label: "Last Active" },
    {
      key: "verified",
      label: "Verified",
      render: (row) =>
        row.verified ? (
          <span className="text-emerald-500 font-semibold text-xs">Verified</span>
        ) : (
          <span className="text-slate-400 text-xs">Unverified</span>
        ),
    },
    {
      key: "suspended",
      label: "Status",
      render: (row) =>
        row.suspended ? (
          <span className="text-red-500 font-semibold text-xs">Suspended</span>
        ) : (
          <span className="text-emerald-500 font-semibold text-xs">Active</span>
        ),
    },
  ];

  const handleExport = () => {
    exportCSV(
      "migrent-users.csv",
      ["Email", "Role", "Signup Date", "Last Active", "Verified", "Suspended"],
      users.map((u) => [u.email, u.role, u.signupDate, u.lastActive, String(u.verified), String(u.suspended)])
    );
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole as AdminUser["role"] } : u))
    );
    setModal(null);
  };

  const handleSuspend = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended: !u.suspended } : u))
    );
    setModal(null);
  };

  const handleDelete = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setModal(null);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          User <span className="gradient-text">Management</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Search, filter, and manage all MigRent user accounts.
        </p>
      </div>

      <AdminDataTable<AdminUser>
        columns={columns}
        data={users}
        searchKey="email"
        searchPlaceholder="Search by email..."
        filterKey="role"
        filterOptions={[
          { label: "Seekers", value: "seeker" },
          { label: "Owners", value: "owner" },
          { label: "SuperAdmin", value: "superadmin" },
        ]}
        onExportCSV={handleExport}
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setSelectedRole(row.role);
                setModal({ type: "role", user: row });
              }}
              className="px-2 py-1 text-xs font-medium rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            >
              Role
            </button>
            <button
              onClick={() => setModal({ type: "suspend", user: row })}
              className="px-2 py-1 text-xs font-medium rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
            >
              {row.suspended ? "Unsuspend" : "Suspend"}
            </button>
            <button
              onClick={() => setModal({ type: "delete", user: row })}
              className="px-2 py-1 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      />

      {/* Modal */}
      <AnimatePresence>
        {modal && (
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
              {modal.type === "role" && (
                <>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Change Role</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {modal.user.email}
                  </p>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="input-field mb-4"
                  >
                    <option value="seeker">Seeker</option>
                    <option value="owner">Owner</option>
                    <option value="superadmin">SuperAdmin</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => setModal(null)} className="btn-secondary text-sm !py-2 flex-1">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRoleChange(modal.user.id, selectedRole)}
                      className="btn-primary text-sm !py-2 flex-1"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
              {modal.type === "suspend" && (
                <>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {modal.user.suspended ? "Unsuspend" : "Suspend"} User
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {modal.user.suspended ? "Reactivate" : "Suspend"} <strong>{modal.user.email}</strong>?
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setModal(null)} className="btn-secondary text-sm !py-2 flex-1">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSuspend(modal.user.id)}
                      className="btn-primary text-sm !py-2 flex-1"
                    >
                      Confirm
                    </button>
                  </div>
                </>
              )}
              {modal.type === "delete" && (
                <>
                  <h3 className="text-lg font-bold text-red-600 mb-1">Delete User</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Permanently delete <strong>{modal.user.email}</strong>? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setModal(null)} className="btn-secondary text-sm !py-2 flex-1">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(modal.user.id)}
                      className="text-sm font-semibold py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors flex-1"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
