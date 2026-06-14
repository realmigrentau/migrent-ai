import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function CodeOfConduct() {
  return (
    <>
      <Head>
        <title>NSW STRA Code of Conduct | MigRent AI</title>
        <meta name="description" content="Summary of the NSW Short-Term Rental Accommodation Code of Conduct and how it applies to MigRent users." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                STRA Code of Conduct
              </h1>
              <p className="text-sm text-[var(--color-ink-3)] mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Introduction */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">About the NSW STRA Code</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>New South Wales has a mandatory Code of Conduct for Short-Term Rental Accommodation (STRA) under the Fair Trading Regulation. This code applies to hosts, guests, and booking platforms operating in NSW.</p>
              <p>This page is a <strong>summary only</strong>. For the full official code, visit the <a href="https://www.nsw.gov.au/housing-and-construction/short-term-rental-accommodation" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">NSW Government STRA page</a>.</p>
              <p>MigRent is an introduction service. While some listings on MigRent may fall under STRA regulations, we inform all users of their obligations under the code.</p>
            </div>
          </section>

          {/* Host Obligations */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Host (Owner) Obligations</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>If your listing qualifies as STRA in NSW, as a host you must:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Register on the NSW STRA Register</strong> before listing your property</li>
                <li><strong>Fire safety:</strong> Ensure working smoke alarms on every level, provide a fire extinguisher, and display evacuation information</li>
                <li><strong>Maximum guests:</strong> Do not exceed the number of guests specified in your registration</li>
                <li><strong>Neighbour notification:</strong> Notify immediate neighbours that the property is used for STRA and provide a contact number for complaints</li>
                <li><strong>House rules:</strong> Provide written house rules to guests covering noise, parking, waste disposal, and use of common areas</li>
                <li><strong>Complaints handling:</strong> Respond to noise or nuisance complaints within a reasonable time</li>
                <li><strong>Day limits:</strong> 180 days per year maximum in Greater Sydney (when host is not present). Unlimited if host is present.</li>
                <li><strong>Insurance:</strong> Consider appropriate insurance cover for STRA activity</li>
              </ul>
            </div>
          </section>

          {/* Guest Obligations */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Guest (Seeker) Obligations</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>As a guest staying in STRA in NSW, you must:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Follow house rules:</strong> Comply with all house rules provided by the host</li>
                <li><strong>Noise:</strong> Avoid unreasonable noise, especially between 10pm and 8am</li>
                <li><strong>Guest numbers:</strong> Do not exceed the maximum number of guests allowed</li>
                <li><strong>Property care:</strong> Treat the property with reasonable care and report any damage</li>
                <li><strong>Waste:</strong> Dispose of waste properly according to local council requirements</li>
                <li><strong>Neighbours:</strong> Respect the neighbourhood and the quiet enjoyment of neighbours</li>
              </ul>
            </div>
          </section>

          {/* Platform Obligations */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Booking Platform Obligations</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Under the NSW STRA framework, booking platforms must:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Verify that hosts display a valid STRA registration number (where applicable)</li>
                <li>Provide mechanisms for reporting code violations</li>
                <li>Cooperate with NSW Fair Trading investigations</li>
                <li>Remove listings upon government direction for serious or repeated violations</li>
              </ul>
              <p>MigRent complies with these obligations. If you believe a listing violates the STRA Code of Conduct, please <Link href="/safety-reporting" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">report it here</Link>.</p>
            </div>
          </section>

          {/* Penalties */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Penalties for Non-Compliance</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Failure to comply with the NSW STRA Code of Conduct may result in:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Penalty notices from NSW Fair Trading</li>
                <li>Exclusion from the STRA Register (which prevents listing)</li>
                <li>On MigRent: listing removal and account suspension</li>
              </ul>
            </div>
          </section>

          {/* Other States */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Other States</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>This page focuses on NSW as it has the most comprehensive STRA framework. Other states have varying levels of STRA regulation. See our <Link href="/rental-laws" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Australian Rental Laws Guide</Link> for an overview of each state.</p>
              <p>Regardless of your state, MigRent expects all users to comply with local laws and our <Link href="/rules-community-guidelines" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">Community Guidelines</Link>.</p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>This is a summary of the NSW STRA Code of Conduct for informational purposes only. It does not constitute legal advice. For the official code, visit nsw.gov.au. Laws and regulations may change - always verify current requirements. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-accent-50)] to-[var(--color-accent-soft)]/50 dark:from-[var(--color-accent)]/10 dark:to-[var(--color-surface)] border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] text-center">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Report a code violation?</h3>
            <p className="text-sm text-[var(--color-ink-2)] mb-4">Help us maintain a safe and compliant community.</p>
            <Link href="/safety-reporting">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                Report an Issue
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
