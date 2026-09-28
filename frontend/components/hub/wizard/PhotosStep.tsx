import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, RotateCw, Star, Trash2, UploadCloud } from "lucide-react";
import { Button } from "../ui/Button";
import { useToast } from "../../ui/Toast";
import { hubUploadWithProgress, HubError } from "../../../lib/hub/api";
import { cn } from "../../../lib/cn";

const MAX = 20;
const TYPES = /^image\/(jpeg|png|webp|heic|heif)$/;

interface Pending {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

/**
 * Listing photos: drop or choose several at once, watch them upload, drag
 * (or use the arrow buttons) to reorder. The first photo is the cover.
 */
export default function PhotosStep({ images, onChange }: { images: string[]; onChange: (next: string[]) => void }) {
  const toast = useToast();
  const [pending, setPending] = useState<Pending[]>([]);
  const [over, setOver] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  // Uploads finish one by one; each appends to the latest list, not the one it started with.
  const latest = useRef(images);
  useEffect(() => {
    latest.current = images;
  }, [images]);

  async function uploadOne(p: Pending) {
    const form = new FormData();
    form.append("file", p.file, p.file.name);
    try {
      const res = await hubUploadWithProgress<{ url: string }>("/hub/listing-photos", form, (f) => setPending((xs) => xs.map((x) => (x.id === p.id ? { ...x, progress: f } : x))));
      latest.current = [...latest.current, res.url].slice(0, MAX);
      onChange(latest.current);
      setPending((xs) => xs.filter((x) => x.id !== p.id));
      URL.revokeObjectURL(p.preview);
    } catch (e) {
      setPending((xs) => xs.map((x) => (x.id === p.id ? { ...x, error: e instanceof HubError ? e.message : "Didn't upload" } : x)));
    }
  }

  async function add(list: FileList | File[] | null) {
    if (!list) return;
    const room = MAX - images.length - pending.length;
    const all = Array.from(list);
    const ok = all.filter((f) => TYPES.test(f.type) && f.size <= 15 * 1024 * 1024);
    if (ok.length < all.length) toast.warning("Some files were skipped. Use JPEG, PNG or WebP photos up to 15MB.");
    if (ok.length > room) toast.info(`Listings can have up to ${MAX} photos.`);
    const batch = ok.slice(0, Math.max(0, room)).map((file) => ({ id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`, file, preview: URL.createObjectURL(file), progress: 0 }));
    setPending((xs) => [...xs, ...batch]);
    // Three at a time keeps a phone connection responsive.
    const queue = [...batch];
    const worker = async () => {
      while (queue.length) await uploadOne(queue.shift()!);
    };
    await Promise.all([worker(), worker(), worker()]);
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        onDragOver={(e) => {
          if (dragFrom !== null) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (dragFrom !== null) return;
          e.preventDefault();
          setOver(false);
          void add(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed px-6 py-10 text-center transition-colors",
          over ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]" : "border-[var(--color-line-2)] bg-[var(--color-surface)]",
        )}
      >
        <UploadCloud className="h-8 w-8 text-[color:var(--color-primary)]" strokeWidth={1.6} aria-hidden />
        <div>
          <p className="text-[16px] font-semibold text-[color:var(--color-ink)]">Drop photos here</p>
          <p className="mt-1 text-[13.5px] text-[color:var(--color-ink-3)]">Or choose them. Up to {MAX}; landscape photos in daylight look best.</p>
        </div>
        <Button variant="secondary" icon={<ImagePlus className="h-4 w-4" strokeWidth={1.75} />} onClick={() => input.current?.click()} disabled={images.length + pending.length >= MAX}>
          Choose photos
        </Button>
        <input
          ref={input}
          type="file"
          aria-label="Choose listing photos"
          tabIndex={-1}
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="sr-only"
          onChange={(e) => {
            void add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {(images.length > 0 || pending.length > 0) && (
        <div>
          <p className="mb-3 text-[13.5px] text-[color:var(--color-ink-3)]" id="photo-order-help">
            {images.length} of {MAX}. The first photo is the cover. Drag to reorder, or use the arrows.
          </p>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-describedby="photo-order-help">
            {images.map((src, i) => (
              <li
                key={src}
                draggable
                onDragStart={() => setDragFrom(i)}
                onDragEnd={() => setDragFrom(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragFrom !== null) move(dragFrom, i);
                  setDragFrom(null);
                }}
                className={cn("group relative aspect-[4/3] cursor-grab overflow-hidden rounded-[16px] bg-[var(--color-surface-muted)] active:cursor-grabbing", dragFrom === i && "opacity-50", i === 0 && "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg)]")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Photo ${i + 1}${i === 0 ? " (cover)" : ""}`} className="h-full w-full object-cover" loading="lazy" draggable={false} />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[11.5px] font-bold text-[color:var(--color-primary-fg)]">Cover</span>}
                <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                  <div className="flex gap-1">
                    <button type="button" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, i - 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur disabled:opacity-40">
                      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button type="button" aria-label={`Move photo ${i + 1} later`} disabled={i === images.length - 1} onClick={() => move(i, i + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur disabled:opacity-40">
                      <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </button>
                    {i !== 0 && (
                      <button type="button" aria-label={`Make photo ${i + 1} the cover`} onClick={() => move(i, 0)} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
                        <Star className="h-4 w-4" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                  <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => onChange(images.filter((_, j) => j !== i))} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </li>
            ))}
            {pending.map((p) => (
              <li key={p.id} className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-[var(--color-surface-muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt="" className={cn("h-full w-full object-cover", !p.error && "opacity-50")} />
                {p.error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 p-3 text-center text-white">
                    <p className="text-[12.5px] font-semibold leading-snug">{p.error}</p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPending((xs) => xs.map((x) => (x.id === p.id ? { ...x, error: undefined, progress: 0 } : x)));
                          void uploadOne(p);
                        }}
                        className="inline-flex h-8 items-center gap-1 rounded-full bg-white/20 px-3 text-[12.5px] font-semibold hover:bg-white/30"
                      >
                        <RotateCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Retry
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(p.preview);
                          setPending((xs) => xs.filter((x) => x.id !== p.id));
                        }}
                        className="inline-flex h-8 items-center rounded-full bg-white/20 px-3 text-[12.5px] font-semibold hover:bg-white/30"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" role="status">
                    <Loader2 className="h-6 w-6 animate-spin text-[color:var(--color-ink)]" strokeWidth={2} aria-hidden />
                    <div className="h-1.5 w-2/3 overflow-hidden rounded-full bg-white/60">
                      <div className="h-full rounded-full bg-[var(--color-primary)] transition-[width]" style={{ width: `${Math.round(p.progress * 100)}%` }} />
                    </div>
                    <span className="sr-only">Uploading {Math.round(p.progress * 100)}%</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <ul className="grid gap-2 text-[13.5px] text-[color:var(--color-ink-2)] sm:grid-cols-2">
        <li>• Show every room renters would use: bedroom, bathroom, kitchen, living areas.</li>
        <li>• Include the outside and the street, so people know where they're going.</li>
        <li>• We remove location data from photos before they're published.</li>
        <li>• No people, number plates or personal documents in shot.</li>
      </ul>
    </div>
  );
}
