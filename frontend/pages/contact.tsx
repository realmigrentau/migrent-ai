import Link from "next/link";
import { useState, FormEvent } from "react";
import { submitSupportRequest } from "../lib/api";
import { motion } from "framer-motion";
import Head from "next/head";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"seeker" | "owner">("seeker");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus("Please fill in all required fields.");
      return;
    }
    await submitSupportRequest({ name, email, role, message: `[${subject}] ${message}` });
    setStatus("Your message has been submitted. We will get back to you by email.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <>
      <Head>
        <title>Contact Us | MigRent AI</title>
        <meta name="description" content="Get in touch with MigRent AI. Support, feedback, partnerships, and general enquiries." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Contact <span className="gradient-text">Us</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We&apos;re here to help</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Support Channels */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="card p-5 rounded-2xl text-center">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Email</h3>
              <a href="mailto:migrentau@gmail.com" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 text-sm underline underline-offset-2 transition-colors">
                migrentau@gmail.com
              </a>
            </div>
            <div className="card p-5 rounded-2xl text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Response Time</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Within 24 hours</p>
            </div>
            <div className="card p-5 rounded-2xl text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">FAQ</h3>
              <Link href="/faq" className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 text-sm underline underline-offset-2 transition-colors">
                Check common questions
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Send us a message</h2>
            <form onSubmit={handleSubmit} className="card p-6 rounded-2xl space-y-4 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "seeker" | "owner")}
                  className="input-field"
                >
                  <option value="seeker">I am a Seeker</option>
                  <option value="owner">I am an Owner</option>
                </select>
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                />
              </div>
              <textarea
                placeholder="Message *"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                className="input-field"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary py-3 px-6 rounded-xl text-sm"
              >
                Send Message
              </motion.button>
              {status && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm p-3 rounded-xl ${
                    status.includes("submitted")
                      ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {status}
                </motion.p>
              )}
            </form>
          </section>

          {/* Business Details */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Business Details</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">MigRent AI</p>
              <p>ABN: 22 669 566 941</p>
              <p>Structure: Sole Trader</p>
              <p>Location: Sydney, Australia (Virtual business)</p>
              <p>Email: <a href="mailto:migrentau@gmail.com" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">migrentau@gmail.com</a></p>
            </div>
          </section>

          {/* AI Helper Note */}
          <div className="card p-5 rounded-2xl border-l-2 border-l-rose-500">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              In the future, an AI assistant (&quot;Emily &mdash; MigRent Helpbot&quot;) will be available here to answer common questions instantly.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
