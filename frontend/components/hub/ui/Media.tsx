import Image from "next/image";
import { useState, type ReactNode } from "react";
import { Home } from "lucide-react";
import { cn } from "../../../lib/cn";

const OPTIMISED_HOSTS = ["nsnwwfbidishftlrimer.supabase.co", "images.unsplash.com"];

function optimisable(src: string): boolean {
  try {
    return OPTIMISED_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

interface HomeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: string;
  children?: ReactNode;
}

/**
 * A property photo: fills its box, crops sensibly, fades in when loaded,
 * and falls back to a designed placeholder when there is no photo or it
 * fails - never a broken-image icon.
 */
export function HomeImage({ src, alt, className, sizes = "(max-width: 640px) 100vw, 400px", priority, rounded = "rounded-[18px]", children }: HomeImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const show = src && !failed;
  return (
    <div className={cn("relative overflow-hidden bg-[var(--color-surface-muted)]", rounded, className)}>
      {show ? (
        optimisable(src) ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn("hub-img object-cover transition-[opacity,transform] duration-500 ease-[var(--ease-out)]", loaded ? "opacity-100" : "opacity-0")}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn("hub-img absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-[var(--ease-out)]", loaded ? "opacity-100" : "opacity-0")}
          />
        )
      ) : (
        <div className="hub-photo-fallback absolute inset-0 flex items-center justify-center" role="img" aria-label={alt ? `${alt} (no photo yet)` : "No photo yet"}>
          <Home className="h-8 w-8 text-[color:var(--color-ink-4)]" strokeWidth={1.5} aria-hidden />
        </div>
      )}
      {show && !loaded && <div aria-hidden className="hub-skeleton absolute inset-0" />}
      {children}
    </div>
  );
}

export function Avatar({ name, src, size = 40, className }: { name?: string | null; src?: string | null; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initials =
    (name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "M";
  // A stable hue per name keeps avatars distinguishable without random colour.
  let hash = 0;
  for (const ch of name || "M") hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const hues = [222, 230, 212, 204, 240, 196];
  const hue = hues[hash % hues.length];
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold", className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, size * 0.38),
        background: `hsl(${hue} 70% 94%)`,
        color: `hsl(${hue} 55% 32%)`,
      }}
      aria-hidden={!name}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        initials
      )}
    </span>
  );
}
