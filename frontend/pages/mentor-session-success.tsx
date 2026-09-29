import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SEOHead from "../components/SEOHead";
import StatusPage from "../components/site/StatusPage";
import { hubFromSite } from "../lib/hub/routes";

/**
 * Where Stripe sends someone after paying for a mentor session (backend
 * routes_mentors.py). It does not promise a time: the mentor arranges that.
 */
export default function MentorSessionSuccessPage() {
  return (
    <>
      <SEOHead title="Session booked" noIndex />
      <StatusPage
        icon={<CheckCircle2 className="h-6 w-6" strokeWidth={1.9} />}
        tone="success"
        eyebrow="Mentor session"
        title={
          <>
            Thanks, your session is <strong>booked.</strong>
          </>
        }
        actions={
          <>
            <Link href={hubFromSite.path("/messages")} className="btn-primary btn-lg">
              Open messages <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <Link href="/mentors" className="btn-secondary btn-lg">
              See other mentors
            </Link>
          </>
        }
      >
        <p className="m-0">Your mentor will confirm a time with you in Migrent messages. If you do not hear back within a few days, contact us.</p>
      </StatusPage>
    </>
  );
}
