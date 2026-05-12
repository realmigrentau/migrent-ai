import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { createTicket } from "../../lib/api";
import { searchArticlesScored, type KBArticle, type ScoredArticle } from "../../data/supportKB";

type Tab = "chat" | "contact";

// ─────────────────────────────────────────────────────────────
// Trigger detection - lightweight, deterministic, no LLM.
// These let us show safety / legal cards BEFORE the answer so
// users never get a confident-sounding response on serious topics.
// ─────────────────────────────────────────────────────────────
const SAFETY_TRIGGERS = [
  "unsafe", "danger", "dangerous", "scam", "scammed", "fraud", "fraudulent",
  "harass", "harassed", "threat", "threatened", "stalk", "stalked",
  "assault", "abuse", "abusive", "discriminat", "report user", "fake listing",
];
const LEGAL_TRIGGERS = [
  "lease", "tenancy law", "tenant rights", "eviction", "evict", "evicted",
  "rcat", "vcat", "ncat", "qcat", "tribunal", "legal advice",
  "sue", "court", "lawyer", "solicitor", "fair trading",
];
const EMERGENCY_TRIGGERS = ["emergency", "right now", "tonight", "police"];
const HUMAN_TRIGGERS = ["human", "agent", "talk to person", "real person", "speak to someone"];

type ChatRole = "user" | "assistant" | "system";

interface BaseMessage {
  id: string;
  role: ChatRole;
}
interface UserMessage extends BaseMessage {
  role: "user";
  text: string;
}
interface AssistantMessage extends BaseMessage {
  role: "assistant";
  text: string;
  results: ScoredArticle[];
  confidence: "high" | "medium" | "low" | "none";
  safety?: boolean;
  legal?: boolean;
  emergency?: boolean;
  query: string;
}
interface SystemMessage extends BaseMessage {
  role: "system";
  kind: "welcome" | "escalation" | "human-handoff";
}
type ChatMessage = UserMessage | AssistantMessage | SystemMessage;

// ─────────────────────────────────────────────────────────────
// Suggested prompts shown in the empty state.
// Keep these to questions the KB can confidently answer.
// ─────────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  "How do I verify my ID?",
  "How does the bond work?",
  "Send a booking request",
  "Report an unsafe listing",
  "Cancel a booking",
  "Become a Superhost",
];

function newId() {
  return Math.random().toString(36).slice(2);
}

function detectTriggers(query: string) {
  const q = query.toLowerCase();
  return {
    safety: SAFETY_TRIGGERS.some((t) => q.includes(t)),
    legal: LEGAL_TRIGGERS.some((t) => q.includes(t)),
    emergency: EMERGENCY_TRIGGERS.some((t) => q.includes(t)),
    human: HUMAN_TRIGGERS.some((t) => q.includes(t)),
  };
}

function confidenceBand(top: ScoredArticle | undefined): AssistantMessage["confidence"] {
  if (!top) return "none";
  if (top.confidence >= 0.7) return "high";
  if (top.confidence >= 0.35) return "medium";
  return "low";
}

// ─────────────────────────────────────────────────────────────
// MAIN WIDGET
// ─────────────────────────────────────────────────────────────
export default function SupportWidget() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("chat");

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: newId(), role: "system", kind: "welcome" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unhelpfulStreak, setUnhelpfulStreak] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Contact form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("feedback");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function handleSuggested(prompt: string) {
    setChatInput(prompt);
    setTimeout(() => sendQuery(prompt), 30);
  }

  function sendQuery(rawInput: string) {
    const userMsg = rawInput.trim();
    if (!userMsg) return;
    setChatInput("");
    setMessages((prev) => [...prev, { id: newId(), role: "user", text: userMsg }]);
    setTyping(true);

    const triggers = detectTriggers(userMsg);

    // Explicit "talk to a human" - skip retrieval, hand off cleanly.
    if (triggers.human) {
      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "system", kind: "human-handoff" },
        ]);
        setTyping(false);
      }, 400);
      return;
    }

    window.setTimeout(() => {
      const results = searchArticlesScored(userMsg, 4);
      const confidence = confidenceBand(results[0]);
      const text =
        confidence === "none"
          ? "I couldn't find a confident match in our Help Center for that question."
          : results[0].article.answer;

      const next: AssistantMessage = {
        id: newId(),
        role: "assistant",
        text,
        results,
        confidence,
        safety: triggers.safety,
        legal: triggers.legal,
        emergency: triggers.emergency,
        query: userMsg,
      };

      setMessages((prev) => [...prev, next]);

      const lowQuality = confidence === "none" || confidence === "low";
      const nextStreak = lowQuality ? unhelpfulStreak + 1 : 0;
      setUnhelpfulStreak(nextStreak);
      if (nextStreak >= 2) {
        setMessages((prev) => [...prev, { id: newId(), role: "system", kind: "escalation" }]);
        setUnhelpfulStreak(0);
      }
      setTyping(false);
    }, 450);
  }

  function handleFeedback(msgId: string, helpful: boolean) {
    if (!helpful) {
      setUnhelpfulStreak((s) => s + 1);
      setMessages((prev) => {
        const updated = [...prev];
        if (unhelpfulStreak + 1 >= 1) {
          // One explicit thumbs-down is enough to offer escalation.
          if (!prev.some((m) => m.role === "system" && (m as SystemMessage).kind === "escalation")) {
            updated.push({ id: newId(), role: "system", kind: "escalation" });
          }
        }
        return updated;
      });
    }
    // Mark the message so feedback buttons disappear.
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? ({ ...m, _feedback: helpful } as ChatMessage & { _feedback: boolean }) : m))
    );
  }

  function switchToContact(prefillSubject?: string, presetCategory?: string) {
    if (prefillSubject) setSubject(prefillSubject);
    if (presetCategory) setCategory(presetCategory);
    setTab("contact");
  }

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

  const showEmptyState = useMemo(
    () => messages.length === 1 && messages[0].role === "system",
    [messages]
  );

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="MigRent Support"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[28rem] max-w-[calc(100vw-2rem)] h-[40rem] max-h-[calc(100vh-7rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-rose-500 text-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base">MigRent Help</h3>
                  <p className="text-rose-100 text-[11px] leading-tight">
                    Grounded in our Help Center. Not legal advice.
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              {([
                { key: "chat" as Tab, label: "Ask the assistant" },
                { key: "contact" as Tab, label: "Talk to a human" },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    if (t.key === "contact") resetForm();
                  }}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    tab === t.key
                      ? "text-rose-600 border-b-2 border-rose-500"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "chat" ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <MessageRow
                      key={msg.id}
                      msg={msg}
                      onFeedback={handleFeedback}
                      onSuggested={handleSuggested}
                      onEscalate={switchToContact}
                    />
                  ))}

                  {showEmptyState && (
                    <SuggestedPromptChips prompts={SUGGESTED_PROMPTS} onPick={handleSuggested} />
                  )}

                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendQuery(chatInput)}
                      placeholder="Ask about bookings, verification, safety..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      onClick={() => sendQuery(chatInput)}
                      disabled={!chatInput.trim()}
                      className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-xl text-sm font-medium transition-colors shrink-0"
                      aria-label="Send"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                    Answers come from MigRent's Help Center. For urgent or personal matters, switch to "Talk to a human".
                  </p>
                </div>
              </div>
            ) : (
              <ContactForm
                session={session}
                submitted={submitted}
                ticketId={ticketId}
                subject={subject}
                setSubject={setSubject}
                message={message}
                setMessage={setMessage}
                category={category}
                setCategory={setCategory}
                email={email}
                setEmail={setEmail}
                name={name}
                setName={setName}
                submitting={submitting}
                onSubmit={handleSubmit}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MESSAGE ROW - routes to the right card type
// ─────────────────────────────────────────────────────────────
function MessageRow({
  msg,
  onFeedback,
  onSuggested,
  onEscalate,
}: {
  msg: ChatMessage;
  onFeedback: (id: string, helpful: boolean) => void;
  onSuggested: (prompt: string) => void;
  onEscalate: (subject?: string, category?: string) => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-rose-500 text-white text-sm leading-relaxed">
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.role === "system") {
    if (msg.kind === "welcome") {
      return (
        <div className="flex justify-start">
          <div className="max-w-[90%] bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Hi, I'm MigRent's help assistant. I answer using our Help Center articles - I don't give legal advice and I'll tell you when I'm not sure.
            <div className="mt-2 text-xs text-slate-500">Try one of the suggestions below, or type your own question.</div>
          </div>
        </div>
      );
    }
    if (msg.kind === "escalation") {
      return (
        <EscalationCard
          onContact={() => onEscalate()}
        />
      );
    }
    if (msg.kind === "human-handoff") {
      return (
        <EscalationCard
          title="Got it - let's get you a human."
          body="Our team replies within 24 hours on weekdays. Open a ticket and we'll route it to the right person."
          onContact={() => onEscalate()}
        />
      );
    }
  }

  if (msg.role === "assistant") {
    return <AssistantBubble msg={msg} onFeedback={onFeedback} onSuggested={onSuggested} onEscalate={onEscalate} />;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// ASSISTANT BUBBLE - confidence + safety + sources + feedback
// ─────────────────────────────────────────────────────────────
function AssistantBubble({
  msg,
  onFeedback,
  onSuggested,
  onEscalate,
}: {
  msg: AssistantMessage;
  onFeedback: (id: string, helpful: boolean) => void;
  onSuggested: (prompt: string) => void;
  onEscalate: (subject?: string, category?: string) => void;
}) {
  const feedbackGiven = (msg as AssistantMessage & { _feedback?: boolean })._feedback !== undefined;

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] space-y-2">
        {/* Emergency banner - hardcoded, highest priority */}
        {msg.emergency && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-xs text-red-800 dark:text-red-200">
            <strong>If you are in immediate danger, call 000.</strong> MigRent support is not an emergency service.
          </div>
        )}

        {/* Safety reminder */}
        {msg.safety && !msg.emergency && (
          <SafetyReminder onReport={() => onEscalate(`Safety report: ${msg.query}`, "trust_safety")} />
        )}

        {/* Confidence note for low / none */}
        {msg.confidence === "low" && (
          <ConfidenceNote tone="amber">
            I found something that might be related, but I'm not fully confident. Please double-check or talk to a human.
          </ConfidenceNote>
        )}
        {msg.confidence === "none" && (
          <ConfidenceNote tone="slate">
            I couldn't find a confident match in our Help Center. Try rephrasing, or open a ticket and our team will help.
          </ConfidenceNote>
        )}

        {/* Answer body - only render if we actually have one */}
        {msg.confidence !== "none" && (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {msg.text}
          </div>
        )}

        {/* Legal disclaimer */}
        {msg.legal && (
          <ConfidenceNote tone="purple">
            <strong>Not legal advice.</strong> Australian tenancy rules vary by state and situation. For your rights, check your state's tenancy authority (e.g. Fair Trading NSW, Consumer Affairs VIC) or speak to a community legal centre.
          </ConfidenceNote>
        )}

        {/* Source cards - additional results beyond the primary */}
        {msg.results.length > 1 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Related help articles</div>
            {msg.results.slice(1, 4).map((r) => (
              <SourceCard key={r.article.id} article={r.article} onPick={onSuggested} />
            ))}
          </div>
        )}

        {/* Empty-state nudge */}
        {msg.confidence === "none" && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => onEscalate(msg.query)}
              className="text-xs px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors"
            >
              Open a ticket
            </button>
            <a
              href="/help"
              className="text-xs px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium transition-colors"
            >
              Browse Help Center
            </a>
          </div>
        )}

        {/* Feedback row */}
        {msg.confidence !== "none" && !feedbackGiven && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Was this helpful?</span>
            <button
              onClick={() => onFeedback(msg.id, true)}
              className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => onFeedback(msg.id, false)}
              className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REUSABLE SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────
function SuggestedPromptChips({ prompts, onPick }: { prompts: string[]; onPick: (p: string) => void }) {
  return (
    <div className="pt-1">
      <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2">Try asking</div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function SourceCard({ article, onPick }: { article: KBArticle; onPick: (q: string) => void }) {
  return (
    <button
      onClick={() => onPick(article.question)}
      className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
    >
      <div className="text-[10px] uppercase tracking-wide text-rose-500 font-semibold">{article.category}</div>
      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug mt-0.5">{article.question}</div>
    </button>
  );
}

function ConfidenceNote({
  tone,
  children,
}: {
  tone: "amber" | "slate" | "purple";
  children: React.ReactNode;
}) {
  const palette = {
    amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
    slate: "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200",
  }[tone];
  return (
    <div className={`border rounded-xl px-3 py-2.5 text-xs leading-relaxed ${palette}`}>{children}</div>
  );
}

function SafetyReminder({ onReport }: { onReport: () => void }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-xs text-red-800 dark:text-red-200 space-y-2">
      <div>
        <strong>Your safety comes first.</strong> If something feels unsafe, stop the conversation with the other user, save any evidence (screenshots, messages), and report it to MigRent so we can investigate.
      </div>
      <button
        onClick={onReport}
        className="text-xs px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
      >
        Report this to MigRent
      </button>
    </div>
  );
}

function EscalationCard({
  title = "Still stuck? Let's get a human on it.",
  body = "Our support team replies within 24 hours on weekdays. We can help with payments, verification issues, safety concerns, and anything the assistant couldn't cover.",
  onContact,
}: {
  title?: string;
  body?: string;
  onContact: () => void;
}) {
  return (
    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 text-sm text-rose-900 dark:text-rose-100">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">{body}</div>
      <div className="flex flex-wrap gap-2 mt-2.5">
        <button
          onClick={onContact}
          className="text-xs px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors"
        >
          Open a ticket
        </button>
        <a
          href="/contact"
          className="text-xs px-3 py-1.5 rounded-full border border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-200 font-medium transition-colors"
        >
          Contact page
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTACT FORM (unchanged behaviour, extracted for readability)
// ─────────────────────────────────────────────────────────────
function ContactForm(props: {
  session: ReturnType<typeof useAuth>["session"];
  submitted: boolean;
  ticketId: string;
  subject: string;
  setSubject: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const {
    session, submitted, ticketId, subject, setSubject, message, setMessage,
    category, setCategory, email, setEmail, name, setName, submitting, onSubmit,
  } = props;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {submitted ? (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="font-bold text-lg text-slate-900 dark:text-white">Request submitted</h4>
          <p className="text-sm text-slate-500 mt-2">
            Ticket ID: <span className="font-mono font-semibold text-rose-500">{ticketId}</span>
          </p>
          <p className="text-xs text-slate-400 mt-2">We'll get back to you within 24 hours on weekdays.</p>
          {session && (
            <a href="/support/tickets" className="inline-block mt-4 text-sm text-rose-500 hover:text-rose-600 font-medium">
              View your tickets
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <p className="text-xs text-slate-500 mb-1">Tell us what's going on and we'll route it to the right team.</p>

          {!session && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="feedback">General feedback</option>
            <option value="billing">Billing or payments</option>
            <option value="onboarding">Onboarding</option>
            <option value="verification">Verification</option>
            <option value="listings">Listings</option>
            <option value="trust_safety">Trust & Safety</option>
            <option value="bug">Bug report</option>
          </select>

          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            required
            minLength={3}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue in detail..."
            required
            minLength={10}
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      )}
    </div>
  );
}
