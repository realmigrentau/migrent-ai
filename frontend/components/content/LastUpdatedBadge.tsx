import { Calendar } from "lucide-react";

interface LastUpdatedBadgeProps {
  date: string;
  variant?: "light" | "dark";
}

export default function LastUpdatedBadge({ date, variant = "light" }: LastUpdatedBadgeProps) {
  const formatted = (() => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return date;
    }
  })();

  const cls =
    variant === "light"
      ? "bg-white/15 text-white"
      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${cls}`}
    >
      <Calendar className="w-3 h-3" />
      Updated {formatted}
    </span>
  );
}
