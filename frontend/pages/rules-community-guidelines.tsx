import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";
import Callout from "../components/legal/Callout";

const toc = [
  { id: "standards", label: "Our community standards" },
  { id: "general-rules", label: "General rules (all users)" },
  { id: "seeker-rules", label: "Rules for seekers" },
  { id: "owner-rules", label: "Rules for owners" },
  { id: "listing-standards", label: "Listing standards" },
  { id: "dispute-resolution", label: "Dispute resolution" },
  { id: "regulatory", label: "Regulatory compliance" },
  { id: "enforcement", label: "Enforcement" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function RulesCommunityGuidelines() {
  return (
    <PolicyLayout
      family="trust"
      eyebrow="Trust and safety"
      title="Community Guidelines"
      lede="MigRent is built on trust, respect, and transparency. These guidelines apply to all users - owners and seekers alike."
      lastUpdated="March 2026"
      metaTitle="Community Guidelines | MigRent AI"
      metaDescription="MigRent AI community rules - listing standards, guest expectations, dispute resolution, and platform conduct."
      toc={toc}
      related={[
        { href: "/safety-verification", label: "Safety and Verification", description: "Verification tiers and trust tools" },
        { href: "/safety-reporting", label: "Safety and Reporting", description: "How to report violations" },
        { href: "/anti-discrimination", label: "Fair Housing Policy", description: "Anti-discrimination commitments" },
        { href: "/support-disputes", label: "Dispute Resolution", description: "What to do if something goes wrong" },
      ]}
    >
      <PolicySection id="standards" title="Our Community Standards">
        <p>MigRent AI is built on trust, respect, and transparency. These guidelines apply to all users - both owners and seekers. Violations may result in content removal, account suspension, or termination.</p>
      </PolicySection>

      <PolicySection id="general-rules" title="General Rules (All Users)">
        <ul className="list-disc list-inside space-y-1.5">
          <li>Be truthful and accurate in your profile and all communications</li>
          <li>Treat all users with respect regardless of background, nationality, religion, or gender</li>
          <li>Do not engage in discrimination, harassment, threats, or bullying</li>
          <li>Do not post or share illegal, offensive, or inappropriate content</li>
          <li>Do not use the platform for scams, fraud, or deceptive practices</li>
          <li>Respect the privacy of other users - do not share personal information without consent</li>
          <li>Do not create fake profiles or impersonate others</li>
          <li>Report any suspicious activity promptly</li>
        </ul>
      </PolicySection>

      <PolicySection
        id="seeker-rules"
        title="Rules for Seekers"
        summary="What we expect from people looking for a room."
      >
        <ul className="list-disc list-inside space-y-1.5">
          <li>Be truthful and accurate in your profile and during any verification process</li>
          <li>Respect house rules, neighbours, and applicable tenancy or lodging laws</li>
          <li>Do not ghost owners after agreeing to an arrangement</li>
          <li>Understand that MigRent may present an optional one-time AUD $19 platform fee when a successful match occurs</li>
          <li>Do not encourage or agree to arrangements where an owner intends to circumvent platform fees</li>
          <li>Leave the property in the condition you found it</li>
          <li>Communicate openly about any issues during your stay</li>
        </ul>
      </PolicySection>

      <PolicySection
        id="owner-rules"
        title="Rules for Owners"
        summary="What we expect from people listing a room."
      >
        <ul className="list-disc list-inside space-y-1.5">
          <li>Provide accurate and up-to-date listing information (location, price, photos, conditions)</li>
          <li>Do not post misleading photos or descriptions</li>
          <li>Comply with relevant tenancy or lodging laws and anti-discrimination rules</li>
          <li>Do not demand unlawful payments (e.g. excessive bond or hidden charges)</li>
          <li>Agree to pay MigRent&apos;s one-time AUD $99 platform fee on each successful match</li>
          <li>Do not use MigRent to find seekers and then move the arrangement off-platform to avoid fees</li>
          <li>Provide a safe, clean, and habitable living environment</li>
          <li>Respond to enquiries in a timely manner</li>
        </ul>
      </PolicySection>

      <PolicySection id="listing-standards" title="Listing Standards">
        <p>All listings must meet the following minimum standards:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Accuracy</strong> - Photos must be current and representative of the actual space</li>
          <li><strong>Pricing</strong> - Weekly rent must be clearly stated with no hidden fees</li>
          <li><strong>Location</strong> - Suburb and general area must be accurate</li>
          <li><strong>Availability</strong> - Dates and availability must be kept up to date</li>
          <li><strong>Conditions</strong> - Bond, bills, house rules, and notice periods must be disclosed</li>
        </ul>
        <p>Listings that do not meet these standards may be flagged, hidden, or removed.</p>
      </PolicySection>

      <PolicySection id="dispute-resolution" title="Dispute Resolution">
        <p>MigRent encourages users to resolve disputes directly and amicably. If you cannot reach a resolution:</p>
        <ol className="list-decimal list-inside space-y-1.5">
          <li>Attempt direct communication with the other party</li>
          <li>Document all interactions and agreements</li>
          <li>Contact MigRent at <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a> for assistance</li>
          <li>For serious disputes, seek independent legal advice or contact your state&apos;s tenancy authority</li>
        </ol>
        <p>MigRent may mediate informally but is not a dispute resolution service and cannot enforce outcomes between users. See <Link href="/support-disputes" className={accent}>Dispute Resolution</Link> for the full process.</p>
      </PolicySection>

      <PolicySection id="regulatory" title="Regulatory Compliance">
        <p>Owners are responsible for complying with any local regulations that may apply, including:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Short-term rental accommodation (STRA) registration in NSW</li>
          <li>Council regulations and strata by-laws</li>
          <li>Fire safety and habitability standards</li>
          <li>Insurance and liability requirements</li>
        </ul>
        <p>MigRent AI does not provide legal advice and is not responsible for users&apos; regulatory compliance.</p>
      </PolicySection>

      <PolicySection id="enforcement" title="Enforcement">
        <p>MigRent may take the following actions for guideline violations:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Warning</strong> - First-time or minor violations</li>
          <li><strong>Content removal</strong> - Listings or messages that violate standards</li>
          <li><strong>Temporary suspension</strong> - Repeated or moderate violations</li>
          <li><strong>Permanent ban</strong> - Severe violations, fraud, or illegal activity</li>
        </ul>
        <Callout variant="info" title="Appeals">
          If you believe an enforcement action was made in error, reply to the notification email or contact <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a> within 14 days and we will review the decision.
        </Callout>
      </PolicySection>
    </PolicyLayout>
  );
}
