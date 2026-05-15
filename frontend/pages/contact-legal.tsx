import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";

const toc = [
  { id: "contact-info", label: "Legal contact information" },
  { id: "inquiry-types", label: "Types of legal inquiries" },
  { id: "governing-law", label: "Governing law" },
  { id: "arbitration", label: "Arbitration process" },
  { id: "about-acica", label: "About ACICA" },
  { id: "legal-docs", label: "Our legal documents" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function ContactLegal() {
  return (
    <PolicyLayout
      family="legal"
      eyebrow="Legal"
      title="Legal Contact and Arbitration"
      lede="Contact MigRent for legal inquiries, formal notices, or arbitration-related correspondence."
      lastUpdated="March 2026"
      metaTitle="Legal Contact & Arbitration | MigRent AI"
      metaDescription="Contact MigRent AI for legal inquiries, arbitration details, and governing law information."
      toc={toc}
      related={[
        { href: "/terms-of-service", label: "Terms of Service", description: "The rules that apply when you use MigRent" },
        { href: "/privacy-policy", label: "Privacy Policy", description: "How we handle your data" },
        { href: "/support-disputes", label: "Dispute Resolution", description: "What to do if something goes wrong" },
        { href: "/abn-terms", label: "ABN and Business Details", description: "Business and fee information" },
      ]}
    >
      <PolicySection id="contact-info" number={1} title="Legal Contact Information">
        <p>For legal inquiries, formal notices, or arbitration-related correspondence, contact:</p>
        <div className="card-subtle p-5 rounded-xl space-y-2 not-prose">
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-base">MigRent AI - Legal</p>
          <p className="text-sm"><strong>ABN:</strong> 22 669 566 941</p>
          <p className="text-sm"><strong>Email:</strong> <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a></p>
          <p className="text-sm"><strong>Subject line for legal matters:</strong> &quot;Legal Notice&quot; or &quot;Arbitration&quot;</p>
          <p className="text-sm"><strong>Location:</strong> Sydney, New South Wales, Australia</p>
        </div>
        <p>We aim to acknowledge legal correspondence within 5 business days.</p>
      </PolicySection>

      <PolicySection
        id="inquiry-types"
        number={2}
        title="Types of Legal Inquiries"
        summary="Use the listed subject lines for faster routing - especially for privacy requests, discrimination reports, and arbitration."
      >
        <p>Use the following subject lines for faster routing:</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Type</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Subject Line</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
      </PolicySection>

      <PolicySection id="governing-law" number={3} title="Governing Law">
        <p>All legal matters relating to MigRent AI are governed by:</p>
        <div className="card-subtle p-4 rounded-xl space-y-2 not-prose">
          <p className="text-sm"><strong className="text-slate-800 dark:text-slate-200">Governing law:</strong> Laws of New South Wales, Australia</p>
          <p className="text-sm"><strong className="text-slate-800 dark:text-slate-200">Jurisdiction:</strong> Courts of New South Wales (subject to arbitration clause)</p>
          <p className="text-sm"><strong className="text-slate-800 dark:text-slate-200">Applicable legislation:</strong> Australian Consumer Law, Privacy Act 1988 (Cth), Anti-Discrimination Act 1977 (NSW), and applicable state tenancy legislation</p>
        </div>
      </PolicySection>

      <PolicySection
        id="arbitration"
        number={4}
        title="Arbitration Process"
        summary="Disputes that can't be resolved directly or via MigRent mediation go to binding ACICA arbitration in Sydney."
      >
        <p>As set out in our <Link href="/terms-of-service" className={accent}>Terms of Service</Link> (section 13) and <Link href="/support-disputes" className={accent}>Dispute Resolution</Link> page, disputes that cannot be resolved through direct communication or MigRent mediation are subject to binding arbitration.</p>
        <div className="card-subtle p-4 rounded-xl space-y-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Arbitration Details</h3>
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
        <p>Before commencing arbitration, parties must have completed Steps 1 and 2 of the dispute resolution process (direct resolution and MigRent mediation). See <Link href="/support-disputes" className={accent}>full dispute resolution process</Link>.</p>
      </PolicySection>

      <PolicySection id="about-acica" number={5} title="About ACICA">
        <p>The Australian Centre for International Commercial Arbitration (ACICA) is Australia&apos;s leading international arbitration institution. It provides neutral, efficient, and cost-effective dispute resolution services.</p>
        <p>For more information about ACICA and its rules, visit <a href="https://acica.org.au" target="_blank" rel="noopener noreferrer" className={accent}>acica.org.au</a>.</p>
      </PolicySection>

      <PolicySection id="legal-docs" number={6} title="Our Legal Documents">
        <p>For reference, our complete legal documentation:</p>
        <ul className="space-y-2">
          <li><Link href="/terms-of-service" className={accent}>Terms of Service</Link></li>
          <li><Link href="/privacy-policy" className={accent}>Privacy Policy</Link></li>
          <li><Link href="/disclaimer" className={accent}>Platform Disclaimer</Link></li>
          <li><Link href="/no-agency" className={accent}>No Agency Disclosure</Link></li>
          <li><Link href="/anti-discrimination" className={accent}>Fair Housing Policy</Link></li>
          <li><Link href="/cookie-policy" className={accent}>Cookie Policy</Link></li>
          <li><Link href="/abn-terms" className={accent}>ABN and Business Details</Link></li>
        </ul>
        <p className="text-xs text-slate-400 dark:text-slate-500">MigRent does not provide legal advice. For legal matters, seek independent advice from a qualified Australian lawyer. Last reviewed: March 2026.</p>
      </PolicySection>
    </PolicyLayout>
  );
}
