import Link from "next/link";
import { ArrowRight, Globe, MapPin, Star } from "lucide-react";

interface MentorCardProps {
  id: string;
  name: string;
  photo?: string;
  suburb: string;
  languages: string[];
  bio?: string;
  specialties: string[];
  hourlyRate: number; // cents
  rating: number;
  reviewCount: number;
}

/**
 * One mentor in the /mentors list. There is no "Verified" tag: the flag the
 * old card read (profiles.verified) was set by a paid badge that checked no
 * documents, so it said more than it meant.
 */
export default function MentorCard({ id, name, photo, suburb, languages, bio, specialties, hourlyRate, rating, reviewCount }: MentorCardProps) {
  const price = `$${(hourlyRate / 100).toFixed(0)}`;
  return (
    <article className="site-card site-card--link flex gap-4 p-5 sm:gap-5 sm:p-6">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-primary-soft)]">
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-[color:var(--color-primary-700)]" aria-hidden="true">
            {name?.charAt(0).toUpperCase() || "M"}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="site-h3">
          <Link href={`/mentor/${id}`} className="after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none">
            {name}
          </Link>
        </h3>
        <p className="site-meta mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {suburb}
          </span>
          {rating > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-[var(--color-warn-500)] text-[var(--color-warn-500)]" aria-hidden="true" />
              {rating.toFixed(1)}
              <span className="sr-only"> out of 5 from</span> ({reviewCount}
              <span className="sr-only"> reviews</span>)
            </span>
          )}
        </p>
        {bio && <p className="site-body mt-2 line-clamp-2">{bio}</p>}
        {(languages.length > 0 || specialties.length > 0) && (
          <ul className="m-0 mt-3 flex list-none flex-wrap gap-1.5 p-0">
            {languages.slice(0, 3).map((lang) => (
              <li key={lang} className="site-chip !h-7 !text-[12px]">
                <Globe className="h-3 w-3" aria-hidden="true" />
                {lang}
              </li>
            ))}
            {specialties.slice(0, 2).map((spec) => (
              <li key={spec} className="site-chip !h-7 !text-[12px]">
                {spec}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2 text-right">
        <p className="m-0 text-[20px] font-semibold tracking-[-0.01em] text-[var(--color-ink)] tabular-nums">
          {price}
          <span className="block text-[12px] font-normal text-[var(--color-ink-3)]">a session</span>
        </p>
        <ArrowRight className="h-4 w-4 text-[var(--color-ink-4)]" aria-hidden="true" />
      </div>
    </article>
  );
}
