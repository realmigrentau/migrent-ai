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

export default function Rules() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Platform <span className="gradient-text">Rules</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Guidelines for a safe and fair community</p>
      </motion.div>

      <CollapsibleSection title="Rules for Seekers" defaultOpen>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Be truthful and accurate in your profile and during any
            verification.
          </li>
          <li>
            Respect house rules, neighbours, and applicable tenancy/lodging
            laws.
          </li>
          <li>
            Do not engage in discrimination, harassment, or illegal activity.
          </li>
          <li>
            Understand that MigRent may present an optional one-time platform
            fee for seekers (currently AUD 19) when a successful match occurs.
          </li>
          <li>
            Do not encourage or agree to arrangements where an owner clearly
            intends to use MigRent to find you and then avoid the platform fee
            by moving entirely off-platform; such behaviour may breach our
            Rules and could lead to suspension.
          </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Rules for Owners" defaultOpen>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Provide accurate and up-to-date listing information (location,
            price, photos, conditions).
          </li>
          <li>
            Comply with relevant tenancy or lodging laws and
            anti-discrimination rules.
          </li>
          <li>
            Do not demand unlawful payments (e.g. excessive bond or hidden
            charges).
          </li>
          <li>
            You agree to pay MigRent&apos;s one-time AUD 99 platform fee on each
            successful match made through the platform.
          </li>
          <li>
            You agree not to use MigRent to identify or contact seekers and
            then deliberately move the arrangement off-platform in order to
            avoid paying MigRent&apos;s one-time AUD 99 platform fee. Using
            MigRent in this way is considered circumvention and may result in
            account suspension or termination.
          </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Regulatory compliance" defaultOpen>
        <p>
          Owners are responsible for complying with any local regulations
          that may apply to their listing. For example, short-term rental
          accommodation (STRA) in NSW may require registration with the NSW
          Government. MigRent AI does not provide legal advice and is not
          responsible for users&apos; regulatory compliance.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Enforcement" defaultOpen>
        <p>
          MigRent may suspend or terminate accounts that breach these rules,
          including suspected attempts to circumvent MigRent&apos;s fees or
          processes by taking matches fully off-platform to avoid the owner
          platform fee.
        </p>
      </CollapsibleSection>
    </div>
  );
}
