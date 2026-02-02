import type { AppProps } from "next/app";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "../components/Layout";
import "../styles/globals.css";

export default function App({ Component, pageProps, router }: AppProps) {
  const isAdmin = router.pathname.startsWith("/admin");

  // Admin pages use their own AdminLayout with sidebar — skip the main Layout wrapper
  if (isAdmin) {
    return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    );
  }

  return (
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
}
