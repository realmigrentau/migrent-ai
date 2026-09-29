import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, CheckCircle2, Clock, MessageSquare, TriangleAlert } from "lucide-react";
import SEOHead from "../components/SEOHead";
import StatusPage from "../components/site/StatusPage";
import { useAuth } from "../hooks/useAuth";
import { getCheckoutStatus } from "../lib/api";
import { hubFromSite } from "../lib/hub/routes";
import { siteIdentity } from "../lib/siteIdentity";

/**
 * Where Stripe sends a host after the host-fee checkout (backend
 * routes_bookings.py BOOKING_SUCCESS_URL). Anyone can type this URL, so the
 * page asks the API what the Stripe webhook has recorded and only says
 * "confirmed" when it has. Renters never pay Migrent and never land here.
 */

type State = "checking" | "paid" | "waiting" | "unknown";

const POLLS = 6;
const POLL_MS = 2500;

export default function BookingSuccessPage() {
  const router = useRouter();
  const sessionId = typeof router.query.session_id === "string" ? router.query.session_id : "";
  const { session, loading } = useAuth();
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    if (!router.isReady || loading) return;
    if (!session?.access_token || !sessionId) {
      setState("unknown");
      return;
    }
    let cancelled = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = async () => {
      const res = await getCheckoutStatus(session.access_token, sessionId);
      if (cancelled) return;
      if (res.ok && res.paid) return setState("paid");
      tries += 1;
      // The webhook usually lands within seconds of the redirect.
      if (res.ok && tries < POLLS) {
        setState("checking");
        timer = setTimeout(check, POLL_MS);
        return;
      }
      setState(res.ok ? "waiting" : "unknown");
    };
    check();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [router.isReady, loading, session?.access_token, sessionId]);

  const requests = (
    <Link href={hubFromSite.path("/applications")} className="btn-primary btn-lg">
      Open your requests <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
    </Link>
  );

  return (
    <>
      <SEOHead title={state === "paid" ? "Stay confirmed" : "Checking your payment"} noIndex />
      <div aria-live="polite">
        {state === "paid" ? (
          <StatusPage
            icon={<CheckCircle2 className="h-6 w-6" strokeWidth={1.9} />}
            tone="success"
            eyebrow="Host fee paid"
            title={
              <>
                The stay is <strong>confirmed.</strong>
              </>
            }
            actions={requests}
            after={
              <div className="site-card site-card--pad">
                <p className="site-h3">What happens next</p>
                <ul className="m-0 mt-3 list-none space-y-3 p-0">
                  <li className="site-body flex gap-3">
                    <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-[color:var(--color-primary)]" strokeWidth={2} aria-hidden="true" />
                    Message your guest in Migrent Hub to agree check-in and the key handover.
                  </li>
                  <li className="site-body flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[color:var(--color-primary)]" strokeWidth={2} aria-hidden="true" />
                    The fee is once per property, so later stays at this property confirm without it.
                  </li>
                </ul>
              </div>
            }
          >
            <p className="m-0">Thanks. Your payment went through and the booking is confirmed.</p>
          </StatusPage>
        ) : state === "waiting" ? (
          <StatusPage
            icon={<Clock className="h-6 w-6" strokeWidth={1.9} />}
            tone="primary"
            eyebrow="Payment received"
            title={
              <>
                Nearly <strong>there.</strong>
              </>
            }
            actions={requests}
          >
            <p className="m-0">Stripe has not confirmed the payment to us yet. This usually takes a minute. The booking will show as confirmed in your requests once it has.</p>
          </StatusPage>
        ) : state === "unknown" ? (
          <StatusPage
            icon={<TriangleAlert className="h-6 w-6" strokeWidth={1.9} />}
            tone="warn"
            eyebrow="Payment status"
            title={
              <>
                We could not check <strong>this payment.</strong>
              </>
            }
            actions={
              <>
                {session ? requests : (
                  <Link href={hubFromSite.signIn(router.asPath)} className="btn-primary btn-lg">
                    Sign in to check
                  </Link>
                )}
                <Link href="/contact" className="btn-secondary btn-lg">
                  Contact us
                </Link>
              </>
            }
          >
            <p className="m-0">
              If you paid, the booking will show as confirmed in your requests once Stripe tells us. Questions:{" "}
              <a href={`mailto:${siteIdentity.emails.support}`} className="underline underline-offset-2 [overflow-wrap:anywhere]">
                {siteIdentity.emails.support}
              </a>
              .
            </p>
          </StatusPage>
        ) : (
          <StatusPage
            icon={<Clock className="h-6 w-6" strokeWidth={1.9} />}
            eyebrow="One moment"
            title={
              <>
                Checking your <strong>payment.</strong>
              </>
            }
          >
            <p className="m-0">We are asking Stripe whether the payment went through.</p>
          </StatusPage>
        )}
      </div>
    </>
  );
}
