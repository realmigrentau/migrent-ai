import Link from "next/link";
import { GitCompareArrows, Share2 } from "lucide-react";
import { useToast } from "../ui/Toast";
import { useCompare } from "../../lib/hub/compare";
import { hubFromSite } from "../../lib/hub/routes";

/**
 * Share and Compare on the public listing page, the same two tools the
 * Hub's view of a home has (MIGRENT_MASTER_AUDIT MIG-043). The compare tray
 * is the Hub's (kept in this browser), so homes added here show up there.
 */
export default function ListingTools({ listingId, title }: { listingId: string; title: string }) {
  const toast = useToast();
  const compare = useCompare();
  const inCompare = compare.has(listingId);

  const share = async () => {
    const url = `${window.location.origin}/listing/${listingId}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* dismissed */
    }
  };

  const button =
    "inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[var(--color-line-2)] px-4 text-[13.5px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] aria-pressed:border-[var(--color-primary)] aria-pressed:bg-[var(--color-primary-soft)]";

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="listing-tools">
      <button type="button" className={button} onClick={() => void share()}>
        <Share2 className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
        Share
      </button>
      <button
        type="button"
        className={button}
        aria-pressed={inCompare}
        onClick={() => {
          if (!inCompare && compare.full) return toast.info("You can compare up to four homes. Remove one first.");
          compare.toggle(listingId);
        }}
      >
        <GitCompareArrows className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
        {inCompare ? "Added to compare" : "Compare"}
      </button>
      {compare.ids.length >= 2 && (
        <Link href={hubFromSite.path(`/compare?ids=${compare.ids.join(",")}`)} className="text-[13.5px] font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline">
          Compare {compare.ids.length} homes
        </Link>
      )}
    </div>
  );
}
