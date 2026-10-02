import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import SEOHead from "../../../components/SEOHead";
import { PageHero } from "../../../components/site";
import { API_BASE_URL } from "../../../lib/apiBase";
import { moveInCost } from "../../../lib/listingCosts";
import { findPlace } from "../../../lib/suburbs/data.server";
import { normalise, placeHref } from "../../../lib/suburbs/search";
import { roomsHref } from "../../../lib/suburbs/rooms";

/**
 * "Rooms for rent in <suburb>" (MIGRENT_MASTER_AUDIT MIG-037).
 *
 * The search page is an app (filters, map, client-side paging) and stays out
 * of the index; this is the page a search engine can send someone to. It
 * lists the rooms Migrent actually has in that suburb right now, from the
 * same public search the site uses, so a hidden, expired or unmoderated
 * listing can never appear here.
 *
 * A suburb with no rooms still answers (someone may follow a link), but it
 * is noindex: an empty page is not something to rank.
 */

interface Room {
  id: string;
  title: string | null;
  suburb: string | null;
  postcode: number | null;
  weekly_price: number;
  images?: string[];
  place_type?: string | null;
  bond_weeks?: number | null;
  rent_in_advance_weeks?: number | null;
  listing_purpose?: string | null;
  bills_included?: boolean | null;
  furnished?: boolean | null;
  newcomer_friendly?: boolean | null;
  available_from?: string | null;
}

interface Props {
  place: { name: string; state: string; postcode: string | null; suburbHref: string };
  rooms: Room[];
  checkedAt: string;
}

const PLACE_TYPE: Record<string, string> = { private: "Private room", private_room: "Private room", shared: "Shared room", shared_room: "Shared room", entire: "Whole place", entire_place: "Whole place" };

async function roomsIn(name: string, postcode: string | null): Promise<Room[]> {
  const params = new URLSearchParams({ suburb: name, limit: "100" });
  if (postcode) params.set("postcode", postcode);
  try {
    const res = await fetch(`${API_BASE_URL}/listings/search?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    const rows: Room[] = Array.isArray(data) ? data : data.listings || [];
    // The search matches part of a name ("Parramatta" also finds "North
    // Parramatta"); this page is for exactly one suburb.
    const want = normalise(name);
    return rows.filter((r) => r.id && normalise(r.suburb || "") === want);
  } catch {
    return [];
  }
}

export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: "blocking" });

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const state = String(params?.state || "");
  const slug = String(params?.slug || "");
  const place = findPlace(state, slug);
  if (!place) return { notFound: true, revalidate: 3600 };
  if (state !== state.toLowerCase() || slug !== slug.toLowerCase()) {
    return { redirect: { destination: roomsHref(place), permanent: true } };
  }
  const rooms = await roomsIn(place.name, place.postcode);
  return {
    props: {
      place: { name: place.name, state: place.state, postcode: place.postcode, suburbHref: placeHref(place) },
      rooms,
      checkedAt: new Date().toISOString(),
    },
    // New rooms show within ten minutes.
    revalidate: 600,
  };
};

export default function RoomsInSuburb({ place, rooms }: Props) {
  const where = `${place.name}, ${place.state}`;
  const searchHref = `/seeker/search?suburb=${encodeURIComponent(place.name)}`;
  const n = rooms.length;
  const cheapest = n ? Math.min(...rooms.map((r) => r.weekly_price)) : null;

  return (
    <>
      <SEOHead
        title={`Rooms for rent in ${where}`}
        description={
          n
            ? `${n} room${n === 1 ? "" : "s"} for rent in ${where} from ID-checked hosts${cheapest ? `, from $${cheapest} a week` : ""}. See the full cost to move in before you apply. Free to search and apply.`
            : `Rooms for rent in ${where} from ID-checked hosts on Migrent. Free to search and apply.`
        }
        noIndex={n === 0}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Suburbs", path: "/suburbs" },
          { name: place.name, path: place.suburbHref },
        ]}
      />
      <PageHero
        eyebrow="Rooms for rent"
        crumbs={[{ label: "Home", href: "/" }, { label: "Suburbs", href: "/suburbs" }, { label: place.name, href: place.suburbHref }, { label: "Rooms" }]}
        title={<>Rooms for rent in {place.name}</>}
        lead={
          n
            ? `${n} room${n === 1 ? "" : "s"} on Migrent in ${where} right now. Every host is ID-checked before a room goes live, and each listing shows what you pay to move in.`
            : `There are no rooms on Migrent in ${where} right now.`
        }
      />

      <section className="site-section site-section--flush" aria-labelledby="rooms-list">
        <div className="site-shell">
          <h2 id="rooms-list" className="sr-only">
            Rooms in {place.name}
          </h2>
          {n === 0 ? (
            <div className="site-card site-card--pad flex flex-col items-center text-center">
              <p className="site-h3 site-h3--lg">No rooms here yet</p>
              <p className="site-body mx-auto mt-2 max-w-[52ch]">Search nearby suburbs, or save a search and we&apos;ll email you when a room in {place.name} is listed.</p>
              <Link href={searchHref} className="btn-primary mt-6 inline-flex items-center gap-2">
                <Search className="h-4 w-4" aria-hidden /> Search rooms nearby
              </Link>
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="suburb-rooms">
              {rooms.map((r) => {
                const cost = moveInCost(r);
                return (
                  <li key={r.id}>
                    <Link href={`/listing/${r.id}`} className="group site-card site-card--link block overflow-hidden">
                      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-surface-muted)]">
                        {r.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.images[0]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-sm text-[var(--color-ink-3)]">No photo yet</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="truncate text-[16px] font-semibold text-[var(--color-ink)]">{r.title || `Room in ${place.name}`}</h3>
                        <p className="mt-1 flex items-center gap-1 text-[13px] text-[var(--color-ink-3)]">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {[PLACE_TYPE[r.place_type ?? ""], r.furnished ? "Furnished" : null, r.bills_included ? "Bills included" : null].filter(Boolean).join(" · ") || place.name}
                        </p>
                        <p className="mt-3 text-[18px] font-semibold text-[var(--color-ink)]">
                          ${r.weekly_price}
                          <span className="text-[13px] font-normal text-[var(--color-ink-3)]"> a week</span>
                        </p>
                        <p className="text-[13px] text-[var(--color-ink-2)]">{cost.known && cost.total != null ? `$${cost.total.toLocaleString("en-AU")} to move in` : "Ask the host what is due up front"}</p>
                        {r.newcomer_friendly && <p className="mt-2 text-[12.5px] font-semibold text-[var(--color-primary)]">Happy to rent to people new to Australia</p>}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={searchHref} className="btn-secondary inline-flex items-center gap-2">
              <Search className="h-4 w-4" aria-hidden /> Filter rooms in {place.name}
            </Link>
            <Link href={place.suburbHref} className="btn-secondary inline-flex items-center gap-2">
              Living in {place.name} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
