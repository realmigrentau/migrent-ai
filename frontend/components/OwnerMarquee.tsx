import Link from "next/link";
import { motion } from "framer-motion";
import { useTopListings, type MarqueeListing } from "../hooks/useTopListings";

function MarqueeCard({ listing }: { listing: MarqueeListing }) {
  const href = listing.id.startsWith("fallback-")
    ? "/seeker/search"
    : `/listing/${listing.id}`;

  return (
    <Link href={href} className="block shrink-0">
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        transition={{ duration: 0.2 }}
        className="w-[280px] h-[120px] rounded-xl overflow-hidden card cursor-pointer flex"
      >
        {/* Image */}
        <div className="w-[140px] h-full shrink-0 relative overflow-hidden">
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {listing.superhost && (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[var(--color-primary)] text-white text-[9px] font-bold uppercase tracking-wide shadow-sm">
              Superhost
            </span>
          )}
          {listing.ownerVerified && !listing.superhost && (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[var(--color-accent-soft)]0 text-white text-[9px] font-bold uppercase tracking-wide shadow-sm">
              Verified
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-2.5 flex flex-col justify-between min-w-0">
          <div>
            {/* Rating */}
            <div className="flex items-center gap-1">
              <span className="text-amber-500 text-xs">★</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {listing.rating.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                ({listing.reviewsCount})
              </span>
            </div>

            {/* Price */}
            <div className="mt-0.5">
              <span className="text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-primary)]">
                ${listing.weeklyPrice}
              </span>
              <span className="text-[10px] text-[var(--color-primary)] dark:text-[var(--color-primary)]">/wk</span>
            </div>

            {/* Title */}
            <h3 className="text-[11px] font-semibold text-slate-900 dark:text-white leading-tight mt-0.5 line-clamp-1">
              {listing.title}
            </h3>
          </div>

          {/* Bottom row */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <span>{listing.beds} bed{listing.beds > 1 ? "s" : ""}</span>
            {listing.nearestStation && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="truncate">{listing.nearestStation}</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function MarqueeRow({
  items,
  direction,
}: {
  items: MarqueeListing[];
  direction: "left" | "right";
}) {
  // Duplicate items for seamless looping
  const duplicated = [...items, ...items];
  const animClass = direction === "left" ? "marquee-scroll-left" : "marquee-scroll-right";

  return (
    <div className="overflow-hidden relative group">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-[var(--color-primary)] from-slate-50 dark:from-slate-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent" />

      <div className={`flex gap-4 ${animClass} group-hover:[animation-play-state:paused]`}>
        {duplicated.map((listing, i) => (
          <MarqueeCard key={`${listing.id}-${i}`} listing={listing} />
        ))}
      </div>
    </div>
  );
}

function ShimmerCard() {
  return (
    <div className="w-[280px] h-[120px] rounded-xl overflow-hidden card flex shrink-0">
      <div className="w-[140px] h-full shimmer" />
      <div className="flex-1 p-2.5 space-y-2">
        <div className="h-3 w-16 shimmer rounded" />
        <div className="h-4 w-12 shimmer rounded" />
        <div className="h-3 w-full shimmer rounded" />
        <div className="h-2 w-20 shimmer rounded" />
      </div>
    </div>
  );
}

export default function OwnerMarquee() {
  const { listings, loading } = useTopListings();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerCard key={i} />
          ))}
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const row1 = listings.slice(0, 8);
  const row2 = listings.slice(8, 16);

  return (
    <div className="space-y-4">
      <MarqueeRow items={row1} direction="left" />
      <MarqueeRow items={row2} direction="right" />
    </div>
  );
}
