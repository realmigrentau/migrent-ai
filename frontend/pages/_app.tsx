import type { AppProps } from "next/app";
import { AnimatePresence, motion } from "framer-motion";
import { HCaptchaProvider } from "@hcaptcha/react-hcaptcha/hooks";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Layout from "../components/Layout";
import SEOHead from "../components/SEOHead";
import { HCAPTCHA_SITE_KEY } from "../lib/recaptcha";
import "../styles/globals.css";

export default function App({ Component, pageProps, router }: AppProps) {
  const isAdmin = router.pathname.startsWith("/mazda.asgt22779412.sara-admin");

  const inner = isAdmin ? (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  ) : (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
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
      <Analytics />
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
