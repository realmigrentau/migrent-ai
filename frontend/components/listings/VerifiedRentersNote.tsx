import { BadgeCheck } from "lucide-react";
import { hubFromSite } from "../../lib/hub/routes";

/** Shown on a listing whose owner only accepts ID-verified renters (backend renter_id.py). */
export default function VerifiedRentersNote({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-2.5 rounded-[14px] border border-[#86EFAC] bg-[#F0FDF4] px-3.5 py-3 text-[13px] leading-relaxed text-[#14532D] dark:border-[#166534] dark:bg-[#052E16] dark:text-[#BBF7D0] ${className}`} data-testid="verified-renters-note">
      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      <p className="m-0">
        This owner only accepts renters with a verified ID.{" "}
        <a href={hubFromSite.path("/profile#verification")} className="font-semibold underline underline-offset-2">
          Get your green badge
        </a>
      </p>
    </div>
  );
}
