import Link from "next/link";
import SEOHead from "../components/SEOHead";
import LegalLayout from "../components/site/LegalLayout";

export default function SupportDisputes() {
  return (
    <>
      <SEOHead title="Dispute Resolution" description="Migrent dispute resolution process - how we handle complaints and disputes between users." />

      <LegalLayout title="Dispute Resolution" note="Last updated: 1 October 2026">
        {/* Fee wording aligned with the live product on 1 October 2026 (MIGRENT_MASTER_AUDIT.md MIG-006): hosts pay AUD $99 once per property, for short stays only; renters pay nothing. Must be reviewed by Australian counsel before launch (docs/legal/identity-and-claims.md). */}

        <div className="space-y-8">
          {/* Introduction */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Our Approach</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Migrent is an introduction service and is not a party to any arrangement between users. However, we want all users to have a positive experience. This page outlines the dispute resolution process for issues arising from or related to the Migrent platform.</p>
              <p>For disputes about tenancy arrangements (rent, bonds, property condition), please contact your state&apos;s Fair Trading or Residential Tenancies authority. See our <Link href="/guides/rental-laws" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Rental Laws Guide</Link>.</p>
            </div>
          </section>

          {/* 3-Step Process */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">3-Step Dispute Resolution Process</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-4">
              {/* Step 1 */}
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-emerald-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-accent)] dark:text-[var(--color-accent)]">1</span>
                  <h3 className="font-semibold text-[var(--color-ink)]">Direct Resolution (0-14 days)</h3>
                </div>
                <p>Attempt to resolve the issue directly with the other user. Use Migrent&apos;s messaging system to communicate clearly and document your conversations. Many disputes can be resolved through good-faith discussion.</p>
              </div>

              {/* Step 2 */}
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-primary-700)]">2</span>
                  <h3 className="font-semibold text-[var(--color-ink)]">Migrent Mediation (14-30 days)</h3>
                </div>
                <p>If direct resolution fails, contact Migrent at <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a> with the subject &quot;Dispute&quot;. Include:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Your account email and the other user&apos;s profile name</li>
                  <li>A clear description of the issue</li>
                  <li>Screenshots or evidence (if applicable)</li>
                  <li>What resolution you are seeking</li>
                </ul>
                <p className="mt-2">Migrent will review the complaint within 5 business days and attempt informal mediation. We may contact both parties to understand the situation. Note: Migrent&apos;s mediation is voluntary and non-binding.</p>
              </div>

              {/* Step 3 */}
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-violet-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-primary-700)]">3</span>
                  <h3 className="font-semibold text-[var(--color-ink)]">Binding Arbitration (30+ days)</h3>
                </div>
                <p>If mediation does not resolve the dispute within 30 days, either party may submit the dispute to binding arbitration administered by the Australian Centre for International Commercial Arbitration (ACICA) in accordance with ACICA Arbitration Rules.</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Seat of arbitration: Sydney, New South Wales</li>
                  <li>Language: English</li>
                  <li>Number of arbitrators: One (1)</li>
                  <li>Governing law: Laws of New South Wales, Australia</li>
                </ul>
                <p className="mt-2">The arbitrator&apos;s decision is final and binding on both parties. Each party bears their own costs unless the arbitrator orders otherwise.</p>
              </div>
            </div>
          </section>

          {/* What Migrent Can Do */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">What Migrent Can Do</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>As part of our mediation process, Migrent may:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Review messages and activity related to the dispute</li>
                <li>Contact both parties for their side of the story</li>
                <li>Issue warnings or suspend accounts that violate our Terms</li>
                <li>Remove listings or content that violate our policies</li>
                <li>Provide platform usage data relevant to the dispute</li>
              </ul>
            </div>
          </section>

          {/* What Migrent Cannot Do */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">What Migrent Cannot Do</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>As an introduction service, Migrent cannot:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Enforce tenancy agreements or licences between users</li>
                <li>Order refunds of rent, bonds, or other payments between users</li>
                <li>Inspect properties or verify claims about property condition</li>
                <li>Provide legal advice or representation</li>
                <li>Act as a judge or make legally binding decisions</li>
              </ul>
              <p>For tenancy-specific disputes, contact your state&apos;s relevant tribunal (e.g., NSW Civil and Administrative Tribunal - NCAT).</p>
            </div>
          </section>

          {/* Platform Fee Disputes */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Platform Fee Disputes</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>For disputes specifically about a Migrent charge (the AUD $99 host fee, or a mentor session):</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Contact us at <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a> with subject &quot;Fee Dispute&quot;</li>
                <li>Include your Stripe receipt number and a description of the issue</li>
                <li>We will review and respond within 5 business days</li>
                <li>Refunds of platform fees are at Migrent&apos;s sole discretion</li>
              </ul>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>This dispute resolution process is part of Migrent&apos;s <Link href="/terms-of-service" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Terms of Service</Link>. Migrent recommends consulting a qualified lawyer for legal disputes. Last reviewed: March 2026.</p>
          </div>

        </div>
      </LegalLayout>
    </>
  );
}
