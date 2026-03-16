import { CheckCircle, XCircle } from "lucide-react";

interface LiveabilityProps {
  pros: string[];
  cons: string[];
  suburbName: string;
}

export default function Liveability({ pros, cons, suburbName }: LiveabilityProps) {
  return (
    <section className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Living in {suburbName}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 p-6">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-4">
            What we love
          </h3>
          <ul className="space-y-3">
            {pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {pro}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-6">
          <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-4">
            Things to know
          </h3>
          <ul className="space-y-3">
            {cons.map((con, i) => (
              <li key={i} className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
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
