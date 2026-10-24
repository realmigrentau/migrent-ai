import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SEOHead from "../../../components/SEOHead";
import { hubFromSite } from "../../../lib/hub/routes";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { getTicket, type TicketDetail } from "../../../lib/api";
import TicketDetailView from "../../../components/support/TicketDetail";

export default function TicketPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  // The load that last finished, and whether it found the ticket. Loading
  // and the error are derived from it, so a reload needs no reset.
  const token = session?.access_token;
  const ticketId = typeof id === "string" ? id : null;
  const [reload, setReload] = useState(0);
  const requestKey = token && ticketId ? `${token}|${ticketId}#${reload}` : null;
  const [settled, setSettled] = useState<{ key: string; found: boolean } | null>(null);
  const loading = settled === null || settled.key !== requestKey;
  const error = !loading && !settled.found ? "Ticket not found or you don't have access." : "";

  useEffect(() => {
    if (authLoading || session) return;
    window.location.assign(hubFromSite.signIn(router.asPath));
  }, [session, authLoading, router.asPath]);

  useEffect(() => {
    if (authLoading || !token || !ticketId) return;
    let alive = true;
    const key = `${token}|${ticketId}#${reload}`;
    void getTicket(token, ticketId).then((data) => {
      if (!alive) return;
      if (data) setTicket(data);
      setSettled({ key, found: Boolean(data) });
    });
    return () => {
      alive = false;
    };
  }, [authLoading, token, ticketId, reload]);

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
      <div className="py-20 text-center">
        <h1 className="site-h3 site-h3--lg mb-3">{error ? "We could not open that request" : "Request not found"}</h1>
        <p className="site-body mb-6">It may belong to another account, or the link may be incomplete.</p>
        <Link href="/support/tickets" className="btn-secondary">
          Back to your requests
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={ticket.subject} noIndex />

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="page-hero__crumbs">
            <li>
              <Link href="/support/tickets">Your support requests</Link>
            </li>
            <li aria-current="page" className="font-mono">
              {ticket.id.slice(0, 8)}
            </li>
          </ol>
        </nav>

        <TicketDetailView
          ticket={ticket}
          token={session!.access_token}
          isAgent={false}
          onUpdate={() => setReload((n) => n + 1)}
        />
      </div>
    </>
  );
}
