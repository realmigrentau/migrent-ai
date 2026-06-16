import { CheckCircle, XCircle } from "lucide-react";

interface LiveabilityProps {
  pros: string[];
  cons: string[];
  suburbName: string;
}

export default function Liveability({ pros, cons, suburbName }: LiveabilityProps) {
  return (
    <section className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-6">
        Living in {suburbName}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="rounded-xl border border-[var(--color-accent-soft)] dark:border-[var(--color-line)] bg-[var(--color-accent-soft)]/50 dark:bg-[var(--color-accent-50)] p-6">
          <h3 className="font-semibold text-[var(--color-accent-700)] dark:text-[var(--color-accent)] mb-4">
            What we love
          </h3>
          <ul className="space-y-3">
            {pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--color-accent)] mt-0.5 shrink-0" />
                <span className="text-sm text-[var(--color-ink-2)]">
                  {pro}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="rounded-xl border border-[var(--color-line-2)] dark:border-[var(--color-line)] bg-[var(--color-warn-50)]/50 dark:bg-[var(--color-warn-50)] p-6">
          <h3 className="font-semibold text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] mb-4">
            Things to know
          </h3>
          <ul className="space-y-3">
            {cons.map((con, i) => (
              <li key={i} className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[var(--color-warn-500)] mt-0.5 shrink-0" />
                <span className="text-sm text-[var(--color-ink-2)]">
                  {con}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
