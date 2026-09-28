import type { ReactNode } from "react";
import { Briefcase, FileText, Home, Info, PawPrint, Star, Users } from "lucide-react";
import { aud, bytes, day } from "../../../lib/hub/format";
import type { ApplicationSnapshot, DocumentMeta } from "../../../lib/hub/types";
import { docKindLabel } from "../profile/sections";

const EMPLOYMENT: Record<string, string> = { employed: "Employed", self_employed: "Self-employed", student: "Studying", looking: "Looking for work", retired: "Retired", other: "Other" };

export function Block({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 border-t border-[var(--color-line)] py-5 first:border-0 first:pt-0">
      <span aria-hidden className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-surface-muted)] text-[color:var(--color-ink-2)]">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">{title}</h3>
        <div className="text-[14.5px] leading-relaxed text-[color:var(--color-ink-2)]">{children}</div>
      </div>
    </div>
  );
}

/**
 * An applicant as the owner sees them: the snapshot taken when the
 * application was sent. The Rental Profile preview renders the same thing,
 * so renters see exactly what an owner will.
 */
export default function ApplicantSnapshot({ s, documents }: { s: ApplicationSnapshot; documents: (DocumentMeta & { url?: string | null })[] }) {
  return (
    <>
      <Block icon={<Info className="h-[18px] w-[18px]" strokeWidth={1.75} />} title="About">
        {s.intro || "No introduction."}
      </Block>
      <Block icon={<Users className="h-[18px] w-[18px]" strokeWidth={1.75} />} title="Household">
        {s.household.adults} adult{s.household.adults === 1 ? "" : "s"}
        {s.household.children ? `, ${s.household.children} child${s.household.children === 1 ? "" : "ren"}` : ""}
        {s.household.has_pets ? (
          <span className="mt-1 flex items-center gap-1.5">
            <PawPrint className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {s.household.pet_details || "Has pets"}
          </span>
        ) : null}
        {s.household.notes && <span className="mt-1 block">{s.household.notes}</span>}
      </Block>
      <Block icon={<Briefcase className="h-[18px] w-[18px]" strokeWidth={1.75} />} title="Work and income">
        {[EMPLOYMENT[s.employment.status ?? ""] ?? "Not given", s.employment.job_title, s.employment.employer].filter(Boolean).join(" · ")}
        {s.employment.since && <span className="block">Since {day(s.employment.since)}</span>}
        <span className="block">{s.income_weekly ? `Income: ${aud(s.income_weekly)} a week` : "Income not shared"}</span>
      </Block>
      <Block icon={<Home className="h-[18px] w-[18px]" strokeWidth={1.75} />} title="Rental history">
        {s.rental_history.length ? (
          <ul className="flex flex-col gap-2">
            {s.rental_history.map((h, i) => (
              <li key={i}>
                <span className="font-semibold text-[color:var(--color-ink)]">{h.suburb}</span>
                {h.country && h.country !== "Australia" ? `, ${h.country}` : ""}
                {h.from_month ? ` · ${h.from_month} to ${h.to_month || "now"}` : ""}
                {h.weekly_rent ? ` · ${aud(h.weekly_rent)} a week` : ""}
                {h.landlord_name ? ` · ${h.landlord_name}` : ""}
                {h.reason_for_leaving && <span className="block text-[13.5px] text-[color:var(--color-ink-3)]">{h.reason_for_leaving}</span>}
              </li>
            ))}
          </ul>
        ) : s.first_time_renter ? (
          "This is their first rental in Australia."
        ) : (
          "None given."
        )}
      </Block>
      <Block icon={<Star className="h-[18px] w-[18px]" strokeWidth={1.75} />} title="Referees">
        {s.referees.length ? (
          <ul className="flex flex-col gap-2">
            {s.referees.map((r, i) => (
              <li key={i}>
                <span className="font-semibold text-[color:var(--color-ink)]">{r.name}</span> · {r.relationship}
                <span className="block text-[13.5px]">{[r.email, r.phone].filter(Boolean).join(" · ") || "No contact details"}</span>
              </li>
            ))}
          </ul>
        ) : (
          "None given."
        )}
      </Block>
      <Block icon={<FileText className="h-[18px] w-[18px]" strokeWidth={1.75} />} title="Documents">
        {documents.length ? (
          <ul className="flex flex-col gap-2">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-3">
                <span>
                  <span className="font-semibold text-[color:var(--color-ink)]">{doc.label || docKindLabel(doc.kind)}</span> · {bytes(doc.size_bytes)}
                </span>
                {doc.url ? (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[13.5px] font-semibold text-[color:var(--color-primary)] hover:underline">
                    Open
                  </a>
                ) : (
                  <span className="text-[12.5px] text-[color:var(--color-ink-4)]">No longer available</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          "None shared."
        )}
        {documents.some((x) => x.url) && <span className="mt-1 block text-[12.5px] text-[color:var(--color-ink-4)]">Links expire after a few minutes and stop working once this application closes.</span>}
      </Block>
    </>
  );
}
