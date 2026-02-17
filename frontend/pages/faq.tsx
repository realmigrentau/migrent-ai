import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm pr-4">{q}</h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 shrink-0"
        >
          &#x25BE;
        </motion.span>
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
            <p className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const faqCategories = [
  {
    title: "Getting Started",
    color: "rose",
    items: [
      { q: "What is MigRent AI?", a: "MigRent AI is an online matching platform that connects room owners with accommodation seekers for short- to medium-term rooms across Australia. We use AI to help match seekers with suitable rooms." },
      { q: "Is MigRent a real estate agent?", a: "No. MigRent AI is a matching platform only. We are not a real estate agent, landlord, tenant, or a party to any tenancy or licence agreement." },
      { q: "How do I create an account?", a: "Click 'Sign Up' on the homepage, enter your email, and verify it. You can then complete your profile as either a seeker, owner, or both." },
      { q: "Can I be both a seeker and an owner?", a: "Yes! You can switch between seeker and owner roles from your dashboard at any time." },
      { q: "Where does MigRent operate?", a: "MigRent currently operates in Sydney and Adelaide, Australia, with plans to expand to other cities." },
      { q: "Is MigRent free to use?", a: "Creating an account and browsing is free. Platform fees apply when a successful match is made — see our Pricing page for details." },
    ],
  },
  {
    title: "For Seekers",
    color: "rose",
    items: [
      { q: "How do I find a room?", a: "Once logged in, go to the Seeker Dashboard. Browse listings, use filters (location, price, room type), and view AI match scores to find rooms that suit you." },
      { q: "What does the match score mean?", a: "The match score is an AI-calculated percentage that estimates how well a listing matches your preferences (location, budget, lifestyle). It's a guide, not a guarantee." },
      { q: "Do I need to verify my identity?", a: "Verification is optional but recommended. Verified seekers get higher trust scores and are more likely to be chosen by owners." },
      { q: "How much does it cost as a seeker?", a: "Seekers may be presented with an optional one-time AUD $19 verification fee. This is always clearly disclosed before payment." },
      { q: "How do I contact an owner?", a: "Use the messaging feature on the platform to send a message to the owner directly. Keep communication on the platform for safety." },
      { q: "What if a listing looks suspicious?", a: "Use the Report button on any listing or profile. You can also email us at migrentau@gmail.com. We investigate all reports." },
      { q: "Can I save listings for later?", a: "Yes! Click the heart icon on any listing to save it to your wishlist. Access saved listings from your dashboard." },
      { q: "What should I check before paying rent?", a: "Always inspect the property (in person or via video call), verify the owner's identity, agree on all terms in writing, and understand bond, bills, and notice periods." },
    ],
  },
  {
    title: "For Owners",
    color: "blue",
    items: [
      { q: "How do I list a room?", a: "Go to the Owner Dashboard, click 'Create Listing', and fill in the details — location, price, photos, description, and house rules. Your listing will be visible to seekers immediately." },
      { q: "How much does it cost to list?", a: "Listing is free. Owners pay a one-time AUD $99 platform fee only when a successful match is confirmed through MigRent." },
      { q: "When is the owner fee charged?", a: "The AUD $99 fee is charged when a deal is confirmed through the platform. You are not charged for listing or receiving enquiries." },
      { q: "How do I choose the right seeker?", a: "Review seeker profiles, verification status, and match scores. Use the messaging feature to ask questions and conduct your own due diligence." },
      { q: "Can I have multiple listings?", a: "Yes, you can create multiple listings for different rooms or properties." },
      { q: "How do I manage my listing?", a: "Go to the Owner Dashboard to edit, pause, or remove your listings at any time." },
      { q: "What makes a good listing?", a: "Include clear, current photos, accurate pricing, detailed description, and be upfront about house rules, bills, and conditions." },
      { q: "How can I earn Superhost status?", a: "Complete at least 3 successful matches, maintain full verification, have no active reports, and respond to messages within 24 hours." },
    ],
  },
  {
    title: "Payments & Fees",
    color: "emerald",
    items: [
      { q: "How are payments processed?", a: "All platform fees are processed securely through Stripe. We never store your full credit card details." },
      { q: "Can I get a refund?", a: "Platform fees are generally non-refundable once a deal is confirmed. In exceptional circumstances, refunds may be considered at our discretion. Contact migrentau@gmail.com." },
      { q: "Will I get a receipt?", a: "Yes, Stripe automatically sends a receipt to your email address after each payment." },
      { q: "Is MigRent involved in rent payments?", a: "No. All ongoing rent payments are arranged directly between owners and seekers. MigRent only charges a one-time platform fee on match." },
      { q: "What counts as a 'successful match'?", a: "A match is considered successful when both parties confirm the arrangement through the platform's deal confirmation process." },
      { q: "What if someone tries to avoid the platform fee?", a: "Using MigRent to find a match and then deliberately moving off-platform to avoid fees is a violation of our Terms. This may result in account suspension." },
    ],
  },
  {
    title: "Verification & Safety",
    color: "emerald",
    items: [
      { q: "What verification does MigRent offer?", a: "We offer email verification (required), profile completion badges, and optional ID verification through third-party providers." },
      { q: "Is my personal data safe?", a: "Yes. We follow the Australian Privacy Act and applicable GDPR standards. See our Privacy Policy for full details." },
      { q: "What is VEVO?", a: "VEVO (Visa Entitlement Verification Online) is an Australian government service. MigRent may use VEVO-connected services to verify visa status for applicable users." },
      { q: "How do I report a problem?", a: "Use the Report button on any listing or profile, or contact us at migrentau@gmail.com. We take all reports seriously." },
      { q: "What if I feel unsafe?", a: "If you feel unsafe, contact local emergency services (000) immediately. Then report the situation to MigRent." },
      { q: "Are verification badges guaranteed?", a: "No. Verification badges and trust scores are informational tools to help decision-making. They do not guarantee safety or suitability." },
    ],
  },
  {
    title: "Account & Technical",
    color: "slate",
    items: [
      { q: "I can't log in — what should I do?", a: "Try resetting your password from the sign-in page. If the issue persists, contact us at migrentau@gmail.com." },
      { q: "How do I delete my account?", a: "Go to Account Settings and click 'Delete Account'. Your data will be removed within 30 days per our Privacy Policy." },
      { q: "Can I change my email address?", a: "Contact us at migrentau@gmail.com to request an email change. We'll verify your identity before making the change." },
      { q: "Does MigRent have a mobile app?", a: "MigRent is a responsive web app that works great on mobile browsers. A native app is on our roadmap." },
      { q: "How do I switch between light and dark mode?", a: "Click the sun/moon icon in the top navigation bar to toggle between themes." },
      { q: "Who do I contact for support?", a: "Email us at migrentau@gmail.com or use the contact form on our Contact page. We aim to respond within 24 hours." },
    ],
  },
];

export default function FAQ() {
  const [search, setSearch] = useState("");

  const filteredCategories = faqCategories.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <>
      <Head>
        <title>FAQ | MigRent AI</title>
        <meta name="description" content="Frequently asked questions about MigRent AI - payments, listings, verification, accounts, and more." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{faqCategories.reduce((sum, cat) => sum + cat.items.length, 0)}+ answers to your questions</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-10">
          {filteredCategories.map((category) => (
            <section key={category.title} className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{category.title}</h2>
              <div className="space-y-2">
                {category.items.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </section>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No questions match your search. Try different keywords or <Link href="/contact" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">contact us</Link>.</p>
            </div>
          )}

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-600/5 border-amber-200 dark:border-amber-500/20 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Still have questions?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Our team is here to help with anything not covered above.</p>
            <Link href="/contact">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                Contact Us
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
