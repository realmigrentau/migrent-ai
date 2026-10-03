import { useEffect, useId, useRef, useState } from "react";
import { MailCheck, X } from "lucide-react";
import { CONTACT_TIP, EMAIL_APP_GUIDES, EMAIL_FROM_ADDRESS } from "../lib/emailHelp";

/** The step-by-step guide, used in the pop-up and on /email-help. */
export function EmailInboxGuide({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="flex flex-col gap-5">
      {EMAIL_APP_GUIDES.map((g) => (
        <section key={g.id} aria-labelledby={`email-guide-${g.id}`}>
          <H id={`email-guide-${g.id}`} className="text-[15px] font-semibold text-[color:var(--color-ink)]">
            {g.app}
          </H>
          <ol className="mt-2 flex flex-col gap-1.5 pl-0">
            {g.steps.map((s, i) => (
              <li key={s} className="flex gap-2.5 text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">
                <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-[color:var(--color-primary-fg,#fff)]">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <p className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-4 py-3 text-[14px] leading-relaxed text-[color:var(--color-ink-2)]">
        <strong className="text-[color:var(--color-ink)]">Tip:</strong> {CONTACT_TIP}
      </p>
    </div>
  );
}

/**
 * "Didn't get it? Check Spam", with a "Show me how" pop-up that walks
 * through moving the email to the Inbox in each email app. Put it anywhere
 * the site says it has sent, or will send, an email.
 */
export default function EmailInboxHelp({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      openerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <div className={`flex gap-3 rounded-[14px] border border-[#F6D58E] bg-[#FFF6E5] px-4 py-3 text-[13.5px] leading-relaxed text-[#5C3D00] ${className}`} data-testid="email-inbox-help">
        <MailCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.9} aria-hidden />
        <p className="m-0">
          {compact ? "Can't see our email?" : "Can't see our email? Check your Spam, Junk or Promotions folder."} If it's there, please move it to your Inbox. You won't miss anything, and it helps Migrent a lot.{" "}
          <button ref={openerRef} type="button" onClick={() => setOpen(true)} className="font-bold text-[#8A4B00] underline underline-offset-2">
            Show me how
          </button>
        </p>
      </div>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[22px] bg-[var(--color-surface)] shadow-2xl sm:rounded-[22px]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] px-5 py-4">
              <div>
                <h2 id={titleId} className="text-[18px] font-semibold text-[color:var(--color-ink)]">
                  Move Migrent's emails to your Inbox
                </h2>
                <p className="mt-1 text-[13.5px] text-[color:var(--color-ink-3)]">They come from {EMAIL_FROM_ADDRESS}. It takes about a minute.</p>
              </div>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-2 text-[color:var(--color-ink-3)] hover:bg-[var(--color-surface-muted)]">
                <X className="h-5 w-5" strokeWidth={1.9} aria-hidden />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-5">
              <EmailInboxGuide />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
