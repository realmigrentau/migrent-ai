import Link from "next/link";
import SEOHead from "../components/SEOHead";
import { PageHero } from "../components/site";
import { EmailInboxGuide } from "../components/EmailInboxHelp";
import { EMAIL_FROM_ADDRESS } from "../lib/emailHelp";

/** Every Migrent email links here: how to move it from Spam to the Inbox. */
export default function EmailHelpPage() {
  return (
    <>
      <SEOHead title="Get Migrent's emails in your Inbox" description="How to move Migrent's emails out of Spam, Junk or Promotions in Gmail, Outlook, Apple Mail and Yahoo." />
      <PageHero
        eyebrow="Email help"
        crumbs={[{ label: "Home", href: "/" }, { label: "Help", href: "/help" }, { label: "Email help" }]}
        title={<>Get our emails in your Inbox</>}
        lead={`Migrent's emails come from ${EMAIL_FROM_ADDRESS}. If one landed in Spam, Junk or Promotions, moving it to your Inbox means you won't miss a sign-in link, an inspection or a reply from a host. It also helps us a lot. Thank you.`}
        narrow
      />
      <section className="site-section site-section--flush">
        <div className="site-shell site-shell--narrow">
          <div className="site-card site-card--pad">
            <EmailInboxGuide headingLevel={2} />
          </div>
          <p className="site-body mt-6">
            Still can't find an email? <Link href="/contact" className="site-link">Contact us</Link> and we'll help.
          </p>
        </div>
      </section>
    </>
  );
}
