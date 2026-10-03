import { BadgeCheck } from "lucide-react";
import { cn } from "../../lib/cn";

export const ID_VERIFIED_MEANING =
  "This renter's photo ID was checked as genuine and a live selfie matched it (Stripe Identity, paid for by the renter). Migrent keeps the name on the ID, so it can help if something goes wrong.";

/** The green badge for a renter who passed Migrent's ID check (backend renter_id.py). */
export default function IdVerifiedBadge({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  return (
    <span
      title={ID_VERIFIED_MEANING}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[#DCFCE7] font-semibold text-[#166534] dark:bg-[#14532D] dark:text-[#BBF7D0]",
        size === "sm" ? "h-5 px-1.5 text-[11.5px]" : "h-6 px-2.5 text-[12.5px]",
        className,
      )}
      data-testid="id-verified-badge"
    >
      <BadgeCheck className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={2.2} aria-hidden />
      ID verified
    </span>
  );
}
