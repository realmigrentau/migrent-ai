import { useEffect, useState } from "react";
import { hubApi, HubError } from "../../../lib/hub/api";
import { invalidate } from "../../../lib/hub/query";
import { useHubNavigate } from "../HubLink";
import { Button } from "../ui/Button";
import { Field, Textarea } from "../ui/Field";
import { Dialog } from "../ui/Overlay";
import { Events, trackEvent } from "../../../lib/analytics";

const STARTERS = ["Is it still available?", "Could I inspect this week?", "Are bills included in the rent?", "Is there a minimum lease?"];

/**
 * First message to an owner about a home. The conversation that starts
 * here is tied to this home, so it stays separate from any other listing
 * by the same owner.
 */
export default function EnquiryDialog({ open, onClose, listingId, title, ownerName }: { open: boolean; onClose: () => void; listingId: string; title: string; ownerName?: string | null }) {
  const navigate = useHubNavigate();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && !text) setText(`Hi${ownerName ? ` ${ownerName.split(" ")[0]}` : ""}, I'm interested in ${title}. `);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send() {
    if (text.trim().length < 3) {
      setError("Write a message first.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const { key } = await hubApi.post<{ key: string }>("/hub/enquiries", { listing_id: listingId, text: text.trim() });
      invalidate("/hub/inbox");
      invalidate("/hub/counts");
      trackEvent(Events.ENQUIRY_SENT, { listing_id: listingId });
      onClose();
      void navigate(`/messages/${key}`);
    } catch (e) {
      setError(e instanceof HubError ? e.message : "The message did not send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Message ${ownerName ? ownerName.split(" ")[0] : "the owner"}`}
      description={`About ${title}. Replies arrive in your Migrent Hub inbox.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={sending} onClick={() => void send()}>
            Send message
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 pb-3">
        <div className="flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button key={s} type="button" onClick={() => setText((t) => `${t.trim()} ${s}`.trim())} className="hub-press rounded-full border border-[var(--color-line-2)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--color-ink-2)] hover:border-[var(--color-primary)] hover:text-[color:var(--color-ink)]">
              {s}
            </button>
          ))}
        </div>
        <Field label="Your message" error={error} hint="Keep personal documents for your application - never send ID or bank details in chat.">
          {({ id, describedBy, invalid }) => <Textarea id={id} value={text} onChange={(e) => setText(e.target.value.slice(0, 2000))} aria-describedby={describedBy} aria-invalid={invalid} rows={5} data-autofocus />}
        </Field>
      </div>
    </Dialog>
  );
}
