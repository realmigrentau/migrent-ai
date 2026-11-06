import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  Expand,
} from "lucide-react";
import VerificationBadge from "../VerificationBadge";
import type { VerificationSummary } from "../../lib/api";

interface ListingHeroProps {
  images: string[];
  title: string;
  instantBook?: boolean;
  /** Server-computed host verification. The hero shows the pill only for
   * a fully verified host; anything else is left to the owner card. */
  verification?: VerificationSummary | null;
}

export default function ListingHero({
  images,
  title,
  instantBook,
  verification,
}: ListingHeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  // Phones: which photo of the swipe strip is in view.
  const [stripIndex, setStripIndex] = useState(0);
  const onStripScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const el = e.currentTarget;
    setStripIndex(Math.max(0, Math.min(images.length - 1, Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))));
  };

  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[selectedIndex] : null;

  const goTo = useCallback(
    (dir: 1 | -1) => {
      setSelectedIndex((prev) => {
        const next = prev + dir;
        if (next < 0) return images.length - 1;
        if (next >= images.length) return 0;
        return next;
      });
    },
    [images.length]
  );

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, goTo]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? -1 : 1);
    }
    touchStart.current = null;
  };

  if (!hasImages) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-[var(--color-surface-muted)] flex items-center justify-center">
        <span className="text-[var(--color-ink-3)] text-sm">No photos available</span>
      </div>
    );
  }

  const badges = (instantBook || verification?.status === "verified") && (
    <>
      {instantBook && (
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-800 bg-[var(--color-warn-50)]/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Zap className="w-3 h-3" />
          Instant Book
        </span>
      )}
      {verification?.status === "verified" && (
        <VerificationBadge verification={verification} className="!px-3 !py-1.5 !text-xs backdrop-blur-sm" />
      )}
    </>
  );

  return (
    <>
      {/* Phones: every photo in one row that follows the finger, edge to
          edge, the way a phone's own photo viewer works. A tap opens the
          full-screen viewer on that photo. */}
      <div className="relative mx-[calc(var(--space-gutter)*-1)] md:hidden">
        <ul
          className="m-0 flex list-none snap-x snap-mandatory overflow-x-auto overscroll-x-contain p-0 scrollbar-hide"
          aria-label={`Photos of ${title}`}
          onScroll={onStripScroll}
        >
          {images.map((img, i) => (
            <li key={i} className="relative aspect-[4/3] w-full flex-none snap-center [scroll-snap-stop:always]">
              <button
                type="button"
                onClick={() => {
                  setSelectedIndex(i);
                  setLightboxOpen(true);
                }}
                className="absolute inset-0 z-[1] h-full w-full"
                aria-label={`Open photo ${i + 1} of ${images.length} in full screen`}
              />
              <Image src={img} alt={`${title}, photo ${i + 1} of ${images.length}`} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" aria-hidden="true" />
        {badges && <div className="pointer-events-none absolute left-4 top-4 z-[2] flex items-center gap-2">{badges}</div>}
        {images.length > 1 && (
          <>
            <div className="pointer-events-none absolute bottom-3 right-4 z-[2] rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white tabular-nums backdrop-blur-sm" aria-live="polite">
              <span className="sr-only">Photo </span>
              {stripIndex + 1} / {images.length}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[2] flex justify-center gap-1.5" aria-hidden="true">
              {images.slice(0, 8).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full bg-white transition-all duration-300 ${Math.min(stripIndex, 7) === i ? "w-4 opacity-100" : "w-1.5 opacity-60"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main photo */}
      <div className="relative hidden md:block">
        <div
          className="relative aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden group"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 z-[1] w-full h-full cursor-zoom-in"
            aria-label={`Open photo ${selectedIndex + 1} of ${images.length} in full screen`}
          />
          <Image
            src={currentImage!}
            alt={`${title}, photo ${selectedIndex + 1} of ${images.length}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">{badges}</div>

          {/* Expand hint */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none" aria-hidden="true">
            <span className="flex items-center gap-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Expand className="w-3 h-3" />
              View all photos
            </span>
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full" aria-live="polite">
              <span className="sr-only">Photo </span>{selectedIndex + 1} / {images.length}
            </div>
          )}

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(-1);
                }}
                className="absolute z-[2] left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 dark:bg-[var(--color-surface)]/85 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity shadow-md hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5 text-[var(--color-ink-2)]" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(1);
                }}
                className="absolute z-[2] right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 dark:bg-[var(--color-surface)]/85 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity shadow-md hover:bg-white"
              >
                <ChevronRight className="w-5 h-5 text-[var(--color-ink-2)]" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-pressed={selectedIndex === i}
                onClick={() => setSelectedIndex(i)}
                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  selectedIndex === i
                    ? "border-[var(--color-primary)] shadow-md"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt=""
                  width={80}
                  height={56}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Photos of ${title}`}
          >
            <button
              type="button"
              autoFocus
              aria-label="Close photo viewer"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-[max(16px,env(safe-area-inset-top))] right-4 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" aria-hidden="true" />
            </button>

            <div
              className="relative w-full max-w-5xl mx-4"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <motion.img
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                src={images[selectedIndex]}
                alt={`${title}, photo ${selectedIndex + 1} of ${images.length}`}
                className="w-full max-h-[85vh] object-contain rounded-lg"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() => goTo(-1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => goTo(1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" aria-hidden="true" />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to photo ${i + 1}`}
                      aria-current={selectedIndex === i ? "true" : undefined}
                      onClick={() => setSelectedIndex(i)}
                      className={`min-w-[12px] h-3 rounded-full transition-all ${
                        selectedIndex === i
                          ? "bg-white w-6"
                          : "bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
