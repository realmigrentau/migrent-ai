import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";
import Callout from "../components/legal/Callout";

const toc = [
  { id: "approach", label: "Our approach to safety" },
  { id: "verification-levels", label: "Verification levels" },
  { id: "trust-scores", label: "AI match and trust scores" },
  { id: "superhost", label: "Superhost criteria" },
  { id: "seeker-tips", label: "Safety tips for seekers" },
  { id: "owner-tips", label: "Safety tips for owners" },
  { id: "reporting", label: "Reporting and disputes" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function SafetyVerification() {
  return (
    <PolicyLayout
      family="trust"
      eyebrow="Trust and safety"
      title="Safety and Verification"
      lede="How MigRent helps you make safer decisions - verification tiers, AI match scores, Superhost standards, and practical tips for owners and seekers."
      lastUpdated="March 2026"
      metaTitle="Safety and Verification | MigRent AI"
      metaDescription="How MigRent AI keeps you safe - ID verification (VEVO), trust scores, Superhost criteria, and safety guidelines."
      toc={toc}
      related={[
        { href: "/safety-reporting", label: "Safety and Reporting", description: "How to report unsafe behaviour or scams" },
        { href: "/rules-community-guidelines", label: "Community Guidelines", description: "Standards for owners and seekers" },
        { href: "/anti-discrimination", label: "Fair Housing Policy", description: "Our anti-discrimination commitments" },
        { href: "/support-disputes", label: "Dispute Resolution", description: "What to do if something goes wrong" },
      ]}
    >
      <Callout variant="critical" title="In an emergency, call 000">
        <p>If you feel unsafe or are in immediate danger, contact local emergency services on 000 (Police, Fire, Ambulance). MigRent is not an emergency service. For confidential support, Lifeline is available 24/7 on 13 11 14, and 1800RESPECT (1800 737 732) supports anyone affected by family or sexual violence.</p>
      </Callout>

      <PolicySection id="approach" title="Our Approach to Safety">
        <p>MigRent AI employs multiple layers of trust and verification to create a safer room-finding experience. While no platform can guarantee safety, we work hard to provide the tools and information you need to make informed decisions.</p>
      </PolicySection>

      <PolicySection
        id="verification-levels"
        title="Verification Levels"
        summary="Three tiers of verification, from email confirmation to optional ID checks."
      >
        <div className="grid gap-4">
          <div className="card-subtle p-5 rounded-xl border-l-2 border-l-slate-300 dark:border-l-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold">1</span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Email Verified</h3>
            </div>
            <p>All users must verify their email address to create an account. This is the baseline verification level.</p>
          </div>
          <div className="card-subtle p-5 rounded-xl border-l-2 border-l-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold">2</span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Profile Complete</h3>
            </div>
            <p>Users who complete their full profile (name, photo, bio, preferences) receive a completeness badge that signals seriousness to other users.</p>
          </div>
          <div className="card-subtle p-5 rounded-xl border-l-2 border-l-emerald-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold">3</span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">ID Verified</h3>
            </div>
            <p>Optional identity verification through third-party providers. We may use services connected to VEVO (Visa Entitlement Verification Online) for visa status checks where applicable. Only verification status (pass/fail) is stored - not raw ID documents.</p>
          </div>
        </div>
      </PolicySection>

      <PolicySection id="trust-scores" title="AI Match and Trust Scores">
        <p>MigRent uses AI-assisted matching to help connect seekers with suitable rooms. Match scores consider factors such as:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Location preferences and proximity</li>
          <li>Budget range compatibility</li>
          <li>Lifestyle preferences (smoking, pets, schedule)</li>
          <li>Profile completeness and verification status</li>
          <li>Historical platform behaviour and reviews</li>
        </ul>
        <Callout variant="warning" title="Informational only">
          Match scores and verification badges are informational tools to assist your decision-making. They do not constitute guarantees of safety, suitability, or legality.
        </Callout>
      </PolicySection>

      <PolicySection id="superhost" title="Superhost Criteria">
        <p>Owners can earn Superhost status by demonstrating consistent quality and reliability. Criteria include:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Minimum 3 completed successful matches through the platform</li>
          <li>Profile fully verified (email + ID)</li>
          <li>No active reports or policy violations</li>
          <li>Responsive communication (average reply within 24 hours)</li>
          <li>Accurate listing information confirmed by seekers</li>
        </ul>
        <p>Superhost status is reviewed periodically and can be revoked if criteria are no longer met.</p>
      </PolicySection>

      <PolicySection id="seeker-tips" title="Safety Tips for Seekers">
        <Callout variant="tip" title="Before you commit or pay">
          <ul className="list-disc list-inside space-y-1.5">
            <li>Always inspect the property in person or via video call before committing or paying any money</li>
            <li>Never pay bond or rent before seeing the property and meeting the owner</li>
            <li>Use written agreements or clear messages confirming all terms</li>
            <li>Ask about bills, bond, notice periods, and house rules upfront</li>
            <li>Be cautious of deals that seem too good to be true</li>
            <li>Keep all communication on the MigRent platform where possible</li>
            <li>Report suspicious behaviour immediately using the Report button</li>
          </ul>
        </Callout>
      </PolicySection>

      <PolicySection id="owner-tips" title="Safety Tips for Owners">
        <Callout variant="tip" title="Before sharing your address">
          <ul className="list-disc list-inside space-y-1.5">
            <li>Meet seekers in a safe, public environment first</li>
            <li>Verify the seeker&apos;s identity before sharing your address</li>
            <li>Consider requesting references where appropriate</li>
            <li>Keep written records of all arrangements and agreements</li>
            <li>Set clear house rules and expectations before move-in</li>
            <li>Use the platform messaging for a clear communication trail</li>
          </ul>
        </Callout>
      </PolicySection>

      <PolicySection id="reporting" title="Reporting and Disputes">
        <p>If you encounter unsafe, misleading, or suspicious behaviour:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Report button</strong> - Available on every listing and user profile</li>
          <li><strong>Email</strong> - Contact <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a></li>
          <li><strong>Emergency</strong> - If you feel unsafe, contact local emergency services (000) immediately</li>
        </ul>
        <p>We take all reports seriously and will investigate promptly. Users who are found to violate our guidelines may have their accounts suspended or terminated. For full reporting details, see our <Link href="/safety-reporting" className={accent}>Safety and Reporting</Link> page.</p>
        <Callout variant="legal" title="Disclaimer">
          MigRent does not guarantee the safety, suitability, or legality of any person or property. Users must make their own independent checks and decisions.
        </Callout>
      </PolicySection>
    </PolicyLayout>
  );
}
