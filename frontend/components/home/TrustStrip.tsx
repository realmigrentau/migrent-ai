import { FileCheck2, MessagesSquare, ShieldCheck, Wallet } from "lucide-react";

/**
 * Four true things, directly under the house. A caption, not a feature
 * grid: no cards, no band, just the line the hero hands over on.
 */

const ITEMS = [
  { icon: ShieldCheck, label: "Hosts ID-checked before listing" },
  { icon: FileCheck2, label: "No rental history needed" },
  { icon: Wallet, label: "Renters pay no fees" },
  { icon: MessagesSquare, label: "Real people when you need help" },
];

export default function TrustStrip() {
  return (
    <section aria-label="What renting through Migrent means" className="relative z-[1] pb-4 pt-2">
      <ul className="site-shell m-0 flex list-none flex-wrap items-center justify-center gap-x-8 gap-y-3 p-0">
        {ITEMS.map((t) => (
          <li key={t.label} className="inline-flex items-center gap-2.5">
            <t.icon className="h-[18px] w-[18px] text-[color:var(--color-primary)]" strokeWidth={1.9} aria-hidden="true" />
            <span className="text-[14px] font-semibold tracking-[-0.005em] text-[color:var(--color-ink-2)]">{t.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
