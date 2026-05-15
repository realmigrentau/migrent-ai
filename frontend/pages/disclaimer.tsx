import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";
import Callout from "../components/legal/Callout";
import DisclaimerCard from "../components/legal/DisclaimerCard";

const toc = [
  { id: "property-condition", label: "Property condition" },
  { id: "user-interactions", label: "User interactions" },
  { id: "financial", label: "Financial disclaimer" },
  { id: "no-legal-advice", label: "No legal advice" },
  { id: "liability", label: "Limitation of liability" },
  { id: "responsibilities", label: "Your responsibilities" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function Disclaimer() {
  return (
    <PolicyLayout
      family="legal"
      eyebrow="Legal"
      title="Platform Disclaimer"
      lede="Understand the limitations of our service and your responsibilities as a user of MigRent."
      lastUpdated="March 2026"
      metaTitle="Platform Disclaimer | MigRent AI"
      metaDescription="MigRent AI Platform Disclaimer - understand the limitations of our service and your responsibilities as a user."
      toc={toc}
      disclaimer={
        <DisclaimerCard title="Important Notice">
          <p>MigRent AI is an <strong>online introduction service only</strong>. We connect room owners with accommodation seekers. We do NOT:</p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Guarantee the condition, safety, legality, or suitability of any property</li>
            <li>Verify the accuracy of any listing, photo, or description</li>
            <li>Guarantee the identity, background, or intentions of any user</li>
            <li>Act as a real estate agent, property manager, or landlord</li>
            <li>Collect rent, bonds, or deposits on behalf of any party</li>
            <li>Create, manage, or enforce tenancy agreements</li>
          </ul>
        </DisclaimerCard>
      }
      related={[
        { href: "/terms-of-service", label: "Terms of Service", description: "The rules that apply when you use MigRent" },
        { href: "/no-agency", label: "No Agency Disclosure", description: "Why we are not your agent" },
        { href: "/privacy-policy", label: "Privacy Policy", description: "How we handle your data" },
        { href: "/contact-legal", label: "Legal Contact", description: "Reach our legal team" },
      ]}
    >
      <PolicySection
        id="property-condition"
        number={1}
        title="Property Condition - As Is"
        summary="Always inspect the property in person before sending money or committing."
      >
        <p>All properties listed on MigRent are presented on an &quot;as is&quot; basis. MigRent does not inspect, verify, or warrant the condition of any property. This includes but is not limited to:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Structural integrity and building compliance</li>
          <li>Cleanliness, furnishings, and amenities</li>
          <li>Safety features (smoke alarms, fire exits, locks)</li>
          <li>Pest infestations or environmental hazards</li>
          <li>Compliance with local building and zoning codes</li>
          <li>Accuracy of listed room dimensions, photos, or descriptions</li>
        </ul>
        <Callout variant="critical" title="Inspect before you commit">
          You must inspect any property personally before entering into any arrangement. Never send money without first viewing the property in person.
        </Callout>
      </PolicySection>

      <PolicySection id="user-interactions" number={2} title="User Interactions">
        <p>MigRent is not responsible for:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Scams, fraud, or misrepresentation by any user</li>
          <li>Disputes between owners and seekers</li>
          <li>Injuries, property damage, or loss arising from any arrangement</li>
          <li>Harassment, discrimination, or illegal behaviour by users</li>
          <li>Breach of tenancy agreements or rental laws by any user</li>
        </ul>
        <p>While we provide verification tools and match scores to assist your decision-making, these are <strong>informational aids only</strong> and do not constitute guarantees of any kind.</p>
      </PolicySection>

      <PolicySection id="financial" number={3} title="Financial Disclaimer">
        <p>MigRent charges flat platform fees only ($99 per deal for owners, $19 optional for seekers). We do not:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Collect, hold, or manage rent payments</li>
          <li>Collect, hold, or manage bonds or security deposits</li>
          <li>Take a percentage of any rent or deal amount</li>
          <li>Provide financial advice regarding rental arrangements</li>
          <li>Guarantee the financial reliability of any user</li>
        </ul>
        <p>All financial arrangements between owners and seekers are entirely their own responsibility.</p>
      </PolicySection>

      <PolicySection id="no-legal-advice" number={4} title="No Legal Advice">
        <p>Information provided on MigRent, including our <Link href="/rental-laws" className={accent}>rental laws guide</Link> and <Link href="/code-of-conduct" className={accent}>STRA code of conduct</Link>, is for general informational purposes only. It does not constitute legal advice. You should seek independent legal advice for your specific circumstances.</p>
      </PolicySection>

      <PolicySection id="liability" number={5} title="Limitation of Liability">
        <p>To the maximum extent permitted by Australian law:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>MigRent excludes all liability for indirect, incidental, special, consequential, or punitive damages</li>
          <li>MigRent&apos;s total aggregate liability shall not exceed the platform fees you have paid in the preceding 12 months</li>
          <li>Users indemnify MigRent against all claims arising from their use of the platform or any arrangement made through it</li>
        </ul>
        <p>Nothing in this disclaimer excludes rights that cannot be excluded under Australian Consumer Law.</p>
      </PolicySection>

      <PolicySection id="responsibilities" number={6} title="Your Responsibilities">
        <p>As a user of MigRent, you are responsible for:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Conducting your own due diligence on properties and users</li>
          <li>Personally inspecting properties before committing</li>
          <li>Creating your own tenancy agreements and collecting your own bonds</li>
          <li>Complying with all applicable laws, including rental laws and anti-discrimination laws</li>
          <li>Reporting suspicious activity, scams, or unsafe listings to MigRent</li>
        </ul>
        <p className="text-xs text-slate-400 dark:text-slate-500">This disclaimer is part of MigRent&apos;s <Link href="/terms-of-service" className={accent}>Terms of Service</Link>. For full legal terms, please refer to our Terms of Service. MigRent recommends consulting a qualified Australian lawyer for specific legal advice. Last reviewed: March 2026.</p>
      </PolicySection>
    </PolicyLayout>
  );
}
