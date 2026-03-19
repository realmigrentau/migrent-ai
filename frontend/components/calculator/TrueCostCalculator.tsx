import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Zap,
  Droplets,
  Train,
  Search,
  X,
} from "lucide-react";
import {
  DESTINATIONS,
  BILLS_RANGE,
  calculateTrueCost,
  getTransportCost,
  getDistanceKm,
  type Destination,
} from "../../data/destinations";

interface TrueCostCalculatorProps {
  weeklyRent: number;
  billsIncluded?: boolean;
  listingLat?: number;
  listingLng?: number;
  compact?: boolean;
  onTrueCostChange?: (cost: number) => void;
}

export default function TrueCostCalculator({
  weeklyRent,
  billsIncluded = false,
  listingLat,
  listingLng,
  compact = false,
  onTrueCostChange,
}: TrueCostCalculatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [billsEstimate, setBillsEstimate] = useState(BILLS_RANGE.default);

  // Filter destinations based on search
  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return DESTINATIONS;
    const q = searchQuery.toLowerCase();
    return DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.shortName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Calculate true cost
  const result = useMemo(() => {
    const calc = calculateTrueCost({
      weeklyRent,
      billsIncluded,
      billsEstimate,
      listingLat,
      listingLng,
      destinationLat: destination?.lat,
      destinationLng: destination?.lng,
    });
    onTrueCostChange?.(calc.trueCost);
    return calc;
  }, [
    weeklyRent,
    billsIncluded,
    billsEstimate,
    listingLat,
    listingLng,
    destination,
    onTrueCostChange,
  ]);

  // Transport info
  const transportInfo = useMemo(() => {
    if (result.distanceKm === null) return null;
    return getTransportCost(result.distanceKm);
  }, [result.distanceKm]);

  // Pie chart segments
  const totalForChart = result.trueCost || 1;
  const rentPercent = Math.round((result.rent / totalForChart) * 100);
  const billsPercent = Math.round((result.bills / totalForChart) * 100);
  const transportPercent = 100 - rentPercent - billsPercent;

  const selectDestination = (d: Destination) => {
    setDestination(d);
    setSearchQuery(d.shortName);
    setShowDropdown(false);
  };

  const clearDestination = () => {
    setDestination(null);
    setSearchQuery("");
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/80 overflow-hidden">
      {/* Header - always visible - shows rent prominently */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              True Weekly Cost
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ${weeklyRent}
                <span className="text-sm font-normal text-slate-400">/wk rent</span>
              </span>
              {(result.bills > 0 || result.transport > 0) && (
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  + ${result.bills + result.transport} extras = ${result.trueCost}/wk
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!expanded && (result.bills > 0 || result.transport > 0) && (
            <span className="hidden sm:block text-xs text-slate-400">
              See breakdown
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded calculator */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              {/* Destination search */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                  Where do you commute to?
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value) setDestination(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search uni or workplace (e.g. UTS, UNSW)"
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                  {destination && (
                    <button
                      onClick={clearDestination}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}

                  {/* Dropdown */}
                  <AnimatePresence>
                    {showDropdown && !destination && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-30 top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl"
                      >
                        {filteredDestinations.length === 0 ? (
                          <p className="px-3 py-2.5 text-xs text-slate-400">
                            No matches found
                          </p>
                        ) : (
                          filteredDestinations.map((d) => (
                            <button
                              key={d.shortName}
                              onClick={() => selectDestination(d)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2.5"
                            >
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${
                                  d.type === "university"
                                    ? "bg-indigo-500"
                                    : d.type === "cbd"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                }`}
                              >
                                {d.type === "university"
                                  ? "U"
                                  : d.type === "cbd"
                                  ? "C"
                                  : "H"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {d.shortName}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {d.name}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bills slider - only if not included */}
              {!billsIncluded && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Weekly bills estimate
                    </label>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ${billsEstimate}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={BILLS_RANGE.min}
                    max={BILLS_RANGE.max}
                    value={billsEstimate}
                    onChange={(e) =>
                      setBillsEstimate(Number(e.target.value))
                    }
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>${BILLS_RANGE.min}</span>
                    <span>${BILLS_RANGE.max}</span>
                  </div>
                </div>
              )}

              {/* Cost breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Weekly breakdown
                </p>

                {/* Stacked bar chart */}
                <div className="h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                  <div
                    className="bg-rose-400 transition-all duration-300"
                    style={{ width: `${rentPercent}%` }}
                  />
                  {result.bills > 0 && (
                    <div
                      className="bg-amber-400 transition-all duration-300"
                      style={{ width: `${billsPercent}%` }}
                    />
                  )}
                  {result.transport > 0 && (
                    <div
                      className="bg-blue-400 transition-all duration-300"
                      style={{ width: `${transportPercent}%` }}
                    />
                  )}
                </div>

                {/* Legend items */}
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        Rent
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      ${result.rent}/wk
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          Bills
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {billsIncluded ? (
                        <span className="text-emerald-500">Included</span>
                      ) : (
                        `$${result.bills}/wk`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      <div className="flex items-center gap-1">
                        <Train className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          Transport
                          {transportInfo && result.distanceKm !== null && (
                            <span className="text-slate-400 ml-1">
                              ({Math.round(result.distanceKm)}km - {transportInfo.mode === "walk" ? "walkable" : transportInfo.label.split(" ")[0].toLowerCase()})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {destination ? (
                        `$${result.transport}/wk`
                      ) : (
                        <span className="text-slate-400">Select destination</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    True Weekly Cost
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ${result.trueCost}/wk
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
