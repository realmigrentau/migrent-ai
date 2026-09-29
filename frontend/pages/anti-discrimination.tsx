import SEOHead from "../components/SEOHead";
import LegalLayout from "../components/site/LegalLayout";

export default function AntiDiscrimination() {
  return (
    <>
      <SEOHead title="Fair Housing Policy" description="Migrent Fair Housing Policy - our commitment to anti-discrimination and equal access to accommodation." />

      <LegalLayout title="Fair Housing Policy" note="Last updated: March 2026">

        <div className="space-y-8">
          {/* Commitment */}
          <section className="card p-6 rounded-2xl space-y-3 border-l-4 border-l-pink-500">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Our Commitment</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Migrent is committed to providing a platform free from discrimination. As a service that connects migrants with accommodation, we take anti-discrimination obligations seriously. All users must comply with Australian anti-discrimination laws.</p>
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
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Prohibited Conduct on Migrent</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>The following are strictly prohibited on Migrent:</p>
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
              <p>If you experience discrimination on Migrent:</p>
              <div className="card-subtle p-4 rounded-xl space-y-2">
                <p><strong className="text-[var(--color-ink)]">1. Report to Migrent:</strong> Email <a href="mailto:migrentau@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a> with subject &quot;Discrimination Report.&quot; Include screenshots and details. We will investigate within 48 hours.</p>
                <p><strong className="text-[var(--color-ink)]">2. Australian Human Rights Commission:</strong> You can lodge a formal complaint at <a href="https://humanrights.gov.au/complaints" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">humanrights.gov.au</a></p>
                <p><strong className="text-[var(--color-ink)]">3. State anti-discrimination body:</strong> Each state has its own body (e.g., Anti-Discrimination NSW, Victorian Equal Opportunity and Human Rights Commission)</p>
              </div>
            </div>
          </section>

          {/* Consequences */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Consequences</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Users found to have engaged in discriminatory conduct on Migrent may face:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Immediate removal of discriminatory listing content</li>
                <li>Warning issued to the user&apos;s account</li>
                <li>Temporary or permanent account suspension</li>
                <li>Reporting to relevant anti-discrimination authorities</li>
              </ul>
              <p>Migrent has zero tolerance for discrimination, particularly against migrants and people from diverse backgrounds.</p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <div className="card-subtle p-4 rounded-xl text-xs text-[var(--color-ink-3)] leading-relaxed">
            <p>This policy is for informational purposes. For specific legal advice regarding discrimination, contact the Australian Human Rights Commission or a qualified lawyer. Last reviewed: March 2026.</p>
          </div>

        </div>
      </LegalLayout>
    </>
  );
}
