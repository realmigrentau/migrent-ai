import { useState, useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "../lib/supabase";

export interface UploadablePhoto {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "compressing" | "uploading" | "done" | "error";
  url?: string;
  error?: string;
}

interface UsePhotoUploadOptions {
  bucket: string;
  pathPrefix: string;
  maxFiles?: number;
  maxSizeMB?: number;
  compressionMaxSizeMB?: number;
  compressionMaxWidthOrHeight?: number;
}

interface UsePhotoUploadReturn {
  photos: UploadablePhoto[];
  addFiles: (files: FileList | File[]) => void;
  removePhoto: (id: string) => void;
  reorderPhotos: (fromIndex: number, toIndex: number) => void;
  uploadAll: () => Promise<string[]>;
  uploading: boolean;
  overallProgress: number;
  reset: () => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

async function compressImage(
  file: File,
  maxSizeMB: number,
  maxWidthOrHeight: number
): Promise<File> {
  if (file.size <= maxSizeMB * 1024 * 1024 && file.type === "image/webp") {
    return file;
  }
  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: "image/webp",
  });
  return new File([compressed], file.name.replace(/\.[^.]+$/, ".webp"), {
    type: "image/webp",
  });
}

export function usePhotoUpload({
  bucket,
  pathPrefix,
  maxFiles = 20,
  maxSizeMB = 10,
  compressionMaxSizeMB = 1,
  compressionMaxWidthOrHeight = 2048,
}: UsePhotoUploadOptions): UsePhotoUploadReturn {
  const [photos, setPhotos] = useState<UploadablePhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const abortRef = useRef(false);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: UploadablePhoto[] = [];

      for (const file of fileArray) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > maxSizeMB * 1024 * 1024) continue;

        validFiles.push({
          id: generateId(),
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "pending",
        });
      }

      setPhotos((prev) => {
        const remaining = maxFiles - prev.length;
        if (remaining <= 0) return prev;
        return [...prev, ...validFiles.slice(0, remaining)];
      });
    },
    [maxFiles, maxSizeMB]
  );

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const reorderPhotos = useCallback((fromIndex: number, toIndex: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const updatePhoto = useCallback(
    (id: string, updates: Partial<UploadablePhoto>) => {
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const uploadSingle = useCallback(
    async (photo: UploadablePhoto, index: number): Promise<string | null> => {
      if (abortRef.current) return null;

      // Compress
      updatePhoto(photo.id, { status: "compressing", progress: 10 });
      let fileToUpload: File;
      try {
        fileToUpload = await compressImage(
          photo.file,
          compressionMaxSizeMB,
          compressionMaxWidthOrHeight
        );
      } catch {
        fileToUpload = photo.file;
      }

      // Upload
      updatePhoto(photo.id, { status: "uploading", progress: 30 });
      const timestamp = Date.now();
      const filePath = `${pathPrefix}/${timestamp}-${index}.webp`;

      let lastError: unknown = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (abortRef.current) return null;

        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, fileToUpload, {
            cacheControl: "3600",
            upsert: false,
            contentType: "image/webp",
          });

        if (!error) {
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            updatePhoto(photo.id, {
              status: "done",
              progress: 100,
              url: urlData.publicUrl,
            });
            return urlData.publicUrl;
          }
        }
        lastError = error;
        // Brief pause before retry
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      updatePhoto(photo.id, {
        status: "error",
        progress: 0,
        error: lastError instanceof Error ? lastError.message : "Upload failed",
      });
      return null;
    },
    [bucket, pathPrefix, compressionMaxSizeMB, compressionMaxWidthOrHeight, updatePhoto]
  );

  const uploadAll = useCallback(async (): Promise<string[]> => {
    setUploading(true);
    abortRef.current = false;

    const pending = photos.filter(
      (p) => p.status === "pending" || p.status === "error"
    );

    // Upload in parallel batches of 3
    const batchSize = 3;
    const urls: string[] = [];

    for (let i = 0; i < pending.length; i += batchSize) {
      if (abortRef.current) break;
      const batch = pending.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((photo, batchIdx) => uploadSingle(photo, i + batchIdx))
      );
      for (const url of results) {
        if (url) urls.push(url);
      }
    }

    // Also include already-uploaded URLs in order
    const allUrls: string[] = [];
    const currentPhotos = photos.filter(
      (p) => p.status === "done" && p.url
    );
    for (const p of currentPhotos) {
      if (p.url && !urls.includes(p.url)) allUrls.push(p.url);
    }
    allUrls.push(...urls);

    setUploading(false);
    return allUrls;
  }, [photos, uploadSingle]);

  const overallProgress =
    photos.length === 0
      ? 0
      : Math.round(
          photos.reduce((sum, p) => sum + p.progress, 0) / photos.length
        );

  const reset = useCallback(() => {
    abortRef.current = true;
    for (const photo of photos) {
      URL.revokeObjectURL(photo.preview);
    }
    setPhotos([]);
    setUploading(false);
  }, [photos]);

  return {
    photos,
    addFiles,
    removePhoto,
    reorderPhotos,
    uploadAll,
    uploading,
    overallProgress,
    reset,
  };
}
