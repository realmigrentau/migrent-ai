import Link from "next/link";
import { BadgeCheck, Clock, Home, MessageSquare, PencilLine, Star } from "lucide-react";
import { UserProfile, ProfileBadges } from "../../hooks/useUserProfile";
import { hubFromSite } from "../../lib/hub/routes";

interface HeroHeaderProps {
  profile: UserProfile;
  badges: ProfileBadges;
  isOwnProfile: boolean;
  listingsCount: number;
  onMessage?: () => void;
  onVerifyClick?: () => void;
}

/**
 * The top of a public profile. Since the 2026-09-29 redesign it sits on the
 * site's calm canvas like every other page, instead of white text on a
 * gradient panel. Numbers only appear once they are real (see
 * useUserProfile: response rate and reply time are null until measurable).
 */
export default function HeroHeader({ profile, badges, isOwnProfile, listingsCount, onVerifyClick }: HeroHeaderProps) {
  const displayName = profile.preferred_name || profile.name || "User";

  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
      <button
        type="button"
        onClick={onVerifyClick}
        aria-label={`What we have checked about ${displayName}`}
        className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[32px] bg-[var(--color-primary-soft)] md:h-32 md:w-32"
      >
        {profile.custom_pfp ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.custom_pfp} alt="" width={128} height={128} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl font-semibold text-[color:var(--color-primary-700)]" aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className="eyebrow">{profile.member_since_label ? `On Migrent since ${profile.member_since_label}` : "On Migrent"}</p>
        <h1 className="site-h2 mt-2 !text-[clamp(2.2rem,4.4vw,3.4rem)]">{displayName}</h1>

        <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
          {badges.isVerified && (
            <li className="site-chip">
              <BadgeCheck className="h-3.5 w-3.5 text-[color:var(--color-primary)]" aria-hidden="true" /> ID checked
            </li>
          )}
          {badges.isHighlyRated && (
            <li className="site-chip">
              <Star className="h-3.5 w-3.5 fill-[var(--color-warn-500)] text-[var(--color-warn-500)]" aria-hidden="true" /> Highly rated
            </li>
          )}
        </ul>

        {(profile.about_me || profile.bio) && <p className="site-body mt-3 max-w-[60ch] line-clamp-3">{profile.about_me || profile.bio}</p>}

        <dl className="m-0 mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-[var(--color-ink-2)]">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-[var(--color-ink-3)]" aria-hidden="true" />
            <dt className="sr-only">Rating</dt>
            <dd className="m-0">{profile.average_rating > 0 ? `${profile.average_rating.toFixed(1)} from ${profile.reviews_count} review${profile.reviews_count === 1 ? "" : "s"}` : "No reviews yet"}</dd>
          </div>
          {profile.response_rate !== null && (
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-[var(--color-ink-3)]" aria-hidden="true" />
              <dt className="sr-only">Response rate</dt>
              <dd className="m-0">Replies to {profile.response_rate}% of messages</dd>
            </div>
          )}
          {profile.response_time !== null && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[var(--color-ink-3)]" aria-hidden="true" />
              <dt className="sr-only">Usual reply time</dt>
              <dd className="m-0">{profile.response_time === "occasionally" ? "Replies occasionally" : `Usually replies ${profile.response_time}`}</dd>
            </div>
          )}
          {listingsCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Home className="h-4 w-4 text-[var(--color-ink-3)]" aria-hidden="true" />
              <dt className="sr-only">Listings</dt>
              <dd className="m-0">
                {listingsCount} listing{listingsCount === 1 ? "" : "s"}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          {isOwnProfile ? (
            <Link href={hubFromSite.path("/profile")} className="btn-secondary">
              <PencilLine className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> Edit your profile
            </Link>
          ) : (
            <>
              <Link href={`/messages?userId=${profile.id}`} className="btn-primary">
                <MessageSquare className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> Message
              </Link>
              {listingsCount > 0 && (
                <a href="#listings" className="btn-secondary">
                  See listings
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
