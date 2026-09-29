import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { CloseCard, DocLayout, PageHero, Reveal } from "../components/site";
import { hubFromSite } from "../lib/hub/routes";

/**
 * How renting works: one document instead of three pages.
 *
 * It replaces /for-seekers, /safety-verification and /no-agency (all now
 * redirect here). The steps, the host checks and the safety advice are
 * rewritten to describe only what the product actually does. The final
 * section, "Migrent is a facilitator, not an agent", is the /no-agency text
 * reproduced word for word because it is a legal statement; only its link to
 * the rental laws guide was repaired (it pointed at a page that did not exist).
 */

const NAV = [
  { href: "#steps", label: "From search to settled" },
  { href: "#checks", label: "How we check hosts" },
  { href: "#money", label: "Your bond and rent" },
  { href: "#safety", label: "Staying safe" },
  { href: "#problems", label: "If something goes wrong" },
  { href: "#not-an-agent", label: "What Migrent is not" },
];

const STEPS = [
  {
    title: "Search your way",
    body: "Filter by suburb, budget and move-in date, then by what decides whether a place works for you: a private bathroom, a door that locks, no security cameras, pets, bills included. You do not need an account to search.",
  },
  {
    title: "Build one Rental Profile",
    body: "Instead of a new form for every room, you fill in one profile in Migrent Hub: your work or study, your household and your references. A local rental ledger or credit file is not required.",
  },
  {
    title: "Inspect, ask, apply",
    body: "Book an inspection time the host has published, message them about the room, and apply with your profile when you are ready. Browsing, messaging and applying are free.",
  },
  {
    title: "Agree and move in",
    body: "Once the host accepts and Migrent has reviewed the application, you agree the terms directly with the host and lodge your bond with your state's bond authority. Your rent record and any repair requests then live in Migrent Hub.",
  },
];

const SAFETY_RENTERS = [
  "Inspect the property in person or by video call before you commit or pay anything.",
  "Never pay bond or rent before you have seen the property and met the host.",
  "Get the terms in writing: rent, bond, bills, notice periods and house rules.",
  "Be careful with deals that seem too good to be true.",
  "Keep your conversations in Migrent where you can, so there is a record.",
  "Report anything suspicious straight away with the Report button.",
];

const SAFETY_HOSTS = [
  "Meet a renter somewhere public first, or by video call.",
  "Check who you are talking to before you share your address.",
  "Ask for references where it makes sense.",
  "Keep written records of what you agree.",
  "Set clear house rules before anyone moves in.",
  "Use Migrent messages so there is a clear record.",
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 border-t border-[var(--color-line)] pt-10 first:border-t-0 first:pt-0">
      <Reveal>
        <h2 id={`${id}-title`} className="site-h2 !text-[clamp(1.6rem,2.6vw,2.2rem)]">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </Reveal>
    </section>
  );
}

export default function HowRentingWorks() {
  return (
    <>
      <SEOHead
        title="How renting works"
        description="How renting through Migrent works: searching, your Rental Profile, how hosts are checked, where your bond goes, staying safe, and what Migrent is not."
      />

      <PageHero
        eyebrow="For renters"
        crumbs={[{ label: "Home", href: "/" }, { label: "How renting works" }]}
        title={
          <>
            How renting <strong>works.</strong>
          </>
        }
        lead="Everything between finding a room and settling in: who checks what, where your money goes, and what Migrent does and does not do."
        actions={
          <>
            <Link href="/seeker/search" className="btn-primary btn-lg">
              Search rooms <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <Link href={hubFromSite.signUp()} className="btn-secondary btn-lg">
              Start your Rental Profile
            </Link>
          </>
        }
      />

      <DocLayout nav={NAV} navLabel="On this page">
        <div className="flex flex-col gap-14">
          <Section id="steps" title="From search to settled">
            <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.title} className="site-card site-card--pad">
                  <span aria-hidden="true" className="site-numeral text-[44px] text-[color:var(--color-primary-400)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="site-h3 site-h3--lg mt-4">
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="site-body mt-2">{s.body}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="checks" title="How we check hosts">
            <div className="site-prose">
              <p>Before any room from a host can be published, a person at Migrent reviews that host&apos;s government ID (a passport, driver&apos;s licence, visa or national ID) and the host confirms their email address. Every listing is then read by Migrent before it goes live, and listings that break the rules are taken down.</p>
              <p>
                <strong>What the &quot;ID-checked host&quot; badge means:</strong> Migrent has seen and approved that person&apos;s identity document.
              </p>
              <p>
                <strong>What it does not mean:</strong> Migrent has not inspected the property, and does not certify that a room is safe, legal or as described. That is why the inspection step matters, and why the safety advice below is worth following.
              </p>
            </div>
          </Section>

          <Section id="money" title="Your bond and rent">
            <div className="site-prose">
              <p>Your bond is lodged with your state or territory&apos;s bond authority, not paid into a host&apos;s bank account, and never paid to Migrent. The authority holds it until you move out and returns it according to your state&apos;s rules.</p>
              <p>Migrent does not collect rent or bond. Rent is paid to the host the way you agree with them; Migrent Hub keeps a record of what was due and what was paid so both of you can see it.</p>
              <p>
                Each state has its own rules for bonds, notice periods and repairs. Our <Link href="/guides/rental-laws">rental laws guide</Link> covers them state by state.
              </p>
            </div>
          </Section>

          <Section id="safety" title="Staying safe">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="site-card site-card--pad">
                <h3 className="site-h3">If you are renting</h3>
                <ul className="site-body mt-3 list-disc space-y-2 pl-5">
                  {SAFETY_RENTERS.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="site-card site-card--pad">
                <h3 className="site-h3">If you are hosting</h3>
                <ul className="site-body mt-3 list-disc space-y-2 pl-5">
                  {SAFETY_HOSTS.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section id="problems" title="If something goes wrong">
            <div className="site-prose">
              <ul>
                <li>
                  <strong>You feel unsafe:</strong> call 000 first.
                </li>
                <li>
                  <strong>A listing or person seems wrong:</strong> use the Report button on the listing or profile, or see <Link href="/safety-reporting">safety and reporting</Link>.
                </li>
                <li>
                  <strong>A disagreement with a host or renter:</strong> see <Link href="/support-disputes">dispute resolution</Link>, and your state&apos;s tenancy authority in the <Link href="/guides/rental-laws">rental laws guide</Link>.
                </li>
                <li>
                  <strong>Anything else:</strong> <Link href="/contact">contact us</Link>.
                </li>
              </ul>
              <p>Migrent does not guarantee the safety, suitability, or legality of any person or property. Users must make their own independent checks and decisions.</p>
            </div>
          </Section>

          <Section id="not-an-agent" title="What Migrent is not">
            <div className="site-prose">
              <p className="site-meta">
                The text below is Migrent&apos;s statement &quot;We Are Not Your Agent&quot;, reproduced in full. Last updated: March 2026.
              </p>

              <h3>Migrent is a Facilitator, Not an Agent</h3>
              <p>
                Migrent operates as an <strong>online introduction service</strong> (similar to platforms like Flatmates.com.au). We are not a real estate agent, property manager, landlord, or letting agent. We do not hold a real estate licence and are not required to under Australian law.
              </p>

              <h3>What Migrent Does</h3>
              <ul>
                <li>Provides an online platform where room owners can list available rooms</li>
                <li>Allows accommodation seekers to search and filter listings</li>
                <li>Uses AI matching to suggest compatible owner-seeker pairs</li>
                <li>Facilitates initial communication between users via messaging</li>
                <li>Charges flat platform fees ($99/deal for owners, $19 optional for seekers)</li>
              </ul>

              <h3>What Migrent Does NOT Do</h3>
              <ul>
                <li>Act as your agent, representative, or fiduciary in any capacity</li>
                <li>Negotiate rental terms, prices, or conditions on your behalf</li>
                <li>Inspect, verify, or certify properties</li>
                <li>Draft, execute, or enforce tenancy agreements or licences</li>
                <li>Collect, hold, or manage rent, bonds, or security deposits</li>
                <li>Manage properties or provide property management services</li>
                <li>Provide legal, financial, or tax advice</li>
                <li>Guarantee the suitability, safety, or legality of any arrangement</li>
              </ul>

              <h3>Legal Basis</h3>
              <p>Under the Property and Stock Agents Act 2002 (NSW) and equivalent legislation in other states, a real estate agent licence is required for persons who:</p>
              <ul>
                <li>Negotiate the sale or lease of property on behalf of another person</li>
                <li>Collect rent or manage property on behalf of a landlord</li>
                <li>Act as a buyer&apos;s or tenant&apos;s agent in property transactions</li>
              </ul>
              <p>Migrent does none of the above. We are an online matching and introduction platform. Users make their own direct arrangements after being introduced through our service. No agency relationship is created between Migrent and any user.</p>
            </div>

            <div className="site-card mt-6 overflow-hidden">
              <table className="w-full border-collapse text-[14px]">
                <caption className="px-5 pb-2 pt-5 text-left text-[15px] font-semibold text-[color:var(--color-ink)]">Comparison: Introduction Service vs Agent</caption>
                <thead>
                  <tr className="border-b border-[var(--color-line)]">
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-[color:var(--color-ink)]">Activity</th>
                    <th scope="col" className="px-5 py-3 text-center font-semibold text-[color:var(--color-ink)]">Agent</th>
                    <th scope="col" className="px-5 py-3 text-center font-semibold text-[color:var(--color-primary)]">Migrent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line)] text-[color:var(--color-ink-2)]">
                  {[
                    ["Introduces parties", "Yes", "Yes"],
                    ["Negotiates terms on your behalf", "Yes", "No"],
                    ["Collects rent or bonds", "Yes", "No"],
                    ["Creates tenancy agreements", "Yes", "No"],
                    ["Manages property", "Yes", "No"],
                    ["Owes fiduciary duty", "Yes", "No"],
                    ["Requires licence", "Yes", "No"],
                  ].map(([a, b, c]) => (
                    <tr key={a}>
                      <th scope="row" className="px-5 py-2.5 text-left font-normal">{a}</th>
                      <td className="px-5 py-2.5 text-center">{b}</td>
                      <td className="px-5 py-2.5 text-center font-semibold text-[color:var(--color-ink)]">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="site-prose mt-6">
              <h3>Your Responsibility</h3>
              <p>Because Migrent is not your agent, you are fully responsible for:</p>
              <ul>
                <li>Negotiating your own rental terms directly with the other party</li>
                <li>Drafting or obtaining your own tenancy agreement or licence</li>
                <li>Conducting your own property inspections and due diligence</li>
                <li>Arranging bond payments through the appropriate state authority</li>
                <li>Ensuring compliance with all applicable rental and tenancy laws</li>
              </ul>
              <p>
                See our <Link href="/guides/rental-laws">Australian Rental Laws Guide</Link> for an overview of state-by-state requirements.
              </p>
              <p className="site-meta">
                This page is for informational purposes only and does not constitute legal advice. Migrent recommends consulting a qualified Australian lawyer regarding your obligations. Last reviewed: March 2026.
              </p>
            </div>
          </Section>
        </div>
      </DocLayout>

      <CloseCard
        heading={
          <>
            Ready to find your <strong className="type-script">room</strong>?
          </>
        }
        lead="Searching is free and needs no account."
        primary={{ label: "Search rooms", href: "/seeker/search" }}
        secondary={{ label: "Questions? Visit Help", href: "/help" }}
      />
    </>
  );
}
