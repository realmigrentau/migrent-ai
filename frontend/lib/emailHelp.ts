/**
 * How to move a Migrent email out of Spam, Junk or Promotions, per email
 * app. Shown in the pop-up guide (components/EmailInboxHelp.tsx) and on
 * /email-help, which every Migrent email links to (backend/email_theme.py).
 *
 * Migrent sends from a Gmail address until it has its own domain, so some
 * emails land in spam; each "Not spam" teaches that inbox to trust it.
 */

export const EMAIL_FROM_ADDRESS = process.env.NEXT_PUBLIC_EMAIL_FROM || "migrentau@gmail.com";

export interface EmailAppGuide {
  id: string;
  app: string;
  steps: string[];
}

export const EMAIL_APP_GUIDES: EmailAppGuide[] = [
  {
    id: "gmail-computer",
    app: "Gmail on a computer",
    steps: [
      "In the left menu, click Spam. You may need to click More first.",
      "Open the email from Migrent.",
      "Click Not spam. It moves to your Inbox.",
      "If it was in the Promotions tab instead, drag it to the Primary tab and choose Yes when Gmail asks about future emails.",
    ],
  },
  {
    id: "gmail-phone",
    app: "Gmail app on a phone",
    steps: [
      "Tap the menu (three lines, top left), then Spam.",
      "Open the email from Migrent.",
      "Tap Report not spam. It moves to your Inbox.",
      "If it was in Promotions, open it, tap the three dots (top right), then Move to, then Primary.",
    ],
  },
  {
    id: "outlook",
    app: "Outlook or Hotmail",
    steps: [
      "Open the Junk Email folder.",
      "Select the email from Migrent.",
      "Choose Not junk (in some versions: Report, then Not junk). It moves to your Inbox.",
    ],
  },
  {
    id: "apple",
    app: "Apple Mail or iCloud",
    steps: [
      "Open the Junk mailbox.",
      "Open the email from Migrent.",
      "Click Move to Inbox, or Not Junk in the bar at the top of the email.",
    ],
  },
  {
    id: "yahoo",
    app: "Yahoo Mail",
    steps: ["Open the Spam folder.", "Select the email from Migrent.", "Click Not spam. It moves to your Inbox."],
  },
];

export const CONTACT_TIP = `To make sure future emails always reach you, add ${EMAIL_FROM_ADDRESS} to your contacts.`;
