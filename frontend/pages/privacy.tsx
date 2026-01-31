import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 text-xl shrink-0 ml-4"
        >
          &#x25BE;
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Privacy <span className="gradient-text">Policy</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Last updated: January 2026</p>
      </motion.div>

      <CollapsibleSection title="What data we collect" defaultOpen>
        <ul className="list-disc list-inside space-y-2">
          <li>Account details (email, name if provided)</li>
          <li>Listing information</li>
          <li>Usage analytics</li>
          <li>Verification status or related metadata</li>
          <li>
            Limited payment metadata via third-party providers (not full card
            details)
          </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="How data is used">
        <ul className="list-disc list-inside space-y-2">
          <li>To operate and improve the platform</li>
          <li>To provide matching services and verification</li>
          <li>To process payments and send important notifications</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Third parties">
        <p>
          Third-party services (e.g. verification providers, payment
          processors, email services) may process data on our behalf as part of
          operating the platform.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Rights and contact">
        <p>
          If you have any questions about this Privacy Policy, please contact
          us at{" "}
          <a href="mailto:stonegold84@gmail.com" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">
            stonegold84@gmail.com
          </a>
          .
        </p>
      </CollapsibleSection>

      {/* Business details */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-medium text-slate-600 dark:text-slate-300">MigRent AI</p>
        <p>ABN: 22 669 566 941</p>
        <p>Sole Trader | stonegold84@gmail.com</p>
        <p>Virtual business</p>
      </div>
    </div>
  );
}
