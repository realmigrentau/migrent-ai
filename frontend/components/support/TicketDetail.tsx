import { useState } from "react";
import type { TicketDetail as TicketDetailType, TicketMessage } from "../../lib/api";
import { replyToTicket, updateTicket, submitCSAT } from "../../lib/api";

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending_customer: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pending_internal: "bg-[var(--color-primary-soft)] text-primary-700 dark:bg-primary-900/30 dark:text-[var(--color-primary)]",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

interface Props {
  ticket: TicketDetailType;
  token: string;
  isAgent?: boolean;
  onUpdate?: () => void;
}

export default function TicketDetailView({ ticket, token, isAgent, onUpdate }: Props) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  // Agent controls
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [newPriority, setNewPriority] = useState(ticket.priority);
  const [internalNote, setInternalNote] = useState("");

  // CSAT
  const [csatRating, setCsatRating] = useState(0);
  const [csatSubmitted, setCsatSubmitted] = useState(!!ticket.csat_rating);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    await replyToTicket(token, ticket.id, reply);
    setReply("");
    setSending(false);
    onUpdate?.();
  }

  async function handleAgentUpdate() {
    const data: Record<string, string> = {};
    if (newStatus !== ticket.status) data.status = newStatus;
    if (newPriority !== ticket.priority) data.priority = newPriority;
    if (internalNote.trim()) data.internal_note = internalNote;

    if (Object.keys(data).length === 0) return;
    await updateTicket(token, ticket.id, data);
    setInternalNote("");
    onUpdate?.();
  }

  async function handleCSAT() {
    if (csatRating === 0) return;
    await submitCSAT(ticket.id, csatRating);
    setCsatSubmitted(true);
  }

  const showCSAT = ticket.status === "resolved" && !csatSubmitted && !isAgent;

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{ticket.subject}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="font-mono">{ticket.id.slice(0, 8)}</span>
            <span className="capitalize">{ticket.category?.replace("_", " ")}</span>
            <span>{ticket.source.replace("_", " ")}</span>
            <span>{new Date(ticket.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
            {ticket.status.replace("_", " ")}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
            {ticket.priority}
          </span>
        </div>
      </div>

      {/* Agent Controls */}
      {isAgent && (
        <div className="p-4 rounded-xl border border-[var(--color-primary-soft)] dark:border-indigo-800 bg-[var(--color-primary-soft)]/50 dark:bg-primary-900/10 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-primary)] dark:text-[var(--color-primary)]">Agent Controls</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="open">Open</option>
                <option value="pending_customer">Pending Customer</option>
                <option value="pending_internal">Pending Internal</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <textarea
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="Internal note (only visible to agents)..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none"
          />

          <button
            onClick={handleAgentUpdate}
            className="px-4 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] text-white rounded-lg text-sm font-medium transition-colors"
          >
            Update Ticket
          </button>

          {ticket.email && (
            <p className="text-xs text-slate-400">Customer: {ticket.email}</p>
          )}
        </div>
      )}

      {/* Message Thread */}
      <div className="space-y-3">
        {(ticket.messages || []).map((msg: TicketMessage) => (
          <div
            key={msg.id}
            className={`p-4 rounded-xl ${
              msg.is_internal
                ? "border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
                : msg.sender_type === "agent"
                ? "border border-[var(--color-primary-soft)] dark:border-primary-900 bg-[var(--color-primary-soft)]/50 dark:bg-primary-900/10"
                : "border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium ${
                msg.is_internal ? "text-amber-600 dark:text-amber-400" :
                msg.sender_type === "agent" ? "text-[var(--color-primary)] dark:text-[var(--color-primary)]" :
                "text-slate-600 dark:text-slate-400"
              }`}>
                {msg.is_internal ? "Internal Note" : msg.sender_type === "agent" ? "Support Agent" : "Customer"}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{msg.body}</p>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      {ticket.status !== "closed" && (
        <form onSubmit={handleReply} className="space-y-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply..."
            required
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/30 resize-none"
          />
          <button
            type="submit"
            disabled={sending || !reply.trim()}
            className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)] disabled:bg-[var(--color-primary-soft)] text-white rounded-lg text-sm font-medium transition-colors"
          >
            {sending ? "Sending..." : "Send Reply"}
          </button>
        </form>
      )}

      {/* CSAT */}
      {showCSAT && (
        <div className="p-5 rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 text-center">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">How was your experience?</h3>
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setCsatRating(n)}
                className={`w-10 h-10 rounded-lg text-lg transition-all ${
                  csatRating >= n
                    ? "bg-amber-400 text-white scale-110"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-amber-100"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={handleCSAT}
            disabled={csatRating === 0}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Submit Rating
          </button>
        </div>
      )}
    </div>
  );
}
