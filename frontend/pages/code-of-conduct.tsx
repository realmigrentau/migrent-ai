import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";
import Callout from "../components/legal/Callout";
import DisclaimerCard from "../components/legal/DisclaimerCard";

const toc = [
  { id: "about", label: "About the NSW STRA Code" },
  { id: "host", label: "Host (owner) obligations" },
  { id: "guest", label: "Guest (seeker) obligations" },
  { id: "platform", label: "Booking platform obligations" },
  { id: "penalties", label: "Penalties for non-compliance" },
  { id: "other-states", label: "Other states" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function CodeOfConduct() {
  return (
    <PolicyLayout
      family="legal"
      eyebrow="Legal"
      title="STRA Code of Conduct"
      lede="A plain-English summary of the NSW Short-Term Rental Accommodation Code of Conduct, and how it applies to hosts, guests, and platforms like MigRent."
      lastUpdated="March 2026"
      metaTitle="NSW STRA Code of Conduct | MigRent AI"
      metaDescription="Summary of the NSW Short-Term Rental Accommodation Code of Conduct and how it applies to MigRent users."
      toc={toc}
      disclaimer={
        <DisclaimerCard title="This is general information, not legal advice">
          <p>
            This page is a summary of the NSW STRA Code of Conduct for informational purposes only and does not constitute legal advice. Laws and regulations may change. Always check the official state tenancy authority (NSW Fair Trading and the NSW Government STRA pages) before acting.
          </p>
        </DisclaimerCard>
      }
      related={[
        { href: "/rental-laws", label: "Australian Rental Laws", description: "State-by-state guide to rental rules" },
        { href: "/rules-community-guidelines", label: "Community Guidelines", description: "How we expect MigRent users to behave" },
        { href: "/safety-reporting", label: "Report a violation", description: "Flag a listing that breaches the code" },
        { href: "/terms-of-service", label: "Terms of Service", description: "Your responsibilities on the platform" },
      ]}
    >
      <PolicySection
        id="about"
        title="About the NSW STRA Code"
        summary="A mandatory code under NSW Fair Trading Regulation that applies to hosts, guests, and booking platforms."
      >
        <p>New South Wales has a mandatory Code of Conduct for Short-Term Rental Accommodation (STRA) under the Fair Trading Regulation. This code applies to hosts, guests, and booking platforms operating in NSW.</p>
        <p>This page is a <strong>summary only</strong>. For the full official code, visit the <a href="https://www.nsw.gov.au/housing-and-construction/short-term-rental-accommodation" target="_blank" rel="noopener noreferrer" className={accent}>NSW Government STRA page</a>.</p>
        <p>MigRent is an introduction service. While some listings on MigRent may fall under STRA regulations, we inform all users of their obligations under the code.</p>
      </PolicySection>

      <PolicySection
        id="host"
        title="Host (owner) obligations"
        summary="Register, follow fire-safety rules, cap guests, notify neighbours, and respond to complaints."
      >
        <p>If your listing qualifies as STRA in NSW, as a host you must:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Register on the NSW STRA Register</strong> before listing your property</li>
          <li><strong>Fire safety:</strong> Ensure working smoke alarms on every level, provide a fire extinguisher, and display evacuation information</li>
          <li><strong>Maximum guests:</strong> Do not exceed the number of guests specified in your registration</li>
          <li><strong>Neighbour notification:</strong> Notify immediate neighbours that the property is used for STRA and provide a contact number for complaints</li>
          <li><strong>House rules:</strong> Provide written house rules to guests covering noise, parking, waste disposal, and use of common areas</li>
          <li><strong>Complaints handling:</strong> Respond to noise or nuisance complaints within a reasonable time</li>
          <li><strong>Day limits:</strong> 180 days per year maximum in Greater Sydney (when host is not present). Unlimited if host is present.</li>
          <li><strong>Insurance:</strong> Consider appropriate insurance cover for STRA activity</li>
        </ul>
        <Callout variant="warning" title="Two strikes rule">
          Hosts (and guests) can be excluded from the STRA Register for serious or repeated breaches. Exclusion prevents you from listing or booking STRA across NSW.
        </Callout>
      </PolicySection>

      <PolicySection
        id="guest"
        title="Guest (seeker) obligations"
        summary="Follow house rules, respect quiet hours, stay within guest limits, and look after the property."
      >
        <p>As a guest staying in STRA in NSW, you must:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Follow house rules:</strong> Comply with all house rules provided by the host</li>
          <li><strong>Noise:</strong> Avoid unreasonable noise, especially between 10pm and 8am</li>
          <li><strong>Guest numbers:</strong> Do not exceed the maximum number of guests allowed</li>
          <li><strong>Property care:</strong> Treat the property with reasonable care and report any damage</li>
          <li><strong>Waste:</strong> Dispose of waste properly according to local council requirements</li>
          <li><strong>Neighbours:</strong> Respect the neighbourhood and the quiet enjoyment of neighbours</li>
        </ul>
      </PolicySection>

      <PolicySection
        id="platform"
        title="Booking platform obligations"
        summary="Platforms must verify registration numbers, accept reports, and cooperate with NSW Fair Trading."
      >
        <p>Under the NSW STRA framework, booking platforms must:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Verify that hosts display a valid STRA registration number (where applicable)</li>
          <li>Provide mechanisms for reporting code violations</li>
          <li>Cooperate with NSW Fair Trading investigations</li>
          <li>Remove listings upon government direction for serious or repeated violations</li>
        </ul>
        <p>MigRent complies with these obligations. If you believe a listing violates the STRA Code of Conduct, please <Link href="/safety-reporting" className={accent}>report it here</Link>.</p>
      </PolicySection>

      <PolicySection
        id="penalties"
        title="Penalties for non-compliance"
        summary="Penalty notices, exclusion from the STRA Register, and on MigRent, listing removal or account suspension."
      >
        <p>Failure to comply with the NSW STRA Code of Conduct may result in:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Penalty notices from NSW Fair Trading</li>
          <li>Exclusion from the STRA Register (which prevents listing)</li>
          <li>On MigRent: listing removal and account suspension</li>
        </ul>
        <Callout variant="critical" title="Serious breaches">
          Repeated or serious breaches (such as exceeding guest limits, fire-safety failures, or ignoring noise complaints) can lead to immediate removal from the STRA Register and corresponding action on MigRent.
        </Callout>
      </PolicySection>

      <PolicySection
        id="other-states"
        title="Other states"
        summary="NSW has the most developed STRA rules; other states rely on a mix of state and council regulation."
      >
        <p>This page focuses on NSW as it has the most comprehensive STRA framework. Other states have varying levels of STRA regulation. See our <Link href="/rental-laws" className={accent}>Australian Rental Laws Guide</Link> for an overview of each state.</p>
        <p>Regardless of your state, MigRent expects all users to comply with local laws and our <Link href="/rules-community-guidelines" className={accent}>Community Guidelines</Link>.</p>
      </PolicySection>
    </PolicyLayout>
  );
}
