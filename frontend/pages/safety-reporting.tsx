import Link from "next/link";
import PolicyLayout from "../components/legal/PolicyLayout";
import PolicySection from "../components/legal/PolicySection";
import Callout from "../components/legal/Callout";

const toc = [
  { id: "emergency", label: "Emergency contacts" },
  { id: "what-to-report", label: "What to report to MigRent" },
  { id: "how-to-report", label: "How to report" },
  { id: "response-times", label: "Response times" },
  { id: "safety-tips", label: "Safety tips" },
];

const accent = "text-rose-500 hover:text-rose-600 underline underline-offset-2";

export default function SafetyReporting() {
  return (
    <PolicyLayout
      family="trust"
      eyebrow="Trust and safety"
      title="Safety and Reporting"
      lede="How to report unsafe listings, scams, harassment, or incidents on MigRent - and how quickly we respond."
      lastUpdated="March 2026"
      metaTitle="Safety and Reporting | MigRent AI"
      metaDescription="Report unsafe listings, scams, or incidents on MigRent AI. Learn about our safety measures and how to stay safe."
      toc={toc}
      related={[
        { href: "/safety-verification", label: "Safety and Verification", description: "Verification tiers and safety tools" },
        { href: "/rules-community-guidelines", label: "Community Guidelines", description: "Standards for owners and seekers" },
        { href: "/support-disputes", label: "Dispute Resolution", description: "How disputes are handled" },
        { href: "/anti-discrimination", label: "Fair Housing Policy", description: "Reporting discrimination" },
      ]}
    >
      <Callout variant="critical" title="In an emergency, call 000">
        <p>If you are in <strong>immediate danger</strong>, call <strong>000</strong> (Triple Zero) for Police, Fire, or Ambulance. MigRent is not an emergency service.</p>
      </Callout>

      <PolicySection id="emergency" title="Emergency and Support Contacts">
        <p>For urgent safety issues, contact the appropriate service directly:</p>
        <div className="card-subtle p-4 rounded-xl space-y-1.5 not-prose text-sm">
          <p><strong className="text-slate-800 dark:text-slate-200">Emergency:</strong> 000 (Police, Fire, Ambulance)</p>
          <p><strong className="text-slate-800 dark:text-slate-200">Police non-emergency:</strong> 131 444 (Police Assistance Line)</p>
          <p><strong className="text-slate-800 dark:text-slate-200">Crime Stoppers:</strong> 1800 333 000 (anonymous tip line)</p>
          <p><strong className="text-slate-800 dark:text-slate-200">Lifeline (24/7 crisis support):</strong> 13 11 14</p>
          <p><strong className="text-slate-800 dark:text-slate-200">1800RESPECT (family and sexual violence):</strong> 1800 737 732</p>
        </div>
      </PolicySection>

      <PolicySection id="what-to-report" title="What to Report to MigRent">
        <p>Please report any of the following to MigRent:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li><strong>Scam listings:</strong> Fake properties, requests for advance payment without inspection, stolen photos</li>
          <li><strong>Fraudulent users:</strong> Fake profiles, identity fraud, impersonation</li>
          <li><strong>Unsafe properties:</strong> Listings that appear to be unsafe, illegal, or not as described</li>
          <li><strong>Harassment or threats:</strong> Any threatening, abusive, or harassing messages from other users</li>
          <li><strong>Discrimination:</strong> Refusal to deal based on race, gender, religion, disability, or other protected attributes</li>
          <li><strong>STRA Code violations:</strong> Hosts operating without registration, exceeding guest limits, fire safety issues</li>
          <li><strong>Fee circumvention:</strong> Users attempting to complete deals outside the platform to avoid fees</li>
          <li><strong>Illegal activity:</strong> Drug use, property damage, or other criminal behaviour</li>
        </ul>
      </PolicySection>

      <PolicySection id="how-to-report" title="How to Report">
        <div className="card-subtle p-4 rounded-xl">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Option 1: Email</h3>
          <p>Send an email to <a href="mailto:migrentau@gmail.com" className={accent}>migrentau@gmail.com</a> with the subject &quot;Safety Report&quot;. Include:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Your account email</li>
            <li>The listing or user you are reporting</li>
            <li>A description of the issue</li>
            <li>Screenshots or evidence (if available)</li>
          </ul>
        </div>
        <div className="card-subtle p-4 rounded-xl mt-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Option 2: In-platform reporting</h3>
          <p>Use the report button on any listing or user profile to flag content directly. You can add a description of the issue.</p>
        </div>
      </PolicySection>

      <PolicySection id="response-times" title="Response Times">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Report type</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Response time</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-medium text-rose-600 dark:text-rose-400">Immediate safety threat</td>
                <td className="py-2.5 px-3">Within 4 hours</td>
                <td className="py-2.5 px-3">Listing removed, account suspended pending review</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-amber-600 dark:text-amber-400">Scam or fraud</td>
                <td className="py-2.5 px-3">Within 24 hours</td>
                <td className="py-2.5 px-3">Listing flagged, investigation initiated</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-blue-600 dark:text-blue-400">Harassment or discrimination</td>
                <td className="py-2.5 px-3">Within 48 hours</td>
                <td className="py-2.5 px-3">Review of messages, warning or suspension</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">Policy violation</td>
                <td className="py-2.5 px-3">Within 5 business days</td>
                <td className="py-2.5 px-3">Review and appropriate action</td>
              </tr>
            </tbody>
          </table>
        </div>
      </PolicySection>

      <PolicySection id="safety-tips" title="Safety Tips">
        <Callout variant="tip" title="Practical safety habits">
          <ul className="list-disc list-inside space-y-1.5">
            <li><strong>Always inspect in person</strong> before committing to any property</li>
            <li><strong>Never send money</strong> before viewing a property and meeting the owner</li>
            <li><strong>Meet in public</strong> for initial meetings when possible</li>
            <li><strong>Tell someone</strong> where you are going for property inspections</li>
            <li><strong>Use MigRent messaging</strong> to keep a record of all communications</li>
            <li><strong>Verify identity</strong> - check that the person matches their profile</li>
            <li><strong>Trust your instincts</strong> - if something feels wrong, walk away</li>
            <li><strong>Get everything in writing</strong> - rental agreements, bond receipts, condition reports</li>
          </ul>
        </Callout>
        <Callout variant="legal" title="Disclaimer">
          MigRent is an introduction service and does not guarantee user safety. Users are responsible for their own due diligence. For emergencies, always call 000. See our <Link href="/terms-of-service" className={accent}>Terms of Service</Link> for full details.
        </Callout>
      </PolicySection>
    </PolicyLayout>
  );
}
