import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Zap,
  Train,
  Droplets,
} from "lucide-react";
import {
  DESTINATIONS,
  BILLS_RANGE,
  calculateTrueCost,
  getTransportCost,
  type Destination,
} from "../../data/destinations";

interface TrueCostBadgeProps {
  weeklyRent: number;
  billsIncluded?: boolean;
  listingLat?: number;
  listingLng?: number;
}

export default function TrueCostBadge({
  weeklyRent,
  billsIncluded = false,
  listingLat,
  listingLng,
}: TrueCostBadgeProps) {
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [billsEstimate, setBillsEstimate] = useState(BILLS_RANGE.default);

  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return DESTINATIONS.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.shortName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const result = useMemo(
    () =>
      calculateTrueCost({
        weeklyRent,
        billsIncluded,
        billsEstimate,
        listingLat,
        listingLng,
        destinationLat: destination?.lat,
        destinationLng: destination?.lng,
      }),
    [weeklyRent, billsIncluded, billsEstimate, listingLat, listingLng, destination]
  );

  const transportInfo = useMemo(() => {
    if (result.distanceKm === null) return null;
    return getTransportCost(result.distanceKm);
  }, [result.distanceKm]);

  const hasExtras = result.bills > 0 || result.transport > 0;

  const selectDest = (d: Destination) => {
    setDestination(d);
    setSearchQuery(d.shortName);
    setShowDropdown(false);
  };

  return (
    <div className="rounded-2xl border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] bg-[var(--color-primary-soft)] from-[var(--color-accent-50)] to-[var(--color-primary-50)] dark:from-emerald-950/30 dark:to-[var(--color-surface-muted)] overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3.5 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-accent)] to-[var(--color-primary)] flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            {!open ? (
              <>
                <p className="text-[11px] font-medium text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                  What will this really cost you?
                </p>
                <p className="text-xs text-[var(--color-ink-3)] mt-0.5">
                  Enter your uni/work - see true weekly cost
                </p>
              </>
            ) : (
              <p className="text-sm font-bold text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                True Cost Calculator
              </p>
            )}
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[var(--color-accent)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--color-accent)]" />
        )}
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Destination search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-ink-3)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) setDestination(null);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Your uni or workplace"
                  className="w-full pl-8 pr-8 py-2 rounded-xl border border-[var(--color-accent-soft)] dark:border-emerald-700/50 bg-[var(--color-surface-2)]/50 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                {destination && (
                  <button
                    onClick={() => {
                      setDestination(null);
                      setSearchQuery("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5 text-[var(--color-ink-3)]" />
                  </button>
                )}

                <AnimatePresence>
                  {showDropdown && !destination && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-40 top-full mt-1 left-0 right-0 max-h-40 overflow-y-auto rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-line)] shadow-xl"
                    >
                      {filteredDestinations.map((d) => (
                        <button
                          key={d.shortName}
                          onClick={() => selectDest(d)}
                          className="w-full text-left px-3 py-1.5 hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-muted)]/50 flex items-center gap-2"
                        >
                          <span
                            className={`w-5 h-5 rounded text-white text-[9px] font-bold flex items-center justify-center ${
                              d.type === "university"
                                ? "bg-[var(--color-primary)]"
                                : d.type === "cbd"
                                ? "bg-[var(--color-primary)]"
                                : "bg-[var(--color-warn-50)]0"
                            }`}
                          >
                            {d.type === "university" ? "U" : d.type === "cbd" ? "C" : "H"}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-[var(--color-ink)]">
                              {d.shortName}
                            </p>
                            <p className="text-[10px] text-[var(--color-ink-3)] leading-tight">
                              {d.name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bills slider */}
              {!billsIncluded && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-[var(--color-ink-3)] flex items-center gap-1">
                      <Droplets className="w-3 h-3" />
                      Bills
                    </span>
                    <span className="text-xs font-bold text-[var(--color-ink-2)]">
                      ${billsEstimate}/wk
                    </span>
                  </div>
                  <input
                    type="range"
                    min={BILLS_RANGE.min}
                    max={BILLS_RANGE.max}
                    value={billsEstimate}
                    onChange={(e) => setBillsEstimate(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--color-accent-soft)] dark:bg-emerald-900/50 accent-emerald-500"
                  />
                </div>
              )}

              {/* Result breakdown */}
              <div className="rounded-xl bg-white/60 dark:bg-[var(--color-surface-muted)]/40 p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-ink-3)]">Rent</span>
                  <span className="font-semibold text-[var(--color-ink-2)]">${result.rent}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-ink-3)]">Bills</span>
                  <span className="font-semibold text-[var(--color-ink-2)]">
                    {billsIncluded ? "Included" : `$${result.bills}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-ink-3)] flex items-center gap-1">
                    <Train className="w-3 h-3" />
                    Transport
                    {result.distanceKm !== null && (
                      <span className="text-[10px] text-[var(--color-ink-3)]">
                        ({Math.round(result.distanceKm)}km)
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-[var(--color-ink-2)]">
                    {destination ? `$${result.transport}` : "-"}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-[var(--color-line)]/60 dark:border-[var(--color-line)]/60">
                  <span className="text-sm font-bold text-[var(--color-ink)]">
                    True Cost
                  </span>
                  <span className="text-sm font-black text-[var(--color-accent)] dark:text-[var(--color-accent)]">
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
