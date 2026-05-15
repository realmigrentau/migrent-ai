import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Breadcrumb from "../components/content/Breadcrumb";
import CodeBlock from "../components/content/CodeBlock";
import { getAllSections, type ApiEndpoint } from "../data/apiDocsData";
import {
  apiStatus,
  concepts,
  errors,
  webhookEvents,
  changelog,
  quickstartCurl,
  quickstartTokenCurl,
  quickstartNode,
  webhookVerifyNode,
  errorShapeJson,
  paginationJson,
} from "../data/developersData";

const methodColors: Record<string, string> = {
  GET: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/20",
  POST: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200/60 dark:border-green-500/20",
  PUT: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20",
  DELETE: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-500/20",
};

const nav: { id: string; title: string; group: string }[] = [
  { group: "Get started", id: "overview", title: "Overview" },
  { group: "Get started", id: "quickstart", title: "Quickstart" },
  { group: "Get started", id: "environments", title: "Environments" },
  { group: "Core", id: "authentication", title: "Authentication" },
  { group: "Core", id: "concepts", title: "Core concepts" },
  { group: "Core", id: "pagination", title: "Pagination" },
  { group: "Core", id: "errors", title: "Errors" },
  { group: "Core", id: "rate-limits", title: "Rate limits" },
  { group: "Core", id: "idempotency", title: "Idempotency" },
  { group: "Reference", id: "endpoints", title: "Endpoints" },
  { group: "Reference", id: "webhooks", title: "Webhooks" },
  { group: "Reference", id: "data-models", title: "Data models" },
  { group: "More", id: "sdks", title: "SDKs and clients" },
  { group: "More", id: "changelog", title: "Changelog" },
  { group: "More", id: "support", title: "Status & support" },
];

function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card rounded-xl overflow-hidden border border-slate-200/70 dark:border-slate-800/70">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${methodColors[endpoint.method]} shrink-0`}>
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-slate-700 dark:text-slate-300 flex-1 truncate">{endpoint.path}</code>
        {endpoint.auth && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Auth
          </span>
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
              <p className="text-sm text-slate-600 dark:text-slate-400">{endpoint.description}</p>

              {endpoint.params && endpoint.params.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Parameters</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-slate-400">
                          <th className="font-medium py-1.5 pr-3">Name</th>
                          <th className="font-medium py-1.5 pr-3">Type</th>
                          <th className="font-medium py-1.5 pr-3">Required</th>
                          <th className="font-medium py-1.5">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.params.map((p) => (
                          <tr key={p.name} className="border-t border-slate-100 dark:border-slate-800/60">
                            <td className="py-2 pr-3"><code className="font-mono text-rose-500 dark:text-rose-400">{p.name}</code></td>
                            <td className="py-2 pr-3 text-slate-500">{p.type}</td>
                            <td className="py-2 pr-3">
                              {p.required ? (
                                <span className="text-[10px] font-semibold text-red-500">required</span>
                              ) : (
                                <span className="text-[10px] text-slate-400">optional</span>
                              )}
                            </td>
                            <td className="py-2 text-slate-600 dark:text-slate-400">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {endpoint.requestBody && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Request body</h4>
                  <CodeBlock code={endpoint.requestBody} language="json" />
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">200 Response</h4>
                <CodeBlock code={endpoint.responseExample} language="json" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeading({ id, eyebrow, title, lead }: { id: string; eyebrow?: string; title: string; lead?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 mb-2">
          {eyebrow}
        </div>
      )}
      <h2 id={id} className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white scroll-mt-24">
        {title}
      </h2>
      {lead && (
        <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl">{lead}</p>
      )}
    </div>
  );
}

function Callout({ tone = "info", title, children }: { tone?: "info" | "warn" | "note"; title: string; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    info: "bg-blue-50/70 dark:bg-blue-500/5 border-blue-200/70 dark:border-blue-500/20 text-blue-900 dark:text-blue-100",
    warn: "bg-amber-50/70 dark:bg-amber-500/5 border-amber-200/70 dark:border-amber-500/20 text-amber-900 dark:text-amber-100",
    note: "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300",
  };
  return (
    <div className={`rounded-xl border p-4 text-sm ${tones[tone]}`}>
      <div className="font-semibold mb-1">{title}</div>
      <div className="opacity-90">{children}</div>
    </div>
  );
}

export default function Developers() {
  const sections = getAllSections();
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const ids = nav.map((n) => n.id);
    const onScroll = () => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActive(id);
          return;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const grouped = nav.reduce<Record<string, typeof nav>>((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  return (
    <>
      <Head>
        <title>Developer Portal | MigRent AI</title>
        <meta
          name="description"
          content="MigRent developer portal. RESTful API for the Australia-only rental marketplace. Quickstart, authentication, webhooks, errors, rate limits, and full endpoint reference."
        />
      </Head>

      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: "Developers" }]} />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[11px] font-medium text-blue-600 dark:text-blue-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            API {apiStatus.version} - {apiStatus.status}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            MigRent Developer Portal
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
            Build on the MigRent platform. A RESTful, Australia-first API for rental listings, bookings, profile verification,
            and payments. JSON in, JSON out. Designed for predictable integration, not surprise.
          </p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card rounded-xl p-3 border border-slate-200/70 dark:border-slate-800/70">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Production</div>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{apiStatus.baseUrlProd}</code>
            </div>
            <div className="card rounded-xl p-3 border border-slate-200/70 dark:border-slate-800/70">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sandbox</div>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{apiStatus.baseUrlSandbox}</code>
            </div>
            <div className="card rounded-xl p-3 border border-slate-200/70 dark:border-slate-800/70">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Uptime (30d)</div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{apiStatus.uptime}</div>
            </div>
            <div className="card rounded-xl p-3 border border-slate-200/70 dark:border-slate-800/70">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Region</div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{apiStatus.region}</div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-60 shrink-0">
            <nav className="lg:sticky lg:top-24 space-y-5">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-2">
                    {group}
                  </div>
                  <div className="space-y-0.5">
                    {items.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                          active === item.id
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 space-y-16">
            {/* Overview */}
            <section>
              <SectionHeading
                id="overview"
                eyebrow="Get started"
                title="Overview"
                lead="The MigRent API powers an Australia-only rental marketplace for migrants, students, and hosts. Use it to list properties, manage bookings, verify identities, and react to lifecycle events in real time."
              />
              <div className="grid sm:grid-cols-2 gap-3">
                {concepts.map((c) => (
                  <div key={c.title} className="card rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={c.iconPath} />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{c.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{c.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Quickstart */}
            <section>
              <SectionHeading
                id="quickstart"
                eyebrow="Get started"
                title="Quickstart"
                lead="Make your first authenticated request to the MigRent API in under five minutes."
              />
              <ol className="space-y-5">
                {[
                  {
                    title: "Create API credentials",
                    body: (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Sign in and open your developer settings to create a client_id and client_secret. Start in
                        the <span className="font-mono text-rose-500">sandbox</span> environment - sandbox data is isolated and never bills cards.
                      </p>
                    ),
                  },
                  {
                    title: "Exchange credentials for an access token",
                    body: <CodeBlock code={quickstartTokenCurl} language="bash" />,
                  },
                  {
                    title: "Call your first endpoint",
                    body: <CodeBlock code={quickstartCurl} language="bash" />,
                  },
                  {
                    title: "Use the SDK (optional)",
                    body: (
                      <>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          A first-party Node SDK is planned for V2. The example below shows the planned ergonomics.
                        </p>
                        <CodeBlock code={quickstartNode} language="typescript" />
                      </>
                    ),
                  },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                      {step.body}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Environments */}
            <section>
              <SectionHeading
                id="environments"
                eyebrow="Get started"
                title="Environments"
                lead="MigRent provides two isolated environments. Sandbox is for development and testing - it mirrors production behaviour but uses fake payment rails and a separate user database."
              />
              <div className="overflow-x-auto card rounded-xl border border-slate-200/70 dark:border-slate-800/70">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="text-left font-medium px-4 py-3">Environment</th>
                      <th className="text-left font-medium px-4 py-3">Base URL</th>
                      <th className="text-left font-medium px-4 py-3">Payments</th>
                      <th className="text-left font-medium px-4 py-3">Webhooks</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 dark:text-slate-300">
                    <tr className="border-t border-slate-100 dark:border-slate-800/60">
                      <td className="px-4 py-3 font-medium">Sandbox</td>
                      <td className="px-4 py-3 font-mono text-xs">{apiStatus.baseUrlSandbox}</td>
                      <td className="px-4 py-3">Stripe test mode</td>
                      <td className="px-4 py-3">Delivered, signed, retried</td>
                    </tr>
                    <tr className="border-t border-slate-100 dark:border-slate-800/60">
                      <td className="px-4 py-3 font-medium">Production</td>
                      <td className="px-4 py-3 font-mono text-xs">{apiStatus.baseUrlProd}</td>
                      <td className="px-4 py-3">Stripe live</td>
                      <td className="px-4 py-3">Delivered, signed, retried</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Authentication */}
            <section>
              <SectionHeading
                id="authentication"
                eyebrow="Core"
                title="Authentication"
                lead="Two authentication modes: API keys for server-to-server integrations, and OAuth 2.0 for apps acting on behalf of end users. All endpoints except token exchange require authentication."
              />
              <div className="space-y-4">
                <Callout tone="warn" title="Never expose secrets in client-side code">
                  Treat <span className="font-mono">client_secret</span> and webhook signing secrets as you would a database password. Use environment variables and rotate immediately if leaked. The browser is never an acceptable storage location.
                </Callout>
                <div className="space-y-3">
                  {sections.find((s) => s.id === "authentication")?.endpoints.map((e, i) => (
                    <EndpointCard key={i} endpoint={e} />
                  ))}
                </div>
              </div>
            </section>

            {/* Core concepts */}
            <section>
              <SectionHeading
                id="concepts"
                eyebrow="Core"
                title="Core concepts"
                lead="Mental model for the entities you will work with most often."
              />
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: "Listing", body: "A rental property published by a host. Has price, availability, room type, location, photos, house rules." },
                  { name: "Booking", body: "A confirmed or pending agreement between a tenant and a host for a specific listing and date range." },
                  { name: "Profile", body: "A user account. Carries verification flags (email, phone, identity, visa, ABN) and a role (tenant, host, both)." },
                  { name: "Payment", body: "Rent or bond movement, settled through Stripe. Bond is held in trust and released on completion." },
                  { name: "Webhook", body: "An HTTPS endpoint you register to receive signed event payloads when state changes occur." },
                  { name: "Verification", body: "Identity, visa, or ABN check. Verified profiles get search priority and unlock instant-book." },
                ].map((item) => (
                  <div key={item.name} className="card rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">{item.name}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Pagination */}
            <section>
              <SectionHeading
                id="pagination"
                eyebrow="Core"
                title="Pagination"
                lead="List endpoints return paginated results. Both page-based and cursor-based pagination are supported. Cursor-based is recommended for stable iteration over large or changing result sets."
              />
              <CodeBlock code={paginationJson} language="json" />
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <Callout tone="note" title="Page-based">
                  Use <span className="font-mono text-xs">?page=2&per_page=20</span>. Simple, but unstable when results change between requests.
                </Callout>
                <Callout tone="note" title="Cursor-based">
                  Use <span className="font-mono text-xs">?cursor=&lt;next_cursor&gt;</span> from the previous response. Stable across inserts and deletes.
                </Callout>
              </div>
            </section>

            {/* Errors */}
            <section>
              <SectionHeading
                id="errors"
                eyebrow="Core"
                title="Errors"
                lead="MigRent uses standard HTTP status codes and returns a structured error body. Every error includes a request_id - quote it when contacting support."
              />
              <div className="mb-4">
                <CodeBlock code={errorShapeJson} language="json" />
              </div>
              <div className="overflow-x-auto card rounded-xl border border-slate-200/70 dark:border-slate-800/70">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="text-left font-medium px-4 py-3">Status</th>
                      <th className="text-left font-medium px-4 py-3">Code</th>
                      <th className="text-left font-medium px-4 py-3">When it happens</th>
                      <th className="text-left font-medium px-4 py-3">How to fix</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 dark:text-slate-300">
                    {errors.map((e) => (
                      <tr key={e.code} className="border-t border-slate-100 dark:border-slate-800/60 align-top">
                        <td className="px-4 py-3 font-mono font-semibold">{e.code}</td>
                        <td className="px-4 py-3"><code className="text-xs text-rose-500">{e.name}</code></td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.description}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.fix}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Rate limits */}
            <section>
              <SectionHeading
                id="rate-limits"
                eyebrow="Core"
                title="Rate limits"
                lead="Limits are applied per access token, not per IP. When you exceed a limit you receive 429 and a Retry-After header (in seconds)."
              />
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="card rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Default</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">600 <span className="text-sm font-medium text-slate-500">/ min</span></div>
                </div>
                <div className="card rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Search</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">120 <span className="text-sm font-medium text-slate-500">/ min</span></div>
                </div>
                <div className="card rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Token exchange</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">10 <span className="text-sm font-medium text-slate-500">/ min</span></div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Every response includes <span className="font-mono">X-RateLimit-Limit</span>, <span className="font-mono">X-RateLimit-Remaining</span>, and <span className="font-mono">X-RateLimit-Reset</span>. Implement exponential backoff for safer retries.
              </p>
            </section>

            {/* Idempotency */}
            <section>
              <SectionHeading
                id="idempotency"
                eyebrow="Core"
                title="Idempotency"
                lead="Send an Idempotency-Key header on POST and PUT requests to safely retry without creating duplicate resources or charges."
              />
              <CodeBlock
                code={`curl -X POST https://api.migrent.ai/v1/bookings \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Idempotency-Key: 6f9a3c2e-7a91-4d3e-b6c1-3b8f0e9a1d22" \\
  -H "Content-Type: application/json" \\
  -d '{ "listing_id": "lst_a1b2c3d4", "check_in": "2026-03-01", "check_out": "2026-06-01" }'`}
                language="bash"
              />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Keys are valid for 24 hours. Replaying a key returns the original response body and status code - even if the underlying resource has changed since.
              </p>
            </section>

            {/* Endpoints reference */}
            <section>
              <SectionHeading
                id="endpoints"
                eyebrow="Reference"
                title="Endpoints"
                lead="Full endpoint reference. Click any endpoint to expand parameters, request body, and a sample 200 response."
              />
              <div className="space-y-8">
                {sections
                  .filter((s) => s.id !== "authentication" && s.id !== "webhooks")
                  .map((section) => (
                    <div key={section.id}>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 capitalize">{section.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-2xl">{section.description}</p>
                      <div className="space-y-2">
                        {section.endpoints.map((e, i) => (
                          <EndpointCard key={i} endpoint={e} />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Webhooks */}
            <section>
              <SectionHeading
                id="webhooks"
                eyebrow="Reference"
                title="Webhooks"
                lead="Receive signed HTTPS POST callbacks when state changes. Delivery is at-least-once - your handler must be idempotent on event_id."
              />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Available events</h3>
              <div className="grid sm:grid-cols-2 gap-2 mb-6">
                {webhookEvents.map((e) => (
                  <div key={e.name} className="card rounded-lg p-3 border border-slate-200/70 dark:border-slate-800/70 flex items-start gap-3">
                    <code className="text-xs font-mono text-blue-500 shrink-0 mt-0.5">{e.name}</code>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{e.description}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Verifying signatures (Node.js + Express)</h3>
              <CodeBlock code={webhookVerifyNode} language="typescript" />

              <div className="mt-4">
                <Callout tone="warn" title="Always verify the signature">
                  Failing to verify <span className="font-mono">X-MigRent-Signature</span> allows attackers to forge events. Compare HMACs using a constant-time function (e.g. <span className="font-mono">crypto.timingSafeEqual</span> in production).
                </Callout>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-8 mb-3">Webhook endpoints</h3>
              <div className="space-y-2">
                {sections.find((s) => s.id === "webhooks")?.endpoints.map((e, i) => (
                  <EndpointCard key={i} endpoint={e} />
                ))}
              </div>
            </section>

            {/* Data models */}
            <section>
              <SectionHeading
                id="data-models"
                eyebrow="Reference"
                title="Data models"
                lead="Canonical IDs are prefixed strings. All timestamps are ISO 8601 in UTC. All monetary amounts are in AUD cents unless otherwise noted - listing responses use whole-dollar weekly_rent for readability."
              />
              <div className="overflow-x-auto card rounded-xl border border-slate-200/70 dark:border-slate-800/70">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="text-left font-medium px-4 py-3">Resource</th>
                      <th className="text-left font-medium px-4 py-3">ID prefix</th>
                      <th className="text-left font-medium px-4 py-3">Example</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 dark:text-slate-300 font-mono text-xs">
                    {[
                      ["Listing", "lst_", "lst_a1b2c3d4"],
                      ["Booking", "bkg_", "bkg_m1n2o3p4"],
                      ["User / Profile", "usr_", "usr_q5r6s7"],
                      ["Payment", "pay_", "pay_001abc"],
                      ["Verification", "ver_", "ver_t8u9v0w1"],
                      ["Webhook", "whk_", "whk_a2b3c4d5"],
                      ["Request", "req_", "req_01HK9X2A6F3M7Q8RZD5C4N1V0E"],
                    ].map(([name, prefix, ex]) => (
                      <tr key={name} className="border-t border-slate-100 dark:border-slate-800/60">
                        <td className="px-4 py-2 font-sans font-medium">{name}</td>
                        <td className="px-4 py-2 text-rose-500">{prefix}</td>
                        <td className="px-4 py-2">{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SDKs */}
            <section>
              <SectionHeading
                id="sdks"
                eyebrow="More"
                title="SDKs and clients"
                lead="At launch (V1) MigRent ships a published OpenAPI spec. First-party SDKs are planned for V2 - until then, any HTTP client works."
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="card rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">OpenAPI 3.1 spec</span>
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded">V1</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Download <code>openapi.yaml</code> and generate a client in your language of choice via OpenAPI Generator or similar.
                  </p>
                </div>
                {[
                  { name: "Node / TypeScript SDK", status: "Planned V2" },
                  { name: "Python SDK", status: "Planned V2" },
                  { name: "Postman collection", status: "Planned V1.1" },
                ].map((s) => (
                  <div key={s.name} className="card rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</span>
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded">{s.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Coming soon. Track progress in the changelog below.</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Changelog */}
            <section>
              <SectionHeading
                id="changelog"
                eyebrow="More"
                title="Changelog"
                lead="Backwards-incompatible changes are released under a new major version. Additive changes within a major are non-breaking."
              />
              <div className="space-y-4">
                {changelog.map((entry) => (
                  <div key={entry.version} className="card rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{entry.version}</span>
                      <span className="text-xs text-slate-400">{entry.date}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                        entry.status === "stable"
                          ? "text-green-600 bg-green-50 dark:bg-green-500/10"
                          : entry.status === "beta"
                          ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10"
                          : "text-red-600 bg-red-50 dark:bg-red-500/10"
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                      {entry.changes.map((c, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-slate-400">-</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Support */}
            <section>
              <SectionHeading
                id="support"
                eyebrow="More"
                title="Status & support"
                lead="Where to look when something is not behaving as documented."
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <a href="/contact" className="card rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70 hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Contact developer support</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quote the <span className="font-mono">request_id</span> from the error body and the time (UTC) of the request.</p>
                </a>
                <a href="/resources/discord" className="card rounded-xl p-4 border border-slate-200/70 dark:border-slate-800/70 hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Developer Discord</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Talk to the team and other integrators.</p>
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
