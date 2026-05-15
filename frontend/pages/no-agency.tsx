import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";
import DisclaimerCard from "../components/legal/DisclaimerCard";

const toc = [
  { id: "facilitator", label: "Facilitator, not an agent" },
  { id: "what-we-do", label: "What MigRent does" },
  { id: "what-we-dont", label: "What MigRent does not do" },
  { id: "legal-basis", label: "Legal basis" },
  { id: "responsibility", label: "Your responsibility" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function NoAgency() {
  return (
    <PolicyLayout
      family="legal"
      eyebrow="Legal"
      title="We Are Not Your Agent"
      lede="MigRent is an online introduction service, not a real estate agent. Here is what that means for you."
      lastUpdated="March 2026"
      metaTitle="We Are Not Your Agent | MigRent AI"
      metaDescription="MigRent AI is an online introduction service, not a real estate agent. Understand our facilitator model and your responsibilities."
      toc={toc}
      disclaimer={
        <DisclaimerCard title="MigRent is a Facilitator, Not an Agent">
          <p>MigRent AI operates as an <strong>online introduction service</strong> (similar to platforms like Flatmates.com.au). We are not a real estate agent, property manager, landlord, or letting agent. We do not hold a real estate licence and are not required to under Australian law.</p>
        </DisclaimerCard>
      }
      related={[
        { href: "/terms-of-service", label: "Terms of Service", description: "The rules that apply when you use MigRent" },
        { href: "/disclaimer", label: "Platform Disclaimer", description: "Limitations of our service" },
        { href: "/rental-laws", label: "Australian Rental Laws", description: "State-by-state requirements" },
        { href: "/contact-legal", label: "Legal Contact", description: "Reach our legal team" },
      ]}
    >
      <PolicySection
        id="facilitator"
        number={1}
        title="Facilitator, Not an Agent"
        summary="We introduce people. We do not represent, negotiate for, or owe a fiduciary duty to any user."
      >
        <p>MigRent AI operates as an online introduction service. We do not act as your agent, fiduciary, or representative in any capacity. After we introduce you to another user, all subsequent decisions, negotiations, and arrangements are between you and that user directly.</p>
      </PolicySection>

      <PolicySection id="what-we-do" number={2} title="What MigRent Does">
        <ul className="list-disc list-inside space-y-1.5">
          <li>Provides an online platform where room owners can list available rooms</li>
          <li>Allows accommodation seekers to search and filter listings</li>
          <li>Uses AI matching to suggest compatible owner-seeker pairs</li>
          <li>Facilitates initial communication between users via messaging</li>
          <li>Charges flat platform fees ($99/deal for owners, $19 optional for seekers)</li>
        </ul>
      </PolicySection>

      <PolicySection id="what-we-dont" number={3} title="What MigRent Does NOT Do">
        <ul className="list-disc list-inside space-y-1.5">
          <li>Act as your agent, representative, or fiduciary in any capacity</li>
          <li>Negotiate rental terms, prices, or conditions on your behalf</li>
          <li>Inspect, verify, or certify properties</li>
          <li>Draft, execute, or enforce tenancy agreements or licences</li>
          <li>Collect, hold, or manage rent, bonds, or security deposits</li>
          <li>Manage properties or provide property management services</li>
          <li>Provide legal, financial, or tax advice</li>
          <li>Guarantee the suitability, safety, or legality of any arrangement</li>
        </ul>
      </PolicySection>

      <PolicySection id="legal-basis" number={4} title="Legal Basis">
        <p>Under the Property and Stock Agents Act 2002 (NSW) and equivalent legislation in other states, a real estate agent licence is required for persons who:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Negotiate the sale or lease of property on behalf of another person</li>
          <li>Collect rent or manage property on behalf of a landlord</li>
          <li>Act as a buyer&apos;s or tenant&apos;s agent in property transactions</li>
        </ul>
        <p>MigRent does none of the above. We are an online matching and introduction platform. Users make their own direct arrangements after being introduced through our service. No agency relationship is created between MigRent and any user.</p>
        <div className="card-subtle p-4 rounded-xl">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Comparison: Introduction Service vs Agent</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-2 font-semibold text-slate-800 dark:text-slate-200">Activity</th>
                  <th className="text-center py-2 px-2 font-semibold text-slate-800 dark:text-slate-200">Agent</th>
                  <th className="text-center py-2 px-2 font-semibold text-emerald-600 dark:text-emerald-400">MigRent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-2 px-2">Introduces parties</td>
                  <td className="py-2 px-2 text-center">Yes</td>
                  <td className="py-2 px-2 text-center text-emerald-500 font-medium">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">Negotiates terms on your behalf</td>
                  <td className="py-2 px-2 text-center">Yes</td>
                  <td className="py-2 px-2 text-center text-rose-500 font-medium">No</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">Collects rent or bonds</td>
                  <td className="py-2 px-2 text-center">Yes</td>
                  <td className="py-2 px-2 text-center text-rose-500 font-medium">No</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">Creates tenancy agreements</td>
                  <td className="py-2 px-2 text-center">Yes</td>
                  <td className="py-2 px-2 text-center text-rose-500 font-medium">No</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">Manages property</td>
                  <td className="py-2 px-2 text-center">Yes</td>
                  <td className="py-2 px-2 text-center text-rose-500 font-medium">No</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">Owes fiduciary duty</td>
                  <td className="py-2 px-2 text-center">Yes</td>
                  <td className="py-2 px-2 text-center text-rose-500 font-medium">No</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">Requires licence</td>
                  <td className="py-2 px-2 text-center">Yes</td>
                  <td className="py-2 px-2 text-center text-rose-500 font-medium">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </PolicySection>

      <PolicySection id="responsibility" number={5} title="Your Responsibility">
        <p>Because MigRent is not your agent, you are fully responsible for:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Negotiating your own rental terms directly with the other party</li>
          <li>Drafting or obtaining your own tenancy agreement or licence</li>
          <li>Conducting your own property inspections and due diligence</li>
          <li>Arranging bond payments through the appropriate state authority</li>
          <li>Ensuring compliance with all applicable rental and tenancy laws</li>
        </ul>
        <p>See our <Link href="/rental-laws" className={accent}>Australian Rental Laws Guide</Link> for an overview of state-by-state requirements.</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">This page is for informational purposes only and does not constitute legal advice. MigRent recommends consulting a qualified Australian lawyer regarding your obligations. Last reviewed: March 2026.</p>
      </PolicySection>
    </PolicyLayout>
  );
}
