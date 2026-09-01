import Link from "next/link";
import { useState, FormEvent, useMemo } from "react";
import { submitSupportRequest } from "../lib/api";
import { motion } from "framer-motion";
import Head from "next/head";

type Role = "seeker" | "owner" | "other";

type EnquiryCategory =
  | "ACCOUNT"
  | "VERIFY"
  | "LISTING"
  | "BOOKING"
  | "SAFETY"
  | "LEGAL"
  | "PRESS"
  | "PARTNERSHIPS"
  | "GENERAL";

const CATEGORIES: { value: EnquiryCategory; label: string; helper: string }[] = [
  { value: "ACCOUNT", label: "Account help (login, password)", helper: "We reply within 24h on weekdays." },
  { value: "VERIFY", label: "Verification help", helper: "We reply within 24h on weekdays." },
  { value: "LISTING", label: "Listing help (create, edit, photos)", helper: "We reply within 24h on weekdays." },
  { value: "BOOKING", label: "Booking or payment", helper: "Priority lane. Same business day where possible." },
  { value: "SAFETY", label: "Safety or report a user", helper: "Please also use the in-app Report button if it's urgent." },
  { value: "LEGAL", label: "Legal, privacy or DMCA", helper: "See our Legal Contact page for faster routing." },
  { value: "PRESS", label: "Press or media", helper: "We reply within 3 to 5 business days." },
  { value: "PARTNERSHIPS", label: "Partnerships or business", helper: "We reply within 3 to 5 business days." },
  { value: "GENERAL", label: "Something else", helper: "We'll route it to the right person." },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("seeker");
  const [category, setCategory] = useState<EnquiryCategory>("GENERAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const errors = useMemo(() => {
    const e: { [k: string]: string } = {};
    if (!name.trim()) e.name = "Please tell us your name.";
    if (!email.trim()) e.email = "We need your email to reply.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "That email looks off.";
    if (!message.trim()) e.message = "Please add a short message.";
    if (message.length > 2000) e.message = "Message is too long (max 2000 characters).";
    return e;
  }, [name, email, message]);

  const isValid = Object.keys(errors).length === 0;
  const activeHelper = CATEGORIES.find((c) => c.value === category)?.helper;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!isValid) return;
    setSubmitting(true);
    setError("");
    const subjectPrefix = `[${category}]`;
    const finalSubject = subject.trim() ? `${subjectPrefix} ${subject.trim()}` : subjectPrefix;
    const apiRole: "seeker" | "owner" = role === "owner" ? "owner" : "seeker";
    const result = await submitSupportRequest({
      name: name.trim(),
      email: email.trim(),
      role: apiRole,
      message: `${finalSubject}\n\nRole: ${role}\n\n${message.trim()}`,
    });
    setSubmitting(false);
    if (!result) {
      setError("We couldn't send your message right now. Please email migrentau@gmail.com directly.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <Head>
        <title>Contact MigRent | Real humans, real answers</title>
        <meta
          name="description"
          content="Get in touch with MigRent. Email support, contact form, safety reporting, legal escalation, and partnerships - all in one place."
        />
      </Head>

      <div className="max-w-5xl mx-auto space-y-14">
        {/* HERO */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] text-[var(--color-accent)] dark:text-[var(--color-accent)] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              Support online - replies within 24h on weekdays
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-ink)]">
              Contact MigRent
            </h1>
            <p className="text-base md:text-lg text-[var(--color-ink-2)] max-w-2xl leading-relaxed">
              Real humans. Real answers. Whether you're a seeker, an owner, or someone with a legal or safety concern -
              this page sorts you to the right place in seconds.
            </p>
          </div>
        </motion.section>

        {/* QUICK ROUTE GRID */}
        <section className="grid sm:grid-cols-3 gap-4">
          <a href="#contact-form" className="card p-6 rounded-2xl text-left hover:border-[var(--color-primary-soft)] dark:hover:border-[var(--color-primary)]/30 transition-colors block">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-ink)] text-base mb-1.5">I need help</h3>
            <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">Account, listing, booking, payment - send a message and we'll reply within 24h.</p>
          </a>

          <a href="#help-shortcut" className="card p-6 rounded-2xl text-left hover:border-[var(--color-line-2)] transition-colors block">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10 border border-[var(--color-line-2)] flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-warn-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-ink)] text-base mb-1.5">I have a question</h3>
            <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">Most answers are in our Help Center. Browse first - it's faster.</p>
          </a>

          <a href="#escalation" className="card p-6 rounded-2xl text-left hover:border-[var(--color-danger-500)]/30 dark:hover:border-red-500/30 transition-colors block">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-500)]/10 border border-[var(--color-danger-500)]/20 dark:border-[var(--color-danger-500)]/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-danger-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-ink)] text-base mb-1.5">Safety, legal or press</h3>
            <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">Report a user, formal legal notice, or media enquiry - jump straight to the right channel.</p>
          </a>
        </section>

        {/* HELP SHORTCUT */}
        <section id="help-shortcut" className="card p-6 md:p-8 rounded-2xl">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">Quick answers</h2>
              <p className="text-sm text-[var(--color-ink-3)] mt-1">Most questions are answered in seconds.</p>
            </div>
            <Link href="/faq" className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] font-medium">
              Browse all FAQs →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { q: "How does identity verification work?", href: "/faq" },
              { q: "How do bookings and payments work?", href: "/faq" },
              { q: "Can I cancel a booking?", href: "/faq" },
              { q: "How do I list my property?", href: "/help" },
              { q: "Is MigRent only for migrants and students?", href: "/faq" },
              { q: "How do I report a suspicious listing?", href: "/help" },
            ].map((item) => (
              <Link
                key={item.q}
                href={item.href}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--color-line)] hover:border-[var(--color-primary-soft)] dark:hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary-soft)]/30 dark:hover:bg-[var(--color-primary)]/5 transition-colors text-sm text-[var(--color-ink-2)]"
              >
                <span>{item.q}</span>
                <svg className="w-4 h-4 text-[var(--color-ink-3)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* CONTACT FORM */}
        <section id="contact-form" className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">Send us a message</h2>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
              Tell us what's going on. We reply from <span className="font-medium text-[var(--color-ink)]">migrentau@gmail.com</span> within 24 hours on weekdays, 48 hours on weekends.
            </p>
            <div className="card-subtle p-4 rounded-xl space-y-2 text-sm">
              <p className="font-semibold text-[var(--color-ink)]">Prefer email?</p>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2"
              >
                migrentau@gmail.com
              </a>
              <p className="text-[var(--color-ink-3)] leading-relaxed">
                For faster routing, add a tag to your subject line - for example <span className="font-mono text-xs bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded">[BOOKING]</span> or <span className="font-mono text-xs bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded">[SAFETY]</span>.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8 rounded-2xl border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)]/40 dark:bg-[var(--color-accent)]/5 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2">Got it - your message is in.</h3>
                <p className="text-sm text-[var(--color-ink-2)] max-w-md mx-auto leading-relaxed">
                  We'll reply to <span className="font-medium text-[var(--color-ink)]">{email}</span> from <span className="font-medium text-[var(--color-ink)]">migrentau@gmail.com</span> within 24 hours on weekdays.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName(""); setEmail(""); setSubject(""); setMessage("");
                    setCategory("GENERAL"); setRole("seeker"); setTouched({});
                  }}
                  className="mt-6 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] font-medium"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-6 md:p-7 rounded-2xl space-y-5" noValidate>
                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-[var(--color-ink-2)] mb-1.5">Full name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      className="input-field"
                    />
                    {touched.name && errors.name && <p className="text-xs text-[var(--color-danger-500)] mt-1.5">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-[var(--color-ink-2)] mb-1.5">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      className="input-field"
                    />
                    {touched.email && errors.email && <p className="text-xs text-[var(--color-danger-500)] mt-1.5">{errors.email}</p>}
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-ink-2)] mb-1.5">I am a</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["seeker", "owner", "other"] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize ${
                          role === r
                            ? "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border-[var(--color-line-2)] dark:border-[var(--color-primary)]/40 text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                            : "bg-[var(--color-surface-2)]/40 border-[var(--color-line)] text-[var(--color-ink-2)] hover:border-[var(--color-line-2)] dark:hover:border-[var(--color-line-2)]"
                        }`}
                      >
                        {r === "seeker" ? "Seeker" : r === "owner" ? "Owner" : "Other"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category + Subject */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-xs font-medium text-[var(--color-ink-2)] mb-1.5">Enquiry type</label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as EnquiryCategory)}
                      className="input-field"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    {activeHelper && <p className="text-xs text-[var(--color-ink-3)] mt-1.5">{activeHelper}</p>}
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-xs font-medium text-[var(--color-ink-2)] mb-1.5">Subject <span className="text-[var(--color-ink-3)] font-normal">(optional)</span></label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="Short summary"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="message" className="block text-xs font-medium text-[var(--color-ink-2)]">Message</label>
                    <span className="text-xs text-[var(--color-ink-3)]">{message.length}/2000</span>
                  </div>
                  <textarea
                    id="message"
                    placeholder="Tell us what's going on. The more detail, the faster we can help."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                    rows={5}
                    maxLength={2000}
                    className="input-field"
                  />
                  {touched.message && errors.message && <p className="text-xs text-[var(--color-danger-500)] mt-1.5">{errors.message}</p>}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-[var(--color-warn-50)] dark:bg-[var(--color-warn-500)]/10 border border-[var(--color-line-2)] text-sm text-[var(--color-warn-600)]">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary py-2.5 px-6 rounded-[10px] text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Send message"}
                  </button>
                  <p className="text-xs text-[var(--color-ink-3)] leading-relaxed">
                    We use your email only to reply. See our <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-[var(--color-primary)]">Privacy Policy</Link>.
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* SAFETY + LEGAL ESCALATION */}
        <section id="escalation" className="grid md:grid-cols-2 gap-4">
          <div className="card p-6 rounded-2xl border-l-2 border-l-red-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-danger-50)] dark:bg-[var(--color-danger-500)]/10 border border-[var(--color-danger-500)]/20 dark:border-[var(--color-danger-500)]/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[var(--color-danger-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] text-base">Safety or report a user</h3>
                <p className="text-sm text-[var(--color-ink-3)] mt-0.5">Scams, harassment, suspicious listings.</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed mb-4">
              Use the <span className="font-medium text-[var(--color-ink)]">Report</span> button on any listing or profile, or email us with the subject line <span className="font-mono text-xs bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded">[SAFETY]</span>. We respond within 24 hours, 7 days a week.
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=%5BSAFETY%5D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)] hover:text-[var(--color-danger-600)]"
            >
              Email the safety team
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="card p-6 rounded-2xl border-l-2 border-l-[var(--color-primary)]">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] text-base">Legal, privacy or DMCA</h3>
                <p className="text-sm text-[var(--color-ink-3)] mt-0.5">Formal notices, data requests, arbitration.</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed mb-4">
              Our Legal Contact page has dedicated subject lines for faster routing - privacy requests, copyright, arbitration, and more.
            </p>
            <Link
              href="/contact-legal"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
            >
              Open Legal Contact
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* OTHER WAYS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">Other ways to reach us</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=%5BPRESS%5D"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 rounded-2xl block hover:border-[var(--color-primary-soft)] dark:hover:border-[var(--color-primary)]/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-violet-100 dark:border-[var(--color-primary)]/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--color-ink)] text-sm mb-1">Press &amp; media</h3>
              <p className="text-xs text-[var(--color-ink-3)] leading-relaxed">Subject: <span className="font-mono">[PRESS]</span> · 3-5 business days</p>
            </a>

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com&su=%5BPARTNERSHIPS%5D"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 rounded-2xl block hover:border-[var(--color-primary-100)] dark:hover:border-[var(--color-primary)]/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-100)] dark:border-[var(--color-primary)]/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--color-ink)] text-sm mb-1">Partnerships</h3>
              <p className="text-xs text-[var(--color-ink-3)] leading-relaxed">Universities, mentors, integrations</p>
            </a>

            <div className="card p-5 rounded-2xl opacity-80">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10 border border-[var(--color-primary-soft)] dark:border-[var(--color-primary-soft)] flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-[var(--color-ink)] text-sm">Discord community</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-3)] font-medium uppercase tracking-wide">Launching soon</span>
              </div>
              <p className="text-xs text-[var(--color-ink-3)] leading-relaxed">Peer help and community chat. We&apos;re finalising moderation before opening it up.</p>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="card p-6 rounded-2xl space-y-2">
            <h3 className="font-semibold text-[var(--color-ink)] text-base">Business details</h3>
            <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-1 pt-1">
              <p className="font-semibold text-[var(--color-ink)]">MigRent AI</p>
              <p>ABN: 22 669 566 941</p>
              <p>Structure: Sole Trader</p>
              <p>Location: Sydney, New South Wales, Australia</p>
              <p>
                Email:{" "}
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2"
                >
                  migrentau@gmail.com
                </a>
              </p>
            </div>
          </div>
          <div className="card p-6 rounded-2xl">
            <h3 className="font-semibold text-[var(--color-ink)] text-base mb-2">A note from the founder</h3>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
              Hi - I'm Anesh, the founder of MigRent. We're a small, focused team building MigRent for migrants and students in Australia. Email goes straight to a real human inbox. If something's not working or you just want to say hello, write to us. We read everything.
            </p>
            <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] mt-4">
              About MigRent
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* FOOTER REINFORCEMENT */}
        <div className="text-center text-sm text-[var(--color-ink-3)] pb-4">
          Still stuck? Email us anytime at{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] font-medium underline underline-offset-2"
          >
            migrentau@gmail.com
          </a>
          .
        </div>
      </div>
    </>
  );
}
