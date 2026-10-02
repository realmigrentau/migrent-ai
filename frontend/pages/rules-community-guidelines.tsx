import SEOHead from "../components/SEOHead";
import LegalLayout from "../components/site/LegalLayout";

export default function RulesCommunityGuidelines() {
  return (
    <>
      <SEOHead title="Community Guidelines" description="Migrent community rules - listing standards, guest expectations, dispute resolution, and platform conduct." />

      <LegalLayout title="Community Guidelines" note="Rules for a safe and fair community">

        <div className="space-y-8">
          {/* Intro */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Our Community Standards</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Migrent is built on trust, respect, and transparency. These guidelines apply to all users - both owners and seekers. Violations may result in content removal, account suspension, or termination.</p>
            </div>
          </section>

          {/* General Rules */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">General Rules (All Users)</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Be truthful and accurate in your profile and all communications</li>
                <li>Treat all users with respect regardless of background, nationality, religion, or gender</li>
                <li>Do not engage in discrimination, harassment, threats, or bullying</li>
                <li>Do not post or share illegal, offensive, or inappropriate content</li>
                <li>Do not use the platform for scams, fraud, or deceptive practices</li>
                <li>Respect the privacy of other users - do not share personal information without consent</li>
                <li>Do not create fake profiles or impersonate others</li>
                <li>Report any suspicious activity promptly</li>
              </ul>
            </div>
          </section>

          {/* Seeker Rules */}
          <section className="card p-6 rounded-2xl space-y-3 border-l-2 border-l-[var(--color-primary)]">
            <h2 className="text-lg font-bold text-[var(--color-primary)]">Rules for Seekers</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Be truthful and accurate in your profile and during any verification process</li>
                <li>Respect house rules, neighbours, and applicable tenancy or lodging laws</li>
                <li>Do not ghost owners after agreeing to an arrangement</li>
                <li>Know that Migrent never charges renters to search, message, inspect or apply, so anyone asking you to pay Migrent for those is not Migrent</li>
                <li>Do not agree to take a short stay arranged through Migrent off the platform to avoid the host fee</li>
                <li>Leave the property in the condition you found it</li>
                <li>Communicate openly about any issues during your stay</li>
              </ul>
            </div>
          </section>

          {/* Owner Rules */}
          <section className="card p-6 rounded-2xl space-y-3 border-l-2 border-l-blue-500">
            <h2 className="text-lg font-bold text-[var(--color-primary)]">Rules for Owners</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Provide accurate and up-to-date listing information (location, price, photos, conditions)</li>
                <li>Do not post misleading photos or descriptions</li>
                <li>Comply with relevant tenancy or lodging laws and anti-discrimination rules</li>
                <li>Do not demand unlawful payments (e.g. excessive bond or hidden charges)</li>
                <li>Pay Migrent&apos;s one-off AUD $99 per property when you confirm the first short stay booked through Migrent at that property (long-term tenancies through applications are free)</li>
                <li>Do not move a short stay arranged through Migrent off the platform to avoid the host fee</li>
                <li>Provide a safe, clean, and habitable living environment</li>
                <li>Respond to enquiries in a timely manner</li>
              </ul>
            </div>
          </section>

          {/* Listing Standards */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Listing Standards</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>All listings must meet the following minimum standards:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Accuracy</strong> - Photos must be current and representative of the actual space</li>
                <li><strong>Pricing</strong> - Weekly rent must be clearly stated with no hidden fees</li>
                <li><strong>Location</strong> - Suburb and general area must be accurate</li>
                <li><strong>Availability</strong> - Dates and availability must be kept up to date</li>
                <li><strong>Conditions</strong> - Bond, bills, house rules, and notice periods must be disclosed</li>
              </ul>
              <p>Listings that do not meet these standards may be flagged, hidden, or removed.</p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Dispute Resolution</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Migrent encourages users to resolve disputes directly and amicably. If you cannot reach a resolution:</p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Attempt direct communication with the other party</li>
                <li>Document all interactions and agreements</li>
                <li>Contact Migrent at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a> for assistance</li>
                <li>For serious disputes, seek independent legal advice or contact your state&apos;s tenancy authority</li>
              </ol>
              <p>Migrent may mediate informally but is not a dispute resolution service and cannot enforce outcomes between users.</p>
            </div>
          </section>

          {/* Regulatory */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Regulatory Compliance</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Owners are responsible for complying with any local regulations that may apply, including:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Short-term rental accommodation (STRA) registration in NSW</li>
                <li>Council regulations and strata by-laws</li>
                <li>Fire safety and habitability standards</li>
                <li>Insurance and liability requirements</li>
              </ul>
              <p>Migrent does not provide legal advice and is not responsible for users&apos; regulatory compliance.</p>
            </div>
          </section>

          {/* Enforcement */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Enforcement</h2>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
              <p>Migrent may take the following actions for guideline violations:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Warning</strong> - First-time or minor violations</li>
                <li><strong>Content removal</strong> - Listings or messages that violate standards</li>
                <li><strong>Temporary suspension</strong> - Repeated or moderate violations</li>
                <li><strong>Permanent ban</strong> - Severe violations, fraud, or illegal activity</li>
              </ul>
            </div>
          </section>

        </div>
      </LegalLayout>
    </>
  );
}
