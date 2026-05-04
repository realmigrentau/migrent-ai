import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function RulesCommunityGuidelines() {
  return (
    <>
      <Head>
        <title>Community Guidelines | MigRent AI</title>
        <meta name="description" content="MigRent AI community rules - listing standards, guest expectations, dispute resolution, and platform conduct." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Community Guidelines
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rules for a safe and fair community</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Intro */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Our Community Standards</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent AI is built on trust, respect, and transparency. These guidelines apply to all users - both owners and seekers. Violations may result in content removal, account suspension, or termination.</p>
            </div>
          </section>

          {/* General Rules */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">General Rules (All Users)</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Be truthful and accurate in your profile and all communications</li>
                <li>Treat all users with respect regardless of background, nationality, religion, or gender</li>
                <li>Do not engage in discrimination, harassment, threats, or bullying</li>
                <li>Do not post or share illegal, offensive, or inappropriate content</li>
                <li>Do not use the platform for scams, fraud, or deceptive practices</li>
                <li>Respect the privacy of other users - do not share personal information without consent</li>
                <li>Do not create fake profiles or impersonate others</li>
                <li>Report any suspicious activity promptly</li>
              </ul>
            </div>
          </section>

          {/* Seeker Rules */}
          <section className="card p-6 rounded-2xl space-y-3 border-l-2 border-l-rose-500">
            <h2 className="text-lg font-bold text-rose-500">Rules for Seekers</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Be truthful and accurate in your profile and during any verification process</li>
                <li>Respect house rules, neighbours, and applicable tenancy or lodging laws</li>
                <li>Do not ghost owners after agreeing to an arrangement</li>
                <li>Understand that MigRent may present an optional one-time AUD $19 platform fee when a successful match occurs</li>
                <li>Do not encourage or agree to arrangements where an owner intends to circumvent platform fees</li>
                <li>Leave the property in the condition you found it</li>
                <li>Communicate openly about any issues during your stay</li>
              </ul>
            </div>
          </section>

          {/* Owner Rules */}
          <section className="card p-6 rounded-2xl space-y-3 border-l-2 border-l-blue-500">
            <h2 className="text-lg font-bold text-blue-500">Rules for Owners</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Provide accurate and up-to-date listing information (location, price, photos, conditions)</li>
                <li>Do not post misleading photos or descriptions</li>
                <li>Comply with relevant tenancy or lodging laws and anti-discrimination rules</li>
                <li>Do not demand unlawful payments (e.g. excessive bond or hidden charges)</li>
                <li>Agree to pay MigRent&apos;s one-time AUD $99 platform fee on each successful match</li>
                <li>Do not use MigRent to find seekers and then move the arrangement off-platform to avoid fees</li>
                <li>Provide a safe, clean, and habitable living environment</li>
                <li>Respond to enquiries in a timely manner</li>
              </ul>
            </div>
          </section>

          {/* Listing Standards */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Listing Standards</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>All listings must meet the following minimum standards:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Accuracy</strong> - Photos must be current and representative of the actual space</li>
                <li><strong>Pricing</strong> - Weekly rent must be clearly stated with no hidden fees</li>
                <li><strong>Location</strong> - Suburb and general area must be accurate</li>
                <li><strong>Availability</strong> - Dates and availability must be kept up to date</li>
                <li><strong>Conditions</strong> - Bond, bills, house rules, and notice periods must be disclosed</li>
              </ul>
              <p>Listings that do not meet these standards may be flagged, hidden, or removed.</p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dispute Resolution</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent encourages users to resolve disputes directly and amicably. If you cannot reach a resolution:</p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Attempt direct communication with the other party</li>
                <li>Document all interactions and agreements</li>
                <li>Contact MigRent at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">migrentau@gmail.com</a> for assistance</li>
                <li>For serious disputes, seek independent legal advice or contact your state&apos;s tenancy authority</li>
              </ol>
              <p>MigRent may mediate informally but is not a dispute resolution service and cannot enforce outcomes between users.</p>
            </div>
          </section>

          {/* Regulatory */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Regulatory Compliance</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Owners are responsible for complying with any local regulations that may apply, including:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Short-term rental accommodation (STRA) registration in NSW</li>
                <li>Council regulations and strata by-laws</li>
                <li>Fire safety and habitability standards</li>
                <li>Insurance and liability requirements</li>
              </ul>
              <p>MigRent AI does not provide legal advice and is not responsible for users&apos; regulatory compliance.</p>
            </div>
          </section>

          {/* Enforcement */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enforcement</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent may take the following actions for guideline violations:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Warning</strong> - First-time or minor violations</li>
                <li><strong>Content removal</strong> - Listings or messages that violate standards</li>
                <li><strong>Temporary suspension</strong> - Repeated or moderate violations</li>
                <li><strong>Permanent ban</strong> - Severe violations, fraud, or illegal activity</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-500/10 dark:to-violet-600/5 border-violet-200 dark:border-violet-500/20 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Join a trusted community</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Sign up and start connecting with verified users.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/signup">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                  Sign Up Free
                </motion.span>
              </Link>
              <Link href="/safety-verification">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-secondary text-sm px-6 py-2.5 rounded-xl">
                  Learn About Safety
                </motion.span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
