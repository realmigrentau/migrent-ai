import { useEffect } from "react";
import type { AppProps } from "next/app";
import { AnimatePresence, motion } from "framer-motion";
import { HCaptchaProvider } from "@hcaptcha/react-hcaptcha/hooks";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Layout from "../components/Layout";
import SEOHead from "../components/SEOHead";
import ShortcutProvider from "../components/shortcuts/ShortcutProvider";
import { HCAPTCHA_SITE_KEY } from "../lib/recaptcha";
import "../lib/i18n";
import "../styles/globals.css";

const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "/mazda.asgt22779412.sara-admin";

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

  const wrapped = (
    <>
      <SEOHead />
      {inner}
      <ShortcutProvider />
      <SpeedInsights />
    </>
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
