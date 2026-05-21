import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { OwnerBooking } from "../../hooks/useOwnerData";

interface Props {
  bookings: OwnerBooking[];
}

export default function EarningsChart({ bookings }: Props) {
  const chartData = useMemo(() => {
    // Build last 6 months of earnings data
    const months: { month: string; earnings: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleDateString("en-AU", {
        month: "short",
        year: "2-digit",
      });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      let earnings = 0;
      for (const b of bookings) {
        if (b.status === "PAID" || b.status === "COMPLETED") {
          const updated = new Date(b.updated_at);
          if (updated >= monthStart && updated <= monthEnd) {
            earnings += b.total_price || 0;
          }
        }
      }

      months.push({ month: monthKey, earnings: Math.round(earnings) });
    }

    return months;
  }, [bookings]);

  const hasData = chartData.some((d) => d.earnings > 0);

  if (!hasData) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <p className="text-sm text-[var(--color-ink-3)]">
          Earnings data will appear here once you have confirmed bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="card rounded-xl p-4 md:p-6">
      <div className="h-[200px] md:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.15)"
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,23,42,0.9)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value: any) => [`$${value}`, "Earnings"]}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#earningsGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
