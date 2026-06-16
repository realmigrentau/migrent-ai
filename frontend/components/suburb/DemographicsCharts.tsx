import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RentTrend {
  month: string;
  rent: number;
}

interface Demographics {
  overseas_born_pct: number;
  india_pct: number;
  china_pct: number;
  philippines_pct: number;
  sri_lanka_pct: number;
  nepal_pct: number;
  median_age: number;
  avg_household_size: number;
}

interface DemographicsChartsProps {
  demographics: Demographics;
  rentTrend: RentTrend[];
  suburbName: string;
}

const COLORS = ["#0d9488", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#94a3b8"];

export default function DemographicsCharts({
  demographics,
  rentTrend,
  suburbName,
}: DemographicsChartsProps) {
  const pieData = [
    { name: "India", value: demographics.india_pct },
    { name: "China", value: demographics.china_pct },
    { name: "Philippines", value: demographics.philippines_pct },
    { name: "Sri Lanka", value: demographics.sri_lanka_pct },
    { name: "Nepal", value: demographics.nepal_pct },
    {
      name: "Other / AU-born",
      value:
        100 -
        demographics.india_pct -
        demographics.china_pct -
        demographics.philippines_pct -
        demographics.sri_lanka_pct -
        demographics.nepal_pct,
    },
  ];

  return (
    <section className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-6">
        Demographics & Rent Trends
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Population Breakdown */}
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] p-6">
          <h3 className="font-semibold text-[var(--color-ink)] mb-2">
            Population Breakdown
          </h3>
          <p className="text-sm text-[var(--color-ink-3)] mb-4">
            {demographics.overseas_born_pct}% overseas born (ABS Census)
          </p>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `${val}%`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-[var(--color-ink-2)]">
                  {entry.name} ({entry.value}%)
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[var(--color-line)]">
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--color-ink)]">
                {demographics.median_age}
              </p>
              <p className="text-xs text-[var(--color-ink-3)]">
                Median Age
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--color-ink)]">
                {demographics.avg_household_size}
              </p>
              <p className="text-xs text-[var(--color-ink-3)]">
                Avg Household
              </p>
            </div>
          </div>
        </div>

        {/* Rent Trend */}
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] p-6">
          <h3 className="font-semibold text-[var(--color-ink)] mb-2">
            Room Rent Trend
          </h3>
          <p className="text-sm text-[var(--color-ink-3)] mb-4">
            Median weekly room rent - last 6 months
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => {
                  const parts = v.split(" ");
                  return parts[0]?.substring(0, 3) || v;
                }}
              />
              <YAxis
                domain={["dataMin - 10", "dataMax + 10"]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(val) => [`$${val}/wk`, "Median Rent"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
              />
              <Line
                type="monotone"
                dataKey="rent"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0d9488" }}
                activeDot={{ r: 6, fill: "#0d9488" }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-[var(--color-ink-3)] mt-2 text-center">
            Source: MigRent listings data for {suburbName}
          </p>
        </div>
      </div>
    </section>
  );
}
