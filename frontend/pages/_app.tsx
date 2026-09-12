import { useEffect } from "react";
import type { AppProps } from "next/app";
import { AnimatePresence, motion } from "framer-motion";
import { HCaptchaProvider } from "@hcaptcha/react-hcaptcha/hooks";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Layout from "../components/Layout";
import SEOHead from "../components/SEOHead";
import { ToastProvider } from "../components/ui/Toast";
import { ConfirmProvider } from "../components/ui/ConfirmDialog";
import { HCAPTCHA_SITE_KEY } from "../lib/recaptcha";
import { getPageMeta } from "../lib/pageMeta";
import { fontClassName, fontRootCss } from "../lib/fonts";
import "../lib/i18n";
import "../styles/globals.css";

const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "/admin";

export default function App({ Component, pageProps, router }: AppProps) {
  // Register service worker for PWA + push notifications
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch((err) => {
        console.warn("Service worker registration failed:", err);
      });
    }
  }, []);

  const isAdmin = router.pathname.startsWith(ADMIN_PATH);
  const isDashboard = router.pathname.startsWith("/dashboard");

  const inner = isAdmin || isDashboard ? (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  ) : (
    <Layout>
      {/* initial={false} is load-bearing, not a tidy-up.
          Framer renders whileInView/animate subtrees in their *resolved*
          state during SSR (so the page is readable without JS) but applies
          `initial` on the client. With AnimatePresence animating on first
          mount, React 19 sees style="opacity:1" from the server against
          opacity:0 from the client, reports a mismatch it "won't patch up",
          and the subtree is left sitting at the initial state - which is why
          the pricing, features and owner pages rendered blank below the
          navbar until you resized the window. Suppressing the first-mount
          animation makes server and client agree; route-change transitions
          still run. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={router.route}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );

  const meta = getPageMeta(router.pathname);

  const wrapped = (
    <ToastProvider>
      <ConfirmProvider>
        <SEOHead title={meta.title} description={meta.description} noIndex={meta.noIndex} />
        {/* Self-hosted font variables (lib/fonts.ts). The style tag is
            allowed by style-src 'unsafe-inline'; it carries no user data. */}
        <style dangerouslySetInnerHTML={{ __html: fontRootCss }} />
        <div className={fontClassName}>{inner}</div>
        {/* Vercel-hosted scripts only exist on Vercel; skip them elsewhere
            so local and CI runs do not log 404s. */}
        {process.env.NEXT_PUBLIC_VERCEL_ENV ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </ConfirmProvider>
    </ToastProvider>
  );

  // The captcha provider is only mounted on the pages that call it, so the
  // hCaptcha script is not downloaded on the homepage, search or listings.
  const needsCaptcha = ["/signin", "/signup", "/magic-link-login", "/magic-link-signup"].some((p) => router.pathname.startsWith(p));
  if (!HCAPTCHA_SITE_KEY || !needsCaptcha) {
    return wrapped;
  }

  return (
    <HCaptchaProvider sitekey={HCAPTCHA_SITE_KEY}>
      {wrapped}
    </HCaptchaProvider>
  );
}
