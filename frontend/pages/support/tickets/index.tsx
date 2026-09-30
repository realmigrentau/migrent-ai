import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";
import SEOHead from "../../../components/SEOHead";
import { Field, Input, Select, Textarea } from "../../../components/hub/ui/Field";
import { hubFromSite } from "../../../lib/hub/routes";
import { supportPromise } from "../../../lib/siteIdentity";
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
      window.location.assign(hubFromSite.signIn(router.asPath));
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
      <SEOHead title="Your support requests" noIndex />

      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Support</p>
            <h1 className="site-h2 mt-2 !text-[clamp(1.9rem,3.4vw,2.6rem)]">Your support requests</h1>
            <p className="site-body mt-2">{supportPromise()}</p>
          </div>
          <button type="button" onClick={() => setShowForm(!showForm)} aria-expanded={showForm} aria-controls="new-ticket" className="btn-primary shrink-0">
            <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" /> New request
          </button>
        </div>

        {showForm && (
          <form id="new-ticket" onSubmit={handleSubmit} className="site-card site-card--pad mt-6 space-y-4">
            <h2 className="site-h3">Send a new request</h2>
            <Field label="What is it about?">
              {({ id }) => (
                <Select id={id} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="feedback">General feedback</option>
                  <option value="billing">Fees and payments</option>
                  <option value="onboarding">Getting started</option>
                  <option value="verification">ID checks</option>
                  <option value="listings">Listings</option>
                  <option value="trust_safety">Safety</option>
                  <option value="bug">Something is broken</option>
                </Select>
              )}
            </Field>
            <Field label="Subject">
              {({ id }) => <Input id={id} value={subject} onChange={(e) => setSubject(e.target.value)} required minLength={3} maxLength={140} />}
            </Field>
            <Field label="Message" hint="Tell us what happened and what you expected.">
              {({ id, describedBy }) => <Textarea id={id} value={message} onChange={(e) => setMessage(e.target.value)} required minLength={10} rows={5} aria-describedby={describedBy} />}
            </Field>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitting} data-state={submitting ? "loading" : undefined} className="btn-primary">
                {submitting ? "Sending" : "Send request"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-[var(--color-surface-muted)]" />
              ))}
            </div>
          ) : (
            <TicketList tickets={tickets} basePath="/support/tickets" />
          )}
        </div>

        <p className="site-meta mt-8 text-center">
          Quick answers are in <Link href="/help" className="underline underline-offset-2">Help</Link>.
        </p>
      </div>
    </>
  );
}
