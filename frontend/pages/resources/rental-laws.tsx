import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Breadcrumb from "../../components/content/Breadcrumb";
import { getAllStates } from "../../data/rentalLaws";

export default function RentalLaws() {
  const states = getAllStates();
  const [activeState, setActiveState] = useState(states[0].code);
  const state = states.find((s) => s.code === activeState) || states[0];

  return (
    <>
      <Head>
        <title>Australian Rental Laws for Migrants | MigRent AI</title>
        <meta name="description" content="Know your rights as a migrant renter in Australia. State-by-state tenancy laws, bond rules, and dispute processes." />
      </Head>

      <div className="max-w-5xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Resources", href: "/resources" },
            { label: "Australian Rental Laws" },
          ]}
        />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)]0/10 border border-[var(--color-primary-100)] dark:border-[var(--color-primary)]/20 text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)] mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary-50)]0 animate-pulse" />
            Legal Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--color-ink)]">
            Australian <span className="text-[color:var(--color-primary)]">Rental Laws</span> for Migrants
          </h1>
          <p className="mt-3 text-[var(--color-ink-3)] max-w-xl mx-auto">
            Know your rights as a renter in Australia. Tenancy laws, bond rules, and dispute processes by state.
          </p>
        </motion.div>

        {/* Important notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[var(--color-line-2)] dark:border-[var(--color-warn-500)]/20 bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/5 p-4 mb-8"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[var(--color-warn-500)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]">Disclaimer</p>
              <p className="text-xs text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]/70 mt-1">
                This information is for general guidance only and does not constitute legal advice. Laws may have changed since this guide was last updated. Always consult your state&apos;s fair trading or tenancy authority for the most current information.
              </p>
            </div>
          </div>
        </motion.div>

        {/* State selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {states.map((s) => (
            <button
              key={s.code}
              onClick={() => setActiveState(s.code)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                activeState === s.code
                  ? "bg-[var(--color-primary-50)]0 text-white border-[var(--color-primary)]"
                  : "bg-white dark:bg-white/5 border-[var(--color-line)] text-[var(--color-ink-2)] hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-line-2)]"
              }`}
            >
              {s.code}
            </button>
          ))}
        </div>

        {/* State content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeState}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black text-[var(--color-ink)]">{state.name}</h2>

            {/* Bond Rules */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)]0/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Bond Rules</h3>
              </div>
              <ul className="space-y-2">
                {state.bondRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-ink-2)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)]0/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tenant Rights */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-50)] dark:bg-[var(--color-accent-50)]0/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Tenant Rights</h3>
              </div>
              <ul className="space-y-2">
                {state.tenantRights.map((right, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-ink-2)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--color-accent-50)] dark:bg-[var(--color-accent-50)]0/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {right}
                  </li>
                ))}
              </ul>
            </div>

            {/* Dispute Process */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary-soft)]0/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Dispute Process</h3>
              </div>
              <div className="space-y-3">
                {state.disputeProcess.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-[var(--color-ink-2)]">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Migrant-Specific Info */}
            <div className="rounded-2xl border border-[var(--color-primary-100)] dark:border-[var(--color-line)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-[var(--color-primary-700)] dark:text-[var(--color-primary)]">Important for Migrants</h3>
              </div>
              <ul className="space-y-2">
                {state.migrantInfo.map((info, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-primary-700)] dark:text-[var(--color-primary)]/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0 mt-1.5" />
                    {info}
                  </li>
                ))}
              </ul>
            </div>

            {/* Useful links */}
            <div className="card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-3">Useful Contacts</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-ink-3)]">Emergency:</span>
                  <span className="font-medium text-[var(--color-ink)]">{state.emergencyContact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-ink-3)]">Fair Trading:</span>
                  <span className="font-mono text-sm text-[var(--color-primary)] break-all">{state.fairTradingUrl}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
