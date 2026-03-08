import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Bell,
  ArrowUpDown,
  Columns3,
  Heart,
  Plus,
} from "lucide-react";
import { useWishlist, type SortOption } from "../../hooks/useWishlist";
import HeroGamification from "../../components/wishlist/HeroGamification";
import CollectionsBar from "../../components/wishlist/CollectionsBar";
import WishlistCard from "../../components/wishlist/WishlistCard";
import ActivityFeed from "../../components/wishlist/ActivityFeed";
import CompareTable from "../../components/wishlist/CompareTable";
import ShareModal from "../../components/wishlist/ShareModal";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
  { value: "verified", label: "Verified first" },
  { value: "station", label: "Nearest station" },
];

export default function WishlistPage() {
  const {
    listings,
    allListings,
    loading,
    sortBy,
    setSortBy,
    removeFromWishlist,
    collections,
    activeCollection,
    setActiveCollection,
    addCollection,
    removeCollection,
    moveToCollection,
    collectionMap,
    compareMode,
    setCompareMode,
    compareIds,
    toggleCompare,
    compareListings,
    stats,
    level,
    activities,
    unreadActivityCount,
  } = useWishlist();

  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCompareTable, setShowCompareTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Show activity feed by default on desktop
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Filter by search
  const displayListings = searchQuery
    ? listings.filter(
        (l) =>
          l.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings;

  const handleClearAll = useCallback(() => {
    // Would normally confirm with the user
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Hero + Gamification */}
          <HeroGamification
            level={level}
            stats={stats}
            onShare={() => setShowShareModal(true)}
            onClearAll={handleClearAll}
          />

          {/* Collections bar */}
          <CollectionsBar
            collections={collections}
            activeCollection={activeCollection}
            onSelect={setActiveCollection}
            onAddCollection={addCollection}
            onRemoveCollection={removeCollection}
          />

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wishlist..."
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Sort */}
              <div className="relative flex-1 sm:flex-none">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="input-field pl-9 py-2.5 text-xs appearance-none bg-no-repeat pr-8"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 8px center",
                    backgroundSize: "16px",
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View mode */}
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Compare toggle */}
              <button
                onClick={() => {
                  setCompareMode(!compareMode);
                  if (compareMode) setShowCompareTable(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  compareMode
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/30"
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compare</span>
              </button>

              {/* Activity bell (mobile) */}
              <button
                onClick={() => setShowActivityFeed(true)}
                className="relative p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-colors lg:hidden"
              >
                <Bell className="w-4 h-4" />
                {unreadActivityCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadActivityCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>

          {/* Loading state */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] shimmer" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-2/3 rounded-lg shimmer" />
                    <div className="h-3 w-1/2 rounded-lg shimmer" />
                    <div className="h-3 w-full rounded-lg shimmer" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full shimmer" />
                      <div className="h-6 w-16 rounded-full shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayListings.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-12 rounded-2xl text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center mb-5">
                <Heart className="w-10 h-10 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {searchQuery ? "No matches found" : activeCollection !== "all" ? "No listings in this collection" : "Your wishlist is empty"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                {searchQuery
                  ? "Try a different search term or clear your filters."
                  : activeCollection !== "all"
                  ? "Move listings here by using the grip icon on any card."
                  : "Start exploring rooms and tap the heart to save your favourites."}
              </p>
              {!searchQuery && activeCollection === "all" && (
                <Link
                  href="/seeker/search"
                  className="btn-primary px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Explore listings
                </Link>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn-secondary px-4 py-2 rounded-xl text-sm"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          ) : (
            /* Listings grid */
            <motion.div
              layout
              className={
                viewMode === "grid"
                  ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-3"
              }
            >
              <AnimatePresence mode="popLayout">
                {displayListings.map((listing, i) => (
                  <WishlistCard
                    key={listing.id}
                    listing={listing}
                    index={i}
                    onRemove={removeFromWishlist}
                    compareMode={compareMode}
                    isCompareSelected={compareIds.has(listing.id)}
                    onToggleCompare={toggleCompare}
                    collections={collections}
                    currentCollectionId={collectionMap[listing.id]}
                    onMoveToCollection={moveToCollection}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Compare floating bar */}
          <AnimatePresence>
            {compareMode && compareIds.size >= 2 && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
              >
                <button
                  onClick={() => setShowCompareTable(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105"
                >
                  <Columns3 className="w-5 h-5" />
                  Compare {compareIds.size} Listings
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop activity sidebar */}
        {isDesktop && (
          <div className="w-72 shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <ActivityFeed
                activities={activities}
                unreadCount={unreadActivityCount}
                show={true}
                onClose={() => {}}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile activity feed */}
      {!isDesktop && (
        <ActivityFeed
          activities={activities}
          unreadCount={unreadActivityCount}
          show={showActivityFeed}
          onClose={() => setShowActivityFeed(false)}
        />
      )}

      {/* Compare table modal */}
      {showCompareTable && compareListings.length >= 2 && (
        <CompareTable
          listings={compareListings}
          onClose={() => setShowCompareTable(false)}
          onRemove={(id) => toggleCompare(id)}
        />
      )}

      {/* Share modal */}
      <ShareModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        listings={allListings}
      />

      {/* Mobile FAB */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        className="fixed bottom-6 right-6 z-30 lg:hidden"
      >
        <Link
          href="/seeker/search"
          className="w-14 h-14 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-2xl shadow-rose-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </motion.div>
    </div>
  );
}
