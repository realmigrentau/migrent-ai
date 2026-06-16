import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard, { StatusBadge } from "../ui/GlassCard";
import {
  MessageCircle,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  ChevronRight,
  HelpCircle,
  BookOpen,
  Headphones,
  X,
} from "lucide-react";
import { createTicket, type Ticket } from "../../lib/api";

interface SupportTabProps {
  tickets: Ticket[];
  ticketsLoading: boolean;
  session: any;
  fetchTickets: () => void;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function SupportTab({
  tickets,
  ticketsLoading,
  session,
  fetchTickets,
  showMessage,
}: SupportTabProps) {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketCategory, setTicketCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "new").length;
  const pendingTickets = tickets.filter((t) => t.status === "pending" || t.status === "waiting").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      showMessage("Please fill in all fields", "error");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createTicket(
        {
          subject: ticketSubject,
          message: ticketMessage,
          category: ticketCategory,
          priority: "normal",
          source: "settings",
        },
        session?.access_token
      );

      if (result) {
        showMessage("Ticket created! We'll get back to you soon 🎯", "success");
        setTicketSubject("");
        setTicketMessage("");
        setTicketCategory("general");
        setShowNewTicket(false);
        fetchTickets();
      } else {
        showMessage("Failed to create ticket", "error");
      }
    } catch {
      showMessage("Failed to create ticket", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = searchQuery
    ? tickets.filter((t) =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tickets;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
      case "new":
        return <StatusBadge status="action" label="Open" />;
      case "pending":
      case "waiting":
        return <StatusBadge status="pending" label="Pending" />;
      case "resolved":
      case "closed":
        return <StatusBadge status="verified" label="Resolved" />;
      default:
        return <StatusBadge status="info" label={status} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Open", count: openTickets, icon: AlertCircle, color: "rose", gradient: "from-[var(--color-primary)] to-[var(--color-primary)]", bg: "bg-[var(--color-primary-soft)]/80 dark:bg-[var(--color-primary)]/10 border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)]" },
          { label: "Pending", count: pendingTickets, icon: Clock, color: "amber", gradient: "from-[var(--color-warn-500)] to-[var(--color-warn-500)]", bg: "bg-[var(--color-warn-50)]/80 dark:bg-[var(--color-warn-50)]0/10 border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20" },
          { label: "Resolved", count: resolvedTickets, icon: CheckCircle2, color: "emerald", gradient: "from-[var(--color-accent)] to-[var(--color-primary)]", bg: "bg-[var(--color-accent-soft)]/80 dark:bg-[var(--color-accent-soft)]0/10 border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              className={`rounded-xl p-4 border ${stat.bg} text-center`}
            >
              <div className={`w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] ${stat.gradient} flex items-center justify-center shadow-sm mx-auto mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-[var(--color-ink)]">{stat.count}</p>
              <p className="text-[10px] text-[var(--color-ink-3)] mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* New Ticket + Search */}
      <GlassCard delay={0.1}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-3)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={() => setShowNewTicket(true)}
            className="btn-primary py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 justify-center shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </GlassCard>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicket && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewTicket(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[520px] z-50"
            >
              <div className="backdrop-blur-xl bg-white/95 dark:bg-[var(--color-surface)]/95 rounded-2xl shadow-2xl border border-white/20 dark:border-[var(--color-line)]/50 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-[var(--color-ink)]">New Support Ticket</h3>
                  <button
                    onClick={() => setShowNewTicket(false)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)]"
                  >
                    <X className="w-4 h-4 text-[var(--color-ink-3)]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-ink-3)] mb-1.5">Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="input-field"
                    >
                      <option value="general">General</option>
                      <option value="billing">Billing</option>
                      <option value="account">Account</option>
                      <option value="technical">Technical</option>
                      <option value="listing">Listing</option>
                      <option value="safety">Safety</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-ink-3)] mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-ink-3)] mb-1.5">Message</label>
                    <textarea
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      rows={4}
                      className="input-field resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowNewTicket(false)}
                      className="btn-secondary py-2.5 px-5 rounded-xl text-sm flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateTicket}
                      disabled={submitting || !ticketSubject.trim() || !ticketMessage.trim()}
                      className="btn-primary py-2.5 px-5 rounded-xl text-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? "Submitting..." : "Submit Ticket"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Ticket List */}
      <GlassCard delay={0.15}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-ink)]">My Tickets</h3>
            <p className="text-xs text-[var(--color-ink-3)]">Your support requests</p>
          </div>
        </div>

        <div className="ml-14">
          {ticketsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer h-16 rounded-xl" />
              ))}
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="space-y-2">
              {filteredTickets.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-line)] hover:bg-[var(--color-surface)]/50 transition-colors cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                        {ticket.subject}
                      </p>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-[11px] text-[var(--color-ink-3)] truncate">
                      {ticket.category || "General"} · {new Date(ticket.created_at).toLocaleDateString("en-AU")}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--color-ink-4)] group-hover:text-[var(--color-ink-3)] transition-colors shrink-0 ml-2" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-[var(--color-ink-4)] mx-auto mb-2" />
              <p className="text-sm text-[var(--color-ink-3)]">No tickets yet</p>
              <p className="text-xs text-[var(--color-ink-3)] mt-1">Create one above if you need help</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Quick Help */}
      <GlassCard delay={0.25}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-blue-400 to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-ink)]">Quick Help</h3>
            <p className="text-xs text-[var(--color-ink-3)]">Browse help articles or contact us</p>
          </div>
        </div>

        <div className="ml-14 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/help"
            className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-line)] hover:bg-[var(--color-surface)]/50 transition-colors group"
          >
            <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-ink-2)] group-hover:text-[var(--color-ink)] dark:group-hover:text-white">
                Help Centre
              </p>
              <p className="text-[11px] text-[var(--color-ink-3)]">Browse articles</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--color-ink-4)] ml-auto" />
          </a>
          <a
            href="/contact"
            className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-line)] hover:bg-[var(--color-surface)]/50 transition-colors group"
          >
            <Headphones className="w-5 h-5 text-[var(--color-accent)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-ink-2)] group-hover:text-[var(--color-ink)] dark:group-hover:text-white">
                Contact Support
              </p>
              <p className="text-[11px] text-[var(--color-ink-3)]">Get in touch</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--color-ink-4)] ml-auto" />
          </a>
        </div>
      </GlassCard>
    </div>
  );
}
