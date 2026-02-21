import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "../../components/content/Breadcrumb";
import { getAllSuburbs } from "../../data/suburbs";

const roomTypes = ["single", "double", "ensuite", "studio"] as const;
type RoomType = (typeof roomTypes)[number];

const roomTypeLabels: Record<RoomType, string> = {
  single: "Single Room",
  double: "Double Room",
  ensuite: "Ensuite Room",
  studio: "Studio",
};

export default function ROICalculator() {
  const suburbs = getAllSuburbs();
  const [selectedSuburb, setSelectedSuburb] = useState(suburbs[0].name);
  const [roomType, setRoomType] = useState<RoomType>("double");
  const [occupancy, setOccupancy] = useState(90);
  const [customRent, setCustomRent] = useState<number | null>(null);
  const [customPropertyValue, setCustomPropertyValue] = useState<number | null>(null);

  const suburb = suburbs.find((s) => s.name === selectedSuburb) || suburbs[0];
  const weeklyRent = customRent ?? suburb.avgRent[roomType];
  const propertyValue = customPropertyValue ?? suburb.medianPropertyValue;

  const results = useMemo(() => {
    const annualIncome = weeklyRent * 52 * (occupancy / 100);
    const monthlyIncome = annualIncome / 12;
    const grossYield = (annualIncome / propertyValue) * 100;
    const estimatedExpenses = annualIncome * 0.15;
    const netIncome = annualIncome - estimatedExpenses;
    const netYield = (netIncome / propertyValue) * 100;
    return { annualIncome, monthlyIncome, grossYield, netYield, netIncome, estimatedExpenses };
  }, [weeklyRent, propertyValue, occupancy]);

  const comparisonData = useMemo(
    () =>
      roomTypes.map((rt) => ({
        name: roomTypeLabels[rt],
        income: Math.round(suburb.avgRent[rt] * 52 * (occupancy / 100)),
        roi: Number(((suburb.avgRent[rt] * 52 * (occupancy / 100)) / propertyValue * 100).toFixed(1)),
      })),
    [suburb, occupancy, propertyValue]
  );

  return (
    <>
      <Head>
        <title>Owner ROI Calculator | MigRent AI</title>
        <meta name="description" content="Calculate your return on investment from listing spare rooms on MigRent AI." />
      </Head>

      <div className="max-w-6xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Resources", href: "/resources" },
            { label: "ROI Calculator" },
          ]}
        />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-xs font-medium text-green-600 dark:text-green-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            ROI Calculator
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Estimate Your <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Rental Income</span>
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Calculate potential returns from listing your spare room on MigRent AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="card rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Property Details</h2>

              {/* Suburb */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Suburb</label>
                <select
                  value={selectedSuburb}
                  onChange={(e) => { setSelectedSuburb(e.target.value); setCustomRent(null); }}
                  className="input-field w-full rounded-xl"
                >
                  {suburbs.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Room Type */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Room Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {roomTypes.map((rt) => (
                    <button
                      key={rt}
                      onClick={() => { setRoomType(rt); setCustomRent(null); }}
                      className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                        roomType === rt
                          ? "border-green-500 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {roomTypeLabels[rt]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Rent */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  Weekly Rent
                  <span className="text-green-500 font-bold">${weeklyRent}/wk</span>
                </label>
                <input
                  type="range"
                  min={100}
                  max={800}
                  value={weeklyRent}
                  onChange={(e) => setCustomRent(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>$100</span>
                  <span>$800</span>
                </div>
              </div>

              {/* Property Value */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  Property Value
                  <span className="text-green-500 font-bold">${((customPropertyValue ?? propertyValue) / 1000).toFixed(0)}K</span>
                </label>
                <input
                  type="range"
                  min={200000}
                  max={3000000}
                  step={10000}
                  value={customPropertyValue ?? propertyValue}
                  onChange={(e) => setCustomPropertyValue(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>$200K</span>
                  <span>$3M</span>
                </div>
              </div>

              {/* Occupancy Rate */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  Occupancy Rate
                  <span className="text-green-500 font-bold">{occupancy}%</span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={occupancy}
                  onChange={(e) => setOccupancy(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              * Estimates based on Sydney metro averages. Actual returns may vary. Data last updated Feb 2026.
            </p>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card rounded-2xl p-5 text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  {results.grossYield.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Gross Yield</div>
              </div>
              <div className="card rounded-2xl p-5 text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  {results.netYield.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Net Yield</div>
              </div>
              <div className="card rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  ${results.monthlyIncome.toFixed(0)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Monthly Income</div>
              </div>
              <div className="card rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  ${results.annualIncome.toFixed(0)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Annual Income</div>
              </div>
            </div>

            {/* Income breakdown */}
            <div className="card rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Income Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Gross Annual Income</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${results.annualIncome.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Est. Expenses (15%)</span>
                  <span className="font-semibold text-red-500">-${results.estimatedExpenses.toFixed(0)}</span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-900 dark:text-white">Net Annual Income</span>
                  <span className="font-bold text-green-500">${results.netIncome.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Room type comparison chart */}
            <div className="card rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Room Type Comparison — {selectedSuburb}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(value) => {
                        const v = Number(value);
                        return `$${v.toLocaleString()}/yr`;
                      }}
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 py-12"
        >
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ready to start earning?</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">List your spare room on MigRent AI in minutes.</p>
          <Link href="/signup">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block mt-6 btn-primary text-base px-8 py-3.5 rounded-xl">
              List Your Room
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </>
  );
}
