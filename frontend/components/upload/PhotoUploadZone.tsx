import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { usePhotoUpload, UploadablePhoto } from "../../hooks/usePhotoUpload";

interface PhotoUploadZoneProps {
  bucket: string;
  pathPrefix: string;
  maxFiles?: number;
  minFiles?: number;
  onPhotosChange?: (photos: UploadablePhoto[]) => void;
  onUploadComplete?: (urls: string[]) => void;
}

export default function PhotoUploadZone({
  bucket,
  pathPrefix,
  maxFiles = 20,
  minFiles = 5,
  onPhotosChange,
  onUploadComplete,
}: PhotoUploadZoneProps) {
  const {
    photos,
    addFiles,
    removePhoto,
    reorderPhotos,
    uploadAll,
    uploading,
    overallProgress,
    rejections,
    clearRejections,
  } = usePhotoUpload({
    bucket,
    pathPrefix,
    maxFiles,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [reorderItems, setReorderItems] = useState<UploadablePhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Sync reorderItems with photos
  useEffect(() => {
    setReorderItems(photos);
  }, [photos]);

  useEffect(() => {
    onPhotosChange?.(photos);
  }, [photos, onPhotosChange]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      if (e.dataTransfer.files?.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles]
  );

  const handleUpload = useCallback(async () => {
    const urls = await uploadAll();
    if (urls.length > 0) {
      onUploadComplete?.(urls);
    }
  }, [uploadAll, onUploadComplete]);

  // Thumbnail drag reorder
  const handleThumbDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    []
  );

  const handleThumbDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      setDragOverIndex(index);
    },
    []
  );

  const handleThumbDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        reorderPhotos(fromIndex, toIndex);
      }
      setDragOverIndex(null);
    },
    [reorderPhotos]
  );

  const uploadedCount = photos.filter((p) => p.status === "done").length;
  const hasErrors = photos.some((p) => p.status === "error");
  const canUpload = photos.length >= minFiles && !uploading;
  const allDone = photos.length > 0 && photos.every((p) => p.status === "done");

  return (
    <div className="space-y-4">
      {/* Files the picker refused. These were dropped silently before, so an
          owner adding an iPhone HEIC or an 12MB photo saw nothing happen and
          assumed uploads were broken. */}
      {rejections.length > 0 && (
        <div
          role="alert"
          className="rounded-[10px] border border-[var(--color-line-2)] bg-[var(--color-warn-50)] px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">
                {rejections.length === 1 ? "One photo was not added" : `${rejections.length} photos were not added`}
              </p>
              <ul className="mt-1 space-y-0.5">
                {rejections.map((r, i) => (
                  <li key={i} className="text-[13px] text-[var(--color-ink-2)] break-words">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={clearRejections}
              className="text-[12.5px] font-semibold text-[var(--color-ink-3)] hover:text-[var(--color-ink)] shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer
          transition-all duration-300 group
          ${
            isDragging
              ? "border-[var(--color-line-2)] dark:border-[var(--color-primary)] bg-[var(--color-primary-soft)]/50 dark:bg-[var(--color-primary)]/10 photo-drop-glow"
              : "border-[var(--color-line-2)] hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-primary)]/40"
          }
          ${photos.length >= maxFiles ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-[var(--color-primary-soft)] from-white/80 to-slate-50/80 dark:from-[var(--color-ink)]/80 dark:to-slate-900/80 backdrop-blur-sm" />

        <div className="relative z-10">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300
            ${
              isDragging
                ? "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/20 scale-110"
                : "bg-[var(--color-surface-muted)] group-hover:bg-[var(--color-primary-soft)] dark:group-hover:bg-[var(--color-primary)]/10"
            }`}
          >
            <svg
              className={`w-8 h-8 transition-colors duration-300 ${
                isDragging
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-ink-3)] group-hover:text-[var(--color-primary)]"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>

          <p className="text-sm font-medium text-[var(--color-ink-2)] mb-1">
            {isDragging
              ? "Drop your photos here"
              : `Drop ${minFiles}-${maxFiles} photos here`}
          </p>
          <p className="text-xs text-[var(--color-ink-3)]">
            or click to browse - JPG, PNG, WebP up to 10MB each
          </p>
          {photos.length > 0 && (
            <p className="text-xs text-[var(--color-primary)] dark:text-[var(--color-primary)] mt-2 font-medium">
              {photos.length}/{maxFiles} photos added
            </p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          capture={undefined}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Pro tip */}
      {photos.length > 0 && photos.length < minFiles && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)] bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10 border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20 rounded-xl px-3 py-2"
        >
          Add at least {minFiles} photos to continue. You have {photos.length} so
          far.
        </motion.p>
      )}

      {photos.length >= minFiles && !allDone && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[var(--color-primary)] dark:text-[var(--color-primary)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)]0/10 border border-[var(--color-primary-100)] dark:border-teal-500/20 rounded-xl px-3 py-2"
        >
          Pro tip: First photo becomes the hero image. Drag to reorder.
        </motion.p>
      )}

      {/* Photo grid */}
      <AnimatePresence mode="popLayout">
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
          >
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                draggable
                onDragStart={(e) =>
                  handleThumbDragStart(
                    e as unknown as React.DragEvent,
                    index
                  )
                }
                onDragOver={(e) =>
                  handleThumbDragOver(
                    e as unknown as React.DragEvent,
                    index
                  )
                }
                onDrop={(e) =>
                  handleThumbDrop(e as unknown as React.DragEvent, index)
                }
                onDragEnd={() => setDragOverIndex(null)}
                className={`
                  relative group aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing
                  bg-[var(--color-surface-muted)] border-2 transition-all
                  ${
                    dragOverIndex === index
                      ? "border-[var(--color-line-2)] dark:border-[var(--color-primary)] scale-105"
                      : "border-transparent"
                  }
                  ${index === 0 ? "ring-2 ring-[var(--color-primary)] dark:ring-[var(--color-primary)] ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : ""}
                `}
              >
                <img
                  src={photo.preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* Hero badge */}
                {index === 0 && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[var(--color-primary)] text-white text-[10px] font-bold">
                    HERO
                  </div>
                )}

                {/* Progress overlay */}
                {(photo.status === "compressing" ||
                  photo.status === "uploading") && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="relative w-10 h-10">
                      <svg
                        className="w-10 h-10 -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke={
                            photo.status === "compressing"
                              ? "#f59e0b"
                              : "#14b8a6"
                          }
                          strokeWidth="3"
                          strokeDasharray={`${photo.progress * 0.94} 94`}
                          strokeLinecap="round"
                          className="transition-all duration-300"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                        {photo.progress}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Done overlay */}
                {photo.status === "done" && (
                  <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--color-accent-soft)]0 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                {/* Error overlay */}
                {photo.status === "error" && (
                  <div className="absolute inset-0 bg-[var(--color-danger-50)]0/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-danger-50)]0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                )}

                {/* Delete button */}
                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(photo.id);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-[var(--color-danger-50)]0"
                  >
                    &times;
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload button */}
      {canUpload && !allDone && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[var(--color-primary)] from-[var(--color-primary-50)]0 to-teal-600 hover:from-[var(--color-primary)] hover:to-teal-700 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
        >
          Upload {photos.length} photos
        </motion.button>
      )}

      {/* Overall progress bar */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-ink-3)]">
              Uploading {photos.length} photos...
            </span>
            <span className="text-[var(--color-primary)] dark:text-[var(--color-primary)] font-medium">
              {overallProgress}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-line)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[var(--color-primary)] from-teal-400 to-[var(--color-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Upload complete */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-[var(--color-accent)] dark:text-[var(--color-accent)] bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] rounded-xl px-4 py-3"
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">
            Upload complete - {uploadedCount} photos ready
          </span>
        </motion.div>
      )}

      {/* Error summary */}
      {hasErrors && !uploading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]"
        >
          Some photos failed to upload. Click upload to retry.
        </motion.p>
      )}
    </div>
  );
}
