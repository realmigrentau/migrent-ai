import Link from "next/link";
import { ArrowRight, BarChart3, CalendarCheck, ClipboardList, FileSignature, Layers, MessagesSquare, ShieldCheck, Wrench } from "lucide-react";
import SEOHead from "../components/SEOHead";
import EarningsEstimate from "../components/site/EarningsEstimate";
import { CloseCard, Faq, PageHero, Reveal, SectionHead, type FaqEntry } from "../components/site";
import { useAuth } from "../hooks/useAuth";
import { useMounted } from "../hooks/useMounted";
import { hubAbsoluteUrl, hubFromSite } from "../lib/hub/routes";
import { hostFeeSentence } from "../lib/siteIdentity";

/**
 * For owners: why list, what you get, what it costs, what you could earn.
 *
 * Absorbs /features and /resources/roi-calculator (both redirect here).
 * Every feature below is something Migrent Hub does today; the old pages'
 * "verified seekers", "proof of property", "Superhost" and "AI matching"
 * claims are gone because nothing in the product backs them.
 */

const STEPS = [
  { title: "Describe your place", body: "A six-step listing wizard saves as you go. Rooms, rent, photos and house rules, with nothing locked behind a Next button." },
  { title: "Get your ID checked", body: "A person at Migrent reviews your government ID once. Your listings can go live after that, and each one is read before it is published." },
  { title: "Meet renters properly", body: "Publish inspection times, answer questions in one inbox, and review applications that come with a Rental Profile." },
  { title: "Run the tenancy", body: "Record rent as it is paid and handle repair requests in Migrent Hub, with emergencies shown first." },
];

const FEATURES = [
  { icon: ClipboardList, title: "Applications, side by side", body: "Each applicant's work or study, household and references in one snapshot, with private notes only you can see." },
  { icon: CalendarCheck, title: "Inspections that book themselves", body: "Set your times and capacity; renters pick a slot and can add it to their calendar." },
  { icon: MessagesSquare, title: "One inbox, sorted by home", body: "Conversations sit with the listing or tenancy they are about, and saved replies answer the questions you get every day." },
  { icon: Wrench, title: "Rent record and repairs", body: "See what is due and what is paid, and move repair requests from reported to fixed." },
  { icon: Layers, title: "Several homes, one place", body: "Group rooms under the property they belong to, and copy a listing when you have a room just like it." },
  { icon: BarChart3, title: "Honest listing numbers", body: "Views, saves and enquiries as they were recorded. No estimates and no invented benchmarks." },
];

const FAQS: FaqEntry[] = [
  { q: "Is listing really free?", a: `Yes. Listing, editing and receiving applications cost nothing. ${hostFeeSentence()}` },
  { q: "Does Migrent take a cut of the rent?", a: "No. Rent and bond are arranged between you and your tenant. Migrent never holds rent or bond and takes no commission." },
  { q: "Can I rent out some rooms and keep others?", a: "Yes. List each room on its own, or let the whole home as one listing. Rooms in the same property are grouped together in Migrent Hub." },
  { q: "Do I have to be the owner?", a: "No. Property managers can list too; you tell us your relationship to the property when you add it." },
  { q: "What happens before my listing goes live?", a: "Your government ID is reviewed once, then each listing is read by Migrent before it is published. You can save listings as drafts while you wait." },
];

export default function ForOwners() {
  const { session } = useAuth();
  const mounted = useMounted();
  const listHref = mounted && session ? hubAbsoluteUrl("/properties/new") : hubFromSite.listProperty();

  return (
    <>
      <SEOHead
        title="For owners - list a room or a whole home"
        description="List a room or a whole home on Migrent. Free to list, no commission on rent, applicants with a Rental Profile, and your tenancy run from Migrent Hub."
      />

      <PageHero
        eyebrow="For owners"
        crumbs={[{ label: "Home", href: "/" }, { label: "For owners" }]}
        title={
          <>
            Rent your room to someone <strong>ready to move.</strong>
          </>
        }
        lead="Free to list, no commission on rent, and everything from the first inspection to the last repair in one place."
        actions={
          <>
            <Link href={listHref} className="btn-primary btn-lg">
              List a property <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="btn-secondary btn-lg">
              See pricing
            </Link>
          </>
        }
      />

      <section className="site-section site-section--flush" aria-labelledby="steps-heading">
        <div className="site-shell">
          <Reveal>
            <SectionHead
              eyebrow="How hosting works"
              id="steps-heading"
              heading={
                <>
                  From listing to <strong>move-in.</strong>
                </>
              }
            />
          </Reveal>
          <ol className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.05} className="site-card site-card--pad">
                <span aria-hidden="true" className="site-numeral text-[44px] text-[color:var(--color-primary-200)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="site-h3 site-h3--lg mt-4">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="site-body mt-2">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="site-section" aria-labelledby="features-heading">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead
              eyebrow="What you get"
              id="features-heading"
              heading={
                <>
                  Your tenancy, in <strong>one place.</strong>
                </>
              }
              lead="Migrent Hub is where you manage everything after you list. The same app your renters use, so you are both looking at the same thing."
            />
          </Reveal>
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal as="li" key={f.title} delay={(i % 2) * 0.05} className="site-card site-card--pad">
                <span className="site-icon" aria-hidden="true">
                  <f.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h3 className="site-h3 mt-4">{f.title}</h3>
                <p className="site-body mt-1.5">{f.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="earnings" className="site-section scroll-mt-28" aria-labelledby="earnings-heading">
        <div className="site-shell">
          <Reveal>
            <SectionHead
              eyebrow="Your numbers"
              id="earnings-heading"
              heading={
                <>
                  What could your room <strong>earn?</strong>
                </>
              }
              lead="Put in your own rent. The only numbers Migrent adds are its fees."
            />
          </Reveal>
          <Reveal delay={0.06} className="mt-10">
            <EarningsEstimate />
          </Reveal>
        </div>
      </section>

      <section className="site-section site-section--tight" aria-labelledby="trust-heading">
        <div className="site-shell">
          <Reveal className="site-card site-card--pad grid gap-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
            <span className="site-icon" aria-hidden="true">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div>
              <h2 id="trust-heading" className="site-h3 site-h3--lg">
                Renters know you were checked
              </h2>
              <p className="site-body mt-1">
                Your listing shows an &quot;ID-checked host&quot; badge once Migrent has reviewed your ID, so renters know who they are dealing with before they write.
              </p>
            </div>
            <Link href="/how-renting-works#checks" className="site-link">
              <FileSignature className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> How checks work
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="site-section site-section--tight" aria-labelledby="owner-faq-heading">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal>
            <SectionHead
              eyebrow="Questions"
              id="owner-faq-heading"
              heading={
                <>
                  Before you <strong>list.</strong>
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.06}>
            <Faq items={FAQS} />
          </Reveal>
        </div>
      </section>

      <CloseCard
        heading={
          <>
            Your room, someone&apos;s <strong className="type-script">home</strong>.
          </>
        }
        lead="Describe your place now and finish whenever suits you: the listing saves as you go."
        primary={{ label: "List a property", href: listHref }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
    </>
  );
}
