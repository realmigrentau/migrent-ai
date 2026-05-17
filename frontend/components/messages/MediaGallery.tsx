import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Share2 } from "lucide-react";

interface MediaGalleryProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaGallery({ images, initialIndex = 0, isOpen, onClose }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.5, 4));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.5, 0.5));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, currentIndex, images.length]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const handleDoubleClick = () => {
    if (zoom > 1) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(2.5);
    }
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/50">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm text-white/60 font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.5, 0.5))}
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ZoomOut className="w-4.5 h-4.5" />
            </button>
            <span className="text-xs text-white/40 font-medium w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ZoomIn className="w-4.5 h-4.5" />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <a
              href={images[currentIndex]}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Download className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>

        {/* Image container */}
        <div
          className="flex-1 flex items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing"
          onDoubleClick={handleDoubleClick}
        >
          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-all shadow-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: zoom,
              x: position.x,
              y: position.y,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={images[currentIndex]}
            alt=""
            className="max-w-[90vw] max-h-[80vh] object-contain select-none rounded-lg"
            draggable={false}
          />

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={next}
              className="absolute right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-all shadow-xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="px-4 py-3 bg-black/50">
            <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 transition-all ${
                    i === currentIndex
                      ? "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-black opacity-100 scale-105"
                      : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
