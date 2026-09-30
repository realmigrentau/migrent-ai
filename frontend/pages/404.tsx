import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import SEOHead from "../components/SEOHead";
import StatusPage from "../components/site/StatusPage";

export default function NotFound() {
  return (
    <>
      <SEOHead title="Page not found" noIndex />
      <StatusPage
        icon={<Compass className="h-6 w-6" strokeWidth={1.9} />}
        eyebrow="Page not found"
        title={
          <>
            We could not find <strong>that page.</strong>
          </>
        }
        actions={
          <>
            <Link href="/" className="btn-primary btn-lg">
              Go to the homepage <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <Link href="/seeker/search" className="btn-secondary btn-lg">
              Search rooms
            </Link>
          </>
        }
      >
        <p className="m-0">
          It may have moved when we tidied up the site, or the link may have a typo. <Link href="/help" className="underline underline-offset-2">Help</Link> has the answers most people are looking for.
        </p>
      </StatusPage>
    </>
  );
}
