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
    <div className="rounded-2xl border border-[var(--color-line)]/60 bg-[var(--color-surface-2)]/80 overflow-hidden">
      {/* Header - always visible - shows rent prominently */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--color-surface)]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-accent)] to-[var(--color-primary)] flex items-center justify-center shadow-md">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-[var(--color-ink-3)]">
              True Weekly Cost
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-[var(--color-ink)]">
                ${weeklyRent}
                <span className="text-sm font-normal text-[var(--color-ink-3)]">/wk rent</span>
              </span>
              {(result.bills > 0 || result.transport > 0) && (
                <span className="text-sm font-bold text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                  + ${result.bills + result.transport} extras = ${result.trueCost}/wk
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!expanded && (result.bills > 0 || result.transport > 0) && (
            <span className="hidden sm:block text-xs text-[var(--color-ink-3)]">
              See breakdown
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-[var(--color-ink-3)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--color-ink-3)]" />
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
            <div className="px-4 pb-4 space-y-4 border-t border-[var(--color-line)] pt-4">
              {/* Destination search */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-ink-3)] mb-1.5 block">
                  Where do you commute to?
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-3)]" />
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
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                  {destination && (
                    <button
                      onClick={clearDestination}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[var(--color-surface-muted)]"
                    >
                      <X className="w-3.5 h-3.5 text-[var(--color-ink-3)]" />
                    </button>
                  )}

                  {/* Dropdown */}
                  <AnimatePresence>
                    {showDropdown && !destination && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-30 top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-line)] shadow-xl"
                      >
                        {filteredDestinations.length === 0 ? (
                          <p className="px-3 py-2.5 text-xs text-[var(--color-ink-3)]">
                            No matches found
                          </p>
                        ) : (
                          filteredDestinations.map((d) => (
                            <button
                              key={d.shortName}
                              onClick={() => selectDestination(d)}
                              className="w-full text-left px-3 py-2 hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-muted)]/50 transition-colors flex items-center gap-2.5"
                            >
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${
                                  d.type === "university"
                                    ? "bg-[var(--color-primary)]"
                                    : d.type === "cbd"
                                    ? "bg-[var(--color-primary)]"
                                    : "bg-[var(--color-warn-50)]0"
                                }`}
                              >
                                {d.type === "university"
                                  ? "U"
                                  : d.type === "cbd"
                                  ? "C"
                                  : "H"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[var(--color-ink)]">
                                  {d.shortName}
                                </p>
                                <p className="text-xs text-[var(--color-ink-3)]">
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
                    <label className="text-xs font-semibold text-[var(--color-ink-3)]">
                      Weekly bills estimate
                    </label>
                    <span className="text-sm font-bold text-[var(--color-ink)]">
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
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--color-line)] accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--color-ink-3)] mt-0.5">
                    <span>${BILLS_RANGE.min}</span>
                    <span>${BILLS_RANGE.max}</span>
                  </div>
                </div>
              )}

              {/* Cost breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--color-ink-3)]">
                  Weekly breakdown
                </p>

                {/* Stacked bar chart */}
                <div className="h-3 rounded-full overflow-hidden flex bg-[var(--color-surface-muted)]">
                  <div
                    className="bg-[var(--color-primary)] transition-all duration-300"
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
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                      <span className="text-xs text-[var(--color-ink-2)]">
                        Rent
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[var(--color-ink)]">
                      ${result.rent}/wk
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-[var(--color-warn-500)]" />
                        <span className="text-xs text-[var(--color-ink-2)]">
                          Bills
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--color-ink)]">
                      {billsIncluded ? (
                        <span className="text-[var(--color-accent)]">Included</span>
                      ) : (
                        `$${result.bills}/wk`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      <div className="flex items-center gap-1">
                        <Train className="w-3 h-3 text-[var(--color-primary)]" />
                        <span className="text-xs text-[var(--color-ink-2)]">
                          Transport
                          {transportInfo && result.distanceKm !== null && (
                            <span className="text-[var(--color-ink-3)] ml-1">
                              ({Math.round(result.distanceKm)}km - {transportInfo.mode === "walk" ? "walkable" : transportInfo.label.split(" ")[0].toLowerCase()})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--color-ink)]">
                      {destination ? (
                        `$${result.transport}/wk`
                      ) : (
                        <span className="text-[var(--color-ink-3)]">Select destination</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-line)]">
                  <span className="text-sm font-bold text-[var(--color-ink)]">
                    True Weekly Cost
                  </span>
                  <span className="text-lg font-black text-[var(--color-accent)] dark:text-[var(--color-accent)]">
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
