import Link from "next/link";
import { MessageCircle, Home } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import VerificationBadge from "../VerificationBadge";
import type { PublicOwner } from "../../lib/api";

interface OwnerCardProps {
  owner: PublicOwner;
  listingId: string;
}

/**
 * The host card on a listing page.
 *
 * Trust state comes from `owner.verification`, computed on the server from
 * owner_verification. The free-text badges array is never rendered as a
 * trust signal: only the achievement badges the API allow-lists appear.
 */
export default function OwnerCard({ owner, listingId }: OwnerCardProps) {
  const name = owner.name || "Host";
  const initial = name.charAt(0).toUpperCase();
  const messageHref = owner.public_id
    ? `/messages?listing=${encodeURIComponent(listingId)}&to=${encodeURIComponent(owner.public_id)}`
    : "/messages";

  return (
    <GlassCard gradient="rose" padding="md">
      <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4">Your host</h2>

      <div className="flex items-start gap-4">
        {owner.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={owner.avatar_url}
            alt=""
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--color-primary-soft)]"
          />
        ) : (
          <div aria-hidden="true" className="w-14 h-14 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center text-[var(--color-primary)] font-bold text-xl ring-2 ring-[var(--color-primary-soft)]">
            {initial}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-bold text-[var(--color-ink)] text-base">
            {owner.public_id ? (
              <Link href={`/users/profile/${encodeURIComponent(owner.public_id)}`} className="hover:underline underline-offset-2">
                {name}
              </Link>
            ) : (
              name
            )}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[var(--color-ink-3)]">
            {typeof owner.listings_count === "number" && owner.listings_count > 0 && (
              <span className="flex items-center gap-1">
                <Home className="w-3 h-3" aria-hidden="true" />
                {owner.listings_count} live listing{owner.listings_count !== 1 ? "s" : ""}
              </span>
            )}
            {owner.member_since && <span>Member since {new Date(owner.member_since).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}</span>}
          </div>

          {owner.bio && <p className="text-sm text-[var(--color-ink-2)] mt-2 line-clamp-3">{owner.bio}</p>}

          {owner.achievement_badges.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 mt-3 list-none p-0 m-0" aria-label="Host achievements">
              {owner.achievement_badges.slice(0, 4).map((badge) => (
                <li key={badge} className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-2)]">
                  {badge}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <VerificationBadge verification={owner.verification} variant="panel" className="mt-4" />

      <Link
        href={messageHref}
        className="mt-4 w-full flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-[var(--color-line)] text-sm font-semibold text-[var(--color-ink-2)] hover:bg-[var(--color-surface)] transition-colors"
      >
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        Message {name}
      </Link>
    </GlassCard>
  );
}
