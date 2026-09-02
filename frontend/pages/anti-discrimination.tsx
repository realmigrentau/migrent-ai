import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function AntiDiscrimination() {
  return (
    <>
      <Head>
        <title>Fair Housing Policy | MigRent</title>
        <meta name="description" content="MigRent Fair Housing Policy - our commitment to anti-discrimination and equal access to accommodation." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-line-2)] dark:border-[var(--color-primary)]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                Fair Housing Policy
              </h1>
              <p className="text-sm text-[var(--color-ink-3)] mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Commitment */}
          <section className="card p-6 rounded-2xl space-y-3 border-l-4 border-l-pink-500">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Our Commitment</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>MigRent is committed to providing a platform free from discrimination. As a service that connects migrants with accommodation, we take anti-discrimination obligations seriously. All users must comply with Australian anti-discrimination laws.</p>
            </div>
          </section>

          {/* Protected Attributes */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Protected Attributes Under Australian Law</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Under the Racial Discrimination Act 1975, Sex Discrimination Act 1984, Disability Discrimination Act 1992, Age Discrimination Act 2004, and state-level anti-discrimination legislation, it is unlawful to discriminate in accommodation based on:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Race, colour, or ethnic origin",
                  "National origin or nationality",
                  "Sex or gender identity",
                  "Sexual orientation",
                  "Marital or relationship status",
                  "Pregnancy or breastfeeding",
                  "Age",
                  "Disability (physical or mental)",
                  "Religion or religious belief",
                  "Political opinion",
                  "Social origin",
                  "Visa or immigration status",
                ].map((attr) => (
                  <div key={attr} className="card-subtle p-3 rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--color-primary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
                    </svg>
                    <span className="text-sm">{attr}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Prohibited Conduct */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Prohibited Conduct on MigRent</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>The following are strictly prohibited on MigRent:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Refusing to list or offer accommodation</strong> to a person based on a protected attribute</li>
                <li><strong>Listing discriminatory preferences</strong> in property descriptions (e.g., &quot;no students from [country]&quot;, &quot;females only&quot; without lawful exemption)</li>
                <li><strong>Discriminatory messaging</strong> - refusing to respond or being hostile based on a user&apos;s profile characteristics</li>
                <li><strong>Different terms or conditions</strong> based on protected attributes (e.g., charging more rent based on nationality)</li>
                <li><strong>Harassment or vilification</strong> based on any protected attribute</li>
              </ul>
            </div>
          </section>

          {/* Lawful Exceptions */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Lawful Exceptions</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Australian anti-discrimination law does recognise some limited exceptions in shared accommodation settings:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Shared living spaces:</strong> If you are sharing your own home and will live with the other person, some states allow gender preferences for housemates</li>
                <li><strong>Strata by-laws:</strong> Some residential buildings have rules about maximum occupancy or use</li>
                <li><strong>Religious accommodation:</strong> Limited exemptions may exist for accommodation operated by religious bodies</li>
              </ul>
              <p>These exceptions are narrow and do not permit blanket discrimination. If you are unsure, seek legal advice.</p>
            </div>
          </section>

          {/* How to Report */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Reporting Discrimination</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>If you experience discrimination on MigRent:</p>
              <div className="card-subtle p-4 rounded-xl space-y-2">
                <p><strong className="text-[var(--color-ink)]">1. Report to MigRent:</strong> Email <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a> with subject &quot;Discrimination Report.&quot; Include screenshots and details. We will investigate within 48 hours.</p>
                <p><strong className="text-[var(--color-ink)]">2. Australian Human Rights Commission:</strong> You can lodge a formal complaint at <a href="https://humanrights.gov.au/complaints" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">humanrights.gov.au</a></p>
                <p><strong className="text-[var(--color-ink)]">3. State anti-discrimination body:</strong> Each state has its own body (e.g., Anti-Discrimination NSW, Victorian Equal Opportunity and Human Rights Commission)</p>
              </div>
            </div>
          </section>

          {/* Consequences */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Consequences</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Users found to have engaged in discriminatory conduct on MigRent may face:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Immediate removal of discriminatory listing content</li>
                <li>Warning issued to the user&apos;s account</li>
                <li>Temporary or permanent account suspension</li>
                <li>Reporting to relevant anti-discrimination authorities</li>
              </ul>
              <p>MigRent has zero tolerance for discrimination, particularly against migrants and people from diverse backgrounds.</p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>This policy is for informational purposes. For specific legal advice regarding discrimination, contact the Australian Human Rights Commission or a qualified lawyer. Last reviewed: March 2026.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-[var(--color-primary-soft)] from-[var(--color-primary-50)] to-[var(--color-primary-100)] dark:from-[var(--color-primary)]/10 dark:to-[var(--color-surface)] border-[var(--color-primary-soft)] dark:border-[var(--color-primary)]/20 text-center">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Experienced discrimination?</h3>
            <p className="text-sm text-[var(--color-ink-2)] mb-4">We take every report seriously. Let us know.</p>
            <a href="mailto:migrentau@gmail.com?subject=Discrimination%20Report">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                Report Discrimination
              </motion.span>
            </a>
          </div>
        </motion.div>
      </div>
    </>
  );
}
