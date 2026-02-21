import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Breadcrumb from "../../components/content/Breadcrumb";
import CodeBlock from "../../components/content/CodeBlock";
import { getAllSections, type ApiEndpoint } from "../../data/apiDocsData";

const methodColors: Record<string, string> = {
  GET: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  POST: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
  PUT: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  DELETE: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
};

function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${methodColors[endpoint.method]} shrink-0`}>
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-slate-700 dark:text-slate-300 flex-1">{endpoint.path}</code>
        {endpoint.auth && (
          <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
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
            <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{endpoint.description}</p>

              {endpoint.params && endpoint.params.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Parameters</h4>
                  <div className="space-y-1">
                    {endpoint.params.map((p) => (
                      <div key={p.name} className="flex items-start gap-2 text-xs">
                        <code className="font-mono text-rose-500 dark:text-rose-400 shrink-0">{p.name}</code>
                        <span className="text-slate-400">{p.type}</span>
                        {p.required && <span className="text-[9px] font-bold text-red-400 bg-red-50 dark:bg-red-500/10 px-1.5 rounded">required</span>}
                        <span className="text-slate-500 dark:text-slate-400">{p.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {endpoint.requestBody && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Request Body</h4>
                  <CodeBlock code={endpoint.requestBody} language="json" />
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Response</h4>
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-xs font-medium text-blue-600 dark:text-blue-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            API v2
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Developer</span> API Docs
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Build on the MigRent platform with our RESTful API. OAuth 2.0 authentication, JSON responses, and real-time webhooks.
          </p>
        </motion.div>

        {/* Base URL */}
        <div className="card rounded-xl p-4 mb-8 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">Base URL</span>
          <code className="text-sm font-mono text-blue-500 dark:text-blue-400">https://api.migrent.ai/v2</code>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar nav */}
          <div className="lg:w-56 shrink-0">
            <nav className="sticky top-24 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Sections
              </div>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                    activeSection === section.id
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{section.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{section.description}</p>
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
