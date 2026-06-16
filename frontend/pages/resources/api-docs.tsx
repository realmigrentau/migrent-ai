import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Breadcrumb from "../../components/content/Breadcrumb";
import CodeBlock from "../../components/content/CodeBlock";
import { getAllSections, type ApiEndpoint } from "../../data/apiDocsData";

const methodColors: Record<string, string> = {
  GET: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)]",
  POST: "bg-[var(--color-accent-50)] dark:bg-[var(--color-accent-50)]0/10 text-[var(--color-accent)] dark:text-[var(--color-accent)]",
  PUT: "bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-50)]0/10 text-[var(--color-warn-600)] dark:text-[var(--color-warn-500)]",
  DELETE: "bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-50)]0/10 text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]",
};

function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--color-surface)] dark:hover:bg-white/5 transition-colors"
      >
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${methodColors[endpoint.method]} shrink-0`}>
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-[var(--color-ink-2)] flex-1">{endpoint.path}</code>
        {endpoint.auth && (
          <svg className="w-4 h-4 text-[var(--color-warn-500)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
        <svg
          className={`w-4 h-4 text-[var(--color-ink-3)] shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-[var(--color-line)] pt-4">
              <p className="text-sm text-[var(--color-ink-3)]">{endpoint.description}</p>

              {endpoint.params && endpoint.params.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-ink-2)] uppercase tracking-wider mb-2">Parameters</h4>
                  <div className="space-y-1">
                    {endpoint.params.map((p) => (
                      <div key={p.name} className="flex items-start gap-2 text-xs">
                        <code className="font-mono text-[var(--color-primary)] dark:text-[var(--color-primary)] shrink-0">{p.name}</code>
                        <span className="text-[var(--color-ink-3)]">{p.type}</span>
                        {p.required && <span className="text-[9px] font-bold text-[var(--color-danger-500)] bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-50)]0/10 px-1.5 rounded">required</span>}
                        <span className="text-[var(--color-ink-3)]">{p.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {endpoint.requestBody && (
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-ink-2)] uppercase tracking-wider mb-2">Request Body</h4>
                  <CodeBlock code={endpoint.requestBody} language="json" />
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-[var(--color-ink-2)] uppercase tracking-wider mb-2">Response</h4>
                <CodeBlock code={endpoint.responseExample} language="json" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApiDocs() {
  const sections = getAllSections();
  const [activeSection, setActiveSection] = useState(sections[0].id);

  return (
    <>
      <Head>
        <title>Developer API Docs | MigRent AI</title>
        <meta name="description" content="Build integrations on the MigRent platform with our RESTful developer API." />
      </Head>

      <div className="max-w-6xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Resources", href: "/resources" },
            { label: "API Docs" },
          ]}
        />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-100)] dark:border-[var(--color-line)] text-xs font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)] mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            API v2
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--color-ink)]">
            <span className="bg-[var(--color-primary)] from-[var(--color-primary)] to-[var(--color-primary)] bg-clip-text text-transparent">Developer</span> API Docs
          </h1>
          <p className="mt-3 text-[var(--color-ink-3)] max-w-xl mx-auto">
            Build on the MigRent platform with our RESTful API. OAuth 2.0 authentication, JSON responses, and real-time webhooks.
          </p>
        </motion.div>

        {/* Base URL */}
        <div className="card rounded-xl p-4 mb-8 flex items-center gap-3">
          <span className="text-xs font-semibold text-[var(--color-ink-3)] uppercase tracking-wider shrink-0">Base URL</span>
          <code className="text-sm font-mono text-[var(--color-primary)] dark:text-[var(--color-primary)]">https://api.migrent.ai/v2</code>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar nav */}
          <div className="lg:w-56 shrink-0">
            <nav className="sticky top-24 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-3)] mb-3">
                Sections
              </div>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                    activeSection === section.id
                      ? "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-primary)] font-medium"
                      : "text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] dark:hover:text-[var(--color-ink-4)] hover:bg-[var(--color-surface)] dark:hover:bg-white/5"
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-12">
            {sections.map((section) => (
              <motion.section
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">{section.title}</h2>
                <p className="text-sm text-[var(--color-ink-3)] mb-6">{section.description}</p>
                <div className="space-y-3">
                  {section.endpoints.map((endpoint, i) => (
                    <EndpointCard key={i} endpoint={endpoint} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
