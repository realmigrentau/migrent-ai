import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

export default function SafetyVerification() {
  return (
    <>
      <Head>
        <title>Safety & Verification | MigRent AI</title>
        <meta name="description" content="How MigRent AI keeps you safe - ID verification (VEVO), trust scores, Superhost criteria, and safety guidelines." />
      </Head>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Safety &amp; Verification
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your safety is our top priority</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          {/* Overview */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Our Approach to Safety</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent AI employs multiple layers of trust and verification to create a safer room-finding experience. While no platform can guarantee safety, we work hard to provide the tools and information you need to make informed decisions.</p>
            </div>
          </section>

          {/* Verification Tiers */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verification Levels</h2>
            <div className="grid gap-4">
              <div className="card p-5 rounded-2xl border-l-2 border-l-slate-300 dark:border-l-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">1</span>
                  <h3 className="font-bold text-slate-900 dark:text-white">Email Verified</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">All users must verify their email address to create an account. This is the baseline verification level.</p>
              </div>
              <div className="card p-5 rounded-2xl border-l-2 border-l-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">2</span>
                  <h3 className="font-bold text-slate-900 dark:text-white">Profile Complete</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Users who complete their full profile (name, photo, bio, preferences) receive a completeness badge that signals seriousness to other users.</p>
              </div>
              <div className="card p-5 rounded-2xl border-l-2 border-l-emerald-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">3</span>
                  <h3 className="font-bold text-slate-900 dark:text-white">ID Verified</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Optional identity verification through third-party providers. We may use services connected to VEVO (Visa Entitlement Verification Online) for visa status checks where applicable. Only verification status (pass/fail) is stored - not raw ID documents.</p>
              </div>
            </div>
          </section>

          {/* Trust Scores */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Match &amp; Trust Scores</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>MigRent uses AI-assisted matching to help connect seekers with suitable rooms. Match scores consider factors such as:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Location preferences and proximity</li>
                <li>Budget range compatibility</li>
                <li>Lifestyle preferences (smoking, pets, schedule)</li>
                <li>Profile completeness and verification status</li>
                <li>Historical platform behaviour and reviews</li>
              </ul>
              <div className="card-subtle p-4 rounded-xl border-l-2 border-l-amber-500 mt-3">
                <p className="text-sm text-amber-700 dark:text-amber-400"><strong>Important:</strong> Match scores and verification badges are informational tools to assist your decision-making. They do not constitute guarantees of safety, suitability, or legality.</p>
              </div>
            </div>
          </section>

          {/* Superhost */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Superhost Criteria</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>Owners can earn Superhost status by demonstrating consistent quality and reliability. Criteria include:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Minimum 3 completed successful matches through the platform</li>
                <li>Profile fully verified (email + ID)</li>
                <li>No active reports or policy violations</li>
                <li>Responsive communication (average reply within 24 hours)</li>
                <li>Accurate listing information confirmed by seekers</li>
              </ul>
              <p>Superhost status is reviewed periodically and can be revoked if criteria are no longer met.</p>
            </div>
          </section>

          {/* Safety Tips - Seekers */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Safety Tips for Seekers</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Always inspect the property in person or via video call before committing or paying any money</li>
                <li>Never pay bond or rent before seeing the property and meeting the owner</li>
                <li>Use written agreements or clear messages confirming all terms</li>
                <li>Ask about bills, bond, notice periods, and house rules upfront</li>
                <li>Be cautious of deals that seem too good to be true</li>
                <li>Keep all communication on the MigRent platform where possible</li>
                <li>Report suspicious behaviour immediately using the Report button</li>
              </ul>
            </div>
          </section>

          {/* Safety Tips - Owners */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Safety Tips for Owners</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Meet seekers in a safe, public environment first</li>
                <li>Verify the seeker&apos;s identity before sharing your address</li>
                <li>Consider requesting references where appropriate</li>
                <li>Keep written records of all arrangements and agreements</li>
                <li>Set clear house rules and expectations before move-in</li>
                <li>Use the platform messaging for a clear communication trail</li>
              </ul>
            </div>
          </section>

          {/* Reporting */}
          <section className="card p-6 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reporting &amp; Disputes</h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>If you encounter unsafe, misleading, or suspicious behaviour:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Report button</strong> - Available on every listing and user profile</li>
                <li><strong>Email</strong> - Contact <a href="https://mail.google.com/mail/?view=cm&fs=1&to=migrentau@gmail.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">migrentau@gmail.com</a></li>
                <li><strong>Emergency</strong> - If you feel unsafe, contact local emergency services (000) immediately</li>
              </ul>
              <p>We take all reports seriously and will investigate promptly. Users who are found to violate our guidelines may have their accounts suspended or terminated.</p>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="card-subtle p-6 rounded-2xl border-l-2 border-l-amber-500">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2"><strong className="text-slate-700 dark:text-slate-300">Disclaimer:</strong> MigRent does not guarantee the safety, suitability, or legality of any person or property. Users must make their own independent checks and decisions.</p>
          </div>

          {/* CTA */}
          <div className="card p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-[var(--color-accent-soft)]/50 dark:from-[var(--color-accent)]/10 dark:to-emerald-600/5 border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)] text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Stay safe on MigRent</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Complete your verification to build trust with other users.</p>
            <Link href="/signup">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block btn-primary text-sm px-6 py-2.5 rounded-xl">
                Get Verified
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
