import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Star,
  MapPin,
  MessageCircle,
  TrendingDown,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  GripVertical,
  Check,
} from "lucide-react";
import type { WishlistListing, WishlistCollection } from "../../hooks/useWishlist";

const CARD_GRADIENTS = [
  "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
  "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
  "from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30",
  "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
  "from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30",
  "from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30",
  "from-lime-50 to-emerald-50 dark:from-lime-950/30 dark:to-emerald-950/30",
];

interface WishlistCardProps {
  listing: WishlistListing;
  index: number;
  onRemove: (id: string) => void;
  compareMode: boolean;
  isCompareSelected: boolean;
  onToggleCompare: (id: string) => void;
  collections: WishlistCollection[];
  currentCollectionId?: string;
  onMoveToCollection: (listingId: string, collectionId: string) => void;
}

export default function WishlistCard({
  listing,
  index,
  onRemove,
  compareMode,
  isCompareSelected,
  onToggleCompare,
  collections,
  currentCollectionId,
  onMoveToCollection,
}: WishlistCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const gradientClass = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const hasPriceDrop = listing.originalPrice && listing.originalPrice > listing.weeklyPrice;
  const priceSavings = hasPriceDrop ? listing.originalPrice! - listing.weeklyPrice : 0;
  const priceDropPercent = hasPriceDrop ? Math.round((priceSavings / listing.originalPrice!) * 100) : 0;

  const handleRemove = () => {
    setIsRemoving(true);
    setHeartBurst(true);
    setTimeout(() => onRemove(listing.id), 400);
  };

  const customCollections = collections.filter((c) => !c.isSmartCollection);

  return (
    <AnimatePresence>
      {!isRemoving && (
        <motion.div
          ref={cardRef}
          layout
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
          whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
          className={`relative rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br ${gradientClass} group cursor-pointer`}
        >
          {/* Compare mode checkbox */}
          {compareMode && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => onToggleCompare(listing.id)}
              className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                isCompareSelected
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                  : "bg-white/90 dark:bg-slate-800/90 text-slate-400 border border-slate-200 dark:border-slate-600"
              }`}
            >
              {isCompareSelected && <Check className="w-4 h-4" />}
            </motion.button>
          )}

          {/* Image section */}
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
            {!imgError ? (
              <img
                src={listing.photos[0]}
                alt={listing.address}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Heart remove button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:scale-110 active:scale-90 transition-all"
            >
              <AnimatePresence>
                {heartBurst ? (
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <Heart className="w-5 h-5 text-slate-300" />
                  </motion.div>
                ) : (
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                )}
              </AnimatePresence>
            </button>

            {/* Price badge */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg ${
                hasPriceDrop
                  ? "bg-emerald-500/90 text-white"
                  : "bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white"
              }`}>
                <span className="font-bold text-sm">${listing.weeklyPrice}</span>
                <span className="text-xs opacity-80">/wk</span>
              </div>
              {hasPriceDrop && (
                <motion.div
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="px-2 py-1 rounded-lg bg-amber-400 text-amber-900 text-xs font-bold shadow-lg flex items-center gap-1"
                >
                  <TrendingDown className="w-3 h-3" />
                  -{priceDropPercent}%
                </motion.div>
              )}
            </div>

            {/* Superhost badge */}
            {listing.superhost && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Superhost
              </div>
            )}

            {/* Quick actions on hover */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <Link
                href={`/seeker/room/${listing.id}`}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-lg flex items-center gap-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Quick Book <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                className="p-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 shadow-lg hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Rating + Reviews */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {listing.rating}
                </span>
                <span className="text-xs text-slate-400">
                  ({listing.reviewCount})
                </span>
                {listing.superhost && (
                  <span className="text-xs text-amber-500 font-medium ml-1">Superhost</span>
                )}
              </div>
              {listing.verified && (
                <div className="flex items-center gap-1 text-emerald-500">
                  <BadgeCheck className="w-4 h-4" />
                  <span className="text-xs font-medium">Verified</span>
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {listing.address}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {listing.suburb}, {listing.postcode}
              </p>
            </div>

            {/* Original price strikethrough */}
            {hasPriceDrop && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 line-through">${listing.originalPrice}/wk</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Save ${priceSavings}/wk
                </span>
              </div>
            )}

            {/* Station distance */}
            {listing.nearestStation && (
              <div className="flex items-center gap-1.5 text-sm">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">T</span>
                </div>
                <span className="text-slate-600 dark:text-slate-300">
                  {listing.stationWalkMin}min walk to {listing.nearestStation}
                </span>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 capitalize font-medium">
                {listing.roomType}
              </span>
              {listing.furnished && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 font-medium">
                  Furnished
                </span>
              )}
              {listing.billsIncluded && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 font-medium">
                  Bills incl.
                </span>
              )}
            </div>

            {/* Owner reply */}
            {listing.ownerReply && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/50 border border-emerald-200/50 dark:border-emerald-500/20"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-[10px] font-bold">
                    {listing.ownerName[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {listing.ownerName}
                    </span>
                    {listing.ownerVerified && (
                      <BadgeCheck className="w-3 h-3 text-blue-500" />
                    )}
                    <span className="wl-reply-badge px-1.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10">
                      Replied
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    "{listing.ownerReply}"
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <Link
                href={`/seeker/room/${listing.id}`}
                className="flex-1 text-center py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                View Details
              </Link>

              {/* Collection drag handle / menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCollectionMenu(!showCollectionMenu);
                  }}
                  className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 transition-colors"
                >
                  <GripVertical className="w-4 h-4" />
                </button>

                {/* Collection dropdown */}
                <AnimatePresence>
                  {showCollectionMenu && customCollections.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-30"
                    >
                      <p className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-700">
                        Move to collection
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToCollection(listing.id, "all");
                          setShowCollectionMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${
                          !currentCollectionId ? "text-rose-500 font-semibold" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500" />
                        No collection
                      </button>
                      {customCollections.map((c) => (
                        <button
                          key={c.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToCollection(listing.id, c.id);
                            setShowCollectionMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${
                            currentCollectionId === c.id ? "text-rose-500 font-semibold" : "text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${c.gradient}`} />
                          {c.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
