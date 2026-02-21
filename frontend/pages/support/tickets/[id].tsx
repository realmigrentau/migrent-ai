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
          <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="space-y-3 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {error || "Ticket not found"}
        </h1>
        <Link href="/support/tickets" className="text-rose-500 hover:text-rose-600 font-medium text-sm">
          Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{ticket.subject} - MigRent Support</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/support/tickets" className="hover:text-rose-500 transition-colors">My Tickets</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300 font-mono">{ticket.id.slice(0, 8)}</span>
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
