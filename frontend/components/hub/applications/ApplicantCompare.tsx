import { useEffect, useState, type ReactNode } from "react";
import { Scale } from "lucide-react";
import { hubApi } from "../../../lib/hub/api";
import { aud, day } from "../../../lib/hub/format";
import { siteUrl } from "../../../lib/hub/routes";
import type { ApplicationDetail } from "../../../lib/hub/types";
import HubLink from "../HubLink";
import { InlineAlert, Skeleton } from "../ui/Feedback";
import { Avatar } from "../ui/Media";
import { Dialog } from "../ui/Overlay";

const EMPLOYMENT: Record<string, string> = { employed: "Employed", self_employed: "Self-employed", student: "Studying", looking: "Looking for work", retired: "Retired", other: "Other" };

/**
 * Two or three applicants side by side, on the facts that bear on a
 * tenancy. There is no score and nothing is ranked: the owner decides, and
 * Migrent's fair housing policy applies.
 */
export default function ApplicantCompare({ open, ids, onClose }: { open: boolean; ids: string[]; onClose: () => void }) {
  const [items, setItems] = useState<ApplicationDetail[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setItems(null);
    setFailed(false);
    Promise.all(ids.map((id) => hubApi.get<ApplicationDetail>(`/hub/applications/${id}`)))
      .then((res) => alive && setItems(res))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [open, ids]);

  const rows: { label: string; value: (d: ApplicationDetail) => ReactNode }[] = [
    { label: "Home", value: (d) => `${d.listing?.unit_label ? `${d.listing.unit_label} · ` : ""}${d.listing?.title ?? ""}` },
    { label: "Move in", value: (d) => (d.application.move_in_date ? day(d.application.move_in_date) : "-") },
    { label: "Stay", value: (d) => (d.application.lease_months ? `${d.application.lease_months} months` : "Flexible") },
    { label: "People", value: (d) => `${d.application.occupants ?? "-"}${d.snapshot?.household.has_pets ? ", with pets" : ""}` },
    { label: "Work", value: (d) => [EMPLOYMENT[d.snapshot?.employment.status ?? ""] ?? "-", d.snapshot?.employment.employer].filter(Boolean).join(" · ") },
    { label: "Income", value: (d) => (d.snapshot?.income_weekly ? `${aud(d.snapshot.income_weekly)} a week` : "Not shared") },
    { label: "Rental history", value: (d) => (d.snapshot?.rental_history.length ? `${d.snapshot.rental_history.length} previous home${d.snapshot.rental_history.length === 1 ? "" : "s"}` : d.snapshot?.first_time_renter ? "First rental in Australia" : "None given") },
    { label: "Referees", value: (d) => d.snapshot?.referees.length ?? 0 },
    { label: "Documents", value: (d) => d.documents.length },
  ];

  return (
    <Dialog open={open} onClose={onClose} title="Compare applicants" description="The same facts for each, side by side. Nothing is scored." size="lg">
      <div className="flex flex-col gap-4 pb-4">
        {failed ? (
          <InlineAlert tone="danger">These applications could not load. Close this and try again.</InlineAlert>
        ) : !items ? (
          <div className="grid grid-cols-2 gap-4" aria-busy="true">
            {ids.map((id) => (
              <Skeleton key={id} className="h-64 rounded-[16px]" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <caption className="sr-only">Applicants compared</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-[120px] p-2">
                    <span className="sr-only">Detail</span>
                  </th>
                  {items.map((d) => (
                    <th key={d.application.id} scope="col" className="p-2 align-bottom">
                      <HubLink to={`/applications/${d.application.id}`} className="flex items-center gap-2.5 rounded-[10px] hover:underline" onClick={onClose}>
                        <Avatar name={d.snapshot?.name || d.renter?.name} size={32} />
                        <span className="text-[14.5px] font-semibold text-[color:var(--color-ink)]">{d.snapshot?.name || d.renter?.name}</span>
                      </HubLink>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t border-[var(--color-line)]">
                    <th scope="row" className="p-2 py-3 text-[13px] font-medium text-[color:var(--color-ink-3)]">
                      {r.label}
                    </th>
                    {items.map((d) => (
                      <td key={d.application.id} className="p-2 py-3 text-[14px] text-[color:var(--color-ink)]">
                        {r.value(d)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="flex items-start gap-2 text-[13px] leading-snug text-[color:var(--color-ink-3)]">
          <Scale className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>
            Decide on the tenancy, not the person's background. It's unlawful to refuse someone because of race, nationality, religion, sex, disability, family status and other protected attributes.{" "}
            <a href={siteUrl("/anti-discrimination")} className="font-semibold text-[color:var(--color-primary)] hover:underline" target="_blank" rel="noreferrer">
              Migrent's fair housing policy
            </a>
          </span>
        </p>
      </div>
    </Dialog>
  );
}
