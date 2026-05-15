import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";
import Callout from "../components/legal/Callout";
import DisclaimerCard from "../components/legal/DisclaimerCard";

const toc = [
  { id: "about", label: "About this guide" },
  { id: "overview", label: "State-by-state overview" },
  { id: "nsw", label: "New South Wales (NSW)" },
  { id: "vic", label: "Victoria (VIC)" },
  { id: "qld", label: "Queensland (QLD)" },
  { id: "wa", label: "Western Australia (WA)" },
  { id: "sa", label: "South Australia (SA)" },
  { id: "tas", label: "Tasmania (TAS)" },
  { id: "act", label: "Australian Capital Territory (ACT)" },
  { id: "nt", label: "Northern Territory (NT)" },
  { id: "key-concepts", label: "Key concepts for migrants" },
  { id: "migrent-role", label: "MigRent's role" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function RentalLaws() {
  return (
    <PolicyLayout
      family="legal"
      eyebrow="Legal"
      title="Australian Rental Laws"
      lede="A plain-English, state-by-state overview of rental and short-term rental accommodation rules across Australia. Use this as a starting point, not a substitute for advice from the official tenancy authority in your state."
      lastUpdated="March 2026"
      metaTitle="Australian Rental Laws Guide | MigRent AI"
      metaDescription="State-by-state guide to Australian rental laws, bond rules, and short-term rental accommodation (STRA) regulations."
      toc={toc}
      disclaimer={
        <DisclaimerCard title="This is general information, not legal advice">
          <p>
            The information on this page is provided for general guidance only and does not constitute legal advice. Rental and STRA laws change frequently and vary by state, territory, and local council. Always check the official state tenancy authority before acting, and seek independent legal advice for your specific situation.
          </p>
        </DisclaimerCard>
      }
      related={[
        { href: "/code-of-conduct", label: "STRA Code of Conduct", description: "NSW Short-Term Rental Accommodation rules" },
        { href: "/anti-discrimination", label: "Fair Housing Policy", description: "Anti-discrimination obligations for owners" },
        { href: "/terms-of-service", label: "Terms of Service", description: "Your rights and responsibilities on MigRent" },
        { href: "/contact", label: "Contact MigRent", description: "Get help finding the right state authority" },
      ]}
    >
      <PolicySection
        id="about"
        title="About this guide"
        summary="A general overview only. MigRent is an introduction service, not a legal adviser."
      >
        <p>This guide provides a general overview of rental and short-term rental accommodation (STRA) laws across Australian states and territories. It is for <strong>informational purposes only</strong> and does not constitute legal advice.</p>
        <p>MigRent is an online introduction service. Users are responsible for complying with all applicable laws in their state or territory. We strongly recommend seeking independent legal advice for your specific situation.</p>
      </PolicySection>

      <PolicySection
        id="overview"
        title="State-by-state overview"
        summary="Bond rules, STRA day limits, registration requirements, and the relevant authority for each state."
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">State</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Bond rules</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">STRA day limit</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Registration</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">NSW</td>
                <td className="py-3 px-3">Max 4 weeks rent. Must lodge with NSW Fair Trading within 10 business days.</td>
                <td className="py-3 px-3">180 days/year (Greater Sydney, unless host-present). Unlimited if host is present.</td>
                <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-medium">Required - NSW STRA Register</td>
                <td className="py-3 px-3"><a href="https://www.fairtrading.nsw.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>NSW Fair Trading</a></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">VIC</td>
                <td className="py-3 px-3">Max 4 weeks rent. Lodged with Residential Tenancies Bond Authority (RTBA).</td>
                <td className="py-3 px-3">No statewide cap currently. Check local council rules.</td>
                <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies by council</td>
                <td className="py-3 px-3"><a href="https://www.consumer.vic.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>Consumer Affairs VIC</a></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">QLD</td>
                <td className="py-3 px-3">Max 4 weeks rent. Lodged with Residential Tenancies Authority (RTA).</td>
                <td className="py-3 px-3">No statewide cap. Some local government areas have restrictions.</td>
                <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies by council</td>
                <td className="py-3 px-3"><a href="https://www.rta.qld.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>RTA QLD</a></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">WA</td>
                <td className="py-3 px-3">Max 4 weeks rent. Lodged with the Bond Administrator.</td>
                <td className="py-3 px-3">No statewide cap. Check local planning scheme.</td>
                <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies by council</td>
                <td className="py-3 px-3"><a href="https://www.consumerprotection.wa.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>Consumer Protection WA</a></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">SA</td>
                <td className="py-3 px-3">Max 4 weeks rent (6 weeks if rent exceeds $250/week). Lodged with Consumer and Business Services.</td>
                <td className="py-3 px-3">No statewide cap. Check local council.</td>
                <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies by council</td>
                <td className="py-3 px-3"><a href="https://www.cbs.sa.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>CBS South Australia</a></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">TAS</td>
                <td className="py-3 px-3">Max 4 weeks rent. Lodged with the Rental Deposit Authority.</td>
                <td className="py-3 px-3">No statewide cap. Check local council.</td>
                <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies by council</td>
                <td className="py-3 px-3"><a href="https://www.cbos.tas.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>Consumer Building and Occupational Services TAS</a></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">ACT</td>
                <td className="py-3 px-3">Max 4 weeks rent. Lodged with ACT Revenue Office.</td>
                <td className="py-3 px-3">No statewide cap. Check planning rules.</td>
                <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies</td>
                <td className="py-3 px-3"><a href="https://www.accesscanberra.act.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>Access Canberra</a></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">NT</td>
                <td className="py-3 px-3">Max 4 weeks rent. Held by the landlord or agent under NT rules.</td>
                <td className="py-3 px-3">No statewide cap. Check local council.</td>
                <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium">Varies</td>
                <td className="py-3 px-3"><a href="https://nt.gov.au/property/renters-and-tenants" target="_blank" rel="noopener noreferrer" className={accent}>NT Consumer Affairs</a></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout variant="warning" title="Always verify before acting">
          Rules and day limits change. Before listing, signing, or paying anything, check the latest guidance on the official authority site for your state.
        </Callout>
      </PolicySection>

      <PolicySection id="nsw" title="New South Wales (NSW)">
        <p>NSW has the most comprehensive STRA framework in Australia. Hosts must register on the NSW STRA Register before listing, and Greater Sydney has a 180 day per year cap for non-hosted stays. Bonds (max 4 weeks rent) must be lodged with NSW Fair Trading within 10 business days.</p>
        <p>Official authority: <a href="https://www.fairtrading.nsw.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>NSW Fair Trading</a>. For more on the NSW STRA Code of Conduct, see our <Link href="/code-of-conduct" className={accent}>summary page</Link>.</p>
      </PolicySection>

      <PolicySection id="vic" title="Victoria (VIC)">
        <p>Bonds (max 4 weeks rent) are lodged with the Residential Tenancies Bond Authority (RTBA). Victoria does not currently have a statewide STRA day cap, but local councils (especially in Greater Melbourne) may impose their own rules. Owners corporations may also restrict STRA in apartment buildings.</p>
        <p>Official authority: <a href="https://www.consumer.vic.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>Consumer Affairs Victoria</a>.</p>
      </PolicySection>

      <PolicySection id="qld" title="Queensland (QLD)">
        <p>Bonds (max 4 weeks rent) are lodged with the Residential Tenancies Authority (RTA). There is no statewide STRA cap, but specific local government areas (such as Brisbane, Noosa, and Gold Coast) have their own STRA registration and approval requirements.</p>
        <p>Official authority: <a href="https://www.rta.qld.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>Residential Tenancies Authority QLD</a>.</p>
      </PolicySection>

      <PolicySection id="wa" title="Western Australia (WA)">
        <p>Bonds (max 4 weeks rent) are lodged with the Bond Administrator. STRA rules are largely set by local planning schemes - check with your local council before listing.</p>
        <p>Official authority: <a href="https://www.consumerprotection.wa.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>Consumer Protection WA</a>.</p>
      </PolicySection>

      <PolicySection id="sa" title="South Australia (SA)">
        <p>Bonds are capped at 4 weeks rent (6 weeks if rent exceeds $250/week) and lodged with Consumer and Business Services. STRA rules vary by council.</p>
        <p>Official authority: <a href="https://www.cbs.sa.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>CBS South Australia</a>.</p>
      </PolicySection>

      <PolicySection id="tas" title="Tasmania (TAS)">
        <p>Bonds (max 4 weeks rent) are lodged with the Rental Deposit Authority. STRA hosts must comply with planning and visitor accommodation rules - check with your local council.</p>
        <p>Official authority: <a href="https://www.cbos.tas.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>Consumer, Building and Occupational Services TAS</a>.</p>
      </PolicySection>

      <PolicySection id="act" title="Australian Capital Territory (ACT)">
        <p>Bonds (max 4 weeks rent) are lodged with the ACT Revenue Office. STRA in the ACT is governed by general planning rules.</p>
        <p>Official authority: <a href="https://www.accesscanberra.act.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>Access Canberra</a>.</p>
      </PolicySection>

      <PolicySection id="nt" title="Northern Territory (NT)">
        <p>Bonds (max 4 weeks rent) are held by the landlord or agent under NT rules - the NT does not have a central bond authority like other states. STRA rules are largely council-led.</p>
        <p>Official authority: <a href="https://nt.gov.au/property/renters-and-tenants" target="_blank" rel="noopener noreferrer" className={accent}>NT Consumer Affairs</a>.</p>
      </PolicySection>

      <PolicySection
        id="key-concepts"
        title="Key concepts for migrants"
        summary="Bonds, tenancy agreements vs licences, and what STRA actually means."
      >
        <div className="card-subtle p-4 rounded-xl">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Bond (security deposit)</h3>
          <p>A bond is a payment held as security against damage or unpaid rent. In most states, bonds must be lodged with a government authority - not held by the landlord. You are entitled to a full refund at the end of your tenancy if there is no damage or unpaid rent.</p>
        </div>
        <div className="card-subtle p-4 rounded-xl">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Tenancy agreement vs licence</h3>
          <p>A formal tenancy agreement gives you stronger legal protections under residential tenancy law. A licence (common in share houses) may offer fewer protections. Understand which arrangement you are entering before committing.</p>
        </div>
        <div className="card-subtle p-4 rounded-xl">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Short-term rental accommodation (STRA)</h3>
          <p>STRA refers to accommodation rented for less than 3 consecutive months. NSW has specific regulations requiring registration and limiting the number of days per year. Other states have varying rules - always check your local council.</p>
        </div>
        <Callout variant="info" title="New to Australia?">
          If English is not your first language, most state authorities offer translated guides and free phone interpreters. The Tenants Union in each state also provides free advice for renters.
        </Callout>
      </PolicySection>

      <PolicySection id="migrent-role" title="MigRent's role">
        <p>MigRent is an introduction service only. We do not:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Create or manage tenancy agreements on your behalf</li>
          <li>Collect, hold, or lodge bonds for any party</li>
          <li>Enforce rental laws or mediate tenancy disputes</li>
          <li>Provide legal advice about your specific rental situation</li>
        </ul>
        <p>Users are solely responsible for ensuring their arrangements comply with applicable state and territory laws. See our <Link href="/terms-of-service" className={accent}>Terms of Service</Link> and <Link href="/no-agency" className={accent}>No Agency Disclosure</Link> for more.</p>
      </PolicySection>
    </PolicyLayout>
  );
}
