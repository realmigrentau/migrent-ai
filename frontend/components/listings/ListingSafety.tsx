import { useState } from "react";
import Link from "next/link";
import { Flag, ShieldAlert } from "lucide-react";
import ReportDialog from "../hub/ReportDialog";
import { hubIntentHref } from "./HubActions";

/**
 * The money warning and the way to report this listing, beside the actions
 * on the public listing page (the Hub's view of a home already had both).
 *
 * Signed in, Report opens the same dialog as in Migrent Hub. Signed out, it
 * goes through sign-in and lands back on the home with the dialog open, and
 * anyone without an account can still tell Migrent through the Contact page.
 */
export default function ListingSafety({ listingId, title, signedIn }: { listingId: string; title: string; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const contact = `/contact?topic=SAFETY&subject=${encodeURIComponent(`Listing: ${title}`.slice(0, 110))}`;
  const button = "inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--color-line-2)] px-4 text-[14px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]";
  return (
    <div className="site-card site-card--pad mt-4 space-y-3" data-testid="listing-safety">
      <p className="flex items-start gap-2.5 text-[13.5px] leading-snug text-[var(--color-ink-2)]">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-primary)]" strokeWidth={2} aria-hidden="true" />
        <span>
          Never pay rent or a deposit before you have inspected the room and signed an agreement. A bond goes to your state&apos;s bond authority, not into a host&apos;s bank account.
        </span>
      </p>
      {signedIn ? (
        <button type="button" onClick={() => setOpen(true)} className={button}>
          <Flag className="h-4 w-4" aria-hidden="true" /> Report this listing
        </button>
      ) : (
        <Link href={hubIntentHref(listingId, "report", false)} className={button}>
          <Flag className="h-4 w-4" aria-hidden="true" /> Report this listing
        </Link>
      )}
      {!signedIn && (
        <p className="text-[12.5px] text-[var(--color-ink-3)]">
          No account?{" "}
          <Link href={contact} className="underline underline-offset-2">
            Tell us here
          </Link>
          . If you are in danger, call 000.
        </p>
      )}
      {signedIn && <ReportDialog open={open} onClose={() => setOpen(false)} itemType="listing" itemId={listingId} subject="this listing" />}
    </div>
  );
}
