import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";
import Callout from "../components/legal/Callout";

const toc = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "platform-role", label: "Platform role" },
  { id: "accounts", label: "User accounts" },
  { id: "obligations", label: "User obligations" },
  { id: "fees", label: "Fees and payments" },
  { id: "refunds", label: "Refund policy" },
  { id: "listings", label: "Listings and content" },
  { id: "no-warranty", label: "No warranty" },
  { id: "liability", label: "Limitation of liability" },
  { id: "indemnity", label: "Indemnity" },
  { id: "regulatory", label: "Regulatory compliance" },
  { id: "suspension", label: "Suspension and termination" },
  { id: "disputes", label: "Dispute resolution" },
  { id: "governing-law", label: "Governing law" },
  { id: "severability", label: "Severability" },
  { id: "changes", label: "Changes to terms" },
  { id: "contact", label: "Contact" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function TermsOfService() {
  return (
    <PolicyLayout
      family="legal"
      eyebrow="Legal"
      title="Terms of Service"
      lede="The rules that apply when you use MigRent. Written in plain English where possible, with the legal precision required for an Australian platform."
      lastUpdated="March 2026"
      effective="1 March 2026"
      version="2.0"
      metaTitle="Terms of Service | MigRent AI"
      metaDescription="MigRent AI Terms of Service - platform fees, cancellations, liability, and user responsibilities."
      toc={toc}
      related={[
        { href: "/privacy-policy", label: "Privacy Policy", description: "How we handle your data" },
        { href: "/no-agency", label: "No Agency Disclosure", description: "What MigRent is and isn't" },
        { href: "/support-disputes", label: "Dispute Resolution", description: "What to do if something goes wrong" },
        { href: "/contact-legal", label: "Legal Contact", description: "Reach our legal team" },
      ]}
    >
      <PolicySection id="acceptance" number={1} title="Acceptance of Terms">
        <p>By accessing or using MigRent AI (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use the Platform. MigRent AI is operated under ABN 22 669 566 941, based in Sydney, Australia.</p>
      </PolicySection>

      <PolicySection
        id="platform-role"
        number={2}
        title="Platform Role - Online Introduction Service"
        summary="MigRent connects owners and seekers. We are not a real estate agent, landlord, or party to any rental agreement."
      >
        <p>MigRent AI is an <strong>online introduction service only</strong>. We connect room owners with accommodation seekers for short- to medium-term rooms. We are not:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>A real estate agent, property manager, or letting agent</li>
          <li>A landlord or tenant</li>
          <li>A party to any tenancy, licence, or rental agreement</li>
          <li>A legal representative of any user</li>
          <li>A collector of rent, bonds, or deposits on behalf of any user</li>
        </ul>
        <p>All arrangements, agreements, and ongoing rent payments are between owners and seekers directly. MigRent does not create tenancy agreements, collect bonds, or handle rent payments. See our <Link href="/no-agency" className={accent}>No Agency Disclosure</Link> for further details.</p>
      </PolicySection>

      <PolicySection id="accounts" number={3} title="User Accounts">
        <p>To use certain features, you must create an account. You agree to:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Be responsible for all activity under your account</li>
          <li>Notify us immediately of any unauthorised access</li>
          <li>Not create multiple accounts for deceptive purposes</li>
        </ul>
        <p>We reserve the right to suspend or terminate accounts that violate these Terms or our <Link href="/rules-community-guidelines" className={accent}>Community Guidelines</Link>.</p>
      </PolicySection>

      <PolicySection
        id="obligations"
        number={4}
        title="User Obligations"
        summary="Owners and seekers each have responsibilities. Both must give accurate info and comply with Australian law."
      >
        <p>By using MigRent, you acknowledge and agree to the following responsibilities based on your role:</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Obligation</th>
                <th className="text-center py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Owner</th>
                <th className="text-center py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Seeker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr><td className="py-2.5 px-3">Provide accurate listing/profile information</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td></tr>
              <tr><td className="py-2.5 px-3">Comply with all applicable AU rental and STRA laws</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td></tr>
              <tr><td className="py-2.5 px-3">Arrange your own tenancy agreements and bonds</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td></tr>
              <tr><td className="py-2.5 px-3">Pay applicable platform fees</td><td className="py-2.5 px-3 text-center text-emerald-500">$99/deal</td><td className="py-2.5 px-3 text-center text-slate-400">$19 optional</td></tr>
              <tr><td className="py-2.5 px-3">Ensure property meets safety and habitability standards</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td><td className="py-2.5 px-3 text-center text-slate-400">N/A</td></tr>
              <tr><td className="py-2.5 px-3">Conduct personal inspection before committing</td><td className="py-2.5 px-3 text-center text-slate-400">N/A</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td></tr>
              <tr><td className="py-2.5 px-3">Comply with anti-discrimination laws</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td></tr>
              <tr><td className="py-2.5 px-3">Indemnify MigRent against claims from your deals</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td><td className="py-2.5 px-3 text-center text-emerald-500">Yes</td></tr>
            </tbody>
          </table>
        </div>
      </PolicySection>

      <PolicySection
        id="fees"
        number={5}
        title="Platform Fees and Payments"
        summary="Flat fees only. $99 for owners per match, optional $19 verification fee for seekers. No percentage of rent."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="card-subtle p-4 rounded-xl">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Owner fees</h3>
            <p>Owners agree to pay a one-time AUD $99 platform fee per successful match made through MigRent. Charged at the time a deal is confirmed. We do not take a percentage of rent.</p>
          </div>
          <div className="card-subtle p-4 rounded-xl">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Seeker fees</h3>
            <p>Seekers may be presented with an optional one-time AUD $19 verification fee. This is always clearly disclosed before payment and is optional.</p>
          </div>
        </div>
        <Callout variant="warning" title="Fee circumvention">
          Users must not use MigRent to locate or contact another user and then intentionally complete the arrangement outside the platform to avoid fees. Suspected circumvention may result in account suspension or termination.
        </Callout>
        <p>All payments are processed securely through Stripe. MigRent does not store your full credit card details.</p>
      </PolicySection>

      <PolicySection id="refunds" number={6} title="Refund Policy">
        <p>Platform fees are generally non-refundable once a deal is confirmed and payment is processed. In exceptional circumstances, refunds may be considered at the sole discretion of MigRent AI.</p>
        <p>Stripe receipts are automatically sent to the email address associated with your account. For refund inquiries, contact <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a>.</p>
      </PolicySection>

      <PolicySection id="listings" number={7} title="Listings and Content">
        <p>Users are solely responsible for the accuracy of all content they post, including listing descriptions, photos, pricing, and profile information. You agree not to post:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>False, misleading, or deceptive information</li>
          <li>Content that infringes third-party intellectual property rights</li>
          <li>Discriminatory, harassing, or offensive content</li>
          <li>Spam, scams, or commercial solicitations unrelated to accommodation</li>
        </ul>
        <p>MigRent reserves the right to remove any content that violates these Terms without prior notice.</p>
      </PolicySection>

      <PolicySection id="no-warranty" number={8} title="No Warranty">
        <p>The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by law, MigRent makes no warranties, express or implied, including but not limited to:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>The condition, safety, quality, or legality of any listed property</li>
          <li>The accuracy of listings, user profiles, or verification data</li>
          <li>The ability or willingness of users to complete an arrangement</li>
          <li>That the Platform will be uninterrupted, secure, or error-free</li>
        </ul>
        <p>All properties are listed &quot;as is.&quot; Users must verify property condition, safety, and suitability for themselves before entering any arrangement.</p>
      </PolicySection>

      <PolicySection id="liability" number={9} title="Limitation of Liability">
        <p>To the maximum extent permitted by Australian law (including the Australian Consumer Law):</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>MigRent excludes all liability for indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the Platform</li>
          <li>MigRent is not liable for disputes between owners and seekers</li>
          <li>MigRent is not liable for any loss, injury, damage, or harm arising from any arrangement made through the Platform</li>
          <li>Verification badges and match scores are informational tools only and do not constitute guarantees of safety or suitability</li>
        </ul>
        <Callout variant="critical" title="Maximum liability cap">
          MigRent&apos;s total aggregate liability to you for all claims arising out of or relating to the use of the Platform shall not exceed the total amount of platform fees you have paid to MigRent in the 12 months preceding the claim.
        </Callout>
        <p>Users are responsible for conducting their own due diligence before entering into any arrangement. Nothing in these Terms excludes, restricts, or modifies rights that cannot be excluded under Australian Consumer Law.</p>
      </PolicySection>

      <PolicySection id="indemnity" number={10} title="Indemnity">
        <p>You agree to indemnify, defend, and hold harmless MigRent AI, its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Your use of or conduct on the Platform</li>
          <li>Any arrangement or deal you enter into with another user</li>
          <li>Your violation of these Terms or any applicable law</li>
          <li>Any content you post or submit through the Platform</li>
          <li>Any dispute between you and another user of the Platform</li>
          <li>Your failure to comply with applicable rental, tenancy, or STRA laws</li>
        </ul>
        <p>This indemnity obligation survives the termination of your account and these Terms.</p>
      </PolicySection>

      <PolicySection id="regulatory" number={11} title="Regulatory Compliance">
        <p>Users are responsible for complying with all applicable local, state, and federal laws, including:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Short-term rental accommodation (STRA) regulations - see our <Link href="/code-of-conduct" className={accent}>STRA Code of Conduct</Link></li>
          <li>Anti-discrimination laws - see our <Link href="/anti-discrimination" className={accent}>Fair Housing Policy</Link></li>
          <li>Residential tenancy laws - see our <Link href="/rental-laws" className={accent}>State Rental Laws Guide</Link></li>
          <li>Tax obligations (including income tax on rental income)</li>
        </ul>
        <p>MigRent does not provide legal advice and is not responsible for users&apos; regulatory compliance.</p>
      </PolicySection>

      <PolicySection id="suspension" number={12} title="Suspension and Termination">
        <p>MigRent may suspend or terminate your account at any time for:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Breach of these Terms or Community Guidelines</li>
          <li>Suspected fraud or illegal activity</li>
          <li>Attempts to circumvent platform fees</li>
          <li>Behaviour that endangers other users or the platform</li>
        </ul>
        <p>You may delete your account at any time through your account settings. Upon deletion, your data will be handled in accordance with our <Link href="/privacy-policy" className={accent}>Privacy Policy</Link>.</p>
      </PolicySection>

      <PolicySection
        id="disputes"
        number={13}
        title="Dispute Resolution and Arbitration"
        summary="Try direct resolution first, then MigRent mediation, then binding arbitration via ACICA in Sydney."
      >
        <p>Any dispute, controversy, or claim arising out of or relating to these Terms or your use of the Platform shall be resolved as follows:</p>
        <div className="space-y-2">
          <div className="flex gap-3 card-subtle p-4 rounded-xl">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-semibold">1</span>
            <p><strong className="text-slate-800 dark:text-slate-200">Direct resolution.</strong> Contact the other party directly to attempt resolution.</p>
          </div>
          <div className="flex gap-3 card-subtle p-4 rounded-xl">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-semibold">2</span>
            <p><strong className="text-slate-800 dark:text-slate-200">MigRent mediation.</strong> If unresolved within 14 days, contact MigRent at <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a> for informal mediation.</p>
          </div>
          <div className="flex gap-3 card-subtle p-4 rounded-xl">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-semibold">3</span>
            <p><strong className="text-slate-800 dark:text-slate-200">Binding arbitration.</strong> If mediation fails within 30 days, the dispute shall be resolved by binding arbitration administered by the Australian Centre for International Commercial Arbitration (ACICA) in accordance with ACICA Arbitration Rules. Seat: Sydney, NSW. Language: English.</p>
          </div>
        </div>
        <p>To the extent permitted by law, you agree to waive any right to participate in a class action, representative proceeding, or class-wide arbitration. See <Link href="/support-disputes" className={accent}>Dispute Resolution</Link> for full details.</p>
      </PolicySection>

      <PolicySection id="governing-law" number={14} title="Governing Law">
        <p>These Terms are governed by and construed in accordance with the laws of New South Wales, Australia, without regard to conflict of law principles. Subject to the arbitration clause above, any disputes shall be subject to the exclusive jurisdiction of the courts of New South Wales.</p>
      </PolicySection>

      <PolicySection id="severability" number={15} title="Severability">
        <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such invalidity shall not affect the remaining provisions, which shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the original intent.</p>
      </PolicySection>

      <PolicySection id="changes" number={16} title="Changes to Terms">
        <p>We may update these Terms from time to time. We will notify users of material changes via email or a notice on the platform. Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>
      </PolicySection>

      <PolicySection id="contact" number={17} title="Contact">
        <div className="card-subtle p-5 rounded-xl space-y-1 not-prose">
          <p className="font-semibold text-slate-800 dark:text-slate-200">MigRent AI</p>
          <p className="text-sm">ABN: 22 669 566 941</p>
          <p className="text-sm">Email: <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a></p>
          <p className="text-sm">Location: Sydney, Australia</p>
        </div>
      </PolicySection>
    </PolicyLayout>
  );
}
