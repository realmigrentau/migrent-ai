import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function SupportDisputes() {
  return (
    <>
      <Head>
        <title>Dispute Resolution | MigRent AI</title>
        <meta name="description" content="MigRent AI dispute resolution process - how we handle complaints and disputes between users." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] dark:border-[var(--color-line)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                Dispute Resolution
              </h1>
              <p className="text-sm text-[var(--color-ink-3)] mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Introduction */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Our Approach</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>MigRent is an introduction service and is not a party to any arrangement between users. However, we want all users to have a positive experience. This page outlines the dispute resolution process for issues arising from or related to the MigRent platform.</p>
              <p>For disputes about tenancy arrangements (rent, bonds, property condition), please contact your state&apos;s Fair Trading or Residential Tenancies authority. See our <Link href="/rental-laws" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Rental Laws Guide</Link>.</p>
            </div>
          </section>

          {/* 3-Step Process */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">3-Step Dispute Resolution Process</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-4">
              {/* Step 1 */}
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-emerald-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-accent)] dark:text-[var(--color-accent)]">1</span>
                  <h3 className="font-semibold text-[var(--color-ink)]">Direct Resolution (0-14 days)</h3>
                </div>
                <p>Attempt to resolve the issue directly with the other user. Use MigRent&apos;s messaging system to communicate clearly and document your conversations. Many disputes can be resolved through good-faith discussion.</p>
              </div>

              {/* Step 2 */}
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-primary)]">2</span>
                  <h3 className="font-semibold text-[var(--color-ink)]">MigRent Mediation (14-30 days)</h3>
                </div>
                <p>If direct resolution fails, contact MigRent at <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a> with the subject &quot;Dispute&quot;. Include:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Your account email and the other user&apos;s profile name</li>
                  <li>A clear description of the issue</li>
                  <li>Screenshots or evidence (if applicable)</li>
                  <li>What resolution you are seeking</li>
                </ul>
                <p className="mt-2">MigRent will review the complaint within 5 business days and attempt informal mediation. We may contact both parties to understand the situation. Note: MigRent&apos;s mediation is voluntary and non-binding.</p>
              </div>

              {/* Step 3 */}
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-violet-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-primary)]">3</span>
                  <h3 className="font-semibold text-[var(--color-ink)]">Binding Arbitration (30+ days)</h3>
                </div>
                <p>If mediation does not resolve the dispute within 30 days, either party may submit the dispute to binding arbitration administered by the Australian Centre for International Commercial Arbitration (ACICA) in accordance with ACICA Arbitration Rules.</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Seat of arbitration: Sydney, New South Wales</li>
                  <li>Language: English</li>
                  <li>Number of arbitrators: One (1)</li>
                  <li>Governing law: Laws of New South Wales, Australia</li>
                </ul>
                <p className="mt-2">The arbitrator&apos;s decision is final and binding on both parties. Each party bears their own costs unless the arbitrator orders otherwise.</p>
              </div>
            </div>
          </section>

          {/* What MigRent Can Do */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">What MigRent Can Do</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>As part of our mediation process, MigRent may:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Review messages and activity related to the dispute</li>
                <li>Contact both parties for their side of the story</li>
                <li>Issue warnings or suspend accounts that violate our Terms</li>
                <li>Remove listings or content that violate our policies</li>
                <li>Provide platform usage data relevant to the dispute</li>
              </ul>
            </div>
          </section>

          {/* What MigRent Cannot Do */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">What MigRent Cannot Do</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>As an introduction service, MigRent cannot:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Enforce tenancy agreements or licences between users</li>
                <li>Order refunds of rent, bonds, or other payments between users</li>
                <li>Inspect properties or verify claims about property condition</li>
                <li>Provide legal advice or representation</li>
                <li>Act as a judge or make legally binding decisions</li>
              </ul>
              <p>For tenancy-specific disputes, contact your state&apos;s relevant tribunal (e.g., NSW Civil and Administrative Tribunal - NCAT).</p>
            </div>
          </section>

          {/* Platform Fee Disputes */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Platform Fee Disputes</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>For disputes specifically about MigRent platform fees ($99 owner fee or $19 seeker fee):</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Contact us at <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a> with subject &quot;Fee Dispute&quot;</li>
                <li>Include your Stripe receipt number and a description of the issue</li>
                <li>We will review and respond within 5 business days</li>
                <li>Refunds of platform fees are at MigRent&apos;s sole discretion</li>
              </ul>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>This dispute resolution process is part of MigRent&apos;s <Link href="/terms-of-service" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Terms of Service</Link>. MigRent recommends consulting a qualified lawyer for legal disputes. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-primary-50)] to-[var(--color-primary-100)] dark:from-[var(--color-primary)]/10 dark:to-[var(--color-surface)] border-[var(--color-primary-100)] dark:border-[var(--color-line)] text-center">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Need to report an issue?</h3>
            <p className="text-sm text-[var(--color-ink-2)] mb-4">Contact our team and we&apos;ll help where we can.</p>
            <Link href="/contact">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                Contact Support
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
