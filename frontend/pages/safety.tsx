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

export default function Safety() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Safety &amp; <span className="gradient-text">Verification</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Your safety is our priority</p>
      </motion.div>

      <CollapsibleSection title="About verification" defaultOpen>
        <p>
          MigRent may use third-party services to assist with ID or visa
          verification. Verification and match scores are tools to help users
          make informed decisions but do not guarantee safety or legality.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Safety tips for Seekers" defaultOpen>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Inspect properties (in person or via video call) before paying any
            money.
          </li>
          <li>
            Use written agreements or clear messages confirming what is agreed.
          </li>
          <li>
            Ask questions about bills, bond, notice periods, and any other
            conditions.
          </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Safety tips for Owners" defaultOpen>
        <ul className="list-disc list-inside space-y-2">
          <li>Arrange to meet seekers in a safe environment.</li>
          <li>Consider asking for references if appropriate.</li>
          <li>Keep written records of arrangements.</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Reporting" defaultOpen>
        <p>
          If you encounter an unsafe, misleading, or suspicious listing or
          profile, please report it using the Report button on the listing or
          profile page, or contact us at{" "}
          <a href="mailto:stonegold84@gmail.com" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">
            stonegold84@gmail.com
          </a>
          . We take all reports seriously and will investigate promptly.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Regulatory compliance">
        <p>
          MigRent AI is not responsible for users&apos; regulatory
          compliance. Hosts should ensure they comply with any applicable
          local regulations (e.g. STRA registration in NSW if relevant).
        </p>
      </CollapsibleSection>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card-subtle p-6 rounded-2xl border-l-2 border-l-amber-500"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          MigRent does not guarantee the safety, suitability, or legality of
          any person or property.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Users must make their own independent checks and decisions.
        </p>
      </motion.div>
    </div>
  );
}
