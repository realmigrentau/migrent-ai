import Link from "next/link";
import SEOHead from "../components/SEOHead";
import LegalLayout from "../components/site/LegalLayout";

export default function ContactLegal() {
  return (
    <>
      <SEOHead title="Legal Contact &amp; Arbitration" description="Contact Migrent for legal inquiries, arbitration details, and governing law information." />

      <LegalLayout title="Legal Contact & Arbitration" note="Last updated: March 2026">

        <div className="space-y-8">
          {/* Contact Details */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Legal Contact Information</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>For legal inquiries, formal notices, or arbitration-related correspondence, contact:</p>
              <div className="card-subtle p-4 rounded-xl space-y-2">
                <p className="font-semibold text-[var(--color-ink)] text-base">Migrent - Legal</p>
                <p><strong>ABN:</strong> 22 669 566 941</p>
                <p><strong>Email:</strong> <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a></p>
                <p><strong>Subject line for legal matters:</strong> &quot;Legal Notice&quot; or &quot;Arbitration&quot;</p>
                <p><strong>Location:</strong> Australia (registered address to be published once confirmed)</p>
              </div>
              <p>We aim to acknowledge legal correspondence within 5 business days.</p>
            </div>
          </section>

          {/* Types of Legal Inquiries */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Types of Legal Inquiries</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Use the following subject lines for faster routing:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-line)]">
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Type</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Subject Line</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Response Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)] dark:divide-[var(--color-line)]">
                    <tr>
                      <td className="py-2.5 px-3">Privacy / data requests (GDPR, APPs)</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Privacy Request&quot;</td>
                      <td className="py-2.5 px-3">30 days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Formal legal notice</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Legal Notice&quot;</td>
                      <td className="py-2.5 px-3">5 business days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Arbitration commencement</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Arbitration&quot;</td>
                      <td className="py-2.5 px-3">5 business days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Discrimination report</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Discrimination Report&quot;</td>
                      <td className="py-2.5 px-3">48 hours</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">Copyright / DMCA takedown</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Copyright Notice&quot;</td>
                      <td className="py-2.5 px-3">5 business days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">General legal question</td>
                      <td className="py-2.5 px-3 font-mono text-xs">&quot;Legal Inquiry&quot;</td>
                      <td className="py-2.5 px-3">10 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Governing Law</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>All legal matters relating to Migrent are governed by:</p>
              <div className="card-subtle p-4 rounded-xl space-y-2">
                <p><strong className="text-[var(--color-ink)]">Governing law:</strong> Laws of New South Wales, Australia</p>
                <p><strong className="text-[var(--color-ink)]">Jurisdiction:</strong> Courts of New South Wales (subject to arbitration clause)</p>
                <p><strong className="text-[var(--color-ink)]">Applicable legislation:</strong> Australian Consumer Law, Privacy Act 1988 (Cth), Anti-Discrimination Act 1977 (NSW), and applicable state tenancy legislation</p>
              </div>
            </div>
          </section>

          {/* Arbitration */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Arbitration Process</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>As set out in our <Link href="/terms-of-service" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Terms of Service</Link> (section 13) and <Link href="/support-disputes" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Dispute Resolution</Link> page, disputes that cannot be resolved through direct communication or Migrent mediation are subject to binding arbitration.</p>
              <div className="card-subtle p-4 rounded-xl space-y-2">
                <h3 className="font-semibold text-[var(--color-ink)]">Arbitration Details</h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li><strong>Administering body:</strong> Australian Centre for International Commercial Arbitration (ACICA)</li>
                  <li><strong>Rules:</strong> ACICA Arbitration Rules</li>
                  <li><strong>Seat:</strong> Sydney, New South Wales, Australia</li>
                  <li><strong>Language:</strong> English</li>
                  <li><strong>Number of arbitrators:</strong> One (1)</li>
                  <li><strong>Decision:</strong> Final and binding on both parties</li>
                  <li><strong>Costs:</strong> Each party bears their own costs unless the arbitrator orders otherwise</li>
                </ul>
              </div>
              <p>Before commencing arbitration, parties must have completed Steps 1 and 2 of the dispute resolution process (direct resolution and Migrent mediation). See <Link href="/support-disputes" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">full dispute resolution process</Link>.</p>
            </div>
          </section>

          {/* About ACICA */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">About ACICA</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>The Australian Centre for International Commercial Arbitration (ACICA) is Australia&apos;s leading international arbitration institution. It provides neutral, efficient, and cost-effective dispute resolution services.</p>
              <p>For more information about ACICA and its rules, visit <a href="https://acica.org.au" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">acica.org.au</a>.</p>
            </div>
          </section>

          {/* Legal Documents */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Our Legal Documents</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>For reference, our complete legal documentation:</p>
              <ul className="space-y-2">
                <li><Link href="/terms-of-service" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/disclaimer" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Platform Disclaimer</Link></li>
                <li><Link href="/how-renting-works#not-an-agent" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">No Agency Disclosure</Link></li>
                <li><Link href="/anti-discrimination" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Fair Housing Policy</Link></li>
                <li><Link href="/cookie-policy" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Cookie Policy</Link></li>
                <li><Link href="/abn-terms" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">ABN &amp; Business Details</Link></li>
              </ul>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>Migrent does not provide legal advice. For legal matters, seek independent advice from a qualified Australian lawyer. Last reviewed: March 2026.</p>
          </div>

        </div>
      </LegalLayout>
    </>
  );
}
