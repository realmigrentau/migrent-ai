import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BellRing, CalendarDays } from "lucide-react";
import { searchListings } from "../../lib/api";
import { HomeImage } from "../hub/ui/Media";
import { placeTypeLabel } from "../../lib/hub/format";
import { Reveal, SectionHead, Strip } from "../site";

/**
 * Real rooms, from the real API, and nothing else.
 *
 * The catalogue is young, so the strip is built to be honest at any size:
 * one room is one card, and the last card is always the way to hear about
 * the next one, never a padded grid of placeholders.
 */

type Listing = {
  id: string;
  title?: string;
  suburb?: string;
  city?: string;
  weekly_price?: number;
  daily_price?: number;
  place_type?: string;
  images?: string[];
  available_from?: string;
  bills_included?: boolean;
  host_verification?: { status?: string };
};

function price(l: Listing): number | null {
  if (l.weekly_price) return Math.round(l.weekly_price);
  if (l.daily_price) return Math.round(l.daily_price * 7);
  return null;
}

function RoomCard({ l }: { l: Listing }) {
  const place = [l.suburb, l.city].filter(Boolean).join(", ") || "Australia";
  const title = l.title || "A room on Migrent";
  const p = price(l);
  const verified = l.host_verification?.status === "verified";
  const available = l.available_from ? new Date(l.available_from) : null;
  const now = new Date();
  return (
    <Link href={`/listing/${l.id}`} className="site-card group flex h-full flex-col overflow-hidden p-2">
      <HomeImage src={l.images?.[0]} alt={title} className="aspect-[4/3] w-full" rounded="rounded-[16px]" sizes="300px">
        {verified && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[12px] font-semibold text-[color:var(--color-trust-ink)] shadow-[var(--shadow-soft)] dark:text-[color:var(--color-primary)]">
            <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> ID-checked host
          </span>
        )}
      </HomeImage>
      <div className="flex flex-1 flex-col gap-1.5 px-2.5 pb-2.5 pt-3.5">
        <p className="site-meta truncate">{place}</p>
        <h3 className="site-h3 line-clamp-2">{title}</h3>
        <div className="mt-auto flex items-baseline justify-between gap-3 pt-3">
          <span className="inline-flex items-baseline gap-1">
            {p ? (
              <>
                <span className="text-[19px] font-bold tracking-[-0.02em] text-[color:var(--color-ink)] tabular-nums">${p}</span>
                <span className="site-meta">/wk</span>
              </>
            ) : (
              <span className="site-meta">Price on request</span>
            )}
          </span>
          <span className="site-meta inline-flex items-center gap-1.5">
            {available && available > now ? (
              <>
                <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden="true" />
                {available.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
              </>
            ) : (
              placeTypeLabel(l.place_type) || (l.bills_included ? "Bills included" : "Available now")
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}

function AlertCard({ empty }: { empty: boolean }) {
  return (
    <div className="site-card site-card--pad flex h-full flex-col justify-between gap-6">
      <div>
        <span className="site-icon" aria-hidden="true">
          <BellRing className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <h3 className="site-h3 site-h3--lg mt-5">{empty ? "New rooms are added every week" : "More rooms every week"}</h3>
        <p className="site-body mt-2">
          Save a search for where you want to live and choose how often you hear about new rooms.
        </p>
      </div>
      <Link href="/seeker/search" className="btn-secondary self-start">
        Search and save
        <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function RoomsNow() {
  const [listings, setListings] = useState<Listing[] | null>(null);

  useEffect(() => {
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
  }, []);

  return (
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
                  <AlertCard empty={listings.length === 0} />
                </li>,
              ]}
        </Strip>
      </Reveal>
    </section>
  );
}
