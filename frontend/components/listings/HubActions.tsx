import Link from "next/link";
import { CalendarClock, FileText, Heart, MessageCircle } from "lucide-react";
import { hubFromSite } from "../../lib/hub/routes";

type Intent = "apply" | "inspect" | "message" | "save";

/**
 * Where a listing hands off to Migrent Hub. Signed in, each action opens the
 * listing in the Hub and does the thing; signed out, it goes through Hub
 * sign-in first (with a line saying why) and then does it.
 */
export function hubIntentHref(listingId: string, intent: Intent, signedIn: boolean): string {
  const target = intent === "apply" ? `/apply/${listingId}` : `/homes/${listingId}?intent=${intent}`;
  if (signedIn) return hubFromSite.path(target);
  return hubFromSite.path(`/sign-in?next=${encodeURIComponent(target)}&intent=${intent}`);
}

export default function HubActions({ listingId, ownerName, signedIn, shortStay }: { listingId: string; ownerName?: string | null; signedIn: boolean; shortStay?: boolean }) {
  const first = (ownerName || "the owner").split(" ")[0];
  const secondary = "flex items-center justify-center gap-2 min-h-[44px] rounded-xl border border-[var(--color-line-2)] px-4 text-[14px] font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] transition-colors";
  return (
    <div className="site-card site-card--pad space-y-3">
      {!shortStay && (
        <>
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">Interested in this home?</p>
          <p className="text-[13px] leading-snug text-[var(--color-ink-3)]">Apply with one Rental Profile, book an inspection or ask {first} a question. It all happens in Migrent Hub.</p>
          <Link href={hubIntentHref(listingId, "apply", signedIn)} className="flex items-center justify-center gap-2 w-full btn-primary min-h-[48px] rounded-xl text-[15px] font-semibold">
            <FileText className="w-4 h-4" aria-hidden="true" />
            Apply for this home
          </Link>
          <Link href={hubIntentHref(listingId, "inspect", signedIn)} className={secondary}>
            <CalendarClock className="w-4 h-4" aria-hidden="true" />
            Book an inspection
          </Link>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Link href={hubIntentHref(listingId, "message", signedIn)} className={secondary}>
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          Message
        </Link>
        <Link href={hubIntentHref(listingId, "save", signedIn)} className={secondary}>
          <Heart className="w-4 h-4" aria-hidden="true" />
          Save
        </Link>
      </div>
      {!signedIn && (
        <p className="text-center text-[12.5px] text-[var(--color-ink-3)]">
          Free for renters. <Link href={hubFromSite.signUp()} className="font-semibold text-[var(--color-primary)] hover:underline">Create an account</Link>
        </p>
      )}
    </div>
  );
}
