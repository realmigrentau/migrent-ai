import { motion } from "framer-motion";
import { useCalculator } from "../../hooks/useCalculator";
import { Calculator, TrendingUp, DollarSign, Minus } from "lucide-react";

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </label>
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {unit === "$" ? `$${value.toLocaleString()}` : `${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-[var(--color-primary)]"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{unit === "$" ? `$${min}` : `${min}${unit}`}</span>
        <span>{unit === "$" ? `$${max}` : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  color: string;
  delay: number;
}) {
  const bgClasses: Record<string, string> = {
    indigo: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    emerald: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/20 text-[var(--color-accent)] dark:text-[var(--color-accent)]",
    pink: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/20 text-[var(--color-primary)] dark:text-[var(--color-primary)]",
    amber: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="card-subtle p-4 rounded-xl text-center"
    >
      <div className={`w-10 h-10 rounded-xl ${bgClasses[color]} flex items-center justify-center mx-auto mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {label}
      </div>
    </motion.div>
  );
}

export default function EarningsCalculator() {
  const { inputs, outputs, updateInput } = useCalculator();

  return (
    <section id="calculator" className="max-w-5xl mx-auto px-4 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] mb-4">
          <Calculator className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-primary)] dark:text-[var(--color-primary)]">
            Interactive Calculator
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Owner Earnings Calculator
        </h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          See how much you could earn renting on MigRent. Adjust the sliders to match your property.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="card rounded-2xl p-6 sm:p-8"
      >
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="space-y-8">
            <SliderInput
              label="Rooms rented out"
              value={inputs.rooms}
              min={1}
              max={20}
              step={1}
              unit=""
              onChange={(v) => updateInput("rooms", v)}
            />
            <SliderInput
              label="Average weekly rate"
              value={inputs.weeklyRate}
              min={100}
              max={2000}
              step={50}
              unit="$"
              onChange={(v) => updateInput("weeklyRate", v)}
            />
            <SliderInput
              label="Occupancy rate"
              value={inputs.occupancy}
              min={10}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => updateInput("occupancy", v)}
            />
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Monthly Revenue"
                value={`$${outputs.monthlyRevenue.toLocaleString()}`}
                icon={TrendingUp}
                color="indigo"
                delay={0.15}
              />
              <StatCard
                label="MigRent Fee"
                value={`$${outputs.migrentFee.toLocaleString()}`}
                icon={Minus}
                color="pink"
                delay={0.2}
              />
            </div>

            {/* Take-home highlight */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="p-6 rounded-xl bg-[var(--color-primary-soft)] from-emerald-50 via-emerald-100/50 to-teal-50 dark:from-[var(--color-accent)]/10 dark:via-[var(--color-accent)]/5 dark:to-teal-500/5 border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-soft)]0 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                  Your Annual Take-Home
                </span>
              </div>
              <div className="text-4xl font-semibold text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                ${outputs.annualTakeHome.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--color-accent)] dark:text-[var(--color-accent)] mt-1">
                ~${outputs.monthlyTakeHome.toLocaleString()}/month after one-time fees
              </div>
            </motion.div>

            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              MigRent fee is a one-time $99 per property, charged only when matched with a tenant.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
