import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";

const toc = [
  { id: "introduction", label: "Introduction" },
  { id: "information-we-collect", label: "Information we collect" },
  { id: "how-we-use", label: "How we use your information" },
  { id: "third-parties", label: "Third-party services" },
  { id: "data-sharing", label: "Data sharing with users" },
  { id: "data-retention", label: "Data retention" },
  { id: "your-rights", label: "Your rights" },
  { id: "gdpr", label: "GDPR rights" },
  { id: "cookies", label: "Cookies and tracking" },
  { id: "security", label: "Security" },
  { id: "contact", label: "Contact" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function PrivacyPolicy() {
  return (
    <PolicyLayout
      family="legal"
      eyebrow="Legal"
      title="Privacy Policy"
      lede="How we collect, use, and protect your data. Compliant with the Australian Privacy Principles and applicable GDPR provisions."
      lastUpdated="March 2026"
      metaTitle="Privacy Policy | MigRent AI"
      metaDescription="MigRent AI Privacy Policy - how we collect, use, and protect your data. Australian Privacy Principles and GDPR compliant."
      toc={toc}
      related={[
        { href: "/terms-of-service", label: "Terms of Service", description: "The rules that apply when you use MigRent" },
        { href: "/cookie-policy", label: "Cookie Policy", description: "What cookies we use and why" },
        { href: "/no-agency", label: "No Agency Disclosure", description: "What MigRent is and isn't" },
        { href: "/contact-legal", label: "Legal Contact", description: "Reach our legal team" },
      ]}
    >
      <PolicySection id="introduction" number={1} title="Introduction">
        <p>MigRent AI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at migrent-ai.vercel.app.</p>
        <p>MigRent AI operates under ABN 22 669 566 941 and is based in Sydney, Australia. We comply with the Australian Privacy Act 1988 (Cth), the Australian Privacy Principles (APPs), and applicable GDPR provisions for users located in the European Economic Area (EEA).</p>
        <p>MigRent AI is an online introduction service only. We facilitate connections between room owners and accommodation seekers. We do not collect rent, bonds, or manage tenancy agreements.</p>
      </PolicySection>

      <PolicySection id="information-we-collect" number={2} title="Information We Collect">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Account Information</h3>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Email address (required for account creation)</li>
            <li>Legal name and preferred name (collected during onboarding)</li>
            <li>Residential address, suburb, city, and postcode</li>
            <li>Phone number (validated for Australian numbers)</li>
            <li>Profile information including bio, preferences, and role (seeker or owner)</li>
            <li>Profile photo (if uploaded)</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Listing &amp; Search Data</h3>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Property listing details (address, description, photos, pricing)</li>
            <li>Search preferences and filters</li>
            <li>Saved listings and wishlist items</li>
            <li>Messages exchanged between users on the platform</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Verification Data</h3>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Identity verification status (pass/fail, not raw documents)</li>
            <li>Visa status verification metadata</li>
            <li>Verification completion timestamps</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Technical &amp; Usage Data</h3>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Device type, browser, and operating system</li>
            <li>IP address and approximate location</li>
            <li>Pages visited, features used, and session duration</li>
            <li>Referral source and search terms</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Payment Data</h3>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Payment metadata (transaction ID, amount, date) via Stripe</li>
            <li>We do not store full credit card numbers - all payment processing is handled by Stripe</li>
          </ul>
        </div>
      </PolicySection>

      <PolicySection id="how-we-use" number={3} title="How We Use Your Information">
        <ul className="list-disc list-inside space-y-1.5">
          <li>To operate the MigRent platform and provide our matching services</li>
          <li>To create and manage your account</li>
          <li>To facilitate communication between seekers and owners</li>
          <li>To process platform fees via Stripe</li>
          <li>To send transactional emails via Resend (account confirmations, deal notifications, receipts)</li>
          <li>To verify user identity and visa status through third-party providers</li>
          <li>To improve our AI matching algorithms and platform experience</li>
          <li>To send important service notifications (account, payment, safety)</li>
          <li>To detect and prevent fraud, abuse, or violations of our Terms</li>
          <li>To comply with legal obligations under Australian law</li>
        </ul>
      </PolicySection>

      <PolicySection id="third-parties" number={4} title="Third-Party Services">
        <p>We use the following third-party services that may process your data:</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Service</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Purpose</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Data Shared</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-medium">Supabase</td>
                <td className="py-2.5 px-3">Database hosting &amp; authentication</td>
                <td className="py-2.5 px-3">Account data, profile data</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Stripe</td>
                <td className="py-2.5 px-3">Payment processing</td>
                <td className="py-2.5 px-3">Payment metadata (no full card numbers)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Resend</td>
                <td className="py-2.5 px-3">Transactional emails</td>
                <td className="py-2.5 px-3">Email address, name</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Vercel</td>
                <td className="py-2.5 px-3">Website hosting &amp; analytics</td>
                <td className="py-2.5 px-3">Anonymous usage statistics</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">hCaptcha</td>
                <td className="py-2.5 px-3">Bot prevention during sign-up</td>
                <td className="py-2.5 px-3">Browser metadata</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Each provider operates under their own privacy policy and we only share the minimum data necessary for them to provide their services.</p>
      </PolicySection>

      <PolicySection
        id="data-sharing"
        number={5}
        title="Data Sharing with Other Users"
        summary="Only your public profile (name, photo, bio, preferences) is visible to other users. Your contact details stay private."
      >
        <p>When you use MigRent, certain profile information is visible to other users to facilitate connections:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Public profile:</strong> Preferred name, profile photo, bio, preferences, and verification status</li>
          <li><strong>Listing details:</strong> Property information, photos, pricing (for owners)</li>
          <li><strong>Messages:</strong> Content you send to other users via our messaging system</li>
        </ul>
        <p>Your legal name, residential address, email address, and phone number are <strong>not</strong> shared with other users unless you choose to share them directly.</p>
      </PolicySection>

      <PolicySection id="data-retention" number={6} title="Data Retention">
        <p>We retain your personal information according to the following schedule:</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Data Type</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Retention Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-3">Account and profile data</td>
                <td className="py-2.5 px-3">While account is active + 30 days after deletion request</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">Financial and transaction records</td>
                <td className="py-2.5 px-3 font-medium">7 years (Australian tax law requirement)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">Messages between users</td>
                <td className="py-2.5 px-3">While both accounts are active + 90 days</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">Verification records</td>
                <td className="py-2.5 px-3">While account is active + 12 months</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">Anonymised analytics data</td>
                <td className="py-2.5 px-3">Indefinitely (cannot identify you)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>If you delete your account, we will remove your personal data within 30 days, except where retention is required by law (e.g., financial records retained for 7 years for tax purposes under the Taxation Administration Act 1953).</p>
      </PolicySection>

      <PolicySection id="your-rights" number={7} title="Your Rights">
        <p>Under the Australian Privacy Act and Australian Privacy Principles (APPs), you have the right to:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Access (APP 12)</strong> - Request a copy of the personal data we hold about you</li>
          <li><strong>Correction (APP 13)</strong> - Request correction of inaccurate or incomplete data</li>
          <li><strong>Deletion</strong> - Request deletion of your personal data (subject to legal retention requirements)</li>
          <li><strong>Complaint</strong> - Lodge a complaint with the Office of the Australian Information Commissioner (OAIC) if you believe we have breached the APPs</li>
        </ul>
        <p>To exercise any of these rights, contact us at <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a>. We will respond within 30 days.</p>
      </PolicySection>

      <PolicySection id="gdpr" number={8} title="GDPR Rights (EU/EEA Users)">
        <p>If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR). As MigRent serves migrants who may originate from EU/EEA countries, we extend these protections:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Right to Portability</strong> - Request your data in a machine-readable format (JSON or CSV)</li>
          <li><strong>Right to Erasure</strong> - Request deletion of all personal data (&quot;right to be forgotten&quot;)</li>
          <li><strong>Right to Restrict Processing</strong> - Request that we limit how we use your data</li>
          <li><strong>Right to Object</strong> - Object to processing of your data for specific purposes</li>
          <li><strong>Right to Withdraw Consent</strong> - Withdraw consent at any time where processing is based on consent</li>
        </ul>
        <div className="card-subtle p-4 rounded-xl">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Legal Basis for Processing (GDPR Article 6)</h3>
          <ul className="list-disc list-inside space-y-1.5">
            <li><strong>Contract:</strong> Processing necessary to provide our service (account, matching, messaging)</li>
            <li><strong>Legitimate Interest:</strong> Fraud prevention, platform security, service improvement</li>
            <li><strong>Legal Obligation:</strong> Tax record retention, regulatory compliance</li>
            <li><strong>Consent:</strong> Marketing communications (you may withdraw at any time)</li>
          </ul>
        </div>
        <p>For GDPR requests, contact <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a> with the subject line &quot;GDPR Request.&quot; We will respond within 30 days. You may also lodge a complaint with your local EU data protection authority.</p>
      </PolicySection>

      <PolicySection id="cookies" number={9} title="Cookies and Tracking">
        <p>We use essential cookies to maintain your session and preferences (such as dark mode and language). We use Vercel Analytics for anonymous usage statistics. We do not use advertising cookies or sell your data to advertisers.</p>
        <p>For more details, see our <Link href="/cookie-policy" className={accent}>Cookie Policy</Link>.</p>
      </PolicySection>

      <PolicySection id="security" number={10} title="Security">
        <p>We implement industry-standard security measures including:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Encryption in transit (TLS/HTTPS) for all data transfers</li>
          <li>Secure authentication via Supabase Auth with hCaptcha bot prevention</li>
          <li>Row Level Security (RLS) policies on all database tables</li>
          <li>Stripe PCI-DSS compliant payment processing</li>
          <li>Regular security reviews and access controls</li>
        </ul>
        <p>However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security. If you discover a vulnerability, please report it to <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a>.</p>
      </PolicySection>

      <PolicySection id="contact" number={11} title="Contact Us">
        <p>If you have questions about this Privacy Policy or wish to exercise your rights, contact us:</p>
        <div className="card-subtle p-5 rounded-xl space-y-1 not-prose">
          <p className="font-semibold text-slate-800 dark:text-slate-200">MigRent AI - Privacy Inquiries</p>
          <p className="text-sm">ABN: 22 669 566 941</p>
          <p className="text-sm">Email: <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a></p>
          <p className="text-sm">Location: Sydney, Australia</p>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">You may also contact the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className={accent}>www.oaic.gov.au</a> if you believe your privacy has been breached.</p>
      </PolicySection>
    </PolicyLayout>
  );
}
