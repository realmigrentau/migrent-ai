import { FileCheck2, Lock, MessagesSquare, ShieldCheck } from "lucide-react";

/**
 * The quiet line between the search and the argument.
 *
 * Deliberately not a card row: four claims on a hairline band, so it reads
 * as a caption under the search rather than the page's first feature grid.
 */

const ITEMS = [
  { icon: ShieldCheck, label: "Verified hosts" },
  { icon: Lock, label: "Bond protected" },
  { icon: FileCheck2, label: "No history needed" },
  { icon: MessagesSquare, label: "Real support" },
];

export default function TrustStrip() {
  return (
    <section className="mg-band--green mg-band--edge-top mg-band--edge-bottom" aria-label="What MigRent guarantees">
      <div className="mg-shell py-5">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12 list-none m-0 p-0">
          {ITEMS.map((t) => (
            <li key={t.label} className="inline-flex items-center gap-2.5">
              <t.icon className="w-[17px] h-[17px] text-[var(--color-accent)]" strokeWidth={1.9} aria-hidden="true" />
              <span className="text-[13.5px] font-medium text-[var(--color-ink-2)] tracking-[-0.005em]">{t.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
