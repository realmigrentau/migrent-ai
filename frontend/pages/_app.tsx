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
      <AnimatePresence mode="wait">
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
        {inner}
        <Analytics />
        <SpeedInsights />
      </ConfirmProvider>
    </ToastProvider>
  );

  if (!HCAPTCHA_SITE_KEY) {
    return wrapped;
  }

  return (
    <HCaptchaProvider sitekey={HCAPTCHA_SITE_KEY}>
      {wrapped}
    </HCaptchaProvider>
  );
}
