import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { createTicket } from "../../lib/api";
import { siteIdentity } from "../../lib/siteIdentity";
import type { HelpAnswer } from "../../lib/helpSearch";
import { Events, trackEvent } from "../../lib/analytics";
import EmailInboxHelp from "../EmailInboxHelp";

type Tab = "answers" | "contact";

interface ChatMessage {
  from: "user" | "bot";
  text: string;
  link?: HelpAnswer["link"];
}

const REPLY = `A person replies by email, ${siteIdentity.support.responseTarget} (${siteIdentity.support.hours}).`;

/**
 * The help button on every public page.
 *
 * "Quick answers" searches the Help centre (lib/helpSearch.ts) and links to
 * the article each answer comes from. It is a search, not an AI or a live
 * chat, and says so. "Write to us" opens a support ticket that a person
 * answers by email.
 *
 * On phones the panel is a sheet that fits the screen (it used to be a fixed
 * 448px wide and ran off the left edge of every phone), and the button steps
 * aside while someone is typing in another field, so it never covers the
 * search box.
 */
export default function SupportWidget() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("answers");
  // True while the visitor is typing in a field outside this widget.
  const [typingElsewhere, setTypingElsewhere] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Quick answers
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "bot", text: "Ask a question and I'll find the answer in our Help centre. To reach a person, use Write to us." },
  ]);
  const [question, setQuestion] = useState("");
  const [searching, setSearching] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Write to us
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("feedback");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [trap, setTrap] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, searching]);

  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && el.matches("input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select") && !panelRef.current?.contains(el);
    const onIn = (e: FocusEvent) => setTypingElsewhere(isField(e.target));
    const onOut = () => setTypingElsewhere(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  async function ask() {
    const q = question.trim();
    if (!q) return;
    setQuestion("");
    setMessages((prev) => [...prev, { from: "user", text: q }]);
    setSearching(true);
    try {
      // Loaded on the first question, so the Help centre text is not part
      // of every page's download.
      const { searchHelp } = await import("../../lib/helpSearch");
      const answer = searchHelp(q);
      trackEvent(Events.HELP_QUESTION_ASKED, { answered: Boolean(answer) });
      setMessages((prev) => [
        ...prev,
        answer
          ? { from: "bot", text: answer.text, link: answer.link }
          : {
              from: "bot",
              text: `I couldn't find that in the Help centre. Try a word like "bond", "fees", "ID check" or "inspection", or use Write to us. ${REPLY}`,
              link: { href: "/help", label: "Browse the Help centre" },
            },
      ]);
    } catch {
      setMessages((prev) => [...prev, { from: "bot", text: "Answers couldn't load just now. Try again, or use Write to us.", link: { href: "/help", label: "Open the Help centre" } }]);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSendError("");
    const token = session?.access_token;
    const res = await createTicket(
      {
        subject,
        message,
        category,
        source: "in_app",
        ...(token ? {} : { email, name }),
        website: trap || undefined,
      },
      token,
    );
    if (res && "error" in res && typeof res.error === "string") {
      setSendError(res.error);
    } else if (res?.ticket_id) {
      setTicketId(res.ticket_id.slice(0, 8));
      setSubmitted(true);
    } else {
      setSendError(`That didn't send. Please try again, or email ${siteIdentity.emails.support}.`);
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
    setSendError("");
  }

  const field = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/30";

  return (
    <>
      {/* Floating button. Smaller on phones, and out of the way while
          someone types in another field. */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Close help" : "Help"}
        className={`fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-[color:var(--color-primary-fg)] shadow-lg transition-all hover:shadow-xl sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 ${
          typingElsewhere && !open ? "pointer-events-none translate-y-24 opacity-0 sm:pointer-events-auto sm:translate-y-0 sm:opacity-100" : ""
        }`}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Migrent help"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 bottom-20 z-50 flex h-[min(38rem,calc(100dvh-7rem))] flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-2)] shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[28rem]"
          >
            {/* Header */}
            <div className="bg-[var(--color-primary)] px-5 py-4 text-[color:var(--color-primary-fg)]">
              <h3 className="text-base font-bold">Migrent help</h3>
              <p className="text-xs opacity-90">Answers from our Help centre, and a person by email.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--color-line)]" role="tablist">
              {([
                { key: "answers" as Tab, label: "Quick answers", icon: "M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" },
                { key: "contact" as Tab, label: "Write to us", icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" },
              ]).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => {
                    setTab(t.key);
                    if (t.key === "contact") resetForm();
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                    tab === t.key ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)]"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                  </svg>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "answers" ? (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.from === "user" ? "rounded-br-md bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]" : "rounded-bl-md bg-[var(--color-surface-muted)] text-[var(--color-ink-2)]"
                        }`}
                      >
                        {msg.text}
                        {msg.link && (
                          <Link href={msg.link.href} className="mt-2 block font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline">
                            {msg.link.label}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                  {searching && <p className="text-xs text-[var(--color-ink-3)]">Looking in the Help centre...</p>}
                  <div ref={endRef} />
                </div>

                <form
                  className="border-t border-[var(--color-line)] p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void ask();
                  }}
                >
                  <div className="flex gap-2">
                    <label htmlFor="help-question" className="sr-only">
                      Your question
                    </label>
                    <input
                      id="help-question"
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g. Who holds my bond?"
                      className={`flex-1 ${field}`}
                    />
                    <button
                      type="submit"
                      aria-label="Search the Help centre"
                      disabled={!question.trim() || searching}
                      className="shrink-0 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-primary-fg)] transition-colors disabled:bg-[var(--color-primary-soft)]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1.5 text-center text-[11px] text-[var(--color-ink-3)]">Answers come from the Help centre. To reach a person, use Write to us.</p>
                </form>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                {submitted ? (
                  <div className="py-10 text-center" role="status">
                    <h4 className="text-lg font-bold text-[var(--color-ink)]">Sent</h4>
                    <p className="mt-2 text-sm text-[var(--color-ink-3)]">
                      Reference: <span className="font-mono font-semibold text-[var(--color-primary)]">{ticketId}</span>
                    </p>
                    <p className="mt-2 text-xs text-[var(--color-ink-3)]">{REPLY}</p>
                    <EmailInboxHelp className="mt-4 text-left" compact />
                    {session && (
                      <Link href="/support/tickets" className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)]">
                        See your support requests
                      </Link>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="relative space-y-3">
                    {/* Spam trap: hidden from people and screen readers; bots fill it. */}
                    <div aria-hidden="true" className="absolute -left-[10000px] top-0 h-px w-px overflow-hidden">
                      <label>
                        Website
                        <input tabIndex={-1} autoComplete="off" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} />
                      </label>
                    </div>
                    <p className="mb-1 text-xs text-[var(--color-ink-3)]">{REPLY} If you feel unsafe, call 000 first.</p>

                    {!session && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" required autoComplete="name" className={field} />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Your email" required autoComplete="email" className={field} />
                      </div>
                    )}

                    <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="What is it about?" className={field}>
                      <option value="feedback">Something else</option>
                      <option value="onboarding">My account or signing in</option>
                      <option value="verification">ID checks</option>
                      <option value="listings">A listing</option>
                      <option value="billing">A fee or payment</option>
                      <option value="trust_safety">Safety, or reporting someone</option>
                      <option value="bug">Something isn't working</option>
                    </select>

                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" aria-label="Subject" required minLength={3} maxLength={300} className={field} />

                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What happened, and how can we help?"
                      aria-label="Your message"
                      required
                      minLength={10}
                      rows={5}
                      className={`${field} resize-none`}
                    />

                    {sendError && (
                      <p role="alert" className="text-xs text-[color:var(--color-danger-500)]">
                        {sendError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[color:var(--color-primary-fg)] transition-colors disabled:bg-[var(--color-primary-soft)]"
                    >
                      {submitting ? "Sending..." : "Send"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
