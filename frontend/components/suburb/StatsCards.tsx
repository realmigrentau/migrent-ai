import { DollarSign, TrendingDown, Shield, Users, Train, Footprints } from "lucide-react";

interface StatsCardsProps {
  medianRent: number;
  vacancyRate: number;
  safetyScore: number;
  migrantPct: number;
  transportScore: number | null;
  walkabilityScore: number | null;
}

const stats = (props: StatsCardsProps) => [
  {
    label: "Median Room Rent",
    value: `$${props.medianRent}/wk`,
    icon: DollarSign,
    color: "text-[var(--color-accent)]",
    bgColor: "bg-[var(--color-accent)]/10",
  },
  {
    label: "Vacancy Rate",
    value: `${props.vacancyRate}%`,
    icon: TrendingDown,
    color: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary)]/10",
  },
  {
    label: "Safety Score",
    value: `${props.safetyScore}/10`,
    icon: Shield,
    color: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary)]/10",
  },
  {
    label: "Migrant Population",
    value: `${props.migrantPct}%`,
    icon: Users,
    color: "text-[var(--color-primary)]",
    bgColor: "bg-[var(--color-primary)]/10",
  },
  {
    label: "Transport Score",
    value: props.transportScore ? `${props.transportScore}/10` : "N/A",
    icon: Train,
    color: "text-[var(--color-warn-500)]",
    bgColor: "bg-[var(--color-warn-500)]/10",
  },
  {
    label: "Walkability",
    value: props.walkabilityScore ? `${props.walkabilityScore}/10` : "N/A",
    icon: Footprints,
    color: "text-[var(--color-primary)]",
    bgColor: "bg-primary-soft",
  },
];

export default function StatsCards(props: StatsCardsProps) {
  return (
    <section id="stats" className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-6">
        Key Statistics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats(props).map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl border border-[var(--color-line)] bg-white/60 dark:bg-[var(--color-surface-muted)]/60 backdrop-blur-sm p-5 hover:shadow-lg transition-shadow"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-[var(--color-ink)]">
              {stat.value}
            </p>
            <p className="text-sm text-[var(--color-ink-3)] mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
