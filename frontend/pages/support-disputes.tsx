import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";
import Callout from "../components/legal/Callout";

const toc = [
  { id: "approach", label: "Our approach" },
  { id: "process", label: "3-step resolution process" },
  { id: "can-do", label: "What MigRent can do" },
  { id: "cannot-do", label: "What MigRent cannot do" },
  { id: "fee-disputes", label: "Platform fee disputes" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function SupportDisputes() {
  return (
    <PolicyLayout
      family="trust"
      eyebrow="Trust and safety"
      title="Dispute Resolution"
      lede="A clear, three-step path for sorting out issues between users - direct resolution first, then MigRent mediation, then binding arbitration if needed."
      lastUpdated="March 2026"
      metaTitle="Dispute Resolution | MigRent AI"
      metaDescription="MigRent AI dispute resolution process - how we handle complaints and disputes between users."
      toc={toc}
      related={[
        { href: "/safety-reporting", label: "Safety and Reporting", description: "Report unsafe behaviour" },
        { href: "/rules-community-guidelines", label: "Community Guidelines", description: "The standards we enforce" },
        { href: "/terms-of-service", label: "Terms of Service", description: "Full platform terms" },
        { href: "/rental-laws", label: "Rental Laws Guide", description: "State tenancy authorities" },
      ]}
    >
      <PolicySection id="approach" title="Our Approach">
        <p>MigRent is an introduction service and is not a party to any arrangement between users. However, we want all users to have a positive experience. This page outlines the dispute resolution process for issues arising from or related to the MigRent platform.</p>
        <p>For disputes about tenancy arrangements (rent, bonds, property condition), please contact your state&apos;s Fair Trading or Residential Tenancies authority. See our <Link href="/rental-laws" className={accent}>Rental Laws Guide</Link>.</p>
      </PolicySection>

      <PolicySection
        id="process"
        title="3-Step Dispute Resolution Process"
        summary="Start with direct conversation, escalate to MigRent mediation, then arbitration as a last resort."
      >
        <div className="space-y-3">
          <div className="card-subtle p-4 rounded-xl border-l-2 border-l-emerald-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">1</span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Direct resolution (0-14 days)</h3>
            </div>
            <p>Attempt to resolve the issue directly with the other user. Use MigRent&apos;s messaging system to communicate clearly and document your conversations. Many disputes can be resolved through good-faith discussion.</p>
          </div>

          <div className="card-subtle p-4 rounded-xl border-l-2 border-l-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">MigRent mediation (14-30 days)</h3>
            </div>
            <p>If direct resolution fails, contact MigRent at <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a> with the subject &quot;Dispute&quot;. Include:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Your account email and the other user&apos;s profile name</li>
              <li>A clear description of the issue</li>
              <li>Screenshots or evidence (if applicable)</li>
              <li>What resolution you are seeking</li>
            </ul>
            <p className="mt-2">MigRent will review the complaint within 5 business days and attempt informal mediation. We may contact both parties to understand the situation. Note: MigRent&apos;s mediation is voluntary and non-binding.</p>
          </div>

          <div className="card-subtle p-4 rounded-xl border-l-2 border-l-violet-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400">3</span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Binding arbitration (30+ days)</h3>
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
      </PolicySection>

      <PolicySection id="can-do" title="What MigRent Can Do">
        <p>As part of our mediation process, MigRent may:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Review messages and activity related to the dispute</li>
          <li>Contact both parties for their side of the story</li>
          <li>Issue warnings or suspend accounts that violate our Terms</li>
          <li>Remove listings or content that violate our policies</li>
          <li>Provide platform usage data relevant to the dispute</li>
        </ul>
      </PolicySection>

      <PolicySection id="cannot-do" title="What MigRent Cannot Do">
        <p>As an introduction service, MigRent cannot:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Enforce tenancy agreements or licences between users</li>
          <li>Order refunds of rent, bonds, or other payments between users</li>
          <li>Inspect properties or verify claims about property condition</li>
          <li>Provide legal advice or representation</li>
          <li>Act as a judge or make legally binding decisions</li>
        </ul>
        <Callout variant="info" title="For tenancy-specific disputes">
          Contact your state&apos;s relevant tribunal (e.g., NSW Civil and Administrative Tribunal - NCAT). See our <Link href="/rental-laws" className={accent}>Rental Laws Guide</Link> for state-by-state contacts.
        </Callout>
      </PolicySection>

      <PolicySection id="fee-disputes" title="Platform Fee Disputes">
        <p>For disputes specifically about MigRent platform fees ($99 owner fee or $19 seeker fee):</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Contact us at <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a> with subject &quot;Fee Dispute&quot;</li>
          <li>Include your Stripe receipt number and a description of the issue</li>
          <li>We will review and respond within 5 business days</li>
          <li>Refunds of platform fees are at MigRent&apos;s sole discretion</li>
        </ul>
        <Callout variant="legal" title="Part of our Terms">
          This dispute resolution process is part of MigRent&apos;s <Link href="/terms-of-service" className={accent}>Terms of Service</Link>. MigRent recommends consulting a qualified lawyer for legal disputes.
        </Callout>
      </PolicySection>
    </PolicyLayout>
  );
}
