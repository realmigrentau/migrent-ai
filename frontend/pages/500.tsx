import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import SEOHead from "../components/SEOHead";
import StatusPage from "../components/site/StatusPage";
import { siteIdentity } from "../lib/siteIdentity";

export default function ServerError() {
  return (
    <>
      <SEOHead title="Something went wrong" noIndex />
      <StatusPage
        icon={<TriangleAlert className="h-6 w-6" strokeWidth={1.9} />}
        tone="warn"
        eyebrow="Something went wrong"
        title={
          <>
            That did not work, <strong>on our side.</strong>
          </>
        }
        actions={
          <>
            <button type="button" onClick={() => window.location.reload()} className="btn-primary btn-lg">
              <RefreshCw className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" /> Try again
            </button>
            <Link href="/" className="btn-secondary btn-lg">
              Go to the homepage
            </Link>
          </>
        }
      >
        <p className="m-0">
          Nothing you did caused this. Please try again in a moment. If it keeps happening, email{" "}
          <a href={`mailto:${siteIdentity.emails.support}`} className="underline underline-offset-2 [overflow-wrap:anywhere]">
            {siteIdentity.emails.support}
          </a>
          .
        </p>
      </StatusPage>
    </>
  );
}
