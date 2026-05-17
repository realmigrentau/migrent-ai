import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { listTickets, createTicket, type Ticket } from "../../../lib/api";
import TicketList from "../../../components/support/TicketList";

export default function MyTickets() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // New ticket form
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("feedback");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.push("/signin");
      return;
    }
    loadTickets();
  }, [session, authLoading]);

  async function loadTickets() {
    if (!session?.access_token) return;
    setLoading(true);
    const res = await listTickets(session.access_token);
    setTickets(res?.tickets || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token) return;
    setSubmitting(true);
    const res = await createTicket(
      { subject, message, category, source: "in_app" },
      session.access_token
    );
    if (res?.ticket_id) {
      setShowForm(false);
      setSubject("");
      setMessage("");
      setCategory("feedback");
      loadTickets();
    }
    setSubmitting(false);
  }

  if (authLoading) return null;

  return (
    <>
      <Head>
        <title>My Tickets - MigRent Support</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Support Tickets</h1>
            <p className="text-sm text-slate-500 mt-1">Track your support requests</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </button>
        </div>

        {/* New ticket form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Submit a new request</h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="feedback">General Feedback</option>
              <option value="billing">Billing / Payments</option>
              <option value="onboarding">Onboarding</option>
              <option value="verification">Verification</option>
              <option value="listings">Listings</option>
              <option value="trust_safety">Trust & Safety</option>
              <option value="bug">Bug Report</option>
            </select>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              required
              minLength={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail..."
              required
              minLength={10}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)] disabled:bg-[var(--color-primary-soft)] text-white rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Tickets list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <TicketList tickets={tickets} basePath="/support/tickets" />
        )}

        {/* Help center link */}
        <div className="mt-8 text-center">
          <Link href="/help" className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)] font-medium">
            Browse Help Center
          </Link>
        </div>
      </div>
    </>
  );
}
