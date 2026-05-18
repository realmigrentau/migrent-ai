import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function Disclaimer() {
  return (
    <>
      <Head>
        <title>Platform Disclaimer | MigRent AI</title>
        <meta name="description" content="MigRent AI Platform Disclaimer - understand the limitations of our service and your responsibilities as a user." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Platform Disclaimer
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Key Disclaimer */}
          <section className="card p-6 rounded-2xl space-y-3 border-l-4 border-l-amber-500">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Important Notice</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent AI is an <strong>online introduction service only</strong>. We connect room owners with accommodation seekers. We do NOT:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Guarantee the condition, safety, legality, or suitability of any property</li>
                <li>Verify the accuracy of any listing, photo, or description</li>
                <li>Guarantee the identity, background, or intentions of any user</li>
                <li>Act as a real estate agent, property manager, or landlord</li>
                <li>Collect rent, bonds, or deposits on behalf of any party</li>
                <li>Create, manage, or enforce tenancy agreements</li>
              </ul>
            </div>
          </section>

          {/* Property Disclaimer */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Property Condition - &quot;As Is&quot;</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>All properties listed on MigRent are presented on an &quot;as is&quot; basis. MigRent does not inspect, verify, or warrant the condition of any property. This includes but is not limited to:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Structural integrity and building compliance</li>
                <li>Cleanliness, furnishings, and amenities</li>
                <li>Safety features (smoke alarms, fire exits, locks)</li>
                <li>Pest infestations or environmental hazards</li>
                <li>Compliance with local building and zoning codes</li>
                <li>Accuracy of listed room dimensions, photos, or descriptions</li>
              </ul>
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-[var(--color-primary)]">
                <p className="font-semibold text-[var(--color-primary)] dark:text-[var(--color-primary)]">You must inspect any property personally before entering into any arrangement. Never send money without first viewing the property in person.</p>
              </div>
            </div>
          </section>

          {/* User Interactions */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. User Interactions</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent is not responsible for:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Scams, fraud, or misrepresentation by any user</li>
                <li>Disputes between owners and seekers</li>
                <li>Injuries, property damage, or loss arising from any arrangement</li>
                <li>Harassment, discrimination, or illegal behaviour by users</li>
                <li>Breach of tenancy agreements or rental laws by any user</li>
              </ul>
              <p>While we provide verification tools and match scores to assist your decision-making, these are <strong>informational aids only</strong> and do not constitute guarantees of any kind.</p>
            </div>
          </section>

          {/* Financial Disclaimer */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Financial Disclaimer</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent charges flat platform fees only ($99 per deal for owners, $19 optional for seekers). We do not:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Collect, hold, or manage rent payments</li>
                <li>Collect, hold, or manage bonds or security deposits</li>
                <li>Take a percentage of any rent or deal amount</li>
                <li>Provide financial advice regarding rental arrangements</li>
                <li>Guarantee the financial reliability of any user</li>
              </ul>
              <p>All financial arrangements between owners and seekers are entirely their own responsibility.</p>
            </div>
          </section>

          {/* No Legal Advice */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. No Legal Advice</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Information provided on MigRent, including our <Link href="/rental-laws" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">rental laws guide</Link> and <Link href="/code-of-conduct" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">STRA code of conduct</Link>, is for general informational purposes only. It does not constitute legal advice. You should seek independent legal advice for your specific circumstances.</p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Limitation of Liability</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>To the maximum extent permitted by Australian law:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>MigRent excludes all liability for indirect, incidental, special, consequential, or punitive damages</li>
                <li>MigRent&apos;s total aggregate liability shall not exceed the platform fees you have paid in the preceding 12 months</li>
                <li>Users indemnify MigRent against all claims arising from their use of the platform or any arrangement made through it</li>
              </ul>
              <p>Nothing in this disclaimer excludes rights that cannot be excluded under Australian Consumer Law.</p>
            </div>
          </section>

          {/* Your Responsibilities */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Your Responsibilities</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>As a user of MigRent, you are responsible for:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Conducting your own due diligence on properties and users</li>
                <li>Personally inspecting properties before committing</li>
                <li>Creating your own tenancy agreements and collecting your own bonds</li>
                <li>Complying with all applicable laws, including rental laws and anti-discrimination laws</li>
                <li>Reporting suspicious activity, scams, or unsafe listings to MigRent</li>
              </ul>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            <p>This disclaimer is part of MigRent&apos;s <Link href="/terms-of-service" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Terms of Service</Link>. For full legal terms, please refer to our Terms of Service. MigRent recommends consulting a qualified Australian lawyer for specific legal advice. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-[var(--color-primary-soft)] from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-600/5 border-amber-200 dark:border-amber-500/20 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Have questions?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Our team can help clarify our platform policies.</p>
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
