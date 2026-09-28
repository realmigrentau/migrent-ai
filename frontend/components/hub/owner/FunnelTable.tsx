import HubLink from "../HubLink";
import type { ListingCard, Performance } from "../../../lib/hub/types";

export const FUNNEL_STEPS: { key: string; label: string }[] = [
  { key: "view", label: "Views" },
  { key: "save", label: "Saves" },
  { key: "enquiry", label: "Enquiries" },
  { key: "inspection_booked", label: "Inspections booked" },
  { key: "application_submitted", label: "Applications" },
];

export interface FunnelRow {
  listing: ListingCard;
  values: Record<string, number | undefined>;
}

/**
 * Counts of real events per listing. No estimates, no benchmarks: a zero
 * is a zero, and a row appears only for listings the owner has.
 */
export function FunnelRows({ rows }: { rows: FunnelRow[] }) {
  return (
    <div className="overflow-x-auto rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)]">
      <table className="w-full min-w-[560px] text-left text-[14px]">
        <caption className="sr-only">Activity by listing</caption>
        <thead className="bg-[var(--color-surface-muted)] text-[12.5px] font-semibold text-[color:var(--color-ink-3)]">
          <tr>
            <th scope="col" className="px-4 py-2.5">
              Listing
            </th>
            {FUNNEL_STEPS.map((s) => (
              <th key={s.key} scope="col" className="px-3 py-2.5 text-right">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-line)]">
          {rows.map((r) => (
            <tr key={r.listing.id}>
              <th scope="row" className="max-w-[240px] px-4 py-3 font-medium">
                <HubLink to={`/listings/${r.listing.id}`} className="block truncate text-[color:var(--color-ink)] hover:underline">
                  {r.listing.unit_label ? `${r.listing.unit_label} · ` : ""}
                  {r.listing.title}
                </HubLink>
              </th>
              {FUNNEL_STEPS.map((s) => (
                <td key={s.key} className="px-3 py-3 text-right tabular-nums text-[color:var(--color-ink-2)]">
                  {r.values[s.key] ?? 0}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FunnelTable({ units, perf }: { units: ListingCard[]; perf: Performance }) {
  return <FunnelRows rows={units.map((u) => ({ listing: u, values: perf.by_listing[u.id] ?? {} }))} />;
}
