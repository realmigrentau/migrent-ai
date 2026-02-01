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

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Terms of <span className="gradient-text">Use</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Last updated: January 2026</p>
      </motion.div>

      <CollapsibleSection title="About MigRent" defaultOpen>
        <p>
          MigRent is an online matching platform that connects room owners and
          accommodation seekers for short- to medium-term rooms in Sydney and
          Adelaide.
        </p>
        <p>
          MigRent is not a real estate agent, landlord, tenant, or legal
          representative of any user.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Accounts and use">
        <ul className="list-disc list-inside space-y-2">
          <li>Users must provide accurate information when registering.</li>
          <li>
            Users are responsible for their actions on the platform, including
            the accuracy of any listings or profile information.
          </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Platform fees">
        <ul className="list-disc list-inside space-y-2">
          <li>
            Owners agree to pay a one-time AUD 99 platform fee to MigRent when
            a successful match is made via the platform.
          </li>
          <li>
            Seekers may be presented with an optional one-time AUD 19 platform
            fee when they successfully secure accommodation via the platform;
            this will always be disclosed clearly at checkout.
          </li>
          <li>
            Users must not use MigRent to locate or contact another user and
            then intentionally complete the arrangement entirely outside the
            platform in order to avoid paying MigRent&apos;s platform fee. If
            MigRent reasonably suspects circumvention, it may restrict,
            suspend, or terminate access to the service.
          </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="No guarantees">
        <ul className="list-disc list-inside space-y-2">
          <li>
            MigRent does not verify or guarantee properties, users, or any
            outcomes.
          </li>
          <li>
            All agreements and ongoing rent payments are between owners and
            seekers.
          </li>
          <li>
            Any verification badges, reputation signals, or platform-managed
            protections only apply to deals that are properly confirmed and
            recorded through MigRent&apos;s workflows.
          </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Suspension and termination">
        <p>
          MigRent may suspend or terminate accounts for rule breaches,
          suspected fraud, or attempts to circumvent fees.
        </p>
      </CollapsibleSection>

      {/* Business details */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-medium text-slate-600 dark:text-slate-300">MigRent AI</p>
        <p>ABN: 22 669 566 941</p>
        <p>Sole Trader | migrentau@gmail.com</p>
        <p>Virtual business</p>
      </div>
    </div>
  );
}
