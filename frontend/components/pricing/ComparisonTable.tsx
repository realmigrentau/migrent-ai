import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

interface ComparisonRow {
  feature: string;
  gumtree: boolean;
  facebook: boolean;
  domain: boolean;
  migrent: boolean | string;
}

const rows: ComparisonRow[] = [
  { feature: "Free to list", gumtree: true, facebook: true, domain: false, migrent: true },
  { feature: "Verified hosts", gumtree: false, facebook: false, domain: false, migrent: true },
  { feature: "AI-powered matching", gumtree: false, facebook: false, domain: false, migrent: true },
  { feature: "Instant booking", gumtree: false, facebook: false, domain: false, migrent: true },
  { feature: "Migrant-friendly filters", gumtree: false, facebook: false, domain: false, migrent: true },
  { feature: "Station & visa filters", gumtree: false, facebook: false, domain: false, migrent: true },
  { feature: "Secure payments", gumtree: false, facebook: false, domain: false, migrent: true },
  { feature: "No monthly subscription", gumtree: true, facebook: true, domain: false, migrent: true },
  { feature: "In-app messaging", gumtree: false, facebook: true, domain: false, migrent: true },
  { feature: "Superhost program", gumtree: false, facebook: false, domain: false, migrent: true },
];

function CellValue({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (typeof value === "string") {
    return <span className="text-sm font-semibold text-[var(--color-primary)]">{value}</span>;
  }
  if (value) {
    return highlight ? (
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20">
        <Check className="w-3.5 h-3.5 text-[var(--color-primary)] dark:text-[var(--color-primary)]" strokeWidth={3} />
      </div>
    ) : (
      <Check className="w-4 h-4 text-[var(--color-ink-4)] mx-auto" strokeWidth={2} />
    );
  }
  return <X className="w-4 h-4 text-[var(--color-ink-4)] mx-auto" strokeWidth={2} />;
}

export default function ComparisonTable() {
  return (
    <section className="max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          Why MigRent?
        </h2>
        <p className="mt-3 text-[var(--color-ink-3)] text-sm max-w-lg mx-auto">
          See how we compare to traditional rental platforms in Australia.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="card rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)]">
                <th className="text-left p-4 font-bold text-[var(--color-ink)] min-w-[180px]">
                  Feature
                </th>
                <th className="text-center p-4 font-medium text-[var(--color-ink-3)] min-w-[90px]">
                  Classifieds
                </th>
                <th className="text-center p-4 font-medium text-[var(--color-ink-3)] min-w-[100px]">
                  Community groups
                </th>
                <th className="text-center p-4 font-medium text-[var(--color-ink-3)] min-w-[100px]">
                  Agency portals
                </th>
                <th className="text-center p-4 min-w-[100px]">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-primary)]">
                    <Sparkles className="w-3 h-3 text-[color:var(--color-primary-fg)]" />
                    <span className="font-semibold text-[color:var(--color-primary-fg)]">MigRent</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {rows.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="hover:bg-[var(--color-surface)] transition-colors"
                >
                  <td className="p-4 text-[var(--color-ink-2)] font-medium">
                    {row.feature}
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.gumtree} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.facebook} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.domain} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.migrent} highlight />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
