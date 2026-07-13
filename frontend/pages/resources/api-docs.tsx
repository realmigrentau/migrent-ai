import Link from "next/link";
import { Code2 } from "lucide-react";
import SEOHead from "../../components/SEOHead";
import Breadcrumb from "../../components/content/Breadcrumb";

/**
 * Honest placeholder: a public MigRent API does not exist yet. The previous
 * version of this page documented fictional v2 endpoints, API keys and OAuth
 * flows - removed as part of the no-invented-content rule. Reinstate real
 * docs here when the API ships (the old copy lives in data/apiDocsData.ts).
 */
export default function ApiDocs() {
  return (
    <>
      <SEOHead
        title="Developer API - in development"
        description="The MigRent developer API is in development and not yet available."
        noIndex
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb
          items={[
            { label: "Resources", href: "/resources" },
            { label: "Developer API" },
          ]}
        />

        <div className="text-center py-16">
          <span className="mx-auto w-12 h-12 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <Code2 className="w-6 h-6" />
          </span>
          <div className="eyebrow mt-6">In development</div>
          <h1 className="font-serif text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)] mt-2">
            The MigRent API is on its way.
          </h1>
          <p className="text-[15px] text-[var(--color-ink-2)] leading-[1.6] mt-4 max-w-[52ch] mx-auto">
            We are building a developer API for listings and suburb data. It is
            not yet available - no endpoints, keys, or tokens exist today. If
            you would like to be notified when it ships, or you have a use case
            in mind, we would genuinely like to hear it.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/contact"
              className="btn-primary h-[44px] px-6 rounded-[10px] inline-flex items-center text-[14.5px]"
            >
              Tell us your use case
            </Link>
            <Link
              href="/resources"
              className="h-[44px] px-6 rounded-[10px] inline-flex items-center text-[14.5px] font-semibold border border-[var(--color-line-2)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              Back to resources
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
