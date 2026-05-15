import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";

const toc = [
  { id: "business-info", label: "Business information" },
  { id: "nature", label: "Nature of business" },
  { id: "fees", label: "Fee structure" },
  { id: "payment-terms", label: "Payment terms" },
  { id: "gst", label: "GST information" },
  { id: "verify-abn", label: "Verify our ABN" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function AbnTerms() {
  return (
    <PolicyLayout
      family="legal"
      eyebrow="Legal"
      title="ABN and Business Details"
      lede="MigRent AI business information, ABN, fee structure, and payment terms."
      lastUpdated="March 2026"
      metaTitle="ABN & Business Details | MigRent AI"
      metaDescription="MigRent AI business details, ABN, fee structure, and payment terms."
      toc={toc}
      related={[
        { href: "/terms-of-service", label: "Terms of Service", description: "The rules that apply when you use MigRent" },
        { href: "/no-agency", label: "No Agency Disclosure", description: "Why we are not your agent" },
        { href: "/privacy-policy", label: "Privacy Policy", description: "How we handle your data" },
        { href: "/contact-legal", label: "Legal Contact", description: "Reach our legal team" },
      ]}
    >
      <PolicySection id="business-info" number={1} title="Business Information">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm border-collapse">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 w-1/3">Business Name</td>
                <td className="py-3 px-3">MigRent AI</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">ABN</td>
                <td className="py-3 px-3 font-mono">22 669 566 941</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Entity Type</td>
                <td className="py-3 px-3">Sole Trader</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">GST Registered</td>
                <td className="py-3 px-3">No (below GST threshold)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Location</td>
                <td className="py-3 px-3">Sydney, New South Wales, Australia</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Website</td>
                <td className="py-3 px-3">migrent-ai.vercel.app</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Contact Email</td>
                <td className="py-3 px-3"><a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </PolicySection>

      <PolicySection id="nature" number={2} title="Nature of Business">
        <p>MigRent AI operates as an <strong>online introduction service</strong> for accommodation. We are:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>A technology platform that connects room owners with accommodation seekers</li>
          <li>An AI-powered matching service for short- to medium-term rooms</li>
          <li>A facilitator of introductions - not a real estate agent or property manager</li>
        </ul>
        <p>We do not hold a real estate licence, as we do not perform real estate agent activities (see <Link href="/no-agency" className={accent}>No Agency Disclosure</Link>). We do not collect rent, bonds, or manage tenancy agreements.</p>
      </PolicySection>

      <PolicySection
        id="fees"
        number={3}
        title="Fee Structure"
        summary="Flat fees only. $99 for owners per match, optional $19 verification fee for seekers. No percentage of rent."
      >
        <p>MigRent charges flat platform fees only. We do not take a percentage of rent or any ongoing commissions.</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Fee</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Amount</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Who Pays</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-medium">Deal Confirmation Fee</td>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">AUD $99</td>
                <td className="py-2.5 px-3">Owner</td>
                <td className="py-2.5 px-3">Per successful match / deal</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Verification Fee (optional)</td>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">AUD $19</td>
                <td className="py-2.5 px-3">Seeker</td>
                <td className="py-2.5 px-3">One-time, optional</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Account creation</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Free</td>
                <td className="py-2.5 px-3">All users</td>
                <td className="py-2.5 px-3">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Browsing and searching</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Free</td>
                <td className="py-2.5 px-3">All users</td>
                <td className="py-2.5 px-3">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Messaging</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Free</td>
                <td className="py-2.5 px-3">All users</td>
                <td className="py-2.5 px-3">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </PolicySection>

      <PolicySection id="payment-terms" number={4} title="Payment Terms">
        <ul className="list-disc list-inside space-y-1.5">
          <li>All payments are processed securely via <strong>Stripe</strong></li>
          <li>Accepted payment methods: Visa, Mastercard, American Express (via Stripe)</li>
          <li>All prices are in <strong>Australian Dollars (AUD)</strong> and include GST where applicable</li>
          <li>Stripe receipts are emailed automatically after payment</li>
          <li>Platform fees are generally <strong>non-refundable</strong> once a deal is confirmed (see <Link href="/terms-of-service" className={accent}>Terms of Service</Link> section 6)</li>
          <li>MigRent does not store full credit card details - all payment data is handled by Stripe</li>
        </ul>
      </PolicySection>

      <PolicySection id="gst" number={5} title="GST Information">
        <p>MigRent AI is currently not registered for GST as annual turnover is below the $75,000 threshold. If and when MigRent becomes GST registered, fees will be updated to include GST and tax invoices will be provided.</p>
      </PolicySection>

      <PolicySection id="verify-abn" number={6} title="Verify Our ABN">
        <p>You can verify MigRent&apos;s ABN on the Australian Business Register:</p>
        <p><a href="https://abr.business.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>abr.business.gov.au</a></p>
        <p>Search for ABN: <span className="font-mono font-semibold">22 669 566 941</span></p>
        <p className="text-xs text-slate-400 dark:text-slate-500">For full terms governing your use of MigRent, see our <Link href="/terms-of-service" className={accent}>Terms of Service</Link>. Last reviewed: March 2026.</p>
      </PolicySection>
    </PolicyLayout>
  );
}
