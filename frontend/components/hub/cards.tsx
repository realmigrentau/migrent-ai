import { useState, type ReactNode } from "react";
import IdVerifiedBadge from "./IdVerifiedBadge";
import { Bath, BedDouble, CalendarDays, Car, ChevronRight, Heart, MapPin, Paperclip, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/cn";
import { aud, day, inboxStamp, placeTypeLabel, propertyTypeLabel, weekly, whenLabel } from "../../lib/hub/format";
import { applicationCopy } from "../../lib/hub/status";
import type { ApplicationSummary, InspectionBooking, ListingCard, Thread } from "../../lib/hub/types";
import { useSavedHomes } from "../../lib/hub/saved";
import { useToast } from "../ui/Toast";
import HubLink from "./HubLink";
import { Avatar, HomeImage } from "./ui/Media";
import { StatusBadge } from "./ui/Feedback";

/* ── Save heart ── */

export function SaveButton({ listingId, title, className, tone = "glass" }: { listingId: string; title: string; className?: string; tone?: "glass" | "plain" }) {
  const { ids, toggle } = useSavedHomes();
  const toast = useToast();
  const saved = ids.has(listingId);
  const [pop, setPop] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!saved) {
          setPop(true);
          window.setTimeout(() => setPop(false), 450);
        }
        try {
          await toggle(listingId, !saved);
          if (!saved) toast.success("Saved", { description: "Find it any time under Saved." });
        } catch (err) {
          toast.error((err as Error).message || "That did not save. Please try again.");
        }
      }}
      className={cn(
        "hub-press inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        tone === "glass" ? "bg-[var(--color-glass)] backdrop-blur-md border border-[var(--color-glass-line)] hover:bg-[var(--color-surface)]" : "hover:bg-[var(--color-surface-hover)]",
        className,
      )}
    >
      <Heart
        className={cn("h-[18px] w-[18px] transition-colors", pop && "hub-heart-pop", saved ? "fill-[var(--color-coral-500)] text-[color:var(--color-coral-500)]" : "text-[color:var(--color-ink)]")}
        strokeWidth={1.9}
        aria-hidden
      />
    </button>
  );
}

/* ── Home card ── */

export function HomeFacts({ listing, className }: { listing: ListingCard; className?: string }) {
  const facts: { icon: ReactNode; label: string }[] = [];
  if (listing.bedrooms) facts.push({ icon: <BedDouble className="h-3.5 w-3.5" strokeWidth={1.75} />, label: `${listing.bedrooms} bed` });
  if (listing.bathrooms) facts.push({ icon: <Bath className="h-3.5 w-3.5" strokeWidth={1.75} />, label: `${listing.bathrooms} bath` });
  if (listing.parking) facts.push({ icon: <Car className="h-3.5 w-3.5" strokeWidth={1.75} />, label: "Parking" });
  if (!facts.length) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[color:var(--color-ink-2)]", className)}>
      {facts.map((f) => (
        <li key={f.label} className="inline-flex items-center gap-1">
          <span aria-hidden className="text-[color:var(--color-ink-3)]">
            {f.icon}
          </span>
          {f.label}
        </li>
      ))}
    </ul>
  );
}

export function kindLabel(l: ListingCard): string {
  const place = placeTypeLabel(l.place_type);
  const type = propertyTypeLabel(l.property_type);
  if (place && place !== "Entire place") return type ? `${place} in a ${type.toLowerCase()}` : place;
  return type || place || "Home";
}

interface HomeCardProps {
  listing: ListingCard;
  to?: string;
  saveable?: boolean;
  badge?: ReactNode;
  footer?: ReactNode;
  priority?: boolean;
  size?: "md" | "sm";
  onHover?: (id: string | null) => void;
  active?: boolean;
}

/** The property card. Photography first, then price, place and facts. */
export function HomeCard({ listing, to, saveable = true, badge, footer, priority, size = "md", onHover, active }: HomeCardProps) {
  const href = to ?? `/homes/${listing.id}`;
  const unavailable = listing.public_state !== "published";
  return (
    <article
      className={cn("group relative flex flex-col gap-3", active && "rounded-[20px] ring-2 ring-[var(--color-primary)] ring-offset-4 ring-offset-[var(--color-canvas)]")}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <HubLink to={href} className="hub-card-link flex flex-col gap-3 rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-4">
        <HomeImage src={listing.image} alt={listing.title} priority={priority} className={size === "sm" ? "aspect-[4/3]" : "aspect-[4/3]"} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px">
          {unavailable && (
            <div className="absolute inset-0 flex items-end bg-[rgb(9_11_16/0.45)] p-3">
              <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[12px] font-semibold text-[color:var(--color-ink)]">No longer available</span>
            </div>
          )}
          {badge && <div className="absolute left-3 top-3">{badge}</div>}
        </HomeImage>
        <div className="flex flex-col gap-1 px-0.5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[16px] font-bold tracking-[-0.01em] text-[color:var(--color-ink)] tabular-nums">{weekly(listing.weekly_price)}</p>
            {typeof listing.price_change === "number" && listing.price_change !== 0 && (
              <span className={cn("inline-flex items-center gap-1 text-[12.5px] font-semibold", listing.price_change < 0 ? "text-[color:var(--color-success-500)]" : "text-[color:var(--color-ink-3)]")}>
                {listing.price_change < 0 ? <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> : <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}
                {listing.price_change < 0 ? `${aud(Math.abs(listing.price_change))} less` : `${aud(listing.price_change)} more`} since saved
              </span>
            )}
          </div>
          <h3 className={cn("line-clamp-1 font-semibold text-[color:var(--color-ink)]", size === "sm" ? "text-[14.5px]" : "text-[15px]")}>{listing.title}</h3>
          <p className="flex items-center gap-1 text-[13.5px] text-[color:var(--color-ink-2)]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
            <span className="truncate">
              {kindLabel(listing)} · {listing.display_address}
            </span>
          </p>
          {size === "md" && <HomeFacts listing={listing} className="mt-0.5" />}
          {listing.reasons && listing.reasons.length > 0 && (
            <p className="mt-1 line-clamp-1 text-[12.5px] font-medium text-[color:var(--color-primary)]">{listing.reasons.join(" · ")}</p>
          )}
        </div>
      </HubLink>
      {saveable && !unavailable && <SaveButton listingId={listing.id} title={listing.title} className="absolute right-3 top-3" />}
      {footer}
    </article>
  );
}

/* ── A compact row for a listing (lists, side panels) ── */

export function HomeRow({ listing, to, trailing, meta }: { listing: ListingCard | null; to?: string; trailing?: ReactNode; meta?: ReactNode }) {
  if (!listing) return null;
  const body = (
    <>
      <HomeImage src={listing.image} alt="" className="h-16 w-16 shrink-0 sm:h-[72px] sm:w-[72px]" rounded="rounded-[14px]" sizes="80px" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">
          {listing.unit_label ? `${listing.unit_label} · ` : ""}
          {listing.title}
        </p>
        <p className="truncate text-[13.5px] text-[color:var(--color-ink-2)]">
          {weekly(listing.weekly_price)} · {listing.display_address}
        </p>
        {meta && <div className="mt-1">{meta}</div>}
      </div>
      {trailing}
    </>
  );
  if (!to) return <div className="flex items-center gap-4">{body}</div>;
  return (
    <HubLink to={to} className="group flex items-center gap-4 rounded-[16px] p-2 -m-2 transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
      {body}
      <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--color-ink-4)] transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
    </HubLink>
  );
}

/* ── Application ── */

export function ApplicationCard({ app, side = "renter" }: { app: ApplicationSummary; side?: "renter" | "owner" }) {
  const copy = applicationCopy(app.status, side);
  const to = app.status === "draft" && side === "renter" && app.listing ? `/apply/${app.listing.id}` : `/applications/${app.id}`;
  return (
    <HubLink
      to={to}
      className="hub-lift group flex flex-col gap-4 rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <HomeImage src={app.listing?.image} alt="" className="h-16 w-20 shrink-0" rounded="rounded-[14px]" sizes="96px" />
        <div className="flex min-w-0 flex-col gap-1">
          {side === "owner" && app.person ? (
            <div className="flex items-center gap-2">
              <Avatar name={app.person.name} src={app.person.avatar_url} size={22} />
              <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">{app.person.name}</p>
              {(app.id_verified || app.person.id_verified) && <IdVerifiedBadge size="sm" />}
              {app.unread_by_owner && <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]" aria-label="New" />}
            </div>
          ) : (
            <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">{app.listing?.title ?? "Home"}</p>
          )}
          <p className="truncate text-[13.5px] text-[color:var(--color-ink-2)]">
            {side === "owner" ? `${app.listing?.unit_label ? `${app.listing.unit_label}, ` : ""}${app.listing?.title ?? ""}` : app.listing?.display_address}
          </p>
          <p className="text-[12.5px] text-[color:var(--color-ink-3)]">
            {app.move_in_date ? `Move in ${day(app.move_in_date, { year: false })}` : "Move-in date not set"}
            {app.occupants ? ` · ${app.occupants} ${app.occupants === 1 ? "person" : "people"}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <StatusBadge tone={copy.tone}>{copy.label}</StatusBadge>
        <span className="text-[12.5px] text-[color:var(--color-ink-3)]">{copy.detail !== copy.label ? copy.detail : ""}</span>
      </div>
    </HubLink>
  );
}

/* ── Inspection ── */

export function InspectionCard({ booking, actions }: { booking: InspectionBooking; actions?: ReactNode }) {
  const l = booking.listing;
  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="flex gap-4 p-4">
        <HomeImage src={l?.image} alt="" className="h-20 w-24 shrink-0" rounded="rounded-[14px]" sizes="100px" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--color-primary)]">
            <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {whenLabel(booking.slot.starts_at, l?.timezone)}
          </p>
          <HubLink to={`/homes/${l?.id}`} className="truncate text-[15px] font-semibold text-[color:var(--color-ink)] hover:underline">
            {l?.title}
          </HubLink>
          <p className="truncate text-[13.5px] text-[color:var(--color-ink-2)]">{l?.street_address ? `${l.street_address}, ${l.display_address}` : l?.display_address}</p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2 border-t border-[var(--color-line)] px-4 py-3">{actions}</div>}
    </article>
  );
}

/* ── Conversation preview ── */

export function ThreadRow({ thread, active }: { thread: Thread; active?: boolean }) {
  const unread = thread.unread_count > 0;
  return (
    <HubLink
      to={`/messages/${thread.key}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-start gap-3 rounded-[16px] p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]",
        active ? "bg-[var(--color-primary-soft)]" : "hover:bg-[var(--color-surface-hover)]",
      )}
    >
      <div className="relative shrink-0">
        {thread.listing?.image ? (
          <HomeImage src={thread.listing.image} alt="" className="h-12 w-12" rounded="rounded-[12px]" sizes="48px" />
        ) : (
          <Avatar name={thread.other.name} src={thread.other.avatar_url} size={48} />
        )}
        {thread.listing && (
          <span className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-[var(--color-surface)]">
            <Avatar name={thread.other.name} src={thread.other.avatar_url} size={22} />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <p className={cn("truncate text-[14.5px] text-[color:var(--color-ink)]", unread ? "font-bold" : "font-semibold")}>{thread.other.name}</p>
            {thread.other.id_verified && <IdVerifiedBadge size="sm" />}
          </span>
          <span className={cn("shrink-0 text-[12px]", unread ? "font-semibold text-[color:var(--color-primary)]" : "text-[color:var(--color-ink-3)]")}>{inboxStamp(thread.last_message.created_at)}</span>
        </div>
        {thread.listing && <p className="truncate text-[12.5px] font-medium text-[color:var(--color-ink-3)]">{thread.listing.unit_label ? `${thread.listing.unit_label} · ` : ""}{thread.listing.title}</p>}
        <div className="flex items-center justify-between gap-2">
          <p className={cn("line-clamp-1 text-[13.5px]", unread ? "font-medium text-[color:var(--color-ink)]" : "text-[color:var(--color-ink-2)]")}>
            {thread.last_message.from_me && <span className="text-[color:var(--color-ink-3)]">You: </span>}
            {thread.last_message.has_attachment && <Paperclip className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.75} aria-label="Attachment" />}
            {thread.last_message.text}
          </p>
          {unread && (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[11px] font-bold text-[color:var(--color-primary-fg)]" aria-label={`${thread.unread_count} unread`}>
              {thread.unread_count}
            </span>
          )}
        </div>
      </div>
    </HubLink>
  );
}

/** A horizontal rail of cards that scrolls on phones and wraps into a grid on desktop. */
export function CardRail({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("hub-scroll-x -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&>*]:w-[78%] [&>*]:shrink-0 sm:[&>*]:w-auto", className)}>
      {children}
    </div>
  );
}
