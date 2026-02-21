import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { createTicket, getHelpArticles, type HelpArticle } from "../../lib/api";

type Tab = "search" | "contact";

export default function SupportWidget() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("search");

  // Search state
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [searching, setSearching] = useState(false);

  // Contact form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("feedback");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced article search
  useEffect(() => {
    if (!query.trim()) {
      setArticles([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await getHelpArticles({ query: query.trim() });
      setArticles(res?.articles || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const token = session?.access_token;
    const res = await createTicket(
      {
        subject,
        message,
        category,
        source: "in_app",
        ...(token ? {} : { email, name }),
      },
      token
    );

    if (res?.ticket_id) {
      setTicketId(res.ticket_id.slice(0, 8));
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  function resetForm() {
    setSubject("");
    setMessage("");
    setCategory("feedback");
    setEmail("");
    setName("");
    setSubmitted(false);
    setTicketId("");
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Support"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-h-[32rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-5 py-4">
              <h3 className="font-bold text-lg">MigRent Support</h3>
              <p className="text-rose-100 text-sm">How can we help?</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              {(["search", "contact"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); resetForm(); }}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    tab === t
                      ? "text-rose-600 border-b-2 border-rose-500"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {t === "search" ? "Search Help" : "Contact Support"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {tab === "search" ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search help articles..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />

                  {searching && (
                    <p className="text-xs text-slate-400 text-center py-2">Searching...</p>
                  )}

                  {articles.length > 0 ? (
                    articles.map((a) => (
                      <a
                        key={a.id}
                        href={`/help/${a.slug}`}
                        className="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-colors"
                      >
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{a.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">{a.audience}</p>
                      </a>
                    ))
                  ) : query && !searching ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-500">No articles found</p>
                      <button
                        onClick={() => setTab("contact")}
                        className="mt-2 text-sm text-rose-500 hover:text-rose-600 font-medium"
                      >
                        Contact support instead
                      </button>
                    </div>
                  ) : !query ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-400">Type to search our help articles</p>
                      <a
                        href="/help"
                        className="inline-block mt-2 text-sm text-rose-500 hover:text-rose-600 font-medium"
                      >
                        Browse all articles
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : submitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Request submitted!</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Ticket ID: <span className="font-mono font-medium">{ticketId}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">We'll get back to you within 24 hours.</p>
                  {session && (
                    <a
                      href="/support/tickets"
                      className="inline-block mt-3 text-sm text-rose-500 hover:text-rose-600 font-medium"
                    >
                      View your tickets
                    </a>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Guest fields */}
                  {!session && (
                    <>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </>
                  )}

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="feedback">General Feedback</option>
                    <option value="billing">Billing / Payments</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="verification">Verification</option>
                    <option value="listings">Listings</option>
                    <option value="trust_safety">Trust & Safety</option>
                    <option value="bug">Bug Report</option>
                  </select>

                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    required
                    minLength={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue..."
                    required
                    minLength={10}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
