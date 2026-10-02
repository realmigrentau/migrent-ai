import { useState } from "react";
import { Button } from "../ui/Button";
import { Field, Textarea } from "../ui/Field";
import { Dialog } from "../ui/Overlay";
import { useToast } from "../../ui/Toast";
import { hubApi, HubError } from "../../../lib/hub/api";
import { invalidate } from "../../../lib/hub/query";

export interface SuspendTarget {
  id: string;
  name: string;
  suspended: boolean;
}

/** Suspend or reinstate an account, with a reason for the audit log. */
export default function SuspendDialog({ account, onClose, onDone }: { account: SuspendTarget | null; onClose: () => void; onDone?: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const reinstating = Boolean(account?.suspended);

  async function save() {
    if (!account) return;
    setBusy(true);
    try {
      await hubApi.post(`/hub/admin/users/${account.id}/${reinstating ? "unsuspend" : "suspend"}`, { reason: reason.trim() });
      invalidate("/hub/admin/users");
      invalidate("/hub/admin/reports");
      onDone?.();
      toast.success(reinstating ? `${account.name} can use Migrent Hub again.` : `${account.name} is suspended.`);
      setReason("");
      onClose();
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={Boolean(account)}
      onClose={() => {
        setReason("");
        onClose();
      }}
      title={account ? (reinstating ? `Reinstate ${account.name}?` : `Suspend ${account.name}?`) : ""}
      description={
        reinstating
          ? "They'll be able to use Migrent Hub again straight away. Any listing you paused stays paused until you unpause it in Listings."
          : "They won't be able to use Migrent Hub until they are reinstated: no messages, applications or listing changes. Nothing is deleted. Their listings stay as they are, so pause any that shouldn't be seen from Listings."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={reinstating ? "primary" : "danger"} loading={busy} disabled={reason.trim().length < 5} onClick={() => void save()}>
            {reinstating ? "Reinstate" : "Suspend account"}
          </Button>
        </>
      }
    >
      <Field label="Why?" hint={reinstating ? "e.g. Appeal accepted after a phone call." : "e.g. Asked renters to pay a deposit outside Migrent (report 3f2a)."}>
        {({ id, describedBy }) => <Textarea id={id} rows={3} value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} aria-describedby={describedBy} autoFocus />}
      </Field>
      <p className="mt-3 text-[13px] text-[color:var(--color-ink-3)]">The reason and the time are recorded in the audit log.</p>
    </Dialog>
  );
}
