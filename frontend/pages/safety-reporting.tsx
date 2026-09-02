import Link from "next/link";
import SEOHead from "../components/SEOHead";
import { motion } from "framer-motion";

export default function SafetyReporting() {
  return (
    <>
      <SEOHead title="Safety &amp; Reporting" description="Report unsafe listings, scams, or incidents on MigRent. Learn about our safety measures and how to stay safe." />

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-500)]/10 border border-[var(--color-danger-500)]/20 dark:border-[var(--color-line)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-danger-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                Safety &amp; Reporting
              </h1>
              <p className="text-sm text-[var(--color-ink-3)] mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Emergency */}
          <section className="card p-6 rounded-2xl space-y-3 border-l-4 border-l-red-500">
            <h2 className="text-lg font-bold text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]">Emergency?</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>If you are in <strong>immediate danger</strong>, call <strong>000</strong> (Triple Zero) for Police, Fire, or Ambulance. MigRent is not an emergency service.</p>
              <div className="card-subtle p-4 rounded-xl space-y-1">
                <p><strong>Emergency:</strong> 000 (Police, Fire, Ambulance)</p>
                <p><strong>Police non-emergency:</strong> 131 444 (Police Assistance Line)</p>
                <p><strong>Crime Stoppers:</strong> 1800 333 000 (anonymous tip line)</p>
              </div>
            </div>
          </section>

          {/* What to Report */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">What to Report to MigRent</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
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
            </div>
          </section>

          {/* How to Report */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">How to Report</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-4">
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-[var(--color-ink)] mb-2">Option 1: Email</h3>
                <p>Send an email to <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a> with the subject &quot;Safety Report&quot;. Include:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Your account email</li>
                  <li>The listing or user you are reporting</li>
                  <li>A description of the issue</li>
                  <li>Screenshots or evidence (if available)</li>
                </ul>
              </div>
              <div className="card-subtle p-4 rounded-xl">
                <h3 className="font-semibold text-[var(--color-ink)] mb-2">Option 2: In-Platform Reporting</h3>
                <p>Use the report button on any listing or user profile to flag content directly. You can add a description of the issue.</p>
              </div>
            </div>
          </section>

          {/* Response Times */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Response Times</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-line)]">
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Report Type</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Response Time</th>
                      <th className="text-left py-3 px-3 font-semibold text-[var(--color-ink)]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)] dark:divide-[var(--color-line)]">
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]">Immediate safety threat</td>
                      <td className="py-2.5 px-3">Within 4 hours</td>
                      <td className="py-2.5 px-3">Listing removed, account suspended pending review</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]">Scam or fraud</td>
                      <td className="py-2.5 px-3">Within 24 hours</td>
                      <td className="py-2.5 px-3">Listing flagged, investigation initiated</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)]">Harassment or discrimination</td>
                      <td className="py-2.5 px-3">Within 48 hours</td>
                      <td className="py-2.5 px-3">Review of messages, warning or suspension</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[var(--color-ink-2)]">Policy violation</td>
                      <td className="py-2.5 px-3">Within 5 business days</td>
                      <td className="py-2.5 px-3">Review and appropriate action</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Safety Tips */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Safety Tips</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
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
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>MigRent is an introduction service and does not guarantee user safety. Users are responsible for their own due diligence. For emergencies, always call 000. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-danger-50)] to-[var(--color-danger-50)] dark:from-[var(--color-danger-500)]/10 dark:to-[var(--color-surface)] border-[var(--color-danger-500)]/30 dark:border-[var(--color-line)] text-center">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Report something now</h3>
            <p className="text-sm text-[var(--color-ink-2)] mb-4">Your reports help keep the MigRent community safe.</p>
            <a href="mailto:migrentau@gmail.com?subject=Safety%20Report">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                Email Safety Report
              </motion.span>
            </a>
          </div>
        </motion.div>
      </div>
    </>
  );
}
