import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import SEOHead from "../components/SEOHead";
import StatusPage from "../components/site/StatusPage";
import { hubFromSite } from "../lib/hub/routes";

/**
 * Landing page for Stripe's success redirect after the optional $19 renter
 * check (backend routes_verification.py). That check is switched off
 * (SEEKER_VERIFICATION_ENABLED), so this page is only reachable if it is
 * turned back on. Quiet confirmation, no confetti.
 */
export default function VerificationSuccess() {
  return (
    <>
      <SEOHead title="Payment received" description="Your renter check payment was received." noIndex />
      <StatusPage
        icon={<BadgeCheck className="h-6 w-6" strokeWidth={1.9} />}
        tone="success"
        eyebrow="Payment received"
        title={
          <>
            Your check is <strong>underway.</strong>
          </>
        }
        actions={
          <>
            <Link href={hubFromSite.path("/settings#verification")} className="btn-primary btn-lg">
              See its status <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <Link href={hubFromSite.home()} className="btn-secondary btn-lg">
              Go to Migrent Hub
            </Link>
          </>
        }
      >
        <p className="m-0">Thanks, your payment went through. The badge appears on your profile once a person has reviewed your ID. You can follow it in your settings.</p>
      </StatusPage>
    </>
  );
}
