import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { HCaptchaContextValue } from "@hcaptcha/react-hcaptcha/hooks";

/**
 * hCaptcha, loaded when someone starts using the form rather than with the
 * page (MIGRENT_MASTER_AUDIT MIG-028: on a mid-range phone the script was a
 * large share of the sign-up page's long tasks).
 *
 * The library's provider loads its script the moment it mounts, and adding
 * it as an ancestor later would remount the form and lose what was typed.
 * So this provider is the stable ancestor, and the library's provider is
 * mounted beside the page once wanted: on the first tap, key press or
 * focus, or at the latest when the form asks for a token.
 *
 * Pages call useCaptcha(), which has the same executeInstance and
 * resetInstance the library's hook had.
 */

const HCaptchaProvider = dynamic(() => import("@hcaptcha/react-hcaptcha/hooks").then((m) => m.HCaptchaProvider), { ssr: false });
const Bridge = dynamic(
  () =>
    import("@hcaptcha/react-hcaptcha/hooks").then((m) => {
      function CaptchaBridge({ onChange }: { onChange: (v: HCaptchaContextValue | null) => void }) {
        const value = m.useHCaptcha();
        useEffect(() => {
          onChange(value ?? null);
        }, [value, onChange]);
        return null;
      }
      return CaptchaBridge;
    }),
  { ssr: false },
);

interface Captcha {
  executeInstance: () => Promise<string | undefined>;
  resetInstance: () => void;
}

const CaptchaContext = createContext<Captcha | null>(null);

/** How long a submit waits for the script before going ahead without a token. */
const READY_TIMEOUT_MS = 10000;

export function LazyCaptchaProvider({ sitekey, children }: { sitekey: string; children: ReactNode }) {
  const [wanted, setWanted] = useState(false);
  const instance = useRef<HCaptchaContextValue | null>(null);
  const waiters = useRef<((ready: boolean) => void)[]>([]);

  useEffect(() => {
    if (wanted) return;
    const want = () => setWanted(true);
    const events = ["pointerdown", "keydown", "focusin"] as const;
    for (const e of events) window.addEventListener(e, want, { once: true, capture: true, passive: true });
    return () => {
      for (const e of events) window.removeEventListener(e, want, { capture: true });
    };
  }, [wanted]);

  const onChange = useCallback((v: HCaptchaContextValue | null) => {
    instance.current = v;
    if (v?.ready) {
      for (const w of waiters.current.splice(0)) w(true);
    }
  }, []);

  const value = useMemo<Captcha>(
    () => ({
      executeInstance: async () => {
        setWanted(true);
        if (!instance.current?.ready) {
          const ready = await new Promise<boolean>((resolve) => {
            waiters.current.push(resolve);
            window.setTimeout(() => resolve(false), READY_TIMEOUT_MS);
          });
          if (!ready) return undefined;
        }
        return instance.current?.executeInstance();
      },
      resetInstance: () => instance.current?.resetInstance(),
    }),
    [],
  );

  return (
    <CaptchaContext.Provider value={value}>
      {children}
      {wanted && (
        <HCaptchaProvider sitekey={sitekey}>
          <Bridge onChange={onChange} />
        </HCaptchaProvider>
      )}
    </CaptchaContext.Provider>
  );
}

/** null where no site key is configured (local and CI runs). */
export function useCaptcha(): Captcha | null {
  return useContext(CaptchaContext);
}
