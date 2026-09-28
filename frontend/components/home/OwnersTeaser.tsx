import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardList, MessagesSquare, Wrench } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useMounted } from "../../hooks/useMounted";
import { hubAbsoluteUrl, hubFromSite } from "../../lib/hub/routes";
import { Reveal, SectionHead } from "../site";

/**
 * For the other half of the audience. Short on purpose: the homepage
 * answers "is this for me, and what does it cost", and /for-owners has the
 * rest.
 */

const POINTS = [
  { icon: ClipboardList, title: "Applicants with a Rental Profile", body: "Work, study, household and references in one place, instead of paperwork by email." },
  { icon: CalendarCheck, title: "Inspections that book themselves", body: "Publish your times; renters pick a slot and get reminded." },
  { icon: MessagesSquare, title: "One inbox per home", body: "Every conversation sits with the listing or tenancy it is about." },
  { icon: Wrench, title: "Rent and repairs, recorded", body: "Keep a rent record and handle repair requests after move-in." },
];

export default function OwnersTeaser() {
  const { session } = useAuth();
  const mounted = useMounted();
  const listHref = mounted && session ? hubAbsoluteUrl("/properties/new") : hubFromSite.listProperty();

  return (
    <section className="site-section" aria-labelledby="owners-heading">
      <div className="site-shell">
        <div className="site-card overflow-hidden">
          <div className="grid gap-10 p-[clamp(24px,4vw,56px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <Reveal>
              <SectionHead
                eyebrow="For owners"
                id="owners-heading"
                heading={
                  <>
                    Rent a room to someone <strong>ready to move.</strong>
                  </>
                }
                lead="List a room or a whole home, meet renters who have already told you about themselves, and run the tenancy from Migrent Hub. Listing is free."
              />
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={listHref} className="btn-primary btn-lg">
                  List a property
                  <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                </Link>
                <Link href="/for-owners" className="btn-secondary btn-lg">
                  How hosting works
                </Link>
              </div>
              <p className="site-meta mt-4">
                Fees only apply to short stays. <Link href="/pricing" className="underline underline-offset-2 hover:text-[color:var(--color-ink)]">See pricing</Link>
              </p>
            </Reveal>

            <ul className="site-rows m-0 list-none self-center p-0">
              {POINTS.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 0.05} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  <span className="site-icon site-icon--quiet" aria-hidden="true">
                    <p.icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="site-h3">{p.title}</h3>
                    <p className="site-body mt-1">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
