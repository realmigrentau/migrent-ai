import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BellRing, KeyRound, ShieldCheck, type LucideIcon } from "lucide-react";
import { searchListings } from "../../lib/api";
import { hubAbsoluteUrl, hubFromSite } from "../../lib/hub/routes";
import { showExampleListings } from "../../data/exampleListings";
import { Reveal, SectionHead, Strip } from "../site";
import { ExampleListingsStrip } from "../listings/ExampleListings";
import { RoomCard, type RoomListing } from "../listings/RoomCard";

/**
 * Real rooms, from the real API, and nothing else.
 *
 * The catalogue is young, so the strip is built to be honest at any size:
 * one room is one card, and the last card is always the way to hear about
 * the next one, never a padded grid of placeholders. With no rooms live at
 * all, a strip of one card and empty scroll arrows looked broken, so the
 * section becomes three real next steps instead: hear first, list a room,
 * move in safely.
 *
 * Below a handful of real rooms, a separate strip shows the example
 * listings (data/exampleListings.ts), each titled "Example listing:". They
 * never mix into the real strip and go once there are enough real rooms.
 */

export type { RoomListing } from "../listings/RoomCard";

function AlertCard({ empty }: { empty: boolean }) {
  return (
    <div className="site-card site-card--pad flex h-full flex-col justify-between gap-6">
      <div>
        <span className="site-icon" aria-hidden="true">
          <BellRing className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <h3 className="site-h3 site-h3--lg mt-5">{empty ? "Be the first to hear" : "Hear about new rooms"}</h3>
        <p className="site-body mt-2">
          Save a search in Migrent Hub for where you want to live, and choose how often we tell you about new rooms there.
        </p>
      </div>
      <Link href={hubAbsoluteUrl("/discover")} className={`${empty ? "btn-primary" : "btn-secondary"} self-start`}>
        Save a search
        <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
      </Link>
    </div>
  );
}

function NextStepCard({ icon: Icon, title, body, href, cta }: { icon: LucideIcon; title: string; body: string; href: string; cta: string }) {
  return (
    <div className="site-card site-card--pad flex h-full flex-col justify-between gap-6">
      <div>
        <span className="site-icon" aria-hidden="true">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <h3 className="site-h3 site-h3--lg mt-5">{title}</h3>
        <p className="site-body mt-2">{body}</p>
      </div>
      <Link href={href} className="btn-secondary self-start">
        {cta}
        <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function RoomsNow({ initial = null }: { initial?: RoomListing[] | null }) {
  const [listings, setListings] = useState<RoomListing[] | null>(initial);

  // The homepage normally arrives with the rooms already in it (built with
  // the page, see pages/index.tsx). Only when that build could not reach the
  // API does the browser ask for them.
  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    searchListings({ limit: "8" })
      .then((data) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : Array.isArray(data?.listings) ? data.listings : [];
        setListings(rows.slice(0, 8));
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const examples = listings !== null && showExampleListings(listings.length);

  if (listings && listings.length === 0) {
    return (
      <>
        <section id="rooms" className="site-section pb-8 scroll-mt-[96px]" aria-labelledby="rooms-heading">
          <Reveal>
            <div className="site-shell">
              <SectionHead
                eyebrow="Rooms"
                id="rooms-heading"
                heading={
                  <>
                    The first rooms are <strong>on their way.</strong>
                  </>
                }
                lead="A room is published only after Migrent has checked the host's ID and read the listing. Save a search and you hear about it first."
                aside={
                  <Link href="/seeker/search" className="site-link">
                    Search all rooms <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </Link>
                }
              />
              <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-3 lg:mt-12">
                <li>
                  <AlertCard empty />
                </li>
                <li>
                  <NextStepCard
                    icon={KeyRound}
                    title="Have a room to rent?"
                    body="List it free. Migrent checks your ID and reads your listing, then renters apply with a Rental Profile instead of a pile of paperwork."
                    href={hubFromSite.listProperty()}
                    cta="List a property"
                  />
                </li>
                <li>
                  <NextStepCard
                    icon={ShieldCheck}
                    title="Move in safely"
                    body="Never pay a bond or deposit before you have seen the home and have a written agreement. Learn the warning signs of a rental scam."
                    href="/blog/spot-rental-scams"
                    cta="Read the guide"
                  />
                </li>
              </ul>
            </div>
          </Reveal>
        </section>
        {examples && <ExampleListingsStrip />}
      </>
    );
  }

  return (
    <>
      <section id="rooms" className="site-section pb-8 scroll-mt-[96px]" aria-labelledby="rooms-heading">
        <Reveal>
          <Strip
            label="Rooms available now"
            head={
              <SectionHead
                eyebrow="Available now"
                id="rooms-heading"
                heading={
                  <>
                    Rooms you can <strong>move into.</strong>
                  </>
                }
                aside={
                  <Link href="/seeker/search" className="site-link">
                    Search all rooms <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </Link>
                }
              />
            }
          >
            {listings === null
              ? [0, 1, 2].map((i) => (
                  <li key={i} aria-hidden="true">
                    <div className="site-card overflow-hidden p-2">
                      <div className="hub-skeleton aspect-[4/3] w-full rounded-[16px]" />
                      <div className="space-y-2.5 px-2.5 pb-3 pt-4">
                        <div className="hub-skeleton h-3 w-1/3 rounded-full" />
                        <div className="hub-skeleton h-4 w-3/4 rounded-full" />
                        <div className="hub-skeleton h-4 w-1/4 rounded-full" />
                      </div>
                    </div>
                  </li>
                ))
              : [
                  ...listings.map((l) => (
                    <li key={l.id}>
                      <RoomCard l={l} />
                    </li>
                  )),
                  <li key="alert">
                    <AlertCard empty={false} />
                  </li>,
                ]}
          </Strip>
        </Reveal>
      </section>
      {examples && <ExampleListingsStrip />}
    </>
  );
}
