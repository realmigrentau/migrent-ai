import Link from "next/link";
import { ArrowRight, CircleSlash } from "lucide-react";
import SEOHead from "../components/SEOHead";
import StatusPage from "../components/site/StatusPage";
import { hubFromSite } from "../lib/hub/routes";

/**
 * Where Stripe sends a host who leaves the host-fee checkout without paying
 * (backend routes_bookings.py BOOKING_CANCEL_URL). Renters never pay
 * Migrent, so they never land here.
 */
export default function BookingCancelledPage() {
  return (
    <>
      <SEOHead title="Payment not completed" noIndex />
      <StatusPage
        icon={<CircleSlash className="h-6 w-6" strokeWidth={1.9} />}
        eyebrow="Payment not completed"
        title={
          <>
            No charge <strong>was made.</strong>
          </>
        }
        actions={
          <>
            <Link href={hubFromSite.path("/applications")} className="btn-primary btn-lg">
              Open your requests <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <Link href="/contact" className="btn-secondary btn-lg">
              Contact us
            </Link>
          </>
        }
      >
        <p className="m-0">You left the payment page before paying, so the stay is not confirmed yet.</p>
        <p className="m-0">To finish, open your requests and press &ldquo;Pay to confirm&rdquo; on the stay. It opens a fresh payment page each time.</p>
      </StatusPage>
    </>
  );
}
