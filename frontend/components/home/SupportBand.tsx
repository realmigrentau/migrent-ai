import Link from "next/link";
import { ArrowRight, Check, Compass, GraduationCap, Luggage, UsersRound } from "lucide-react";
import { Reveal, SectionHead } from "./primitives";

/**
 * The human half of the product: a mentor, and who that mentor is for.
 *
 * "Who it's for" used to be four cards that pinned and stacked on top of
 * each other - a second numbered sequence, right after the four numbered
 * steps. It is an index row now: a rule, a number, a name, a line. Quiet
 * enough to sit under the mentor pitch without competing with it.
 */

const MENTOR_POINTS = [
  "Reads a lease with you before you sign",
  "Knows which suburbs fit your budget",
  "Answers the questions you didn't know to ask",
];

const AUDIENCES = [
  {
    n: "01",
    icon: Compass,
    title: "New migrants",
    body: "Just landed, no local rental history yet, and looking for somewhere safe to start your life here.",
  },
  {
    n: "02",
    icon: GraduationCap,
    title: "Students",
    body: "Near campus, on a student budget, often booking a room before you have even arrived in the country.",
  },
  {
    n: "03",
    icon: Luggage,
    title: "Working holiday",
    body: "Flexible stays across new cities, with hosts who understand that your plans keep moving.",
  },
  {
    n: "04",
    icon: UsersRound,
    title: "New families",
    body: "A little more space, the right suburb for school and work, and a lease you can actually understand.",
  },
];

export default function SupportBand() {
  return (
    <section id="mentors" className="mg-section mg-band--air scroll-mt-[76px]" aria-labelledby="mentors-heading">
      <div className="mg-shell">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <Reveal>
            <p className="mg-eyebrow mg-eyebrow--ruled mb-4">You are not alone</p>
            <h2 id="mentors-heading" className="mg-h2 max-w-[14ch]">
              Settle in with a <strong>mentor.</strong>
            </h2>
            <p className="mg-lead mt-5 max-w-[42ch]">
              People who made the same move help you read a lease, pick a suburb, and find your feet.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8">
              <Link href="/mentors" className="mg-btn mg-btn--primary mg-btn--sm mg-btn--auto">
                Meet our mentors <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link href="/become-mentor" className="mg-btn mg-btn--ghost mg-btn--sm mg-btn--auto">
                Become a mentor
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mg-card mg-wash-sun overflow-hidden p-7 sm:p-9">
              <span className="mg-icon mg-icon--lg mg-icon--trust" aria-hidden="true">
                <UsersRound className="w-6 h-6" strokeWidth={1.6} />
              </span>
              <ul className="list-none m-0 p-0 mt-6 mg-rows">
                {MENTOR_POINTS.map((t) => (
                  <li key={t} className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
                    <Check className="w-[18px] h-[18px] mt-0.5 shrink-0 text-[var(--color-trust)]" strokeWidth={2.4} aria-hidden="true" />
                    <span className="text-[15px] leading-[1.55] text-[var(--color-ink-2)]">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mt-20 md:mt-28">
          <Reveal>
            <SectionHead
              eyebrow="Who it's for"
              heading="Built for everyone arriving in"
              emphasis="Australia."
            />
          </Reveal>
          <ul className="list-none m-0 p-0 mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {AUDIENCES.map((a, i) => (
              <Reveal as="li" key={a.n} delay={(i % 4) * 0.06}>
                <hr className="mg-rule mb-5" />
                <div className="flex items-baseline gap-3">
                  <span className="mg-numeral text-[var(--color-primary-400)] text-[22px]" aria-hidden="true">
                    {a.n}
                  </span>
                  <span className="text-[var(--color-primary-400)]" aria-hidden="true">
                    <a.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  </span>
                </div>
                <h3 className="mg-h3 mt-4">{a.title}</h3>
                <p className="mg-body mt-2">{a.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
