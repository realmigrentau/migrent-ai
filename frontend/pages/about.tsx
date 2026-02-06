import { useState, FormEvent } from "react";
import { submitSupportRequest } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 text-xl shrink-0 ml-4"
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
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FAQProps {
  q: string;
  a: string;
}

function FAQItem({ q, a }: FAQProps) {
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

export default function About() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"seeker" | "owner">("seeker");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus("Please fill in all required fields.");
      return;
    }
    await submitSupportRequest({ name, email, role, message });
    setStatus(
      "Your message has been submitted. We will get back to you by email."
    );
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* About MigRent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          About <span className="gradient-text">MigRent AI</span>
        </h1>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 rounded-2xl space-y-4"
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            MigRent AI is an online matching platform that connects room owners and
            accommodation seekers for short- to medium-term rooms in Sydney and
            Adelaide. MigRent is not a real estate agent, landlord, tenant, or legal
            representative of any user.
          </p>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ABN</span>
            <p className="text-slate-900 dark:text-white font-semibold">22 669 566 941</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Structure</span>
            <p>Sole Trader</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Email</span>
            <p>
              <a
                href="mailto:migrentau@gmail.com"
                className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors"
              >
                migrentau@gmail.com
              </a>
            </p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Location</span>
            <p>Virtual business operating in Sydney/Adelaide</p>
          </div>
        </div>
      </motion.section>

      {/* Contact form */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Contact us
        </h2>
        <form onSubmit={handleSubmit} className="card p-6 rounded-2xl space-y-4 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />
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
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "seeker" | "owner")}
            className="input-field"
          >
            <option value="seeker">I am a Seeker</option>
            <option value="owner">I am an Owner</option>
          </select>
          <textarea
            placeholder="Message *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You can also reach us at{" "}
          <a
            href="mailto:migrentau@gmail.com"
            className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors"
          >
            migrentau@gmail.com
          </a>
          .
        </p>
      </section>

      {/* Safety & Verification */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Safety &amp; Verification
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Your safety is our priority</p>

        <CollapsibleSection title="About verification" defaultOpen>
          <p>
            MigRent may use third-party services to assist with ID or visa
            verification. Verification and match scores are tools to help users
            make informed decisions but do not guarantee safety or legality.
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Safety tips for Seekers">
          <ul className="list-disc list-inside space-y-2">
            <li>
              Inspect properties (in person or via video call) before paying any
              money.
            </li>
            <li>
              Use written agreements or clear messages confirming what is agreed.
            </li>
            <li>
              Ask questions about bills, bond, notice periods, and any other
              conditions.
            </li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Safety tips for Owners">
          <ul className="list-disc list-inside space-y-2">
            <li>Arrange to meet seekers in a safe environment.</li>
            <li>Consider asking for references if appropriate.</li>
            <li>Keep written records of arrangements.</li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Reporting">
          <p>
            If you encounter an unsafe, misleading, or suspicious listing or
            profile, please report it using the Report button on the listing or
            profile page, or contact us at{" "}
            <a href="mailto:migrentau@gmail.com" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">
              migrentau@gmail.com
            </a>
            . We take all reports seriously and will investigate promptly.
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Regulatory compliance">
          <p>
            MigRent AI is not responsible for users&apos; regulatory
            compliance. Hosts should ensure they comply with any applicable
            local regulations (e.g. STRA registration in NSW if relevant).
          </p>
        </CollapsibleSection>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-subtle p-6 rounded-2xl border-l-2 border-l-amber-500"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            MigRent does not guarantee the safety, suitability, or legality of
            any person or property.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Users must make their own independent checks and decisions.
          </p>
        </motion.div>
      </section>

      {/* Terms of Use */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Terms of Use
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: January 2026</p>

        <CollapsibleSection title="About MigRent" defaultOpen>
          <p>
            MigRent is an online matching platform that connects room owners and
            accommodation seekers for short- to medium-term rooms in Sydney and
            Adelaide.
          </p>
          <p>
            MigRent is not a real estate agent, landlord, tenant, or legal
            representative of any user.
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Accounts and use">
          <ul className="list-disc list-inside space-y-2">
            <li>Users must provide accurate information when registering.</li>
            <li>
              Users are responsible for their actions on the platform, including
              the accuracy of any listings or profile information.
            </li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Platform fees">
          <ul className="list-disc list-inside space-y-2">
            <li>
              Owners agree to pay a one-time AUD 99 platform fee to MigRent when
              a successful match is made via the platform.
            </li>
            <li>
              Seekers may be presented with an optional one-time AUD 19 platform
              fee when they successfully secure accommodation via the platform;
              this will always be disclosed clearly at checkout.
            </li>
            <li>
              Users must not use MigRent to locate or contact another user and
              then intentionally complete the arrangement entirely outside the
              platform in order to avoid paying MigRent&apos;s platform fee. If
              MigRent reasonably suspects circumvention, it may restrict,
              suspend, or terminate access to the service.
            </li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Refund policy">
          <p>
            MigRent AI fees are non-refundable once a deal is confirmed and
            payment is processed. In exceptional circumstances, manual refunds
            may be considered at the sole discretion of MigRent AI. Contact{" "}
            <a href="mailto:migrentau@gmail.com" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">
              migrentau@gmail.com
            </a>{" "}
            for refund inquiries.
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Platform role">
          <p>
            MigRent AI is a platform only and is not a real estate agent or
            property manager. All rental agreements and payments between owners
            and seekers are between those parties directly.
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="No guarantees">
          <ul className="list-disc list-inside space-y-2">
            <li>
              MigRent does not verify or guarantee properties, users, or any
              outcomes.
            </li>
            <li>
              All agreements and ongoing rent payments are between owners and
              seekers.
            </li>
            <li>
              Any verification badges, reputation signals, or platform-managed
              protections only apply to deals that are properly confirmed and
              recorded through MigRent&apos;s workflows.
            </li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Suspension and termination">
          <p>
            MigRent may suspend or terminate accounts for rule breaches,
            suspected fraud, or attempts to circumvent fees.
          </p>
        </CollapsibleSection>
      </section>

      {/* Privacy Policy */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Privacy Policy
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: January 2026</p>

        <CollapsibleSection title="What data we collect" defaultOpen>
          <ul className="list-disc list-inside space-y-2">
            <li>Account details (email, name if provided)</li>
            <li>Listing information</li>
            <li>Usage analytics</li>
            <li>Verification status or related metadata</li>
            <li>
              Limited payment metadata via third-party providers (not full card
              details)
            </li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="How data is used">
          <ul className="list-disc list-inside space-y-2">
            <li>To operate and improve the platform</li>
            <li>To provide matching services and verification</li>
            <li>To process payments and send important notifications</li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Third parties">
          <p>
            Third-party services (e.g. verification providers, payment
            processors, email services) may process data on our behalf as part of
            operating the platform.
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Rights and contact">
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <a href="mailto:migrentau@gmail.com" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors">
              migrentau@gmail.com
            </a>
            .
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Platform disclaimer">
          <p>
            MigRent AI is a platform only and is not a real estate agent or
            property manager. All rental agreements and payments between owners
            and seekers are between those parties directly.
          </p>
        </CollapsibleSection>
      </section>

      {/* Support & Contact */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Support &amp; Contact
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">We&apos;re here to help</p>

        {/* FAQ */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-2">
            <FAQItem
              q="I can't log in — what should I do?"
              a="Try resetting your password using the login page. If the problem persists, contact us using the form below."
            />
            <FAQItem
              q="How do I report a suspicious listing or user?"
              a="Use the contact form below and select your role. Describe the issue in detail and our team will investigate."
            />
            <FAQItem
              q="When is the owner fee charged?"
              a="The one-time AUD 99 platform fee is charged to owners when a successful match is confirmed through MigRent."
            />
            <FAQItem
              q="How do fees work?"
              a="Owners pay a one-time AUD $99 platform fee per listing. Seekers may pay an optional AUD $19 fee."
            />
            <FAQItem
              q="Is MigRent AI a real estate agent?"
              a="No. MigRent AI is a matching platform only. We do not hold bond or rent, and are not a party to any tenancy agreement."
            />
            <FAQItem
              q="How do I report a problem?"
              a="Use the Report button on any listing or profile, or contact us at migrentau@gmail.com"
            />
            <FAQItem
              q="Refunds & disputes"
              a="MigRent AI fees are non-refundable once confirmed. For exceptional cases, contact migrentau@gmail.com. Stripe receipts are sent to your email on payment."
            />
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-5 rounded-2xl border-l-2 border-l-rose-500"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            In the future, an AI assistant (for example, &quot;Emily &mdash;
            MigRent Helpbot&quot;) will be available here to answer common
            questions instantly.
          </p>
        </motion.section>
      </section>

      {/* Business details */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-medium text-slate-600 dark:text-slate-300">MigRent AI</p>
        <p>ABN: 22 669 566 941 | Sole Trader</p>
        <p>Virtual business operating in Sydney/Adelaide</p>
        <p>migrentau@gmail.com</p>
      </div>
    </div>
  );
}
