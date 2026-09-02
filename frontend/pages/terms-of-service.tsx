import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service | MigRent</title>
        <meta name="description" content="MigRent Terms of Service - platform fees, cancellations, liability, and user responsibilities." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-100)] dark:border-[var(--color-line)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                Terms of Service
              </h1>
              <p className="text-sm text-[var(--color-ink-3)] mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Acceptance */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">1. Acceptance of Terms</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>By accessing or using MigRent (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use the Platform. MigRent is operated under ABN 22 669 566 941 in Australia.</p>
            </div>
          </section>

          {/* Platform Role */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">2. Platform Role - Online Introduction Service</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>MigRent is an <strong>online introduction service only</strong>. We connect room owners with accommodation seekers for short- to medium-term rooms. We are not:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>A real estate agent, property manager, or letting agent</li>
                <li>A landlord or tenant</li>
                <li>A party to any tenancy, licence, or rental agreement</li>
                <li>A legal representative of any user</li>
                <li>A collector of rent, bonds, or deposits on behalf of any user</li>
              </ul>
              <p>All arrangements, agreements, and ongoing rent payments are between owners and seekers directly. MigRent does not create tenancy agreements, collect bonds, or handle rent payments. Users make their own direct arrangements. See our <Link href="/no-agency" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">No Agency Disclosure</Link> for further details.</p>
            </div>
          </section>

          {/* Accounts */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">3. User Accounts</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>To use certain features, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be responsible for all activity under your account</li>
                <li>Notify us immediately of any unauthorised access</li>
                <li>Not create multiple accounts for deceptive purposes</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that violate these Terms or our <Link href="/rules-community-guidelines" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Community Guidelines</Link>.</p>
            </div>
          </section>

          {/* User/Owner Obligations Table */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">4. User Obligations</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>By using MigRent, you acknowledge and agree to the following responsibilities based on your role:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-line)]">
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Obligation</th>
                      <th className="text-center py-3 px-3 font-semibold text-[var(--color-ink)]">Owner</th>
                      <th className="text-center py-3 px-3 font-semibold text-[var(--color-ink)]">Seeker</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)] dark:divide-[var(--color-line)]">
                    <tr>
                      <td className="py-2.5 px-3">Provide accurate listing/profile information</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Comply with all applicable AU rental and STRA laws</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Arrange your own tenancy agreements and bonds</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Pay applicable platform fees</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">$99/deal</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-ink-3)]">$19 optional</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Ensure property meets safety and habitability standards</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-ink-3)]">N/A</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Conduct personal inspection before committing</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-ink-3)]">N/A</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Comply with anti-discrimination laws</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Indemnify MigRent against claims from your deals</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                      <td className="py-2.5 px-3 text-center text-[var(--color-accent)]">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Fees */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">5. Platform Fees &amp; Payments</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-[var(--color-ink)] mb-2">Owner Fees</h3>
                <p>Owners agree to pay a one-time AUD $99 platform fee per successful match made through MigRent. This fee is charged at the time a deal is confirmed through the platform. MigRent charges flat fees only - we do not take a percentage of rent.</p>
              </div>
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-[var(--color-ink)] mb-2">Seeker Fees</h3>
                <p>Seekers may be presented with an optional one-time AUD $19 verification fee. This is always clearly disclosed before payment and is optional.</p>
              </div>
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-amber-500">
                <h3 className="font-semibold text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] mb-2">Fee Circumvention</h3>
                <p>Users must not use MigRent to locate or contact another user and then intentionally complete the arrangement entirely outside the platform to avoid fees. Suspected circumvention may result in account suspension or termination.</p>
              </div>
              <p>All payments are processed securely through Stripe. MigRent does not store your full credit card details.</p>
            </div>
          </section>

          {/* Refunds */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">6. Refund Policy</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Platform fees are generally non-refundable once a deal is confirmed and payment is processed. In exceptional circumstances, refunds may be considered at the sole discretion of MigRent.</p>
              <p>Stripe receipts are automatically sent to the email address associated with your account. For refund inquiries, contact <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a>.</p>
            </div>
          </section>

          {/* Listings */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">7. Listings &amp; Content</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Users are solely responsible for the accuracy of all content they post, including listing descriptions, photos, pricing, and profile information. You agree not to post:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>False, misleading, or deceptive information</li>
                <li>Content that infringes third-party intellectual property rights</li>
                <li>Discriminatory, harassing, or offensive content</li>
                <li>Spam, scams, or commercial solicitations unrelated to accommodation</li>
              </ul>
              <p>MigRent reserves the right to remove any content that violates these Terms without prior notice.</p>
            </div>
          </section>

          {/* No Warranty */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">8. No Warranty</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by law, MigRent makes no warranties, express or implied, including but not limited to:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>The condition, safety, quality, or legality of any listed property</li>
                <li>The accuracy of listings, user profiles, or verification data</li>
                <li>The ability or willingness of users to complete an arrangement</li>
                <li>That the Platform will be uninterrupted, secure, or error-free</li>
              </ul>
              <p>All properties are listed &quot;as is.&quot; Users must verify property condition, safety, and suitability for themselves before entering any arrangement.</p>
            </div>
          </section>

          {/* Liability */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">9. Limitation of Liability</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>To the maximum extent permitted by Australian law (including the Australian Consumer Law):</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>MigRent excludes all liability for indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the Platform</li>
                <li>MigRent is not liable for disputes between owners and seekers</li>
                <li>MigRent is not liable for any loss, injury, damage, or harm arising from any arrangement made through the Platform</li>
                <li>Verification badges and match scores are informational tools only and do not constitute guarantees of safety or suitability</li>
              </ul>
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-[var(--color-primary)]">
                <h3 className="font-semibold text-[var(--color-primary)] dark:text-[var(--color-primary)] mb-2">Maximum Liability Cap</h3>
                <p>In any event, MigRent&apos;s total aggregate liability to you for all claims arising out of or relating to the use of the Platform shall not exceed the total amount of platform fees you have paid to MigRent in the 12 months preceding the claim.</p>
              </div>
              <p>Users are responsible for conducting their own due diligence before entering into any arrangement. Nothing in these Terms excludes, restricts, or modifies rights that cannot be excluded under Australian Consumer Law.</p>
            </div>
          </section>

          {/* Indemnity */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">10. Indemnity</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>You agree to indemnify, defend, and hold harmless MigRent, its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Your use of or conduct on the Platform</li>
                <li>Any arrangement or deal you enter into with another user</li>
                <li>Your violation of these Terms or any applicable law</li>
                <li>Any content you post or submit through the Platform</li>
                <li>Any dispute between you and another user of the Platform</li>
                <li>Your failure to comply with applicable rental, tenancy, or STRA laws</li>
              </ul>
              <p>This indemnity obligation survives the termination of your account and these Terms.</p>
            </div>
          </section>

          {/* Regulatory */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">11. Regulatory Compliance</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Users are responsible for complying with all applicable local, state, and federal laws, including but not limited to:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Short-term rental accommodation (STRA) regulations - see our <Link href="/code-of-conduct" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">STRA Code of Conduct</Link> page</li>
                <li>Anti-discrimination laws - see our <Link href="/anti-discrimination" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Fair Housing Policy</Link></li>
                <li>Residential tenancy laws - see our <Link href="/rental-laws" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">State Rental Laws Guide</Link></li>
                <li>Tax obligations (including income tax on rental income)</li>
              </ul>
              <p>MigRent does not provide legal advice and is not responsible for users&apos; regulatory compliance.</p>
            </div>
          </section>

          {/* Suspension */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">12. Suspension &amp; Termination</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>MigRent may suspend or terminate your account at any time for:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Breach of these Terms or Community Guidelines</li>
                <li>Suspected fraud or illegal activity</li>
                <li>Attempts to circumvent platform fees</li>
                <li>Behaviour that endangers other users or the platform</li>
              </ul>
              <p>You may delete your account at any time through your account settings. Upon deletion, your data will be handled in accordance with our <Link href="/privacy-policy" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Privacy Policy</Link>.</p>
            </div>
          </section>

          {/* Dispute Resolution & Arbitration */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">13. Dispute Resolution &amp; Arbitration</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Any dispute, controversy, or claim arising out of or relating to these Terms or your use of the Platform shall be resolved as follows:</p>
              <div className="card-subtle p-4 rounded-xl space-y-2">
                <p><strong className="text-[var(--color-ink)]">Step 1 - Direct Resolution:</strong> Contact the other party directly to attempt resolution.</p>
                <p><strong className="text-[var(--color-ink)]">Step 2 - MigRent Mediation:</strong> If unresolved within 14 days, contact MigRent at <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a> for informal mediation assistance.</p>
                <p><strong className="text-[var(--color-ink)]">Step 3 - Binding Arbitration:</strong> If mediation fails within 30 days, any remaining dispute shall be finally resolved by binding arbitration administered by the Australian Centre for International Commercial Arbitration (ACICA) in accordance with ACICA Arbitration Rules. The seat of arbitration shall be Sydney, NSW. The language of arbitration shall be English.</p>
              </div>
              <p>To the extent permitted by law, you agree to waive any right to participate in a class action, representative proceeding, or class-wide arbitration. See our <Link href="/support-disputes" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Dispute Resolution</Link> page for full details.</p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">14. Governing Law</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>These Terms are governed by and construed in accordance with the laws of New South Wales, Australia, without regard to conflict of law principles. Subject to the arbitration clause above, any disputes shall be subject to the exclusive jurisdiction of the courts of New South Wales.</p>
            </div>
          </section>

          {/* Severability */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">15. Severability</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such invalidity shall not affect the remaining provisions, which shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the original intent.</p>
            </div>
          </section>

          {/* Changes */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">16. Changes to Terms</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>We may update these Terms from time to time. We will notify users of material changes via email or a notice on the platform. Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">17. Contact</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed">
              <div className="card-subtle p-4 rounded-xl space-y-1">
                <p className="font-semibold text-[var(--color-ink)]">MigRent</p>
                <p>ABN: 22 669 566 941</p>
                <p>Email: <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a></p>
                <p>Location: Sydney, Australia</p>
              </div>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>This document is for informational purposes and constitutes the binding terms between you and MigRent. MigRent recommends that users seek independent legal advice regarding their own obligations under applicable tenancy and rental laws. Last reviewed by MigRent: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-primary-50)] to-[var(--color-primary-100)] dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary)]/5 border-[var(--color-primary-100)] dark:border-[var(--color-line)] text-center">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Questions about our terms?</h3>
            <p className="text-sm text-[var(--color-ink-2)] mb-4">Our team is happy to clarify anything.</p>
            <Link href="/contact">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                Contact Us
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
