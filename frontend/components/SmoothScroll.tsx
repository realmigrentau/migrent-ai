import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Momentum scrolling, marketing pages only.
 *
 * design.md scopes enrichment like this to marketing pages: "App pages MUST
 * NOT use enrichment - function carries the page." It was running site-wide,
 * which meant every dashboard, the search results list and the six-step
 * listing form all had their scrolling hijacked. That costs main-thread time
 * on exactly the screens where people are working, and momentum scroll fights
 * with a long filter list.
 *
 * It also respects prefers-reduced-motion, which it did not before. Scroll
 * hijacking is a common motion-sickness trigger.
 */
const APP_PREFIXES = ["/dashboard", "/owner", "/seeker", "/account", "/admin", "/messages", "/support"];

export default function SmoothScroll() {
  const router = useRouter();
  const isAppPage = APP_PREFIXES.some((p) => router.pathname.startsWith(p));

  useEffect(() => {
    if (isAppPage) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let cancelled = false;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;

    // Dynamic import so the library is not in the bundle for app pages.
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration: 0.8,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, [isAppPage]);

  return null;
}
