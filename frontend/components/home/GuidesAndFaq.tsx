import Link from "next/link";
import { ArrowRight, FileCheck2, KeyRound, MapPin, ShieldCheck } from "lucide-react";
import { Reveal, SectionHead } from "./primitives";

/**
 * The last two things a visitor wants before deciding: reading, and
 * answers.
 *
 * The guides are an index - a rule, an icon, a title, an arrow - and the
 * FAQ is a real <details> accordion, so the answers stay in the document
 * for search engines while the section stays short on screen.
 */

const GUIDES = [
  { icon: FileCheck2, t: "Your first week", d: "A checklist for the days right after you land." },
  { icon: KeyRound, t: "Understanding your lease", d: "What to read before you sign anything." },
  { icon: MapPin, t: "Choosing a suburb", d: "Match budget, commute, and community." },
  { icon: ShieldCheck, t: "Tenant rights", d: "What you're entitled to as a renter in Australia." },
];

const FAQS = [
  {
    q: "Do I need an Australian rental history?",
    a: "No. Many hosts welcome first-time renters with no local ledger or credit file - filter for them.",
  },
  {
    q: "How is my bond protected?",
    a: "By being lodged with your state's bond authority rather than held by your host. We show you how to do it and what receipt to ask for. MigRent never holds your money.",
  },
  {
    q: "What does it cost renters?",
    a: "Browsing and applying is free, with $0 platform service fees.",
  },
  {
    q: "How are hosts verified?",
    a: "Government ID plus proof they control the property, before any room goes live.",
  },
];

export default function GuidesAndFaq() {
  return (
    <>
      <section className="mg-section mg-band--mist" aria-labelledby="guides-heading">
        <div className="mg-shell">
          <Reveal>
            <SectionHead
              eyebrow="Guides & resources"
              heading="Everything you need to land"
              emphasis="well."
              headingId="guides-heading"
              aside={
                <Link href="/guides" className="mg-link">
                  All guides <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              }
            />
          </Reveal>

          <ul className="list-none m-0 p-0 mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-9">
            {GUIDES.map((g, i) => (
              <Reveal as="li" key={g.t} delay={(i % 4) * 0.05}>
                <Link href="/guides" className="group block">
                  <hr className="mg-rule mb-5 transition-colors group-hover:bg-[var(--color-primary)]" />
                  <span className="mg-icon" aria-hidden="true">
                    <g.icon className="w-[21px] h-[21px]" strokeWidth={1.7} />
                  </span>
                  <h3 className="mg-h3 mt-5">{g.t}</h3>
                  <p className="mg-body mt-2">{g.d}</p>
                  <span className="mg-link mt-4 text-[13px]">
                    Read the guide <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="mg-section mg-band--air scroll-mt-[76px]" aria-labelledby="faq-heading">
        <div className="mg-shell grid lg:grid-cols-[0.75fr_1.25fr] gap-10 lg:gap-20">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="mg-eyebrow mg-eyebrow--ruled mb-4">Good to know</p>
            <h2 id="faq-heading" className="mg-h2 max-w-[12ch]">
              Questions, <strong>answered.</strong>
            </h2>
            <Link href="/faq" className="mg-link mt-7">
              See all FAQs <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Reveal>

          <Reveal delay={0.06}>
            {FAQS.map((f, i) => (
              <details key={f.q} className="mg-faq__item" open={i === 0}>
                <summary className="mg-faq__q">
                  {f.q}
                  <span className="mg-faq__sign" aria-hidden="true" />
                </summary>
                <p className="mg-body mg-faq__a">{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
