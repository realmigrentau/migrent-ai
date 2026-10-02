import Link from "next/link";
import SEOHead from "../components/SEOHead";
import LegalLayout from "../components/site/LegalLayout";

export default function AbnTerms() {
  return (
    <>
      <SEOHead title="ABN &amp; Business Details" description="Migrent business details, ABN, fee structure, and payment terms." />

      <LegalLayout title="ABN & Business Details" note="Last updated: 1 October 2026">
        {/* Fee wording aligned with the live product on 1 October 2026 (MIGRENT_MASTER_AUDIT.md MIG-006): hosts pay AUD $99 once per property, for short stays only; renters pay nothing. Must be reviewed by Australian counsel before launch (docs/legal/identity-and-claims.md). */}

        <div className="space-y-8">
          {/* Business Details */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Business Information</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <tbody className="divide-y divide-[var(--color-line)] dark:divide-[var(--color-line)]">
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[var(--color-ink)] w-1/3">Business Name</td>
                      <td className="py-3 px-3">Migrent</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[var(--color-ink)]">ABN</td>
                      <td className="py-3 px-3 font-mono">22 669 566 941</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[var(--color-ink)]">Entity Type</td>
                      <td className="py-3 px-3">Being confirmed</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[var(--color-ink)]">GST Registered</td>
                      <td className="py-3 px-3">No (below GST threshold)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[var(--color-ink)]">Location</td>
                      <td className="py-3 px-3">Australia</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[var(--color-ink)]">Website</td>
                      <td className="py-3 px-3">migrent.vercel.app</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[var(--color-ink)]">Contact Email</td>
                      <td className="py-3 px-3"><a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Nature of Business */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Nature of Business</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Migrent operates as an <strong>online introduction service</strong> for accommodation. We are:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>A technology platform that connects room owners with accommodation seekers</li>
                <li>A platform where renters search for, inspect and apply for rooms and homes, from short stays to long-term tenancies</li>
                <li>A facilitator of introductions - not a real estate agent or property manager</li>
              </ul>
              <p>We do not hold a real estate licence, as we do not perform real estate agent activities (see <Link href="/how-renting-works#not-an-agent" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">No Agency Disclosure</Link>). We do not collect rent, bonds, or manage tenancy agreements.</p>
            </div>
          </section>

          {/* Fee Structure */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Fee Structure</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Migrent charges flat platform fees only. We do not take a percentage of rent or any ongoing commissions.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[var(--color-line)]">
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Fee</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Amount</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Who Pays</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)] dark:divide-[var(--color-line)]">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Host fee (short stays)</td>
                      <td className="py-2.5 px-3 font-semibold text-[var(--color-ink)]">AUD $99</td>
                      <td className="py-2.5 px-3">Host</td>
                      <td className="py-2.5 px-3">Once per property, when the first stay booking there is confirmed</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Mentor session (optional)</td>
                      <td className="py-2.5 px-3 font-semibold text-[var(--color-ink)]">Set by the mentor; Migrent keeps 30%</td>
                      <td className="py-2.5 px-3">Renter who books one</td>
                      <td className="py-2.5 px-3">Only if they choose a session</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Account creation</td>
                      <td className="py-2.5 px-3 text-[var(--color-accent)] dark:text-[var(--color-accent)] font-semibold">Free</td>
                      <td className="py-2.5 px-3">All users</td>
                      <td className="py-2.5 px-3">-</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Browsing and searching</td>
                      <td className="py-2.5 px-3 text-[var(--color-accent)] dark:text-[var(--color-accent)] font-semibold">Free</td>
                      <td className="py-2.5 px-3">All users</td>
                      <td className="py-2.5 px-3">-</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Messaging</td>
                      <td className="py-2.5 px-3 text-[var(--color-accent)] dark:text-[var(--color-accent)] font-semibold">Free</td>
                      <td className="py-2.5 px-3">All users</td>
                      <td className="py-2.5 px-3">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Payment Terms</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <ul className="list-disc list-inside space-y-1.5">
                <li>All payments are processed securely via <strong>Stripe</strong></li>
                <li>Accepted payment methods: Visa, Mastercard, American Express (via Stripe)</li>
                <li>All prices are in <strong>Australian Dollars (AUD)</strong> and include GST where applicable</li>
                <li>Stripe receipts are emailed automatically after payment</li>
                <li>Platform fees are generally <strong>non-refundable</strong> once a deal is confirmed (see <Link href="/terms-of-service" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Terms of Service</Link> section 6)</li>
                <li>Migrent does not store full credit card details - all payment data is handled by Stripe</li>
              </ul>
            </div>
          </section>

          {/* GST Note */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">GST Information</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Migrent is currently not registered for GST as annual turnover is below the $75,000 threshold. If and when Migrent becomes GST registered, fees will be updated to include GST and tax invoices will be provided.</p>
            </div>
          </section>

          {/* ABN Lookup */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Verify Our ABN</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>You can verify Migrent&apos;s ABN on the Australian Business Register:</p>
              <a href="https://abr.business.gov.au" target="_blank" rel="noopener noreferrer" className="inline-block text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">abr.business.gov.au</a>
              <p>Search for ABN: <span className="font-mono font-semibold">22 669 566 941</span></p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>For full terms governing your use of Migrent, see our <Link href="/terms-of-service" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Terms of Service</Link>. Last reviewed: March 2026.</p>
          </div>

        </div>
      </LegalLayout>
    </>
  );
}
