import type { AppProps } from "next/app";
import { AnimatePresence, motion } from "framer-motion";
import { HCaptchaProvider } from "@hcaptcha/react-hcaptcha/hooks";
import Layout from "../components/Layout";
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

  if (!HCAPTCHA_SITE_KEY) {
    return inner;
  }

  return (
    <HCaptchaProvider sitekey={HCAPTCHA_SITE_KEY}>
      {inner}
    </HCaptchaProvider>
  );
}
