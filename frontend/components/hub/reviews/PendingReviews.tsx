import { useState } from "react";
import { Star } from "lucide-react";
import { day } from "../../../lib/hub/format";
import { useHubQuery } from "../../../lib/hub/query";
import type { ListingCard, Person } from "../../../lib/hub/types";
import { Button } from "../ui/Button";
import { Section } from "../ui/Layout";
import { HomeImage } from "../ui/Media";
import ReviewDialog from "./ReviewDialog";

export interface PendingReview {
  kind: "tenancy" | "stay";
  id: string;
  direction: "seeker_to_owner" | "owner_to_seeker";
  listing: ListingCard | null;
  other: Person;
  closes_on: string | null;
}

/**
 * Tenancies and stays waiting for your review (GET /hub/reviews/pending).
 * Shows nothing when there are none. On a tenancy's page, `only` limits it
 * to that tenancy.
 */
export default function PendingReviews({ only, title = "Reviews to write" }: { only?: string; title?: string }) {
  const { data, refetch } = useHubQuery<{ pending: PendingReview[] }>("/hub/reviews/pending");
  const [open, setOpen] = useState<PendingReview | null>(null);
  const items = (data?.pending ?? []).filter((p) => !only || p.id === only);
  if (!items.length) return null;

  return (
    <Section title={title} description="Your review helps the next person choose well. Neither of you sees the other's until you have both written one, or 14 days pass.">
      <ul className="flex flex-col gap-3" data-testid="pending-reviews">
        {items.map((p) => {
          const asRenter = p.direction === "seeker_to_owner";
          const name = p.other.name.split(" ")[0];
          return (
            <li key={`${p.kind}-${p.id}`} className="flex flex-wrap items-center gap-4 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <HomeImage src={p.listing?.image ?? null} alt="" className="h-14 w-20 shrink-0" rounded="rounded-[12px]" sizes="80px" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">
                  {asRenter ? `Review ${p.listing?.title || "your home"}` : `Review ${name} as a renter`}
                </p>
                <p className="text-[13px] text-[color:var(--color-ink-3)]">
                  {p.kind === "stay" ? "Your stay" : "Your tenancy"}
                  {asRenter ? ` with ${name}` : p.listing?.title ? ` at ${p.listing.title}` : ""}
                  {p.closes_on ? ` · open until ${day(p.closes_on)}` : ""}
                </p>
              </div>
              <Button size="sm" icon={<Star className="h-4 w-4" strokeWidth={1.9} />} onClick={() => setOpen(p)}>
                Write a review
              </Button>
            </li>
          );
        })}
      </ul>
      <ReviewDialog item={open} open={Boolean(open)} onClose={() => setOpen(null)} onDone={() => void refetch().catch(() => {})} />
    </Section>
  );
}
