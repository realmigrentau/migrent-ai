import Link from "next/link";
import { CircleSlash } from "lucide-react";
import SEOHead from "../components/SEOHead";
import StatusPage from "../components/site/StatusPage";
import { hubFromSite } from "../lib/hub/routes";

/**
 * Landing page for Stripe's cancel redirect if the optional $19 renter
 * check checkout is abandoned. No charge is made. The check is switched off
 * (SEEKER_VERIFICATION_ENABLED), so this is only reachable if it returns.
 */
export default function VerificationCancelled() {
  return (
    <>
      <SEOHead title="Checkout cancelled" description="The renter check checkout was cancelled. No charge was made." noIndex />
      <StatusPage
        icon={<CircleSlash className="h-6 w-6" strokeWidth={1.9} />}
        eyebrow="Checkout cancelled"
        title={
          <>
            No charge <strong>was made.</strong>
          </>
        }
        actions={
          <>
            <Link href={hubFromSite.path("/settings#verification")} className="btn-primary btn-lg">
              Back to your settings
            </Link>
            <Link href="/" className="btn-secondary btn-lg">
              Go to the homepage
            </Link>
          </>
        }
      >
        <p className="m-0">You left the checkout before paying, so nothing was billed. The check is optional, and you can come back to it any time.</p>
      </StatusPage>
    </>
  );
}
