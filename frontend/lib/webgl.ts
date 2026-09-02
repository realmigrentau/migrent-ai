/**
 * WebGL capability detection.
 *
 * MapLibre throws synchronously from `new Map()` when the browser cannot
 * create a WebGL context (no GPU, blocked by policy, headless, some VMs,
 * "Use hardware acceleration" switched off). Because that happened inside a
 * React effect, the throw unmounted the whole search page and replaced it
 * with the framework's error screen. Detect first, then decide whether to
 * mount the map at all.
 */

export type WebGLSupport = "supported" | "unsupported" | "unknown";

let cached: WebGLSupport | null = null;

export function detectWebGL(): WebGLSupport {
  if (cached) return cached;
  if (typeof window === "undefined" || typeof document === "undefined") return "unknown";
  try {
    const canvas = document.createElement("canvas");
    const attrs = { failIfMajorPerformanceCaveat: false } as WebGLContextAttributes;
    const gl =
      canvas.getContext("webgl2", attrs) ||
      canvas.getContext("webgl", attrs) ||
      canvas.getContext("experimental-webgl", attrs);
    if (!gl) {
      cached = "unsupported";
      return cached;
    }
    // Some drivers hand back a context that immediately reports itself lost.
    const ctx = gl as WebGLRenderingContext;
    if (typeof ctx.isContextLost === "function" && ctx.isContextLost()) {
      cached = "unsupported";
      return cached;
    }
    cached = "supported";
    return cached;
  } catch {
    cached = "unsupported";
    return cached;
  }
}

/** Test hook: lets Playwright force the "unsupported" branch without a
 * driver flag. Reads a global set by page.addInitScript. */
export function webglForcedUnavailable(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as unknown as { __MIGRENT_DISABLE_WEBGL__?: boolean }).__MIGRENT_DISABLE_WEBGL__);
}

export function isWebGLAvailable(): boolean {
  if (webglForcedUnavailable()) return false;
  return detectWebGL() === "supported";
}
