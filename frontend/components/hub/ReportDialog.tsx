import { useState } from "react";
import { hubApi, HubError } from "../../lib/hub/api";
import { REPORT_REASONS } from "../../lib/hub/status";
import { useToast } from "../ui/Toast";
import { Button } from "./ui/Button";
import { ChoiceCard, Field, Textarea } from "./ui/Field";
import { Dialog } from "./ui/Overlay";
import { Events, trackEvent } from "../../lib/analytics";

/**
 * Report a listing, a person or a message. Structured reasons first, detail
 * optional; the report goes to Migrent's moderation queue, never to the
 * person being reported.
 */
export default function ReportDialog({ open, onClose, itemType, itemId, subject }: { open: boolean; onClose: () => void; itemType: "listing" | "user" | "message" | "review"; itemId: string; subject: string }) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!reason) {
      setError("Choose what is wrong.");
      return;
    }
    setSending(true);
    setError(null);
    const label = REPORT_REASONS.find((r) => r.value === reason)?.label ?? reason;
    try {
      await hubApi.post("/reports", { item_type: itemType, item_id: itemId, category: label, message: details.trim() || undefined });
    } catch (e) {
      setSending(false);
      if (e instanceof HubError && e.status === 409) {
        toast.info("You've already reported this - it's with our team.");
        onClose();
        return;
      }
      setError(e instanceof HubError ? e.message : "The report did not send. Please try again.");
      return;
    }
    setSending(false);
    trackEvent(Events.REPORT_SUBMITTED, { item_type: itemType });
    toast.success("Thanks - we'll look into it", { description: "Reports go to Migrent's safety team, not to the person reported." });
    setReason("");
    setDetails("");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Report ${subject}`}
      description="Tell us what is wrong. If you are in danger, call 000."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={sending} onClick={() => void send()}>
            Send report
          </Button>
        </>
      }
    >
      <fieldset className="flex flex-col gap-2 pb-4">
        <legend className="sr-only">Reason</legend>
        {REPORT_REASONS.map((r) => (
          <ChoiceCard key={r.value} name="report-reason" value={r.value} selected={reason === r.value} onSelect={() => setReason(r.value)} title={r.label} />
        ))}
      </fieldset>
      <Field label="Anything else we should know?" optional error={error}>
        {({ id, describedBy }) => <Textarea id={id} value={details} onChange={(e) => setDetails(e.target.value.slice(0, 2000))} aria-describedby={describedBy} placeholder="What happened, and when" />}
      </Field>
    </Dialog>
  );
}
