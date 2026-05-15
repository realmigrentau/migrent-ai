import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";
import Callout from "../components/legal/Callout";

const toc = [
  { id: "commitment", label: "Our commitment" },
  { id: "protected-attributes", label: "Protected attributes" },
  { id: "prohibited-conduct", label: "Prohibited conduct" },
  { id: "exceptions", label: "Lawful exceptions" },
  { id: "reporting", label: "Reporting discrimination" },
  { id: "consequences", label: "Consequences" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

const protectedAttributes = [
  "Race, colour, or ethnic origin",
  "National origin or nationality",
  "Sex or gender identity",
  "Sexual orientation",
  "Marital or relationship status",
  "Pregnancy or breastfeeding",
  "Age",
  "Disability (physical or mental)",
  "Religion or religious belief",
  "Political opinion",
  "Social origin",
  "Visa or immigration status",
];

export default function AntiDiscrimination() {
  return (
    <PolicyLayout
      family="trust"
      eyebrow="Trust and safety"
      title="Fair Housing Policy"
      lede="MigRent is committed to a platform free from discrimination. As a service that connects migrants with accommodation, we take anti-discrimination obligations seriously."
      lastUpdated="March 2026"
      metaTitle="Fair Housing Policy | MigRent AI"
      metaDescription="MigRent AI Fair Housing Policy - our commitment to anti-discrimination and equal access to accommodation."
      toc={toc}
      related={[
        { href: "/safety-reporting", label: "Safety and Reporting", description: "How to report incidents" },
        { href: "/rules-community-guidelines", label: "Community Guidelines", description: "Standards for all users" },
        { href: "/support-disputes", label: "Dispute Resolution", description: "Resolving issues between users" },
        { href: "/terms-of-service", label: "Terms of Service", description: "Full platform terms" },
      ]}
    >
      <PolicySection id="commitment" title="Our Commitment">
        <p>MigRent AI is committed to providing a platform free from discrimination. As a service that connects migrants with accommodation, we take anti-discrimination obligations seriously. All users must comply with Australian anti-discrimination laws.</p>
      </PolicySection>

      <PolicySection
        id="protected-attributes"
        title="Protected Attributes Under Australian Law"
        summary="Under federal and state anti-discrimination legislation, it is unlawful to discriminate in accommodation based on these attributes."
      >
        <p>Under the Racial Discrimination Act 1975, Sex Discrimination Act 1984, Disability Discrimination Act 1992, Age Discrimination Act 2004, and state-level anti-discrimination legislation, it is unlawful to discriminate in accommodation based on:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 not-prose">
          {protectedAttributes.map((attr) => (
            <div key={attr} className="card-subtle p-3 rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
              </svg>
              <span className="text-sm">{attr}</span>
            </div>
          ))}
        </div>
      </PolicySection>

      <PolicySection id="prohibited-conduct" title="Prohibited Conduct on MigRent">
        <p>The following are strictly prohibited on MigRent:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Refusing to list or offer accommodation</strong> to a person based on a protected attribute</li>
          <li><strong>Listing discriminatory preferences</strong> in property descriptions (e.g., &quot;no students from [country]&quot;, &quot;females only&quot; without lawful exemption)</li>
          <li><strong>Discriminatory messaging</strong> - refusing to respond or being hostile based on a user&apos;s profile characteristics</li>
          <li><strong>Different terms or conditions</strong> based on protected attributes (e.g., charging more rent based on nationality)</li>
          <li><strong>Harassment or vilification</strong> based on any protected attribute</li>
        </ul>
      </PolicySection>

      <PolicySection id="exceptions" title="Lawful Exceptions">
        <p>Australian anti-discrimination law does recognise some limited exceptions in shared accommodation settings:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Shared living spaces:</strong> If you are sharing your own home and will live with the other person, some states allow gender preferences for housemates</li>
          <li><strong>Strata by-laws:</strong> Some residential buildings have rules about maximum occupancy or use</li>
          <li><strong>Religious accommodation:</strong> Limited exemptions may exist for accommodation operated by religious bodies</li>
        </ul>
        <Callout variant="warning" title="Exceptions are narrow">
          These exceptions are narrow and do not permit blanket discrimination. If you are unsure whether an exception applies, seek legal advice before posting a restricted listing.
        </Callout>
      </PolicySection>

      <PolicySection id="reporting" title="Reporting Discrimination">
        <Callout variant="critical" title="Report discrimination">
          <p>If you experience discrimination on MigRent, you have multiple channels:</p>
          <ol className="list-decimal list-inside space-y-1.5 mt-2">
            <li><strong>Report to MigRent:</strong> Email <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a> with subject &quot;Discrimination Report.&quot; Include screenshots and details. We will investigate within 48 hours.</li>
            <li><strong>Australian Human Rights Commission:</strong> Lodge a formal complaint at <a href="https://humanrights.gov.au/complaints" target="_blank" rel="noopener noreferrer" className={accent}>humanrights.gov.au</a></li>
            <li><strong>State anti-discrimination body:</strong> Each state has its own body (e.g., Anti-Discrimination NSW, Victorian Equal Opportunity and Human Rights Commission)</li>
          </ol>
        </Callout>
      </PolicySection>

      <PolicySection id="consequences" title="Consequences">
        <p>Users found to have engaged in discriminatory conduct on MigRent may face:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Immediate removal of discriminatory listing content</li>
          <li>Warning issued to the user&apos;s account</li>
          <li>Temporary or permanent account suspension</li>
          <li>Reporting to relevant anti-discrimination authorities</li>
        </ul>
        <p>MigRent has zero tolerance for discrimination, particularly against migrants and people from diverse backgrounds.</p>
        <Callout variant="legal" title="Informational only">
          This policy is for informational purposes. For specific legal advice regarding discrimination, contact the Australian Human Rights Commission or a qualified lawyer.
        </Callout>
      </PolicySection>
    </PolicyLayout>
  );
}
