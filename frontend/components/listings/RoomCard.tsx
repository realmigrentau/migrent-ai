import Link from "next/link";
import { BadgeCheck, CalendarDays } from "lucide-react";
import { HomeImage } from "../hub/ui/Media";
import { placeTypeLabel } from "../../lib/hub/format";

/** One room in a strip or grid: the homepage, and the example listings. */

export type RoomListing = {
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

function price(l: RoomListing): number | null {
  if (l.weekly_price) return Math.round(l.weekly_price);
  if (l.daily_price) return Math.round(l.daily_price * 7);
  return null;
}

/** `href` defaults to the room's public page; example listings pass their own. */
export function RoomCard({ l, href }: { l: RoomListing; href?: string }) {
  const place = [l.suburb, l.city].filter(Boolean).join(", ") || "Australia";
  const title = l.title || "A room on Migrent";
  const p = price(l);
  const verified = l.host_verification?.status === "verified";
  const available = l.available_from ? new Date(l.available_from) : null;
  const now = new Date();
  return (
    <Link href={href ?? `/listing/${l.id}`} className="site-card group flex h-full flex-col overflow-hidden p-2">
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
