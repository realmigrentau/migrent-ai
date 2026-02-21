import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { getAllArticles, getArticlesByCategory, searchArticles, type KBArticle } from "../data/supportKB";

type Category = "All" | "Booking" | "Account" | "Safety" | "Payments" | "Legal";

const categoryIcons: Record<Category, string> = {
  All: "M4 6h16M4 12h16M4 18h16",
  Booking: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  Account: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  Safety: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  Payments: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  Legal: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
};

const categoryColors: Record<Category, string> = {
  All: "text-slate-500 bg-slate-50 dark:bg-slate-500/10",
  Booking: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
  Account: "text-green-500 bg-green-50 dark:bg-green-500/10",
  Safety: "text-red-500 bg-red-50 dark:bg-red-500/10",
  Payments: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
  Legal: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
};

interface ChatMessage {
  from: "user" | "bot";
  text: string;
}

function FAQItem({ article }: { article: KBArticle }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white">{article.question}</span>
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800 pt-3">
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{article.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Support() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "bot", text: "Hi! I'm MigRent's support assistant. How can I help you today? You can ask about bookings, your account, safety, payments, or legal questions." },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const articles = searchQuery
    ? searchArticles(searchQuery)
    : activeCategory === "All"
    ? getAllArticles()
    : getArticlesByCategory(activeCategory);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);

    // Simple keyword-based matching
    setTimeout(() => {
      const results = searchArticles(userMsg);
      let botResponse: string;
      if (results.length > 0) {
        botResponse = results[0].answer;
        if (results.length > 1) {
          botResponse += `\n\nI also found ${results.length - 1} more related topic${results.length > 2 ? "s" : ""}. You can browse the Knowledge Base below for more details.`;
        }
      } else {
        botResponse = "I couldn't find a specific answer to that question. Here are some things you can try:\n\n- Browse the Knowledge Base categories below\n- Rephrase your question with keywords like 'bond', 'booking', 'refund', or 'visa'\n- Contact our human support team at support@migrent.ai";
      }
      setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
    }, 600);
  };

  return (
    <>
      <Head>
        <title>24/7 Support | MigRent AI</title>
        <meta name="description" content="Get help with MigRent AI — browse our knowledge base or chat with our support assistant." />
      </Head>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero */}
        <section className="relative text-center py-16 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/12 dark:bg-cyan-500/6 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-xs font-medium text-cyan-600 dark:text-cyan-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Online 24/7
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
                How can we help?
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Chat with our AI assistant or browse the knowledge base. Our human support team is also available around the clock.
            </p>
          </motion.div>
        </section>

        {/* Chat Widget */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card rounded-2xl overflow-hidden max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">MigRent Support</div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  <span className="text-white/70 text-xs">Online</span>
                </div>
              </div>
              <div className="ml-auto flex gap-1">
                {["English", "中文", "हिन्दी"].map((lang) => (
                  <span key={lang} className="text-[9px] text-white/50 bg-white/10 px-2 py-0.5 rounded">{lang}</span>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                    msg.from === "user"
                      ? "bg-cyan-500 text-white rounded-br-md"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-md border border-slate-200 dark:border-slate-700"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your question..."
                className="input-field flex-1 rounded-xl text-sm"
              />
              <button
                onClick={handleSend}
                className="btn-primary px-4 py-2 rounded-xl text-sm shrink-0"
              >
                Send
              </button>
            </div>
          </motion.div>
        </section>

        {/* Knowledge Base */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-8">Knowledge Base</h2>

            {/* Search */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory("All"); }}
                  placeholder="Search knowledge base..."
                  className="input-field w-full rounded-xl text-sm pl-10"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {(Object.keys(categoryIcons) as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                    activeCategory === cat && !searchQuery
                      ? "bg-cyan-500 text-white border-cyan-500"
                      : "bg-white dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcons[cat]} />
                  </svg>
                  {cat === "All" ? "All Topics" : cat}
                </button>
              ))}
            </div>

            {/* Articles */}
            <div className="max-w-3xl mx-auto space-y-2">
              {articles.map((article) => (
                <FAQItem key={article.id} article={article} />
              ))}
              {articles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400 dark:text-slate-500">No articles found. Try a different search term.</p>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Contact CTA */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 p-[1px]"
          >
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Still need help?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Our human support team is available 24/7 via email at <span className="font-medium text-cyan-500">support@migrent.ai</span>
                </p>
              </div>
              <a href="mailto:support@migrent.ai">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block btn-primary text-sm px-6 py-3 rounded-xl whitespace-nowrap"
                >
                  Email Support
                </motion.span>
              </a>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
