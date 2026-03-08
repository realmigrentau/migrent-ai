import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import { useAuth } from "../../hooks/useAuth";
import {
  listTickets, getTicket, replyToTicket, updateTicket,
  getSupportAnalytics, getHelpCategories, getHelpArticles,
  type Ticket, type TicketDetail, type HelpArticle, type HelpCategory,
} from "../../lib/api";

type Tab = "tickets" | "articles" | "analytics";

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending_customer: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pending_internal: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  pending_customer: "Awaiting Reply",
  pending_internal: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const priorityDots: Record<string, string> = {
  low: "bg-slate-400",
  normal: "bg-blue-400",
  high: "bg-amber-500",
  urgent: "bg-red-500",
};

const categoryLabels: Record<string, string> = {
  billing: "Billing",
  onboarding: "Onboarding",
  verification: "Verification",
  listings: "Listings",
  trust_safety: "Trust & Safety",
  bug: "Bug",
  feedback: "Feedback",
};

export default function AdminSupport() {
  const { session } = useAuth();
  const token = session?.access_token || "";
  const [tab, setTab] = useState<Tab>("tickets");

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Customer <span className="gradient-text">Support</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage tickets, help articles, and support metrics.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {([
          { key: "tickets" as Tab, label: "Tickets" },
          { key: "articles" as Tab, label: "Help Articles" },
          { key: "analytics" as Tab, label: "Analytics" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "tickets" && <TicketsTab token={token} />}
      {tab === "articles" && <ArticlesTab token={token} />}
      {tab === "analytics" && <AnalyticsTab token={token} />}
    </AdminLayout>
  );
}


// ══════════════════════════════════════════════════════════════
//  TICKETS TAB
// ══════════════════════════════════════════════════════════════

function TicketsTab({ token }: { token: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Detail view
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Reply / update state
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [internalNote, setInternalNote] = useState("");

  useEffect(() => {
    loadTickets();
  }, [token, statusFilter, priorityFilter, categoryFilter, page]);

  async function loadTickets() {
    if (!token) return;
    setLoading(true);
    const res = await listTickets(token, {
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      category: categoryFilter || undefined,
      page,
      per_page: 20,
    });
    setTickets(res?.tickets || []);
    setTotal(res?.total || 0);
    setLoading(false);
  }

  async function openTicket(id: string) {
    setDetailLoading(true);
    const data = await getTicket(token, id);
    if (data) {
      setSelectedTicket(data);
      setNewStatus(data.status);
      setNewPriority(data.priority);
    }
    setDetailLoading(false);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !selectedTicket) return;
    setSending(true);
    await replyToTicket(token, selectedTicket.id, reply);
    setReply("");
    setSending(false);
    openTicket(selectedTicket.id);
    loadTickets();
  }

  async function handleUpdate() {
    if (!selectedTicket) return;
    const data: Record<string, string> = {};
    if (newStatus !== selectedTicket.status) data.status = newStatus;
    if (newPriority !== selectedTicket.priority) data.priority = newPriority;
    if (internalNote.trim()) data.internal_note = internalNote;
    if (Object.keys(data).length === 0) return;

    await updateTicket(token, selectedTicket.id, data);
    setInternalNote("");
    openTicket(selectedTicket.id);
    loadTickets();
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending_customer">Awaiting Reply</option>
          <option value="pending_internal">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value="">All Categories</option>
          {Object.entries(categoryLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="self-center text-sm text-slate-400">{total} ticket{total !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex gap-6">
        {/* Ticket List */}
        <div className={`${selectedTicket ? "w-1/2" : "w-full"} transition-all`}>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="card rounded-2xl p-12 text-center">
              <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-slate-500 text-sm">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => openTicket(t.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedTicket?.id === t.id
                      ? "border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-900/10"
                      : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDots[t.priority] || priorityDots.normal}`} />
                        <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">{t.subject}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono">{t.id.slice(0, 8)}</span>
                        <span>{t.email || "-"}</span>
                        <span>{categoryLabels[t.category || ""] || t.category}</span>
                        <span>{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status]}`}>
                      {statusLabels[t.status] || t.status}
                    </span>
                  </div>
                </button>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40">Prev</button>
                  <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ticket Detail Panel */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-1/2 card rounded-2xl p-5 overflow-y-auto max-h-[calc(100vh-14rem)] sticky top-24"
            >
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="font-mono">{selectedTicket.id.slice(0, 8)}</span>
                        <span>{selectedTicket.email || "-"}</span>
                        <span>{selectedTicket.source.replace("_", " ")}</span>
                        <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Agent Controls */}
                  <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 space-y-3">
                    <h3 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Agent Controls</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Status</label>
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                          <option value="open">Open</option>
                          <option value="pending_customer">Pending Customer</option>
                          <option value="pending_internal">Pending Internal</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Priority</label>
                        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Internal note (only visible to agents)..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none" />
                    <button onClick={handleUpdate}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors">
                      Update Ticket
                    </button>
                  </div>

                  {/* Messages Thread */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversation</h3>
                    {(selectedTicket.messages || []).map((msg) => (
                      <div key={msg.id} className={`p-3 rounded-xl text-sm ${
                        msg.is_internal
                          ? "border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
                          : msg.sender_type === "agent"
                          ? "border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10"
                          : "border border-slate-100 dark:border-slate-800"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold ${
                            msg.is_internal ? "text-amber-600 dark:text-amber-400" :
                            msg.sender_type === "agent" ? "text-indigo-600 dark:text-indigo-400" :
                            "text-slate-500"
                          }`}>
                            {msg.is_internal ? "Internal Note" : msg.sender_type === "agent" ? "You" : "Customer"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{msg.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply */}
                  {selectedTicket.status !== "closed" && (
                    <form onSubmit={handleReply} className="space-y-2">
                      <textarea value={reply} onChange={(e) => setReply(e.target.value)}
                        placeholder="Write a reply to the customer..."
                        required rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500" />
                      <button type="submit" disabled={sending || !reply.trim()}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-lg text-sm font-medium transition-colors">
                        {sending ? "Sending..." : "Send Reply"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
//  ARTICLES TAB
// ══════════════════════════════════════════════════════════════

function ArticlesTab({ token }: { token: string }) {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [audience, setAudience] = useState("both");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [artRes, catRes] = await Promise.all([
      getHelpArticles(),
      getHelpCategories(),
    ]);
    setArticles(artRes?.articles || []);
    setCategories(catRes?.categories || []);
    setLoading(false);
  }

  function generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const res = await fetch(`${BASE_URL}/support/help/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        slug: slug || generateSlug(title),
        category_id: categoryId || null,
        audience,
        body,
        published: true,
      }),
    });

    if (res.ok) {
      setTitle("");
      setSlug("");
      setCategoryId("");
      setAudience("both");
      setBody("");
      setShowForm(false);
      loadData();
    }
    setSubmitting(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{articles.length} article{articles.length !== 1 ? "s" : ""} published</p>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="card rounded-2xl p-5 mb-6 space-y-4 overflow-hidden"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white">Create Help Article</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Title</label>
                <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(generateSlug(e.target.value)); }}
                  placeholder="How to verify your identity" required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Slug</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                  placeholder="how-to-verify-your-identity" required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Category</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Audience</label>
                <select value={audience} onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
                  <option value="both">Everyone</option>
                  <option value="seeker">Seekers only</option>
                  <option value="owner">Owners only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Body (Markdown)</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)}
                placeholder="Write your help article content in Markdown..." required
                rows={8}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono resize-none" />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-lg text-sm font-medium transition-colors">
                {submitting ? "Publishing..." : "Publish Article"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Articles List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center">
          <p className="text-slate-500 text-sm mb-2">No help articles yet.</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-rose-500 hover:text-rose-600 font-medium">
            Create your first article
          </button>
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Audience</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Views</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Helpful</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{a.title}</p>
                    <p className="text-xs text-slate-400 font-mono">/help/{a.slug}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-500">{a.audience === "both" ? "Everyone" : a.audience}</td>
                  <td className="px-4 py-3 text-slate-500">{a.view_count}</td>
                  <td className="px-4 py-3">
                    <span className="text-green-600">{a.helpful_yes}</span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-red-500">{a.helpful_no}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{new Date(a.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
//  ANALYTICS TAB
// ══════════════════════════════════════════════════════════════

function AnalyticsTab({ token }: { token: string }) {
  const [analytics, setAnalytics] = useState<{
    total_tickets: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    by_category: Record<string, number>;
    avg_csat: number | null;
    csat_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getSupportAnalytics(token).then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, [token]);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const metricCards = [
    { label: "Total Tickets", value: analytics.total_tickets, color: "from-slate-500 to-slate-600" },
    { label: "Open", value: analytics.by_status?.open || 0, color: "from-blue-500 to-blue-600" },
    { label: "Pending", value: (analytics.by_status?.pending_customer || 0) + (analytics.by_status?.pending_internal || 0), color: "from-amber-500 to-amber-600" },
    { label: "Resolved", value: analytics.by_status?.resolved || 0, color: "from-green-500 to-green-600" },
    { label: "Avg CSAT", value: analytics.avg_csat ? `${analytics.avg_csat}/5` : "N/A", color: "from-purple-500 to-purple-600" },
    { label: "CSAT Ratings", value: analytics.csat_count, color: "from-rose-500 to-rose-600" },
  ];

  const categoryData = Object.entries(analytics.by_category).sort((a, b) => b[1] - a[1]);
  const maxCatCount = categoryData.length > 0 ? categoryData[0][1] : 1;

  const statusData = Object.entries(analytics.by_status);

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card p-4 rounded-2xl">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-xs font-bold mb-2`}>
              {typeof card.value === "number" ? (card.value > 99 ? "99+" : card.value) : "~"}
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Category */}
        <div className="card p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Tickets by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {categoryData.map(([cat, count], i) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{categoryLabels[cat] || cat}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCatCount) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tickets by Status */}
        <div className="card p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Tickets by Status</h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {statusData.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
                      {statusLabels[status] || status}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="card p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Priority Distribution</h3>
        <div className="grid grid-cols-4 gap-4">
          {(["low", "normal", "high", "urgent"] as const).map((p) => {
            const count = analytics.by_priority?.[p] || 0;
            return (
              <div key={p} className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className={`w-3 h-3 rounded-full ${priorityDots[p]} mx-auto mb-2`} />
                <p className="text-2xl font-black text-slate-900 dark:text-white">{count}</p>
                <p className="text-xs text-slate-400 capitalize">{p}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
