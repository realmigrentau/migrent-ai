import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  MapPin,
  BadgeCheck,
  Train,
  Wifi,
  Zap,
  Sparkles,
  ArrowRight,
  Calculator,
} from "lucide-react";
import Link from "next/link";
import type { WishlistListing } from "../../hooks/useWishlist";
import { BILLS_RANGE } from "../../data/destinations";

interface CompareTableProps {
  listings: WishlistListing[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

export default function CompareTable({
  listings,
  onClose,
  onRemove,
}: CompareTableProps) {
  if (listings.length < 2) return null;

  // Find best values for highlighting
  const lowestPrice = Math.min(...listings.map((l) => l.weeklyPrice));
  const highestRating = Math.max(...listings.map((l) => l.rating));
  const closestStation = Math.min(...listings.map((l) => l.stationWalkMin || 99));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Compare Listings
                </h2>
                <p className="text-xs text-slate-400">
                  {listings.length} listings selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-[600px]">
              {/* Photo row */}
              <div className="grid border-b border-slate-100 dark:border-slate-800" style={{ gridTemplateColumns: `120px repeat(${listings.length}, 1fr)` }}>
                <div className="p-3 flex items-center">
                  <span className="text-xs font-semibold text-slate-400">Photo</span>
                </div>
                {listings.map((l) => (
                  <div key={l.id} className="p-3 relative group">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={l.photos[0]}
                        alt={l.address}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => onRemove(l.id)}
                      className="absolute top-4 right-4 p-1 rounded-full bg-white/80 dark:bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Address */}
              <CompareRow label="Address" listings={listings}>
                {(l) => (
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{l.address}</p>
                    <p className="text-xs text-slate-400">{l.suburb}, {l.postcode}</p>
                  </div>
                )}
              </CompareRow>

              {/* Price */}
              <CompareRow label="Price/wk" listings={listings} highlight>
                {(l) => (
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-black ${
                      l.weeklyPrice === lowestPrice
                        ? "text-[var(--color-accent)]"
                        : "text-slate-900 dark:text-white"
                    }`}>
                      ${l.weeklyPrice}
                    </span>
                    {l.originalPrice && l.originalPrice > l.weeklyPrice && (
                      <span className="text-xs text-slate-400 line-through">${l.originalPrice}</span>
                    )}
                    {l.weeklyPrice === lowestPrice && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                        Best
                      </span>
                    )}
                  </div>
                )}
              </CompareRow>

              {/* True Cost estimate (rent + bills if not included) */}
              <CompareRow label="True Cost" listings={listings} highlight>
                {(l) => {
                  const billsExtra = l.billsIncluded ? 0 : BILLS_RANGE.default;
                  const estimated = l.weeklyPrice + billsExtra;
                  const lowestTrue = Math.min(
                    ...listings.map((x) =>
                      x.weeklyPrice + (x.billsIncluded ? 0 : BILLS_RANGE.default)
                    )
                  );
                  return (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        <span
                          className={`text-sm font-bold ${
                            estimated === lowestTrue
                              ? "text-[var(--color-accent)]"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          ~${estimated}/wk
                        </span>
                        {estimated === lowestTrue && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 text-[var(--color-accent)] dark:text-[var(--color-accent)]">
                            Best
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {l.billsIncluded ? "Bills included" : `+$${BILLS_RANGE.default} bills est.`}
                        {" + transport"}
                      </p>
                    </div>
                  );
                }}
              </CompareRow>

              {/* Rating */}
              <CompareRow label="Rating" listings={listings}>
                {(l) => (
                  <div className="flex items-center gap-1.5">
                    <Star className={`w-4 h-4 ${
                      l.rating === highestRating ? "fill-amber-400 text-amber-400" : "fill-slate-300 text-slate-300 dark:fill-slate-600 dark:text-slate-600"
                    }`} />
                    <span className={`text-sm font-bold ${
                      l.rating === highestRating ? "text-amber-500" : "text-slate-600 dark:text-slate-300"
                    }`}>
                      {l.rating}
                    </span>
                    <span className="text-xs text-slate-400">({l.reviewCount})</span>
                    {l.rating === highestRating && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        Top
                      </span>
                    )}
                  </div>
                )}
              </CompareRow>

              {/* Station */}
              <CompareRow label="Station" listings={listings}>
                {(l) => (
                  <div className="flex items-center gap-1.5">
                    <Train className={`w-3.5 h-3.5 ${
                      l.stationWalkMin === closestStation ? "text-blue-500" : "text-slate-400"
                    }`} />
                    <span className={`text-sm ${
                      l.stationWalkMin === closestStation ? "font-bold text-blue-500" : "text-slate-600 dark:text-slate-300"
                    }`}>
                      {l.stationWalkMin ? `${l.stationWalkMin}min` : "N/A"}
                    </span>
                    {l.nearestStation && (
                      <span className="text-xs text-slate-400">{l.nearestStation}</span>
                    )}
                  </div>
                )}
              </CompareRow>

              {/* Room type */}
              <CompareRow label="Room" listings={listings}>
                {(l) => (
                  <span className="text-sm capitalize text-slate-600 dark:text-slate-300">{l.roomType}</span>
                )}
              </CompareRow>

              {/* Amenities */}
              <CompareRow label="Amenities" listings={listings}>
                {(l) => (
                  <div className="flex flex-wrap gap-1">
                    {l.furnished && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Furnished</span>
                    )}
                    {l.billsIncluded && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Bills incl.</span>
                    )}
                  </div>
                )}
              </CompareRow>

              {/* Verified */}
              <CompareRow label="Verified" listings={listings}>
                {(l) => (
                  <div className="flex items-center gap-1">
                    {l.verified ? (
                      <>
                        <BadgeCheck className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="text-xs font-medium text-[var(--color-accent)]">Yes</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">No</span>
                    )}
                  </div>
                )}
              </CompareRow>

              {/* Host */}
              <CompareRow label="Host" listings={listings}>
                {(l) => (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">{l.ownerName[0]}</span>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">{l.ownerName}</span>
                    {l.superhost && <Sparkles className="w-3 h-3 text-amber-400" />}
                  </div>
                )}
              </CompareRow>

              {/* Owner reply */}
              <CompareRow label="Reply" listings={listings}>
                {(l) => l.ownerReply ? (
                  <p className="text-xs text-[var(--color-accent)] dark:text-[var(--color-accent)] italic line-clamp-2">
                    "{l.ownerReply}"
                  </p>
                ) : (
                  <span className="text-xs text-slate-300 dark:text-slate-600">No reply yet</span>
                )}
              </CompareRow>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn-secondary px-4 py-2 rounded-xl text-xs"
            >
              Close
            </button>
            <div className="flex-1" />
            {listings.length > 0 && (
              <Link
                href={`/listing/${listings[0].id}`}
                className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                View Top Pick <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Reusable comparison row
function CompareRow({
  label,
  listings,
  children,
  highlight,
}: {
  label: string;
  listings: WishlistListing[];
  children: (l: WishlistListing) => React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`grid border-b border-slate-100/50 dark:border-slate-800/50 ${
        highlight ? "bg-slate-50/50 dark:bg-slate-800/20" : ""
      }`}
      style={{ gridTemplateColumns: `120px repeat(${listings.length}, 1fr)` }}
    >
      <div className="p-3 flex items-center">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
      </div>
      {listings.map((l) => (
        <div key={l.id} className="p-3 flex items-center">
          {children(l)}
        </div>
      ))}
    </div>
  );
}
