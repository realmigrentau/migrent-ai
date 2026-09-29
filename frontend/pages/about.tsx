import Link from "next/link";
import { ArrowRight, BadgeCheck, HandCoins, Languages, Sprout } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { CloseCard, PageHero, Reveal, SectionHead } from "../components/site";
import { businessDetails, hostFeeSentence, seekerFeeSentence, siteIdentity } from "../lib/siteIdentity";

/**
 * About Migrent, with careers and press as sections (/careers and /press
 * redirect here).
 *
 * Written only from what is confirmed: the brand, the ABN, the fee model
 * and what the product does. The old pages' city count, "AI-powered"
 * matching, visa checks, milestones and unattributed testimonials are gone;
 * none of them could be backed up. The founding city is not stated because
 * lib/siteIdentity.ts records it as unconfirmed.
 */

const PRINCIPLES = [
  { icon: Sprout, title: "Built for arriving", body: "A visa, a job offer and no Australian paper trail should not decide where you sleep. Everything here starts from that." },
  { icon: BadgeCheck, title: "Checked, not promised", body: "We tell you exactly what we check (a host's ID, every listing) and exactly what we do not, so a badge never means more than it says." },
  { icon: HandCoins, title: "Fair about money", body: "Renters search and apply for free. Hosts pay once per property, only for stays. Nobody pays a commission on rent." },
  { icon: Languages, title: "Plain words", body: "Much of this site's audience reads English as a second language, so we write short sentences and explain the rules that matter." },
];

export default function About() {
  const press = siteIdentity.emails.press;
  return (
    <>
      <SEOHead
        title="About"
        description="Migrent helps migrants, students and new arrivals find a room they can trust in Australia, and helps owners let to them properly."
      />

      <PageHero
        eyebrow="About Migrent"
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        title={
          <>
            Renting, for people who have just <strong>arrived.</strong>
          </>
        }
        lead="Migrent helps migrants, students and new arrivals find a room they can trust in Australia, and helps owners let to them properly."
      />

      <section className="site-section site-section--flush" aria-labelledby="story-heading">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <Reveal>
            <SectionHead
              eyebrow="Why Migrent exists"
              id="story-heading"
              heading={
                <>
                  Finding a room should not be a <strong>full-time job.</strong>
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.06} className="site-prose">
            <p>New arrivals are asked for things they cannot have yet: an Australian rental history, local references, a credit file. They are told to look in social media groups where scams are common, and to hand over a bond without knowing where it should go.</p>
            <p>Migrent puts the pieces in one place. Hosts show us their ID before their rooms go live. Renters apply once with a Rental Profile that tells their story. Everyone can see where the bond goes (to the state, never to us), and both sides run the tenancy from the same app, Migrent Hub.</p>
            <p>
              Migrent is an introduction service, not a real estate agent. <Link href="/how-renting-works#not-an-agent">What that means for you</Link>.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="site-section" aria-labelledby="principles-heading">
        <div className="site-shell">
          <Reveal>
            <SectionHead
              eyebrow="How we work"
              id="principles-heading"
              heading={
                <>
                  Four things we <strong>hold to.</strong>
                </>
              }
            />
          </Reveal>
          <ul className="m-0 mt-10 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.05} className="site-card site-card--pad">
                <span className="site-icon" aria-hidden="true">
                  <p.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h3 className="site-h3 mt-4">{p.title}</h3>
                <p className="site-body mt-1.5">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="careers" className="site-section site-section--tight scroll-mt-28" aria-labelledby="careers-heading">
        <div className="site-shell grid gap-4 lg:grid-cols-2">
          <Reveal className="site-card site-card--pad flex flex-col">
            <p className="eyebrow">Careers</p>
            <h2 id="careers-heading" className="site-h2 mt-3 !text-[clamp(1.6rem,2.6vw,2.1rem)]">
              Help build it
            </h2>
            <p className="site-body mt-3 flex-1">
              There are no paid roles open right now. If you would like to help as an early contributor (developer, designer, writer or community builder), email us with what you do and why Migrent matters to you.
            </p>
            <a href={`mailto:${siteIdentity.emails.support}?subject=${encodeURIComponent("Contributing to Migrent")}`} className="site-link mt-6">
              Email {siteIdentity.emails.support} <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </a>
          </Reveal>

          <div id="press" className="scroll-mt-28">
          <Reveal delay={0.06} className="site-card site-card--pad flex h-full flex-col">
            <p className="eyebrow">Press</p>
            <h2 id="press-heading" className="site-h2 mt-3 !text-[clamp(1.6rem,2.6vw,2.1rem)]">
              Writing about Migrent?
            </h2>
            <div className="site-body mt-3 flex-1 space-y-3">
              <p className="m-0">Migrent is an Australian rental platform for migrants, students and new arrivals. {seekerFeeSentence()} {hostFeeSentence()}</p>
              <p className="m-0">For interviews, logos or screenshots, email us.</p>
            </div>
            <a href={`mailto:${press}?subject=${encodeURIComponent("Press enquiry")}`} className="site-link mt-6">
              Email {press} <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </a>
          </Reveal>
          </div>
        </div>
      </section>

      <section className="site-section site-section--tight" aria-labelledby="business-heading">
        <div className="site-shell">
          <Reveal className="site-card site-card--pad">
            <h2 id="business-heading" className="site-h3 site-h3--lg">
              Business details
            </h2>
            <dl className="m-0 mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {businessDetails().map((row) => (
                <div key={row.label}>
                  <dt className="site-meta">{row.label}</dt>
                  <dd className="m-0 text-[15px] font-semibold text-[color:var(--color-ink)] [overflow-wrap:anywhere]">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="site-meta mt-6">
              Every policy is in the <Link href="/legal" className="underline underline-offset-2">Legal centre</Link>.
            </p>
          </Reveal>
        </div>
      </section>

      <CloseCard
        heading={
          <>
            Find your <strong className="type-script">place</strong> here.
          </>
        }
        primary={{ label: "Search rooms", href: "/seeker/search" }}
        secondary={{ label: "List a property", href: "/for-owners" }}
      />
    </>
  );
}
