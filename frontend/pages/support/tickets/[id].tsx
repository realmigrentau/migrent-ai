import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { getTicket, type TicketDetail } from "../../../lib/api";
import TicketDetailView from "../../../components/support/TicketDetail";

export default function TicketPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTicket() {
    if (!session?.access_token || !id || typeof id !== "string") return;
    setLoading(true);
    const data = await getTicket(session.access_token, id);
    if (data) {
      setTicket(data);
    } else {
      setError("Ticket not found or you don't have access.");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.push("/signin");
      return;
    }
    loadTicket();
  }, [session, authLoading, id]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 bg-[var(--color-surface-muted)] dark:bg-[var(--color-surface-muted)] rounded" />
          <div className="h-4 w-1/3 bg-[var(--color-surface-muted)] rounded" />
          <div className="space-y-3 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-[var(--color-surface-muted)] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-bold text-[var(--color-ink)] mb-2">
          {error || "Ticket not found"}
        </h1>
        <Link href="/support/tickets" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] font-medium text-sm">
          Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title key="title">{ticket.subject} - MigRent Support</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--color-ink-3)] mb-6">
          <Link href="/support/tickets" className="hover:text-[var(--color-primary)] transition-colors">My Tickets</Link>
          <span>/</span>
          <span className="text-[var(--color-ink-2)] font-mono">{ticket.id.slice(0, 8)}</span>
        </nav>

        <TicketDetailView
          ticket={ticket}
          token={session!.access_token}
          isAgent={false}
          onUpdate={loadTicket}
        />
      </div>
    </>
  );
}
